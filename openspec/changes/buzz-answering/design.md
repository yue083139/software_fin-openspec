# buzz-answering — design（v1.1）

知識時點：2026-11-11。對標：實體搶答器與電視搶答節目以「主持端收到訊號的先後」裁定；Kahoot! 以伺服器量測作答時間（`docs/research/competitors.md`）。本卡只做「最先者得」。

## 決策

### D1 送出流程與順位

送出端點先以標頭 `X-Team-Token` 反查組別（無效 ⇒ 403，不採信請求內的組別名）。`Activity.submit(team, question, answers)` 在活動鎖內依序檢查：階段＝`answering`（否則 409）、題號存在（404）、本組本題未送出（409）、`len(answers)`＝該題子題數（422）、每個答案去頭尾空白後非空、≤ 200 字、不含控制字元（Unicode 類別 `Cc`；422——openpyxl 寫入控制字元會拋 `IllegalCharacterError`，v1.0 評審實證）；之後讀出 `next_seq = seq + 1`、`await self._checkpoint()` 讓出一次、再寫回 `seq = next_seq` 並記錄 `Submission(team, question, answers, seq, elapsed_ms)`（讓出點必須夾在「讀序號」與「寫序號／寫紀錄」之間，否則拿掉鎖時配號仍是原子的，變異實錄會假綠——v1.1 回驗實證），`elapsed_ms` 以伺服器單調時鐘自開始搶答起算（`docs/trd-game-modes.md` T-04 預留）。客戶端送來的任何時間欄位一律忽略。

- 證偽欄｜可證偽：`test_submit.py::test_concurrent_same_question` 以 `asyncio.gather` 讓 4 組同時送出同一題 50 輪，斷言每輪序號集合＝連續整數且順位 1 恰一組；另有 `test_concurrent_same_team_same_question`：同一組同時送出同一題 10 次，恰 1 次成功。拿掉鎖時，前者會出現重號、後者會重複記錄——變異實錄（鎖換成 `nullcontext`）兩者必紅，記入 `verification.md`。屬取捨部分：這證的是鎖的序列化；HTTP 層的接收序即事件迴圈處理序，本機模擬不另測網路延遲。

### D2 判定規則策略

`ScoringRule` 協定：`rank(submissions, judgments=None, attrs=None) -> list[Ranked]`（`team`、`answers`、`seq`、`rank`、`is_winner`、`score`）與 `team_scores(teams, ranked) -> dict[組別, 分數]`；`judgments`（老師判定對錯）與 `attrs`（題目倍率、時限）是 `docs/trd-game-modes.md` T-02 的預留輸入，經典規則不使用。`ClassicBuzzRule`：依 `seq` 由小到大，`rank` 從 1 起，`is_winner = rank == 1`，得主 `score = 1`、其餘 0；`team_scores` 為各組得分總和。`Activity` 持有目前規則（預設經典），view、結果與匯出都經規則取得，不在別處重算。

- 證偽欄｜可證偽：`test_scoring.py`。屬取捨部分：經典規則不判對錯；最快但寫錯的答案仍是得主（R-10 字面意義），遞補屬第二期 `mode-buzz-fallback`。

### D3 作答隔離

`views.student_view(activity, team)` 是唯一產生學生**畫面狀態**的函式：
- 除 `ended` 以外的所有階段（`preparing`、`answering`、`judging` 及日後新增者）：`my_submissions` 只含本組，每筆只有題號與答案（不含 `seq`、`rank`）；不含任何他組資訊與各題送出數。
- `ended`：加上 `results`（`results-view` 卡定義顯示格式；本卡只保證結束前不出現）。
- 無效憑證：只回 `phase` 與 `team_valid: false`。
另有兩個不經 `student_view` 的學生通道，各自限定內容：送出 API 的成功回應只回本組這筆的題號與答案；錯誤回應的訊息為固定文字，不回顯任何答案。三個通道（WebSocket、送出成功回應、錯誤回應）與日誌各有負例。他組送出時，本組 view 內容不變 ⇒ 依 `app-skeleton` D4 不推送任何訊息。

- 證偽欄｜可證偽：`test_isolation.py` 以兩組不同的獨特答案字串（如 `甲組祕密答案`），擷取 B 組 WebSocket 收到的所有訊息與 B 組所有 REST 回應原文，斷言不含 A 組字串；`test_other_team_submit_sends_nothing`：A 組送出後老師結束搶答，B 組下一則訊息的 `seq` 恰為前一則＋1 且階段為 `ended`；`test_spoofed_team_param`：連線改帶 `team=第1組` 但無憑證 ⇒ 最少資訊；`test_judging_phase_isolated`：把狀態轉入 `judging` 仍不含他組答案。

### D4 題組

題組的所有子題必須同一次送出（`answers` 長度＝子題數），順位以整題計（X-01）。

- 證偽欄｜可證偽：`test_submit.py::test_group_requires_all_slots`。

### D5 結束

`end()` 後所有送出回 409；`reset()` 清空送出、序號歸零。

- 證偽欄｜可證偽：`test_submit.py::test_submit_after_end_rejected`。

### D6 日誌

日誌只記組別、題號、序號與結果碼，不記答案文字（`CLAUDE.md` 通用編碼規範）。

- 證偽欄｜可證偽：`test_isolation.py::test_logs_do_not_contain_answers`（`caplog` 擷取）。
