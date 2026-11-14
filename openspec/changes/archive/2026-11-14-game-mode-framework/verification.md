# game-mode-framework — 驗證紀錄

## 門禁（2026-11-12，本機 Windows；SpecKit 組同批跑出相同測試數）

```
$ make gate
All checks passed!
All checks passed!
162 passed, 1 warning in 7.43s
41 passed in 4.61s
 Test Files  4 passed (4)
      Tests  17 passed (17)
gate-zh-hant: 0 處簡體字
gate-secrets: 0 findings
Totals: 6 passed, 0 failed (6 items)
gate-agents: 0 處漂移
gate-parity: 0 處不一致
```

## 變異實錄

```
== 變異 1：拿掉 reveal 的未判定檢查（if pending: → if False:）
FAILED tests/test_judging.py::test_reveal_blocked_until_all_judged - assert (...
FAILED tests/test_judging.py::test_concurrent_reveal_and_judge - quiz_server....
2 failed, 15 deselected, 1 warning in 1.18s

== 變異 2：拿掉 end 的 _require(ANSWERING)
1 passed, 16 deselected, 1 warning in 0.90s
```

變異 2 **未紅**：判定模式下 `end()` 的目標是 `judging`，`judging → judging` 不在轉移表，仍回 409。設計 D3 與提案首屏 5 的「不擋即可繞過」不成立，已回寫 v1.2；此前置條件保留為明寫的防線。

```
== 變異 3（v1.0 並發測試）：reveal 改用每次新建的鎖
1 passed, 16 deselected in 0.79s
```

v1.0 的 `test_concurrent_reveal_and_judge` **假綠**：`reveal` 在讀未判定數之前沒有讓出點，拿掉鎖也無從交錯。已換成真正的競態 `test_concurrent_judge_and_accept_suggestions`（`accept_suggestions` 在讀出未判定清單與寫入之間讓出，不加鎖時會蓋掉老師剛做的判定）：

```
== 變異 3：accept_suggestions 用每次新建的鎖
FAILED tests/test_judging.py::test_concurrent_judge_and_accept_suggestions - ...
1 failed, 16 deselected in 0.37s
== 變異 3b：judge 用每次新建的鎖
FAILED tests/test_judging.py::test_concurrent_judge_and_accept_suggestions - ...
1 failed, 16 deselected in 0.43s
```

還原後全部通過（見上方門禁）。變異以 scratchpad 腳本對檔案做單一替換、跑測試、還原，工作樹不留痕。

## 設計決策 → 實作落點

| 決策 | 落點 |
|---|---|
| D1 模式登記表 | `server/quiz_server/modes.py:11`「class Mode」、`:18`「MODES」、`:27`「ModeError」；`activity.py:72`「def rule」、`:140`「set_mode」 |
| D2 `Ranked.correct`、`AccuracyRule` | `scoring.py:27`、`:67` |
| D3 判定階段 | `activity.py:205`「async def end」（`:208` `_require(ANSWERING)`）、`:220` `suggestion`、`:223` `pending_judgments`、`:227` `judge`、`:235` `accept_suggestions`、`:254` `reveal` |
| D4 參考答案欄與建議 | `guided_notes.py:18` `REFERENCE_ALIASES`、`:35` `Slot.reference`、`:88` `_reference`；`judging.py:8` `normalize`、`:12` `suggest`；夾具 `tests/fixtures/guided-notes/build_reference.py` |
| D5 隔離 | `views.py` `student_view` 不加任何判定或參考欄；`results.py:15` `build(teacher=)` 只在老師版加 `suggestion`、`reference` |
| D6 結果一致 | `server/tests/test_results_view.py::test_teacher_and_student_agree`（兩模式） |
| D7 API 與 view | `app.py:196` `/mode`、`:201` `/judge`、`:207` `/accept-suggestions`、`:211` `/reveal`；`views.py:19` `score_label`、`:34` `pending_judgments`；`contracts/api.md` |
| D8 web | `web/src/pages/Teacher.tsx` `ModeSelector`、判定鈕列；`Results.tsx` `JudgeCell`；`Student.tsx` 模式說明與判定中提示；`judging.test.tsx` |

## 人工驗證（需求 P-05）

狀態：**待執行**（交組員，照 `docs/manual-verification.md` 對應場次執行，結果回填本段）。

1. `make dev`，開老師頁與兩個學生分頁（第1組、第2組）；老師匯入 `tests/fixtures/guided-notes/reference.xlsx`。
2. 老師「模式」選「只計對錯」；兩個學生分頁都顯示「模式：只計對錯」。開始搶答後模式單選應停用。
3. 第1組第 1 題答「GPU」、第2組第 1 題答「cpu」；第1組第 3 題答任意文字。
4. 老師按「結束搶答」⇒ 階段「判定中」、顯示「尚有 3 筆未判定」、「揭曉結果」停用；學生分頁顯示「老師判定中…」，開發者工具的 WebSocket 訊息中看不到他組答案與「CPU」。
5. 老師按「採用全部建議」⇒ 剩 1 筆（第 3 題無參考答案）；手動判第 3 題後按「揭曉結果」。
6. 學生分頁看到每筆 ✓／✗、「最早答對：第2組（cpu）」、欄名「得分」。老師匯出，第 1 題作答格為「cpu」。

結果：＿＿＿（執行人／日期／看到什麼）
