# web-workbench — tasks（v1.1）

## 0. 提案前置
- [x] 0.1 讀 resolve 工作檯視覺單一出處（`theme.ts`、`glass.css`、`AdminShell.tsx`），只取色票、光暈、玻璃層與版型
- [x] 0.2 依賴版本：取 npm 上 ≥2 週前發布的 antd 5.x 最新版，精確版本寫入 `package.json`
- [x] 0.3 提案輪評審（架構通道，全卡掃）：CLEARED 0B/1M/3m，藥方併入 v1.1

## 1. 驗收（先改查詢方式，斷言不改）
- [x] 1.1 `web/src/test-utils.ts`：`btn`／`allBtn` 取文字外層 `<button>`
- [x] 1.2 `test-setup.ts`：`matchMedia`、`ResizeObserver`、canvas polyfill

## 2. 實作
- [x] 2.1 `theme.ts`、`ui.tsx`、`Shell.tsx`、`styles.css`、`main.tsx`
- [x] 2.2 老師頁：左側導覽＋玻璃頂欄（階段、模式、題目來源膠囊）＋內容卡；作答表改 antd `Table`
- [x] 2.3 學生頁、首頁：置中窄版卡片；題目敘述在輸入欄上方
- [x] 2.4 「學生連結」卡（QR code，`student_url` 型別預留）

## 3. 驗證
- [x] 3.1 typecheck、lint、test、build 全綠
- [x] 3.2 本機 8010 埠起棧截圖（老師頁、學生頁）
- [x] 3.3 實作輪評審（對抗通道，只掃 diff）：0B/1M/0m，倒數測試截止起算點已修
- [x] 3.4 人工驗證（整合後的本地棧；2026-11-26 jinny 以場次 A、F、G 執行，全部符合）
- [ ] 3.5 SpecKit 組同步 web 程式（逐字相同）、`make gate-parity` 綠
