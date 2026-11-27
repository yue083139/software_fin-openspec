# results-podium — design（v1.0）

> 與 SpecKit 組 `specs/018-results-podium/research.md` R1–R4 一一對應（D_n＝R_n）。知識時點：2026-11-27。

## 背景與對標

- 對標 Kahoot：一局結束時顯示前三名領獎台（第 2、1、3 名由左到右、冠軍台最高），之後才看完整成績（知識時點 2026-11，依公開產品操作經驗）。Mentimeter 的測驗結束畫面同樣以前幾名排行收尾。
- 本系統結束後已有完整的「作答狀況與結果」表與各組分數，只缺一個一眼看出誰贏的收尾畫面。裁剪：只做靜態領獎台，不做 Kahoot 的逐名揭曉動畫與音效。

## 決策

### D1 資料來源只用結束後 view 既有的 `team_scores`
- 老師 view 任何階段都有 `team_scores`（`server/quiz_server/views.py`「"team_scores": results.team_scores(a)」）；學生 view 只在 `ended` 才帶（同檔「只有 ended 才揭曉完整結果」）。
- 老師頁以 `view.phase === "ended"` 決定是否畫；學生端 `StudentResults` 本來就只在 `ended` 渲染（`Student.tsx`「view.phase === "ended" && view.results」）。
- 不新增 view 欄位、不改伺服器 ⇒ 作答隔離與契約不受影響（不升 S 檔）。
- 經典搶答結束後老師檢查答錯會改 `team_scores`（answer-review），領獎台跟著推播即時更新，不另存狀態。
- 證偽欄｜可證偽：`podium.test.tsx`「搶答中不顯示」——老師 view 搶答中也有 `team_scores`，若拿掉 `phase === "ended"` 判斷即紅（變異實錄見 `verification.md`）。

### D2 名次口徑同伺服器 `results.leaderboard`
- `rank = 1 + 分數嚴格大於自己的組數`（同分同名次、下一名跳號 1、1、3）；同名次內依 `team_scores` 的鍵序，即伺服器 `a.teams` 順序（Python dict 與 JSON 物件保鍵序）。
- 分數來源差異：`leaderboard` 用已揭曉題分數（`results.revealed_scores`），領獎台用 `team_scores`（全部題）；兩者在 `ended` 時相等，前提是 `activity.end` 要求先揭曉目前題（`server/quiz_server/activity.py`「請先揭曉目前這一題，再結束活動」）。日後若放寬此限制，須回頭改本決策。
- 只取 `rank ≤ 3`：同分搶走名額時名次會缺（例：三組並列第 1 ⇒ 沒有第 2、3 名）。
- 這是把伺服器已算好的分數排成畫面，不是搶答順位判定；`web/CLAUDE.md`「不在前端判定順位」指搶答先後，不受影響。
- 證偽欄｜可證偽：`podiumPlaces` 四例（基本、1-1-3 跳號、第三名並列全上台、三組並列第 1 不再有第三名）。

### D3 0 分不上台、沒有組別得分整塊不顯示
- 過濾 `score > 0` 再排名；結果為空 ⇒ `Podium` 回 `null`。
- 證偽欄｜可證偽：「沒有組別得分 ⇒ 空」「沒有組別得分就不顯示領獎台」；變異 `s > 0` → `s >= 0` 兩例皆紅。

### D4 學生端標出本組
- `StudentResults` 傳 `team`，該組名旁加「本組」標籤；老師端不傳。
- 證偽欄｜可證偽：「學生結果標出本組」（第 1 名有、第 2 名沒有）。

## 版面
- 亞軍、冠軍、季軍由左到右；台高 96／128／72 px；冠軍台用 `--qz-accent-soft` 底色；獎牌 🥇🥈🥉 只是裝飾（`aria-hidden`），名次以文字「第 n 名」與 `aria-label` 提供。
- 分數欄名沿用 `score_label`（得題數／得分）。

## 風險
- 組別很多且大量並列第 1 時，冠軍台上名字多、台變寬；`flex-wrap` 讓名字換行，不影響判讀。
