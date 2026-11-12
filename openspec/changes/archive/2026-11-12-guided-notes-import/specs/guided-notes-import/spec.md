## ADDED Requirements

### Requirement: 老師可從 xlsx 檔或 Google Sheets 連結匯入 Guided Notes

系統 MUST 接受老師上傳的 xlsx 檔或「知道連結者可檢視」的 Google Sheets 連結作為題目來源；匯入 MUST 只在 `preparing` 階段允許，成功後 MUST 取代既有題目並推送給所有使用者。

#### Scenario: 上傳官方題組範本
- **WHEN** 老師上傳官方「題組＋單題」範本
- **THEN** 題目清單 MUST 為 4 題，第 1、2 題各含 2 個子題，第 3、4 題各含 1 個子題

#### Scenario: 貼上 Google Sheets 連結
- **WHEN** 老師貼上 `https://docs.google.com/spreadsheets/d/<id>/edit#gid=0`
- **THEN** 伺服器 MUST 由 `https://docs.google.com/spreadsheets/d/<id>/export?format=xlsx&gid=0` 下載並以同一規則解析

#### Scenario: 非 Google 主機的連結被拒
- **WHEN** 老師貼上非 `docs.google.com` 或非 https 的連結
- **THEN** 伺服器 MUST 回 400 且 MUST NOT 對該主機發出請求

#### Scenario: 轉址到非 Google 主機被拒
- **WHEN** 下載過程中被轉址到非 Google 網域的主機
- **THEN** 伺服器 MUST 中止下載、MUST NOT 對該主機發出請求並回 400

#### Scenario: 搶答中不得匯入
- **WHEN** 老師在 `answering` 階段匯入
- **THEN** 伺服器 MUST 回 409，題目 MUST NOT 改變

### Requirement: 解析必須以表頭與合併範圍動態定位，不得依賴固定座標

系統 MUST 以表頭文字找出題號欄與作答欄，以題號儲存格的合併範圍判定每題涵蓋的列，並以每列作答欄的儲存格作為作答格；題數 MUST 與原檔一致。

#### Scenario: 版面位移與表頭改名
- **WHEN** 匯入表頭位於第 8 列、從 C 欄開始、欄名為「編號／題目敘述／答案」的檔案
- **THEN** 題數與每題的作答格位置 MUST 與檔案內容一致

#### Scenario: 找不到表頭
- **WHEN** 匯入的檔案沒有同時含題號類與作答類名稱的列
- **THEN** 伺服器 MUST 回 400，訊息 MUST 列出可用的表頭名稱，題目 MUST NOT 改變

#### Scenario: 某題沒有作答格
- **WHEN** 某個題號所在列的作答欄不存在儲存格範圍
- **THEN** 伺服器 MUST 回 400 並指出題號

### Requirement: 學生端只看得到題號與子題結構

學生 MUST 只收到題號、子題數與子題標籤，MUST NOT 收到作答格座標或原檔內容。

#### Scenario: 學生看到題目清單
- **WHEN** 老師匯入成功後學生查看畫面
- **THEN** 學生畫面 MUST 依序列出每個題號與其子題輸入欄
