# web-workbench — 前端改用 antd 工作檯版型（v1.1，提案輪架構 CLEARED、實作輪對抗藥方已落）

檔位：**B**（介面流程與版面；行為、文案、作答隔離與 API 不變）｜主人：@yue083139｜parity：`docs/parity.md` §4 `web-workbench`（已登記）｜需求：R-01、R-04｜依賴：`question-text`（從 `feat/question-text` 50c3605 起）

## 首屏決策摘要

1. **引入 antd 5（精確版本 5.29.3）＋`@ant-design/icons` 5.6.1＋`@ant-design/v5-patch-for-react-19` 1.0.3**（負責人 2026-11-26 裁「引入 antd 重寫」）／代價：前端 bundle 由約 244 kB 增至約 1.2 MB（未壓縮），本機使用可接受／可被 `npm --prefix web run build` 證偽。
2. **視覺語言仿 resolve 工作檯**：色票單一出處 `web/src/theme.ts`（主色 `#0f7c83`）、背景光暈＋玻璃頂欄與側欄 `web/src/styles.css`／屬取捨：只取視覺與版型，不搬 resolve 業務碼、不引路由與資料快取套件。
3. **老師頁＝左側導覽＋內容卡**；導覽點擊捲動到對應卡，**所有卡同時渲染**（不做分頁切換）／理由：老師搶答中要同時看控制鈕與作答表；既有元件測試以 `TeacherPanel` 整頁渲染斷言，不需改語意。
4. **學生頁與首頁＝置中窄版卡片**，手機寬度可用（`student-qr` 將讓學生以手機掃碼進入）／可被人工驗證（手機寬度截圖）證偽。
5. **行為、按鈕文字、`aria-label` 與提示句不變**（卡片標題與頁首依新版型調整，清單見 design D5）：測試只把「找按鈕」從文字節點改為其外層 `<button>`（antd 把文字包在 `<span>`），斷言不改／可被 `npm --prefix web test` 41 項全綠證偽。

**矩陣落點**：無新列——不新增行為；M-001、M-002、M-004 的 web 守門（`web/src/pages/*.test.tsx`）全數沿用並維持綠。

**merge 三問第三問**：負責人 2026-11-26 驗證全流程後指出前端「太簡陋」，指定參考 resolve 工作檯；Demo 影片佔 20%、評分含介面完整度，且須在錄影前完成。

## 目標

- `web/package.json`：三個依賴（精確版本）。
- `web/src/theme.ts`、`web/src/ui.tsx`（`Btn`、`PhaseTag`、`Section`、`Backdrop`、`GlassHeader`）、`web/src/Shell.tsx`、`web/src/styles.css`、`web/src/main.tsx`（`ConfigProvider` 繁中語系＋主題）。
- 頁面：`Teacher`、`Student`、`Home`、`AnswerForm`、`Results`、`ImportPanel`、`GooglePanel`、`Round` 改用 antd 元件。
- 老師頁「學生連結」卡：顯示學生網址與 QR code（`view.student_url ?? 本頁 origin`；伺服器欄位由 `student-qr` 卡提供）。
- 測試：`web/src/test-utils.ts`（`btn`、`allBtn`）、`test-setup.ts` 補 `matchMedia`／`ResizeObserver`／canvas。

## 邊界（本卡不做）

- 伺服器、`contracts/`、`docs/parity.md` 不動；`student_url` 欄位由 `student-qr` 卡加。
- 深色模式、多語系切換、路由套件。

## 驗收

| # | 指令 | 期望輸出 |
|---|---|---|
| 1 | `npm --prefix web test` | 41 passed（斷言語意不變） |
| 2 | `npm --prefix web run typecheck`、`run lint` | 無錯誤 |
| 3 | `npm --prefix web run build` | `✓ built`（只有 chunk 大小提示） |
| 4 | `make gate-pr` | 除 parity（SpecKit 組待同步）外全綠 |
| 5 | 人工驗證 | 老師頁左側導覽可捲動到各卡、學生頁手機寬度可作答（截圖見 `verification.md`） |
