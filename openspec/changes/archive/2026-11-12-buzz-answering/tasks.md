# buzz-answering — tasks（v1.1）

## 1. 驗收先行
- [x] 1.1 `server/tests/test_scoring.py`（D2）
- [x] 1.2 `server/tests/test_submit.py`：檢查順序與錯誤碼（含控制字元、無效憑證）、並發 50 輪、題組、結束後拒收（D1、D4、D5）；變異實錄：拿掉鎖必紅
- [x] 1.2a 更新 `app-skeleton` 測試：`ready_activity` 改為先匯入題目（MODIFIED requirement 的開始前置條件）
- [x] 1.3 `server/tests/test_isolation.py`：WebSocket／REST／錯誤回應三通道負例、他組送出 0 則訊息、冒用組別參數、`judging` 階段、日誌不含答案（D3、D6）
- [x] 1.4 `eval/acceptance/matrix.yaml` M-004、M-005 守門更新
- [x] 1.5 web：學生作答表單測試（題組多欄、送出後鎖定）

## 2. 實作
- [x] 2.1 `quiz_server/scoring.py`（D2）
- [x] 2.2 `Activity.submit`、開始前須有題目（D1、D4、D5）
- [x] 2.3 `views.student_view` 隔離擴充、送出端點（D3）；`contracts/api.md` 增補
- [x] 2.4 web：學生作答表單

## 3. 驗證
- [x] 3.1 `make gate-pr` 原樣輸出、人工驗證寫入 `verification.md`（人工驗證步驟已寫，待負責人執行）
- [x] 3.2 `docs/parity.md` 狀態更新、`make gate-parity` 綠
