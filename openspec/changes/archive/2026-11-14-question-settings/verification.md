# question-settings — 驗證紀錄

## 門禁（2026-11-12，本機 Windows）

見文末「門禁原樣輸出」（兩組同批跑）。

## 設計決策 → 實作落點

| 決策 | 落點 |
|---|---|
| D1 `QuestionAttrs`、規則乘倍率 | `server/quiz_server/scoring.py:20`「class QuestionAttrs」、`:26`「DEFAULT_ATTRS」；`ClassicBuzzRule` `:58`、`AccuracyRule` `:86`「m = (attrs or DEFAULT_ATTRS).multiplier」；`results.py` `_ranked` 傳入 `a.attrs_of(number)` |
| D2 設定流程 | `activity.py:30` `SettingsError`、`:164` 匯入時重建、`:173` `attrs_of`、`:176` `set_question`（鎖內、只在 preparing）；`reset` 不動 `attrs` |
| D3 view 與 API | `views.py:18`「multiplier」、`:21` `score_label`；`results.py:30`；`app.py:201` `/api/teacher/question-settings`；`contracts/api.md`（含兩句語意補充） |
| D4 web | `web/src/pages/ImportPanel.tsx` `QuestionList`（勾選框）、`DoubleTag`；`AnswerForm.tsx`、`Results.tsx` 標記；`settings.test.tsx` |
| 第一期測試改寫 | `server/tests/test_scoring.py::test_judgments_do_not_change_classic`（原 `test_reserved_inputs_do_not_change_classic`）；`test_api_import.py::test_upload_broadcasts_questions` 期望值加 `multiplier`（只增欄位） |

## 契約語意補充（負責人 2026-11-14 批准）

`contracts/api.md`：經典規則得主得「1 × 該題倍率」分；`team_scores` 欄名見 `score_label`。欄位與型別不變，只有數值範圍變大（design D3）。

## 人工驗證（需求 P-05）

狀態：**已執行**（照 `docs/manual-verification.md` 場次 C）。

1. `make dev`，老師匯入 `group.xlsx`，在題目清單勾第 3 題「雙倍分數」；學生分頁第 3 題出現「雙倍分數」標記。
2. 開始搶答後勾選框消失（只剩標記）。
3. 第1組先、第2組後送出第 3 題；第2組另送第 4 題；結束。
4. 結果：第1組 2 分、第2組 1 分；欄名為「得分」；第 3 題標「雙倍分數」。
5. 重置活動後第 3 題仍為雙倍；重新匯入後全部恢復 1 倍、欄名回到「得題數」。

結果：✅ 全部步驟符合（組員／2026-11-17／`dev` `1339d44`，Windows 11＋Chrome、Edge；明細見 `docs/manual-verification.md` §5 場次 C）。

## 門禁原樣輸出

```
$ make gate
All checks passed!
All checks passed!
173 passed, 1 warning in 8.09s
41 passed in 4.68s
 Test Files  5 passed (5)
      Tests  21 passed (21)
gate-zh-hant: 0 處簡體字
gate-secrets: 0 findings
Totals: 7 passed, 0 failed (7 items)
gate-agents: 0 處漂移
gate-parity: 0 處不一致
```
