## ADDED Requirements

### Requirement: 老師可即時檢視作答狀況與搶答結果

老師畫面 MUST 在任何階段顯示每題每組的送出答案與順位，並標示每題的搶答成功組別與各組得題數；有新的送出時 MUST 即時更新。

#### Scenario: 搶答中即時更新
- **WHEN** 搶答中第3組送出第 2 題
- **THEN** 老師畫面 MUST 立即顯示第 2 題第3組的答案與順位

#### Scenario: 顯示得主
- **WHEN** 第 2 題已有兩組送出
- **THEN** 老師畫面 MUST 標示順位 1 的組別為搶答成功

### Requirement: 學生在搶答結束後可檢視結果

搶答結束後，學生畫面 MUST 顯示每題的搶答成功組別與其答案、所有組別的答案與順位、各組得題數；結束前 MUST NOT 提供任何結果資料。

#### Scenario: 結束後檢視
- **WHEN** 老師結束搶答
- **THEN** 每個學生畫面 MUST 顯示每題的得主組別與得主答案

#### Scenario: 結束前沒有結果
- **WHEN** 活動在 `answering` 階段
- **THEN** 送往學生的狀態 MUST NOT 含結果欄位

### Requirement: 老師與學生看到的結果一致

老師畫面與學生畫面的搶答結果 MUST 由同一個判定規則產生，得主 MUST 一致。

#### Scenario: 一致性
- **WHEN** 搶答結束
- **THEN** 每題在老師畫面與學生畫面的得主組別 MUST 相同
