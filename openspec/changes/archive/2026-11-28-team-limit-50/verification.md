# team-limit-50 驗證紀錄

- 日期：2026-11-28（Asia/Taipei）
- 分支：`feat/team-limit-50`；基線 HEAD：`1339d4436ad1e0aaa3d54d8d4ef08acf59e4233d`
- 個資：僅使用合成答案與測試憑證。

## 自動驗證

| 驗證 | 結果 | 證據 |
|---|---|---|
| server 全套 | 綠：248 passed | `make gate` 原樣輸出摘要 |
| ops 測試 | 綠：41 passed | `make gate` 原樣輸出摘要 |
| web 全套 | 綠：35 passed | `make gate` 原樣輸出摘要 |
| OpenSpec 嚴格驗證 | 綠：10 passed | `make gate` 原樣輸出摘要 |
| 繁體中文／secrets／agents | 綠：0 簡體字、0 findings、0 漂移 | `make gate` 原樣輸出摘要 |
| parity | 綠：0 處不一致 | `make gate SIBLING=../software_fin-speckit` |
| 50 組 × 6 台 WebSocket 容量 | 綠：300/300 一致，p95 55.1 ms，最慢 55.3 ms | `probes/results/2026-11-28-team-limit-50-capacity-implementation.txt` |
| 作答隔離反變異 | 綠：把學生 view 暫改成老師 view 後，新增負例按他組答案檢查失敗；已復原且重跑 server 全套綠 | `probes/results/2026-11-28-team-limit-50-isolation-mutation.txt` |

## 人工驗證（P-05）

| 執行者／日期／環境 | 步驟與觀察 | 結果 |
|---|---|---|
| Codex 操作 Microsoft Edge；2026-11-28（Asia/Taipei）；Windows 11、本機合成服務 `127.0.0.1:8000` | 教師端設定 50 組並啟用組隊，匯入合成 `tests/fixtures/guided-notes/group.xlsx`（4 題：兩個各含 2 子題的題組與兩道單題）；確認結果表含第 1–50 組、組隊清單含第 50 組。學生端找到並加入第 50 組，教師端釋放，學生端回首頁後以更新後邀請碼重新加入。 | 桌面完整流程 17.7 秒；Edge 768 px 完整流程 24.1 秒，均低於 30 秒。兩種寬度的首次加入、釋放、重新加入均成功；768 px 結果表後段需水平捲動。只使用合成資料與假金鑰。 |

人工驗證通過；完整操作紀錄與限制見 `manual-ui-addendum.md`。曾發生的邀請碼辨讀錯誤不納入正式計時輪次；正式輪次皆以教師頁顯示的更新邀請碼成功重新加入。

## 合入最新 dev 後的收尾驗證（2026-11-28）

| 門禁 | 結果 |
|---|---|
| `make gate` | 綠：ruff、ESLint、TypeScript、server 388 passed、ops 48 passed、web 108 passed；`gate-zh-hant` 0 處、`gate-secrets` 0 findings、OpenSpec 嚴格驗證 13 passed、agents 0 漂移、parity 0 處不一致 |
| 例外訊息 | FastAPI TestClient 顯示 Starlette deprecation warning；Vitest 輸出 jsdom `getComputedStyle()` pseudo-elements 未實作提示，兩者未使門禁失敗 |
