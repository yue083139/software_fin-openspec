# buzz-answering Specification

## Purpose
各組以組別憑證送出答案、伺服器依接收序判定順位與搶答成功者，以及搶答結束前不讓學生看到他組作答狀況的作答隔離規則。

## Requirements

### Requirement: 學生在搶答開始後以組別為單位送出答案

學生 MUST 只能在 `answering` 階段送出；每組每題 MUST 只能送出一次；題組 MUST 一次送出全部子題。

#### Scenario: 搶答開始前不得送出
- **WHEN** 學生在 `preparing` 階段送出答案
- **THEN** 伺服器 MUST 回 409 且不記錄

#### Scenario: 同組重複送出
- **WHEN** 第1組已送出第 3 題後再次送出第 3 題
- **THEN** 伺服器 MUST 回 409，第一次的答案 MUST 保持不變

#### Scenario: 題組缺子題
- **WHEN** 第 1 題有 2 個子題而學生只送出 1 個答案
- **THEN** 伺服器 MUST 回 422 且不記錄

#### Scenario: 含控制字元的答案
- **WHEN** 學生送出含控制字元的答案
- **THEN** 伺服器 MUST 回 422 且不記錄

#### Scenario: 沒有組別憑證不得送出
- **WHEN** 送出請求未帶或帶錯組別憑證
- **THEN** 伺服器 MUST 回 403 且不記錄

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

### Requirement: 搶答結束後不再接受送出

老師結束搶答後，伺服器 MUST NOT 再接受任何送出。

#### Scenario: 結束後送出被拒
- **WHEN** 老師結束搶答後學生送出
- **THEN** 伺服器 MUST 回 409
