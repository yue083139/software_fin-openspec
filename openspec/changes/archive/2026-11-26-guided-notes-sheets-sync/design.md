# guided-notes-sheets-sync — design（v1.2）

> 與 SpecKit 組 `specs/010-guided-notes-sheets-sync/research.md` R1–R7 一一對應、口徑相同（D_n＝R_n）。
> **實作輪評審（紅隊 CLEARED、架構 NOT CLEARED 1 阻斷，藥方已落）**：Google 分頁名含 `/ : * ? [ ]` 時 xlsx 備援轉檔失敗、整個匯入回 422 並留孤兒副本（兩通道同抽）⇒ D4 備援檔分頁名淨化＋對照、D3 副本未被採用即刪；實作偏離回稿：D1 換新失敗立即設為未登入、D3 gid 檢查提前到複製前；`.env` 以 utf-8-sig 讀（D1）。
> **v1.2（提案輪評審，紅隊＋架構雙通道，皆 CLEARED 0 阻斷）**：架構——`prompt=consent` 未寫進稿、`openid email`／換新／撤銷未探針（D1）；匯入後原檔被改、匯出時才複製會用舊座標寫錯格（D3，兩通道同抽）；兩組口徑缺分頁名跳脫、錯誤碼先後（D3、D7）；R-05「原 Guided Notes」的解讀未落需求（D4）；「框線相同」無探針。紅隊——state 未綁瀏覽器（D1）；撤銷權杖放網址、回呼回顯參數（D1、D6）；`formattedValue` 讀題號會因數字格式與 xlsx 不等價（D2）。**負責人 2026-11-17 裁**：匯入時就複製；加 cookie 綁定；契約改動批准；副本名稱、D5 套 xlsx 路徑照傾向。

知識時點：2026-11-17。Google 端點、權限範圍與行為以探針 `probes/google_sheets_probe.py` 實測為準，原樣輸出 `probes/results/2026-11-17-google-sheets.txt`（負責人帳號執行，登入、讀取、複製、寫入四步皆 OK）。v1.2 新增的 `openid email`、換新、撤銷三步已重跑，原樣輸出 `probes/results/2026-11-17-google-sheets-v1.2.txt`（六步皆 OK）。

## 背景

2026-11-17 課程補充說明：「Guided Notes 以 Google Sheets 的形式儲存」指系統需直接串接自己雲端線上的 Google Sheets 讀寫，而非下載成 .xlsx 在本地離線處理。現行：

- 連結匯入：`server/quiz_server/sources.py:39`「`out = f"https://docs.google.com/spreadsheets/d/{m.group(1)}/export?format=xlsx"`」，伺服器下載 xlsx 後以 openpyxl 解析。
- 匯出：`server/quiz_server/app.py:220`「`data = write_answers(act.source_bytes, act.notes, results.winning_answers(act))`」產生 xlsx 下載，老師手動「取代試算表」。

負責人 2026-11-17 裁定：OAuth 讓老師登入 Google；保留 xlsx 上傳當備援；先複製一份再寫；題組子題 G／H 欄寫入口徑併入本卡。

## 決策

### D1 認證：OAuth 2.0 授權碼流程＋PKCE，網頁應用程式用戶端，cookie 綁定

