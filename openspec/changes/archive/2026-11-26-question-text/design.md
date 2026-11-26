# question-text — design（v1.1）

> **v1.1（提案輪評審，紅隊 0B/2M/2m、架構 0B/0M/5m，皆 0 阻斷）**：紅隊——子題標籤（`labels`）取自作答格原文，作答格寫「…稱為 ____」時題目文字會經標籤在準備階段送出（現行行為）⇒ D2 明寫敘述＝題目欄、登記有意不改；驗收第 5 項掃整個目錄會被 `"S256"` 誤中 ⇒ 限縮兩檔並附負例；行號 105→110；R1–R5。架構——MODIFIED 需求漏列倍率與時限 ⇒ 補；探針檔缺指令與合併範圍 ⇒ 探針入庫 `probes/question_text_probe.py` 重跑；情境漏第 2 題、「結束後全帶」「老師任何階段」無守門 ⇒ 補情境與 `test_prompts_all_after_timed_end`。**負責人 2026-11-26 指示全部做完再測**：契約改動照傾向批准。

> 與 SpecKit 組 `specs/011-question-text/research.md` R1–R5 一一對應、口徑相同（D_n＝R_n）。

知識時點：2026-11-26。夾具結構以探針為準，原樣輸出 `probes/results/2026-11-26-question-text.txt`（四份夾具的表頭與題目欄逐列文字）。

## 背景

R-02 只要求題號，現行解析因此略過題目欄。負責人 2026-11-26 驗證全流程時指出學生頁「只有答題欄」：講義收回後學生只見題號，無從作答。

## 決策

### D1 解析：可選的題目欄，以表頭別名定位，逐子題讀取

- 表頭列沿用 `_find_header` 掃描（同一列須同時有題號欄與作答欄，規則不變）；同一列另找題目欄，別名 `QUESTION_ALIASES = ("題目", "題目敘述", "問題", "題幹", "question")`，以 `_norm`（NFKC、去空白、小寫）比對全等。表頭格屬合併範圍時取合併範圍最左欄（同作答欄、參考答案欄做法）。
- 題目欄找不到 ⇒ 每個子題 `prompt` 為 `""`，**匯入照常成功**（不改 R-02 的成功條件）。
- 每個作答格（`Slot`）的 `prompt`＝**該子題所在那一列**的題目欄值：該格屬合併範圍時，只有合併範圍的錨點列取值，其餘列為 `""`（與 `_reference` 縱向合併規則相同，避免一段敘述在題組每個子題重複出現）；值去頭尾空白，保留內部換行；整數值的浮點數轉成整數字串（`1.0` ⇒ `"1"`），其餘以 `str()`。
- 別名不與題號、作答、參考答案別名重疊（`題目` ≠ `題號`／`題次`，比對為全等）；題目欄與作答欄或參考答案欄落在同一欄時不取（同欄只歸作答或參考答案）——由 `_find_header` 的 elif 鏈逐格歸類保證：一格只有一個值、合併範圍只有錨點格帶值，結構上不會同欄（實作輪架構通道註）。
- 證偽欄｜可證偽：`probes/results/2026-11-26-question-text.txt`（`uv run --project server python -X utf8 probes/question_text_probe.py tests/fixtures/guided-notes/*.xlsx`，含表頭、題目欄逐列全文與合併範圍）四份夾具皆有題目欄——single「C4: 題目」6 列、group「C4: 題目」6 列（第 1、2 題各 2 子題逐列各一段：C5、C6、C8、C9）、variant「D8: 題目敘述」8 列、reference「C3: 題目」5 列；`test_guided_notes_parse.py` 逐子題比對，另以 openpyxl 合成「無題目欄」與「題組敘述縱向合併」兩檔做負例。

### D2 可見性：學生只在開放作答後收到敘述

- 老師 view：任何階段每題都有 `prompts`。
- 學生 view（`team_valid: true`）：
  - `preparing`：每題都**不帶** `prompts` 鍵。
  - `answering`／`judging`：非逐題模式每題都帶；逐題模式（`mode.sequential`）只有已開放過的題（`number in a.rounds`，含開放中、已關閉、已揭曉）帶。
  - `ended`：每題都帶。
- 無效憑證 view 不變（不含 `questions`）。
- 判斷集中在 `views.question_outline(a, teacher: bool)` 一處；學生預設不帶，符合條件才加（fail-closed：日後新增階段時預設不給）。前端不重算可見性，只顯示收到的 `prompts`。
- **有意不改（紅隊發現 1）**：本決策只管題目欄的敘述（`prompts`）。子題標籤（`labels`）取自作答格原文（`guided_notes._display`），學習單若把題目寫進作答格（例：「負責執行指令的核心元件稱為 ____」），題目文字會經標籤在任何階段送出——這是 `guided-notes-import` 起的現行行為，本卡不改；手冊與 README 提醒老師題目寫在題目欄、作答格只放標籤或底線。
- 證偽欄｜屬取捨：準備階段也給敘述較方便，但原情境講義在活動開始前收回；逐題模式提早給敘述會讓各組在計時前先想答案，與時間計分（`mode-timed-scoring`）「t 為伺服器量得的作答秒數」的用意衝突。可證偽：`test_isolation.py::test_prompts_hidden_until_open`（準備階段 0 個 `prompts` 鍵）、`test_prompts_sequential_only_opened`（開第 1 題後只有第 1 題帶）。

### D3 契約：`questions[].prompts`

- 老師與學生 view 的 `questions[]` 增加 `prompts: [每個子題一段字串]`，長度與順序與 `labels` 相同；學生看不到的題不帶此鍵。`results`／`board` 不重複帶敘述（前端以題號對 `questions[]` 取）。
- `contracts/api.md` 同批補述，須負責人批准（`CLAUDE.md`「契約即法律」）。
- 證偽欄｜可證偽：`test_isolation.py` 斷言鍵名與長度；`web/src/types.ts` 型別 `prompts?: string[]`。

### D4 寫回與匯出不變

- `Slot` 新增欄位 `prompt: str = ""`（frozen dataclass 加預設值，既有建構點不需改）；`write_answers`、Google 寫回只用 `cell`、`label`、`placeholder`，不讀 `prompt`。
- 證偽欄｜可證偽：`test_guided_notes_export.py`、`test_google_sheets.py` 不改即綠。

### D5 web：作答卡與結果表顯示敘述

- 學生作答卡：每個子題輸入欄上方顯示該子題敘述（`prompts[i]` 非空才顯示，空字串不留白段）；單題顯示在題號標題下。
- 老師：題目清單與即時作答表的題號欄旁顯示敘述（老師永遠可見）。
- 學生結束後結果表：題號旁顯示敘述。
- 敘述以純文字渲染（React 預設跳脫），換行以 CSS `white-space: pre-wrap` 呈現，不解讀 HTML。
- 證偽欄｜可證偽：`web/src/pages/answer.test.tsx` 新增「有敘述顯示、無敘述不顯示」；`results.test.tsx` 結果表顯示敘述。

## 風險

- 學習單若把答案提示寫在題目欄（例：「答：____」），提示會隨敘述送給學生——這是老師檔案本身的內容，與他組作答無關，不屬作答隔離範圍；手冊提醒老師題目欄只放題目。
