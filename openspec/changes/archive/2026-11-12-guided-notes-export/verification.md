# guided-notes-export — 驗證紀錄

## 門禁（2026-11-11，本機 Windows）

```
$ make gate-pr
All checks passed!
All checks passed!
121 passed, 1 warning in 16.58s
41 passed in 5.45s
 Test Files  3 passed (3)
      Tests  13 passed (13)
gate-zh-hant: 0 處簡體字
gate-secrets: 0 findings
Totals: 5 passed, 0 failed (5 items)
gate-agents: 0 處漂移
```

## 真棧實錄（第一期五卡整體流程，AI 執行）

`probes/e2e_flow_probe.py` 對真的 `python -m quiz_server`（uvicorn）以真 HTTP 與 WebSocket 用戶端跑完整流程：

```
# 2026-11-11 真棧探針：QUIZ_TEACHER_KEY=e2e-key-000000 python -m quiz_server --port 8765；uv run --project server python probes/e2e_flow_probe.py http://127.0.0.1:8765 e2e-key-000000 tests/fixtures/guided-notes/group.xlsx
# 第一次執行：WebSocket 握手 HTTP 404，伺服器日誌「No supported WebSocket library detected」⇒ server 依賴補 websockets 後重跑如下
首頁 200
匯入 200 {'source': 'group.xlsx', 'count': 4}
重複加入第1組 409
第2組初始 preparing
開始 200
第2組收到 answering
第1組送出第3題 200 {'question': 3, 'answers': ['甲組祕密答案']}
第2組在他組送出後 1 秒內收到 0 則訊息
第2組送出第1題（題組） 200
結束 200
第2組看到結果 {'team': '第2組', 'answers': ['CPU', '作業系統']} {'team': '第1組', 'answers': ['甲組祕密答案']} {'第1組': 1, '第2組': 1, '第3組': 0, '第4組': 0}
匯出 200 attachment; filename="guided-notes-result.xlsx"; filename*=UTF-8''group-%E6%90%B6%E7%AD%94%E7%B5%90%E6%9E%9C.xlsx
匯出檔填入的格 [('G11', '甲組祕密答案'), ('G5', '（1）CPU'), ('G6', '（2）作業系統')]

# 第二個發現：uvicorn INFO 等級印出「WebSocket /ws?role=student&token=…」與「…role=teacher&key=…」接受紀錄（access_log=False 擋不到）。
# __main__.py 改 log_level="warning" 後重跑探針，伺服器輸出全文（金鑰以 <老師金鑰> 代替）：
老師頁：http://127.0.0.1:8765/#/teacher?key=<老師金鑰>
學生頁：http://127.0.0.1:8765/
# grep -c 'token=' 伺服器輸出 ⇒ 0
```

這次真棧實錄抓到兩個單元測試測不到的問題（都已修並回稿 `app-skeleton` design D5）：uvicorn 缺 WebSocket 實作（真瀏覽器會連不上 `/ws`）、uvicorn INFO 日誌印出含金鑰與憑證的 WebSocket 網址。

## 設計決策 → 實作落點

| 決策 | 落點 |
|---|---|
| D1 寫回演算法 | `server/quiz_server/guided_notes.py` `write_answers`；`results.py` `winning_answers`（經規則） |
| D2 填寫格式與文字型別 | `guided_notes.py` `fill`、`cell.data_type = "s"` |
| D3 匯出條件 | `app.py` `/api/teacher/export`（ended、已匯入、老師金鑰） |
| D4 回應與檔名 | `app.py` `export_filename`、RFC 5987 `filename*`；`web/src/api.ts` `teacherDownload` |

## 人工驗證（需求 P-05）

狀態：**待執行**（交組員，照 `docs/manual-verification.md` 對應場次執行，結果回填本段）。步驟：

1. `make dev`；匯入課程「題組＋單題範本」；兩組各搶幾題（含一題題組）；老師結束。
2. 按「匯出 Guided Notes」，下載的檔名為「group-搶答結果.xlsx」（或「Google 試算表-搶答結果.xlsx」）。
3. 用 Excel 開啟：每題作答格內是得主答案，題組為「（1）答案」「（2）答案」，其他格與框線不變；未搶答題空白。
4. 在原 Google 試算表「檔案 → 匯入 → 上傳 → 取代試算表」上傳匯出檔，答案出現在原填空格。

結果：＿＿＿（執行人／日期／看到什麼）
