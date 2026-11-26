# answer-review — 經典搶答結束後依順位「答對／答錯」檢查，匯出改寫選定答案（v1.1，提案輪評審後定稿；負責人 2026-11-26 裁定）

檔位：**S**（搶答判定口徑、Guided Notes 寫回口徑、`contracts/`）｜主人：@yue083139｜parity：`docs/parity.md` §4 `answer-review`（取代 `mode-buzz-fallback`，於 `question-text` 分支同批登記）｜需求：R-04、R-05、R-10、X-03、X-04｜依賴：`buzz-answering`、`results-view`、`guided-notes-export`、`guided-notes-sheets-sync`
流程：負責人 2026-11-26 裁「S 檔壓縮版」——提案輪、實作輪各一次雙通道評審，同一會話連續跑，負責人在對話裡裁。

## 首屏決策摘要

1. **檢查狀態共用 `Activity.judgments`，經典規則改讀判定**：每題候選＝依順位第一個「未被判錯」的組；沒有任何判定時與現行完全相同（順位 1 得主，R-10）；判錯者往後遞補，判對即鎖定；全部判錯 ⇒ 無得主／代價：經典規則從「不看判定」變成「看判定」，第一期行為只在「結束後有檢查」時才變／可被 `test_scoring.py` 證偽（無判定時輸出與現行逐筆相同）。
2. **只在經典搶答 `ended` 階段、以新端點 `POST /api/teacher/review {question, team, correct}` 檢查**：`team` 必須等於目前候選，否則 409（擋連點兩下跳過一組）；已鎖定再判 409；`POST /api/teacher/review-reset {question}` 清除該題判定回到順位 1／代價：多兩個端點、不沿用 `/judge`（其語意綁定判定中階段）／屬取捨：負責人裁「只在結束後、只套經典搶答」。
3. **得主與分數跟著檢查結果變，三處一致**：老師表、學生結果、匯出都經同一規則（`results.build`／`winning_answers`），鎖定或候選者得 1 × 倍率分、其餘 0／可被 `test_results_view.py` 一致性測試證偽。
4. **Google 寫回範圍＝目前有得主的格＋上次寫過、這次已無得主的格**（後者以原標籤還原）；從未寫過且無得主的格不碰；匯出與寫回以伺服器鎖序列化／代價：`Activity` 多記一個「上次寫過的題號」／可被 `test_api_google.py::test_reexport_restores_previously_written_cells` 證偽（現行 `server/quiz_server/google_sheets.py:129`「`if values is None:`」跳過無得主題，重匯出會殘留）。
5. **副本改名「<原標題>_作答情況」、xlsx 下載檔名 `<原檔名>_作答情況.xlsx`**（負責人裁定）：匯入建立副本時即用此名，不另打改名 API／代價：既有「-搶答結果」副本不改名／可被 `test_google_sheets.py` 的 copy 請求本體與 `test_api_export.py` 的 `Content-Disposition` 證偽。

**矩陣落點**：M-005（R-10）聲明補「經典搶答結束後老師判錯時依順位遞補」；M-006（R-05）聲明補「寫入選定答案、重匯出還原上次寫過的格」；M-008（R-08）守門加檢查後學生結果更新；新增 M-022（R-04、R-10、X-03）「經典搶答結束後依順位檢查，得主、分數、匯出一致；候選不符 409」。

**merge 三問第三問**：負責人 2026-11-26 驗證全流程後指示：最快送出的答案可能是錯的，老師要能在結果表依順位往下找對的答案，匯出的試算表要寫老師選定的答案（R-05 寫回的是「搶答成功的組別答案」，答錯的不算成功）。現行經典搶答只能把順位 1 寫回。期限 2026-11-30，影片須與程式一致。

## 為什麼

經典規則不看判定：`server/quiz_server/scoring.py:62`「`Ranked(s.team, s.answers, s.seq, i, i == 1, m if i == 1 else 0)`」；`/api/teacher/judge` 只在判定中或逐題已關閉時可用（`server/quiz_server/activity.py:413`「`self._require(Phase.JUDGING)`」），經典模式永遠不進判定中。故經典搶答答錯也只能照寫。

