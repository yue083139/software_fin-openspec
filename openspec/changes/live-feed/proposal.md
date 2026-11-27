# live-feed — 搶答中老師頁即時搶答快訊（v1.0）

檔位：**B**（只改 web 老師頁畫面；不碰判定、作答隔離、階段狀態機與契約）｜主人：@jinny950103（負責人 @yue083139 終審）｜parity：`docs/parity.md` §4 `live-feed`｜需求：R-04、X-04｜依賴：`results-view`（老師 view `board`）、`web-workbench`（antd `App`）
來源：負責人 2026-11-27 授權成員自行開卡、兩組同步；成員提議「搶答中老師頁右上角跳出『第2組 搶下第 3 題！』」。

## 首屏決策摘要

1. **前端比對前後兩次老師 view 的 `board` 找新送出，不改伺服器**：老師 view 任何階段都有完整 `board`（results-view D2）／代價：快訊時刻＝推播到達時刻，不是伺服器接收時刻／可被 `livefeed.test.tsx`「經典搶答第 1 順位是『搶下』」證偽。
2. **第一個 view（開頁、重連）只當基準不出通知**：避免重整後把已有送出一次全跳出來／可被「第一次收到 view 只當基準」「開頁時不跳」證偽。
3. **只在搶答中、只經典搶答第 1 順位說「搶下」**：判定類模式第 1 順位不一定得分／可被「非經典模式一律『送出』」證偽。
4. **文案只含組別與題號、不含答案**：老師頁常投影給全班，答案不能先曝光／可被「文案不含答案」證偽。

**矩陣落點**：新增 M-029（R-04、X-04）守門 `web/src/pages/livefeed.test.tsx`。

**merge 三問第三問**：R-04「檢視搶答時的作答狀況」的即時呈現強化；課堂投影時讓全班感受搶答節奏（X-04 活動品質）；只動前端，範圍成本小。

## 目標
- 新增 `web/src/pages/LiveFeed.tsx`：`feedEvents(prev, next)` 純函式＋`useLiveFeed(view)` hook（antd `App.useApp().notification`，右上、3 秒）。
- `Teacher.tsx`：`useLiveView` 之後呼叫 `useLiveFeed`（在所有提早 return 之前）。
- `main.tsx`：`<AntApp notification={{ maxCount: 4 }}>`，快訊最多疊 4 則。

## 邊界
- 學生頁不加快訊（學生搶答中本來就看不到他組送出，作答隔離）。
- 不加音效（另卡再議）；不改作答狀況表本身。

## 驗收

| # | 指令 | 期望 |
|---|---|---|
| 1 | `npm --prefix web test` | `livefeed.test.tsx` 6 例與既有測試全綠（連跑兩次） |
| 2 | `npm --prefix web run lint`、`run typecheck` | 無錯 |
| 3 | 人工驗證 | `docs/manual-verification.md` 場次 J：新送出跳快訊、重整不重跳、學生頁無快訊 |

## 實錄結果
見 `verification.md`。
