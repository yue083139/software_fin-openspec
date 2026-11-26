# teacher-key-error — design（v1.1）

> **v1.1（評審）**：對抗 CLEARED（990 條並發錯金鑰連線實測無洩漏；followup：`test_bad_key_connection_gets_no_pushes` 非並發測試 ⇒ 改名 `test_good_connection_unaffected_after_bad_key`）；架構 NOT CLEARED(0B/1M/1m)＝與 `teacher-key-hidden` 合流 ⇒ 見「與 teacher-key-hidden 合流」段、proposal 邊界句改寫、矩陣 M-001／M-024 互補。

> 與 SpecKit 組 `specs/016-teacher-key-error/research.md` R1–R3 一一對應（D_n＝R_n）。知識時點：2026-11-26。

## 背景

瀏覽器的 WebSocket 在伺服器於交握前拒絕時只回報關閉碼 1006，拿不到應用層關閉碼。`student-qr` 實作時已對 4403 改為「先 accept 再關」並以真 WebSocket 用戶端實測收到 4403（見 `openspec/changes/archive/2026-11-26-student-qr/design.md` D2 實作偏離回稿）；4401 分支仍在交握前 `close`。

## 決策

### D1 金鑰錯誤先 accept、不送訊息、再以 4401 關閉
- `ws()` 中 `role == "teacher" and not is_teacher(key)` 分支：`await socket.accept()` 後立即 `await socket.close(code=4401)` 並 `return`；在此之前沒有 `current_view()`、沒有加入任何連線清單、沒有推播迴圈。
- 證偽欄｜可證偽：`test_teacher_ws_bad_key_accepts_then_closes_4401`——`client.websocket_connect` 能進入（代表已交握），第一次 `receive_text()` 即拋 `WebSocketDisconnect(4401)`（代表關閉前無訊息）。變異實錄：改回交握前關閉 ⇒ 該測試紅（實作前先紅：3 failed）。

### D2 4403 優先於 4401
- 本機檢查在金鑰檢查之前（沿用 student-qr D2）。
- 證偽欄｜可證偽：`test_public_host_takes_precedence_over_bad_key`。

### D3 老師頁整頁提示（沿用 teacher-key-hidden）
- 老師頁 `if (closedCode === 4401 || badKey) return <BadKeyNotice />;`（`teacher-key-hidden` D3 已實作，同名同文案：「老師金鑰錯誤」＋「請用啟動伺服器時終端機印出的完整老師頁網址重新開啟，或回首頁重新輸入金鑰。」＋「回首頁」）；`live.ts` 的 `NO_RECONNECT` 已含 4401。本卡不改元件，只補測試。
- 證偽欄｜可證偽：`qr.test.tsx`「4401 顯示金鑰錯誤與重開方式」、`live.test.tsx`「收到 4401 後不再開新連線」。

## 風險
- 錯金鑰連線多一次交握與關閉，無狀態變更；與 4403 同一做法。

## 與 teacher-key-hidden 合流

- 兩卡同日並行，`teacher-key-hidden`（OpenSpec #29、SpecKit #28）先合入：它以 REST 401「需要老師金鑰」顯示 `BadKeyNotice` 並清 sessionStorage，並註明本卡合入後 4401 路徑直接生效。
- 本卡 rebase 後 `web/src/pages/Teacher.tsx` 以 dev 版為準，刪掉本卡原先抽出的重複元件；伺服器「先 accept 再 4401」是本卡唯一的產品行為變更。
- 守門互補：M-001（本卡）守伺服器 4401 關閉時機與前端 4401 不重連；M-024（teacher-key-hidden）守金鑰清除與錯誤頁。
