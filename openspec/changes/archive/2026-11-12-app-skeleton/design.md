# app-skeleton — design（v1.1）

知識時點：2026-11-11。對標：Kahoot!／Mentimeter 皆以主持人裝置推進題目、參與者裝置被動跟隨階段（`docs/research/competitors.md`）；裁剪為單機、單一活動。

## 決策

### D1 元件與目錄

`server/quiz_server/`（Python 3.12、FastAPI、uvicorn；uv 專案 `server/pyproject.toml`）＋`web/`（React、Vite、TypeScript）。正式執行時 server 直接提供 `web/dist` 靜態檔，一個埠（預設 `127.0.0.1:8000`）完成 Demo；開發時 Vite（5173）代理 `/api`、`/ws` 到 server。

- 證偽欄｜屬取捨：理由＝共用選型（`docs/parity.md` §2）；單埠讓 Demo 只需開一個網址。

### D2 狀態集中在 `Activity`，所有變更經同一把 `asyncio.Lock`

`Activity` 持有組別、階段、（後續卡的）題目與送出紀錄；每個會改變狀態的方法都在鎖內執行並在鎖內遞增 `version`，完成後通知訂閱者。整個 server 單一處理序、單一事件迴圈。

臨界區內在「檢查」與「寫入」之間有一個明確的讓出點 `await self._checkpoint()`（`asyncio.sleep(0)`）：它讓並發測試真的會交錯執行，拿掉鎖時測試必紅（v1.0 評審實證：臨界區內無讓出點時，拿掉鎖測試仍全綠，屬假綠）。

- 證偽欄｜可證偽：`test_phases.py::test_concurrent_transitions_serialized`——同時發 20 次 `start`，恰 1 次成功、19 次回「階段不符」；變異實錄（把 `async with self._lock` 換成 `contextlib.nullcontext()`）測試必紅，結果記入 `verification.md`。

### D3 階段狀態機

`Phase = preparing | answering | judging | ended`；轉移表 `preparing→answering`、`answering→ended`、`answering→judging`、`judging→ended`、`ended→preparing`。經典模式 `end()` 直接 `answering→ended`；`judging` 由 `game-mode-framework` 卡啟用（`docs/trd-game-modes.md` T-03）。非法轉移拋 `PhaseError`，API 回 409。`reset()`（ended→preparing）清空送出紀錄、保留題目與組別。

- 證偽欄｜可證偽：`test_phases.py` 窮舉 4×4 轉移。

### D4 推播：每個連線各算各的 view

每條 WebSocket 連線有自己的送出迴圈：等待活動 `version` 改變 ⇒ 呼叫 `views.view_for(role, identity, activity)` ⇒ **與本連線上次送出的 view 比較，相同就不送**；不同才送出 `{"type": "state", "seq": k, "view": {...}}`，`seq` 為本連線自己的遞增序號（不外露全域版本號，避免從跳號推知他組活動，v1.0 評審發現）。**沒有任何「廣播同一份 payload 給所有人」的程式路徑**——這是作答隔離（`docs/discipline-precedents.md`「作答隔離」）的結構保證。單一連線送出失敗只結束該連線自己的迴圈，不影響其他連線與觸發變更的請求。前端斷線後每 1 秒重連，重連後先收到完整 view。

- 證偽欄｜可證偽：`test_api_skeleton.py::test_phase_sync_all_clients`；`buzz-answering` 的 `test_isolation.py::test_other_team_submit_sends_nothing`。

### D5 老師金鑰

啟動時 `secrets.token_urlsafe(16)` 產生（可用環境變數 `QUIZ_TEACHER_KEY` 指定，供測試與重啟沿用），終端機印出 `老師頁：http://127.0.0.1:8000/#/teacher?key=…`。老師 REST 以標頭 `X-Teacher-Key`、WebSocket 以查詢參數 `key` 帶入，以 `secrets.compare_digest` 比對；錯或缺 ⇒ REST 401、WebSocket 以代碼 4401 關閉。金鑰不寫入檔案、不入庫；uvicorn 存取日誌會印出含查詢字串的 WebSocket 路徑，故 `python -m quiz_server` **關閉存取日誌**（v1.0 評審發現）。

**實作回補（2026-11-11，真棧探針 `probes/results/2026-11-11-e2e-flow.txt`）**：①uvicorn 印出 WebSocket 接受紀錄的是 INFO 等級的錯誤日誌而非存取日誌，`access_log=False` 擋不到，改為 uvicorn `log_level="warning"`；②uvicorn 不含 WebSocket 實作，server 依賴須加 `websockets`，否則真瀏覽器連 `/ws` 得 404（TestClient 不經 uvicorn，單元測試測不到）。兩者皆屬實作偏離提案，於此回稿。

- 證偽欄｜可證偽：`test_api_skeleton.py::test_teacher_api_requires_key`。

### D6 組別

預設 4 組，名稱 `第1組`…`第N組`；老師在 `preparing` 階段可設 2–12 組（改組數即撤銷所有組別憑證）。

**組別憑證**：學生 `POST /api/student/join {team}` ⇒ 該組尚未被認領則發 `secrets.token_urlsafe(16)` 並記錄，回傳憑證；已被認領 ⇒ 409「此組已有裝置加入，請老師釋放後再加入」。學生 WebSocket 以 `token` 參數連線，伺服器由憑證反查組別（不採信客戶端自報的組別）；憑證缺、錯或已撤銷 ⇒ 只收到最少資訊的 view（`team_valid: false`），不得退回其他 view。老師 `POST /api/teacher/release {team}` 撤銷該組憑證；老師 view 顯示各組是否已加入。前端把憑證存在 `sessionStorage`，同一分頁重新整理不必重新加入。

- 證偽欄｜可證偽：`test_api_skeleton.py::test_join_once_per_team`、`test_release_allows_rejoin`、`test_bad_token_gets_minimal_view`。屬取捨部分：同組只能一台裝置；`docs/parity.md` §3「同組多分頁第一次送出即鎖定」改為「一組一台裝置」。

### D7 契約

`contracts/api.md` 記錄端點、訊息外框與列舉，之後為凍結件；本卡首建，後續卡只增不改既有欄位語意。

- 證偽欄｜屬取捨：理由＝兩組功能一致的對照基準（SpecKit 組同一份內容）。
