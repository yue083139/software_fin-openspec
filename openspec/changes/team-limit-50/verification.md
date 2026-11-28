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

## 人工驗證（未完成）

| 場次 | 結果 | 缺口 |
|---|---|---|
| 一般桌面與 768 px 寬；30 秒內找到第50組、加入、釋放、重新加入，檢查結果表與組隊狀態 | 未跑 | 本機瀏覽器控制 helper 不可用；不能以 DOM 測試或容量探針代替人工操作。需由負責人或組員在本機按 `docs/manual-verification.md` 實際操作並補日期、環境與證據。 |

因此任務 4.2 仍未完成；不可宣稱本卡已達最終驗收全綠。