- 用戶端類型「網頁應用程式」，已授權重新導向 URI 固定 `http://127.0.0.1:8000/api/google/callback`。`GOOGLE_CLIENT_ID`、`GOOGLE_CLIENT_SECRET` 只經環境變數（`.env`，已在 `.gitignore`；`__main__.py` 啟動時以 utf-8-sig 讀 repo 根目錄 `.env`——Windows 編輯器可能存成帶 BOM——不覆蓋既有環境變數）；未設定時 Google 功能停用並提示，xlsx 備援照常。
- 登入：`POST /api/teacher/google/login`（需老師金鑰）產生一次性 `state`（`secrets.token_urlsafe(32)`）與 PKCE `code_verifier`（S256），有效 10 分鐘；回應 `{url}` 並設 cookie `qz_gstate`＝`sha256(state)` 十六進位（`HttpOnly`、`SameSite=Lax`、`Path=/api/google`、`Max-Age=600`）。授權網址參數：`response_type=code`、`scope`、`state`、`code_challenge`、`code_challenge_method=S256`、`access_type=offline`、**`prompt=consent`**（Google 只在顯示同意畫面時發 refresh token；權杖不落地，伺服器重啟後再登入必須重拿）。web 以新分頁開授權網址。
- 回呼：`GET /api/google/callback?code&state`（不需老師金鑰）。`state` 須為伺服器發出、未過期、未用過，**且** `sha256(state)` 等於 cookie `qz_gstate`（綁定發起登入的瀏覽器，擋「看到投影授權網址的人用自己帳號先完成授權」的登入 CSRF；SameSite=Lax 允許 Google 頂層導回時帶 cookie）；任一不符或帶 `error` 參數 ⇒ 400，`state` 作廢，不換權杖。成功 ⇒ 以 code＋verifier＋client secret 換權杖，回固定文案 HTML「登入完成，可關閉此分頁」並清 cookie。回呼頁 **不回顯任何查詢參數**（含 `error`），只用固定文案，避免反射型 XSS 偷老師金鑰。
- 權杖只存單例 `GoogleSession`（伺服器記憶體），不落地、不入日誌、不出現在任何 API 回應或 WebSocket 訊息。access token 過期前 60 秒以 refresh token 換新；**換權杖回應沒有 refresh token**（例：同意畫面被略過）⇒ access token 過期後 401「Google 登入已過期，請重新登入」並設為未登入；**換新失敗**（refresh token 被撤銷或失效）⇒ 立即 401 並設為未登入（實作偏離回稿：此時 access token 已進入 60 秒換新邊界，再用也很快失效，直接要求重新登入較單純）。帳號 email 取自換權杖回應 `id_token` 的酬載（JWT 中段 base64url 解碼取 `email`；權杖直接來自 Google 權杖端點的 TLS 回應，不另驗簽）。
- 登出：`POST https://oauth2.googleapis.com/revoke`，**權杖放表單本體**（`token=<refresh 或 access>`，`application/x-www-form-urlencoded`），不放網址；撤銷失敗也清空本機權杖。
- 權限範圍：`openid email https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive`。同意畫面維持「測試中」。
- 證偽欄｜可證偽：`probes/results/2026-11-17-google-sheets.txt` 步驟 1「回呼 state 相符：True」「換權杖 HTTP 200；有 refresh_token：True；scope：https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/spreadsheets；expires_in：3599」（探針當時已帶 `prompt=consent`，`probes/google_sheets_probe.py`「"prompt": "consent"」）。另實測：帳號不在測試使用者名單時 Google 顯示「已封鎖存取權：未完成 Google 驗證程序」且**不導回**回呼，故 `state` 須自帶過期。v1.2 三步已重跑（`probes/results/2026-11-17-google-sheets-v1.2.txt`）：「id_token 有 email：True」；「5 換新：HTTP 200；有 access_token：True；新 token 與舊不同：True」；「6 撤銷：HTTP 200」「撤銷後再換新：HTTP 400；error：invalid_grant」（權杖放表單本體）；scope 回應含 `userinfo.email openid`。屬取捨部分：不用服務帳號（負責人裁定）；不用 `google-auth-oauthlib`，以既有 httpx 手寫 REST 呼叫，理由＝沿用 `MockTransport` 替身測法、不新增依賴、兩組程式逐字相同較易維持。

### D2 讀取：Sheets API 格狀資料 → Grid → 既有解析

