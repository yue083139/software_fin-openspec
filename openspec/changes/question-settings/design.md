# question-settings — design（v1.0）

知識時點：2026-11-12。對標：Kahoot! 的 Double points 為逐題開關，分數 ×2，題目開始前提示玩家（`docs/research/competitors.md`）。

## 決策

### D1 題目屬性與規則輸入

`scoring.py`：

```python
@dataclass(frozen=True)
class QuestionAttrs:
    multiplier: int = 1   # 1 或 2
```

`ScoringRule.rank(submissions, judgments=None, attrs: QuestionAttrs | None = None)`（原型別 `Mapping[str, Any]` 改為此資料類別；`None` 視同預設）。`ClassicBuzzRule` 得主 `score = 1 × multiplier`；`AccuracyRule` 正確者 `score = 1 × multiplier`。`results.build`、`team_scores`、`winning_answers` 一律把該題的 `QuestionAttrs` 傳給規則。

- 證偽欄｜可證偽：`test_scoring.py::test_multiplier_doubles`（兩種規則、同一組紀錄，倍率 2 的每筆分數＝倍率 1 的兩倍；得主不變）。

### D2 設定流程

`Activity.attrs: dict[int, QuestionAttrs]`；`load_questions` 以預設值重建（新題目清單），`reset` 不動。`set_question(number, multiplier)`：鎖內、`preparing`（409）、題號存在（404）、`multiplier in (1, 2)`（`SettingsError(ValueError)` ⇒ 422）；改變後 `_bump()`。

- 證偽欄｜可證偽：`test_question_settings.py`：錯誤碼；重新匯入後全部回 1；`ended → reset` 後保留；搶答中設定 409 且倍率不變。

### D3 view 與 API

- `POST /api/teacher/question-settings`，本體 `{question, multiplier}`，回 `{question, multiplier}`；401／404／409／422。
- 老師與學生的 `questions[]` 增 `multiplier`；`results` 與 `board` 每題增 `multiplier`。
- `score_label`：`mode.key == "classic"` 且所有倍率為 1 ⇒「得題數」，否則「得分」。

- 證偽欄｜可證偽：`test_question_settings.py::test_score_label`、`test_student_sees_multiplier`；`test_isolation.py` 既有負例不變（倍率不是他組資訊）。

### D4 web

老師 `QuestionList` 在準備階段每題多一個「雙倍分數」勾選框（呼叫 API，非準備階段停用）；學生 `QuestionList` 與作答卡在倍率 2 的題目標「雙倍分數」；結果畫面每題標倍率。分數欄名一律用 `score_label`。

- 證偽欄｜可證偽：`web/src/pages/settings.test.tsx`。
