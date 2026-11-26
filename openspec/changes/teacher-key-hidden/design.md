# teacher-key-hidden — design（v1.0）

> 與 SpecKit 組 `specs/015-teacher-key-hidden/research.md` R1–R3 一一對應（D_n＝R_n）。知識時點：2026-11-26。

## D1 自網址移除：`history.replaceState`

- 老師頁路由為 hash（`#/teacher?key=…`）。`takeTeacherKey()` 解析 hash，有 `key` ⇒ 存 sessionStorage、刪 `key` 後以 `history.replaceState(history.state, "", pathname+search+"#/teacher"+其餘參數)` 改寫網址並回傳金鑰；無 `key` ⇒ 回傳 sessionStorage 值或 `""`。
- `replaceState` 取代目前紀錄項，不新增紀錄，也不觸發 `hashchange`（不會重複執行）；`App` 以 `useMemo(..., [hash])` 在 hash 改變時重算，首頁「進入老師頁」連結（`#/teacher?key=…`）照舊。
- 外送面：hash 本來就不隨 HTTP 請求送出（不在 Referer、不在伺服器日誌）；本卡再去掉網址列與瀏覽紀錄這兩處。
- 證偽欄｜可證偽：`route.test.ts`「網址帶 key」例斷言 `location.hash === "#/teacher"` 且 `location.href` 不含金鑰。

## D2 存放：本分頁 sessionStorage

- 鍵 `qz_teacher_key`；不寫 localStorage、cookie。學生組別憑證另用自己的 sessionStorage 鍵（`api.ts`），兩者互不讀取。
- 證偽欄｜屬取捨：同源腳本可讀 sessionStorage；但金鑰原本就在 `location.href`，同源腳本同樣讀得到，風險面不增；前端以 React 文字節點渲染，`git grep dangerouslySetInnerHTML -- web/src` 零命中。可證偽：`route.test.ts`「不寫 localStorage」例。

## D3 金鑰錯誤即清除

- REST 401（開頁時 `googleStatus` 最先發出）或任何老師操作回 401 ⇒ `clearTeacherKey()` 並顯示既有錯誤頁「老師金鑰錯誤，請回首頁重新輸入。」；WebSocket 關閉碼 4401 同樣清除。
- 伺服器對錯誤金鑰的 WebSocket 在交握前以 HTTP 403 拒絕，瀏覽器只見 1006（student-qr 已記 followup）；本卡靠 REST 401 路徑讓錯誤頁顯示得出來，不改伺服器。
- 證偽欄｜可證偽：`teacherkey.test.tsx`（fetch 回 401 ⇒ 錯誤頁出現且 sessionStorage 清空）。
