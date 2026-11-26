# local-launch Specification

## Purpose
任一方式啟動（make dev、make dev-tunnel、start.cmd）就緒後自動開本機老師頁一次，準備階段老師頁頂部顯示「開始前的設定」清單，以及 start.ps1 缺工具時詢問以 winget 代裝的規則。

## Requirements

### Requirement: 啟動後自動開老師頁

以 `make dev`、`make dev-tunnel` 或 `start.cmd` 啟動時，伺服器就緒後 MUST 以預設瀏覽器開啟本機老師頁一次；帶 `--no-browser`、設定 `QUIZ_NO_BROWSER=1` 或環境變數 `CI` 非空時 MUST NOT 開啟。終端機 MUST 仍印出老師頁與學生頁網址；瀏覽器開不了時 MUST 印出提示並照常運作。

#### Scenario: 雙擊 start.cmd
- **WHEN** 老師雙擊 `start.cmd` 且伺服器就緒
- **THEN** 預設瀏覽器 MUST 開啟 `http://127.0.0.1:8000/#/teacher?key=…` 恰一次

#### Scenario: 關閉自動開啟
- **WHEN** 以 `--no-browser` 或 `QUIZ_NO_BROWSER=1` 啟動
- **THEN** 伺服器 MUST NOT 開啟瀏覽器，終端機 MUST 照印網址

### Requirement: 老師頁顯示開始前的設定清單

活動在準備階段時，老師頁頂部 MUST 顯示「開始前的設定」清單，列出 Google（未設定／未登入／已登入）、手機連線（關閉／建立中／已開啟）、題目（尚未匯入／已匯入 N 題）三項狀態，點選 MUST 捲到對應分區；其他階段 MUST NOT 顯示。

#### Scenario: 首次進入未設定
- **WHEN** 伺服器未設定 Google 用戶端、未開手機連線、未匯入題目時老師開老師頁
- **THEN** 清單三項 MUST 分別顯示「未設定」「關閉」「尚未匯入」，Google 分區 MUST 展開設定精靈

### Requirement: 啟動腳本缺工具時詢問代裝

`start.ps1` 找不到 uv 或 Node.js 時 MUST 詢問是否以 winget 安裝；同意則 MUST 安裝並刷新本行程 PATH 後繼續啟動，不同意或非互動 MUST 印出手動安裝指令後結束。

#### Scenario: 同意代裝
- **WHEN** 缺 uv 的電腦雙擊 `start.cmd` 並輸入 Y
- **THEN** 腳本 MUST 以 winget 安裝 uv、刷新 PATH 並繼續啟動，不需重開視窗
