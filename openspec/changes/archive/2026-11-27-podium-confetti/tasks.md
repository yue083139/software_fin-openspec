# podium-confetti — tasks（v1.0）

## 1. 驗收測試（先寫，先紅）
- [x] 1.1 `web/src/pages/podium.test.tsx`「領獎台彩帶」四例：出現時灑 36 片且 `aria-hidden`、沒有領獎台沒有彩帶、分數更新重繪不重播（同一批元素）、顏色只用 `--qz-*` 且位置分散

## 2. 實作
- [x] 2.1 `web/src/pages/Podium.tsx`：`Confetti`（`CONFETTI_COUNT`、索引決定位置／顏色／時序）
- [x] 2.2 `web/src/styles.css`：`#podium` 相對定位裁切、`.qz-confetti`、`qz-confetti-fall`、`prefers-reduced-motion` 隱藏
- [x] 2.3 `docs/parity.md` §4／§5 登記；`eval/acceptance/matrix.yaml` 新增 M-030；`docs/manual-verification.md` 新增場次 K

## 3. 驗證
- [x] 3.1 `npm --prefix web test` 連跑兩次、`lint`、`typecheck` 綠；變異實錄
- [x] 3.2 評審（架構全卡掃＋對抗 diff，皆 CLEARED；次要訂正已落，見 `verification.md`）
- [x] 3.3 人工驗證（`docs/manual-verification.md` 場次 K；2026-11-27 jinny 執行，兩組第 1～4 步全部符合）
