# results-view — 老師即時作答狀況與結果、學生結束後檢視結果（v1.1）

檔位：**S**（新增送往學生端的資料：結束後結果）｜主人：@yue083139｜parity：`docs/parity.md` §4 `results-view`｜需求：R-04、R-08｜依賴：`buzz-answering`

## 首屏決策摘要

1. **老師頁＝題號 × 組別矩陣，即時顯示每格的送出答案與順位，得主醒目標示**：選了一張表看全局／代價：組數多時表格寬（≤12 組可接受）／可被老師 view 內容測試證偽。
2. **學生在 `ended` 才收到結果：每題的得主組別、得主答案、全部組別答案與順位，以及本組得題數**：代價：結束瞬間的 payload 較大（題數 × 組數，本機可忽略）／可被「`answering` 時 `results` 欄不存在、`ended` 時存在且內容正確」測試證偽。
3. **結果一律經 `ScoringRule` 產生**（`buzz-answering` D2），老師與學生的結果來自同一個函式，不各算一份／代價：無／可被一致性測試證偽。

**矩陣落點**：新增 M-007（老師即時作答狀況）、M-008（學生結束後檢視結果）。

**merge 三問第三問**：需求證實——R-04、R-08 為核心必做。

## 目標

- `views.teacher_view` 增加 `board`（每題每組：答案、順位、是否得主）與彙總（每組得題數）。
- `views.student_view` 在 `ended` 增加 `results`。
- 老師頁作答狀況表、學生頁結果畫面。

## 邊界（本卡不做）

排行榜動畫、匯出 CSV（第二期 `csv-export`）、跨活動累計。

## 驗收

| # | 指令 | 期望輸出 |
|---|---|---|
| 1 | `uv run --project server pytest -q server/tests/test_results_view.py` | 老師 board 即時含全部送出與順位；學生 `answering` 時無 `results`；`ended` 時 `results` 與老師 board 的得主一致；passed |
| 2 | `npm --prefix web test` | 老師狀況表、學生結果畫面元件測試 passed |
| 3 | 人工驗證 | 兩組各搶幾題後結束，老師表與兩個學生頁的得主一致 |

## 實錄結果

見 `verification.md`。
