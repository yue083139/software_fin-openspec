# easy-setup — tasks（v1.0）

## 0. 提案前置
- [x] 0.1 探針③：PATH 刷新（`probes/results/2026-11-26-easy-setup.txt`）
- [ ] 0.2 探針①②：負責人本機執行 `uv run --project server python -X utf8 probes/easy_setup_probe.py --browser-url http://127.0.0.1:8000/ --cycles 3`，原樣輸出回填結果檔與 design D1、D3 證偽欄（起草會話被權限拒絕；阻塞定稿）
- [x] 0.3 `docs/parity.md` §4 登記本卡、§5 記變更；SpecKit 組同批起稿（`specs/017-easy-setup/`）
- [ ] 0.4 提案輪評審（紅隊＋架構雙通道，1 輪）；藥方併入下一版；負責人批准 `contracts/api.md` 改動（D6）

## 1. 驗收測試（先寫，先紅）
- [ ] 1.1 `server/tests/test_google_config.py`（D2 全部情境；`.env` 以 tmp_path 注入，不碰真檔）
- [ ] 1.2 `server/tests/test_tunnel_api.py`（D3，假 Tunnel）
- [ ] 1.3 `server/tests/test_launch.py`（D1，替身 open_browser）
- [ ] 1.4 web：精靈、手機連線開關與 503 提示、頂部清單（D2–D4）
- [ ] 1.5 `eval/acceptance/matrix.yaml`：M-025、M-026、M-027

## 2. 實作
- [ ] 2.1 `quiz_server/envfile.py`、`GoogleSession.reconfigure`、Google 設定端點
- [ ] 2.2 `app.py` 手機連線端點與鎖、`Activity.tunnel`、views、lifespan 收尾
- [ ] 2.3 `__main__.py`：`uvicorn.Server`＋就緒後開瀏覽器、`--no-browser`
- [ ] 2.4 web：`GooglePanel` 精靈、`StudentLink` 開關、`SetupChecklist`
- [ ] 2.5 `start.ps1` 代裝；刪 `start-tunnel.cmd`；Makefile 說明
- [ ] 2.6 `contracts/api.md`、README、`.env.example`、`docs/manual-verification.md`

## 3. 驗證
- [ ] 3.1 `make gate` 原樣輸出與變異實錄寫入 `verification.md`
- [ ] 3.2 實作輪評審（雙通道 1 輪）
- [ ] 3.3 人工驗證（負責人：雙擊 `start.cmd` 全程不看終端機完成設定；清除設定後精靈重設不重啟即可登入）
- [ ] 3.4 `docs/parity.md` 狀態、`make gate-parity SIBLING=../software_fin-speckit` 綠
