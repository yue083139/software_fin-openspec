# 第一期實作輪評審紀錄（2026-11-11）

- 對象：`git diff dev..feat/guided-notes-export`（五卡五個提交 4614cc3、f1fcfd5、4f06160、3148118、666980a）。
- 方式：紅隊與架構兩通道互不知情、只掃 diff；紅隊在 `git archive` 出的暫存副本與 127.0.0.1 真伺服器上實跑攻擊（8 組並發送出、偽造憑證、畸形本體、公式答案、日誌掃描、拿掉鎖的變異），未動工作樹。
- 結論：紅隊 `CLEARED(0B/0M/3m)`、架構 `CLEARED(0B/0M/2m)`。

## 次要發現與處置

| 通道 | 發現 | 處置 |
|---|---|---|
| 紅隊 | WebSocket 收到二進位訊框時 `receive_text` 拋 `KeyError`，該連線斷開並印出堆疊 | 已修：改 `receive()` 忽略任何訊框；永久測試 `test_binary_frame_is_ignored` |
| 紅隊 | 題號欄為「第2題」「Q5」「(6)」等非數字寫法時該列被靜默略過，老師不知道少了題 | followup（主人 @yue083139）：匯入回應附「略過 N 列非數字題號」提示；符合 design D2 的「正整數」判定，非偏離 |
| 紅隊 | 同一作答格內有多段底線（如 `(1)____ (2)____`）只算一個作答格，寫回只取代第一段 | followup（主人 @yue083139）：匯入時偵測並提示；官方範本為一格一空，不受影響 |
| 架構 | 契約寫 `my_submissions` 只在非 `ended` 出現，實作在所有階段都帶 | 已修契約為「所有階段都含（只有本組）」 |
| 架構 | `results-view` D1 欄位名 `slot_labels`、`buzz-answering` D2 簽名 `team_scores(all_ranked)` 與實作不符；parity 狀態未更新 | 已照實作回補 design；parity 狀態於兩組同批更新 |

紅隊另記：重做變異實錄得 4 failed（作者記錄為 2 failed）——作者記錄只跑 `-k concurrent` 的兩條，紅隊跑全套；趨勢一致。
