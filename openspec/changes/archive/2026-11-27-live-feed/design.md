# live-feed — design（v1.1）

> **v1.1（評審）**：架構 NOT CLEARED(0B/1M/1m)、對抗 NOT CLEARED(0B/0M/1m)，同指 D2：規格寫「重連後第一個畫面不跳」，程式卻沿用斷線前的基準 ⇒ 改程式照規格（斷線清基準＋`stale`），補重連、伺服器重啟、學生頁三例測試；兩組 parity／矩陣措辭本就寫「重連」，不改。

> 與 SpecKit 組 `specs/019-live-feed/research.md` R1–R4 一一對應（D_n＝R_n）。知識時點：2026-11-27。

## 背景與對標

- 對標 Kahoot 主持人畫面：題目進行中即時顯示「已作答人數」的跳動，讓全場感受節奏（知識時點 2026-11，依公開產品操作經驗）；直播彈幕式的「某某搶下第 N 題」通知是常見的課堂遊戲化手法。
- 本系統老師頁已有作答狀況表，但新送出只是表格多一格，投影時不易察覺。裁剪：只做文字快訊，不做音效與動畫。

## 決策

### D1 前端比對前後兩次老師 view，不改伺服器
- 老師 view 任何階段都帶完整 `board`（`server/quiz_server/views.py`「"board": results.build(a, teacher=True)」）；`useLiveView` 每次推播給新物件。
- `feedEvents(prev, next)`：對 `next.board` 每題每個 `ranking` 項，若 `prev` 同題沒有該組 ⇒ 一則事件，`key＝<題號>-<組別>`（同 key 的 antd notification 只顯示一則）。
- 不新增 view 欄位 ⇒ 作答隔離與契約不受影響（不升 S 檔）。
- 證偽欄｜可證偽：「經典搶答第 1 順位是『搶下』，之後是『送出』」；「沒有新送出不出通知」。

### D2 第一個 view 只當基準
- `useLiveFeed(view, connected)` 以 `useRef` 記上一個 view；`prev === null` 時只更新基準。開頁與重新整理會重掛元件 ⇒ `prev` 為 null。
- 斷線重連（v1.1，評審後）：`useLiveView` 斷線時不清 view、元件也不重掛，舊基準會留下 ⇒ 重連時拿斷線前的 view 比對，斷線期間的送出會補跳；伺服器重啟時若推播合併，新一輪的同組同題還可能被舊基準吞掉。改為 `connected` 轉 false 即清 `prev`，並記下斷線當下的 view（`stale`）：重連時 `connected` 先轉回 true、`view` 仍是那份舊的，不得拿它當基準，要等**重連後第一個新 view** 才當基準。代價：斷線期間的送出不補跳（作答狀況表仍完整）。
- 證偽欄｜可證偽：「第一次收到 view 只當基準，不出通知」「新送出時右上角跳出通知，開頁時不跳」「斷線重連後第一個新 view 只當基準，之後的新送出照跳」；變異拿掉 `prev === null` ⇒ 2 failed；拿掉斷線清基準或 `stale` 判斷 ⇒ 各 1 failed。

### D3 只在搶答中；經典第 1 順位才說「搶下」
- `next.phase !== "answering"` ⇒ 不出（結束後的答對／答錯檢查、重置都不跳）。
- `mode.key === "classic"`（舊伺服器無 mode 視為經典）且 `rank === 1` ⇒「<組> 搶下第 N 題！」；其他模式第 1 順位不一定得分 ⇒ 一律「<組> 送出第 N 題」。
- 證偽欄｜可證偽：「非經典模式一律『送出』」；變異拿掉 `classic &&` ⇒ 1 failed；變異拿掉階段判斷 ⇒「不在搶答中不出通知」1 failed。

### D4 文案不含答案
- 只用 `team` 與 `number`；`answers` 不進文案。老師頁常投影給全班，答案在結束前曝光等於破壞搶答。
- 證偽欄｜可證偽：「文案不含答案」（假資料答案「祕密答案」不得出現）。

## 版面
- antd `notification`，`placement: "topRight"`、`duration: 3` 秒；`<AntApp notification={{ maxCount: 4 }}>` 最多疊 4 則，舊的先收。

## 風險
- 大量同時送出（例 50 組同秒）時只看得到最新 4 則；作答狀況表仍完整，快訊只是提示。
