# mode-timed-scoring — 時間計分模式：逐題開放、伺服器計時、每題揭曉後排行榜（v1.0）

檔位：**S**（搶答判定口徑、作答隔離、活動階段狀態機、`contracts/`）｜主人：@yue083139｜parity：`docs/parity.md` §4 `mode-timed-scoring`｜需求：X-04（TRD M2、T-04、T-05 時限、§6 排行榜裁定）｜依賴：`question-settings`

## 首屏決策摘要

1. **逐題開放，同一時間至多一題「進行中」**：老師按「開放下一題」依題號順序開放；該題到時限由伺服器關閉，老師也可提早結束；只收開放中那一題的送出／代價：失去「各組自選題目」的紙本感（經典與只計對錯模式保留）／屬取捨，理由：作答秒數必須有共同起點（T-04），全部同時開放時「開題時刻」對每題都一樣，速度分只反映題目順序。
2. **作答秒數＝伺服器收到送出時的單調時鐘 − 該題開放時的單調時鐘；逾時（> 時限）送出 409**：客戶端時間一律不用；計時器只負責推送「已關閉」，截止判斷在送出路徑上以時鐘比對，計時器晚到也不會多收／可被假時鐘測試證偽（時限 20 秒、時鐘 20.001 秒時送出 ⇒ 409）。
3. **不採「全員送出即關閉」**：提早關閉會讓學生推知他組都已送出（作答隔離），故只有時限與老師兩種關閉方式（TRD M2 同批修訂）。
4. **計分＝`floor(1000 × (1 − t ÷ T ÷ 2) + 0.5) × 倍率`，t ≤ 0.5 秒得 1000 × 倍率，錯誤或未作答 0**：用四捨五入而非 Python `round`（銀行家捨入，探針 `round(2.5)=2`）／可被 TRD §4 三個數值案例證偽（t＝0.4 ⇒ 1000；t＝T ⇒ 500；T＝30、t＝2 ⇒ 967）。
5. **每題「關閉 → 老師判定 → 揭曉」；揭曉後學生看到本組該題對錯與得分，以及全部組別的累積排行榜；他組答案仍只在 `ended` 才看得到**：排行榜公開由負責人 2026-11-12 裁定（TRD §6）／代價：學生從分數變化可推知他組本題對錯／屬取捨（負責人裁），答案文字仍隔離，可被「揭曉後 A 組 payload 不含 B 組答案」負例證偽。

**矩陣落點**：新增 M-014（時間計分公式）、M-015（逐題開放與伺服器截止）、M-016（揭曉後排行榜且答案仍隔離）；M-004 守門擴充時間計分模式。

**merge 三問第三問**：需求證實——X-04；負責人點名「時間計分」並裁定列入第二期。

## 目標

- `modes.py`：`Mode.sequential`、`timed` 模式；`scoring.py`：`QuestionAttrs.time_limit`、`TimedRule`、`timed_points`。
- `Activity`：`rounds`、`open_next`、`close_question`、`close_due`、`reveal_question`；送出、判定、結束在逐題模式下的前置條件；計時器任務；可注入時鐘。
- API：`/open-next`、`/close-question`、`/reveal-question`；`question-settings` 增 `time_limit`；view 增 `round`、學生 `revealed`、`leaderboard`。
- web：老師逐題控制與倒數、時限設定；學生只見進行中題目、倒數、揭曉結果與排行榜。

## 邊界（本卡不做）

全員送出即關閉（見決策 3）、答題連勝加分（Kahoot Answer Streak）、亂序出題、跨活動排行榜。

## 驗收

| # | 指令 | 期望輸出 |
|---|---|---|
| 1 | `uv run --project server pytest -q server/tests/test_scoring.py` | `timed_points` 三個 TRD 案例與倍率；`TimedRule` 表格式；passed |
| 2 | `uv run --project server pytest -q server/tests/test_timed_mode.py` | 逐題開放順序、只收開放中那題、假時鐘逾時 409、計時器關閉後推送、提早結束、判定與揭曉前置條件、未揭曉不得開下一題或結束、作答秒數取自伺服器；並發「截止與送出」；passed；變異實錄：拿掉送出路徑的截止比對必紅 |
| 3 | `uv run --project server pytest -q server/tests/test_isolation.py` | 時間計分模式下開放中、已關閉、已揭曉三種狀態，A 組 payload 不含 B 組答案；他組送出 0 則推播；passed |
| 4 | `npm --prefix web test` | 逐題控制、倒數、排行榜；passed |
| 5 | 真棧探針 `probes/timed_flow_probe.py` | 真 uvicorn：開題 → 兩組送出 → 時限到伺服器自動關閉 → 判定 → 揭曉 → 排行榜；原樣輸出入 `probes/results/` |
| 6 | 人工驗證 | 三個分頁跑兩題：倒數、時間到自動關閉、揭曉後排行榜、結束後看得到全部答案 |

## 實錄結果

見 `verification.md`。
