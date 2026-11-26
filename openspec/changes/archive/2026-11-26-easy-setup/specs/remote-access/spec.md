## MODIFIED Requirements

### Requirement: 可選以快速通道提供學生公開網址

系統 MUST 讓老師在老師頁一鍵開啟或關閉 Cloudflare 快速通道，也 MUST 在以 `--tunnel` 或 `QUIZ_TUNNEL=1` 啟動時直接嘗試建立；取得的公開網址 MUST 提供給老師 view 的 `student_url`，老師 view MUST 含通道狀態 `tunnel`（`off`／`starting`／`on`）並在變化時推播。建立失敗時 MUST 照常以本機模式運作；找不到 cloudflared 時 MUST 回明確錯誤讓前端顯示安裝指令。活動不在準備階段時 MUST 拒絕關閉；cloudflared 意外結束時 MUST 自動轉為 `off`。未要求通道時 MUST 只在本機開放。學生 view MUST NOT 含 `tunnel` 與 `student_url`。

#### Scenario: 通道建立成功
- **WHEN** 老師以 `make dev-tunnel` 啟動且已安裝 cloudflared
- **THEN** 終端機 MUST 印出學生公開網址，老師 view 的 `student_url` MUST 為該網址，`tunnel` MUST 為 `on`

#### Scenario: 老師頁一鍵開啟手機連線
- **WHEN** 已安裝 cloudflared，老師在老師頁按「開啟手機連線」
- **THEN** 老師 view 的 `tunnel` MUST 依序為 `starting`、`on`，`student_url` MUST 為公開網址，QR code MUST 更新

#### Scenario: 關閉手機連線
- **WHEN** 老師按「關閉手機連線」
- **THEN** cloudflared 子行程 MUST 結束，`tunnel` MUST 為 `off`，`student_url` MUST 為 null

#### Scenario: 找不到 cloudflared
- **WHEN** 未安裝 cloudflared 時老師按「開啟手機連線」，或以 `--tunnel` 啟動
- **THEN** 端點 MUST 回 503 含安裝指令（以 `--tunnel` 啟動時 MUST 印出安裝提示並照常啟動），`student_url` MUST 為 null

#### Scenario: 建立中關閉
- **WHEN** 手機連線建立中老師按「關閉手機連線」
- **THEN** 建立完成後子行程 MUST 被停止，`tunnel` MUST 為 `off`，兩個請求 MUST 都回 off

#### Scenario: 搶答開始後不能關閉
- **WHEN** 活動不在準備階段時老師按「關閉手機連線」
- **THEN** 伺服器 MUST 回 409「搶答進行中不能關閉手機連線」且通道 MUST 維持開啟

#### Scenario: cloudflared 意外結束
- **WHEN** 已開啟的 cloudflared 子行程意外結束
- **THEN** 老師 view 的 `tunnel` MUST 轉為 `off`、`student_url` MUST 為 null

#### Scenario: 並發開啟只起一次
- **WHEN** 兩個老師分頁幾乎同時按「開啟手機連線」
- **THEN** 伺服器 MUST 只啟動一個 cloudflared 子行程，第二個請求 MUST 回 409「手機連線建立中」
