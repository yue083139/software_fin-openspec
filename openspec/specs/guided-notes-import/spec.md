# guided-notes-import Specification

## Purpose
以表頭文字與合併範圍動態定位，從 xlsx 檔或 Google 試算表連結匯入 Guided Notes 為題目清單，且學生只看得到題號與子題結構的規則。

## Requirements

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

### Requirement: 匯入時可選讀取參考答案欄

系統 MUST 在題號欄與作答欄所在的表頭列尋找參考答案欄（名稱：參考答案、正確答案、標準答案、解答、Answer Key，比對方式同其他表頭）；找到時 MUST 以每個作答格同一列的參考答案欄儲存格為該子題的參考答案，空白視為沒有參考答案；找不到 MUST NOT 影響匯入。

#### Scenario: 含參考答案欄
- **WHEN** 匯入表頭為「題號／題目／作答／參考答案」的檔案
- **THEN** 每個子題的參考答案 MUST 等於同列參考答案欄的內容

#### Scenario: 沒有參考答案欄
- **WHEN** 匯入課程提供的單題範本
- **THEN** 匯入 MUST 成功，所有子題 MUST 沒有參考答案

### Requirement: 老師可上傳 xlsx 或以 Google 帳號直接讀取 Google 試算表匯入 Guided Notes

系統 MUST 接受老師上傳的 xlsx 檔，或在老師已以 Google 帳號登入時接受 Google Sheets 連結作為題目來源；以連結匯入時 MUST 以 Google Sheets API 直接讀取雲端試算表的儲存格值與合併範圍，MUST NOT 下載成 xlsx 檔再解析。匯入 MUST 只在 `preparing` 階段允許，成功後 MUST 取代既有題目並推送給所有使用者。

#### Scenario: 上傳官方題組範本
- **WHEN** 老師上傳官方「題組＋單題」範本
- **THEN** 題目清單 MUST 為 4 題，第 1、2 題各含 2 個子題，第 3、4 題各含 1 個子題

#### Scenario: 以 Google 試算表連結匯入
- **WHEN** 已登入的老師貼上「題組＋單題」範本的 `https://docs.google.com/spreadsheets/d/<id>/edit#gid=0`
- **THEN** 伺服器 MUST 先以 Drive 複製一份「<原標題>-搶答結果」副本，再以 Sheets API 讀取副本該分頁的值與合併範圍，題目清單與作答格位置 MUST 與上傳同一範本的 xlsx 相同，回應 MUST 含副本連結
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
