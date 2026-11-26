# question-text — tasks（v1.1）

## 0. 提案前置
- [x] 0.1 探針：四份夾具的表頭與題目欄逐列文字，原樣輸出存 `probes/results/2026-11-26-question-text.txt`
- [x] 0.2 `docs/parity.md` §4 登記本卡、§5 記變更；SpecKit 組同批起稿（`specs/011-question-text/`）
- [x] 0.3 提案輪評審（紅隊＋架構雙通道，1 輪）；藥方併入下一版；負責人裁定並批准 `contracts/api.md` 改動（D3）

## 1. 驗收測試（先寫，先紅）
- [x] 1.1 `server/tests/test_guided_notes_parse.py`：四份夾具逐子題 `prompt`；合成「無題目欄」「題組敘述縱向合併」負例
- [x] 1.2 `server/tests/test_isolation.py`：`test_prompts_hidden_until_open`、`test_prompts_sequential_only_opened`、搶答中帶 `prompts` 的 payload 不含他組答案
- [x] 1.3 `server/tests/test_api_skeleton.py` 或同等：老師 view 任何階段帶 `prompts`、長度＝子題數
- [x] 1.4 web：`answer.test.tsx` 有敘述顯示、無敘述不留白；`results.test.tsx` 結果表顯示敘述
- [x] 1.5 `eval/acceptance/matrix.yaml`：M-003 守門補；新增 M-021

## 2. 實作
- [x] 2.1 `guided_notes.py`：`QUESTION_ALIASES`、表頭找題目欄、`Slot.prompt`
- [x] 2.2 `views.py`：`question_outline(a, teacher)` 依 D2 帶 `prompts`
- [x] 2.3 `contracts/api.md`（負責人批准後）
- [x] 2.4 web：`types.ts`、學生作答卡、老師題目清單與作答表、學生結果表
- [x] 2.5 文件：`docs/manual-verification.md` 場次 A 加「準備階段只見題號、開始後見敘述」

## 3. 驗證
- [ ] 3.1 `make gate` 原樣輸出寫入 `verification.md`
- [ ] 3.2 實作輪評審（雙通道 1 輪）
- [ ] 3.3 人工驗證（負責人，`docs/manual-verification.md` 場次 A）
- [ ] 3.4 `docs/parity.md` 狀態更新、`make gate-parity SIBLING=../software_fin-speckit` 綠
