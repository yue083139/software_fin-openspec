# mode-timed-scoring — design（v1.0）

知識時點：2026-11-12。對標：Kahoot!「How points work」：答對得分隨作答時間遞減、0.5 秒內滿分、答錯 0 分；每題有時限，主持人逐題推進，每題結束顯示正解與排行榜（`docs/research/competitors.md`）。裁剪：沒有標準答案 ⇒ 每題多一步「老師判定」；排行榜只公開分數不公開答案。

## 決策

### D1 模式

`Mode` 增 `sequential: bool`（經典、只計對錯為 `False`）。新增 `MODES["timed"] = Mode("timed", "時間計分", judged=False, sequential=True, rule=TimedRule())`——逐題模式的判定在每題關閉後、仍在 `answering` 階段內完成，不使用全域 `judging`。

- 證偽欄｜可證偽：`test_modes.py` 登記表三種模式。

### D2 題目時限

`QuestionAttrs` 增 `time_limit: int = 20`（秒，5–120；預設值屬取捨）。`POST /api/teacher/question-settings` 本體改為 `{question, multiplier?, time_limit?}`，至少一個欄位（否則 422），各自驗範圍；回應含兩欄。`questions[]` 增 `time_limit`。

- 證偽欄｜可證偽：`test_question_settings.py` 增時限錯誤碼與「只給一欄不動另一欄」。

### D3 回合狀態

```python
@dataclass
class Round:
    number: int
    opened_at: float          # 伺服器單調時鐘（秒）
    deadline_epoch_ms: int    # 僅供前端倒數顯示
    limit: int
    closed: bool = False
    revealed: bool = False
```

`Activity.rounds: dict[int, Round]`；`current` ＝唯一一個 `revealed=False` 的回合（或 `None`）。`Activity(clock=time.monotonic, wall=time.time)` 可注入。

| 方法 | 前置（鎖內，讀寫之間有 `_checkpoint()`） | 效果 |
|---|---|---|
| `open_next()` | `answering` 且 `mode.sequential`；`current is None`（否則「請先揭曉目前這一題」）；尚有未開放題（否則「所有題目都已開放過」） | 依題號順序開下一題、排程計時器 |
| `close_question()` | `current` 存在且未關閉 | 關閉 |
| `close_due()` | — | `current` 未關閉且 `clock() − opened_at ≥ limit` 時關閉（計時器呼叫；可重入） |
| `reveal_question()` | `current` 已關閉且該題無未判定 | `revealed=True` |
| `submit()`（逐題模式） | 題號＝`current.number`、未關閉、`clock() − opened_at ≤ limit`；否則 409 | `elapsed_ms ＝ (clock() − opened_at) × 1000` |
| `judge()`／`accept_suggestions()`（逐題模式） | 該題回合已關閉且未揭曉（否則 409） | 同 game-mode-framework D3 |
| `end()`（逐題模式） | `answering` 且 `current is None` | 轉 `ended`（未開放的題目無送出、無得主） |

計時器：`open_next` 以 `asyncio.create_task` 起一個「睡到截止再 `close_due()`」的任務；`reset`、`load_questions` 取消並清空回合。截止判斷**在送出路徑**以時鐘比對，計時器只決定何時推送「已關閉」，所以計時器晚到不會多收逾時答案。非逐題模式的 `elapsed_ms` 仍自開始搶答起算（全部題目同時開放，等同自開題起算）。

- 證偽欄｜可證偽：`test_timed_mode.py`（假時鐘）：開題順序；送出非開放題 409；時鐘停在 `limit + 0.001` 送出 409、停在 `limit` 送出成功；`close_due` 於截止前不關、截止後關且推送；`elapsed_ms` 等於假時鐘差；未揭曉時 `open_next` 與 `end` 409；未關閉時判定 409；有未判定時揭曉 409；`test_concurrent_close_and_submit`：截止與送出並發 20 輪，被接受的送出其 `elapsed_ms ≤ limit × 1000`。變異實錄：拿掉送出路徑的截止比對，逾時測試必紅。

### D4 計分

