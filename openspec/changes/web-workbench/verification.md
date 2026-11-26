# web-workbench — verification（v1.0）

## 門禁實錄

- `npm --prefix web test`：`Tests  41 passed (41)`
- `npm --prefix web run typecheck`、`run lint`：無輸出（無錯誤）
- `npm --prefix web run build`：`✓ built in 839ms`（另有 antd 造成的 chunk 大於 500 kB 提示，不影響）

## 截圖（本機 8010 埠，`group.xlsx`，經典搶答、搶答中）

- 老師頁：玻璃頂欄（搶答中、經典搶答、group.xlsx 膠囊）＋左側導覽＋活動控制卡、模式卡、作答狀況表（題號欄含題目敘述）。
- 學生頁：置中卡片；第 1 題（題組）兩個子題各自的題目敘述在輸入欄上方，「搶答送出」整列按鈕。
- 截圖不入庫（含本機網址）；存於作者會話暫存目錄。

## 評審紀錄

（提案輪架構通道、實作輪對抗通道）

## 人工驗證（需求 P-05）

狀態：**待執行**（負責人，整合後的本地棧）。
