# mode-timed-scoring — tasks（v1.0）

## 1. 驗收先行
- [ ] 1.1 `server/tests/test_scoring.py::test_timed_points`、`TimedRule` 表格式（D4）
- [ ] 1.2 `server/tests/test_timed_mode.py`（假時鐘；D3、D6）；變異實錄：拿掉送出路徑截止比對必紅
- [ ] 1.3 `server/tests/test_question_settings.py` 時限（D2）；`test_modes.py` 三種模式（D1）
- [ ] 1.4 `server/tests/test_isolation.py` 時間計分三狀態負例、排行榜只計已揭曉（D5）
- [ ] 1.5 `eval/acceptance/matrix.yaml` M-014～M-016、M-004 守門擴充
- [ ] 1.6 web：`web/src/pages/timed.test.tsx`（D7）

## 2. 實作
- [ ] 2.1 `scoring.py` `timed_points`、`TimedRule`、`QuestionAttrs.time_limit`；`modes.py` `timed`
- [ ] 2.2 `Activity` 回合、計時器、可注入時鐘；送出／判定／結束的逐題前置條件
- [ ] 2.3 `views.py` `round`、`revealed`、`leaderboard`；`app.py` 三個端點與設定 API；`contracts/api.md`
- [ ] 2.4 web：老師逐題控制與時限設定、學生倒數與排行榜

## 3. 驗證
- [ ] 3.1 真棧探針 `probes/timed_flow_probe.py` 原樣輸出（D8）
- [ ] 3.2 `make gate` 原樣輸出、變異實錄、人工驗證步驟寫入 `verification.md`
- [ ] 3.3 `docs/parity.md` 狀態更新、`make gate-parity` 綠
