# activity-lifecycle Specification

## Purpose
活動的身分（老師金鑰、組別憑證）、組別設定、階段狀態機與 WebSocket 同步。

## Requirements

### Requirement: 系統必須區分老師與學生兩種身分

系統 MUST 提供老師與學生兩種身分進場。老師 MUST 以伺服器啟動時產生的老師金鑰驗證；學生 MUST 選定一個組別並取得伺服器發出的組別憑證，之後的連線與操作 MUST 以憑證辨識組別，MUST NOT 採信客戶端自報的組別名稱。

#### Scenario: 學生選組進場
- **WHEN** 學生在首頁選擇「第2組」
- **THEN** 學生頁 MUST 顯示所屬組別「第2組」與目前活動階段

#### Scenario: 無金鑰不得使用老師功能
- **WHEN** 未帶老師金鑰或帶錯金鑰呼叫任何老師端 API
- **THEN** 伺服器 MUST 回 401，且活動狀態 MUST NOT 改變

#### Scenario: 同一組只能有一台裝置
- **WHEN** 第1組已有裝置加入，另一台裝置再選第1組
- **THEN** 伺服器 MUST 回 409，直到老師釋放第1組

#### Scenario: 沒有憑證只拿到最少資訊
- **WHEN** 學生連線未帶憑證、帶錯憑證或帶已被撤銷的憑證
- **THEN** 伺服器 MUST 只回傳階段與「組別無效」標記，MUST NOT 回傳任何組別或老師端資料

### Requirement: 活動階段由伺服器狀態機管理並同步給所有使用者

活動階段 MUST 為 `preparing`、`answering`、`judging`、`ended` 之一，只能依轉移表改變；任何階段變更 MUST 推送給所有已連線的老師與學生。開始搶答 MUST 以已匯入題目為前提。

#### Scenario: 老師開始搶答
- **WHEN** 老師在 `preparing` 階段且已匯入題目時按「開始搶答」
- **THEN** 所有已連線的使用者 MUST 收到 `phase=answering` 的狀態更新

#### Scenario: 非法轉移被拒
- **WHEN** 在 `preparing` 階段要求「結束搶答」
- **THEN** 伺服器 MUST 回 409，階段 MUST 維持 `preparing`

#### Scenario: 並發轉移只成功一次
- **WHEN** 同時送出多個「開始搶答」請求
- **THEN** 恰有一個成功，其餘 MUST 回 409

#### Scenario: 經典模式不經過判定階段
- **WHEN** 經典模式下老師結束搶答
- **THEN** 階段 MUST 直接由 `answering` 變為 `ended`

#### Scenario: 未匯入題目不得開始
- **WHEN** 尚未匯入題目時老師按開始
- **THEN** 伺服器 MUST 回 409

### Requirement: 老師可設定組數並重置活動

老師 MUST 能在 `preparing` 階段設定 2 到 12 組；在 `ended` 階段重置活動回到 `preparing`，重置 MUST 清除作答紀錄並保留題目與組別。

#### Scenario: 設定組數
- **WHEN** 老師在 `preparing` 階段設定 5 組
- **THEN** 所有使用者 MUST 收到含 `第1組` 到 `第5組` 的狀態

#### Scenario: 搶答中不得改組數
- **WHEN** 老師在 `answering` 階段設定組數
- **THEN** 伺服器 MUST 回 409
