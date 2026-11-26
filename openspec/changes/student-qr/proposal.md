# student-qr — Cloudflare 快速通道讓手機掃 QR code 進學生頁，老師端限本機（v1.1，評審後定稿）

檔位：**S**（`contracts/`、OAuth 回呼與安全邊界：老師身分限本機；原判 B，架構通道評審改 S）｜主人：@yue083139｜parity：`docs/parity.md` §4 `student-qr`｜需求：X-04｜依賴：`app-skeleton`
**v1.1 評審（S 檔壓縮版一輪：提案輪架構全卡掃＋實作輪對抗 diff，雙通道）**：架構 0B/3M/1m、對抗 0B/0M/1m，皆 CLEARED。藥方——檔位改 S、提交標 `[CORE]`；`docs/parity.md` §4／§5 登記；前端遇 4403 不重連並提示「老師頁只能在本機開啟」（併入 `web-workbench` 合入後接上）；註解決策編號訂正、`contracts/api.md` WebSocket 關閉代碼補 4403；`tunnel.URL` 只認 `INF |` 表框列且排除 `api.trycloudflare.com`，補兩條負例。

負責人 2026-11-26 裁：學生連結要能用手機掃 QR code；走 Cloudflare 快速通道（非區網模式）；老師端點與老師 WebSocket 只接受本機 Host；OAuth 維持 127.0.0.1。前端 QR 畫面併入 `web-workbench`（antd `QRCode`），本卡只做伺服器、啟動與文件。

## 首屏決策摘要

1. **`--tunnel`（`QUIZ_TUNNEL=1`、`make dev-tunnel`、`start-tunnel.cmd`）時由伺服器以子行程起 `cloudflared tunnel --url`**，讀輸出表框列取 `https://*.trycloudflare.com` 網址；找不到或 30 秒內拿不到 ⇒ 印提示、照常只開本機／可被 `probes/results/2026-11-26-cloudflared.txt` ①證偽（網址在第 3.3 秒的 `INF |  https://….trycloudflare.com  |` 列）。
2. **老師身分只在本機**：老師 REST、老師 WebSocket、Google 回呼要求 Host 主機名 ∈ {127.0.0.1, localhost, [::1]} **且**不帶 `cf-connecting-ip`／`cf-ray`；否則 403「老師頁只能在本機開啟」（WS 4403），先於金鑰檢查／屬取捨：不用 `client.host`，因 uvicorn 依 `X-Forwarded-For` 改寫它（探針②對照組）。
3. **老師 view 加 `student_url`**（有通道為公開網址，否則 `null`），學生 view 不帶／可被 `test_api_host.py::test_student_url_only_in_teacher_view` 證偽。
4. 預設行為不變：不帶 `--tunnel` 只開 127.0.0.1，與現行相同。

**矩陣落點**：新增 M-023（X-04、P-06；M-021 為 question-text、M-022 預留給 answer-review）「經公開網域的請求拿不到老師身分」，守門 `server/tests/test_api_host.py`；M-001 聲明不變。

**merge 三問第三問**：負責人 2026-11-26 要求學生能以手機掃碼作答（Demo 須展示至少 2 組學生端，手機最直觀）；課程說明「不必架設可供其他設備連線的伺服器」是不強制、非禁止。範圍成本：一個子行程、一道 Host 檢查，不碰搶答與隔離口徑。

## 邊界（本卡不做）

- 固定網域（需 Cloudflare 帳號與自有網域）、區網模式、限流。
- 前端 QR 畫面（`web-workbench`）。
- 公開網址下的 Google 登入（老師一律在本機）。

## 驗收

| # | 指令 | 期望輸出 |
|---|---|---|
| 1 | `uv run --project server pytest -q server/tests/test_api_host.py` | 公開 Host、帶 `cf-connecting-ip` 的本機 Host、區網 IP 打老師端點 403（錯金鑰也 403）；本機四種 Host 200；老師 WS 4403；學生端點經公開 Host 正常；回呼 403 不回顯參數；`student_url` 只在老師 view；passed |
| 2 | `uv run --project server pytest -q server/tests/test_tunnel.py` | 真實輸出列解析出網址；他列不誤認；串流結束回 None；找不到 cloudflared 回 None；passed |
| 3 | 變異實錄 | 拿掉 Cloudflare 標頭檢查 ⇒ `test_api_host.py` 1 failed；一律視為本機 ⇒ 5 failed（見 `verification.md`） |
| 4 | 真棧 | `probes/results/2026-11-26-student-qr-real-stack.txt`：公開 `/api/public/info` 200、公開 `/api/teacher/state` 403、本機 200、`student_url` 為通道網址 |
| 5 | 人工驗證 | `docs/manual-verification.md` 場次 F：手機 4G 掃碼進學生頁作答；公開網址開老師頁被拒 |
