# guided-notes-import — 匯入 Guided Notes 並動態辨識題號、題組與作答格（v1.1）

檔位：**S**（Guided Notes 解析口徑）｜主人：@yue083139｜parity：`docs/parity.md` §4 `guided-notes-import`｜需求：R-02、X-01｜依賴：`app-skeleton`

## 首屏決策摘要

1. **以表頭文字定位欄、以合併範圍定位題組**：選了掃描前 50 列找同時含「題號」類與「作答」類別名的表頭列，題號格的縱向合併範圍＝該題的列範圍，範圍內每列的作答格＝一個填空格／代價：表頭別名之外的寫法需要加別名／可被三份版面不同夾具（官方單題、官方題組、自製位移改名檔）的題數與作答格位置測試證偽。
2. **兩種來源：上傳 xlsx 與貼 Google Sheets 連結**：選了連結轉 `/export?format=xlsx` 由伺服器下載（免憑證）／代價：試算表須設「知道連結者可檢視」／可被探針證偽（`probes/results/2026-11-11-sheets-export.txt`：公開範本 200 xlsx、不存在 id 404）。
3. **匯入時記下每個作答格的實際位置（工作表＋座標），匯出依此寫回**：代價：記憶體多存原檔位元組／可被匯出卡的往返測試證偽；不以題號推算座標（`docs/discipline-precedents.md`「Guided Notes 動態定位」）。
4. **題組＝一題多個作答格，學生必須一次送出全部子題**（X-01）。

**矩陣落點**：M-003 守門改為 `server/tests/test_guided_notes_parse.py`、`server/tests/test_api_import.py`，狀態 covered。

**merge 三問第三問**：需求證實——R-02 必做；X-01 題組範本由課程提供，助教測試檔可能含題組，不支援即匯入失敗。

## 目標

- `quiz_server/guided_notes.py`：`parse_workbook(bytes) -> ParsedNotes`（題號、每題作答格位置與既有標籤）。
- `POST /api/teacher/import`（上傳）、`POST /api/teacher/import-url`（Google Sheets 連結）；只在 `preparing` 階段。
- 老師頁匯入區（檔案／連結）與題目清單（題號、子題數）；學生頁顯示題號清單。
- 自製變形夾具 `tests/fixtures/guided-notes/variant.xlsx` 與產生腳本。

## 邊界（本卡不做）

讀取題目敘述（R-02 明訂不要求）、參考答案欄、`.xls`／`.csv`／`.ods` 格式、Google OAuth 直接讀私人試算表、匯出（`guided-notes-export`）。

## 驗收

| # | 指令 | 期望輸出 |
|---|---|---|
| 1 | `uv run --project server pytest -q server/tests/test_guided_notes_parse.py` | single＝6 題各 1 格；group＝4 題，第 1、2 題各 2 格；variant＝5 題，子題數 [1,3,1,2,1]；作答格位置與夾具一致；無表頭／無題號／題號重複／某題無作答格 ⇒ 可辨識錯誤；passed |
| 2 | `uv run --project server pytest -q server/tests/test_api_import.py` | 上傳成功後所有連線收到題目；非 preparing 階段 409；非 xlsx 400；連結匯入以替身傳輸層驗 URL 改寫、非 Google 主機 400、下載非 xlsx 400；passed |
| 3 | `git grep -nE '"[A-Z]{1,2}[0-9]+"' -- server/quiz_server` | 無輸出（定位邏輯無寫死座標） |
| 4 | 人工驗證 | 以官方兩份範本與 variant.xlsx 各匯入一次，題目清單與原檔一致 |

## 實錄結果

見 `verification.md`。
