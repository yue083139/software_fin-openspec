## 0 抬頭
評審對象＝`openspec/changes/team-limit-50/{proposal.md,design.md,specs/activity-lifecycle/spec.md,tasks.md}` @ v1.0；本輪實作 diff 及其測試、文件。
基線＝dev `1339d4436ad1e0aaa3d54d8d4ef08acf59e4233d`；本輪 commit＝未提交工作樹（請自行檢查 `git diff HEAD`）。
通道＝架構；不告知輪次、不告知其他通道結論。
約束＝唯讀；勿改工作樹；勿跑會呼叫雲端 API 的指令。門禁由主 agent 統一真跑並附輸出。
知識時點＝2026-11-28。

## 1 範圍
本輪＝定點：本卡相對 HEAD 的 diff；聚焦 API/domain/UI 邊界一致、沿用單一路徑及規格與實作對齊。
本卡至今全卡掃次數＝1（提案輪已完成；本輪為 S 檔唯一實作輪）。

## 2 斷言清單
A-1 | 結論＝50 組擴容沿用單一 `Activity.teams`、現有 join/release/token/view/WebSocket 路徑，不建立旁路 | 稿內落點＝`openspec/changes/team-limit-50/design.md:25`「不新增大班模式或第二份組別集合」 | 理由＝避免憑證撤銷與狀態同步分岔 | 已自對碼＝全量 server 測試 `248 passed` | 請證偽
A-2 | 結論＝API 接受 JSON 整數且拒絕布林、小數、字串及額外欄位，domain 仍保留 2–50 防線 | 稿內落點＝`openspec/changes/team-limit-50/design.md:43`「嚴格接受整數 JSON 值」 | 理由＝FastAPI/Pydantic 型別轉換不可放寬契約 | 已自對碼＝非法輸入基線曾 `2 failed, 7 passed`；現 server `248 passed` | 請證偽
A-3 | 結論＝50 組只改組數，不改每組 6 台、階段、公平順位、學生隔離語意 | 稿內落點＝`openspec/changes/team-limit-50/specs/activity-lifecycle/spec.md:14-30` | 理由＝需求範圍只擴容，不重設核心狀態機與競速規則 | 已自對碼＝全量 server `248 passed`、300 連線 `300/300` | 請證偽
A-4 | 結論＝UI 可見上限與後端上限同為 50，窄畫面行為未在程式碼中擅自擴大為新互動 | 稿內落點＝`openspec/changes/team-limit-50/design.md:80-90` | 理由＝本卡不引入分頁／搜尋等新產品語意 | 已自對碼＝新增 UI `2 passed`、web 全套 `35 passed` | 請證偽
A-5 | 結論＝2 秒探針門檻是課堂 Demo 的產品取捨，不宣稱服務等級，測量只證明本次本機觀測值 | 稿內落點＝`openspec/changes/team-limit-50/design.md:95`「這不是外部 SLA」 | 理由＝本機模擬場景沒有外部服務承諾 | 已自對碼＝300/300 一致，p95 55.1 ms，最慢 55.3 ms | 請證偽

## 3 上輪藥方落點
提案架構通道指出隔離接收方向需覆蓋 → `server/tests/test_isolation.py:60-83` 改成第2–50組送出後觀察第1組接收端，已回驗 `CLEARED`。
提案紅隊指出額外欄位拒絕需列任務 → `openspec/changes/team-limit-50/tasks.md:14` 已列入 2.2，實作為 `TeamsBody` 的 `extra="forbid"`。

## 4 有意不改
`docs/ai-logs/2026-11-*`、`openspec/changes/archive/*`、主規格舊基線保留 2–12 → 歷史紀錄待主規格合入後由 archive 流程更新，不回寫舊卡當時事實。

## 5 未決呈裁
768 px 與一般桌面人工操作未執行 → 傾向任務 4.2 保持未完成，待實際操作者記錄 → 阻塞最終都綠判定、不阻塞本輪程式碼檢視 → 呈負責人。

## 6 退出條件
本輪放行判據＝0 阻斷；重要項均已修正且有測試直接覆蓋；不得把未跑人工驗證當作通過。
輪次上限按 S 檔分檔表，觸頂即停；上限後只有淨回歸、使原修復失效、假綠掩蓋原病三類可阻塞，其餘寫 followup。

## 7 返回格式
一句話結論；每條發現含哪兒、什麼錯、具體後果、怎麼修、證據；指出外包檢查、查閱檔案；末行 `CLEARED` / `NOT CLEARED(nB/nM/nm)`。

## 8 預算
讀取面＝定點 `git diff HEAD`、上輪藥方落點、`git grep -n '2–12\|MAX_TEAMS\|max={12}' -- :/` 全集；未入庫新增測試與 dispatch 以 `rg` 補查。
返回長度＝20 行上限。
續用還是新起＝續用提案架構代理，維持通道獨立性並避免重複派單。
