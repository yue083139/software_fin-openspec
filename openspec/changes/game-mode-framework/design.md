# game-mode-framework — design（v1.2）

知識時點：2026-11-12。對標（`docs/research/competitors.md`）：Kahoot! 的 Accuracy 模式只看答對與否；Kahoot! 與 Quizizz 的題目都有標準答案，由系統自動判定。本系統的 Guided Notes 沒有標準答案欄（第一期範本結構探針 `probes/results/2026-11-11-guided-notes-structure.txt`：兩份範本表頭只有「題號／題目／作答」），故改為**老師判定**，有參考答案欄時只給建議（TRD §6 裁定）。

## 決策

### D1 模式登記表

`quiz_server/modes.py`：

```python
@dataclass(frozen=True)
class Mode:
    key: str          # "classic" | "accuracy"
    label: str        # 「經典搶答」|「只計對錯」
    judged: bool      # 結束搶答後是否進入 judging
    rule: ScoringRule
MODES: dict[str, Mode]   # 依顯示順序
DEFAULT_MODE = "classic"
```

`Activity.mode: Mode`（預設經典）；`Activity.rule` 改為唯讀屬性 `self.mode.rule`，`results.py` 與匯出不改呼叫方式。`set_mode(key)`：鎖內、只在 `preparing`（409），未知鍵 ⇒ `ModeError(ValueError)`（422）。準備階段必然沒有送出紀錄（匯入與重置都清空），換模式不必清資料。重置（`ended → preparing`）保留模式。

- 證偽欄｜可證偽：`test_modes.py`（未知鍵 422、非準備階段 409、重置後仍為原模式）；既有測試不改即綠（`classic` 行為不變）。

### D2 規則：`Ranked.correct` 與 `AccuracyRule`

`Ranked` 新增 `correct: bool | None`（`None`＝本模式不判定或尚未判定）。`ScoringRule.rank(submissions, judgments, attrs)` 的 `judgments` 為「該題 組別 → 是否正確」。

- `ClassicBuzzRule`：不變，`correct=None`。
- `AccuracyRule`（`name="accuracy"`）：依 `seq` 排 `rank`；`correct = judgments.get(team)`；`score = 1 if correct is True else 0`；`is_winner` ＝依 `seq` 第一個 `correct is True` 者（無人答對 ⇒ 無得主）。

匯出取 `is_winner` 者的答案（`results.winning_answers`），故只計對錯模式寫回「最早送出的正確答案」，匯出程式不改。主規格 `buzz-answering`「順位 1 的組別為搶答成功者」只對經典模式成立，本卡以 MODIFIED 改寫為「經典模式＝順位 1；判定模式＝最早送出的正確答案」（v1.1）。

- 證偽欄｜可證偽：`test_scoring.py` 表格式案例：全對、全錯、第一個錯第二個對（得主＝第二個）、部分未判定、無人作答。屬取捨：多組答對時只寫回一組。

### D3 判定階段

`Activity.judgments: dict[int, dict[str, bool]]`（題號 → 組別 → 正確否），`_clear_answers()` 一併清空。

| 方法 | 前置（鎖內） | 效果 |
|---|---|---|
| `end()` | **`_require(ANSWERING)`**，再轉 `JUDGING`（`mode.judged`）或 `ENDED` | — |
| `judge(number, team, correct)` | `judging`（409）；題號存在且該組有送出（404） | 設定或改判 |
| `accept_suggestions()` | `judging`（409） | 對每筆**未判定且有建議**者寫入建議；回傳寫入數 |
| `pending_judgments()` | — | 未判定筆數 |
| `reveal()` | `judging`（409）；`pending_judgments() == 0`，否則 `PhaseError("尚有 N 筆未判定")` | 轉 `ENDED` |

`end()` 加 `_require(ANSWERING)`，把「結束搶答只在搶答中」寫成明確前置條件。v1.2 更正：判定模式下 `end()` 的目標是 `judging`，`judging → judging` 不在轉移表，拿掉此行仍回 409（變異實錄），所以它不是唯一防線；v1.0 說「不擋即可繞過未判定檢查」不成立。檢查與寫入之間照第一期慣例放 `_checkpoint()`。

- 證偽欄｜可證偽：`test_judging.py`：判定中 `POST /end` ⇒ 409 且仍為 `judging`；有未判定時 `reveal` ⇒ 409；全部判定後 `reveal` ⇒ `ended`；判定不存在的送出 ⇒ 404；`answering`／`ended` 判定 ⇒ 409；改判覆蓋前值；`test_concurrent_judge_and_accept_suggestions`：老師把建議為錯誤的送出判為正確，與「採用全部建議」並發 20 輪，最終必為老師的判定（`accept_suggestions` 在讀出未判定清單與寫入之間讓出）。變異實錄：拿掉 `reveal` 的未判定檢查必紅；`judge` 或 `accept_suggestions` 換成每次新建的鎖必紅。v1.0 的 `test_concurrent_reveal_and_judge` 拿掉鎖仍綠（`reveal` 讀未判定數之前沒有讓出點），已換掉。

