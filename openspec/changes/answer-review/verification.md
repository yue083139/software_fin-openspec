# answer-review — verification（v1.1，實作輪後）

知識時點：2026-11-26；本機 Windows 11、worktree `wt-os-answer-review`、分支 `feat/answer-review`（rebase 於 `feat/question-text` `50c3605`，提交前 HEAD `b4e07b8`）。

## 門禁實錄

`make gate-pr`（exit 0；實作輪藥方落地後）原樣摘錄：

```
All checks passed!
All checks passed!
297 passed, 1 warning in 16.36s
48 passed in 5.04s
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

| 重新匯入不清空（`activity.py` `load_questions` 內 `self.sheet_written = frozenset()` 改 `pass`） | `uv run --project server pytest -q server/tests/test_api_google.py` | `FAILED test_reimport_clears_written`；1 failed, 28 passed |
| 寫回期間換副本仍記錄（`mark_sheet_written` 的 `if self.source_sheet_id == sheet_id:` 改 `if True:`） | 同上 | `FAILED test_written_not_recorded_when_copy_changed_during_write`；1 failed, 28 passed |
| 重置也清空（`reset` 內加 `self.sheet_written = frozenset()`） | 同上 | `FAILED test_reset_keeps_written_and_restores_in_next_round`；1 failed, 28 passed |

全部變異均已還原，還原後全量 297 passed。

## 評審紀錄

- 提案輪（v1.0 → v1.1）：紅隊 0B/2M/3m、架構 0B/1M/3m，皆 0 阻斷；藥方見 design 抬頭 v1.1 段（需求 §4 解讀、game-modes／results-view MODIFIED、寫回範圍改「有得主＋上次寫過」、匯出鎖、推播口徑、錯誤碼 401→422）。
- 實作輪：紅隊 **CLEARED**（0B/0M/2m）、架構 **CLEARED**（0B/0M/0m）。紅隊實測：並發 5 個對同一候選的「答錯」⇒ 狀態碼 `[200, 409, 409, 409, 409]`（候選只移一組）；A-6 重置後新一場寫回 ⇒ H5／H6 還原、G13 寫入新得主。紅隊次要兩條（重新匯入清空、寫回期間換副本不記錄）已落永久測試與變異實錄（上表）；架構外包檢查兩條：M-022 守門欄改列具體測試名、`guided-notes-export` 增量補「重置保留、重新匯入清空」與兩個情境並由測試守。

## followup（不阻塞，主人 @yue083139）

- 匯出鎖（`app.py` `export_lock`）沒有並發測試：兩個寫回請求真正交錯需要可控的 Google 替身延遲；目前只以程式結構（鎖內取快照、鎖內 `mark_sheet_written`）保證。
- 老師端「答對／答錯／重設本題」按鈕、匯出中停用、`ImportPanel.tsx` 副本名稱文案：`web-workbench`（antd）合入後整合。

## 人工驗證（需求 P-05）

狀態：**待執行**（負責人，`docs/manual-verification.md` 場次 A 第 15a～15c、16～18 步；老師端按鈕待 `web-workbench` 整合後才有）。
