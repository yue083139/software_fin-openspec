# game-mode-framework — 模式選擇、判定階段、只計對錯模式（v1.1）

檔位：**S**（活動階段狀態機、作答隔離、Guided Notes 解析口徑、`contracts/`）｜主人：@yue083139｜parity：`docs/parity.md` §4 `game-mode-framework`｜需求：X-04（TRD T-01～T-04、T-06、M3）｜依賴：核心五卡（已合入）

## 首屏決策摘要

1. **模式＝（判定規則, 是否需判定）的登記表，活動只持有一個模式鍵**：選了 `modes.MODES` 字典（`classic`、`accuracy`），`Activity.rule` 由模式取得，view、結果與匯出照舊只經規則／代價：模式間差異若超出「規則＋要不要判定」（如逐題開放）要再加欄位，由 `mode-timed-scoring` 加／可被「經典模式全部既有測試不改即綠」證偽。
2. **只計對錯（M3）：結束後進入 `judging`，老師逐筆標正確／錯誤，全部判定完才能揭曉**：選了「揭曉前不得有未判定」而非「未判定視為錯誤」／代價：老師必須判完每一筆（以參考答案建議與「採用全部建議」降低成本）／屬取捨，理由：未判定就揭曉會把老師漏看的正確答案記成 0 分且無法回頭。
3. **得主＝最早送出的正確答案；正確者各得 1 分**：匯出寫回的仍是「得主答案」，故匯出程式不改／代價：同時有多組答對時只寫回最早那組／可被規則表格式測試證偽（含全錯⇒無得主、無人作答）。
4. **參考答案欄可選，只產生判定建議，永不送往學生端**：表頭別名「參考答案／正確答案／標準答案／解答／Answer Key」；建議＝各子題正規化後全等⇒正確、否則錯誤、該題無參考答案⇒無建議；「採用全部建議」是老師的一次明確操作，不自動計分（TRD §6 裁定）／代價：同義詞會被建議為錯誤，靠老師改判／可被「任一階段學生 payload 不含參考答案字串」負例證偽。
5. **`end()` 只接受 `answering`**：狀態機的 `judging → ended` 只能經 `reveal()`（會檢查未判定數）／可被「判定中呼叫結束搶答回 409」證偽——否則 `POST /api/teacher/end` 可繞過判定檢查。

**v1.1（提案輪評審）**：補 `buzz-answering`「最快送出的組別為該題搶答成功者」的 MODIFIED——判定模式的得主是最早送出的**正確**答案，主規格原句只對經典模式成立（架構通道）。

**矩陣落點**：新增 M-009（模式選擇與經典不變）、M-010（判定完才揭曉）、M-011（判定中與參考答案隔離）、M-012（參考答案欄解析）；M-004 守門擴充 `judging` 階段負例。

**merge 三問第三問**：需求證實——X-04「增進活動品質的其他功能」；負責人 2026-11-12 裁定第二期範圍（`docs/trd-game-modes.md` §5）。

## 目標

- `quiz_server/modes.py`：`Mode`、`MODES`；`scoring.py`：`Ranked.correct`、`AccuracyRule`。
- `Activity`：`mode`、`judgments`、`set_mode`、`judge`、`accept_suggestions`、`pending_judgments`、`reveal`；`end()` 依模式轉 `judging` 或 `ended`。
- `guided_notes.py`：可選參考答案欄，`Slot.reference`；`judging.py`：`suggest`。
- API：`POST /api/teacher/mode`、`/judge`、`/accept-suggestions`、`/reveal`；view 增欄位（`contracts/api.md` 只增不改）。
- web：老師模式選擇、判定畫面（逐筆正確／錯誤、建議、採用全部建議、揭曉）；學生端模式說明、判定中提示、結果顯示對錯。

## 邊界（本卡不做）

雙倍分數與題目設定（`question-settings`）、逐題開放與時間計分（`mode-timed-scoring`）、錯誤遞補、公平順位、組隊（第三期）。參考答案不寫回、不出現在匯出檔以外的任何學生可見處。

## 驗收

| # | 指令 | 期望輸出 |
|---|---|---|
| 1 | `uv run --project server pytest -q server/tests/test_scoring.py server/tests/test_modes.py` | 兩種規則表格式測試（含全錯、無人作答、未判定）；模式登記表；passed |
| 2 | `uv run --project server pytest -q server/tests/test_judging.py` | 判定流程、錯誤碼、未判定不得揭曉、判定中不可結束搶答、採用全部建議、建議演算法、並發揭曉與判定；passed；變異實錄：拿掉 `reveal` 的未判定檢查必紅、`end` 拿掉 `_require(ANSWERING)` 必紅 |
| 3 | `uv run --project server pytest -q server/tests/test_isolation.py` | 判定中學生 payload 不含他組答案、判定結果與建議；任何階段學生 payload 不含參考答案；passed |
| 4 | `uv run --project server pytest -q server/tests/test_guided_notes_parse.py` | `reference.xlsx` 解析出參考答案；三份既有夾具無參考答案欄、`reference` 全為 None；passed |
| 5 | 既有全部測試 | 不改測試即綠（經典模式行為不變），只有新增欄位的斷言更新 |
| 6 | 人工驗證 | 老師選「只計對錯」→ 兩組作答 → 結束進入判定中 → 採用建議並改判一筆 → 揭曉 → 學生看到對錯與得分 → 匯出寫回最早答對者 |

## 實錄結果

見 `verification.md`。
