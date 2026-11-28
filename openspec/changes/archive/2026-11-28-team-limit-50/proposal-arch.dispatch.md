## 0 抬頭

評審對象＝`openspec/changes/team-limit-50/{proposal.md,design.md,specs/activity-lifecycle/spec.md,tasks.md}` @ v1.0（各件標題同為 v1.0）
基線＝dev `1339d4436ad1e0aaa3d54d8d4ef08acf59e4233d`；本輪 commit＝未提交工作樹相對該基線的 `team-limit-50` 提案與驗收測試改動
通道＝架構；不告知輪次、不告知其他通道結論
約束＝唯讀；只檢本派單列出的變更、斷言與相關權威規格；禁呼叫雲端 API
知識時點＝2026-11-28

## 1 範圍

本輪＝全卡掃：規格文件組＋驗收矩陣與門禁腳本現狀；核對能力邊界、API 契約、需求與 parity 對齊、證偽欄事實輸出及容量方案。
本卡至今全卡掃次數＝0（本輪為首次提案全卡掃）。

## 2 斷言清單

A-1 | 結論＝300 條本機 WebSocket 的 p95 門檻設為 2 秒，這是課堂 Demo 可操作性門檻而非服務等級承諾 | 稿內落點＝`openspec/changes/team-limit-50/design.md:95`「2 秒門檻屬取捨」 | 理由＝本機模擬需要及時更新，沒有對外 SLA | 已自對碼＝`probes/results/2026-11-27-team-limit-50-capacity.txt` 記錄 300 條連線、p95 51.7 ms、300/300 狀態一致 | 請證偽

## 3 上輪藥方落點

無（首次提案輪）。

## 4 有意不改

`docs/requirements.md:14` 的 R-01 與 `docs/requirements.md:24` 的 R-11 | 本卡依需求編號涵蓋身分與同步，不改需求基線。
`contracts/api.md:32` 的既有 `POST /api/teacher/teams` | 沿用 endpoint，只更新 count 範圍，契約已列於本次工作樹。
`openspec/specs/team-mode/spec.md:26` 的每組 6 台限制 | 以 50 × 6 驗證，不放寬每組限制。
模式、順位、隔離、階段、憑證與 Guided Notes 其他規則 | 維持既有能力邊界；改動只修改 `activity-lifecycle` 的組數需求。

## 5 未決呈裁

無。人工畫面判據為 768 px 視窗 30 秒內找到並操作第50組；未達即另立 UX 卡。

## 6 退出條件

本輪放行判據＝0 阻斷；所有重要發現須有四件套內落點；評審報告末行為 `CLEARED`。
S 檔提案輪只派一次；藥方由同通道回驗，輪次上限後只阻塞淨回歸、原修復失效或假綠掩蓋原病。

## 7 返回格式

按 finder-tail-arch 格式回報一句話結論；每條發現列哪兒、什麼錯、具體後果、怎麼修、證據；補「外包檢查」與查閱檔案；末行 `CLEARED` / `NOT CLEARED(nB/nM/nm)`。

## 8 預算

讀取面＝全卡掃：四件套、權威需求與 parity、契約、現有 capability specs、`eval/acceptance/matrix.yaml`、容量探針及門禁現狀；不讀未列變更的其他產品功能。
返回長度＝40–60 行上限。
續用還是新起＝新起獨立唯讀評審，與作者不同會話。
