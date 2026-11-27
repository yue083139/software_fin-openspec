# live-feed — verification（v1.1）

## 門禁實錄

本機（Windows 11，無 `make`）依 `Makefile` 的 `gate-pr` 逐項執行，2026-11-27，分支 `feat/live-feed`（自 `origin/dev` `14d02b7`）：

```
uv run --project server pytest -q server/tests → 367 passed, 1 warning
uv run --project server ruff check server      → All checks passed!
npm --prefix web test                          → Tests  102 passed (102)（v1.1）
npm --prefix web run lint                      → 無輸出（exit 0）
npm --prefix web run typecheck                 → 無輸出（exit 0）
gate-zh-hant: 0 處簡體字
gate-secrets: 0 findings
openspec validate live-feed --strict           → Change 'live-feed' is valid
gate-agents: 0 處漂移
```

web 第二次 `npm --prefix web test`：`Tests  102 passed (102)`（v1.1；v1.0 為 99）。`ops/tests` 本機 Windows 環境既有 3 failed（見 `results-podium` verification，本卡未改 `ops/`），以 CI 為準。

## 變異實錄（錯時會紅）

| 變異 | 結果 |
|---|---|
| 拿掉 `prev === null`（第一個 view 也出通知） | 2 failed：「第一次收到 view 只當基準，不出通知」「新送出時右上角跳出通知，開頁時不跳」 |
| 拿掉 `next.phase !== "answering"`（任何階段都出） | 1 failed：「沒有新送出、或不在搶答中都不出通知」 |
| 拿掉 `classic &&`（任何模式第 1 順位都說搶下） | 1 failed：「非經典模式一律『送出』（得主要等判定）」 |
| （v1.1）拿掉斷線清基準 `if (!connected)` | 1 failed：「斷線重連後第一個新 view 只當基準，之後的新送出照跳」 |
| （v1.1）拿掉 `view === stale.current`（重連時拿斷線前的舊 view 當基準） | 1 failed：同上 |

「伺服器重啟後新一輪的同組同題不被舊基準吞掉」一例為行為回歸守門：重啟後老師通常先收到準備階段的空看板，基準自然被刷新，故上列變異下仍綠；它守的是推播合併時的結果。

五個變異都已還原，`git diff --stat` 只剩本卡改動。

## 評審紀錄

- 架構通道（全卡掃，2026-11-27，獨立子代理）：**NOT CLEARED(0B/1M/1m)**。重要：規格、proposal、兩組 parity／矩陣寫「重連後第一個 view 不出通知」，程式卻沿用斷線前的基準、會補跳斷線期間的送出 ⇒ v1.1 改程式照規格（見 design D2）。次要：矩陣「學生端無快訊」沒有學生頁測試 ⇒ 補「學生頁沒有快訊」一例。
- 對抗通道（diff，2026-11-27，獨立子代理）：**NOT CLEARED(0B/0M/1m)**，同指重連基準；另指出伺服器重啟時新一輪同組同題可能被舊基準吞掉 ⇒ 同一修法解決，補一例。其餘（StrictMode 重跑、同 view 重推、reset 後新一輪、作答隔離）證偽不成。
- 評審輪次：B 檔兩輪各單通道已用滿；藥方由主會話落地並以變異實錄自證，未再派回驗（輪次已滿），交負責人終審。

## 人工驗證（需求 P-05）

狀態：**待執行**（`docs/manual-verification.md` 場次 J）。
