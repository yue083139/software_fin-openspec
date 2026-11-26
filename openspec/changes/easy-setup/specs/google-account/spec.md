## ADDED Requirements

### Requirement: 老師可在老師頁設定 Google OAuth 用戶端且立即生效

系統 MUST 提供只接受本機且帶老師金鑰的端點，讓老師貼上用戶端 ID 與密鑰；伺服器 MUST 先以格式白名單驗證，再只改寫 repo 根目錄 `.env` 的 `GOOGLE_CLIENT_ID`、`GOOGLE_CLIENT_SECRET` 兩行（其他行保留），並 MUST 不需重啟即可登入。密鑰 MUST NOT 出現在任何回應、view 或日誌。老師已登入 Google 時 MUST 拒絕變更或清除設定。

#### Scenario: 精靈存設定後立即可登入
- **WHEN** 老師在未設定狀態貼上格式正確的用戶端 ID 與密鑰並儲存
- **THEN** 狀態 MUST 變為 `configured: true` 且只回遮罩後的用戶端 ID，按「以 Google 帳號登入」MUST 取得含新用戶端 ID 的授權網址

#### Scenario: 格式不符或含換行
- **WHEN** 送出的密鑰不以 `GOCSPX-` 開頭、含換行或 `=`、或超過 128 字
- **THEN** 伺服器 MUST 回 422 且 `.env` 內容 MUST 不變，回應 MUST NOT 回顯輸入值

#### Scenario: 經公開網址設定
- **WHEN** 有人經通道公開網址帶正確金鑰呼叫設定端點
- **THEN** 伺服器 MUST 回 403「老師頁只能在本機開啟」

#### Scenario: 已登入時變更
- **WHEN** 老師已登入 Google 時送出新設定或清除設定
- **THEN** 伺服器 MUST 回 409「請先登出 Google 再變更設定」且設定 MUST 不變

#### Scenario: 清除設定
- **WHEN** 老師在未登入時按「清除設定」
- **THEN** `.env` MUST 移除兩鍵、其他行保留，狀態 MUST 變為 `configured: false`
