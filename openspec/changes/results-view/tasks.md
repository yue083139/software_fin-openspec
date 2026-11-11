# results-view — tasks（v1.1）

## 1. 驗收先行
- [x] 1.1 `server/tests/test_results_view.py`（D1–D3）
- [x] 1.2 web：老師狀況表、學生結果畫面元件測試（D4）
- [x] 1.3 `eval/acceptance/matrix.yaml` 新增 M-007、M-008

## 2. 實作
- [x] 2.1 `quiz_server/results.py`（D1）
- [x] 2.2 `views.py` 老師 board、學生 results（D2、D3）；`contracts/api.md` 增補
- [x] 2.3 web：老師作答狀況表、學生結果畫面（D4）

## 3. 驗證
- [x] 3.1 `make gate-pr` 原樣輸出、人工驗證寫入 `verification.md`（人工驗證步驟已寫，待負責人執行）
- [ ] 3.2 `docs/parity.md` 狀態更新、`make gate-parity` 綠
