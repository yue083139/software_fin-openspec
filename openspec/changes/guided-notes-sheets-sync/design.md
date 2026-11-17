# guided-notes-sheets-sync — design（v1.1 草稿）

> 與 SpecKit 組 `specs/010-guided-notes-sheets-sync/research.md` R1–R7 一一對應、口徑相同（D_n＝R_n）。

知識時點：2026-11-17。Google 端點、權限範圍與行為以探針 `probes/google_sheets_probe.py` 實測為準，原樣輸出 `probes/results/2026-11-17-google-sheets.txt`（2026-11-17 負責人帳號執行，四步皆 OK）。

## 背景

2026-11-17 課程補充說明：「Guided Notes 以 Google Sheets 的形式儲存」指系統需直接串接自己雲端線上的 Google Sheets 讀寫，而非下載成 .xlsx 在本地離線處理。現行：

- 連結匯入：`server/quiz_server/sources.py:39`「`out = f"https://docs.google.com/spreadsheets/d/{m.group(1)}/export?format=xlsx"`」，伺服器下載 xlsx 後以 openpyxl 解析。
- 匯出：`server/quiz_server/app.py:220`「`data = write_answers(act.source_bytes, act.notes, results.winning_answers(act))`」產生 xlsx 下載，老師手動「取代試算表」。

負責人 2026-11-17 裁定：OAuth 讓老師登入 Google；保留 xlsx 上傳當備援；先複製一份再寫；題組子題 G／H 欄寫入口徑併入本卡。

## 決策

### D1 認證：OAuth 2.0 授權碼流程＋PKCE，網頁應用程式用戶端

- 用戶端類型「網頁應用程式」，已授權重新導向 URI 固定 `http://127.0.0.1:8000/api/google/callback`（`make dev` 的固定埠）。`GOOGLE_CLIENT_ID`、`GOOGLE_CLIENT_SECRET` 只經環境變數（`.env`，已在 `.gitignore`）；未設定時 Google 功能整區停用並提示，xlsx 備援照常。
- 流程：老師頁按「以 Google 帳號登入」→ `POST /api/teacher/google/login`（需老師金鑰）回傳授權網址；伺服器產生一次性 `state`（`secrets.token_urlsafe(32)`）與 PKCE `code_verifier`，有效 10 分鐘 → 瀏覽器到 Google 同意 → Google 導回 `GET /api/google/callback?code&state`（瀏覽器導回無法帶老師金鑰，故以 `state` 綁定該次老師請求；不符、過期或重放 ⇒ 400）→ 伺服器以 code＋verifier 換權杖 → 回 HTML「登入完成，可關閉此分頁」（不導回含老師金鑰的網址，避免金鑰出現在導向紀錄）；web 以新分頁開授權網址，原老師頁輪詢 `GET /api/teacher/google`。
- 權杖（access token、refresh token）只存 `Activity` 外的單例 `GoogleSession`（伺服器記憶體），不落地、不入日誌、不出現在任何 API 回應或 WebSocket 訊息；伺服器重啟即須重新登入。`access_type=offline` 取 refresh token，access token 過期前 60 秒自動換新。登出 ⇒ 呼叫撤銷端點並清空。
- 權限範圍：`https://www.googleapis.com/auth/spreadsheets`、`https://www.googleapis.com/auth/drive`（D3 採 A）、`openid email`（顯示登入帳號，取自權杖回應的 `id_token` 酬載）。同意畫面維持「測試中」，負責人與組員帳號登記為測試使用者。
- 證偽欄｜可證偽：`probes/results/2026-11-17-google-sheets.txt` 步驟 1「回呼 state 相符：True」「換權杖 HTTP 200；有 refresh_token：True；scope：https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/spreadsheets；expires_in：3599」——網頁應用程式用戶端接受 `127.0.0.1:8000` 重新導向，PKCE＋client secret 換得 refresh token。另實測：帳號不在測試使用者名單時 Google 顯示「已封鎖存取權：未完成 Google 驗證程序」且**不導回**回呼，故伺服器的 `state` 須有過期（10 分鐘），不能等回呼清除。屬取捨部分：不用服務帳號（負責人裁定）；不用 `google-auth-oauthlib`，改以既有依賴 httpx 手寫三支 REST 呼叫，理由＝沿用 `sources.py` 的 `MockTransport` 替身測法、不新增依賴、兩組程式逐字相同較易維持。

