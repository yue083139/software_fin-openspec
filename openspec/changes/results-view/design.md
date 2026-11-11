# results-view — design（v1.1）

知識時點：2026-11-11。對標：Kahoot! 每題結束顯示答案分布與排名；本系統以整場結束為揭曉點（R-08）。

## 決策

### D1 結果資料結構（老師與學生共用）

`results.build(activity) -> list[QuestionResult]`：每題 `number`、`labels`、`ranking`（目前 `ScoringRule.rank` 的輸出：組別、答案、順位、是否得主、分數）、`winner`（組別與答案或 null）；另有 `team_scores`：由 `ScoringRule.team_scores` 產生（經典規則＝各組得題數）。老師 view 的 `board` 與學生 view 的 `results` 都呼叫同一個函式。

- 證偽欄｜可證偽：`test_results_view.py::test_teacher_and_student_agree`。

### D2 老師 view

任何階段都含 `board`（`preparing` 時為空）與 `team_scores`；`answering` 中即時更新（每次送出都觸發推播）。另含每題已送出組數，供老師判斷何時結束。

- 證偽欄｜可證偽：`test_results_view.py::test_teacher_board_live`。

### D3 學生 view

僅 `phase == ended` 時含 `results` 與 `team_scores`；其他階段鍵不存在（不是空陣列），以免前端誤判為「沒有結果」。

- 證偽欄｜可證偽：`test_results_view.py::test_student_results_only_when_ended`；`buzz-answering` 的隔離測試仍覆蓋 `answering`。

### D4 介面

老師頁：上方階段與控制鈕，下方表格（列＝題號，欄＝組別，格內顯示答案與順位，得主格加底色與「搶答成功」字樣），表尾為各組得題數。學生頁 `ended`：每題卡片顯示得主與答案，本組作答與順位，頁首顯示本組得題數。

- 證偽欄｜屬取捨：理由＝一張表即可在 Demo 影片中同時展示多組狀況。
