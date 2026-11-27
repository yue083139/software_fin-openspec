# results-podium — verification（v1.0）

## 門禁實錄

本機（Windows 11，無 `make`）依 `Makefile` 的 `gate-pr` 逐項執行，2026-11-27，分支 `feat/results-podium`（自 `origin/dev` `9884114`）：

```
uv run --project server pytest -q server/tests      → 367 passed, 1 warning
uv run --group dev pytest -q ops/tests（Git Bash） → 3 failed, 45 passed
uv run --project server ruff check server           → All checks passed!
uv run --group dev ruff check ops probes            → All checks passed!
npm --prefix web test                               → Tests  93 passed (93)
npm --prefix web run lint                           → 無輸出（exit 0）
npm --prefix web run typecheck                      → 無輸出（exit 0）
gate-zh-hant: 0 處簡體字
gate-secrets: 0 findings
openspec validate --all --strict                    → Totals: 13 passed, 0 failed (13 items)
gate-agents: 0 處漂移
```

web 第二次 `npm --prefix web test`：`Tests  93 passed (93)`。

`ops/tests` 3 failed 與本卡無關：`git stash -u` 回到乾淨的 `origin/dev` 後同樣 `3 failed, 45 passed`（`test_cli_without_sibling_reports_not_run`、`test_prepush_blocks_protected[main|dev]`，本機 Windows 環境 `TypeError: argument of type 'NoneType' is not a container or iterable`）；本卡未改 `ops/`。CI（Linux）以 PR 上的結果為準。

## 變異實錄（錯時會紅）

| 變異 | 結果 |
|---|---|
| `Teacher.tsx` 拿掉 `view.phase === "ended" &&` | `podium.test.tsx` 1 failed：「搶答中不顯示」 |
| `Podium.tsx` 的 `s > 0` 改 `s >= 0` | 2 failed：「沒有組別得分 ⇒ 空」「沒有組別得分就不顯示領獎台」 |

第三個變異（評審 followup 後補）：`Student.tsx` 拿掉 `view.phase === "ended" &&` ⇒ 1 failed：「搶答中即使 view 帶了分數也不顯示」。三個變異都已還原，`git diff --stat` 只剩本卡改動。

## 評審紀錄

- 架構通道（全卡掃，2026-11-27，獨立子代理）：**CLEARED**，0 阻斷 0 重要。followup：D2／R2「口徑同 leaderboard」未寫分數來源差異（leaderboard 用已揭曉題、領獎台用全部題，ended 時因 `activity.end` 須先揭曉而相等）⇒ 已補進 design D2／research R2；人工第 5 步「由單元測試涵蓋」原只測 `Podium` 直接傳 `scoreLabel` ⇒ 已補 `TeacherPanel` 讀 `view.score_label` 一例。
- 對抗通道（diff，2026-11-27，獨立子代理）：**CLEARED**，五條斷言皆證偽不成（伺服器分數恆為非負整數；學生結果頁原已列各組分數，領獎台不多帶資料；時間計分 `end` 須先揭曉，ended 時無未揭曉分數）。followup：①學生端「只在 ended 渲染」無本卡測試 ⇒ 已補「搶答中即使 view 帶分數也不顯示」「結束後顯示並標本組」兩例；②同名次依 `Object.entries` 鍵序，純數字組名會被 JS 重排 ⇒ 不改：組名固定「第N組」（`activity.py`），列為 followup（主人 @jinny950103）。
- 評審輪次：B 檔兩輪各單通道已用滿；以上 followup 皆為補測試與文件，未改產品行為。

## 人工驗證（需求 P-05）

狀態：**已執行**（`docs/manual-verification.md` 場次 I）。

結果：✅ 第 1～4 步全部符合（jinny／2026-11-27／`feat/results-podium` `b88a624`，Windows 11 本機瀏覽器）。老師頁亞軍、冠軍由左到右、0 分組不上台；學生頁三組「本組」標籤位置正確；判錯後同分並列第 1 且無第 2 名、即時更新；重置後消失、全部 0 分不顯示。第 5 步（選做，其他模式欄名「得分」）未執行，由單元測試「分數欄名讀伺服器的 score_label」（走 `TeacherPanel` 讀 `view.score_label`）涵蓋欄名，其他模式的實際流程未人工執行。
