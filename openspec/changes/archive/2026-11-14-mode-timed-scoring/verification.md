# mode-timed-scoring — 驗證紀錄

## 變異實錄（2026-11-12）

```
== 變異 T1：拿掉送出路徑的截止比對
FAILED tests/test_timed_mode.py::test_deadline_on_submit_path - Failed: DID N...
1 failed, 1 passed, 14 deselected in 0.51s
== 變異 T2：計時器只睡一次（while 改 if）
FAILED tests/test_timed_mode.py::test_timer_retries_after_early_wake - assert...
1 failed, 15 deselected in 0.44s
== 變異 T3：close_question 用每次新建的鎖
FAILED tests/test_timed_mode.py::test_concurrent_close_and_submit - assert 1 ...
1 failed, 15 deselected in 0.44s
== 變異 T4：學生名次帶分數（with_scores=False → True）
FAILED tests/test_timed_mode.py::test_api_round_flow_and_scores - assert False
FAILED tests/test_timed_mode.py::test_leaderboard_counts_revealed_only - Asse...
FAILED tests/test_timed_mode.py::test_student_leaderboard_has_no_scores - ass...
3 failed, 13 deselected, 1 warning in 1.27s
```

還原後全部通過（見文末門禁）。

## 真棧探針（design D8）

`probes/results/2026-11-12-timed-flow.txt`（真 uvicorn、真 WebSocket，時限 5 秒，不手動關閉）摘錄：

```
第2組在他組送出後 0.5 秒內收到 0 則訊息
伺服器自動關閉並推播：開題後 5.02 秒（時限 5 秒）
關閉後送出 409 這一題目前沒有開放作答
第2組看到名次 [{'team': '第1組', 'rank': 1}, {'team': '第2組', 'rank': 2}]
第2組 payload 含第1組答案 False ；名次含分數 False
老師看到第3題 [('第1組', True, 898), ('第2組', False, 0)]
```

第1組約 1.0 秒答對得 898 分（時限 5 秒：`(2001×5 − ms) // 10`），與公式一致。

## 設計決策 → 實作落點

| 決策 | 落點 |
|---|---|
| D1 模式 | `server/quiz_server/modes.py:23`「Mode("timed", …, sequential=True)」；`views.py` `mode_info`（含 `sequential`） |
| D2 時限 | `scoring.py` `QuestionAttrs.time_limit`；`activity.py` `set_question`（兩欄皆可選、至少一欄、5–120）；`app.py` `QuestionSettingsBody` |
| D3 回合狀態 | `activity.py:41` `Round`、`:363` `current`、`:367` `open_next`、`:385` `_run_timer`（迴圈）、`:393` `close_due`、`:403` `close_question`、`:416` `reveal_question`、`:303` `_require_judgeable`；送出路徑 `:240`「now = self._clock()」只讀一次、`:247` 截止比對；`end` `:284` |
| D4 計分 | `scoring.py:101` `timed_points`（整數式）、`:113` `TimedRule` |
| D5 view 與隔離 | `views.py:22` `round_view`、`:88` 學生名次 `with_scores=False`；`results.py:60` `revealed_scores`（只計已揭曉）、`:65` `leaderboard`、`:80` `own_revealed`（只有本組） |
| D6 API | `app.py:207` `/open-next`、`:213` `/close-question`、`:217` `/reveal-question`；`contracts/api.md` |
| D7 web | `web/src/pages/Round.tsx`（`Countdown`、`RoundStatus`、`Leaderboard`）；`Teacher.tsx` 逐題鈕列與時限欄；`Student.tsx` `TimedPanel`；`timed.test.tsx` |
| D8 真棧探針 | `probes/timed_flow_probe.py`；`probes/results/2026-11-12-timed-flow.txt` |

## 人工驗證（需求 P-05）

狀態：**已執行**（照 `docs/manual-verification.md` 場次 D）。

1. `make dev`，老師匯入 `group.xlsx`，模式選「時間計分」；題目清單出現每題「時限」欄，把第 1 題設 10 秒。
2. 開兩個學生分頁（第1組、第2組），老師按「開始搶答」→「開放下一題」。學生只看到第 1 題與倒數；第 2 題以後看不到輸入欄。
3. 第1組約 2 秒送出、第2組不送；倒數到 0 時兩個學生分頁同時顯示「已結束作答，等待揭曉」（不需老師操作）。
4. 第2組此時送出被拒（「這一題目前沒有開放作答」）。
5. 老師判第1組正確 →「揭曉本題」：第1組看到「本組答對，+9xx 分」；第2組看到「本組未作答」與名次表，名次表**沒有分數欄**；開發者工具的 WebSocket 訊息中看不到第1組答案與分數。
6. 老師未揭曉時「開放下一題」「結束活動」停用；揭曉後可開下一題或結束活動，結束後學生看到完整結果與各組分數。

結果：✅ 全部步驟符合（組員／2026-11-17／`dev` `1339d44`，Windows 11＋Chrome、Edge；明細見 `docs/manual-verification.md` §5 場次 D）。

## 門禁原樣輸出（2026-11-12，本機 Windows）

```
$ make gate
All checks passed!
All checks passed!
197 passed, 1 warning in 9.60s
41 passed in 4.70s
 Test Files  6 passed (6)
      Tests  26 passed (26)
gate-zh-hant: 0 處簡體字
gate-secrets: 0 findings
Totals: 8 passed, 0 failed (8 items)
gate-agents: 0 處漂移
gate-parity: 0 處不一致
```

## 實作輪評審補測（2026-11-12）

紅隊實作輪 `CLEARED`，另指出三處「程式對、測試守不住」（變異後仍綠）。已補測試，變異改為必紅：

```
== R1 作答毫秒改回自開始搶答（刪 opened_at = rnd.opened_at）
FAILED tests/test_timed_mode.py::test_open_in_order_and_only_current_accepted
1 failed, 16 passed, 1 warning in 2.35s
== R2 重置不清回合（刪 self.rounds = {}）
FAILED tests/test_timed_mode.py::test_reset_clears_rounds_and_timer - Asserti...
1 failed, 16 passed, 1 warning in 2.32s
== R3 採用建議不檢查回合已關閉（刪 _require_judgeable）
FAILED tests/test_timed_mode.py::test_judge_and_reveal_preconditions - Failed...
1 failed, 16 passed, 1 warning in 2.36s
```

架構通道實作輪 1 重要（契約 `judge`／`accept-suggestions` 未補時間計分語意）、2 次要（名次「空陣列」字句、008 時序圖晚送訊息）已修，見 `contracts/api.md`、design D5／D6、SpecKit 008 圖與核對表。
