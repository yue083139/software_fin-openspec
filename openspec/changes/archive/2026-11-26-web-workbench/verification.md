# web-workbench — verification（v1.1）

## 門禁實錄

- `npm --prefix web test` 連跑三次全量（`testTimeout`／`hookTimeout` 30 秒、預先匯入 antd、倒數測試截止改在 `it()` 內起算之後）：
  - 第 1 次：`Tests  41 passed (41)`
  - 第 2 次：`Tests  41 passed (41)`
  - 第 3 次：`Tests  41 passed (41)`
  - （另以 `npx vitest run` 連跑 5 次，5 次皆 `Tests  41 passed (41)`）
- 修前實錄（評審實跑與作者重現）：`× 只顯示進行中那一題與倒數`「AssertionError: expected '10 秒' to match /1[45] 秒/」、「expected '13 秒' …」；另有 `Test timed out in 5000ms`。
- `npm --prefix web run typecheck`、`run lint`：無錯誤。
- `npm --prefix web run build`：`✓ built in 3.13s`（另有 antd 造成的 chunk 大於 500 kB 提示，不影響）。
- `styles.css` 色值：`grep -nE '#[0-9a-fA-F]{3,6}\b|rgba?\(' web/src/styles.css` 無輸出；`grep -n 'var(--qz-[a-z0-9-]*,' web/src/styles.css`（備用值）無輸出。

## 截圖（本機 8010 埠，`group.xlsx`，經典搶答、搶答中）

- 老師頁：玻璃頂欄（搶答中、經典搶答、group.xlsx 膠囊）＋左側導覽＋活動控制卡、模式卡、作答狀況表（題號欄含題目敘述）。
- 學生頁：置中卡片；第 1 題（題組）兩個子題各自的題目敘述在輸入欄上方，「搶答送出」整列按鈕。
- 截圖不入庫（含本機網址）；存於作者會話暫存目錄。

## 評審紀錄

- 提案輪架構通道：CLEARED（0B/1M/3m）。重要：antd 首次渲染逾時致測試時綠時紅 ⇒ `vite.config.ts` 逾時 30 秒、`test-setup.ts` 預先匯入 antd。次要：D5 文案範圍過寬 ⇒ 改寫並列標題與頁首調整清單；`styles.css` 寫死色值 11 處 ⇒ 全改讀 `--qz-*`、去備用值；`theme.ts` 註解「glass.css」⇒ `styles.css`。
- 實作輪對抗通道：NOT CLEARED（0B/1M/0m）。重要：`timed.test.tsx` 倒數測試截止時刻在 describe 收集時算好 ⇒ 移進 `it()` 內以渲染當下起算（斷言不變）。
- followup（不改）：xlsx 上傳改成 antd `Upload` 後「選檔不送出、按『上傳 xlsx』才送」這條路徑沒有元件測試；主人 @yue083139，併入 `student-qr` 或後續卡補測。

## 人工驗證（需求 P-05）

狀態：**已執行**（整合後的本地棧，經 `docs/manual-verification.md` 場次 A、F、G）。

結果：✅ 全部符合（jinny／2026-11-26／`dev` `1639b7a`，Windows 11＋Chrome）。老師工作台（左側導覽、Google 帳號、題目清單、結果表、判對錯按鈕、匯出、學生連結 QR code）於場次 A 第 6～18 步、F、G 全程操作正常，無跑版或失效。
