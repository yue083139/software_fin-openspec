# app-skeleton — 驗證紀錄

## 門禁（2026-11-11，本機 Windows）

```
$ make gate-pr
All checks passed!
All checks passed!
46 passed, 1 warning in 0.90s
41 passed in 4.98s
 Test Files  1 passed (1)
      Tests  4 passed (4)
gate-zh-hant: 0 處簡體字
gate-secrets: 0 findings
Totals: 5 passed, 0 failed (5 items)
gate-agents: 0 處漂移
```

## 變異實錄（app-skeleton D2）

```
$ （activity.py 的 async with self._lock 換成 contextlib.nullcontext()）uv run --project server pytest -q server/tests/test_phases.py -k concurrent
FAILED server\tests\test_phases.py::test_concurrent_transitions_serialized - ...
FAILED server\tests\test_phases.py::test_concurrent_join_same_team_once - ass...
2 failed, 21 deselected in 0.09s
```

還原後 `server/tests` 全部通過（見上方門禁）。第一次變異實錄只紅 1 條：`Activity.join` 的讓出點在檢查之前，已改到檢查與寫入之間後兩條皆紅。

## 評審

提案輪：五卡同批雙通道，見 `docs/reviews/2026-11-11-phase1-proposal-review.md`（兩通道回驗後 CLEARED）。實作輪：見 PR。

## 設計決策 → 實作落點

| 決策 | 落點 |
|---|---|
| D1 元件與單埠 | `server/quiz_server/app.py` `create_app` 掛載 `web/dist`；`web/vite.config.ts` 代理 |
| D2 鎖與讓出點 | `server/quiz_server/activity.py` `_checkpoint`、`join`、`_transition` |
| D3 狀態機 | `server/quiz_server/phases.py` |
| D4 每連線推播 | `server/quiz_server/app.py` `ws` 內 `first_then_loop` |
| D5 老師金鑰 | `app.py` `is_teacher`、`__main__.py`（`access_log=False`） |
| D6 組別與憑證 | `activity.py` `join`／`release`／`team_of`；`web/src/api.ts` `saveToken` |
| D7 契約 | `contracts/api.md` |

## 人工驗證（需求 P-05）

狀態：**待執行**（交組員，照 `docs/manual-verification.md` 對應場次執行，結果回填本段）（AI 不能代替人工驗證）。步驟：

1. `make web-install` 後 `make dev`，記下終端機印出的老師頁網址。
2. 瀏覽器開三個分頁：老師頁網址、首頁選「第1組」、首頁選「第2組」。
3. 第三個瀏覽器分頁再選「第1組」⇒ 應顯示「此組已有裝置加入」。
4. 老師頁看到第1組、第2組「已加入」；按「釋放」第2組 ⇒ 第2組分頁顯示「尚未加入組別或組別已被老師釋放」。
5. （第一張卡尚無題目時「開始搶答」可直接按）老師按開始／結束 ⇒ 學生分頁階段同步變為「搶答中」「已結束」。

結果：＿＿＿（執行人／日期／看到什麼）
