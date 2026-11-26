## ADDED Requirements

### Requirement: 老師可把題目設為雙倍分數

老師 MUST 能在 `preparing` 階段把任一題的倍率設為 1 或 2；其他階段 MUST 回 409，其他倍率 MUST 回 422，不存在的題號 MUST 回 404。重新匯入題目 MUST 把所有倍率重設為 1；重置活動 MUST 保留倍率。

#### Scenario: 設定雙倍
- **WHEN** 老師在準備階段把第 2 題設為雙倍
- **THEN** 老師與學生畫面的第 2 題 MUST 標示「雙倍分數」

#### Scenario: 搶答中不可改
- **WHEN** 老師在 `answering` 階段設定倍率
- **THEN** 伺服器 MUST 回 409，倍率 MUST 不變

#### Scenario: 重新匯入清除
- **WHEN** 第 2 題設為雙倍後老師重新匯入題目
- **THEN** 所有題目的倍率 MUST 為 1

### Requirement: 雙倍分數題的得分加倍

任何模式下，倍率為 2 的題目每筆得分 MUST 為倍率 1 時的兩倍，得主 MUST 不變。分數欄名 MUST 在「經典搶答且所有倍率為 1」時為「得題數」，其餘為「得分」。

#### Scenario: 經典搶答雙倍
- **WHEN** 經典模式第 2 題為雙倍，第1組最先送出
- **THEN** 第1組在第 2 題 MUST 得 2 分，分數欄名 MUST 為「得分」

#### Scenario: 只計對錯雙倍
- **WHEN** 只計對錯模式第 2 題為雙倍，第1組被判正確
- **THEN** 第1組在第 2 題 MUST 得 2 分
