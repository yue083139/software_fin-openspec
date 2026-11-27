# results-podium — tasks（v1.0）

## 1. 驗收測試（先寫，先紅）
- [x] 1.1 `web/src/pages/podium.test.tsx`：`podiumPlaces` 五例（前三名與 0 分、1-1-3 跳號、第三名並列、三組並列第 1、全部 0 分）；畫面三例（左右順序與分數、0 分不顯示、學生標本組）；老師頁兩例（搶答中不顯示、結束後顯示）

## 2. 實作
- [x] 2.1 `web/src/pages/Podium.tsx`：`podiumPlaces`＋`Podium`
- [x] 2.2 `web/src/pages/Teacher.tsx`：`ended` 時於作答狀況與結果上方顯示
- [x] 2.3 `web/src/pages/Results.tsx`：`StudentResults` 顯示並標本組
- [x] 2.4 `web/src/styles.css`：領獎台樣式（只用 `--qz-*` 變量）
- [x] 2.5 `docs/parity.md` §4／§5 登記；`eval/acceptance/matrix.yaml` 新增 M-028

## 3. 驗證
- [x] 3.1 `npm --prefix web test` 連跑兩次、`lint`、`typecheck` 綠；變異實錄
- [ ] 3.2 評審（架構全卡掃＋對抗 diff）
- [x] 3.3 人工驗證（`docs/manual-verification.md` 場次 I；2026-11-27 jinny 執行，第 1～4 步全部符合）
