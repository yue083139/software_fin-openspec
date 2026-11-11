# guided-notes-import — tasks（v1.1）

## 1. 驗收先行
- [x] 1.1 `tests/fixtures/guided-notes/build_variant.py` 產生 `variant.xlsx`（表頭位移、改名、題組 3 子題、佔位符、不同工作表名）
- [x] 1.2 `server/tests/test_guided_notes_parse.py`：三份夾具題數、子題數、作答格位置；四種錯誤（D1–D4）
- [x] 1.3 `server/tests/test_api_import.py`：上傳、連結改寫與主機白名單、下載失敗、階段 409、學生 view 只含題號（D5–D7）
- [x] 1.4 `eval/acceptance/matrix.yaml` M-003 守門更新

## 2. 實作
- [x] 2.1 `quiz_server/guided_notes.py` 解析（D1–D4）
- [x] 2.2 `quiz_server/sources.py` 上傳驗證與 Google Sheets 連結下載（D5）
- [x] 2.3 `Activity.load_questions`、view 擴充、兩個匯入端點（D6、D7）；`contracts/api.md` 增補
- [x] 2.4 web：老師頁匯入區與題目清單、學生頁題號清單

## 3. 驗證
- [x] 3.1 驗收 #3 無寫死座標 grep 原樣輸出
- [ ] 3.2 `make gate-pr` 原樣輸出、人工驗證寫入 `verification.md`（門禁已記錄，人工驗證待負責人）
- [ ] 3.3 `docs/parity.md` 狀態更新、`make gate-parity` 綠
