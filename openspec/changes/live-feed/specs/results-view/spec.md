## ADDED Requirements

### Requirement: 搶答中老師頁即時跳出搶答快訊

搶答中（`answering`）有組別新送出某題時，老師畫面 MUST 在右上角跳出快訊：經典搶答的第 1 順位 MUST 顯示「<組別> 搶下第 N 題！」，其餘 MUST 顯示「<組別> 送出第 N 題」。快訊 MUST NOT 含答案內容。老師頁開啟或重連後收到的第一個畫面 MUST NOT 跳出快訊；非搶答中 MUST NOT 跳出快訊；學生畫面 MUST NOT 有快訊。

#### Scenario: 搶下題目
- **WHEN** 經典搶答中第2組第一個送出第 3 題
- **THEN** 老師畫面 MUST 跳出「第2組 搶下第 3 題！」

#### Scenario: 後到的送出
- **WHEN** 第2組已送出第 3 題後第1組也送出第 3 題
- **THEN** 老師畫面 MUST 跳出「第1組 送出第 3 題」

#### Scenario: 判定類模式
- **WHEN** 只計對錯模式中第1組第一個送出第 2 題
- **THEN** 老師畫面 MUST 跳出「第1組 送出第 2 題」而非「搶下」

#### Scenario: 重新整理不重跳
- **WHEN** 老師在搶答中重新整理老師頁
- **THEN** 已有的送出 MUST NOT 再跳出快訊

#### Scenario: 快訊不含答案
- **WHEN** 任何快訊跳出
- **THEN** 快訊文字 MUST NOT 包含該組的答案
