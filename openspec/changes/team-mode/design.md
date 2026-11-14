# team-mode — design（v1.0）

知識時點：2026-11-14。對標（`docs/research/competitors.md` §1，2026-11-11 查）：Kahoot! Team mode 讓一隊共用一台裝置並給「討論時間」，隊員分數平均；Quizlet Live 隨機分隊，每位隊員只看到部分選項。本卡依 TRD §6 裁定只取「一隊多人、一人代表作答」，不採分數平均與討論時間。

倉外行為探針：無。本卡的決策只依賴本倉既有的鎖、序號與依身分裁切的 view（`server/quiz_server/activity.py`、`views.py`），不依賴第三方函式庫的新行為、外部服務或瀏覽器新行為；前端草稿的防抖用 `setTimeout`，不影響伺服器端判據。

## 決策

### D1 組隊是活動設定，不是模式

`Activity.team_play: bool = False`。`set_team_play(enabled)`：鎖內、`preparing`（其他階段 409）；值改變時撤銷**所有**組別憑證與邀請碼，`_bump()`；值不變時什麼都不做（不撤銷）。`reset` 保留；`configure_teams` 照舊撤銷所有憑證，另清除邀請碼。

- 證偽欄｜屬取捨，理由：見 proposal 摘要第 1 條。可證偽部分：`test_team_mode.py::test_team_play_does_not_change_scoring`（三種模式各跑一組同樣的送出，組隊開／關的 `results.build` 與 `team_scores` 相同）；第一期與第二期全部測試在 `team_play=False`（預設）下照舊綠。

### D2 憑證與邀請碼

- `_tokens: dict[str, str]`（憑證 → 組別）本來就允許多對一；改的是 `join` 的檢查：
  - `team_play=False`：同第一期，該組已有憑證 ⇒ `TeamTakenError`（409「此組已有裝置加入，請老師釋放後再加入」）。
  - `team_play=True` 且該組尚無裝置：發憑證，並產生該組邀請碼 `_codes[team]`（6 碼，字母表 `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` 共 32 字，`secrets.choice`；約 10⁹ 種，本機模擬不設嘗試次數限制）。
  - `team_play=True` 且該組已有裝置：本體 `code` 必須以 `secrets.compare_digest` 比對相符（大小寫不敏感：先轉大寫、去空白），否則 `InviteCodeError` ⇒ **403**「邀請碼不正確」；裝置數已達 `MAX_DEVICES = 6` ⇒ 409「此組裝置已滿（最多 6 台）」。順序：先比對邀請碼、再檢查上限——沒有正確邀請碼的人不該知道該組有幾台。
- `release(team)`：撤銷該組全部憑證並刪除邀請碼（下一台加入時重新產生）。
- `devices(team) = 該組憑證數`。
- 讓出點仍夾在「檢查」與「寫入」之間（app-skeleton v1.1 D2），並發加入第 6、7 台時恰一台成功。

- 證偽欄｜可證偽：`test_team_mode.py::test_join_requires_code`（無碼、錯碼 403 且憑證數不變；正確碼 200；小寫與前後空白可）、`test_device_limit`、`test_concurrent_join_at_limit`（6 台後並發 5 次恰 0 成功；5 台後並發 5 次恰 1 成功）、`test_release_revokes_all_devices_and_code`、`test_toggle_revokes`。

### D3 送出：代表作答

`submit` 不改：同組任一憑證都反查到同一組別，「本組已送出這一題」的檢查、序號與時間計分的截止都在同一把鎖內。送出成功後清除該組該題的草稿（D4）。

- 證偽欄｜可證偽：`test_team_mode.py::test_concurrent_submit_same_team`（同組 3 台裝置並發送出同一題 20 次，每次恰 1 筆成功、其餘 409「本組已送出這一題，不可修改」、序號無重號）；`test_member_sees_team_submission`（A 裝置送出後 B 裝置的 `my_submissions` 含該筆）。

### D4 組內草稿

