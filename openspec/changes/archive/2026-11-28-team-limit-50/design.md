# Design（v1.0）

## Context

動機見 `proposal.md` 的 Why；規格行為見 `specs/activity-lifecycle/spec.md`。目前組數邊界集中於 `server/quiz_server/activity.py:20`「`MIN_TEAMS, MAX_TEAMS, DEFAULT_TEAMS = 2, 12, 4`」，老師端另在 `web/src/pages/Teacher.tsx:169`「`max={12}`」限制輸入。既有 50 組最大裝置數為 50 × 6 = 300，且學生端資料仍須依身分與階段 fail-closed 裁切。

## Goals / Non-Goals

**Goals:**

- 以單一伺服器邊界常數控制 API 與 domain 驗證，前端只提供一致的輸入提示。
- 讓第 1–50 組沿用現有 join、release、token、invite code、view 與 WebSocket 路徑。
- 用邊界測試、隔離負例、真 WebSocket 容量探針與人工 UI 紀錄證明擴容可用。

**Non-Goals:**

- 不為 50 組建立另一套 endpoint、資料模型或廣播協定。
- 不改每組裝置上限、狀態機、判定、計分或揭曉語意。
- 不以探針結果承諾對外服務等級；系統仍只在本機模擬。

## Decisions

### D1：沿用既有組別模型，只把伺服器上限常數改為 50

`MIN_TEAMS=2` 與 `DEFAULT_TEAMS=4` 保持不變，`MAX_TEAMS` 由 12 改為 50；`team_names(count)` 繼續產生 `第1組` 至 `第N組`。不新增大班模式或第二份組別集合，避免兩條憑證、撤銷與狀態同步路徑分岔。

替代方案：新增 `/teams-large` 或大班模式。否決原因是它沒有新語意，只會複製既有安全邊界。

**證偽欄（可證偽）**：

```text
指令：rg -n "MIN_TEAMS|MAX_TEAMS|DEFAULT_TEAMS" server/quiz_server/activity.py
提案期原樣輸出：
20:MIN_TEAMS, MAX_TEAMS, DEFAULT_TEAMS = 2, 12, 4
108:    def __init__(self, team_count: int = DEFAULT_TEAMS, clock: Callable[[], float] = time.monotonic,
232:        if not MIN_TEAMS <= count <= MAX_TEAMS:
233:            raise ValueError(f"組數須介於 {MIN_TEAMS} 到 {MAX_TEAMS}")
實作後判據：第一行為 2, 50, 4，且 2、12、13、50 成功，1、51 失敗。
```

### D2：API 先拒絕布林值與非整數，再交由 Activity 檢查 2–50

Python 的 `bool` 是 `int` 子類；若只做 `isinstance(count, int)`，`true` 會被當成 1。API 邊界須嚴格接受整數 JSON 值，拒絕布林、小數、字串、缺欄與額外欄位；domain 邊界再以 `MIN_TEAMS <= count <= MAX_TEAMS` 防止繞過 API。

替代方案：只依 Pydantic 自動轉型。否決原因是寬鬆轉型可能把錯誤輸入正規化為有效值，讓契約的 422 邊界失真。

**證偽欄（可證偽）**：

```text
指令：uv run --project server pytest -q -p no:cacheprovider server/tests/test_api_skeleton.py::test_configure_teams_rejects_invalid_count_without_state_change
提案期原樣輸出：
FAILED server\tests\test_api_skeleton.py::test_configure_teams_rejects_invalid_count_without_state_change[2.0]
FAILED server\tests\test_api_skeleton.py::test_configure_teams_rejects_invalid_count_without_state_change[2]
2 failed, 7 passed, 1 warning in 3.23s
實作後期望末行：全部 passed；測例須逐一斷言布林、浮點、字串、1、51 回 422 且狀態不變。
反變異：暫時移除 bool／strict-int 防線後，至少一個非法輸入測例必須失敗。
```

### D3：50 組沿用既有身分裁切與 WebSocket changed 通知

擴容只增加 `Activity.teams` 的元素數量；join、release、token 反查、邀請碼、teacher view、student view 與 WebSocket 推送仍走既有產品碼。隔離驗收必須直接檢查 REST 與 WebSocket 完整 payload，不以畫面沒顯示作替代。

替代方案：為 50 組批次化或另寫 view。否決原因是目前容量探針已顯示既有路徑足夠，另一路徑反而增加洩漏面。

