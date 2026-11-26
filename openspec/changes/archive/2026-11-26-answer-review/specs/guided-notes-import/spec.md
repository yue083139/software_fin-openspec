## MODIFIED Requirements

### Requirement: 老師可上傳 xlsx 或以 Google 帳號直接讀取 Google 試算表匯入 Guided Notes

系統 MUST 接受老師上傳的 xlsx 檔，或在老師已以 Google 帳號登入時接受 Google Sheets 連結作為題目來源；以連結匯入時 MUST 以 Google Sheets API 直接讀取雲端試算表的儲存格值與合併範圍，MUST NOT 下載成 xlsx 檔再解析。匯入 MUST 只在 `preparing` 階段允許，成功後 MUST 取代既有題目並推送給所有使用者。

#### Scenario: 上傳官方題組範本
- **WHEN** 老師上傳官方「題組＋單題」範本
- **THEN** 題目清單 MUST 為 4 題，第 1、2 題各含 2 個子題，第 3、4 題各含 1 個子題

#### Scenario: 以 Google 試算表連結匯入
- **WHEN** 已登入的老師貼上「題組＋單題」範本的 `https://docs.google.com/spreadsheets/d/<id>/edit#gid=0`
- **THEN** 伺服器 MUST 先以 Drive 複製一份「<原標題>_作答情況」副本，再以 Sheets API 讀取副本該分頁的值與合併範圍，題目清單與作答格位置 MUST 與上傳同一範本的 xlsx 相同，回應 MUST 含副本連結
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