### D2 讀取：Sheets API 格狀資料 → 工作表抽象 → 既有解析

- `GET https://sheets.googleapis.com/v4/spreadsheets/{id}?includeGridData=true&fields=properties.title,sheets(properties(title,sheetId),merges,data.rowData.values.formattedValue)`（`gid` 有給則只取該分頁）。
- `guided_notes.py` 的解析器改吃最小介面 `Grid`：`title`、`cell(row, col) -> 值`、`max_row`、`max_column`、`merges -> list[(min_row, min_col, max_row, max_col)]`。openpyxl 工作表與 Sheets 格狀資料各有一個轉接器；**D1–D4（guided-notes-import）定位規則一字不改**。
- `formattedValue` 為顯示字串，題號 `1` 讀成 `"1"`，既有 `_as_number` 已接受 `"1"`、`"1."`。
- 試算表 id 解析沿用 `sources.py` 的網址驗證（`https`、`docs.google.com`、`/spreadsheets/d/<id>`），但不再組 `/export` 下載網址。
- 證偽欄｜可證偽：`probes/results/2026-11-17-google-sheets.txt` 步驟 2「API 解析：[(1, ['G5', 'G6']), (2, ['G8', 'G9']), (3, ['G11']), (4, ['G13'])]」與「夾具解析」逐字相同（合併數 13）；`test_google_sheets.py` 以三份夾具轉出的格狀資料替身守住此等價。（此為 D5 實施前的座標；D5 後第 1、2 題變 H 欄，兩條路徑同步變。）

### D3 寫回：複製整份試算表，寫入副本，原檔不動

- **採候選 A**：Drive `POST https://www.googleapis.com/drive/v3/files/{id}/copy`，名稱 `<原標題>-搶答結果`，保留全部分頁、格式、合併。代價：需 `drive` 權限範圍（受限範圍；「測試中」可用）。
- 候選 B：Sheets `spreadsheets.create` 新檔＋`sheets/{sheetId}:copyTo` 複製學習單分頁。代價：只帶一個分頁，分頁名變「…的副本」需再改名；好處是只要 `spreadsheets` 權限範圍。
- 證偽欄｜可證偽：`probes/results/2026-11-17-google-sheets.txt` 步驟 3「3A Drive files.copy：HTTP 200」「副本 … 合併與原檔相同：True」；候選 B 亦可行（「sheets.copyTo：HTTP 200；新分頁名：「學習單」的副本」），但分頁名被改、只帶單一分頁，故採 A。屬取捨部分：A 需 `drive` 受限範圍，「測試中」實測可用；正式發布才需 Google 審核，本專題不發布。
- 寫入：`POST …/spreadsheets/{copyId}/values:batchUpdate`，`valueInputOption=RAW`，每個作答格一筆 `{range: "'<分頁>'!<A1>", values: [[文字]]}`；座標取自匯入時記下的 `Slot.cell`（動態定位，非寫死）。只在 `ended` 允許；回傳 `{url}`（副本的 `https://docs.google.com/spreadsheets/d/<copyId>/edit`），老師頁顯示連結。
- 證偽欄｜可證偽：`probes/results/2026-11-17-google-sheets.txt` 步驟 4「副本讀回：'=1+1'；原檔同格：None（原檔應未被寫入）」——`RAW` 寫入後以 `UNFORMATTED_VALUE` 讀回仍是字串（若被當公式會讀回 2），且原檔未被寫入。

### D4 來源與備援

- 匯入：①「從 Google 試算表匯入」（需登入，走 D2）；②上傳 xlsx（不需登入，現行路徑不變）。**移除**未登入的公開連結下載（`download_sheet`、`export_url` 刪除），理由：正是課程補充說明點名的做法。
- 匯出：來源為 Google 試算表 ⇒ 主按鈕「匯出到 Google 試算表」（D3），另保留「下載 xlsx」；來源為上傳 xlsx ⇒ 只有「下載 xlsx」（無雲端原檔可複製）。
- `Activity` 增 `source_sheet_id`（Google 來源的試算表 id；上傳為 `None`）。以 Google 試算表匯入時 `source_bytes` 為格狀資料轉成的工作簿（只含值與合併，不含格式），供「下載 xlsx（備援，不含格式）」。題目來自上傳 xlsx 時寫回 Google 試算表 ⇒ 409「題目不是從 Google 試算表匯入，請改用下載 xlsx」。
- 證偽欄｜屬取捨：理由＝xlsx 只當網路或授權失敗時的備援；完整格式由 D3 副本保留。

