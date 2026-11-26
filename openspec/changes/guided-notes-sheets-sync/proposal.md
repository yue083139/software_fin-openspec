# guided-notes-sheets-sync — Guided Notes 直接串接雲端 Google Sheets 讀寫（v1.2，提案輪評審後定稿；負責人 2026-11-17 裁定並批准契約）

檔位：**S**（Guided Notes 解析與寫回口徑、`contracts/`、憑證 Google API、跨元件架構取捨）｜主人：@yue083139｜parity：`docs/parity.md` §4 `guided-notes-sheets-sync`（本卡開卡登記）｜需求：R-02、R-05（依 2026-11-17 課程補充說明）｜依賴：`guided-notes-import`、`guided-notes-export`

## 首屏決策摘要

1. **老師以 Google 帳號 OAuth 登入，伺服器直接以 Sheets API 讀寫試算表**：選了授權碼流程＋PKCE＋`prompt=consent`、`state` 以 cookie 綁定發起的瀏覽器、權杖只放伺服器記憶體／代價：須在 Google Cloud 建 OAuth 用戶端、同意畫面「測試中」只放行登記的測試帳號／可被探針 `probes/google_sheets_probe.py` 證偽（登入→讀取→建立副本→寫入四步任一失敗即推翻）。
2. **讀取：Sheets API 的儲存格值＋合併範圍轉成記憶體內工作表，沿用現行表頭／合併範圍解析**：代價：只取值與合併，不取格式／可被探針比對「同一份試算表經 API 讀到的題數、作答格位置」與既有 xlsx 夾具解析結果是否相同證偽。
3. **匯入時就以 Drive `files.copy` 複製一份，解析與寫回都對這份副本，原檔不動**（負責人裁定；提案輪兩通道同抽「匯出時才複製會用舊座標寫錯格」）／代價：每次匯入都在老師雲端多一份副本、匯入後改原檔須重新匯入／可被探針證偽（副本合併範圍與原檔相同；以 `RAW` 寫入的「=1+1」存成文字）。
4. **保留 xlsx 上傳與 xlsx 下載當備援；移除「知道連結者可檢視」的公開連結下載**：代價：未登入時只能走上傳／下載 xlsx／屬取捨：公開連結下載正是課程補充說明點名的「下載成 xlsx 本機處理」。
5. **題組子題的填空格改為「標籤格右側、仍在作答表頭欄寬內的空白格」**（PR #18 followup，負責人 2026-11-17 裁定併入本卡）：代價：改變現行匯出口徑（`group.xlsx` 答案從 G 欄移到 H 欄），xlsx 與 Sheets 兩條路徑同時改／可被四份夾具（single、group、variant、reference）往返測試證偽。

**矩陣落點**：M-003（R-02）、M-006（R-05）守門加 `server/tests/test_google_sheets.py`、`server/tests/test_api_google.py`，聲明補「直接讀寫雲端 Google Sheets」；新增 M-0xx「Google 權杖永不送往學生端、永不寫入日誌」，守門 `server/tests/test_isolation.py` 新增負例。

**merge 三問第三問**：需求證實——2026-11-17 課程公告明訂 Guided Notes「需直接串接自己雲端線上的 Google Sheets 進行讀寫，而非下載成 .xlsx 檔在本地端離線處理」；現行做法（`server/quiz_server/sources.py:39`「`/export?format=xlsx`」下載＋匯出 xlsx 手動「取代試算表」）不符，不改即 R-02、R-05 不達標。期限 2026-11-30。

## 為什麼

現行 Guided Notes 是「xlsx 往返」：連結匯入實際是伺服器下載 xlsx 再以 openpyxl 解析；匯出產生 xlsx 由老師手動匯回。課程補充說明把這條路判為不符。`docs/product-trd.md` §5 特色第 4 條「xlsx 往返，不需 Google 憑證」須撤回。

## 目標

- `quiz_server/google_auth.py`：OAuth 授權碼＋PKCE、`state` 一次性、權杖（含 refresh token）只存伺服器記憶體。
- `quiz_server/google_sheets.py`：以 Sheets API 讀取值與合併範圍 → 交給 `guided_notes` 解析；複製試算表並以 `values:batchUpdate`（`RAW`）寫入得主答案。
- `guided_notes.py`：解析器改吃「工作表抽象」（openpyxl 工作表與 Sheets 格狀資料共用）；題組子題填空格規則（決策 5）。
- API：Google 登入狀態／登入／回呼／登出、`import-url` 改走 Sheets API、新增「匯出到 Google 試算表」；`contracts/api.md` 同批改（須負責人批准）。
- web：老師頁「以 Google 帳號登入」、從試算表匯入、「匯出到 Google 試算表」（回傳副本連結）；xlsx 上傳／下載保留在「備援」區。
- 文件：`docs/requirements.md` §4 記課程補充說明；`docs/product-trd.md` 改特色第 4 條與架構圖；`README.md`、`.env.example`（`GOOGLE_CLIENT_ID`、`GOOGLE_CLIENT_SECRET`）；`docs/manual-verification.md` 場次 A2、A5 改步驟。
- 門禁：`ops/gate_secrets.py` 加 Google OAuth 用戶端密鑰形狀（`GOCSPX-` 前綴）與 OAuth 權杖形狀（`ya29.`、`1//`）。

## 邊界（本卡不做）

- 服務帳號、多位老師同時登入、權杖落地保存（伺服器重啟即須重新登入）。
- 寫回原試算表本身（負責人裁定：先複製再寫）。
- 讀取或寫回儲存格格式（顏色、字型）；副本格式由複製保留。
- 同意畫面送 Google 審核發布（期末專題維持「測試中」）。
- CSV 匯出（`csv-export`）。

## 驗收

| # | 指令 | 期望輸出 |
|---|---|---|
| 1 | `uv run --project server pytest -q server/tests/test_google_sheets.py` | Sheets 格狀資料替身（由四份夾具轉出）解析結果與 xlsx 解析逐題相同；匯入請求序「標題 → copy → 讀副本」；寫回只打副本、只含作答格、`valueInputOption=RAW`、分頁名跳脫；passed |
| 2 | `uv run --project server pytest -q server/tests/test_api_google.py` | 未登入匯入／匯出回 401「請先以 Google 帳號登入」；`state` 偽造、過期、重放或 cookie 不符回 400；回呼不回顯查詢參數；錯誤碼先後 401→409→400→401→502；非 ended 匯出 409；passed |
| 3 | `uv run --project server pytest -q server/tests/test_isolation.py` | 學生端所有通道與日誌不含 access token、refresh token、client secret；passed |
| 4 | `uv run --project server pytest -q server/tests/test_guided_notes_export.py` | `group.xlsx` 子題答案寫入 H 欄、G 欄標籤不變；single、variant 往返不變；passed |
| 5 | `git grep -nE '"[A-Z]{1,2}[0-9]+"' -- server/quiz_server` | 無輸出（仍無寫死座標） |
| 6 | `git grep -n "export?format=xlsx" -- server web/src` | 無輸出（公開連結下載已移除） |
| 7 | `uv run --project server python probes/google_sheets_probe.py <連結>` | 見 `probes/results/2026-11-17-google-sheets.txt`：登入、讀取、副本、寫入四步皆 OK（實作後真棧再跑一次） |
| 8 | 人工驗證 | 見 tasks 3.x 與 `docs/manual-verification.md` 場次 A2、A5 |

## 實錄結果

見 `verification.md`。