- `GET https://sheets.googleapis.com/v4/spreadsheets/{id}?includeGridData=true&fields=properties.title,sheets(properties(title,sheetId),merges,data.rowData.values(formattedValue,effectiveValue))`（連結帶 `gid` 則只取 `sheetId` 等於它的分頁；找不到 ⇒ 400「找不到連結指定的分頁」）。
- 儲存格值：`effectiveValue.numberValue` ⇒ 數字（整數值轉 `int`）；`effectiveValue.stringValue` ⇒ 字串；`effectiveValue.boolValue` ⇒ 布林；都沒有 ⇒ `formattedValue`；全無 ⇒ 空。與 openpyxl 讀 xlsx 的型別一致，題號欄套了數字格式（如顯示「1.00」）也讀成 `1`。
- `guided_notes.py` 解析器改吃最小介面 `Grid`：`title`、`cell(row, col)`、`max_row`、`max_column`、`merges -> list[(min_row, min_col, max_row, max_col)]`。openpyxl 工作表與 Sheets 格狀資料各一個轉接器；**guided-notes-import D1–D4 定位規則一字不改**。
- 試算表 id 解析沿用 `sources.py` 的網址驗證（`https`、`docs.google.com`、`/spreadsheets/d/<id>`，`gid` 須為數字），不再組 `/export` 下載網址。
- 證偽欄｜可證偽：探針步驟 2「API 解析：[(1, ['G5', 'G6']), (2, ['G8', 'G9']), (3, ['G11']), (4, ['G13'])]」與「夾具解析」逐字相同（合併數 13）；`test_google_sheets.py` 以四份夾具（single、group、variant、reference）轉出的格狀資料替身守住等價，並含「題號欄 `formattedValue`＝"1.00"、`numberValue`＝1」負例。

### D3 複製與寫回：匯入時就複製，解析與寫入都對同一份副本

- **匯入時**（負責人裁定，取代 v1.1 的「匯出時才複製」）：①讀原試算表標題與各分頁 `sheetId`（`spreadsheets.get`，`fields=properties.title,sheets.properties.sheetId`）；連結的 `gid` 不在其中 ⇒ 400「找不到連結指定的分頁」，**不建立副本**（實作偏離回稿：檢查提前到複製前，少一份孤兒副本）②Drive `POST https://www.googleapis.com/drive/v3/files/{id}/copy`，名稱「<原標題>-搶答結果」，保留全部分頁、格式、合併 ③對**副本**做 D2 讀取與解析 ④解析失敗 ⇒ 盡力刪除副本（Drive `DELETE files/{copyId}`，失敗不影響回應）並回 400 解析錯誤；解析成功但**副本未被採用**（例：等 Google 回應時老師已開始搶答 ⇒ `load_questions` 409）同樣盡力刪除副本後回原錯誤（實作輪評審）。成功 ⇒ `Activity.source_sheet_id`＝副本 id、`source_name`＝原標題，匯入回應多帶 `sheet_url`（副本連結）。
- **匯出時**：`POST …/spreadsheets/{copyId}/values:batchUpdate`，`valueInputOption=RAW`，每個作答格一筆 `{range: "'<分頁>'!<A1>", values: [[文字]]}`；分頁名中的 `'` 以 `''` 跳脫；座標取自解析**同一份副本**時記下的 `Slot.cell`，與 xlsx 路徑寫回匯入快照的語意一致，不會因原檔在匯入後被改而錯位。只在 `ended`；回 `{url}`（副本 `https://docs.google.com/spreadsheets/d/<copyId>/edit`）。原試算表在匯入時只讀一次標題、複製一次，此後 0 次存取。
- 重新匯入 ⇒ 再複製一份新副本（舊副本留在老師雲端硬碟，不刪）。
- 候選 B（Sheets `create`＋`sheets.copyTo`）：探針可行但分頁名變「「學習單」的副本」且只帶單一分頁，不採；留作日後須發布時只需 `spreadsheets` 範圍的退路。
- 證偽欄｜可證偽：探針步驟 3「3A Drive files.copy：HTTP 200」「副本 … 合併與原檔相同：True」；步驟 4「副本讀回：'=1+1'」——`RAW` 寫入以 `UNFORMATTED_VALUE` 讀回仍是字串。`test_google_sheets.py`：匯入請求序為「標題 → copy → 讀副本」、寫回請求只打副本 id、原檔 id 匯入後 0 次請求、分頁名含 `'` 時範圍為 `'O''Brien'!H5`。屬取捨部分：每次匯入都在老師雲端多一份副本（即使沒匯出）；匯入後再改原檔不會反映（與 xlsx 快照一致），老師改了原檔須重新匯入；老師若在課中手改**副本**版面，寫回仍可能錯位（殘餘風險，README 註明「副本在搶答結束前請勿改版面」）；`drive` 為受限範圍，「測試中」實測可用，本專題不發布。