**證偽欄（可證偽）**：

```text
指令：uv run --project server pytest -q -p no:cacheprovider server/tests/test_isolation.py::test_websocket_and_rest_do_not_leak server/tests/test_isolation.py::test_other_team_submit_sends_nothing
提案期原樣輸出（既有隔離負例）：
.. [100%]
2 passed, 1 warning in 2.27s
新增加到 50 組的隔離案例在組數上限 12 的基線於設定 50 組時失敗，完整輸出摘要見 `probes/results/2026-11-28-team-limit-50-red-tests.txt`。
驗收指令：uv run --project server pytest -q server/tests/test_isolation.py server/tests/test_submit.py server/tests/test_team_mode.py
實作後期望末行：全部 passed；新增測例須以第1組身分檢查 payload 不含第2組至第50組答案。
反變異：把學生 view 換成老師 view 後，隔離負例必須失敗。
```

### D4：老師端保留既有版型，以自然捲動容納 50 組

組數 input 的 `max` 改為 50；既有 grid／table 不重構，窄畫面以水平或頁面捲動保持所有組別可達。是否要分頁、搜尋或虛擬捲動屬後續 UX 取捨，本卡以 768 px 寬下可在 30 秒內找到並操作第50組作為人工判據。

替代方案：本卡同時導入分頁或虛擬清單。否決原因是會擴大互動語意與測試面，且尚無證據證明自然捲動不可用。

**證偽欄（可證偽）**：

```text
指令：npm.cmd --prefix web test -- team-limit.test.tsx
提案期原樣輸出：`Tests 1 failed | 1 passed (2)`；失敗為 `max="50"` 預期收到 `max="12"`。
實作後期望：測試檔全部 passed，且 DOM 可找到第50組並觸發釋放操作。
人工判據：768 px 寬下 30 秒內找得到第50組、可釋放並可重新加入；逾時即證偽並另立有主人的 UX 卡。
```

### D5：以 300 條真 WebSocket 連線驗證本機容量

容量探針直接建立 50 組 × 每組 6 台，讓 300 條真 WebSocket 連線通過產品的 join、token 反查、student view、changed 通知與 Uvicorn 路徑；成功門檻為 300/300 最終狀態一致，且 95% 在 2 秒內收到更新。2 秒門檻屬取捨，理由是課堂 Demo 需要及時更新；這不是外部 SLA。

替代方案：只以單元測試 mock 廣播。否決原因是 mock 無法觀測 socket、序列化與事件迴圈的合成成本。

**證偽欄（可證偽；知識時點 2026-11-27）**：

```text
指令：uv run --project server python probes/team_limit_50_capacity_probe.py
原樣輸出（probes/results/2026-11-27-team-limit-50-capacity.txt）：
環境：Windows-11-10.0.22631-SP0；Python 3.12.12
連線：300（50 組 × 6 台）
95% 收到更新：51.7 ms
最慢收到更新：51.9 ms
最終狀態一致：是（300/300）
```

## Risks / Trade-offs

- [50 組使老師畫面變長] → web 自動測試加第50組操作；人工驗證 768 px 與一般桌面寬度，若 30 秒判據失敗另立 UX 卡，主人為負責人指定的 web 組員。
- [300 連線探針受本機負載影響] → 保存環境與原樣輸出，以 2 秒寬鬆門檻判定，實作後重跑而不把單次毫秒數當承諾。
- [只改前端 max 可被直接 API 繞過] → API 與 Activity 各有邊界測試，前端限制不作安全判據。
- [擴容放大答案洩漏影響] → 第1組對第2–50組做完整 payload 負例，並執行反變異證明錯時會紅。

## Migration Plan

1. 先落驗收矩陣、API／domain 邊界、隔離、組隊與 UI 測試，確認至少因 12 組上限而紅。
2. 修改伺服器常數與嚴格輸入驗證，再修改前端 input 與必要的自然捲動樣式。
3. 同步契約、TRD、parity 共用檔，重跑容量探針並保存實作期原樣輸出。
4. 執行人工驗證、`make gate` 與 parity 比對；任何實作偏離 D1–D5 均回寫本 design 後再送審。
5. 回滾時還原上限 12、前端 max 與相應文件／測試；既有活動資料不需遷移，因系統只在本機記憶體執行。
