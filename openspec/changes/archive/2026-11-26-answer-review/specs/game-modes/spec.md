## MODIFIED Requirements

### Requirement: 老師可在準備階段選擇遊戲模式

系統 MUST 提供「經典搶答」（預設）、「只計對錯」與「時間計分」三種模式；老師 MUST 只能在 `preparing` 階段切換模式，重置活動 MUST 保留目前模式。所有使用者的畫面 MUST 顯示目前模式名稱。

#### Scenario: 切換為只計對錯
- **WHEN** 老師在準備階段選擇「只計對錯」
- **THEN** 老師與學生畫面 MUST 顯示模式「只計對錯」

#### Scenario: 搶答中不可切換
- **WHEN** 老師在 `answering` 階段要求切換模式
- **THEN** 伺服器 MUST 回 409，模式 MUST 不變

#### Scenario: 未知模式
- **WHEN** 老師要求切換為不存在的模式
- **THEN** 伺服器 MUST 回 422

#### Scenario: 經典搶答行為不變
- **WHEN** 模式為經典搶答，且老師在結束後沒有檢查任何題
- **THEN** 送出、順位、結果與匯出 MUST 與第一期行為相同

#### Scenario: 經典搶答結束後的檢查只改得主
- **WHEN** 模式為經典搶答，老師在結束後判錯某題順位 1
- **THEN** 送出與順位 MUST 不變，該題得主、分數與匯出 MUST 依 buzz-answering 遞補
