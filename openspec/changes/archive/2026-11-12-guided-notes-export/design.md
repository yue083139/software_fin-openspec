# guided-notes-export — design（v1.1）

知識時點：2026-11-11。

## 決策

### D1 寫回演算法

以 openpyxl 重新載入匯入時保存的原檔位元組；對每題取 `ScoringRule` 的得主，依子題順序把答案寫入匯入時記下的 `(工作表, 座標)`；存成新位元組回傳。原檔位元組不被修改，可重複匯出。

- 證偽欄｜可證偽：`probes/results/2026-11-11-openpyxl-writeback.txt`（合併範圍不變 True、其他非空格變動數 0、框線保留）；`test_guided_notes_export.py::test_round_trip_preserves_other_cells`。

### D2 填寫格式

匯入時判為佔位符（連續 3 個以上半形或全形底線）⇒ 以答案取代第一段底線；否則 ⇒ `prefix + answer`（prefix 為空時就是答案本身）。

寫入後把儲存格 `data_type` 強制為字串（`s`）：openpyxl 會把 `=` 開頭的字串存成公式（v1.0 評審以 openpyxl 3.1.5 實證 `data_type` 得 `f`），學生答案 MUST NOT 被當公式執行。

- 證偽欄｜可證偽：group.xlsx 子題寫成 `（1）答案`；variant.xlsx 佔位符格取代後不含底線段；`test_formula_like_answer_stays_text`：答案 `=1+1` 匯出再讀回，值為 `=1+1` 且 `data_type == 's'`。

### D3 匯出條件

只在 `ended` 階段允許（否則 409）；未匯入題目 ⇒ 409；老師金鑰必要（401）。無得主的題目不寫。

- 證偽欄｜可證偽：`test_api_export.py`。

### D4 回應

`Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`；`Content-Disposition: attachment; filename="guided-notes-result.xlsx"; filename*=UTF-8''<百分比編碼的原檔名-搶答結果.xlsx>`（RFC 6266／5987，中文檔名）。連結匯入的原檔名取 `Google 試算表`。

- 證偽欄｜可證偽：`test_api_export.py::test_filename_header`。
