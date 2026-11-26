## ADDED Requirements

### Requirement: 老師金鑰不留在網址列

老師頁 MUST 只在網址首次帶入金鑰時讀取，讀取後 MUST 將金鑰自網址移除且不新增瀏覽紀錄項，金鑰 MUST 只存於該分頁的 sessionStorage，MUST NOT 寫入 localStorage 或 cookie。網址帶新金鑰時 MUST 以網址為準。伺服器回應金鑰錯誤時 MUST 清除已存金鑰並提示回首頁重新輸入。

#### Scenario: 開啟老師頁後網址不含金鑰
- **WHEN** 老師以 `#/teacher?key=<金鑰>` 開啟老師頁
- **THEN** 網址 MUST 變為 `#/teacher`，老師頁 MUST 正常運作

#### Scenario: 重新整理仍可使用
- **WHEN** 老師在同一分頁重新整理
- **THEN** 老師頁 MUST 以本分頁存的金鑰正常運作

#### Scenario: 金鑰錯誤
- **WHEN** 伺服器以 401 拒絕老師請求
- **THEN** 本分頁存的金鑰 MUST 被清除，畫面 MUST 顯示「老師金鑰錯誤，請回首頁重新輸入。」
