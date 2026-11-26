# easy-setup — 啟動即進老師頁，Google 設定與手機連線都在老師頁引導完成（v1.1，提案輪評審後；負責人 2026-11-26 指示審完直接實作）

檔位：**S**（憑證 Google API：伺服器寫入 OAuth 用戶端設定；`contracts/` 新增端點；跨元件架構取捨：伺服器執行期起停外部子行程、開瀏覽器）｜主人：@yue083139｜parity：`docs/parity.md` §4 `easy-setup`（本卡開卡登記）｜需求：R-01、X-04｜依賴：`guided-notes-sheets-sync`、`student-qr`；**合入順序在 `teacher-key-hidden`（OpenSpec #29）、`teacher-key-error`（#28）之後**（三卡都改 `web/src/pages/Teacher.tsx`，後到者 rebase）

負責人 2026-11-26 裁：啟動流程太複雜（要手動編 `.env`、從終端機複製網址、啟動前選腳本、缺工具只報錯），四項全做；補充「希望 make dev 之類的啟動後就能直接進後台做」。流程：S 檔壓縮版（提案輪、實作輪各一次雙通道評審）。

## 首屏決策摘要

1. **任一方式啟動（`make dev`、`make dev-tunnel`、`start.cmd`）就緒後自動以預設瀏覽器開老師頁一次**；之後的設定都在老師頁完成，終端機只是備援／代價：瀏覽器紀錄留有第一次的含金鑰網址（`teacher-key-hidden` 已知限制）／屬取捨：`--no-browser`、`QUIZ_NO_BROWSER=1`、`CI` 環境變數任一即不開；可被 `test_launch.py`（以替身 `webbrowser.open` 計次）證偽；探針①：`webbrowser.get().name` 為空、`open` 回 True，以回傳值判斷。
2. **Google 設定精靈**：未設定時老師頁「Google 帳號」區展開分步引導（Cloud Console 直達連結、一鍵複製重新導向 URI），貼上用戶端 ID／密鑰 → `POST /api/teacher/google/config` 驗格式白名單後寫入固定路徑 repo 根目錄 `.env` 並**立即生效**；密鑰永不回傳、不入日誌；端點限本機＋老師金鑰／可被 `test_google_config.py` 證偽。
3. **老師頁一鍵開關手機連線**：`POST`／`DELETE /api/teacher/tunnel` 由伺服器執行期起停 cloudflared（沿用 `tunnel.py`），（`create_app` 注入以伺服器埠建立的 `Tunnel` 實例，`--tunnel` 共用），老師 view 加 `tunnel`（`off`／`starting`／`on`）並推播；建立中關閉＝取消、搶答開始後不能關閉（409）、子行程意外結束自動轉 off；找不到 cloudflared 回 503 並由前端顯示安裝指令；**移除 `start-tunnel.cmd`**（按鈕取代），保留 `--tunnel`／`make dev-tunnel` 給開發者。
4. **老師頁頂部「開始前的設定」清單**（準備階段顯示）：Google（未設定／未登入／已登入）、手機連線（關／開）、題目（未匯入／N 題），點了捲到對應分區；不自動捲動。
5. **`start.ps1` 缺 uv／Node.js 時詢問「要幫你用 winget 安裝嗎？(Y/N)」**，Y 則安裝並以 Machine＋User 登錄值刷新本行程 PATH 後繼續／可被探針③證偽（`probes/results/2026-11-26-easy-setup.txt`：刷新後 `Get-Command cloudflared` 由 False 變 True）。

**矩陣落點**：新增 M-025（P-06）「Google 用戶端密鑰只寫入本機 `.env`，永不出現在任何回應、view 與日誌；設定端點限本機＋金鑰、格式白名單」守門 `server/tests/test_google_config.py`；M-026（X-04）「手機連線執行期起停，只有老師（本機）可操作，狀態推播給老師、學生 view 不帶」守門 `server/tests/test_tunnel_api.py`；M-027（R-01）「啟動自動開老師頁一次，旗標可關」守門 `server/tests/test_launch.py`。（M-024 為 `teacher-key-hidden`。）

