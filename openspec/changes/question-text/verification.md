# question-text — verification（v1.1）

## 門禁實錄

`make gate`（2026-11-26，`feat/question-text` 69a2930，SIBLING＝`../software_fin-speckit` `011-question-text` 5a908d3）exit=0：

```
All checks passed!
All checks passed!
278 passed, 1 warning in 14.06s
48 passed in 4.89s
 Test Files  8 passed (8)
      Tests  41 passed (41)
gate-zh-hant: 0 處簡體字
gate-secrets: 0 findings
Totals: 11 passed, 0 failed (11 items)
gate-agents: 0 處漂移
gate-parity: 0 處不一致
```

變異實錄（實作輪紅隊在 50c3605 的 git archive 暫存副本上做）：`_prompt_visible` 準備階段改為給敘述 ⇒ `test_prompts_hidden_until_open`、`test_api_import.py::test_upload_broadcasts_questions`、`test_student_view_has_numbers_only` 紅；逐題判斷改為一律給 ⇒ `test_prompts_sequential_only_opened` 紅。

## 評審紀錄

- 提案輪（v1.0 → v1.1）：紅隊 NOT CLEARED(0B/2M/2m)、架構 NOT CLEARED(0B/0M/5m)，皆 0 阻斷；藥方見 design.md 抬頭。
- 實作輪（30b6d6b..50c3605）：紅隊 CLEARED（1 次要）、架構 CLEARED（2 次要，已改稿 69a2930）。

## followup（不阻塞，主人 @yue083139）

- `_prompt` 的「縱向合併非錨點列」分支是保險：xlsx 與 Sheets 讀取時非錨點格本來就是空，刪掉分支測試仍綠（紅隊變異實錄 278 passed）；日後若改成把合併值補進每格，需補假 Grid 測試。
- 前端「不解讀 HTML」目前以 `git grep dangerouslySetInnerHTML -- web/src` 零命中為證，無元件測試。

## 人工驗證（需求 P-05）

狀態：**待執行**——負責人 2026-11-26 指示四卡整合到本地後一併測試（`docs/manual-verification.md` 場次 A 第 7、8 步）。
