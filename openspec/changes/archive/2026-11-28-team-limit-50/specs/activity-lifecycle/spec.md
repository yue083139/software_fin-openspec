# Spec Delta（v1.0）

## MODIFIED Requirements

### Requirement: 老師可設定組數並重置活動

老師 MUST 能在 `preparing` 階段設定 2 到 50 組；在 `ended` 階段重置活動回到 `preparing`，重置 MUST 清除作答紀錄並保留題目與組別。

#### Scenario: 設定組數
- **WHEN** 老師在 `preparing` 階段設定 5 組
- **THEN** 所有使用者 MUST 收到含 `第1組` 到 `第5組` 的狀態

#### Scenario: 設定五十組
- **WHEN** 老師在 `preparing` 階段設定 50 組
- **THEN** 老師與學生可取得的組別清單 MUST 恰含 `第1組` 到 `第50組`，`第50組` MUST 可加入、釋放與重新加入，且老師結果表 MUST 保留全部 50 組

#### Scenario: 五十組並發送出仍只有一組成功
- **WHEN** 50 組同時送出同一題的答案
- **THEN** 伺服器順位 MUST 唯一且無重號，並恰有一組搶答成功

#### Scenario: 拒絕範圍外或非整數組數
- **WHEN** 老師在 `preparing` 階段設定 1、51、布林值或非整數組數
- **THEN** 伺服器 MUST 回 422，組數與既有活動狀態 MUST NOT 改變

#### Scenario: 搶答中不得改組數
- **WHEN** 老師在 `answering` 階段設定組數
- **THEN** 伺服器 MUST 回 409

#### Scenario: 五十組不放寬作答隔離
- **WHEN** 活動有 50 組且處於 `answering`，第1組的學生接收 REST 回應或 WebSocket 狀態
- **THEN** payload MUST NOT 包含第2組到第50組的答案、是否已送出、順位或判定結果

#### Scenario: 未匯入題目不得開始
- **WHEN** 尚未匯入題目時老師按開始
- **THEN** 伺服器 MUST 回 409
