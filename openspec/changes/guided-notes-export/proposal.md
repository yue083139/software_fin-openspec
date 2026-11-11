# guided-notes-export — 把搶答成功的答案寫回原 Guided Notes 的填空格（v1.1）

檔位：**S**（Guided Notes 寫回口徑）｜主人：@yue083139｜parity：`docs/parity.md` §4 `guided-notes-export`｜需求：R-05｜依賴：`guided-notes-import`、`results-view`

## 首屏決策摘要

1. **以匯入時記下的作答格位置寫回**：選了以 openpyxl 重新載入匯入當下保存的原檔、只改作答格、另存新檔／代價：只保證儲存格的值與合併範圍不變，圖片、資料驗證、條件式格式等 openpyxl 不完整支援的元素可能遺失（README 註明）／可被往返測試證偽：三份夾具匯出後，作答格內容＝得主答案，其他非空格與合併範圍完全不變（探針 `probes/results/2026-11-11-openpyxl-writeback.txt` 已證實 openpyxl 寫入合併格左上角不破壞合併與框線）。
2. **寫法：有佔位符就取代第一段底線，否則接在既有標籤之後；一律以文字型別寫入**：代價：學生若刻意輸入公式也只會顯示為文字（這正是要的）／可被題組範本「（1）答案」與「`=1+1` 讀回仍為文字」的測試證偽。
3. **只在 `ended` 階段可匯出；無人搶答的題目保持原樣**：代價：搶答中不能預覽匯出／屬取捨，理由：結果未定前匯出沒有意義且易誤用。
4. **回到 Google Sheets 的方式＝老師以「檔案→匯入→取代試算表」上傳匯出的 xlsx**：代價：多一步手動／屬取捨，理由：直接寫回需要 OAuth 憑證，違反「不放金鑰」的成本（`docs/parity.md` §3）。

**矩陣落點**：M-006 守門改為 `server/tests/test_guided_notes_export.py`，狀態 covered。

**merge 三問第三問**：需求證實——R-05 必做。

## 目標

- `guided_notes.write_answers(original, slots_answers) -> bytes`。
- `GET /api/teacher/export`：回傳 xlsx，檔名 `<原檔名>-搶答結果.xlsx`。
- 老師頁「匯出 Guided Notes」按鈕（`ended` 才可按）。

## 邊界（本卡不做）

CSV 匯出（第二期）、直接寫回 Google Sheets、匯出未得題組別的答案。

## 驗收

| # | 指令 | 期望輸出 |
|---|---|---|
| 1 | `uv run --project server pytest -q server/tests/test_guided_notes_export.py` | 三份夾具往返：作答格＝得主答案（題組各子題對應）、佔位符被取代、其他非空格與合併範圍不變、無人搶答題不變；passed |
| 2 | `uv run --project server pytest -q server/tests/test_api_export.py` | 非 ended 409、無題目 409、無金鑰 401、檔名標頭含 UTF-8 檔名；passed |
| 3 | 人工驗證 | 匯出檔以 Excel 或上傳 Google Sheets 開啟，答案出現在原填空格 |

## 實錄結果

見 `verification.md`。
