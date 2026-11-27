# results-podium — verification（v1.0）

## 門禁實錄

本機（Windows 11，無 `make`）依 `Makefile` 的 `gate-pr` 逐項執行，2026-11-27，分支 `feat/results-podium`（自 `origin/dev` `9884114`）：

```
uv run --project server pytest -q server/tests      → 367 passed, 1 warning
uv run --group dev pytest -q ops/tests（Git Bash） → 3 failed, 45 passed
uv run --project server ruff check server           → All checks passed!
uv run --group dev ruff check ops probes            → All checks passed!
npm --prefix web test                               → Tests  90 passed (90)
npm --prefix web run lint                           → 無輸出（exit 0）
npm --prefix web run typecheck                      → 無輸出（exit 0）
gate-zh-hant: 0 處簡體字
gate-secrets: 0 findings
openspec validate --all --strict                    → Totals: 13 passed, 0 failed (13 items)
gate-agents: 0 處漂移
```

web 第二次 `npm --prefix web test`：`Tests  90 passed (90)`。

`ops/tests` 3 failed 與本卡無關：`git stash -u` 回到乾淨的 `origin/dev` 後同樣 `3 failed, 45 passed`（`test_cli_without_sibling_reports_not_run`、`test_prepush_blocks_protected[main|dev]`，本機 Windows 環境 `TypeError: argument of type 'NoneType' is not a container or iterable`）；本卡未改 `ops/`。CI（Linux）以 PR 上的結果為準。

## 變異實錄（錯時會紅）

| 變異 | 結果 |
|---|---|
| `Teacher.tsx` 拿掉 `view.phase === "ended" &&` | `podium.test.tsx` 1 failed：「搶答中不顯示」 |
| `Podium.tsx` 的 `s > 0` 改 `s >= 0` | 2 failed：「沒有組別得分 ⇒ 空」「沒有組別得分就不顯示領獎台」 |

兩個變異都已還原，`git diff --stat` 只剩本卡改動。

## 評審紀錄

- 架構通道（全卡掃）：待派。
- 對抗通道（diff）：待派。

## 人工驗證（需求 P-05）

狀態：**待執行**（`docs/manual-verification.md` 場次 I）。
