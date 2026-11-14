# team-mode — design（v1.1）

知識時點：2026-11-14。對標（`docs/research/competitors.md` §1，2026-11-11 查）：Kahoot! Team mode 讓一隊共用一台裝置並給「討論時間」，隊員分數平均；Quizlet Live 隨機分隊，每位隊員只看到部分選項。本卡依 TRD §6 裁定只取「一隊多人、一人代表作答」，不採分數平均與討論時間。

倉外行為探針：無。本卡的決策只依賴本倉既有的鎖、序號與依身分裁切的 view（`server/quiz_server/activity.py`、`views.py`），不依賴第三方函式庫的新行為、外部服務或瀏覽器新行為；前端草稿的防抖用 `setTimeout`，不影響伺服器端判據。草稿更新會讓每條連線重算一次 view，與既有「任何狀態改變都重算」相同，量級為（組數 × 6 台＋老師）≤ 73 條連線、每台每 400 毫秒至多一次，本機模擬不另跑效能探針（屬取捨）。

**v1.1（提案輪評審）**：紅隊——釋放後下一台不需邀請碼即可搶佔（改為釋放即換新碼、只顯示在老師畫面，之後連第一台也要帶碼）；全形輸入使 `compare_digest` 拋例外（改 NFKC 正規化後以位元組比對）。架構——邀請碼常駐學生畫面且搶答中可加入（改為學生只在準備階段看得到、開始搶答即換新碼）；契約身分表、join、release 屬語意補充而非純新增（D7 逐條列出、呈負責人批准）；台數算憑證數、關分頁不釋放名額（列為取捨）。

## 決策

### D1 組隊是活動設定，不是模式

`Activity.team_play: bool = False`。`set_team_play(enabled)`：鎖內、`preparing`（其他階段 409）；值改變時撤銷**所有**組別憑證、邀請碼與草稿（`_revoke_all`），`_bump()`；值不變時什麼都不做。`reset` 保留；`configure_teams` 也走 `_revoke_all`（撤銷憑證、清邀請碼與草稿）。

- 證偽欄｜屬取捨，理由：代表作答不改 TRD T-01 的四個面向（誰能作答、何時鎖題、如何計分、何時揭曉），做成模式就無法與時間計分等模式並用。可證偽部分：`test_team_mode.py::test_team_play_does_not_change_scoring`（三種模式各跑同樣的送出，組隊開／關的順位、判定與分數相同；時間計分的分數取決於真實時鐘，只比順位與判定）、`test_toggle_only_when_preparing`、`test_toggle_revokes_only_on_change`、`test_configure_teams_clears_codes`；第一、二期全部測試在預設 `team_play=False` 下照舊綠。

### D2 憑證與邀請碼

- `_tokens: dict[str, str]`（憑證 → 組別）多對一；`_codes: dict[str, str]`（組別 → 邀請碼）。邀請碼 6 碼，字母表 `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`（32 字，`secrets.choice`；約 10⁹ 種，本機模擬不設嘗試次數限制，屬取捨）。
- `join(team, code)`，全部在鎖內，讓出點夾在檢查與寫入之間：
  1. 組隊關閉：同第一期，該組已有憑證 ⇒ `TeamTakenError` 409「此組已有裝置加入，請老師釋放後再加入」。
  2. 組隊開啟且該組**有邀請碼**（已有裝置，或曾被老師釋放）：輸入經 NFKC 正規化（全形轉半形）、去空白、轉大寫後**以位元組** `secrets.compare_digest` 比對，不符 ⇒ `InviteCodeError` **403**「邀請碼不正確」（非 ASCII 輸入只會比對失敗，不會拋例外）；相符但已有 `MAX_DEVICES = 6` 台 ⇒ 409「此組裝置已滿（最多 6 台）」。先比對邀請碼再檢查上限：沒有正確邀請碼的人不該知道該組有幾台。
  3. 組隊開啟且該組**沒有邀請碼**（從未有人加入）：發憑證並產生邀請碼。
