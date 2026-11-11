## ADDED Requirements

### Requirement: 老師可把搶答成功的答案匯出至原 Guided Notes

搶答結束後，老師 MUST 能下載一份 xlsx，內容為匯入的原 Guided Notes，且每題搶答成功組別的答案 MUST 寫入該題原本的填空格；題組的每個子題答案 MUST 寫入對應的子題填空格。

#### Scenario: 單題寫回
- **WHEN** 第2組搶得單題範本第 3 題並答「位址」，老師匯出
- **THEN** 匯出檔中第 3 題的作答格內容 MUST 為「位址」

#### Scenario: 題組寫回保留標籤
- **WHEN** 第1組搶得題組範本第 1 題並答「CPU」「作業系統」，老師匯出
- **THEN** 第 1 題兩個作答格 MUST 分別為「（1）CPU」與「（2）作業系統」

#### Scenario: 公式形式的答案以文字寫入
- **WHEN** 得主答案為「=1+1」
- **THEN** 匯出檔該作答格 MUST 為文字「=1+1」，MUST NOT 為公式

#### Scenario: 無人搶答的題目不變
- **WHEN** 某題沒有任何組別送出
- **THEN** 匯出檔中該題作答格 MUST 與原檔相同

### Requirement: 匯出不得改動作答格以外的內容

匯出檔中作答格以外的所有儲存格內容與合併範圍 MUST 與原檔相同。

#### Scenario: 往返比對
- **WHEN** 對任一夾具匯出
- **THEN** 除作答格外，每個非空儲存格的值與全部合併範圍 MUST 與原檔一致

### Requirement: 只有老師可在搶答結束後匯出

匯出 MUST 需要老師金鑰，且 MUST 只在 `ended` 階段允許。

#### Scenario: 搶答中匯出
- **WHEN** 老師在 `answering` 階段要求匯出
- **THEN** 伺服器 MUST 回 409
