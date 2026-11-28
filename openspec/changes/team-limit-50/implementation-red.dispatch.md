## 0 抬頭
評審對象＝`openspec/changes/team-limit-50/{proposal.md,design.md,specs/activity-lifecycle/spec.md,tasks.md}` @ v1.0；本輪實作 diff 及其測試、文件。
基線＝dev `1339d4436ad1e0aaa3d54d8d4ef08acf59e4233d`；本輪 commit＝未提交工作樹（請自行檢查 `git diff HEAD`）。
通道＝紅隊；不告知輪次、不告知其他通道結論。
約束＝唯讀；勿改工作樹；勿跑會呼叫雲端 API 的指令。門禁由主 agent 統一真跑並附輸出。
知識時點＝2026-11-28。

## 1 範圍
本輪＝定點：本卡相對 HEAD 的 diff；聚焦作答隔離、API 嚴格驗證、組數上下界與 UI 可達性。
本卡至今全卡掃次數＝1（提案輪已完成；本輪為 S 檔唯一實作輪）。

## 2 斷言清單
A-1 | 結論＝最大組數 50 且最小 2、預設 4，非法輸入與 answering 階段設定不改活動狀態 | 稿內落點＝`openspec/changes/team-limit-50/specs/activity-lifecycle/spec.md:7`「2 到 50 組」及 `:22`「狀態 MUST NOT 改變」 | 理由＝既有 API 與 domain 邊界須一致且不可經型別寬鬆轉型繞過 | 已自對碼＝全量 server 測試 `248 passed` | 請證偽
A-2 | 結論＝50 組下第2–50組答案不出現在第1組學生端 payload | 稿內落點＝`openspec/changes/team-limit-50/specs/activity-lifecycle/spec.md:30`「第1組的學生接收 REST 回應或 WebSocket 狀態」 | 理由＝擴大組數不得擴大他組答案暴露 | 已自對碼＝隔離反變異時測試於 `assert all(answer not in raw for answer in peer_answers)` 失敗；復原後 server `248 passed` | 請證偽
A-3 | 結論＝每組最多 6 台限制延續至第50組，50 組並發順位無重號且恰有一得主 | 稿內落點＝`openspec/specs/team-mode/spec.md:26`「每組最多 6 台」及 `openspec/changes/team-limit-50/specs/activity-lifecycle/spec.md:19`「恰有一組搶答成功」 | 理由＝不得因擴容改動裝置上限或伺服器順位口徑 | 已自對碼＝全量 server 測試 `248 passed` | 請證偽
A-4 | 結論＝老師 UI 讓第50組可見、可釋放，組數輸入上限與伺服器同為 50 | 稿內落點＝`openspec/changes/team-limit-50/tasks.md:20`「最大值改為 50」 | 理由＝純前端上限與伺服器不一致會造成使用流程矛盾 | 已自對碼＝web `35 passed`，新增 UI 測試 `2 passed` | 請證偽
A-5 | 結論＝300 條 WebSocket 在本次本機探針均收斂，實測 p95 遠低於 2 秒門檻；不把結果表述為外部 SLA | 稿內落點＝`openspec/changes/team-limit-50/design.md:95`「這不是外部 SLA」 | 理由＝此卡僅本機模擬且需涵蓋 50×6 裝置上限 | 已自對碼＝`300/300` 一致，p95 `55.1 ms` | 請證偽

## 3 上輪藥方落點
提案紅隊藥方：隔離測試方向錯誤 → `server/tests/test_isolation.py:60-83`，改由第2–50組提交後檢查第1組 WebSocket；原通道回驗 `CLEARED`。
提案紅隊藥方：額外欄位拒絕承諾未列任務 → `openspec/changes/team-limit-50/tasks.md:14` 增列於 2.2；原通道回驗 `CLEARED`。
提案架構通道同指出隔離接收方向覆蓋缺口 → 同一測試落點已改正，原通道結論 `CLEARED`。

## 4 有意不改
`docs/ai-logs/2026-11-*`、`openspec/changes/archive/*` 與舊 `openspec/specs/activity-lifecycle/spec.md` 保留 2–12 → 歷史對話、封存卡與現行主規格待合入後同步，不將舊基線紀錄改寫成本卡的當時事實。

## 5 未決呈裁
人工 768 px 與一般桌面操作尚未執行 → 傾向保持任務 4.2 未完成並待負責人／組員實際操作 → 阻塞最終都綠判定，不阻塞本輪程式碼差異檢視 → 呈負責人。

## 6 退出條件
本輪放行判據＝0 阻斷；任何重要項均已由本 diff 修正並有直接測試；不將未跑人工驗證標成通過。
輪次上限按 S 檔分檔表，觸頂即停；上限後只有淨回歸、使原修復失效、假綠掩蓋原病三類可阻塞，其餘寫 followup。

## 7 返回格式
一句話結論；每條發現含哪兒、什麼錯、具體後果、怎麼修、證據；指出外包檢查、查閱檔案；末行 `CLEARED` / `NOT CLEARED(nB/nM/nm)`。

## 8 預算
讀取面＝定點 `git diff HEAD`、上輪藥方落點、`git grep -n '2–12\|MAX_TEAMS\|max={12}' -- :/` 全集；未入庫新增測試與 dispatch 以 `rg` 補查。
返回長度＝20 行上限。
續用還是新起＝續用提案紅隊代理，保持同通道回驗且避免另派新評審。
