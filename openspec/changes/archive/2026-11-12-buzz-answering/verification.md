# buzz-answering — 驗證紀錄

## 門禁（2026-11-11，本機 Windows）

```
$ make gate-pr
All checks passed!
All checks passed!
105 passed, 1 warning in 10.81s
41 passed in 5.12s
 Test Files  2 passed (2)
      Tests  10 passed (10)
gate-zh-hant: 0 處簡體字
gate-secrets: 0 findings
Totals: 5 passed, 0 failed (5 items)
gate-agents: 0 處漂移
```

## 變異實錄（D1：讓出點夾在讀序號與寫序號之間）

```
$ （activity.py 的 async with self._lock 換成 contextlib.nullcontext()）uv run --project server pytest -q server/tests/test_submit.py -k concurrent
FAILED server\tests\test_submit.py::test_concurrent_same_question - assert [1...
FAILED server\tests\test_submit.py::test_concurrent_same_team_same_question
2 failed, 14 deselected in 0.46s
```

還原後全部通過（見上方門禁）。

## 設計決策 → 實作落點

| 決策 | 落點 |
|---|---|
| D1 送出流程與順位 | `server/quiz_server/activity.py` `submit`、`clean_answers`；`app.py` `/api/student/submit`（`X-Team-Token` 反查） |
| D2 判定規則策略 | `server/quiz_server/scoring.py` `ScoringRule`、`ClassicBuzzRule` |
| D3 作答隔離 | `views.py` `student_view`（非 ended 只含本組、ended 才有 results）；`app.py` `RequestValidationError` 處理器不回顯本體 |
| D4 題組 | `clean_answers` 子題數檢查 |
| D5 結束 | `submit` 的 `_require(ANSWERING)`；`reset` 清空 |
| D6 日誌 | `app.py` 送出只記組別、題號、序號 |
| MODIFIED 開始前置條件 | `activity.py` `start`；`server/tests/conftest.py` `ready_activity`、`loaded_client` |

偏離：無。`results.py`（`results-view` D1）在本卡先建最小版本，供 `ended` 的學生 view 揭曉；老師即時表與得分在 `results-view` 卡加入。

## 人工驗證（需求 P-05）

狀態：**待執行**（交組員，照 `docs/manual-verification.md` 對應場次執行，結果回填本段）。步驟：

1. `make dev`；老師頁匯入 `group.xlsx`；兩個分頁分別加入第1組、第2組。
2. 老師按開始。第1組對第 3 題送出「甲」，第2組對第 3 題送出「乙」；第1組對第 1 題只填一個子題，按鈕應無法按。
3. 第2組畫面不應出現「甲」或任何「第 3 題已被搶」的提示；開發者工具的 WebSocket 訊息也不應有「甲」。
4. 第1組再對第 3 題送出應失敗（畫面已鎖定）。
5. 老師按結束後，第2組畫面出現第 3 題得主第1組（結果畫面在 `results-view` 卡完成）。

結果：＿＿＿（執行人／日期／看到什麼）
