# remote-access Specification

## Purpose
可選以 Cloudflare 快速通道提供學生公開網址（老師頁顯示學生連結 QR code），且老師 REST、老師 WebSocket 與 Google 回呼只接受本機請求，經通道的公開網址一律拒絕。

## Requirements

### Requirement: 可選以快速通道提供學生公開網址

系統 MUST 在以 `--tunnel` 或 `QUIZ_TUNNEL=1` 啟動時嘗試建立 Cloudflare 快速通道，並把取得的公開網址提供給老師 view 的 `student_url`；建立失敗時 MUST 照常以本機模式運作。未要求通道時 MUST 只在本機開放。

#### Scenario: 通道建立成功
- **WHEN** 老師以 `make dev-tunnel` 啟動且已安裝 cloudflared
- **THEN** 終端機 MUST 印出學生公開網址，老師 view 的 `student_url` MUST 為該網址

#### Scenario: 找不到 cloudflared
- **WHEN** 以 `--tunnel` 啟動但未安裝 cloudflared
- **THEN** 伺服器 MUST 印出安裝提示並照常啟動，`student_url` MUST 為 null

### Requirement: 老師身分只在本機

老師 REST 端點、老師 WebSocket 與 Google 回呼 MUST 只接受 Host 為本機（127.0.0.1、localhost、[::1]）且不帶 Cloudflare 轉送標頭的請求，否則 MUST 在驗金鑰前回 403（WebSocket 以 4403 關閉）。學生與公開端點 MUST NOT 受此限制。`student_url` MUST NOT 出現在學生 view。

#### Scenario: 經公開網址開老師頁
- **WHEN** 有人以通道公開網址帶正確老師金鑰呼叫 `/api/teacher/state`
- **THEN** 伺服器 MUST 回 403「老師頁只能在本機開啟」

#### Scenario: 手機經通道作答
- **WHEN** 學生以手機開通道公開網址選組並送出答案
- **THEN** 加入與送出 MUST 成功，行為 MUST 與本機學生相同
