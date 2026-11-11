# results-view — 驗證紀錄

## 門禁（2026-11-11，本機 Windows）

```
$ make gate-pr
All checks passed!
All checks passed!
109 passed, 1 warning in 11.47s
41 passed in 5.21s
 Test Files  3 passed (3)
      Tests  12 passed (12)
gate-zh-hant: 0 處簡體字
gate-secrets: 0 findings
Totals: 5 passed, 0 failed (5 items)
gate-agents: 0 處漂移
```

## 設計決策 → 實作落點

| 決策 | 落點 |
|---|---|
| D1 共用結果函式 | `server/quiz_server/results.py` `build`、`team_scores`（皆經 `Activity.rule`） |
| D2 老師 view | `views.py` `teacher_view` 的 `board`、`team_scores` |
| D3 學生 view | `views.py` `student_view`：只有 `ended` 才加 `results`、`team_scores` |
| D4 介面 | `web/src/pages/Results.tsx` `Board`、`StudentResults` |

偏離：「已送出組數」直接顯示在老師表的最後一欄（D2 的「每題已送出組數」），沒有另立欄位於 view。

## 人工驗證（需求 P-05）

狀態：**待負責人執行**。步驟：

1. `make dev`；匯入 `group.xlsx`；三個分頁加入第1、2、3組；老師開始。
2. 各組對不同題目送出，老師表即時出現答案與順位、得主格變綠。
3. 搶答中學生頁沒有結果區塊。
4. 老師結束後，三個學生頁顯示每題得主與答案、本組順位、各組得題數，且與老師表一致。

結果：＿＿＿（執行人／日期／看到什麼）
