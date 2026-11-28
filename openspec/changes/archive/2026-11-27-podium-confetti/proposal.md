# podium-confetti — 揭曉領獎台時灑彩帶（v1.0）

檔位：**B**（只改 web 畫面；不碰判定、作答隔離、階段狀態機與契約）｜主人：@jinny950103（負責人 @yue083139 終審）｜parity：`docs/parity.md` §4 `podium-confetti`｜需求：R-04、R-08、X-04｜依賴：`results-podium`
來源：負責人 2026-11-27 授權成員自行開卡、兩組同步；成員提議「揭曉領獎台時灑彩帶動畫」。

## 首屏決策摘要

1. **純 CSS 動畫、不加套件**：36 片 `<span>` 以 `@keyframes` 落下淡出／代價：效果比物理引擎類套件簡單／可被 `podium.test.tsx`「領獎台出現時灑彩帶」證偽。
2. **位置與顏色由索引算出固定值、不在 render 取亂數**：同一份 view 重繪時 DOM 不變、動畫不重播；只有領獎台重新掛上才再灑／可被「分數更新重繪時彩帶不重播」證偽。
3. **顏色只用既有 `--qz-*` 變量**（`styles.css` 規定不寫色值常量）／可被「只用 --qz-* 變量」證偽。
4. **無障礙**：`aria-hidden`、`pointer-events: none`、`prefers-reduced-motion` 時不顯示／前兩項可被「對讀屏軟體隱藏」證偽，第三項由人工驗證場次 K 第 5 步核。

**矩陣落點**：新增 M-030（R-04、R-08、X-04）守門 `web/src/pages/podium.test.tsx`（領獎台彩帶）。

**merge 三問第三問**：`results-podium` 的揭曉收尾強化，對標 Kahoot 結束彩帶，提升課堂參與感與 Demo 效果（X-04）；只改前端、不加依賴，範圍成本小。

## 目標
- `web/src/pages/Podium.tsx`：新增 `Confetti`（`CONFETTI_COUNT = 36`），在 `Podium` 卡片內第一個子元素。
- `web/src/styles.css`：`#podium` 相對定位並裁切溢出；`.qz-confetti` 疊層與 `qz-confetti-fall` 動畫；減少動態效果時隱藏。

## 邊界
- 不加音效；不改領獎台排名、顯示時機與資料來源（沿用 `results-podium`）。
- 不新增 npm 依賴。

## 驗收

| # | 指令 | 期望 |
|---|---|---|
| 1 | `npm --prefix web test` | `podium.test.tsx` 新增 4 例與既有測試全綠（連跑兩次） |
| 2 | `npm --prefix web run lint`、`run typecheck` | 無錯 |
| 3 | 人工驗證 | `docs/manual-verification.md` 場次 K：揭曉灑一次、改名次不重播、F5 再灑、減少動態效果不顯示 |

## 實錄結果
見 `verification.md`。
