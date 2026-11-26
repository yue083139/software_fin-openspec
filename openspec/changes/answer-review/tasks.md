# answer-review — tasks（v1.1）

## 0. 提案前置
- [x] 0.1 現行行為以原始碼引述為證（design 背景段）；`git grep -n 搶答結果 -- :/` 全列，D6 逐點改或登記有意不改
- [ ] 0.2 `docs/parity.md` §4 已於 `question-text` 分支登記 `answer-review`（取代 `mode-buzz-fallback`）；合流時把 `guided-notes-export`、`guided-notes-sheets-sync` 兩列的「-搶答結果」改為「_作答情況」；SpecKit 組同批起稿（`specs/012-answer-review/`）
- [x] 0.3 提案輪評審（紅隊 0B/2M/3m、架構 0B/1M/3m，皆 0 阻斷）；藥方併入 v1.1；負責人 2026-11-26 裁定未決事項並批准 `contracts/api.md` 改動

## 1. 驗收測試（先寫，先紅）
- [x] 1.1 `server/tests/test_scoring.py`：新增判錯遞補、判對鎖定、全部判錯無得主；**改寫** `test_judgments_do_not_change_classic` → `test_classic_without_judgments_unchanged`、`test_classic_correct_is_none` → `test_classic_correct_reflects_review`（理由：原斷言「經典不看判定、correct 恆 None」正是本卡推翻的口徑，改為「無判定時與第一期逐欄相同」）
- [x] 1.2 `server/tests/test_review.py`：錯誤碼與先後（模式、階段、題號、已鎖定、無可檢查、候選不符、格式）；連點負例；重設；推播
- [x] 1.3 `server/tests/test_results_view.py`：檢查後老師 `board` 與學生 `results` 一致
- [x] 1.4 `server/tests/test_google_sheets.py` copy 名稱「_作答情況」；`server/tests/test_api_google.py::test_reexport_restores_previously_written_cells`（v1.1 寫回範圍：有得主＋上次寫過，從未寫過不碰）
- [x] 1.5 `server/tests/test_api_export.py`：xlsx 為檢查後得主；全部判錯該格同原檔；檔名 `group_作答情況.xlsx`
- [ ] 1.6 （移到 `web-workbench` 整合）web：`results.test.tsx` 經典 ended 只有候選列有「答對」「答錯」、鎖定顯示「已鎖定」「重設本題」、全部答錯顯示「全部答錯，無得主」
- [x] 1.7 `eval/acceptance/matrix.yaml`：M-005、M-006、M-008 聲明與守門更新；新增 M-022

## 2. 實作
- [x] 2.1 `scoring.py`：`ClassicBuzzRule.rank` 讀判定（D1）
- [x] 2.2 `activity.py`：`review`、`review_reset`（D2、D3）
- [x] 2.3 `app.py`：兩個端點、`export_filename`（D2、D6）
- [x] 2.4 `google_sheets.py`：`COPY_SUFFIX`、`write_answers(restore=)`；`activity.py` `sheet_written`、`mark_sheet_written`；`app.py` 匯出鎖（D5 v1.1、D6）
- [x] 2.5 `contracts/api.md`（負責人批准後）
- [ ] 2.6 （移到 `web-workbench` 整合）web：`api.ts`、`types.ts`、`Results.tsx`（候選鈕、鎖定、重設、全部答錯）、`Teacher.tsx` 接線、`ImportPanel.tsx` 副本名稱
- [x] 2.7 文件：`README.md`、`docs/requirements.md` §4、`docs/manual-verification.md` 場次 A 加檢查步驟與檔名

## 3. 驗證
- [x] 3.1 `make gate` 原樣輸出寫入 `verification.md`
- [x] 3.2 實作輪評審（紅隊 CLEARED 0B/0M/2m、架構 CLEARED 0B/0M/0m；次要藥方已落）
- [ ] 3.3 人工驗證（負責人，`docs/manual-verification.md` 場次 A：判錯遞補、判對鎖定、重設、匯出副本與 xlsx、副本名稱）
- [ ] 3.4 `docs/parity.md` 狀態更新、`make gate-parity SIBLING=../software_fin-speckit` 綠
