# google-account Specification

## Purpose
老師以 Google 帳號 OAuth 登入，讓伺服器能以老師的身分直接讀寫雲端 Google 試算表；權杖只存在伺服器記憶體，永不送往學生端。

## Requirements

### Requirement: 老師可以 Google 帳號登入與登出

伺服器設定了 OAuth 用戶端時，老師 MUST 能以 Google 帳號登入（授權碼流程＋PKCE）與登出；未設定時 Google 相關功能 MUST 停用並提示，上傳與下載 xlsx MUST 照常可用。

#### Scenario: 登入成功
- **WHEN** 老師按「以 Google 帳號登入」並在 Google 同意畫面同意
- **THEN** 伺服器 MUST 以授權碼換得權杖，老師狀態 MUST 顯示已登入的帳號

#### Scenario: 回呼不導回含老師金鑰的網址
- **WHEN** Google 以有效 `state` 導回回呼
- **THEN** 伺服器 MUST 回「登入完成，可關閉此分頁」頁面，MUST NOT 導向任何含老師金鑰的網址

#### Scenario: 未設定 OAuth 用戶端
- **WHEN** 伺服器啟動時未設定 `GOOGLE_CLIENT_ID` 或 `GOOGLE_CLIENT_SECRET`
- **THEN** 老師頁 Google 區塊 MUST 停用並提示設定方式，上傳 xlsx 匯入 MUST 仍可用

### Requirement: OAuth 回呼只接受伺服器發出的 state

OAuth 回呼 MUST 只接受由已驗證老師請求產生、未過期、未使用過，且與發起登入的瀏覽器 cookie 相符的 `state`；其餘 MUST 回 400 且 MUST NOT 換取權杖。回呼頁 MUST NOT 回顯任何查詢參數。

#### Scenario: 偽造 state
- **WHEN** 有人以伺服器未發出的 `state` 呼叫回呼
- **THEN** 伺服器 MUST 回 400，登入狀態 MUST NOT 改變

#### Scenario: 另一個瀏覽器拿到授權網址
- **WHEN** 他人以老師發起的 `state` 在沒有對應 cookie 的瀏覽器完成授權並導回回呼
- **THEN** 伺服器 MUST 回 400，MUST NOT 換取權杖，老師登入狀態 MUST NOT 改變

#### Scenario: 重放 state
- **WHEN** 同一 `state` 第二次呼叫回呼
- **THEN** 伺服器 MUST 回 400

### Requirement: Google 權杖永不外洩

access token、refresh token 與 client secret MUST 只存在伺服器記憶體，MUST NOT 出現在任何 API 回應、WebSocket 訊息或日誌中。

#### Scenario: 搶答中學生看不到權杖與他組答案
- **WHEN** 老師已登入 Google、搶答進行中，A 組學生接收 WebSocket 訊息與呼叫學生端 REST 端點
- **THEN** A 組收到的完整 payload MUST NOT 含任何權杖字串，且 MUST NOT 含 B 組答案

#### Scenario: 日誌不含權杖
- **WHEN** 完成一次登入、匯入、寫回流程
- **THEN** 伺服器日誌 MUST NOT 含 access token、refresh token、授權碼或 client secret