```python
def timed_points(elapsed_ms: int, limit: int, multiplier: int) -> int:
    t = elapsed_ms / 1000
    base = 1000 if t <= 0.5 else math.floor(1000 * (1 - min(t, limit) / limit / 2) + 0.5)
    return base * multiplier
```

`TimedRule`：依 `seq` 排 `rank`；`correct = judgments.get(team)`；正確者 `score = timed_points(...)`，其餘 0；得主＝最早的正確送出（匯出寫回它）。四捨五入不用 Python `round`：

```
$ uv run --project server python -c "...round(0.5), round(2.5), round(999.5)..."
round(0.5)= 0 round(2.5)= 2 round(999.5)= 1000
T=30,t=2: 966.6666666666666 -> 967
```

- 證偽欄｜可證偽：`test_scoring.py::test_timed_points`：(400 ms, 20) ⇒ 1000；(20000, 20) ⇒ 500；(2000, 30) ⇒ 967；倍率 2 ⇒ 兩倍；`TimedRule` 錯誤 0 分、得主為最早正確者。

### D5 view 與隔離

- 老師與學生 view 增 `round: {question, state: "open"|"closed", deadline_epoch_ms} | null`（`current` 的公開狀態；同一時間對所有人相同，不含任何組別資訊）。
- 學生 view（逐題模式、非 `ended`）增：
  - `revealed: [{question, submitted, correct, score}]`——**只有本組**，只列已揭曉題；
  - `leaderboard: [{team, score}]`——全部組別在**已揭曉題**的累積分數，分數高者在前、同分依組別順序；尚無揭曉題時為空陣列。
  - 他組答案、順位、作答秒數一律不送；`ended` 照舊加完整 `results`。
- 老師 view 照舊有完整 `board`（即時）；另有同格式 `leaderboard`。
- 推播：他組送出不改本組 view ⇒ 不推；開題、關閉、揭曉改變所有人的 view ⇒ 全推。

- 證偽欄｜可證偽：`test_isolation.py::test_timed_mode_isolated`（開放中、已關閉、已揭曉三狀態下 B 組全部位元組不含 A 組答案字串）、`test_timed_other_team_submit_sends_nothing`、`test_leaderboard_counts_revealed_only`（關閉未揭曉時排行榜不含該題分數）。

### D6 API（`contracts/api.md` 只增不改）

| 端點 | 成功 | 錯誤 |
|---|---|---|
| `POST /api/teacher/open-next` | `{question}` | 401；409 非 answering、非逐題模式、目前題未揭曉、已無題目 |
| `POST /api/teacher/close-question` | `{question}` | 401；409 沒有進行中的題目 |
| `POST /api/teacher/reveal-question` | `{question}` | 401；409 未關閉或尚有未判定 |
| `POST /api/student/submit`（語意補充） | 同前 | 409 增「這一題目前沒有開放作答」「本題作答時間已到」 |

### D7 web

- 老師：時間計分模式下題目清單每題可設時限（準備階段）；搶答中顯示目前回合（題號、倒數、狀態）、「開放下一題」「提早結束本題」「採用全部建議」「揭曉本題」「結束活動」，各鈕依 view 啟用；判定只在目前已關閉的那一題可按；顯示排行榜。
- 學生：只顯示進行中那一題的作答卡與倒數（依 `deadline_epoch_ms − Date.now()`，僅供顯示）；已關閉顯示「本題已結束，等待老師揭曉」；揭曉後顯示「本組答對／答錯，+N 分」與排行榜。
- 倒數以本機時鐘換算，只影響顯示；截止以伺服器為準（送出逾時顯示伺服器的 409 訊息）。

- 證偽欄｜可證偽：`web/src/pages/timed.test.tsx`。

### D8 真棧探針

`probes/timed_flow_probe.py`：起真 uvicorn（`--port 0`）、老師把第 1 題時限設 5 秒、選時間計分、開始、開放第 1 題、兩組以真 WebSocket 用戶端連線並送出、等 6 秒確認收到 `round.state=closed` 推播、判定、揭曉、讀排行榜；輸出原樣存 `probes/results/2026-11-1x-timed-flow.txt`。

- 證偽欄｜可證偽：探針斷言失敗即非零退出。