### D4 來源與備援

- 匯入：①「從 Google 試算表匯入」（需登入，D2＋D3）；②上傳 xlsx（不需登入，現行路徑不變）。**移除**未登入的公開連結下載（`download_sheet`、`export_url` 刪除），理由：正是課程補充說明點名的做法。
- 匯出：來源為 Google 試算表 ⇒「匯出到 Google 試算表」（D3）＋「下載 xlsx（備援，不含格式）」；來源為上傳 xlsx ⇒ 只有「下載 xlsx」。
- `Activity` 增 `source_sheet_id`（副本 id；上傳為 `None`）。Google 來源時 `source_bytes` 為副本格狀資料轉成的工作簿（只含值與合併），供下載備援；Google 允許、xlsx 不允許的分頁名稱字元（`\ / : * ? [ ]`）在備援檔換成「_」、截到 31 字、重名加序號，對照表存 `Activity.source_xlsx_sheets`，下載時以對照後的分頁名寫回；寫回 Google 副本仍用原名（實作輪評審：否則整個匯入回 422）。題目來自上傳 xlsx 時寫回 Google 試算表 ⇒ 409「題目不是從 Google 試算表匯入，請改用下載 xlsx」。
- R-05「匯出至原 Guided Notes」的解讀：負責人 2026-11-17 裁「先複製再寫」，寫入的副本為原 Guided Notes 的完整複本（全部分頁、格式、合併），視為達成 R-05；原檔不動。同批寫進 `docs/requirements.md` §4。`eval/acceptance/matrix.yaml` M-006 聲明分路徑：xlsx 來源「其餘格內容與格式不變」；Google 來源「副本其餘格不被寫入」；Google 來源的 xlsx 備援只保證值與合併。
- 證偽欄｜屬取捨：理由＝xlsx 只當網路或授權失敗時的備援；完整格式由 D3 副本保留。

### D5 題組子題填空格（PR #18 followup，負責人裁定併入本卡）

- 現況：`group.xlsx` 作答表頭 `G4:H4` 橫向合併；單題作答格 `G11:H11` 合併；題組子題列 `G5`「（1）」、`H5` 空白且**不合併**。現行把答案接在標籤後（`G5`「（1）CPU」），`H5` 留白。
- 新規則（xlsx 與 Google 兩條路徑同一規則，負責人裁定）：匯入時，若作答格不是合併範圍、含非佔位符標籤，且同列右側相鄰格仍落在**作答表頭合併範圍的欄寬內**、本身空白且不屬任何合併範圍 ⇒ 該右側格為填空格：`Slot.cell`＝右側格、`Slot.label=""`、`Slot.placeholder=False`、`Slot.display`＝標籤格文字；否則維持現行（佔位符取代、或接在標籤後）。欄寬取自表頭合併範圍，不寫死欄位。
- 影響：`group.xlsx` 第 1、2 題作答格從 `G5/G6/G8/G9` 變 `H5/H6/H8/H9`；single 不變（作答格 `G:H` 本身合併）；variant 不變——`probes/guided_notes_structure_probe.py tests/fixtures/guided-notes/variant.xlsx` 原樣輸出子題作答格為合併範圍「H11:I11, H12:I12, H13:I13 … H17:I17, H18:I18」；reference 不變（紅隊以暫存腳本跑四份夾具實證）。
- 證偽欄｜可證偽：`test_guided_notes_parse.py` 新增 group 子題座標與 display 斷言；`test_guided_notes_export.py` 斷言 `G5` 仍為「（1）」、`H5` 為答案。屬取捨部分：規則只看「右側相鄰一格」，不處理標籤與填空格中間隔欄的版面。

