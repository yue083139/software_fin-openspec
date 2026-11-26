# guided-notes-export Specification

## Purpose
搶答結束後，把每題得主的答案依匯入時記下的作答格位置寫回原 Guided Notes，並以 xlsx 檔下載的規則。

## Requirements

### Requirement: 老師可把搶答成功的答案匯出至原 Guided Notes

搶答結束後，若題目來自 Google 試算表，老師 MUST 能把結果寫回雲端：系統 MUST 在匯入時就複製一份原試算表並解析該副本，結束後再以 Google Sheets API 把每題搶答成功組別的答案寫入副本中該題的填空格，原試算表 MUST NOT 被修改；老師 MUST 也能改下載 xlsx 作為備援。題目來自上傳 xlsx 時，老師 MUST 能下載寫好答案的 xlsx。題組的每個子題答案 MUST 寫入對應的子題填空格。搶答成功者以老師檢查後的結果為準（見 buzz-answering）；寫回 Google 試算表 MUST 寫入目前有搶答成功者的作答格，並 MUST 把上次寫回寫過、這次已無搶答成功者的作答格還原為匯入時的原內容；沒有搶答成功者且從未寫過的作答格 MUST NOT 被寫入。「上次寫過」的紀錄 MUST 在重置活動時保留（仍寫同一份副本）、在重新匯入時清空（新副本）；寫回期間副本已被更換時 MUST NOT 更新該紀錄。匯出與寫回 MUST 依序執行，不得交錯。

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

#### Scenario: 重置後新一場寫回還原上一場寫過的格
- **WHEN** 寫回後老師重置活動，新一場第 1 題無人搶答、第 4 題有得主，再寫回
- **THEN** 副本第 1 題填空格 MUST 還原為原內容，第 4 題填空格 MUST 為新得主答案

#### Scenario: 重新匯入後不還原舊副本的格
- **WHEN** 寫回後老師重置並重新匯入（建立新副本），新一場只有第 4 題有得主，再寫回
- **THEN** 寫入範圍 MUST 只有第 4 題的填空格

#### Scenario: 下載檔名
- **WHEN** 老師下載以 `group.xlsx` 匯入的結果
- **THEN** 檔名 MUST 為 `group_作答情況.xlsx`

### Requirement: 匯出不得改動作答格以外的內容

匯出檔中作答格以外的所有儲存格內容與合併範圍 MUST 與原檔相同。

#### Scenario: 往返比對
- **WHEN** 對任一夾具匯出
- **THEN** 除作答格外，每個非空儲存格的值與全部合併範圍 MUST 與原檔一致

### Requirement: 只有老師可在搶答結束後匯出

匯出（下載 xlsx 與寫回 Google 試算表）MUST 需要老師金鑰，且 MUST 只在 `ended` 階段允許；寫回 Google 試算表另 MUST 需要老師已以 Google 帳號登入。

#### Scenario: 搶答中匯出
- **WHEN** 老師在 `answering` 階段要求匯出
- **THEN** 伺服器 MUST 回 409

#### Scenario: 上傳 xlsx 來源不能寫回 Google 試算表
- **WHEN** 題目來自上傳 xlsx，老師在 `ended` 要求寫回 Google 試算表
- **THEN** 伺服器 MUST 回 409「題目不是從 Google 試算表匯入，請改用下載 xlsx」，下載 xlsx MUST 仍可用

#### Scenario: 未登入寫回 Google 試算表
- **WHEN** 老師未登入 Google 就要求寫回 Google 試算表
- **THEN** 伺服器 MUST 回 401，且 MUST NOT 呼叫任何 Google API
