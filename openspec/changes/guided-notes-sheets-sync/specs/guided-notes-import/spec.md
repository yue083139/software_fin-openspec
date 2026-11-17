## REMOVED Requirements

### Requirement: 老師可從 xlsx 檔或 Google Sheets 連結匯入 Guided Notes
**Reason**: 2026-11-17 課程補充說明：Guided Notes 須直接串接雲端 Google Sheets 讀寫，不得下載成 .xlsx 本機處理；原需求的「公開連結下載 `/export?format=xlsx`」情境正屬此類。
**Migration**: 改由「老師可上傳 xlsx 或以 Google 帳號直接讀取 Google 試算表匯入 Guided Notes」取代；上傳 xlsx 行為不變。

## ADDED Requirements

### Requirement: 老師可上傳 xlsx 或以 Google 帳號直接讀取 Google 試算表匯入 Guided Notes

系統 MUST 接受老師上傳的 xlsx 檔，或在老師已以 Google 帳號登入時接受 Google Sheets 連結作為題目來源；以連結匯入時 MUST 以 Google Sheets API 直接讀取雲端試算表的儲存格值與合併範圍，MUST NOT 下載成 xlsx 檔再解析。匯入 MUST 只在 `preparing` 階段允許，成功後 MUST 取代既有題目並推送給所有使用者。

#### Scenario: 上傳官方題組範本
- **WHEN** 老師上傳官方「題組＋單題」範本
- **THEN** 題目清單 MUST 為 4 題，第 1、2 題各含 2 個子題，第 3、4 題各含 1 個子題

#### Scenario: 以 Google 試算表連結匯入
- **WHEN** 已登入的老師貼上「題組＋單題」範本的 `https://docs.google.com/spreadsheets/d/<id>/edit#gid=0`
- **THEN** 伺服器 MUST 以 Sheets API 讀取該分頁的值與合併範圍，題目清單與作答格位置 MUST 與上傳同一範本的 xlsx 相同
- **AND** 伺服器 MUST NOT 對 `/export?format=xlsx` 發出請求

#### Scenario: 未登入不得以連結匯入
- **WHEN** 老師未以 Google 帳號登入就以連結匯入
- **THEN** 伺服器 MUST 回 401「請先以 Google 帳號登入」，題目 MUST NOT 改變

#### Scenario: 非 Google 試算表的連結被拒
- **WHEN** 老師貼上非 `https://docs.google.com/spreadsheets/d/<id>` 形式的連結
- **THEN** 伺服器 MUST 回 400 且 MUST NOT 對任何主機發出請求

#### Scenario: 搶答中不得匯入
- **WHEN** 老師在 `answering` 階段匯入
- **THEN** 伺服器 MUST 回 409，題目 MUST NOT 改變

### Requirement: 題組子題標籤格右側的空白格為填空格

作答格含非佔位符標籤、本身不屬合併範圍，且同列右側相鄰格落在作答表頭合併範圍的欄寬內、空白且不屬合併範圍時，系統 MUST 以該右側格為填空格，並以標籤格文字作為子題標籤。判斷 MUST 只依表頭合併範圍與儲存格內容，MUST NOT 寫死欄位。

#### Scenario: 官方題組範本的子題填空格
- **WHEN** 匯入官方「題組＋單題」範本（作答表頭橫跨兩欄、子題列左格為「（1）」右格空白）
- **THEN** 第 1 題兩個子題的填空格 MUST 為標籤右側的空白格，子題標籤 MUST 為「（1）」「（2）」

#### Scenario: 單題作答格不受影響
- **WHEN** 匯入官方「單題」範本（作答格本身為橫向合併範圍）
- **THEN** 每題填空格 MUST 為該合併範圍左上角，與本規則實施前相同
