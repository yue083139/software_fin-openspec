# web-workbench — design（v1.0）

知識時點：2026-11-26。參考對象 `C:\workspace\resolve\apps\console`（antd 5、液態玻璃視覺）。

## 背景

負責人 2026-11-26 人工驗證全流程後指出前端「太簡陋」，指定參考 resolve 的後台工作檯，並裁「引入 antd 重寫」（非純 CSS 移植）。現行 web 為 React 19＋純 CSS（`web/src/styles.css` 約 30 行）。

## 決策

### D1 依賴：antd 5.29.3＋icons 5.6.1＋React 19 相容補丁 1.0.3，精確版本

- 取 npm 上 2026-11-12 之前發布的 5.x 最新版（`npm view antd time`：5.29.3 發布於 2025-12-18；icons 5.6.1 於 2025-02-07）。antd 5 官方支援 React 18，React 19 需 `@ant-design/v5-patch-for-react-19`（其 peerDependencies：`antd >=5.22.6`、`react >=19.0.0`），於 `main.tsx` 最先匯入。
- 證偽欄｜可證偽：`npm --prefix web run build` 成功；屬取捨：antd 6 原生支援 React 19，但與 resolve（antd 5）主題 token 名稱與元件 API 有差，選 5 以便直接對照 resolve 的主題取值。

### D2 視覺單一出處

- `web/src/theme.ts`：`palette`（主色 `#0f7c83`、文字三階灰、發絲線、光暈四色）、`quizTheme`（antd token 與元件覆寫）、`cssVars()`（注入 `--qz-*`）。`styles.css` 不寫色值常量，只讀 `--qz-*` 與玻璃材質的白色透明度。
- 三層：背景光暈（`Backdrop`，四團模糊色塊緩慢漂移，`prefers-reduced-motion` 時停止）→ 內容卡（半透明白、不做背景模糊）→ 玻璃功能層（頂欄、側欄，`backdrop-filter`）。
- 證偽欄｜屬取捨：只取 resolve 的視覺語言；不搬其滑鼠追光、折射等特效（成本高、對本專案無功能價值）。

### D3 老師頁版型：左側導覽＋內容卡，全部同時渲染

- 頂欄：品牌、階段膠囊（`PhaseTag`）、模式與題目來源膠囊。
- 左側導覽（antd `Menu`）：活動控制、模式、作答狀況與結果、學生連結、Google 帳號、題目與匯入、組別與裝置；點擊以 `scrollIntoView` 捲到對應卡（卡有 `id`，`scroll-margin-top` 讓頂欄不遮標題）。寬度 ≤900px 時導覽改在內容上方。
- 作答狀況表改 antd `Table`（`bordered`、`scroll.x`、`summary` 列放各組分數），得主格加底色（`onCell` → `winner`）。
- 證偽欄｜屬取捨：不做分頁切換——搶答中老師要同時看控制鈕與作答表，切頁會多一步；可證偽：`TeacherPanel` 整頁渲染的既有測試全綠。

### D4 學生頁與首頁：置中窄版卡片

- 學生頁頂欄顯示組別與階段膠囊；每題一張卡，子題以「題目敘述 → 子題標籤 → 大尺寸輸入欄」排列，「搶答送出」為整列主按鈕；已送出以成功提示顯示。結果頁以分數統計塊＋每題卡呈現。
- 首頁：學生選組大按鈕格、老師金鑰欄（`Input.Password`，避免投影時露出）。
- 證偽欄｜可證偽：本機 8010 埠截圖（`verification.md`）；手機寬度人工驗證。

### D5 行為與文案不變；測試只改查詢方式

- 所有按鈕文字、`aria-label`、提示句沿用；兩字按鈕關閉 antd 自動插空白（`Btn` 與 `ConfigProvider button.autoInsertSpace=false`），否則「釋放」會變「釋 放」。
- antd 按鈕把文字包在 `<span>`，`getByText(...)` 取到的是 `<span>`；停用判定改查外層 `<button>`（`web/src/test-utils.ts` 的 `btn`／`allBtn`），斷言本身不改。
- 證偽欄｜可證偽：`npm --prefix web test` 41 passed；`git diff` 中測試檔只有查詢函式改變。

### D6 學生連結卡（為 `student-qr` 預留）

- 顯示 `view.student_url ?? window.location.origin + "/"` 的連結與 antd `QRCode`；`TeacherView.student_url?: string` 型別預留，伺服器欄位由 `student-qr` 卡加入。
- 證偽欄｜屬取捨：本卡先用本頁 origin，在 127.0.0.1 下手機掃了連不到——由 `student-qr` 的公開通道網址解決。
