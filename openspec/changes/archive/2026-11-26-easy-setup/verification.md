# easy-setup — verification（v1.1）

## 探針

`probes/results/2026-11-26-easy-setup.txt`：①②③皆已執行（①②由負責人主會話執行；探針通道後端改固定 204、不讀檔）。

## 門禁實錄

`make gate-pr`（2026-11-26，`feat/easy-setup` dd8b9ba）：

```
All checks passed!
All checks passed!
360 passed, 1 warning in 20.45s
48 passed in 4.74s
 Test Files  15 passed (15)
      Tests  78 passed (78)
gate-zh-hant: 0 處簡體字
gate-secrets: 0 findings
Totals: 13 passed, 0 failed (13 items)
gate-agents: 0 處漂移
```

前端連跑第二次：`Test Files  15 passed (15)`、`Tests  78 passed (78)`；`eslint .` 無輸出。

## 變異實錄（每項改完即 `git checkout` 還原）

| # | 變異 | 結果 |
|---|---|---|
| M1 | 密鑰白名單 `fullmatch` 改 `match` | `test_google_config.py` 1 failed（尾端換行負例） |
| M2 | 拿掉「非準備階段不能關閉」檢查 | `test_tunnel_api.py` 1 failed |
| M3 | 拿掉 `complete()` 世代號比對 | `test_google_config.py` 1 failed |
| M4 | `.env` 同鍵後續行不刪 | `test_google_config.py` 1 failed |
| M5 | 建立中關閉不設取消旗標 | `test_tunnel_api.py` 1 failed |
| M6 | 監看任務不轉 off | `test_tunnel_api.py` 1 failed |

## 實作偏離提案（已回稿）

- `create_app` 的 `student_url` 參數保留（`--tunnel` 啟動與既有測試用），並據此把初始 `tunnel` 設為 `on`；design D3 已寫。
- 「子行程意外結束」以 lifespan 監看任務實作（每 2 秒，`tunnel_watch_interval` 可調），不在每次查詢前 `poll()`：推播才能主動送到老師頁；design D3 已寫。
- 既有測試 `test_api_google.py::test_callback_signs_in` 斷言 `GET /api/teacher/google` 全形狀，依 D2 批准的擴充補 `client_id_hint`、`redirect_uri`（仍無權杖與密鑰）。
- `start.ps1` 的代裝抽成 `Install-Tool` 函式，uv 與 Node.js 共用；`-Tunnel` 參數與分支刪除。

## 評審紀錄

- 提案輪（v1.0 → v1.1）：架構 CLEARED(0B/1M/3m)、紅隊 NOT CLEARED(0B/4M/4m)，皆 0 阻斷；藥方見 design.md 抬頭。
- 實作輪（9bf33b6／d831859）：紅隊 CLEARED(0B/0M/1m)、架構 CLEARED(0B/0M/3m)；負責人授權合入。順手收：`GoogleSession.token()` 續期 await 前記世代號、回來不一致即丟棄，`logout()` 遞增世代號（`test_refresh_discarded_when_session_changes_midway`、`test_logout_bumps_generation`；變異「拿掉續期世代比對」⇒ 2 failed）；手冊 §1 第 3、7 步與場次 A 第 1、6 步改寫為新流程。

## followup（不阻塞，主人 @yue083139）

- `envfile._write` 的 finally 刪暫存檔沒有失敗路徑測試（例：`os.replace` 拋例外時暫存檔被刪）。
- 監看任務「2 秒內轉 off」只以測試間隔 0.02 秒驗，未以正式間隔 2 秒驗上限。
- 經公開 Host 送壞 JSON 到老師端點會先回 422 再輪到 403：FastAPI 先解析本體再跑依賴。422 不回顯本體、不改任何設定，安全上無虞，暫不改。

## 人工驗證（需求 P-05）

狀態：**待執行**（負責人：`docs/manual-verification.md` 場次 H、F）。
