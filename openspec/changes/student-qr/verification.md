# student-qr — verification（v1.1）

## 評審紀錄

S 檔壓縮版一輪（提案輪架構全卡掃＋實作輪對抗 diff，雙通道）：架構 **CLEARED（0B/3M/1m）**、對抗 **CLEARED（0B/0M/1m）**。

| 藥方 | 落點 |
|---|---|
| 架構重要：檔位 B→S、提交標 `[CORE]` | `proposal.md` 抬頭；本提交 |
| 架構重要：parity 登記 | `docs/parity.md` §4 `student-qr` 列、§5 2026-11-26 列（兩組逐位元組相同） |
| 架構重要：前端 4403 不重連並提示 | rebase 到 `web-workbench` 後落地：`web/src/live.ts` `NO_RECONNECT`、`Teacher.tsx` `NotLocalNotice`、學生連結 QR；伺服器老師 WS 改先 accept 再以 4403 關閉（design D2、D5）；`live.test.tsx`、`qr.test.tsx` |
| 架構次要：註解決策編號、contracts WebSocket 關閉代碼補 4403 | `tunnel.py:1` D1、`views.py` D3、`test_tunnel.py:1` D1；`contracts/api.md`「WebSocket `/ws`」段 |
| 對抗次要：`URL` 只認 `INF |`、排除 `api.` | `tunnel.py` `URL`、`parse_url` 改 `search`；`test_tunnel.py::test_parse_url_ignores_other_lines` 補三條負例 |

## 真實 WebSocket 用戶端（4403 關閉碼）

```
帶 cf-connecting-ip 的老師 WS 關閉碼： 4403
本機老師 WS 第一則： {"type":"state","seq":1,"view"
```

## followup（不阻塞）

- 老師金鑰錯誤（4401）仍在交握前關閉，瀏覽器實際收到 1006 而非 4401，「老師金鑰錯誤」提示顯示不出來（現行行為，本卡不改）。實測：`websockets.connect(".../ws?role=teacher&key=wrong")` → 「錯誤金鑰老師 WS：交握被拒 HTTP 403」。主人：@yue083139。

- 以 `--host 0.0.0.0` 啟動時，同區網的人偽造 `Host: 127.0.0.1` 且不帶 Cloudflare 標頭會被判為本機——仍須老師金鑰，與改版前同強度；預設只綁 127.0.0.1，不另處理。主人：@yue083139。

## 變異實錄

```
變異1 拿掉 Cloudflare 標頭檢查（is_local 只看 Host）：test_api_host.py → 1 failed, 10 passed
變異2 is_local 一律回 True：test_api_host.py → 5 failed, 6 passed
```

## 真棧

見 `probes/results/2026-11-26-student-qr-real-stack.txt`。

## 門禁實錄

`make gate-pr`（2026-11-26，feat/student-qr）：

```
ruff：All checks passed!（server、ops probes）
server pytest：294 passed, 1 warning
ops pytest：48 passed
web vitest：Test Files 8 passed (8)；Tests 41 passed (41)
gate-zh-hant: 0 處簡體字
gate-secrets: 0 findings
openspec validate：Totals: 12 passed, 0 failed (12 items)
gate-agents: 0 處漂移
```

`gate-parity` 未跑：SpecKit 組同批移植待合流（本卡改了共用檔 `contracts/api.md`、`docs/manual-verification.md`）。

## 人工驗證（需求 P-05）

狀態：**待執行**（負責人，`docs/manual-verification.md` 場次 F）。
