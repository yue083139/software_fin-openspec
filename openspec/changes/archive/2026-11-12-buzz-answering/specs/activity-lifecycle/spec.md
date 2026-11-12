## MODIFIED Requirements

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