**merge 三問第三問**：負責人 2026-11-26 指示；另，助教會「用另一份 Guided Notes 測試」，必須自己建 Google OAuth 用戶端——精靈直接降低助教與組員的上手成本，Demo 也不必切終端機。期限 2026-11-30。

## 為什麼

現行：`README.md`「Google 試算表設定」第 4 步要老師手寫 `.env` 後重啟；老師頁網址只印在終端機（`server/quiz_server/__main__.py:48`「print(f"老師頁（只能在本機開啟）：{base}/#/teacher?key={key}", flush=True)」）；手機連線須在啟動前選 `start-tunnel.cmd`；`start.ps1:12`「Fail '找不到 uv。…」只報錯。

## 目標

- server：`__main__.py` 就緒後開瀏覽器；`google_auth.GoogleSession.reconfigure`；新模組 `quiz_server/envfile.py`（只改兩個鍵、保留其他行、原子寫入）；`app.py` 新端點（Google 設定、手機連線）；`Activity`／views 加 `tunnel` 狀態。
- web：Google 精靈、手機連線按鈕、頂部設定清單。
- `contracts/api.md`、`start.ps1`、刪 `start-tunnel.cmd`、README、`docs/manual-verification.md`（場次 A 第 1、6 步、場次 F 改寫）。

## 邊界（本卡不做）

- 自動在 Google Cloud 建專案或用戶端（須老師本人同意畫面操作）；服務帳號。
- 啟動腳本自動裝 cloudflared（按需由老師頁提示）、自動裝 GNU make。
- 固定通道網域；伺服器重啟後保留 Google 登入。

## 驗收

| # | 指令 | 期望輸出 |
|---|---|---|
| 1 | `uv run --project server pytest -q server/tests/test_google_config.py` | 本機＋金鑰存設定 ⇒ `.env` 只改兩鍵、其他行與註解保留、立即 `configured: true`；回應與 caplog 不含密鑰；格式不符、含換行／`=`、超長 422；公開 Host 403；已登入時 409；清除後 `configured: false`；passed |
| 2 | `uv run --project server pytest -q server/tests/test_tunnel_api.py` | 以假 Tunnel：開 ⇒ 老師 view `tunnel` 依序 `starting`→`on` 且 `student_url` 有值；關 ⇒ `off`、`null`；找不到 cloudflared 503；建立中再開 409 且只起一次；建立中關閉 ⇒ 取消並停止；搶答中關閉 409；子行程死亡轉 off；學生 view 不含 `tunnel`、`student_url`；passed |
| 3 | `uv run --project server pytest -q server/tests/test_launch.py` | 就緒後 `webbrowser.open` 恰 1 次、網址為本機老師頁；`--no-browser`、`QUIZ_NO_BROWSER=1`、`CI=1` 各 0 次；`__main__` 通道埠＝伺服器埠、`create_app` 收到同一實例；passed |
| 4 | `npm --prefix web test` | 精靈步驟與複製鈕、存設定成功後切換為登入鈕、手機連線開關與 503 安裝提示、頂部清單三項狀態與跳轉；passed |
| 5 | `git grep -n "start-tunnel" -- :/ ':!openspec/changes/archive' ':!docs/ai-logs'` | 只剩本卡文件與 parity 紀錄 |
| 6 | 探針 `probes/easy_setup_probe.py`（通道後端固定 204、不讀檔） | ①`webbrowser.open` 回 True ②起停 3 次後 cloudflared 行程數回到基準（已執行，`probes/results/2026-11-26-easy-setup.txt`） |
| 7 | 人工驗證 | 雙擊 `start.cmd` ⇒ 瀏覽器自動開老師頁（網址列先含 `key=`、載入後被移除）⇒ 依清單完成 Google 精靈、登入、開手機連線、匯入，全程不看終端機、不編 `.env`；缺工具時 winget 可能跳 UAC |

## 實錄結果

見 `verification.md`。
