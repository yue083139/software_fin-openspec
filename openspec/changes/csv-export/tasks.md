# csv-export — tasks

## 0. 驗收先行

- [x] 0.1 更新 parity、驗收矩陣及人工驗證手冊。
- [x] 0.2 新增 CSV 單元測試：完整題目 × 組別、未作答列、答案跳脫、公式前綴、檔名。

## 1. 實作

- [x] 1.1 前端新增 CSV 產生與下載 helper，使用伺服器提供的結果與分數。
- [x] 1.2 老師活動控制區新增結束後可用的「下載完整結果 CSV」按鈕及說明。
- [x] 1.3 SpecKit 組同步相同行為與驗收。

## 2. 驗證

- [x] 2.1 OpenSpec 與 SpecKit web 測試、lint、typecheck 通過。
- [x] 2.2 `make gate-pr` 與兩組 `make gate-parity` 通過。
- [x] 2.3 完成人工驗證手冊場次 L；使用者回報通過，repo／commit 待補。
