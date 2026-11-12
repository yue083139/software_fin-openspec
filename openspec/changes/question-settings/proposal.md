# question-settings — 題目設定：雙倍分數題（v1.0）

檔位：**S**（`contracts/` 增端點；TRD §5 原建議 B，依分檔表「命中任一取最高」改 S）｜主人：@yue083139｜parity：`docs/parity.md` §4 `question-settings`｜需求：X-04（TRD T-05 倍率）｜依賴：`game-mode-framework`

## 首屏決策摘要

1. **倍率只有 1 與 2**：選了「雙倍分數題」開關而非任意倍率／代價：不能設三倍／屬取捨，理由：TRD 只要求雙倍（Kahoot 的 Double points 也只有 ×2）；422 擋其他值。
2. **倍率是規則的輸入（`attrs`），由規則乘進分數**：`QuestionAttrs(multiplier)` 經 `ScoringRule.rank(…, attrs)` 傳入，經典與只計對錯兩種規則都乘倍率；view、結果、排行榜不另算／可被「同一組送出紀錄在倍率 1 與 2 下分數恰為兩倍」的表格式測試證偽（TRD §4）。
3. **只在準備階段可設；重新匯入清除、重置活動保留**：代價：搶答中發現設錯只能結束後重置重來／屬取捨，理由：搶答中改倍率會改變已作答組別的期望分數，不公平。
4. **學生看得到哪些題是雙倍**：對標 Kahoot（題目出現前顯示 Double points）；倍率不是他組資訊，不受作答隔離限制。
5. **分數欄名由伺服器決定**：經典搶答且全部倍率為 1 時為「得題數」，其餘「得分」（`score_label`），前端不自行判斷。

**矩陣落點**：新增 M-013（雙倍分數題）。

**merge 三問第三問**：需求證實——X-04；負責人 2026-11-12 點名「double point question」並裁定列入第二期。

## 目標

- `scoring.py`：`QuestionAttrs`；`ClassicBuzzRule`、`AccuracyRule` 分數乘 `multiplier`。
- `Activity.attrs`、`set_question(number, multiplier)`；匯入清除、重置保留。
- `POST /api/teacher/question-settings`；`questions[].multiplier`（老師與學生）、`score_label` 規則更新。
- web：老師題目清單每題「雙倍分數」勾選（準備階段）；學生題目清單與作答卡顯示「雙倍分數」標記。

## 邊界（本卡不做）

時限設定（`mode-timed-scoring`）；把倍率寫回或讀自 Guided Notes（TRD T-05：不寫回）。

## 驗收

| # | 指令 | 期望輸出 |
|---|---|---|
| 1 | `uv run --project server pytest -q server/tests/test_scoring.py` | 兩種規則在倍率 1／2 下分數恰為兩倍；passed |
| 2 | `uv run --project server pytest -q server/tests/test_question_settings.py` | 錯誤碼（401、404、409、422）、匯入清除、重置保留、`score_label`、學生 view 含倍率；passed |
| 3 | `npm --prefix web test` | 勾選呼叫設定 API、非準備階段停用、學生端顯示標記；passed |
| 4 | 人工驗證 | 第 2 題設雙倍 → 兩組作答 → 結束 → 第 2 題得主得 2 分，欄名為「得分」 |

## 實錄結果

見 `verification.md`。
