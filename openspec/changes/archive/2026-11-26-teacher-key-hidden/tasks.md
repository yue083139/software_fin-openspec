# teacher-key-hidden — tasks（v1.1）

## 1. 驗收測試（先寫，先紅）
- [x] 1.1 `web/src/route.test.ts`：移除 key、存 sessionStorage、重新整理、覆寫、保留其他參數、不寫 localStorage、清除
- [x] 1.2 `web/src/pages/teacherkey.test.tsx`：金鑰 401 ⇒ 錯誤頁＋清除；Google 401 不清；操作 401 與 4401 清除；`web/src/app.test.tsx`：重貼同一網址、先錯後對（v1.1）
- [x] 1.3 `eval/acceptance/matrix.yaml` 新增 M-024

## 2. 實作
- [x] 2.1 `route.ts` `takeTeacherKey`／`clearTeacherKey`
- [x] 2.2 `App.tsx` 改用 `takeTeacherKey`
- [x] 2.3 `Teacher.tsx` 401／4401 清除並顯示錯誤頁
- [x] 2.4 `web/CLAUDE.md` 規範句＋`make sync-agents`；README；手冊場次 G；parity §4／§5

## 3. 驗證
- [x] 3.1 `make gate-pr`（web 連跑兩次）原樣輸出寫入 `verification.md`
- [x] 3.2 評審：提案輪架構通道（全卡掃）＋實作輪對抗通道（diff）
- [ ] 3.3 人工驗證（負責人，場次 G）
