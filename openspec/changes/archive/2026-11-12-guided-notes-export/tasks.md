# guided-notes-export — tasks（v1.1）

## 1. 驗收先行
- [x] 1.1 `server/tests/test_guided_notes_export.py`：三份夾具往返、題組標籤、佔位符、公式形式答案以文字寫入、無人搶答題（D1、D2）
- [x] 1.2 `server/tests/test_api_export.py`：階段、金鑰、檔名標頭（D3、D4）
- [x] 1.3 `eval/acceptance/matrix.yaml` M-006 守門更新

## 2. 實作
- [x] 2.1 `guided_notes.write_answers`（D1、D2）
- [x] 2.2 `GET /api/teacher/export`（D3、D4）；`contracts/api.md` 增補
- [x] 2.3 web：老師頁匯出按鈕；README 補「放回 Google Sheets」步驟

## 3. 驗證
- [x] 3.1 `make gate-pr` 原樣輸出、人工驗證寫入 `verification.md`（人工驗證 2026-11-17 組員執行，全部符合）
- [x] 3.2 `docs/parity.md` 狀態更新、`make gate-parity` 綠
