# easy-setup — tasks（v1.1）

## 0. 提案前置
- [x] 0.1 探針③：PATH 刷新（`probes/results/2026-11-26-easy-setup.txt`）
- [x] 0.2 探針①②：負責人本機執行 `uv run --project server python -X utf8 probes/easy_setup_probe.py --browser-url http://127.0.0.1:8000/ --cycles 3`，原樣輸出回填結果檔與 design D1、D3 證偽欄（2026-11-26 負責人主會話執行並回填；探針改固定 204 handler）
- [x] 0.3 `docs/parity.md` §4 登記本卡、§5 記變更；SpecKit 組同批起稿（`specs/017-easy-setup/`）
- [x] 0.4 提案輪評審（架構 CLEARED 0B/1M/3m、紅隊 NOT CLEARED 0B/4M/4m，皆 0 阻斷）；藥方併入 v1.1；負責人已批准 `contracts/api.md` 改動並指示審完直接實作

## 1. 驗收測試（先寫，先紅）
- [x] 1.1 `server/tests/test_google_config.py`（D2 全部情境；`.env` 以 tmp_path 注入，不碰真檔）
- [x] 1.2 `server/tests/test_tunnel_api.py`（D3，假 Tunnel）
- [x] 1.3 `server/tests/test_launch.py`（D1，替身 open_browser）
- [x] 1.4 web：精靈、手機連線開關與 503 提示、頂部清單（D2–D4）
- [x] 1.5 `eval/acceptance/matrix.yaml`：M-025、M-026、M-027

## 2. 實作
- [x] 2.1 `quiz_server/envfile.py`、`GoogleSession.reconfigure`、Google 設定端點
- [x] 2.2 `app.py` 手機連線端點與鎖、`Activity.tunnel`、views、lifespan 收尾
- [x] 2.3 `__main__.py`：`uvicorn.Server`＋就緒後開瀏覽器、`--no-browser`
- [x] 2.4 web：`GooglePanel` 精靈、`StudentLink` 開關、`SetupChecklist`
- [x] 2.5 `start.ps1` 代裝（只認 Y／y）並刪 `-Tunnel` 參數；刪 `start-tunnel.cmd`；`start-tunnel` 引用全集依 D3 逐一處理（Makefile 無引用，不改）
- [x] 2.6 `contracts/api.md`、README、`.env.example`、`docs/manual-verification.md`

## 3. 驗證
- [x] 3.1 `make gate` 原樣輸出與變異實錄寫入 `verification.md`
- [ ] 3.2 實作輪評審（雙通道 1 輪）
- [ ] 3.3 人工驗證（負責人：雙擊 `start.cmd` 全程不看終端機完成設定；清除設定後精靈重設不重啟即可登入）
- [ ] 3.4 `docs/parity.md` 狀態、`make gate-parity SIBLING=../software_fin-speckit` 綠