### D6 作答隔離與憑證

- 學生 view、老師 view 都不增 Google 欄位；登入狀態只經 `GET /api/teacher/google`（需老師金鑰，`{configured, signed_in, email}`，不含權杖）。
- 日誌不記授權碼、權杖、client secret、`state`；Google API 錯誤 ⇒ 502，訊息只轉 Google 錯誤 JSON 的 `error.status` 字串（無則「Google 服務錯誤」），不回顯請求網址；httpx 例外一律在 `google_sheets`／`google_auth` 內攔下轉成 `GoogleApiError`，不讓帶網址的例外訊息往上拋進 traceback。撤銷權杖放表單本體（D1）。
- `ops/gate_secrets.py` 加形狀：`GOCSPX-` 開頭的用戶端密鑰、`ya29.` 開頭的 access token、`1//` 開頭的 refresh token；夾具用「前綴＋0×n」放行。
- 證偽欄｜可證偽：`test_isolation.py` 新增「以假權杖完成登入、匯入、寫回、換新、登出（含撤銷失敗）後，學生 WebSocket／REST 完整 payload 與 caplog 不含權杖、授權碼、client secret 字串」；`test_api_google.py`「回呼帶 `error=<script>` 時回應本文不含該字串」；gate-secrets 變異實錄（植入真形狀字串 ⇒ 紅）。

### D7 契約（負責人 2026-11-17 批准）

`contracts/api.md` 改動。錯誤判斷先後一律：**老師金鑰 401 → 階段／來源 409 → 參數 400 → Google 登入 401 → Google 端 502**；檢查到第一個不符即回，且在 Google 登入檢查之前不發任何對外請求。

| 端點 | 成功 | 錯誤（依上述先後） |
|---|---|---|
| `GET /api/teacher/google` | `{configured, signed_in, email}` | 401 |
| `POST /api/teacher/google/login` | `{url}`，設 cookie `qz_gstate` | 401；400「伺服器未設定 Google OAuth 用戶端」 |
| `GET /api/google/callback?code&state` | HTML「登入完成，可關閉此分頁」 | 400 HTML「登入失敗，請回老師頁重新登入」（state 不符／過期／重放／cookie 不符／帶 error） |
| `POST /api/teacher/google/logout` | `{signed_in: false}` | 401 |
| `POST /api/teacher/import-url` `{url}` | `{source, count, sheet_url}` | 401；409 非 preparing；400 連結不符或分頁不存在或解析錯誤；401「請先以 Google 帳號登入」或「Google 登入已過期，請重新登入」；502 |
| `POST /api/teacher/export-sheet` | `{url}` | 401；409 非 ended「搶答結束後才能匯出」、尚未匯入「尚未匯入題目」、非 Google 來源「題目不是從 Google 試算表匯入，請改用下載 xlsx」；401 Google 未登入／過期；502 |
| `GET /api/teacher/export` | 不變（Google 來源時只含值與合併） | 不變 |

老師與學生 view 不增欄位。

- 證偽欄｜屬取捨：匯入網址端點沿用舊名，web 改動最小；先後以「先擋不需對外請求的錯」為原則。

## 已裁事項（負責人 2026-11-17）

| 事項 | 裁定 |
|---|---|
| 匯入後原檔被改的座標錯位 | 匯入時就複製（D3） |
| 登入 CSRF | 加 cookie 綁定（D1） |
| 契約改動 | 批准（D7） |
| 副本名稱 | 「<原標題>-搶答結果」，重複匯入產生多份 |
| D5 套 xlsx 上傳路徑 | 套 |

## 風險

- 同意畫面「測試中」：未登記的帳號無法登入；Demo 與助教測試須用登記帳號。README 寫明。
- 老師在搶答期間手改副本版面 ⇒ 寫回可能錯位（殘餘風險，README 提示）。
- 受限範圍 `drive`：測試中實測可用；若日後須發布，改採 D3 候選 B。