- **開始搶答即換新所有邀請碼**（`start`）：準備階段被他組瞄到的碼在搶答中失效；搶答中要加入的組員只能向老師索取（老師 view 永遠有現行碼）。
- `release(team)`：撤銷該組全部憑證、清該組草稿；組隊時**換新邀請碼**（只在老師 view）。被踢的冒用者不能搶先以「第一台」重新佔住該組。
- 殘餘風險：準備階段已憑碼加入的冒用者，開始搶答換碼後憑證不會被撤銷，仍留在該組；老師可從台數看出異常並釋放整組。
- `devices(team)`＝該組已發出的憑證數。憑證存在分頁的 sessionStorage，關分頁不會釋放名額；名額不夠時老師只能釋放整組、組員以新碼重新加入（屬取捨：單台釋放需要裝置識別與在線偵測，超出本卡範圍；6 台高於一般分組人數）。

- 證偽欄｜可證偽：`test_team_mode.py::test_join_requires_code`（無碼、錯碼、截短碼 403 且不發憑證；小寫與前後空白可）、`test_fullwidth_code_accepted`、`test_single_device_without_team_play_unchanged`、`test_device_limit`（滿後錯碼仍 403）、`test_concurrent_join_at_limit`（6 台後並發 5 次恰 0 成功；5 台後恰 1 成功）、`test_concurrent_first_join_one_code`、`test_release_revokes_all_devices_and_code`（釋放後無碼、舊碼 403，新碼可加入）、`test_code_rotates_on_start_and_hidden_from_students`。

### D3 送出：代表作答

送出的判定口徑不變：同組任一憑證都反查到同一組別，「本組已送出這一題」的檢查、序號與時間計分的截止都在同一把鎖內。`submit` 唯一的新增是送出成功後清除該組該題的草稿（D4）。

- 證偽欄｜可證偽：`test_team_mode.py::test_concurrent_submit_same_team`（同組 3 台裝置、每題並發 20 次，每次恰 1 筆成功、其餘 `AlreadySubmittedError`、序號無重號）；`test_member_sees_team_submission`（A 裝置送出後 B 裝置收到含該筆的推播；B 再送 409「本組已送出這一題，不可修改」）。

### D4 組內草稿

- `POST /api/student/draft`，`X-Team-Token`，本體 `{question, answers}`，回 `{question}`（不回顯內容）。`set_draft` 在鎖內依序檢查：組隊（409「只有組隊模式可以共用草稿」）、`answering`（409）、題號（404）、時間計分只收開放中那一題（409「這一題目前沒有開放作答」）、本組尚未送出該題（409「本組已送出這一題，不可修改」）、`answers` 長度＝子題數且每格 ≤200 字、不含控制字元（422，訊息固定、不回顯）；**空白允許**。檢查與寫入同在一把鎖內，與送出不會交錯成「送出後又寫入草稿」。
- `Activity.drafts: dict[str, dict[int, tuple[str, ...]]]`，最後寫入者為準；清除時機：該題送出成功、`_clear_answers`（匯入、重置）、`release`、`_revoke_all`（切換組隊、改組數）。
- 草稿與邀請碼都不寫日誌（`CLAUDE.md`「日誌不記學生作答原文」；join 只記組別）。
- 前端：送出時取消尚未送出的草稿計時器；草稿請求失敗一律靜默（例如組員剛好送出），畫面以伺服器推來的狀態為準。

- 證偽欄｜可證偽：`test_team_mode.py::test_draft_rules`（各錯誤碼；最後寫入者為準；送出後消失）、`test_draft_cleared_on_release_and_reset`、`test_draft_timed_only_open_question`、`test_teacher_view_has_no_drafts`。

### D5 view 與作答隔離