## 目標

- `scoring.py`：`ClassicBuzzRule.rank` 讀 `judgments`（決策 1）。
- `activity.py`：`review(number, team, correct)`、`review_reset(number)`（經典＋`ended`、候選檢查、鎖內完成、`_bump` 推播）。
- `app.py`：兩個端點；`export_filename` 改 `_作答情況`。
- `google_sheets.py`：`COPY_SUFFIX = "_作答情況"`；`write_answers` 寫全部子題（決策 4）。
- `contracts/api.md`：兩個端點、經典模式 `ranking[].correct` 語意、副本與下載檔名（須負責人批准）。
- web（移到 `web-workbench` 整合，負責人 2026-11-26 指示前端以 antd 重寫）：老師結果表經典 `ended` 時讀 `board[].review` 在候選列顯示「答對」「答錯」，鎖定顯示「已鎖定」「重設本題」，全部判錯顯示「全部答錯，無得主」；匯出中停用按鈕；學生結果顯示 ✓／✗。
- 文件：`docs/manual-verification.md` 場次 A 加檢查步驟、匯出檔名；`README.md`、`docs/requirements.md` §4、`web/src/pages/ImportPanel.tsx` 的副本名稱字面量。

## 邊界（本卡不做）

- 搶答中、判定中或其他模式的逐組檢查（只計對錯、時間計分維持現行判定）。
- 參考答案自動判定經典搶答（建議仍只在判定模式）。
- 為既有「-搶答結果」副本改名。
- 學生端在 `ended` 前看到任何檢查結果（檢查只在 `ended` 發生）。

## 負責人裁定（2026-11-26，原未決呈裁）

- 學生 `ended` 結果顯示每組 ✓／✗：**照傾向，顯示**。
- 匯出後仍可改判並重匯出：**允許**（D5 還原上次寫過的格）。
- 未檢查完的題可匯出：**允許**，未檢查題寫順位 1（R-10）。
- 矩陣新行：**M-022**。
- `docs/requirements.md` §4 記負責人對 R-10／R-05 的解讀（評審藥方）。

## 驗收

| # | 指令 | 期望輸出 |
|---|---|---|
| 1 | `uv run --project server pytest -q server/tests/test_scoring.py` | 經典規則無判定時與現行逐筆相同；順位 1 判錯 ⇒ 順位 2 得主；判對鎖定；全部判錯無得主、分數全 0；passed |
| 2 | `uv run --project server pytest -q server/tests/test_review.py` | 非經典或非 ended 409；題號不存在 404；`team` 非候選 409；已鎖定再判 409；重設回順位 1；每次檢查推播老師與學生；passed |
| 3 | `uv run --project server pytest -q server/tests/test_results_view.py` | 檢查後老師 `board` 與學生 `results` 得主、分數一致；passed |
| 4 | `uv run --project server pytest -q server/tests/test_google_sheets.py server/tests/test_api_export.py` | 寫回含全部子題（無得主寫原標籤）；copy 名稱「<原標題>_作答情況」；下載檔名 `group_作答情況.xlsx`；xlsx 寫入檢查後得主；passed |
| 5 | `uv run --project server pytest -q server/tests/test_isolation.py` | `answering`／`judging` 學生 payload 仍不含他組答案與判定（檢查只在 `ended`）；passed |
| 6 | `npm --prefix web test` | 前端按鈕由 `web-workbench`（antd）整合時接上；本卡 web 不改 |
| 7 | `git grep -n -- '-搶答結果' -- server contracts README.md docs/requirements.md docs/manual-verification.md` | 無輸出（`web/src/pages/ImportPanel.tsx` 留 `web-workbench` 整合） |
| 8 | 人工驗證 | `docs/manual-verification.md` 場次 A：順位 1 判錯換順位 2、判對鎖定、匯出副本與 xlsx 為鎖定答案、副本名稱「_作答情況」 |

## 實錄結果

見 `verification.md`。