- `POST /api/student/draft`，`X-Team-Token`，本體 `{question, answers}`，回 `{question}`（不回顯內容）。條件：憑證有效（403）；`team_play=True`（409「只有組隊模式可以共用草稿」）；`answering`（409）；題號存在（404）；本組尚未送出該題（409）；時間計分只收開放中那一題（409「這一題目前沒有開放作答」）；`answers` 長度＝子題數、每格 ≤200 字、不含控制字元（422，訊息固定、不回顯）；**空白允許**（組員清掉草稿）。
- `Activity.drafts: dict[str, dict[int, tuple[str, ...]]]`（組別 → 題號 → 子題草稿），最後寫入者為準；`_clear_answers`（匯入、重置）、`release`、切換組隊時清除；送出成功清除該組該題。
- 不寫日誌內容（`CLAUDE.md`「日誌不記學生作答原文」）。

- 證偽欄｜可證偽：`test_team_mode.py::test_draft_rules`（各錯誤碼；草稿在本組 view、送出後消失）；`test_isolation.py::test_team_draft_isolated`、`test_other_team_draft_sends_nothing`。

### D5 view 與作答隔離

- 學生 view（只在 `team_valid`）：`team_play`；`invite_code`（`team_play` 時為本組邀請碼）；`drafts: [{question, answers}]`——**只在 `answering` 階段**且只含本組。其餘階段不帶 `drafts`（fail-closed：判定中、已結束沒有理由再送草稿）。
- 老師 view：`team_play`、`devices: {組名: 台數}`、`invite_codes: {組名: 碼}`（只含已有裝置的組）。老師 view 不含草稿。
- 公開資訊 `GET /api/public/info` 增 `team_play`；**不含**台數與邀請碼。
- 學生無效憑證仍只回最少資訊（不含 `team_play`、`invite_code`）。
- 推播：草稿更新只讓本組 view 改變；他組 view 不變 ⇒ 他組連線不送訊息（app-skeleton v1.1 D4 的「只在本連線的 view 改變時才送」）。

- 證偽欄｜可證偽：`test_isolation.py` 新增三則：①搶答中第1組草稿「甲組草稿祕密」與第1組邀請碼不出現在第2組 WebSocket、REST 成功與錯誤回應、公開資訊；②第1組更新草稿時第2組連線收不到任何訊息（同既有 `test_other_team_submit_sends_nothing` 的 seq 不跳號判據）；③判定中、已結束的學生 view 不含 `drafts` 鍵。

### D6 web

- 老師「組別」區塊：「組隊（一組多台裝置）」勾選框（只在準備階段可按，呼叫 `team-play`）；組隊時每組顯示「已加入（n 台）」與邀請碼。
- 首頁：組隊時已加入的組別按鈕不停用，旁邊多一個「邀請碼」輸入欄；加入失敗顯示伺服器訊息。
- 學生頁：組隊時顯示「本組邀請碼：XXXXXX（給組員加入用）」；作答卡輸入後 400 毫秒送草稿；伺服器推來的組內草稿與本機輸入不同時，顯示「組內草稿：…」與「套用」按鈕（不直接覆蓋正在輸入的內容）。

- 證偽欄｜可證偽：`web/src/pages/team.test.tsx`。

### D7 契約

`contracts/api.md` 增 `POST /api/teacher/team-play`（`{enabled}` ⇒ `{team_play}`；401／409 非 preparing／422）、`POST /api/student/draft`（D4）；`POST /api/student/join` 本體 `{team, code?}`，增 403 邀請碼不正確、409 此組裝置已滿；`/api/public/info` 增 `team_play`；老師與學生 view 增 D5 欄位。全部是**新增**，既有欄位語意不變（`team_play=False` 時行為與第一期相同）。

- 證偽欄｜可證偽：`make test` 中第一期 `test_api_skeleton.py::test_join_once_per_team`、`test_phases.py::test_concurrent_join_same_team_once` 等既有測試不改仍綠。
