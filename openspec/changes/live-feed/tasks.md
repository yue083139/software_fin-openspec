# live-feed — tasks（v1.1）

## 1. 驗收測試（先寫，先紅）
- [x] 1.1 `web/src/pages/livefeed.test.tsx`：`feedEvents` 五例（第一個 view 當基準、經典搶下／送出、非經典一律送出、無新送出與非搶答中不出、文案不含答案）；hook 三例（新送出跳通知、開頁不跳；斷線重連後第一個新 view 只當基準；伺服器重啟後新一輪照跳）；學生頁一例（無快訊）

## 2. 實作
- [x] 2.1 `web/src/pages/LiveFeed.tsx`：`feedEvents`＋`useLiveFeed`
- [x] 2.2 `web/src/pages/Teacher.tsx`：`useLiveView` 之後呼叫 `useLiveFeed`
- [x] 2.3 `web/src/main.tsx`：`<AntApp notification={{ maxCount: 4 }}>`
- [x] 2.4 `docs/parity.md` §4／§5 登記；`eval/acceptance/matrix.yaml` 新增 M-029；`docs/manual-verification.md` 新增場次 J

## 3. 驗證
- [x] 3.1 `npm --prefix web test` 連跑兩次、`lint`、`typecheck` 綠；變異實錄
- [x] 3.2 評審（架構全卡掃＋對抗 diff；兩通道同指重連基準，v1.1 改程式照規格並補測試）
- [ ] 3.3 人工驗證（`docs/manual-verification.md` 場次 J）
