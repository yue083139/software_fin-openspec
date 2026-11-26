# answer-review — verification（v1.1）

知識時點：2026-11-26；本機 Windows 11、worktree `wt-os-answer-review`、分支 `feat/answer-review`（rebase 於 `feat/question-text` `50c3605`，提交前 HEAD `b4e07b8`）。

## 門禁實錄

`make gate-pr`（exit 0）原樣摘錄：

```
All checks passed!
All checks passed!
294 passed, 1 warning in 15.87s
48 passed in 4.59s
 Test Files  8 passed (8)
      Tests  41 passed (41)
gate-zh-hant: 0 處簡體字
gate-secrets: 0 findings
Totals: 12 passed, 0 failed (12 items)
gate-agents: 0 處漂移
```

## 變異實錄（門禁類斷言錯時會紅）

| 變異 | 指令 | 結果 |
|---|---|---|
| 拿掉候選比對（`activity.py` `if cand.team != team:` 改 `if False and …`） | `uv run --project server pytest -q server/tests/test_review.py` | `FAILED test_double_click_does_not_skip_a_team`、`FAILED test_successful_review_pushes_once_and_failures_push_nothing`；2 failed, 10 passed |
| 寫回不還原上次寫過的格（`app.py` `restore=act.sheet_written` 改 `restore=frozenset()`） | `uv run --project server pytest -q server/tests/test_api_google.py` | `FAILED test_reexport_restores_previously_written_cells`；1 failed, 25 passed |

兩個變異均已還原，還原後全量 294 passed。

## 評審紀錄

- 提案輪（v1.0 → v1.1）：紅隊 0B/2M/3m、架構 0B/1M/3m，皆 0 阻斷；藥方見 design 抬頭 v1.1 段。
- 實作輪：待派。

## 人工驗證（需求 P-05）

狀態：**待執行**（負責人，`docs/manual-verification.md` 場次 A 第 15a～15c、16～18 步；老師端按鈕待 `web-workbench` 整合後才有）。
