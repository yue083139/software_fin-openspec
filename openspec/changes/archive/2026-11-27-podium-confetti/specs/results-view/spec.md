## ADDED Requirements

### Requirement: 揭曉領獎台時灑彩帶

前三名領獎台出現時，畫面 MUST 在領獎台卡片內灑一次彩帶動畫；彩帶 MUST NOT 擋住任何按鈕的點擊，MUST 對讀屏軟體隱藏，顏色 MUST 只使用主題變量。同一個領獎台因分數更新重繪時 MUST NOT 重播彩帶；沒有領獎台時 MUST NOT 有彩帶；使用者設定減少動態效果時 MUST NOT 顯示彩帶。

#### Scenario: 揭曉時灑彩帶
- **WHEN** 活動結束且有組別得分，領獎台出現
- **THEN** 領獎台卡片內 MUST 灑一次彩帶

#### Scenario: 名次更新不重播
- **WHEN** 老師在經典搶答結束後按「答錯」使領獎台名次改變
- **THEN** 領獎台 MUST 即時更新且 MUST NOT 再灑彩帶

#### Scenario: 沒有領獎台
- **WHEN** 活動結束但所有組別皆 0 分
- **THEN** 畫面 MUST NOT 有彩帶

#### Scenario: 減少動態效果
- **WHEN** 使用者的系統設定為減少動態效果
- **THEN** 領獎台照常顯示且 MUST NOT 顯示彩帶
