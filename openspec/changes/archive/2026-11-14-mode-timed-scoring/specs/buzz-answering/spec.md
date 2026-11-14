## MODIFIED Requirements

### Requirement: 搶答結束前學生看不到其他組別的作答狀況

在 `ended` 之前（含 `judging`），任何送往學生的訊息與回應 MUST NOT 包含其他組別的答案、是否已送出、順位或判定結果；唯一例外是時間計分模式下依**已揭曉題目**累積分數排出的各組名次（不含他組分數；負責人 2026-11-12 裁定）。

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

#### Scenario: 排行榜只含已揭曉題目的分數
- **WHEN** 時間計分模式下第 2 題已判定但尚未揭曉
- **THEN** 第2組收到的名次 MUST NOT 反映第 2 題的判定結果

#### Scenario: 結束後可見
- **WHEN** 活動進入 `ended`
- **THEN** 第2組收到的狀態 MUST 可含其他組別的答案
