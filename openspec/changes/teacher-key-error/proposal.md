# teacher-key-error — 老師金鑰錯誤時顯示提示（v1.0）

檔位：**B**（介面提示與 WebSocket 關閉時機；不碰判定、隔離、契約欄位語意——契約只補述關閉時機）｜主人：@yue083139｜parity：`docs/parity.md` §4 `teacher-key-error`｜需求：R-01｜依賴：`student-qr`
來源：`student-qr` verification followup——「老師金鑰錯誤時一樣在交握前就被拒（實測 HTTP 403），瀏覽器拿不到 4401，『老師金鑰錯誤』提示其實顯示不出來」；負責人 2026-11-26 指示開小卡處理。

## 首屏決策摘要

1. **金鑰錯誤先 accept、不送任何訊息、再以 4401 關閉**：比照 `student-qr` 對 4403 的實作偏離（`server/quiz_server/app.py`「先 accept 再關：交握前就關，瀏覽器只會收到 HTTP 403、關閉碼變 1006」）／代碼：錯金鑰連線多一次交握／可被 `test_api_host.py::test_teacher_ws_bad_key_accepts_then_closes_4401` 證偽（交握前就關則 `websocket_connect` 直接拋例外）。
2. **4403 優先於 4401**：公開 Host 不論金鑰對錯一律 4403／可被 `test_public_host_takes_precedence_over_bad_key` 證偽。
3. **老師頁 4401 整頁提示 `BadKeyNotice`**：antd `Result` 顯示「老師金鑰錯誤」與「用終端機印出的完整老師頁網址重開，或回首頁重新輸入」；`live.ts` 既有 4401 不重連／可被 `qr.test.tsx`、`live.test.tsx` 證偽。

**矩陣落點**：M-001（R-01）守門補 `server/tests/test_api_host.py::test_teacher_ws_bad_key_accepts_then_closes_4401`、`web/src/live.test.tsx`（4401 不重連）、`web/src/pages/qr.test.tsx`（BadKeyNotice）。

**merge 三問第三問**：R-01 老師身分；錯金鑰時畫面卡在「連線中…」，老師不知道是金鑰錯，Demo 與課堂都會踩到。

## 目標
- `server/quiz_server/app.py`：金鑰錯誤分支先 `accept()` 再 `close(4401)`。
- `web/src/pages/Teacher.tsx`：抽出 `BadKeyNotice`（文案改為指引重開方式）。
- `contracts/api.md` WebSocket 段補述關閉時機。

## 邊界
- REST 401 行為與文案不變（老師頁頂部錯誤列照舊）。
- 老師金鑰隱藏於網址列另卡 `teacher-key-hidden`。

## 驗收

| # | 指令 | 期望 |
|---|---|---|
| 1 | `uv run --project server pytest -q server/tests/test_api_host.py` | 錯金鑰先交握後 4401、之前無訊息；公開 Host 4403 優先；錯金鑰連線不影響正常推播；passed |
| 2 | `npm --prefix web test` | 4401 不重連且回報關閉碼；BadKeyNotice 顯示文案；passed（連跑兩次） |
| 3 | 人工驗證 | 改掉老師頁網址的 key 開啟 ⇒ 整頁顯示「老師金鑰錯誤」，不停在「連線中…」 |

## 實錄結果
見 `verification.md`。
