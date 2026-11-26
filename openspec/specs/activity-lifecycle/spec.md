# activity-lifecycle Specification

## Purpose
活動的身分驗證（老師金鑰、組別憑證）、組數設定、活動階段狀態機，以及以 WebSocket 把各連線自己的畫面狀態同步給老師與學生的規則。

## Requirements

### Requirement: 系統必須區分老師與學生兩種身分

系統 MUST 提供老師與學生兩種身分進場。老師 MUST 以伺服器啟動時產生的老師金鑰驗證；學生 MUST 選定一個組別並取得伺服器發出的組別憑證，之後的連線與操作 MUST 以憑證辨識組別，MUST NOT 採信客戶端自報的組別名稱。組隊關閉時每組 MUST 只有一台裝置；組隊開啟時同組可有多台裝置，第二台起 MUST 以該組邀請碼加入（team-mode）。

#### Scenario: 學生選組進場
- **WHEN** 學生在首頁選擇「第2組」
- **THEN** 學生頁 MUST 顯示所屬組別「第2組」與目前活動階段

#### Scenario: 無金鑰不得使用老師功能
- **WHEN** 未帶老師金鑰或帶錯金鑰呼叫任何老師端 API
- **THEN** 伺服器 MUST 回 401，且活動狀態 MUST NOT 改變

#### Scenario: 同一組只能有一台裝置
- **WHEN** 組隊關閉時第1組已有裝置加入，另一台裝置再選第1組
- **THEN** 伺服器 MUST 回 409，直到老師釋放第1組

#### Scenario: 沒有憑證只拿到最少資訊
- **WHEN** 學生連線未帶憑證、帶錯憑證或帶已被撤銷的憑證
- **THEN** 伺服器 MUST 只回傳階段與「組別無效」標記，MUST NOT 回傳任何組別或老師端資料

### Requirement: 活動階段由伺服器狀態機管理並同步給所有使用者

活動階段 MUST 為 `preparing`、`answering`、`judging`、`ended` 之一，只能依轉移表改變；任何階段變更 MUST 推送給所有已連線的老師與學生。開始搶答 MUST 以已匯入題目為前提。結束搶答 MUST 只在 `answering` 階段允許；`judging` MUST 只能經揭曉進入 `ended`。

#### Scenario: 老師開始搶答
- **WHEN** 老師在 `preparing` 階段且已匯入題目時按「開始搶答」
- **THEN** 所有已連線的使用者 MUST 收到 `phase=answering` 的狀態更新

#### Scenario: 非法轉移被拒
- **WHEN** 在 `preparing` 階段要求「結束搶答」
- **THEN** 伺服器 MUST 回 409，階段 MUST 維持 `preparing`

#### Scenario: 並發轉移只成功一次
- **WHEN** 同時送出多個「開始搶答」請求
- **THEN** 恰有一個成功，其餘 MUST 回 409

#### Scenario: 經典模式不經過判定階段
- **WHEN** 經典模式下老師結束搶答
- **THEN** 階段 MUST 直接由 `answering` 變為 `ended`

#### Scenario: 判定模式經過判定階段
- **WHEN** 只計對錯模式下老師結束搶答
- **THEN** 階段 MUST 由 `answering` 變為 `judging`

#### Scenario: 未匯入題目不得開始
- **WHEN** 尚未匯入題目時老師按開始
- **THEN** 伺服器 MUST 回 409

### Requirement: 老師可設定組數並重置活動

老師 MUST 能在 `preparing` 階段設定 2 到 12 組；在 `ended` 階段重置活動回到 `preparing`，重置 MUST 清除作答紀錄並保留題目與組別。

#### Scenario: 設定組數
- **WHEN** 老師在 `preparing` 階段設定 5 組
- **THEN** 所有使用者 MUST 收到含 `第1組` 到 `第5組` 的狀態

#### Scenario: 搶答中不得改組數
- **WHEN** 老師在 `answering` 階段設定組數
- **THEN** 伺服器 MUST 回 409

### Requirement: 老師頁以工作檯版型呈現

老師頁 MUST 以「玻璃頂欄＋左側導覽＋內容卡」呈現：頂欄 MUST 顯示目前階段；左側導覽 MUST 列出活動控制、模式、作答狀況與結果、學生連結、Google 帳號、題目與匯入、組別與裝置，點擊 MUST 捲到對應內容卡；所有內容卡 MUST 同時存在於頁面上。版型改變 MUST NOT 改變任何按鈕的行為、文案與可按條件，也 MUST NOT 改變送往學生端的資料。

#### Scenario: 導覽捲到作答狀況表
- **WHEN** 老師點左側導覽「作答狀況與結果」
- **THEN** 頁面 MUST 捲到作答狀況表那一張卡，且活動控制按鈕仍在頁面上

#### Scenario: 頂欄顯示階段
- **WHEN** 老師按「開始搶答」
- **THEN** 頂欄的階段膠囊 MUST 由「準備中」變為「搶答中」

### Requirement: 學生頁在手機寬度可作答

學生頁與首頁 MUST 以置中窄版卡片呈現；每題一張卡，題目敘述 MUST 在對應子題輸入欄上方；在 420px 寬度下輸入欄與「搶答送出」按鈕 MUST 不需水平捲動即可操作。

#### Scenario: 手機寬度作答
- **WHEN** 學生以手機寬度開啟學生頁並在搶答中
- **THEN** 每題的輸入欄與「搶答送出」按鈕 MUST 完整顯示在畫面寬度內
