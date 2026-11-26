# 第一期提案輪評審紀錄（2026-11-11）

- 對象：`openspec/changes/` 五張核心卡 v1.0 → v1.1（`app-skeleton`、`guided-notes-import`、`buzz-answering`、`results-view`、`guided-notes-export`），皆為 S 檔。
- 方式：五卡同批一輪全卡掃，紅隊與架構兩通道互不知情（`.claude/agents/finder-tail-{red,arch}.md`＋`review-dispatch` 骨架）；藥方由各自開方的通道回驗。與「每卡各一輪」的差異：負責人指示一次做完第一期，五卡同批審可一併抓到跨卡矛盾（實際抓到 1 條）。
- 結論：首輪 紅隊 `NOT CLEARED(0B/3M/5m)`、架構 `NOT CLEARED(0B/4M/3m)`；回驗兩輪後兩通道皆 `CLEARED`。

## 發現與藥方

| 通道 | 等級 | 發現 | 藥方落點 |
|---|---|---|---|
| 紅隊 | 重要 | 學生改網址組別參數即可在搶答中讀到他組答案（v1.0 寫「冒用不擴大洩漏面」不成立） | `app-skeleton` 首屏 4、D6 組別憑證；`buzz-answering` D1 以 `X-Team-Token` 反查；`docs/parity.md` §3；先例正文「作答隔離」 |
| 紅隊 | 重要 | 控制字元使匯出拋 `IllegalCharacterError`；`=` 開頭答案被存成公式（評審以 openpyxl 3.1.5 實跑） | `buzz-answering` D1 拒收 `Cc`；`guided-notes-export` D2 強制文字型別 |
| 紅隊 | 重要 | 並發測試在臨界區無讓出點時，拿掉鎖仍全綠（假綠）；首次修法把讓出點放在配號之前仍假綠，回驗再抓到 | `app-skeleton` D2、`buzz-answering` D1：讓出點夾在「讀」與「寫」之間，變異實錄 |
| 架構 | 重要 | 他組送出觸發本組推播且全域版本號跳號，從時機洩漏他組活動 | `app-skeleton` D4 只在本連線 view 改變時推送、每連線 `seq` |
| 架構 | 重要 | 公式寫入（同紅隊） | 同上 |
| 架構 | 重要 | `app-skeleton` 與 `buzz-answering` 對「開始搶答」前置條件互相矛盾；首次修法把 MODIFIED 放錯能力目錄，回驗再抓到 | `buzz-answering/specs/activity-lifecycle/spec.md` MODIFIED |
| 架構 | 重要 | 五卡新定行為未登記 `docs/parity.md` | §4 五行、§5 一行 |
| 兩通道 | 次要 | 連結匯入只驗第一跳主機；`judging` 階段未定義；`ScoringRule` 簽名不足 T-02；存取日誌印出金鑰；快照未落點；先例正文不一致；匯出措辭過滿 | 各卡 v1.1 對應段落 |

## 實作期自查補記

`app-skeleton` 實作時跑變異實錄，發現 `Activity.join` 的讓出點同樣放在「檢查」之前（與紅隊回驗抓到的 `submit` 同型），拿掉鎖時並發加入測試仍綠；已移到檢查與寫入之間，變異實錄兩條皆紅（見 `openspec/changes/app-skeleton/verification.md`）。