- 學生 view（只在 `team_valid`）：`team_play`；`invite_code`——**只在 `preparing`**；`drafts: [{question, answers}]`——**只在 `answering`** 且只含本組。其餘階段兩者都不帶（fail-closed）。
- 老師 view：`team_play`、`devices: {組名: 台數}`（每組都列）、`invite_codes: {組名: 碼}`（只列有邀請碼的組，含被釋放後待重新加入者）。老師 view 不含草稿。
- 公開資訊 `GET /api/public/info` 增 `team_play`；**不含**台數與邀請碼。
- 學生無效憑證仍只回最少資訊（`role`、`phase`、`team`、`team_valid` 四鍵）。
- 推播：草稿更新只讓本組 view 改變；他組 view 不變 ⇒ 他組連線不送訊息（app-skeleton v1.1 D4 的「只在本連線的 view 改變時才送」）。

- 證偽欄｜可證偽：`test_isolation.py` 新增五則：`test_team_draft_isolated`（第1組草稿「甲組草稿祕密」與搶答中邀請碼不出現在第2組 WebSocket、REST 成功與錯誤回應、公開資訊、無碼加入的 403；老師看得到碼、看不到草稿）、`test_other_team_draft_sends_nothing`（第2組 seq 不跳號）、`test_drafts_only_in_answering`（準備、判定、結束三階段學生 view 無 `drafts`）、`test_invalid_token_gets_no_team_fields`、`test_invite_code_not_sent_to_students_while_answering`。

### D6 web

- 老師「組別」區塊：「組隊（一組多台裝置）」勾選框（只在準備階段可按，呼叫 `team-play`）；組隊時每組顯示「已加入（n 台）」與邀請碼，並提示「開始搶答時邀請碼會換新，搶答中要加入的組員請向老師索取」。
- 首頁（`TeamPicker`）：組隊時已加入的組別按鈕不停用，多一個「邀請碼」輸入欄；加入失敗顯示伺服器訊息。首頁只在載入時讀一次公開資訊（同第一期）。
- 學生頁：組隊時顯示「組內任一人送出即代表全組」；準備階段顯示本組邀請碼，搶答中改提示向老師索取。作答卡輸入後 400 毫秒送草稿（D4 前端規則）；組內草稿非空且與本機輸入不同時，顯示「組內草稿：…」與「套用」按鈕（不直接覆蓋正在輸入的內容）。

- 證偽欄｜可證偽：`web/src/pages/team.test.tsx`（老師勾選呼叫 API、非準備階段停用、台數與邀請碼；首頁組隊時已加入可按並帶碼、非組隊時停用且無碼欄；學生頁邀請碼與草稿；防抖只送最後一次、「套用」帶入；非組隊不送草稿）。

### D7 契約

**新增**：`POST /api/teacher/team-play`（`{enabled}` ⇒ `{team_play}`；401／409 非 preparing／422）、`POST /api/student/draft`（D4）；`/api/public/info` 增 `team_play`；老師 view 增 `team_play`、`devices`、`invite_codes`；學生 view 增 `team_play`、`invite_code`、`drafts`。

**語意補充（v1.1，呈負責人批准）**——`contracts/api.md` 以下既有字句在組隊時語意改變（組隊關閉時與第一期相同）：

1. 身分表「組別憑證（一組一台裝置）」⇒ 補「組隊時一組最多 6 台，第二台起憑邀請碼加入」。
2. `POST /api/student/join` 本體 `{team}` ⇒ `{team, code?}`；錯誤增 403「邀請碼不正確」；409 在組隊時改指「此組裝置已滿」。
3. `POST /api/teacher/release`「撤銷該組憑證」⇒ 組隊時撤銷該組全部裝置、清草稿並換新邀請碼。
4. `POST /api/teacher/teams` 另清除邀請碼與草稿。

`docs/product-trd.md` §3「每組一台裝置」同批補「組隊時最多 6 台」。

- 證偽欄｜可證偽：`make test` 中第一期 `test_api_skeleton.py::test_join_once_per_team`、`test_phases.py::test_concurrent_join_same_team_once` 等既有測試不改仍綠；`test_team_mode.py::test_single_device_without_team_play_unchanged`。
