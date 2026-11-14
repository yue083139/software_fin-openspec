# question-settings — tasks（v1.1）

## 1. 驗收先行
- [x] 1.1 `server/tests/test_scoring.py::test_multiplier_doubles`（D1）；改寫第一期 `test_reserved_inputs_do_not_change_classic`（judgments 不影響經典規則、`QuestionAttrs(2)` 分數加倍）
- [x] 1.2 `server/tests/test_question_settings.py`（D2、D3）
- [x] 1.3 `eval/acceptance/matrix.yaml` M-013
- [x] 1.4 web：`web/src/pages/settings.test.tsx`（D4）

## 2. 實作
- [x] 2.1 `scoring.py` `QuestionAttrs`、兩種規則乘倍率；`results.py` 傳入 attrs
- [x] 2.2 `Activity.attrs`、`set_question`；`app.py` 端點；`views.py` `multiplier`、`score_label`；`contracts/api.md`
- [x] 2.3 web：勾選框、學生標記、`score_label`

## 3. 驗證
- [x] 3.1 `make gate` 原樣輸出、人工驗證步驟寫入 `verification.md`（人工驗證步驟已寫，待負責人執行）
- [x] 3.2 `docs/parity.md` 狀態更新、`make gate-parity` 綠
