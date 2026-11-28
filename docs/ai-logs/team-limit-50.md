# `team-limit-50` Codex 對話紀錄

- 日期：2026-11-28（Asia/Taipei）
- 來源：本機 Codex 會話節錄；先同步 SpecKit `010-team-limit-50` 範圍，再依 `$openspec-propose` 建立 OpenSpec 四件套，接續依 `$openspec-apply-change` 撰寫驗收測試。
- 使用者指示：將 SpecKit 的 `team-limit-50` 同步到 OpenSpec；續做後要求繼續。
- 決策：組數 2–50、預設 4、每組最多 6 台；保留既有階段、憑證撤銷、答案隔離與伺服器順位；矩陣 M-031–M-033 與 SpecKit 逐字一致。因上游 dev 已使用 M-020–M-030，合流時將本卡編號移至未使用範圍。
- OpenSpec strict validation：`Change 'team-limit-50' is valid`。
- 繁體中文門禁：直接執行 `uv run --group dev python ops/gate_zh_hant.py .`，輸出 `gate-zh-hant: 0 處簡體字`。
- Server 紅燈基線：上限仍為 12 時，新增測試 `10 failed, 114 passed`；失敗涵蓋 13／50 組、浮點／字串轉型及第50組流程。完整摘要見 `probes/results/2026-11-28-team-limit-50-red-tests.txt`。
- Web 紅燈基線：新增 UI 測試 `1 failed, 1 passed`；組數 input 實際 `max="12"`，預期 `max="50"`。
- YAML 驗證：`eval/acceptance/matrix.yaml` 可解析，M-031–M-033 的聲明與 `../software_fin-speckit/eval/acceptance/matrix.yaml` 逐字一致。
- 隱私自檢：測試只使用合成答案與假憑證；未寫入真實學生資料或金鑰。
- 提案評審：紅隊回驗與架構通道均為 `CLEARED`。隔離測試改為第2–50組先提交，再檢查第1組 WebSocket 完整 payload；學生 REST 無讀取活動狀態端點，已明註只驗送出端回應不含他組答案。
- 實作：`MAX_TEAMS=50`；`TeamsBody` 使用 Pydantic strict 驗證並拒絕額外欄位；老師端 input 標籤與上限改為 2–50。伺服器 API／phase／isolation／submit／team-mode 測試 124 passed，新增 UI 測試 2 passed。
- 隔離門禁反變異：暫將 WebSocket view 改為老師 view，新增 50 組負例因第1組 payload 含第2–50組合成答案而失敗；復原後測試 124 passed。輸出摘要見 `probes/results/2026-11-28-team-limit-50-isolation-mutation.txt`。
- 容量實作探針：Windows 11／Python 3.12.12，300 連線（50×6），p95 55.1 ms、最慢 55.3 ms、300/300 一致；原樣輸出見 `probes/results/2026-11-28-team-limit-50-capacity-implementation.txt`。
- 全量門禁：server 248 passed、ops 41 passed、web 35 passed；`gate-zh-hant` 0 處、`gate-secrets` 0 findings、OpenSpec 10 passed、`gate-agents` 0 漂移、`gate-parity` 0 不一致。pytest 有既存 Starlette deprecation warning 與 cache 權限 warning，非測試失敗。
- 實作輪評審：紅隊與架構通道均 `CLEARED`；回報分別記於 `openspec/changes/team-limit-50/implementation-red.dispatch.review-red.md` 與 `implementation-arch.dispatch.review-arch.md`。兩通道都註明 768 px 人工驗證仍未完成。
- 人工 UI 補驗：本機 UI 實際完成第50組加入、老師端釋放、學生端重新加入；Chrome 100% 下確認學生頁狀態。後續以 Chrome DevTools Responsive 設為 768px 並成功載入學生頁，但該頁為預設 4 組，沒有在該寬度重跑第50組流程。結果表因尚未匯入題目而不可檢查；未用計時器證明30秒。詳見 `openspec/changes/team-limit-50/manual-ui-addendum.md`，task 4.2 維持未勾選。
- 最終人工驗證補正（2026-11-28）：以 Microsoft Edge 載入合成 `group.xlsx` 完成 50 組桌面流程（17.7 秒）及 768 px 窄畫面流程（24.1 秒），確認第50組顯示、加入、老師釋放與重新加入；詳細紀錄以 `openspec/changes/team-limit-50/verification.md` 為準，前述尚未完成的紀錄是較早測試狀態。
- 後續再試 768px 教師頁，組數欄位可改為 50，但 CUA 對「設定組數」按鈕回報無可用幾何位置；教師頁清單仍只有第1至第4組，故設定未生效。已找到合成夾具 `tests/fixtures/guided-notes/group.xlsx`，本次尚未匯入；未改活動狀態。伺服器檢查後停止。
- 文件門禁：最後新增人工 UI 補記後，`make gate-docs` 通過，繁體中文0處、secrets 0 findings、OpenSpec 10/10、agents 0漂移。
- 仍待：task 4.2 的 768px 下 50 組流程檢查、結果表檢查與30秒計時證據；合入 `dev` 後依流程 archive 並同步主規格。

提案輪與實作輪評審、正式實作及全量門禁已記錄於上；本卡尚未完成人工驗收，也未提交或推送。