### D5 題組子題填空格（PR #18 followup，負責人裁定併入本卡）

- 現況：`group.xlsx` 作答表頭 `G4:H4` 橫向合併；單題作答格 `G11:H11` 合併；題組子題列 `G5`「（1）」、`H5` 空白且**不合併**。現行把答案接在標籤後（`G5`「（1）CPU」），`H5` 留白。
- 新規則：匯入時，若作答格不是合併範圍、含非佔位符標籤，且同列右側相鄰格仍落在**作答表頭合併範圍的欄寬內**、本身空白且不屬任何合併範圍 ⇒ 該右側格為填空格，記為 `Slot.cell`，標籤格原樣保留；否則維持現行（佔位符取代、或接在標籤後）。欄寬取自表頭合併範圍，不寫死欄位。
- 影響：`group.xlsx` 第 1、2 題作答格從 `G5/G6/G8/G9` 變 `H5/H6/H8/H9`；single 不變（作答格 `G:H` 本身合併）；variant 不變——`probes/guided_notes_structure_probe.py tests/fixtures/guided-notes/variant.xlsx` 原樣輸出子題作答格為合併範圍「H11:I11, H12:I12, H13:I13 … H17:I17, H18:I18」，不符「作答格不屬合併範圍」前提。學生子題標籤仍取自標籤格。
- 證偽欄｜可證偽：`test_guided_notes_parse.py` 新增 group 子題座標斷言；`test_guided_notes_export.py` 斷言 `G5` 仍為「（1）」、`H5` 為答案。屬取捨部分：規則只看「右側相鄰一格」，不處理標籤與填空格中間隔欄的版面。

### D6 作答隔離與憑證

- 學生 view、老師 view 都不增 Google 欄位；登入狀態只經 `GET /api/teacher/google`（需老師金鑰，`{configured, signed_in, email}`，不含權杖）。
- 日誌不記 code、權杖、client secret；Google API 錯誤 ⇒ 502，訊息只轉 Google 錯誤的 `status` 字串，不回顯請求網址。access token 換新失敗 ⇒ 401 並設為未登入。
- `ops/gate_secrets.py` 加形狀：`GOCSPX-` 開頭的用戶端密鑰、`ya29.` 開頭的 access token、`1//` 開頭的 refresh token；夾具用「前綴＋0×n」放行。
- 證偽欄｜可證偽：`test_isolation.py` 新增「以假權杖登入後，學生 WebSocket／REST 完整 payload 與 caplog 不含權杖字串」；gate-secrets 變異實錄（植入真形狀字串 ⇒ 紅）。

### D7 契約

`contracts/api.md` 改動（**須負責人批准**）：新增 `GET /api/teacher/google`（`{configured, signed_in, email}`）、`POST /api/teacher/google/login`（`{url}`；400 未設定用戶端）、`GET /api/google/callback`（HTML；400 state 不符或 Google 回 error）、`POST /api/teacher/google/logout`（`{signed_in: false}`）、`POST /api/teacher/export-sheet`（`{url}`；401 未登入；409 非 ended、尚未匯入或題目不是從 Google 試算表匯入；502 Google 錯誤）；`POST /api/teacher/import-url` 語意改為「需已登入、以 Sheets API 讀取」（401 未登入、400 連結不符不發請求、409 非 preparing 不發請求、502 Google 錯誤）；`GET /api/teacher/export` 不變（xlsx 備援；Google 來源時只含值與合併）。老師與學生 view 不增欄位。

- 證偽欄｜屬取捨：理由＝匯入網址端點沿用舊名，web 改動最小。

## 未決呈裁

| 事項 | 我傾向 | 阻塞 |
|---|---|---|
| D3 副本名稱（探針已採候選 A） | `<原標題>-搶答結果`，重複匯出產生多份、不覆蓋 | 不阻塞 |
| D5 新規則是否套到 xlsx 上傳路徑 | 套（兩條路徑同一口徑，避免同一份學習單兩種結果） | 不阻塞 |
| 契約改動（D7） | 照上表 | **阻塞實作**：負責人批准後才 apply |

## 風險

- 同意畫面「測試中」：未登記的帳號無法登入；Demo 與助教測試須用登記帳號，或老師以登記帳號示範。README 寫明。
- 受限範圍 `drive`：測試中實測可用；若日後須發布，改採 D3 候選 B 只需 `spreadsheets` 範圍。
