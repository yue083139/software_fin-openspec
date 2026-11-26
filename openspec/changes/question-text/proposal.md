# question-text — 匯入題目敘述，開放作答後顯示給學生（v1.0，提案輪評審前草稿）

檔位：**S**（Guided Notes 解析口徑、`contracts/`、新增送往學生端的欄位）｜主人：@yue083139｜parity：`docs/parity.md` §4 `question-text`（本卡開卡登記）｜需求：X-04｜依賴：`guided-notes-import`、`mode-timed-scoring`
流程：負責人 2026-11-26 裁「S 檔壓縮版」——提案輪、實作輪各一次雙通道評審，同一會話連續跑，負責人在對話裡裁。

## 首屏決策摘要

1. **題目欄為可選欄，以表頭別名定位，逐子題讀取**：別名「題目／題目敘述／問題／題幹／question」；每個子題取它所在那一列的題目欄值（題組每個子題各有自己的敘述）／代價：沒有題目欄的檔照常匯入、敘述為空字串／可被四份夾具證偽（`probes/results/2026-11-26-question-text.txt`：四份都有題目欄、題組子題逐列各一段敘述）。
2. **學生只在開放作答後收到敘述**：準備階段不送；逐題模式（時間計分）只送已開放過的題；`ended` 全送；老師任何階段都有／代價：學生準備階段只看得到題號（現行行為）／屬取捨：時間計分若提早給敘述，各組可在計時前先想答案，削弱計時的意義。
3. **契約只增欄位**：`questions[].prompts`（長度＝子題數，與 `labels` 對齊）；學生看不到的題**不帶此鍵**（fail-closed）／可被 `test_isolation.py` 新增負例證偽。
4. **寫回與匯出不變**：敘述只讀不寫，`write_answers` 與 Google 寫回不碰題目欄／可被既有匯出往返測試證偽。

**矩陣落點**：M-003（R-02）聲明不變，守門加 `test_guided_notes_parse.py::test_prompts_*`；新增 M-021（X-04）「題目敘述只在開放作答後送給學生」，守門 `server/tests/test_isolation.py::test_prompts_hidden_until_open`、`test_prompts_sequential_only_opened`。

**merge 三問第三問**：需求 R-02 寫「不要求匯入題目敘述」，所以本卡屬 X-04（增進活動品質）。負責人 2026-11-26 人工驗證全流程時指出「學生頁只有答題欄」：原情境是老師收回講義後才搶答，學生手上沒有題目，只見題號無從作答。期限 2026-11-30，影片須與程式一致，故在錄影前做。

## 為什麼

現行解析只讀題號欄與作答欄（`server/quiz_server/guided_notes.py:105`「`if number_col is None and text in NUMBER_ALIASES:`」），題目欄整欄略過；學生 view 只有 `{number, labels, multiplier, time_limit}`（`server/quiz_server/views.py:17`）。

## 目標

- `guided_notes.py`：表頭多找可選的題目欄；`Slot` 加 `prompt`。
- `views.py`：`question_outline` 依身分與階段帶 `prompts`（決策 2）。
- `contracts/api.md`：老師與學生 view 的 `questions[].prompts`（須負責人批准）。
- web：學生作答卡在每個子題輸入欄上方顯示敘述；老師題目清單與結果表顯示敘述；學生結束後的結果表顯示敘述。
- 文件：`docs/parity.md`、`docs/product-trd.md`（若列有學生畫面欄位）、`docs/manual-verification.md` 加一步。

## 邊界（本卡不做）

- 題目敘述的格式（粗體、換行以外的樣式）、圖片。
- 把敘述寫回或匯出 CSV。
- 改變 R-02 題數判定或作答格定位。
- 前端整體改版（另卡 `web-workbench`，B 檔）。

## 驗收

| # | 指令 | 期望輸出 |
|---|---|---|
| 1 | `uv run --project server pytest -q server/tests/test_guided_notes_parse.py` | 四份夾具每個子題的 `prompt` 等於題目欄該列文字；無題目欄的合成檔 `prompt` 全為 ""；passed |
| 2 | `uv run --project server pytest -q server/tests/test_isolation.py` | 準備階段學生 view 無 `prompts`；逐題模式只帶已開放題；搶答中帶 `prompts` 的 payload 仍不含他組答案；無效憑證只回最少資訊；passed |
| 3 | `uv run --project server pytest -q server/tests/test_guided_notes_export.py server/tests/test_google_sheets.py` | 匯出與 Google 寫回結果不變；passed |
| 4 | `npm --prefix web test` | 學生作答卡顯示敘述、無敘述時不顯示空白段；passed |
| 5 | `git grep -nE '"[A-Z]{1,2}[0-9]+"' -- server/quiz_server` | 無輸出（仍無寫死座標） |
| 6 | 人工驗證 | `docs/manual-verification.md` 場次 A：學生準備階段只見題號，開始搶答後看到每題（含題組子題）敘述 |

## 實錄結果

見 `verification.md`。
