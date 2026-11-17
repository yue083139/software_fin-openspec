# guided-notes-sheets-sync — tasks（v1.2）

## 0. 提案前置（探針與裁定，未完成不送提案輪評審）
- [x] 0.1 負責人在 Google Cloud Console 建專案、啟用 Google Sheets API 與 Google Drive API、建「網頁應用程式」OAuth 用戶端（重新導向 URI `http://127.0.0.1:8000/api/google/callback`）、同意畫面「測試中」並登記測試使用者；`GOOGLE_CLIENT_ID`、`GOOGLE_CLIENT_SECRET` 寫入本機 `.env`（不入庫）
- [x] 0.2 負責人把「題組＋單題」範本複製到自己雲端硬碟，執行 `uv run --project server python probes/google_sheets_probe.py <試算表連結>`，原樣輸出存 `probes/results/<日期>-google-sheets.txt`（輸出已遮蔽權杖與 id）
- [x] 0.3 依探針結果定 design D1 權限範圍、D3 候選 A／B，回改 design 證偽欄（附輸出摘錄）
- [x] 0.4 `make probe-guided-notes` 確認 variant.xlsx 無「標籤格右側空白格」結構（D5 影響範圍）
- [x] 0.5 `docs/parity.md` §4 登記本卡、§5 記變更；SpecKit 組同批起稿（`specs/010-guided-notes-sheets-sync/`）
- [x] 0.6 提案輪評審（紅隊＋架構雙通道，1 輪，皆 CLEARED 0 阻斷）；藥方併入 v1.2；負責人 2026-11-17 裁定並批准 `contracts/api.md` 改動（D7）
- [ ] 0.7 探針補 `openid email`、refresh 換新、撤銷（表單本體）三步；負責人重跑，原樣輸出存 `probes/results/`，回填 D1 證偽欄

## 1. 驗收測試（先寫，先紅）
- [x] 1.1 `server/tests/test_google_sheets.py`：四份夾具轉成 Sheets 格狀資料替身，解析結果與 xlsx 逐題相同；`effectiveValue` 題號負例；匯入請求序「標題 → copy → 讀副本」、解析失敗刪副本；寫回只打副本、只含作答格、`RAW`、分頁名 `'` 跳脫
- [x] 1.2 `server/tests/test_api_google.py`：登入網址含 `prompt=consent`、PKCE、cookie；回呼 `state` 偽造／過期／重放／cookie 不符 400、不回顯參數；無 refresh token 時過期後 401；登出撤銷權杖在本體；錯誤碼先後；未登入匯入與寫回 401 且 0 次對外請求；以 `httpx.MockTransport` 替身，不連網
- [x] 1.3 `server/tests/test_isolation.py`：老師以假權杖完成登入、匯入、寫回、換新、登出（含撤銷失敗）後，學生 WebSocket／REST 完整 payload 與 caplog 不含權杖、授權碼、client secret
- [x] 1.4 `server/tests/test_guided_notes_parse.py`、`test_guided_notes_export.py`：group 子題填空格改為 H 欄、G 欄標籤不變；single、variant 不變
- [x] 1.5 `server/tests/test_api_import.py`：刪除公開連結下載相關測試，改為「未登入連結匯入 401」
- [x] 1.6 `eval/acceptance/matrix.yaml`：M-003、M-006 守門與聲明更新；新增權杖不外洩一行

## 2. 實作
- [x] 2.1 `guided_notes.py`：`Grid` 介面＋openpyxl 轉接器；D5 填空格規則；`write_answers` 不變介面
- [x] 2.2 `google_auth.py`：授權網址（`prompt=consent`）、PKCE、`state` 一次性 10 分鐘＋cookie 綁定、換權杖、email、自動換新、撤銷（表單本體）
- [x] 2.3 `google_sheets.py`：讀格狀資料 → `Grid`（`effectiveValue` 優先）；匯入時複製並讀副本；`values:batchUpdate`
- [x] 2.4 `sources.py`：刪 `export_url`、`download_sheet`，保留上傳檢查與試算表 id 解析
- [x] 2.5 `app.py`：D7 端點；`activity.py` `source_sheet_id`；`__main__.py` 讀 `.env`；老師與學生 view 不增欄位
- [x] 2.6 `contracts/api.md`（負責人批准後）
- [x] 2.7 web：Google 登入區、從試算表匯入、匯出到 Google 試算表（顯示副本連結）、xlsx 備援區；`types.ts`、`api.ts` 與元件測試
- [x] 2.8 `ops/gate_secrets.py` 加 `GOCSPX-`、`ya29.`、`1//` 形狀＋變異實錄
- [x] 2.9 文件：`docs/requirements.md` §4 記課程補充說明（v1.2 已同批寫入）；`docs/product-trd.md` 特色第 4 條、流程與架構圖；`README.md` Google 設定步驟；`.env.example`

## 3. 驗證
- [x] 3.1 `make gate` 原樣輸出、變異實錄寫入 `verification.md`
- [x] 3.2 真棧探針：`make dev` 實際登入、匯入、寫回一次，輸出存 `probes/results/`
- [ ] 3.3 人工驗證：改寫 `docs/manual-verification.md` 場次 A2 第 6 步、A5 第 16～18 步，交組員重驗並回填
- [x] 3.4 `docs/parity.md` 狀態更新、`make gate-parity SIBLING=../software_fin-speckit` 綠
