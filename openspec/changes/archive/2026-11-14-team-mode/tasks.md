# team-mode — tasks（v1.1）

## 1. 驗收先行
- [x] 1.1 `server/tests/test_team_mode.py`（D1–D4：開關、邀請碼、上限與並發加入、釋放與切換撤銷、同組並發送出、組員看得到送出、草稿規則與清除、組隊不改計分）
- [x] 1.2 `server/tests/test_isolation.py` 新增組隊負例五則（D5）
- [x] 1.3 `eval/acceptance/matrix.yaml` M-017～M-019
- [x] 1.4 web：`web/src/pages/team.test.tsx`（D6）

## 2. 實作
- [x] 2.1 `activity.py`：`team_play`、`set_team_play`、`join(team, code)`、邀請碼、`MAX_DEVICES`、`devices`、`drafts` 與清除
- [x] 2.2 `app.py`：`/api/teacher/team-play`、`/api/student/draft`、join 本體 `code`、403；`views.py` D5 欄位；`contracts/api.md`（D7 新增與四處語意補充）；`docs/product-trd.md` §3、§4
- [x] 2.3 web：老師組隊開關與台數／邀請碼、首頁邀請碼欄、學生頁邀請碼與組內草稿

## 3. 驗證
- [x] 3.1 `make gate` 原樣輸出、變異實錄、人工驗證步驟寫入 `verification.md` 與 `docs/manual-verification.md` 場次 E
- [x] 3.2 `docs/parity.md` 狀態更新、`make gate-parity` 綠
