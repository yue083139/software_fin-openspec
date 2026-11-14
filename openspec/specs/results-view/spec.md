# results-view Specification

## Purpose
老師在任何階段即時檢視每題每組的答案、順位與得主，以及學生只在搶答結束後才能檢視結果、且雙方結果一致的規則。

## Requirements

### Requirement: 老師可即時檢視作答狀況與搶答結果

老師畫面 MUST 在任何階段顯示每題每組的送出答案與順位，並標示每題的得主與各組分數；有新的送出或判定時 MUST 即時更新。判定模式下老師畫面 MUST 另顯示每筆的判定結果、判定建議與每題參考答案。

#### Scenario: 搶答中即時更新
- **WHEN** 搶答中第3組送出第 2 題
- **THEN** 老師畫面 MUST 立即顯示第 2 題第3組的答案與順位

#### Scenario: 顯示得主
- **WHEN** 經典模式下第 2 題已有兩組送出
- **THEN** 老師畫面 MUST 標示順位 1 的組別為搶答成功

#### Scenario: 判定中顯示建議
- **WHEN** 判定中某筆送出與參考答案相同
- **THEN** 老師畫面 MUST 在該格顯示建議「正確」

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

### Requirement: 老師與學生看到的結果一致

老師畫面與學生畫面的搶答結果 MUST 由同一個判定規則產生，得主 MUST 一致。

#### Scenario: 一致性
- **WHEN** 搶答結束
- **THEN** 每題在老師畫面與學生畫面的得主組別 MUST 相同
