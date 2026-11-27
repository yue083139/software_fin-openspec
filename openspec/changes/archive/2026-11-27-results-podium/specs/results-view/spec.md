## ADDED Requirements

### Requirement: 活動結束後顯示前三名領獎台

活動結束（`ended`）後，老師畫面與學生結果畫面 MUST 顯示前三名領獎台，依各組分數排名：同分 MUST 同名次、下一名 MUST 跳號（1、1、3），同名次 MUST 依組別順序；名次大於 3 與 0 分的組別 MUST NOT 上台；沒有任何組別得分時 MUST NOT 顯示領獎台。學生畫面 MUST 標出本組。結束前 MUST NOT 顯示領獎台，且領獎台 MUST NOT 使用結束後 view 以外的資料。

#### Scenario: 結束後顯示前三名
- **WHEN** 活動結束，第2組 3 分、第3組 2 分、第1組 1 分
- **THEN** 領獎台 MUST 由左到右顯示第 2 名第3組、第 1 名第2組、第 3 名第1組，並顯示各自分數

#### Scenario: 同分同名次
- **WHEN** 活動結束，第1組與第2組皆 3 分、第3組 1 分
- **THEN** 第1組與第2組 MUST 同為第 1 名，第3組 MUST 為第 3 名，且 MUST NOT 有第 2 名

#### Scenario: 沒有組別得分
- **WHEN** 活動結束且所有組別皆 0 分
- **THEN** 畫面 MUST NOT 顯示領獎台

#### Scenario: 學生看到本組
- **WHEN** 第2組學生在結束後檢視結果，第2組為第 1 名
- **THEN** 第 1 名的第2組旁 MUST 顯示「本組」

#### Scenario: 結束前不顯示
- **WHEN** 活動在搶答中
- **THEN** 老師畫面 MUST NOT 顯示領獎台
