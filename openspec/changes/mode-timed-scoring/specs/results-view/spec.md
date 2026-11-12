## MODIFIED Requirements

### Requirement: 學生在搶答結束後可檢視結果

搶答結束後，學生畫面 MUST 顯示每題的得主組別與其答案、所有組別的答案與順位、各組分數；判定模式 MUST 另顯示每筆的對錯。結束前 MUST NOT 提供任何結果資料，唯一例外是時間計分模式下已揭曉題目的**本組**對錯、得分、累積分數與各組名次（見 timed-scoring）。

#### Scenario: 結束後檢視
- **WHEN** 活動進入 `ended`
- **THEN** 每個學生畫面 MUST 顯示每題的得主組別與得主答案

#### Scenario: 結束前沒有結果
- **WHEN** 活動在 `answering` 或 `judging` 階段
- **THEN** 送往學生的狀態 MUST NOT 含 `results` 與 `team_scores` 欄位

#### Scenario: 時間計分揭曉只含本組結果與名次
- **WHEN** 時間計分模式下第 1 題已揭曉、活動仍在 `answering`
- **THEN** 送往第2組的狀態 MUST 只含第2組第 1 題的對錯與得分、第2組累積分數與各組名次，MUST NOT 含他組答案或分數
