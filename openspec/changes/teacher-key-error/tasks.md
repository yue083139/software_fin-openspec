# teacher-key-error — tasks（v1.0）

## 1. 驗收測試（先寫，先紅）
- [x] 1.1 `server/tests/test_api_host.py`：錯金鑰先交握後 4401（兩種 query）、公開 Host 4403 優先、錯金鑰連線後正常推播不受影響（實作前 3 failed）
- [x] 1.2 `web/src/live.test.tsx`：4401 不重連並回報關閉碼；`web/src/pages/qr.test.tsx`：BadKeyNotice 文案

## 2. 實作
- [x] 2.1 `server/quiz_server/app.py`：金鑰錯誤分支先 accept 再關
- [x] 2.2 `web/src/pages/Teacher.tsx`：`BadKeyNotice`
- [x] 2.3 `contracts/api.md` WebSocket 段補述；`docs/parity.md` §4／§5；矩陣 M-001 守門補

## 3. 驗證
- [ ] 3.1 `make gate-pr` 綠、web 連跑兩次
- [ ] 3.2 評審（架構全卡掃＋對抗 diff）
- [ ] 3.3 人工驗證（負責人整合後）
