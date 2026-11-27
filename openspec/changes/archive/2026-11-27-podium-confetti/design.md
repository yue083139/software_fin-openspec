# podium-confetti — design（v1.0）

> 與 SpecKit 組 `specs/020-podium-confetti/research.md` R1–R4 一一對應（D_n＝R_n）。知識時點：2026-11-27。

## 背景與對標

- 對標 Kahoot：一局結束顯示領獎台時伴隨彩帶與音效（知識時點 2026-11，依公開產品操作經驗）。
- 本系統 `results-podium` 已有靜態領獎台，缺揭曉當下的視覺高潮。裁剪：只做一次性彩帶，不做音效、不做逐名揭曉。

## 決策

### D1 純 CSS 動畫、不加套件
- `Confetti` 輸出 36 個 `<span>`，以 `qz-confetti-fall` 關鍵影格從卡片上緣落下 320px、旋轉並淡出；`animation-iteration-count: 1; animation-fill-mode: forwards`，播完停在透明。
- 不引入 canvas-confetti 之類套件：不改 `package.json`／鎖檔，兩組依賴不必同步。
- 證偽欄｜可證偽：「領獎台出現時灑彩帶，且對讀屏軟體隱藏」（36 片）；變異拿掉 `<Confetti />` ⇒ 3 failed。

### D2 位置與顏色以索引算出固定值
- `left＝(i×37) mod 100 %`、延遲 `(i mod 9)×0.12s`、時長 `2.2＋(i mod 5)×0.3s`、橫向漂移與旋轉亦由 `i` 決定；`key＝i`。
- 理由：render 內取亂數會讓每次推播重繪都換新 key／新樣式 ⇒ 動畫重播（經典搶答檢查答錯時名次會即時變，彩帶不該一直重灑）；固定值也讓測試可重現。
- 只有 `Podium` 重新掛上（`phase` 轉 `ended`、重新整理）才再灑一次。
- 另一條重新掛上路徑（評審 followup，接受）：經典搶答結束後老師把所有得分組都判答錯 ⇒ 全部 0 分、領獎台卸下；再判回答對 ⇒ 領獎台重新出現並再灑一次。符合「領獎台出現就灑」的語意，不另記「本場已灑過」旗標。
- 證偽欄｜可證偽：「分數更新重繪時彩帶不重播（同一批元素）」；變異 `key` 改成含 `performance.now()` ⇒ 1 failed。

### D3 顏色只用 `--qz-*` 變量
- 六色輪替：`--qz-accent`、`--qz-accent-bright`、`--qz-danger`、`--qz-ok-text`、`--qz-glow-3`、`--qz-glow-4`（`theme.ts` 定義，`styles.css` 檔頭規定不寫色值常量）。
- 證偽欄｜可證偽：「每片彩帶位置與顏色固定，只用 --qz-* 變量」；變異改成 `#ff0000` ⇒ 1 failed。

### D4 無障礙與不干擾
- 容器 `aria-hidden="true"`（純裝飾）、`pointer-events: none`（不擋「答對／答錯」等按鈕）、`z-index: 1` 疊在卡片內；`#podium { overflow: hidden }` 讓彩帶不溢出卡片。
- `@media (prefers-reduced-motion: reduce)` 直接 `display: none`。
- 證偽欄｜可證偽：`aria-hidden` 由單元測試核；不擋點擊與減少動態效果由人工驗證場次 K 第 1、5 步核（jsdom 不計算版面與媒體查詢）。

## 風險
- 老師頁與學生頁同時揭曉各自灑一次，屬預期；彩帶落在卡片內，不影響其他區塊。
