# live-feed — verification（v1.0）

## 門禁實錄

本機（Windows 11，無 `make`）依 `Makefile` 的 `gate-pr` 逐項執行，2026-11-27，分支 `feat/live-feed`（自 `origin/dev` `14d02b7`）：

```
uv run --project server pytest -q server/tests → 367 passed, 1 warning
uv run --project server ruff check server      → All checks passed!
npm --prefix web test                          → Tests  99 passed (99)
npm --prefix web run lint                      → 無輸出（exit 0）
npm --prefix web run typecheck                 → 無輸出（exit 0）
gate-zh-hant: 0 處簡體字
gate-secrets: 0 findings
openspec validate live-feed --strict           → Change 'live-feed' is valid
gate-agents: 0 處漂移
```

web 第二次 `npm --prefix web test`：`Tests  99 passed (99)`。`ops/tests` 本機 Windows 環境既有 3 failed（見 `results-podium` verification，本卡未改 `ops/`），以 CI 為準。

## 變異實錄（錯時會紅）

| 變異 | 結果 |
|---|---|
| 拿掉 `prev === null`（第一個 view 也出通知） | 2 failed：「第一次收到 view 只當基準，不出通知」「新送出時右上角跳出通知，開頁時不跳」 |
| 拿掉 `next.phase !== "answering"`（任何階段都出） | 1 failed：「沒有新送出、或不在搶答中都不出通知」 |
| 拿掉 `classic &&`（任何模式第 1 順位都說搶下） | 1 failed：「非經典模式一律『送出』（得主要等判定）」 |

三個變異都已還原，`git diff --stat` 只剩本卡改動。

## 評審紀錄

- 架構通道（全卡掃）：待派。
- 對抗通道（diff）：待派。

## 人工驗證（需求 P-05）

狀態：**待執行**（`docs/manual-verification.md` 場次 J）。
