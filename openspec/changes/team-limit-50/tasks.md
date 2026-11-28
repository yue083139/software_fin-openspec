# Tasks（v1.0）

## 1. 驗收先行與提案閉環

- [x] 1.1 在 `eval/acceptance/matrix.yaml` 新增 `team-limit-50` 的 2／12／13／50 正例、1／51／布林／小數／字串負例、50 組隔離、300 連線容量與 UI 人工驗收落點；YAML 可解析，M-020–M-022 聲明與 SpecKit 逐字一致。
- [x] 1.2 先擴充 `server/tests/test_api_skeleton.py` 與 `server/tests/test_phases.py`，涵蓋 2–50、嚴格整數、失敗不改狀態、`answering` 回 409 與第50組加入／釋放；基線 12 組時 13／50 組案例如預期失敗，結果見 `probes/results/2026-11-28-team-limit-50-red-tests.txt`。
- [x] 1.3 先擴充 `server/tests/test_isolation.py`、`test_submit.py`、`test_team_mode.py`，涵蓋第2–50組提交後第1組 payload 不含他組答案、50 組 × 6 台與第301台被拒；基線 12 組時新案例如預期因 50 組設定遭拒，結果見紅燈紀錄。
- [x] 1.4 先新增 `web/src/pages/team-limit.test.tsx`，涵蓋 input 最大值 50、第50組可見與釋放操作；基線執行結果為 1 failed、1 passed，錯誤是 `max="12"`，詳見紅燈紀錄。
- [x] 1.5 依 `$review-dispatch` 建立提案輪紅隊與架構派單，各完成 S 檔唯一提案輪；把藥方回寫四件套並由原通道回驗至 `CLEARED`，否則依輪次上限交負責人裁。

## 2. 伺服器擴容與安全邊界

- [x] 2.1 將 `server/quiz_server/activity.py` 的 `MAX_TEAMS` 改為 50，維持最小 2、預設 4；執行 1.2 的 API／phase 測試並確認全部 passed。
- [x] 2.2 在 `server/quiz_server/app.py` 嚴格拒絕布林、非整數及未定義額外欄位，再交由 Activity 檢查範圍；原基線測試已證明非法輸入會紅，嚴格驗證下相關測試全綠。
- [x] 2.3 讓第50組沿用既有 join、release、token、invite code、view 與 WebSocket 路徑，不新增旁路；執行 1.3 的隔離／submit／team-mode 測試並確認全部 passed。
- [x] 2.4 暫時把學生 view 換成老師 view 做隔離反變異，確認第1組對第2–50組的 payload 負例會紅；復原後重跑指定測試至綠並保存原樣輸出於 `probes/results/2026-11-28-team-limit-50-isolation-mutation.txt`。

## 3. Web 可操作性與同批文件

- [x] 3.1 將 `web/src/pages/Teacher.tsx` 的組數 input 最大值改為 50，必要時只調整 `web/src/styles.css` 的自然捲動；新增 UI 測試全套 2 passed。
- [x] 3.2 同步 `contracts/api.md`、`docs/product-trd.md`、`docs/parity.md` 與 `docs/ai-logs/team-limit-50.md` 的 2–50 事實；掃描所有引用後，歷史 AI 對話、已封存舊卡與舊卡規格保留原狀，作為當時基線的歷史紀錄。

## 4. 驗證

- [x] 4.1 執行 `uv run --project server python probes/team_limit_50_capacity_probe.py`，確認 300/300 狀態一致且 p95 ≤ 2 秒，原樣輸出見 `probes/results/2026-11-28-team-limit-50-capacity-implementation.txt`。
- [x] 4.2 依 `docs/manual-verification.md` 新增並執行場次：一般桌面與 768 px 寬下 30 秒內找到第50組、加入、釋放、重新加入，並檢查結果表／組隊狀態；記錄日期、環境、步驟、結果與證據。
- [x] 4.3 執行 `make gate-pr` 與 S 檔全量 `make gate`，門禁計數為 server 248 passed、ops 41 passed、web 35 passed；繁體中文 0、secrets 0、OpenSpec 10 passed、agents 0 漂移。
- [x] 4.4 執行 `make gate-parity SIBLING=../software_fin-speckit`，輸出 `gate-parity: 0 處不一致`；PR 尚未建立，待負責人建立後互連狀態再更新。
- [x] 4.5 依 `$review-dispatch` 建立實作輪紅隊與架構派單，完成 S 檔唯一實作輪與原通道回驗；紅隊與架構均 `CLEARED`，報告見 `implementation-red.dispatch.review-red.md`、`implementation-arch.dispatch.review-arch.md`。人工驗證仍須按 4.2 完成，不得當作已綠。

## Workflow follow-up

- 合入 `dev` 後使用 `$openspec-archive-change` 歸檔，並驗證 `activity-lifecycle` 主規格已更新為 2–50。
