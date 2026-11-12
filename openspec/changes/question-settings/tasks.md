# question-settings — tasks（v1.0）

## 1. 驗收先行
- [ ] 1.1 `server/tests/test_scoring.py::test_multiplier_doubles`（D1）
- [ ] 1.2 `server/tests/test_question_settings.py`（D2、D3）
- [ ] 1.3 `eval/acceptance/matrix.yaml` M-013
- [ ] 1.4 web：`web/src/pages/settings.test.tsx`（D4）

## 2. 實作
- [ ] 2.1 `scoring.py` `QuestionAttrs`、兩種規則乘倍率；`results.py` 傳入 attrs
- [ ] 2.2 `Activity.attrs`、`set_question`；`app.py` 端點；`views.py` `multiplier`、`score_label`；`contracts/api.md`
- [ ] 2.3 web：勾選框、學生標記、`score_label`

## 3. 驗證
- [ ] 3.1 `make gate` 原樣輸出、人工驗證步驟寫入 `verification.md`
- [ ] 3.2 `docs/parity.md` 狀態更新、`make gate-parity` 綠
