# app-skeleton — tasks（v1.1）

## 1. 驗收先行
- [x] 1.1 `eval/acceptance/matrix.yaml` M-001、M-002 守門改為本卡測試
- [x] 1.2 `server/tests/test_phases.py`：窮舉轉移、並發 start 只成功一次（D2、D3）；變異實錄：拿掉鎖必紅
- [x] 1.3 `server/tests/test_api_skeleton.py`：三連線階段同步、老師金鑰 401／4401、組別憑證（加入一次、釋放、錯憑證最少資訊）、組數設定（D4–D6）
- [x] 1.4 `web/src/*.test.tsx`：首頁兩種身分、學生頁顯示階段

## 2. 實作
- [x] 2.1 `server/pyproject.toml`、`quiz_server/phases.py`、`activity.py`（D2、D3、D6）
- [x] 2.2 `quiz_server/views.py`（每連線裁切 view，D4）、`app.py`（REST、WebSocket、老師金鑰、靜態檔，D1、D5）、`__main__.py`
- [x] 2.3 `web/`：Vite＋React＋TS 骨架、WebSocket hook（斷線重連）、首頁／老師頁／學生頁
- [x] 2.4 `contracts/api.md` 首建（D7）；`server/CLAUDE.md`、`web/CLAUDE.md`
- [x] 2.5 Makefile：`dev`、`web-install`、`test`／`lint` 納入 server 與 web；CI 安裝依賴

## 3. 驗證
- [x] 3.1 `make gate-pr` 原樣輸出寫入 `verification.md`
- [ ] 3.2 人工驗證步驟與結果寫入 `verification.md`（步驟已寫，待負責人執行）
- [x] 3.3 `docs/parity.md` §4 狀態更新、`make gate-parity` 綠
