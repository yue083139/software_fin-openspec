# teacher-key-hidden — 老師金鑰不留在網址列（v1.1）

> **v1.1（評審：架構全卡掃 NOT CLEARED 1B/2M/2m、對抗 diff NOT CLEARED 1B/0M/1m，藥方已落）**：架構阻斷——取金鑰放在 render 的 `useMemo`，同分頁重貼同一網址時 React 不重繪、key 留在網址列 ⇒ 改在載入與 hashchange 監聽器直接執行；重要——錯誤狀態不清、先錯後對卡在錯誤頁 ⇒ `<Teacher key={teacherKey}>` 重新掛載；合流統一用整頁 `BadKeyNotice`（同 `teacher-key-error`）。對抗阻斷——所有 401 都被當金鑰錯，Google 未登入時老師被踢出且金鑰被刪 ⇒ 只認 detail「需要老師金鑰」（`api.ts` `isBadTeacherKey`）；次要——兩個清除點補測試。

檔位：**B**（老師頁進場流程的使用者可感知變更；不碰搶答判定、作答隔離、契約與憑證）｜主人：@yue083139｜parity：`docs/parity.md` §4 `teacher-key-hidden`｜需求：R-01、X-04｜依賴：`teacher-key-error` 在本卡之後合入（伺服器對錯誤金鑰的老師 WebSocket 先 accept 再以 4401 關閉，由它做）

## 首屏決策摘要

1. **金鑰只經網址帶入一次，載入後以 `history.replaceState` 自網址移除**：網址列、上一頁／下一頁紀錄項、螢幕分享與錄影不再露出金鑰（瀏覽器「記錄」頁與網址列自動完成仍可能保留最初貼上的完整網址，屬瀏覽器行為，手冊場次 G 註明）／可被 `web/src/route.test.ts` 證偽（載入後 `location.href` 不含金鑰）。
2. **金鑰存本分頁 `sessionStorage`（`qz_teacher_key`）**：重新整理仍可用、關分頁即失效；不寫 localStorage 或 cookie／屬取捨：同分頁腳本可讀 sessionStorage，但本專案前端無 `dangerouslySetInnerHTML`、學生頁不讀此鍵；原本金鑰已在網址（同樣可被同頁腳本讀），風險不增。
3. **網址帶新 key 時以網址為準並覆寫；只有「需要老師金鑰」的 REST 401 或 WebSocket 4401 ⇒ 清除並顯示整頁「老師金鑰錯誤」（說明「請用啟動伺服器時終端機印出的完整老師頁網址重新開啟，或回首頁重新輸入金鑰。」）；Google 未登入的 401 照舊顯示訊息；金鑰一換老師頁重新掛載**／可被 `web/src/pages/teacherkey.test.tsx` 證偽。
4. **伺服器、契約、終端機輸出不變**：終端機仍印完整老師頁網址（含金鑰），老師複製貼上即可。

**矩陣落點**：新增 M-024（R-01、P-06）「老師金鑰載入後不留在網址列，只存本分頁 sessionStorage，金鑰錯誤即清除」，守門 `web/src/route.test.ts`、`web/src/pages/teacherkey.test.tsx`。

**merge 三問第三問**：負責人 2026-11-26 整合驗證時提出「金鑰會顯示在 url，可以隱藏嗎」；Demo 影片要錄老師頁，網址列露出金鑰即等於公開老師權限（經 student-qr 後老師端雖限本機，仍不應外露）。

## 為什麼

現行 `web/src/App.tsx:16`「`<Teacher teacherKey={route.params.get("key") ?? ""} />`」每次 render 都從網址取金鑰，金鑰一直留在網址列。

## 目標

- `web/src/route.ts`：`takeTeacherKey()`、`clearTeacherKey()`、`TEACHER_KEY_STORE`。
- `web/src/App.tsx`：老師頁以 `takeTeacherKey()` 取金鑰（隨 hash 改變重算）。
- `web/src/pages/Teacher.tsx`：REST 401（開頁查 Google 狀態即會遇到）與 4401 清除金鑰並顯示錯誤頁。
- `web/CLAUDE.md` 金鑰規範句改寫；README、`docs/manual-verification.md` 場次 G。

## 邊界（本卡不做）

- 伺服器以 HTTP 403 在交握前拒絕錯誤金鑰的 WebSocket（瀏覽器收不到 4401）——由 REST 401 路徑涵蓋顯示，伺服器不改。
- 老師登入機制改為 cookie session、金鑰輪替。

## 驗收

| # | 指令 | 期望輸出 |
|---|---|---|
| 1 | `npm --prefix web test -- src/route.test.ts src/pages/teacherkey.test.tsx src/app.test.tsx` | 載入後 hash 為 `#/teacher`、href 不含金鑰、sessionStorage 有金鑰；重新整理仍取得；新 key 覆寫；其他參數保留；401 清除並顯示錯誤；localStorage 為空；passed |
| 2 | `git grep -n "localStorage" -- web/src ':!*.test.*'` | 無輸出 |
| 3 | `make gate-pr` | 綠（web 連跑兩次） |
| 4 | 人工驗證 | `docs/manual-verification.md` 場次 G |

## 實錄結果

見 `verification.md`。
