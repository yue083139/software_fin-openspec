# student-qr — design（v1.1）

知識時點：2026-11-26。cloudflared 2026.11.2（winget `Cloudflare.cloudflared`）。外部行為以探針為準：`uv run --project server python -X utf8 probes/cloudflared_probe.py "C:/Program Files (x86)/cloudflared/cloudflared.exe"`，原樣輸出 `probes/results/2026-11-26-cloudflared.txt`（公網 IP 已遮蔽）。

## D1 通道：子行程起 cloudflared 快速通道，讀輸出取網址

- `quiz_server/tunnel.py`：`find_cloudflared()` 先 `shutil.which`，再找 `C:\Program Files (x86)\cloudflared\cloudflared.exe`、`C:\Program Files\cloudflared\cloudflared.exe`（winget 裝完要重開終端機 PATH 才更新）。`Tunnel.start()` 執行 `cloudflared tunnel --no-autoupdate --url http://127.0.0.1:<埠>`，合併 stdout／stderr，逐行以 `(?:^|\s)INF \|\s+(https://(?!api\.)[a-z0-9-]+\.trycloudflare\.com)\s+\|` 搜尋（只認 INF 等級的表框列、排除 `api.trycloudflare.com`；實作輪對抗評審）；30 秒內沒拿到 ⇒ 結束子行程、回 `None`。拿到後另起執行緒讀掉輸出（不印），避免管線塞滿。伺服器結束（`finally`）時 `terminate`，10 秒不退再 `kill`。
- 啟動：`python -m quiz_server --tunnel` 或 `QUIZ_TUNNEL=1`；`make dev-tunnel`；`start-tunnel.cmd`（`start.ps1 -Tunnel`）。終端機印學生公開網址與「約需 1 分鐘才連得上」。
- 證偽欄｜可證偽：探針①「含網址的輸出行（3.3 秒）：2026-11-26T12:54:52Z INF |  https://penny-cheap-centered-fewer.trycloudflare.com  |」；②「經通道 GET /echo（第 31 次嘗試）」——新網域 DNS 約 60 秒才在本機解析得到，故提示一分鐘。`test_tunnel.py` 以該列原文做解析測試。屬取捨：不用 `cloudflared` 的 `--metrics` API 取網址（多一個埠、多一層版本相依），讀輸出最簡單。

## D2 老師身分只在本機

- `app.is_local(headers)`：Host 去掉埠後小寫，∈ `LOCAL_HOSTNAMES = {127.0.0.1, localhost, [::1]}`，且標頭沒有 `cf-connecting-ip`、`cf-ray`。
- 套用：`require_teacher`（全部 `/api/teacher/*`）在驗金鑰**之前**檢查，不符 ⇒ 403 `{"detail": "老師頁只能在本機開啟"}`（錯金鑰也是 403，公開網域探測不到金鑰對錯）；老師 WebSocket 不符 ⇒ 以 4403 關閉；`/api/google/callback` 不符 ⇒ 403 固定 HTML（不回顯參數）。學生與公開端點、靜態頁不限。
- 證偽欄｜可證偽：探針②經通道 `'host': 'penny-cheap-centered-fewer.trycloudflare.com'`、`'cf-connecting-ip 存在': True`；④「經通道偽造 Host: 127.0.0.1:8020：HTTP 403」（Cloudflare 邊緣擋下，到不了本機）；②對照「本機直連、偽造 Host 與 X-Forwarded-For：'client.host': '1.2.3.4'」——uvicorn 預設信任 127.0.0.1 的 `X-Forwarded-For` 改寫 `client.host`，而通道請求都從 127.0.0.1 進來，故 `client.host` 不可用。雙條件（Host＋無 Cloudflare 標頭）任一被繞過另一條仍擋。變異實錄：拿掉標頭條件 1 failed、一律放行 5 failed。
- 測試：TestClient 預設 Host 是 `testserver`；`conftest.py` autouse fixture 把 `testserver` 加進 `LOCAL_HOSTNAMES`（monkeypatch，正式碼不含），`is_local` 在呼叫時讀模組常數。屬取捨：不改六處 `create_app` 呼叫點、不在正式允許清單放 `testserver`。

## D3 老師 view 的 `student_url`

- `Activity.public_url`（伺服器設定，重置與重新匯入保留），`create_app(student_url=)` 設定；`teacher_view` 帶 `student_url`（無通道為 `null`，前端退回自身 origin）。學生 view 不帶。
- 證偽欄｜可證偽：`test_student_url_only_in_teacher_view`；真棧 `probes/results/2026-11-26-student-qr-real-stack.txt`「本機老師 view student_url：https://maui-graphic-latino-logistics.trycloudflare.com/」。

## D4 不變

- 不帶 `--tunnel` 時行為與現行相同（只綁 127.0.0.1）；Google OAuth 回呼仍為 `http://127.0.0.1:8000/api/google/callback`。

## 風險

- 通道開著時學生頁與公開端點（`/api/public/info`、`join`、`submit`）對網際網路公開，知道網址的人都能選組加入；網址隨機且每次不同，Demo 用途可接受，老師可用「釋放」踢掉陌生裝置。
