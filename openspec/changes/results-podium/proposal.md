# results-podium — 活動結束後顯示前三名領獎台（v1.0）

檔位：**B**（只改 web 畫面；不碰判定、隔離、階段狀態機與契約）｜主人：@jinny950103（負責人 @yue083139 終審）｜parity：`docs/parity.md` §4 `results-podium`｜需求：R-04、R-08、X-04｜依賴：`results-view`、`question-settings`（分數欄名）
來源：負責人 2026-11-27 同意成員自行開卡（「你有想改的可以拉出去改」「兩個專案都一起改這樣才有同步」）；成員提議「揭曉後顯示前三名領獎台」。

## 首屏決策摘要

1. **只用結束後 view 既有的 `team_scores`，不改伺服器**：老師 view 任何階段都有 `team_scores`、學生 view 只在 `ended` 才有（`server/quiz_server/views.py`「只有 ended 才揭曉完整結果」），領獎台只在 `ended` 畫出，不新增任何送往學生端的欄位／可被 `podium.test.tsx`「搶答中不顯示」證偽。
2. **名次口徑同伺服器 `results.leaderboard`**：同分同名次、下一名跳號（1、1、3），同名次依組別順序；名次 > 3 不上台／可被 `podiumPlaces` 四例證偽。
3. **0 分不上台、沒有組別得分整塊不顯示**：避免「全部 0 分還頒獎」／可被「沒有組別得分就不顯示領獎台」證偽。
4. **學生端標出本組**（「本組」標籤），老師端不標／可被「學生結果標出本組」證偽。

**矩陣落點**：新增 M-028（R-04、R-08、X-04）守門 `web/src/pages/podium.test.tsx`。

**merge 三問第三問**：R-04／R-08 結果檢視的呈現強化；揭曉時有領獎台是 Kahoot 等課堂搶答產品的標準收尾，提升 Demo 與課堂參與感（X-04 活動品質）；只動前端，範圍成本小。

## 目標
- 新增 `web/src/pages/Podium.tsx`：`podiumPlaces(scores)` 純函式＋`Podium` 元件（亞軍、冠軍、季軍由左到右，台高區分名次，獎牌圖示）。
- `Teacher.tsx`：`phase === "ended"` 時在「作答狀況與結果」上方顯示領獎台。
- `Results.tsx` 的 `StudentResults`：「搶答結果」下方顯示領獎台並標出本組。
- `styles.css`：領獎台樣式，顏色只用既有 `--qz-*` 變量。

## 邊界
- 不改伺服器、view 欄位、`contracts/`；名次表 `Leaderboard`（時間計分進行中）不變。
- 不加動畫與音效（另卡再議）。

## 驗收

| # | 指令 | 期望 |
|---|---|---|
| 1 | `npm --prefix web test` | `podium.test.tsx` 13 例與既有測試全綠（連跑兩次） |
| 2 | `npm --prefix web run lint`、`run typecheck` | 無錯 |
| 3 | 人工驗證 | 經典搶答結束 ⇒ 老師頁與學生頁出現領獎台，名次與分數表一致；檢查答錯後名次即時跟著變；全部 0 分不出現 |

## 實錄結果
見 `verification.md`。
