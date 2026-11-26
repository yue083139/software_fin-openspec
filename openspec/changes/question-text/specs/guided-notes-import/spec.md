## ADDED Requirements

### Requirement: 匯入時可選讀取題目敘述

系統 MUST 在表頭列以別名（題目、題目敘述、問題、題幹、question）尋找可選的題目欄；找到時每個子題的敘述 MUST 取自該子題所在列的題目欄值（縱向合併只取錨點列），找不到時敘述 MUST 為空字串且匯入 MUST 照常成功。敘述 MUST NOT 參與作答格定位與寫回。

#### Scenario: 官方題組範本的子題敘述
- **WHEN** 老師匯入「題組＋單題」範本
- **THEN** 第 1 題的兩個子題 MUST 各有自己那一列的題目敘述，第 3、4 題 MUST 各有一段敘述

#### Scenario: 沒有題目欄
- **WHEN** 匯入的檔案表頭只有題號與作答欄
- **THEN** 匯入 MUST 成功，題數 MUST 與原檔一致，每個子題敘述 MUST 為空字串

#### Scenario: 匯出不受敘述影響
- **WHEN** 老師在結束後匯出
- **THEN** 寫回的儲存格與內容 MUST 與未讀取敘述時相同

## MODIFIED Requirements

### Requirement: 學生端只看得到題號與子題結構

學生 MUST 只收到題號、子題數、子題標籤，以及依階段開放的題目敘述，MUST NOT 收到作答格座標、參考答案或原檔其他內容。題目敘述 MUST 只在搶答開始後送給學生：準備階段 MUST NOT 帶敘述；逐題開放的模式 MUST 只帶已開放過的題；結束後 MUST 帶全部。老師 MUST 在任何階段都看得到敘述。

#### Scenario: 學生看到題目清單
- **WHEN** 老師匯入成功後學生查看畫面
- **THEN** 學生畫面 MUST 依序列出每個題號與其子題輸入欄

#### Scenario: 準備階段看不到敘述
- **WHEN** 活動在準備階段
- **THEN** 學生 view 的每一題 MUST NOT 含 `prompts`

#### Scenario: 開始搶答後看到敘述
- **WHEN** 老師以經典搶答開始搶答
- **THEN** 學生 view 每一題 MUST 含 `prompts`，長度 MUST 等於子題數，且 payload MUST NOT 含他組答案

#### Scenario: 逐題模式只給已開放題
- **WHEN** 時間計分模式只開放了第 1 題
- **THEN** 學生 view 只有第 1 題 MUST 含 `prompts`，其餘題 MUST NOT 含
