## MODIFIED Requirements

### Requirement: 老師可把搶答成功的答案匯出至原 Guided Notes

搶答結束後，若題目來自 Google 試算表，老師 MUST 能把結果寫回雲端：系統 MUST 在匯入時就複製一份原試算表並解析該副本，結束後再以 Google Sheets API 把每題搶答成功組別的答案寫入副本中該題的填空格，原試算表 MUST NOT 被修改；老師 MUST 也能改下載 xlsx 作為備援。題目來自上傳 xlsx 時，老師 MUST 能下載寫好答案的 xlsx。題組的每個子題答案 MUST 寫入對應的子題填空格。搶答成功者以老師檢查後的結果為準（見 buzz-answering）；寫回 Google 試算表 MUST 寫入目前有搶答成功者的作答格，並 MUST 把上次寫回寫過、這次已無搶答成功者的作答格還原為匯入時的原內容；沒有搶答成功者且從未寫過的作答格 MUST NOT 被寫入。匯出與寫回 MUST 依序執行，不得交錯。

#### Scenario: 寫回 Google 試算表副本
- **WHEN** 題目以 Google 試算表連結匯入、搶答結束後老師按「匯出到 Google 試算表」
- **THEN** 伺服器 MUST 把得主答案寫入匯入時建立的「<原標題>_作答情況」副本並回傳其連結，副本中每題填空格 MUST 為得主答案，原試算表 MUST 不變

#### Scenario: 匯入後原試算表被改動不影響寫回位置
- **WHEN** 匯入後老師在原試算表第 5 列上方插入一列，結束後寫回
- **THEN** 答案 MUST 寫入副本中匯入時解析出的填空格，MUST NOT 對原試算表發出任何請求

#### Scenario: 單題寫回
- **WHEN** 第2組搶得單題範本第 3 題並答「位址」，老師匯出
- **THEN** 匯出結果中第 3 題的填空格內容 MUST 為「位址」

#### Scenario: 題組寫回保留標籤
- **WHEN** 第1組搶得題組範本第 1 題並答「CPU」「作業系統」，老師匯出
- **THEN** 第 1 題兩個子題標籤格 MUST 仍為「（1）」「（2）」，其右側填空格 MUST 分別為「CPU」與「作業系統」

#### Scenario: 公式形式的答案以文字寫入
- **WHEN** 得主答案為「=1+1」
- **THEN** 匯出結果該填空格 MUST 為文字「=1+1」，MUST NOT 為公式或計算結果

#### Scenario: 無人搶答的題目不變
- **WHEN** 某題沒有任何組別送出
- **THEN** 匯出結果中該題填空格 MUST 與原檔相同

#### Scenario: 匯出寫入檢查後選定的答案
- **WHEN** 經典搶答結束後老師把第 3 題順位 1 判錯、順位 2 的第1組判對，老師匯出
- **THEN** 匯出結果中第 3 題填空格 MUST 為第1組的答案

#### Scenario: 重新匯出清除已判錯的答案
- **WHEN** 老師寫回 Google 試算表後，把第 3 題所有組別判錯並再次寫回
- **THEN** 副本中第 3 題填空格 MUST 回到匯入時的原內容

#### Scenario: 下載檔名
- **WHEN** 老師下載以 `group.xlsx` 匯入的結果
- **THEN** 檔名 MUST 為 `group_作答情況.xlsx`
