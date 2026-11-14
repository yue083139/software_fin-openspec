## MODIFIED Requirements

### Requirement: 搶答結束前學生看不到其他組別的作答狀況

在 `ended` 之前（含 `judging`），任何送往學生的訊息與回應 MUST NOT 包含其他組別的答案、是否已送出、順位或判定結果。

#### Scenario: 他組答案不外洩
- **WHEN** 搶答中第1組送出答案「甲組祕密答案」
- **THEN** 第2組經 WebSocket、REST 成功回應與錯誤回應收到的所有內容 MUST NOT 含「甲組祕密答案」

#### Scenario: 他組送出不觸發推播
- **WHEN** 搶答中第1組送出答案
- **THEN** 第2組的連線 MUST NOT 收到任何訊息

#### Scenario: 冒用組別參數
- **WHEN** 第2組的裝置把連線參數改成第1組但沒有第1組的憑證
- **THEN** 該連線 MUST 只收到最少資訊

#### Scenario: 判定中仍隔離
- **WHEN** 判定中老師把第1組的送出判為正確
- **THEN** 第2組 MUST NOT 收到任何訊息，其畫面狀態 MUST NOT 含第1組答案或任何判定結果

#### Scenario: 結束後可見
- **WHEN** 活動進入 `ended`
- **THEN** 第2組收到的狀態 MUST 可含其他組別的答案

### Requirement: 最快送出的組別為該題搶答成功者

每題的順位 MUST 依伺服器接收並記錄的先後決定，MUST NOT 採信客戶端時間。經典搶答模式下，順位 1 的組別 MUST 為該題搶答成功者；需老師判定對錯的模式下，搶答成功者 MUST 為依順位最早被判正確的組別（見 game-modes）。

#### Scenario: 先送出者得題
- **WHEN** 經典模式下第2組先、第1組後送出第 1 題
- **THEN** 第 1 題的搶答成功者 MUST 為第2組

#### Scenario: 並發送出
- **WHEN** 四組同時送出同一題
- **THEN** 恰一組 MUST 為順位 1，四組的順位 MUST 為 1 到 4 且不重複

#### Scenario: 判定模式取最早的正確答案
- **WHEN** 只計對錯模式下第1組先送出被判錯誤、第2組後送出被判正確
- **THEN** 第 1 題的搶答成功者 MUST 為第2組
