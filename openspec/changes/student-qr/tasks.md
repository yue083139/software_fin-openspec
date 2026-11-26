# student-qr — tasks（v1.1）

## 0. 提案前置
- [x] 0.1 探針 `probes/cloudflared_probe.py`：網址輸出列、經通道的標頭、WebSocket、偽造 Host；原樣輸出 `probes/results/2026-11-26-cloudflared.txt`（公網 IP 已遮蔽）
- [x] 0.2 提案輪評審（架構通道，全卡掃；CLEARED 0B/3M/1m）
- [x] 0.3 `docs/parity.md` §4、§5 登記（與 SpecKit 同批）

## 1. 驗收測試（先寫，先紅）
- [x] 1.1 `server/tests/test_api_host.py`
- [x] 1.2 `server/tests/test_tunnel.py`
- [x] 1.3 `server/tests/conftest.py`：TestClient 的 `testserver` 視為本機（autouse）

## 2. 實作
- [x] 2.1 `quiz_server/tunnel.py`：找 cloudflared（PATH→預設安裝路徑）、解析網址、子行程起停
- [x] 2.2 `app.py`：`is_local`、老師依賴與老師 WS、回呼；`create_app(student_url=)`
- [x] 2.3 `activity.public_url`、`views.teacher_view` 的 `student_url`
- [x] 2.4 `__main__.py --tunnel`／`QUIZ_TUNNEL=1`；`make dev-tunnel`；`start.ps1 -Tunnel`、`start-tunnel.cmd`
- [x] 2.5 `contracts/api.md`、`web/src/types.ts`（`student_url`）
- [x] 2.6 README「使用」段、`docs/manual-verification.md` 場次 F

## 3. 驗證
- [x] 3.1 變異實錄、真棧（`probes/results/2026-11-26-student-qr-real-stack.txt`）
- [x] 3.2 實作輪評審（對抗通道，只掃 diff；CLEARED 0B/0M/1m）
- [ ] 3.4 前端：`live.ts` 遇 4403 不重連、老師頁提示「老師頁只能在本機開啟」；學生連結 QR（`student_url ?? origin`，antd `QRCode`）——待 `web-workbench` 合入後
- [ ] 3.3 人工驗證（負責人，場次 F）
