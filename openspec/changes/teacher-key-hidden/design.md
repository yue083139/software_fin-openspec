# teacher-key-hidden — design（v1.1）

> 與 SpecKit 組 `specs/015-teacher-key-hidden/research.md` R1–R3 一一對應（D_n＝R_n）。知識時點：2026-11-26。

## D1 自網址移除：`history.replaceState`

- 老師頁路由為 hash（`#/teacher?key=…`）。`takeTeacherKey()` 解析 hash，有 `key` ⇒ 存 sessionStorage、刪 `key` 後以 `history.replaceState(history.state, "", pathname+search+"#/teacher"+其餘參數)` 改寫網址並回傳金鑰；無 `key` ⇒ 回傳 sessionStorage 值或 `""`。
- `replaceState` 取代目前紀錄項，不新增紀錄，也不觸發 `hashchange`（不會重複執行）；`App` 在首次載入與每個 `hashchange` 監聽器裡直接呼叫 `takeTeacherKey()`，再讀 replaceState 之後的 `location.hash` 存入狀態（v1.1 架構阻斷藥方：放在 render 的 `useMemo` 時，同分頁重貼同一網址 React 不重繪、key 留在網址列）；`<Teacher key={teacherKey}>` 讓金鑰一換就重新掛載，錯誤狀態不沿用。首頁「進入老師頁」連結（`#/teacher?key=…`）照舊。
- 外送面：hash 本來就不隨 HTTP 請求送出（不在 Referer、不在伺服器日誌）；本卡再去掉網址列與上一頁／下一頁紀錄項。**不保證**：瀏覽器「記錄」頁與網址列自動完成可能保留最初貼上的完整網址（瀏覽器在導覽時即記錄造訪），本卡不處理，手冊註明錄影前的做法。
- 證偽欄｜可證偽：`route.test.ts`「網址帶 key」例斷言 `location.hash === "#/teacher"` 且 `location.href` 不含金鑰。

## D2 存放：本分頁 sessionStorage

- 鍵 `qz_teacher_key`；不寫 localStorage、cookie。學生組別憑證另用自己的 sessionStorage 鍵（`api.ts`），兩者互不讀取。
- 證偽欄｜屬取捨：同源腳本可讀 sessionStorage；但金鑰原本就在 `location.href`，同源腳本同樣讀得到，風險面不增；前端以 React 文字節點渲染，`git grep dangerouslySetInnerHTML -- web/src` 零命中。可證偽：`route.test.ts`「不寫 localStorage」例。

## D3 金鑰錯誤即清除

- 只有 detail 為「需要老師金鑰」的 REST 401（`api.ts` `isBadTeacherKey`；開頁時 `googleStatus` 最先發出）或 WebSocket 4401 ⇒ `clearTeacherKey()` 並顯示整頁「老師金鑰錯誤」（說明「請用啟動伺服器時終端機印出的完整老師頁網址重新開啟，或回首頁重新輸入金鑰。」）（`BadKeyNotice`，與 `teacher-key-error` 同名同文案）。Google 未登入／過期同樣回 401（`app.py` Google 例外處理），**不**清金鑰，照舊顯示 Google 訊息（v1.1 對抗阻斷藥方）。
- 伺服器對錯誤金鑰的 WebSocket 在交握前以 HTTP 403 拒絕，瀏覽器只見 1006（student-qr 已記 followup）；本卡靠 REST 401 路徑讓錯誤頁顯示得出來，不改伺服器；`teacher-key-error` 合入後改為 accept 後以 4401 關閉，屆時 4401 路徑直接生效。
- 證偽欄｜可證偽：`teacherkey.test.tsx`——金鑰 401 ⇒ 錯誤頁＋清除；Google 401 ⇒ 不清、顯示 Google 訊息；操作回金鑰 401 ⇒ 清除；4401 ⇒ 清除。`app.test.tsx`——重貼同一網址仍移除 key；先錯後對錯誤頁消失。變異實錄見 verification。
