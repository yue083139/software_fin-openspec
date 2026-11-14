# team-mode — verification（v1.1）

## 設計決策 → 實作落點

| 決策 | 落點 |
|---|---|
| D1 組隊開關 | `server/quiz_server/activity.py`「`async def set_team_play`」、「`def _revoke_all`」；`app.py`「`/api/teacher/team-play`」 |
| D2 邀請碼 | `activity.py`「`def normalize_code`」、「`async def join(self, team: str, code`」、「`def _new_code`」；`start` 內「開始搶答即換新邀請碼」；`release` 內「組隊時釋放即換新碼」 |
| D3 代表作答 | `activity.py` `submit` 內「送出即清該組該題草稿」；判定口徑未改 |
| D4 草稿 | `activity.py`「`def clean_draft`」、「`async def set_draft`」；`app.py`「`/api/student/draft`」 |
| D5 view | `views.py`「`"invite_codes"`」、「邀請碼只在準備階段給學生」、「組內草稿只在搶答中」；`app.py` `public_info` 的 `team_play` |
| D6 web | `web/src/pages/Home.tsx`「`export function TeamPicker`」；`Teacher.tsx`「組隊（一組多台裝置）」；`Student.tsx`「本組邀請碼」；`AnswerForm.tsx`「`DRAFT_DELAY_MS`」、「`cancelDraft`」 |
| D7 契約 | `contracts/api.md` 八處標「team-mode」 |

偏離：無（v1.1 的藥方先改稿、後改碼）。

## 契約語意補充（負責人 2026-11-14 批准）

見 design D7 四條。組隊關閉時與第一期相同：`test_api_skeleton.py::test_join_once_per_team`、`test_phases.py::test_concurrent_join_same_team_once` 未改仍綠。

## 門禁原樣輸出（2026-11-14，本機 Windows）

```
$ make gate SIBLING=../software_fin-speckit
All checks passed!
All checks passed!
227 passed, 1 warning in 38.64s
41 passed in 5.04s
 Test Files  7 passed (7)
      Tests  33 passed (33)
gate-zh-hant: 0 處簡體字
gate-secrets: 0 findings
Totals: 9 passed, 0 failed (9 items)
gate-agents: 0 處漂移
gate-parity: 0 處不一致
```

## 變異實錄（守門測試錯時會紅）

每則把一處程式改壞、只跑對應測試、再還原：

```
== M1 刪邀請碼比對
FAILED tests/test_team_mode.py::test_join_requires_code - assert (200 == 403)
== M2 開始搶答不換新碼（初版測試以 `if new != old` 包住而假綠；已改為直接斷言 new != old 後重跑）
FAILED tests/test_team_mode.py::test_code_rotates_on_start_and_hidden_from_students
== M3 釋放不換新碼（刪碼）
FAILED tests/test_team_mode.py::test_release_revokes_all_devices_and_code - K...
== M4 學生邀請碼不限階段
FAILED tests/test_isolation.py::test_invite_code_not_sent_to_students_while_answering
== M5 草稿不限階段
FAILED tests/test_isolation.py::test_drafts_only_in_answering[ended] - Assert...（3 failed）
== M6 草稿給到他組（取錯組）
FAILED tests/test_isolation.py::test_team_draft_isolated - assert ('甲組草稿...
== M7 送出不清草稿
FAILED tests/test_team_mode.py::test_draft_rules - AssertionError
== M8 先檢查上限再比對碼
FAILED tests/test_team_mode.py::test_device_limit - AssertionError: assert 40...
```

## 人工驗證（需求 P-05）

狀態：**待執行**（交組員，照 `docs/manual-verification.md` 場次 E 執行，結果回填本段）。

結果：＿＿＿（執行人／日期／看到什麼）