### D4 參考答案欄與判定建議

`guided_notes.py`：`REFERENCE_ALIASES = ("參考答案", "正確答案", "標準答案", "解答", "answerkey")`，與題號、作答欄同列以同一正規化（NFKC、去空白、小寫）整格比對；可選，找不到不報錯。`Slot` 新增 `reference: str | None = None`：該子題作答格**同一列**參考答案欄的值（合併範圍只取錨點列；空白 ⇒ `None`）。別名不含「答案」（已是作答欄別名），整格比對下「參考答案」不會被當成作答欄。

`quiz_server/judging.py`：`suggest(answers, slots) -> bool | None`——任一子題 `reference is None` ⇒ `None`；各子題 `normalize(answer) == normalize(reference)` 全成立 ⇒ `True`，否則 `False`；`normalize`＝NFKC、去所有空白、`casefold()`。

- 證偽欄｜可證偽：新夾具 `tests/fixtures/guided-notes/reference.xlsx`（`build_reference.py` 產生，合成內容：表頭「題號／題目／作答／參考答案」、含題組、含一題無參考答案）；`test_guided_notes_parse.py` 斷言各子題參考答案、三份既有夾具 `reference` 全為 `None`；`test_judging.py::test_suggest` 表格式（全形半形、大小寫、空白差異視為相同；題組一格不同 ⇒ False；缺參考 ⇒ None）。屬取捨：不做同義詞或模糊比對——建議錯了由老師改判。

### D5 作答隔離（T-06）

- 學生 view：`judging` 與 `answering` 相同——只有本組 `my_submissions`，不含判定結果。`views.student_view` 本來就只在 `ended` 加結果，`judging` 自動落在「其餘階段」分支（第一期已有 `test_non_ended_phases_isolated` 參數化涵蓋 `judging`）。
- 參考答案與建議**只在老師 view**：`results.build(a, teacher=False)` 的每筆 `ranking` 有 `correct`（`ended` 才送學生）；`teacher=True` 另加 `suggestion` 與每題 `reference`。學生端的 `question_outline` 不變（不含參考答案）。
- 學生 view 新增 `mode: {key, label}`（規則說明，非他組資訊）。

- 證偽欄｜可證偽：`test_isolation.py::test_judging_hides_judgments`（判定中老師判第1組正確，第2組 payload 不含第1組答案、不含 `correct`、且收到 0 則推播）；`test_reference_never_sent_to_students`（以 `reference.xlsx` 匯入，`preparing`／`answering`／`judging`／`ended` 四階段擷取學生 WebSocket 與 REST 全部位元組，不含任何參考答案字串）。

### D6 結果一致性

`results-view` D1「老師 board 與學生 results 同一函式產生」維持：同一個 `build`，`teacher=True` 只**多**欄位。`test_teacher_and_student_agree` 改為「拿掉老師專屬欄位後相等」。

- 證偽欄｜可證偽：該測試在兩種模式各跑一次。

### D7 API 與 view（`contracts/api.md` 只增不改）

| 端點 | 本體 | 成功 | 錯誤 |
|---|---|---|---|
| `POST /api/teacher/mode` | `{mode}` | `{mode}` | 401；409 非 preparing；422 未知模式 |
| `POST /api/teacher/judge` | `{question, team, correct}` | `{question, team, correct}` | 401；404 無此送出；409 非 judging |
| `POST /api/teacher/accept-suggestions` | — | `{applied}` | 401；409 非 judging |
| `POST /api/teacher/reveal` | — | `{phase}` | 401；409 非 judging 或尚有未判定 |
| `POST /api/teacher/end`（語意補充） | — | 判定模式回 `{phase: "judging"}` | 409 非 answering |

老師 view 增：`mode: {key, label, judged}`、`modes: [{key, label}]`、`pending_judgments`、`score_label`（經典「得題數」、其餘「得分」）。學生 view 增：`mode: {key, label}`、`score_label`。`ranking[]` 增 `correct`；老師 `board[]` 另增 `reference: [str|null]`、`ranking[].suggestion`。

日誌：判定只記題號、組別與結果，不記答案。

- 證偽欄｜可證偽：`test_judging.py` API 錯誤碼；`test_api_skeleton.py` 未帶金鑰呼叫新端點 401。

### D8 web

- 老師：準備階段模式選擇（單選，非 preparing 時停用）；判定中顯示「尚有 N 筆未判定」、「採用全部建議」、「揭曉結果」（N>0 停用）；作答狀況表每格顯示建議與「正確／錯誤」兩鈕（目前判定加底色）；每題顯示參考答案。`ended` 後格內顯示 ✓／✗。
- 學生：顯示模式名稱與一行規則說明；判定中顯示「老師判定中，揭曉前看不到其他組的答案」；結果畫面顯示每筆對錯，得主標籤在只計對錯模式為「最早答對」。
- 前端只依 view 顯示，不自行判定或過濾。

- 證偽欄｜可證偽：`web/src/pages/judging.test.tsx`（判定鈕呼叫 `judge`、揭曉鈕在 pending>0 時停用、模式單選只在準備階段可按）。
