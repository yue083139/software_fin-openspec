# game-mode-framework — tasks（v1.2）

## 1. 驗收先行
- [x] 1.1 `tests/fixtures/guided-notes/build_reference.py` 與 `reference.xlsx`；納入 `ops/gate_parity.py` 共用檔與夾具 README
- [x] 1.2 `server/tests/test_scoring.py` 增 `AccuracyRule` 表格式案例（D2）；`server/tests/test_modes.py`（D1）
- [x] 1.3 `server/tests/test_judging.py`：判定流程與錯誤碼、未判定不得揭曉、判定中不可結束搶答、採用全部建議不覆蓋、`suggest` 表格式、老師判定與採用建議並發（D3、D4、D7）；變異實錄三則
- [x] 1.4 `server/tests/test_guided_notes_parse.py` 參考答案欄（D4）
- [x] 1.5 `server/tests/test_isolation.py` 判定中隔離、參考答案四階段負例（D5）；`test_results_view.py` 一致性兩模式（D6）；`test_guided_notes_export.py` 只計對錯寫回最早答對者
- [x] 1.6 `eval/acceptance/matrix.yaml` M-009～M-012、M-004 守門擴充
- [x] 1.7 web：`web/src/pages/judging.test.tsx`（D8）

## 2. 實作
- [x] 2.1 `quiz_server/modes.py`、`scoring.py`（`Ranked.correct`、`AccuracyRule`）
- [x] 2.2 `guided_notes.py` 參考答案欄；`quiz_server/judging.py` `suggest`
- [x] 2.3 `Activity`：`mode`、`set_mode`、`judgments`、`judge`、`accept_suggestions`、`pending_judgments`、`reveal`、`end` 只接受 answering
- [x] 2.4 `results.build(teacher=)`、`views.py` 新欄位；`app.py` 四個端點；`contracts/api.md` 增補
- [x] 2.5 web：`types.ts`、模式選擇、判定畫面、學生端模式說明與對錯顯示

## 3. 驗證
- [x] 3.1 `make gate` 原樣輸出、變異實錄、人工驗證步驟寫入 `verification.md`（人工驗證步驟已寫，待負責人執行）
- [x] 3.2 `docs/parity.md` 狀態更新、`make gate-parity` 綠
