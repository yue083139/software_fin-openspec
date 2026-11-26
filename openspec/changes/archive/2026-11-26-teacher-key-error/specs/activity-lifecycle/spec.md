## ADDED Requirements

### Requirement: 老師金鑰錯誤時老師頁顯示提示

老師 WebSocket 帶錯或未帶金鑰時，伺服器 MUST 先完成交握、MUST NOT 送出任何訊息，再以代碼 4401 關閉；老師頁收到 4401 MUST 停止重連並顯示「老師金鑰錯誤」與重開方式。Host 不是本機時 MUST 仍先以 4403 關閉。

#### Scenario: 錯金鑰開老師頁
- **WHEN** 老師以錯的金鑰開啟老師頁
- **THEN** 瀏覽器 MUST 收到關閉碼 4401 且之前沒有任何訊息，老師頁 MUST 顯示「老師金鑰錯誤」且不再重連

#### Scenario: 公開網址帶錯金鑰
- **WHEN** 以通道公開網址帶錯的金鑰開老師 WebSocket
- **THEN** 伺服器 MUST 以 4403 關閉
