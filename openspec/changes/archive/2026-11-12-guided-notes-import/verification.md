# guided-notes-import — 驗證紀錄

## 門禁（2026-11-11，本機 Windows）

```
$ make gate-pr
All checks passed!
All checks passed!
76 passed, 1 warning in 1.69s
41 passed in 4.49s
 Test Files  1 passed (1)
      Tests  7 passed (7)
gate-zh-hant: 0 處簡體字
gate-secrets: 0 findings
Totals: 5 passed, 0 failed (5 items)
gate-agents: 0 處漂移
```

## 驗收 #3：定位邏輯無寫死座標

```
$ git grep -nE '"[A-Z]{1,2}[0-9]+"' -- server/quiz_server
（無輸出，退出碼 1）
```

## 探針

- `probes/results/2026-11-11-guided-notes-structure.txt`：兩份官方範本的表頭列與合併範圍（D1、D2 依據）。
- `probes/results/2026-11-11-openpyxl-writeback.txt`：寫回合併格不破壞合併與框線（匯出卡 D1 依據）。
- `probes/results/2026-11-11-sheets-export.txt`：公開範本匯出 200 xlsx、轉址 1 次；不存在 id 404（D5 依據）。

## 設計決策 → 實作落點

| 決策 | 落點 |
|---|---|
| D1 表頭定位（整格等於別名、NFKC） | `server/quiz_server/guided_notes.py` `_find_header`、`_norm` |
| D2 題目與題組 | `guided_notes.py` `_parse_sheet` |
| D3 標籤與佔位符 | `guided_notes.py` `PLACEHOLDER`、`_display` |
| D4 錯誤 | `GuidedNotesError` 四種訊息 |
| D5 來源 | `server/quiz_server/sources.py`（`export_url`、`_allowed_hop` 逐跳、串流 5 MB） |
| D6 狀態 | `activity.py` `load_questions`（保存原檔位元組與檔名）；`import-url` 先擋階段再下載 |
| D7 學生可見內容 | `views.py` `question_outline` |

## 人工驗證（需求 P-05）

狀態：**已執行**（照 `docs/manual-verification.md` 場次 A2）。步驟：

1. `make dev`，開老師頁。
2. 依序上傳 `tests/fixtures/guided-notes/single.xlsx`、`group.xlsx`、`variant.xlsx`，確認題目清單分別為 6 題、4 題（第 1、2 題為 2 子題題組）、5 題（第 2 題 3 子題、第 4 題 2 子題）。
3. 把課程「題組＋單題範本」的 Google 試算表連結貼到「從連結匯入」，結果應與上傳 group.xlsx 相同。
4. 學生分頁在準備中看到題號清單，但看不到題目敘述。

結果：✅ 全部步驟符合（組員／2026-11-17／`dev` `1339d44`，Windows 11＋Chrome、Edge；明細見 `docs/manual-verification.md` §5 場次 A2）。
