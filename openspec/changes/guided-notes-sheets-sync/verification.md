# guided-notes-sheets-sync — verification

知識時點：2026-11-17；本機 Windows 11、分支 `feat/guided-notes-sheets-sync`。

## 門禁原樣輸出（`make gate`，摘錄計數行，退出碼 0）

```
All checks passed!
All checks passed!
266 passed, 1 warning in 14.73s
48 passed in 5.58s
 Test Files  8 passed (8)
      Tests  38 passed (38)
gate-zh-hant: 0 處簡體字
gate-secrets: 0 findings
Totals: 10 passed, 0 failed (10 items)
gate-agents: 0 處漂移
gate-parity: 0 處不一致
```

驗收 #5、#6：

```
$ git grep -nE '"[A-Z]{1,2}[0-9]+"' -- server/quiz_server
（無輸出）
$ git grep -n "export?format=xlsx" -- server/quiz_server web/src
（無輸出）
```

## 變異實錄（錯時會紅；每項改完即還原）

```
--- 變異：回呼不比對 cookie（初次：19 passed——缺「cookie 值不符」測試，已補 test_cookie_of_another_login_rejected）
--- 變異：回呼不比對 cookie（補測試後）
FAILED server\tests\test_api_google.py::test_cookie_of_another_login_rejected
1 failed, 19 passed, 1 warning in 2.24s
--- 變異：寫回改 USER_ENTERED
FAILED server\tests\test_google_sheets.py::test_write_targets_only_the_copy_with_raw
1 failed, 29 passed, 1 warning in 2.44s
--- 變異：不讀 effectiveValue.numberValue
FAILED server\tests\test_google_sheets.py::test_number_column_uses_effective_value
1 failed, 10 passed in 0.82s
--- 變異：停用 D5 子題填空格
FAILED server\tests\test_guided_notes_parse.py::test_group_template - Asserti...
FAILED server\tests\test_guided_notes_parse.py::test_d5_right_cell_with_content_is_not_blank
FAILED server\tests\test_guided_notes_export.py::test_group_keeps_labels - As...
3 failed, 20 passed in 1.41s
--- 變異：import-url 不先擋階段
FAILED server\tests\test_api_import.py::test_import_url_rejected_while_answering_sends_no_request
1 failed, 19 passed, 1 warning in 1.34s
--- 變異：授權網址拿掉 prompt=consent
FAILED server\tests\test_api_google.py::test_login_url_and_cookie - KeyError:...
1 failed, 18 passed, 1 warning in 2.01s
--- 變異：回呼頁回顯 error 參數
FAILED server\tests\test_api_google.py::test_callback_does_not_echo_params - ...
1 failed, 18 passed, 1 warning in 2.06s
--- 變異：gate_secrets 刪除 refresh token 形狀
1 failed, 47 passed in 5.56s
```

## 實作輪評審藥方的變異實錄

```
--- 變異：備援 xlsx 不淨化分頁名
FAILED server\tests\test_api_google.py::test_sheet_names_invalid_in_xlsx_still_import[11/17 學習單]
FAILED server\tests\test_api_google.py::test_sheet_names_invalid_in_xlsx_still_import[Q1:Q2]
FAILED server\tests\test_api_google.py::test_sheet_names_invalid_in_xlsx_still_import[[備]]
3 failed, 22 passed, 1 warning in 3.02s
--- 變異：匯入失敗不刪副本
FAILED server\tests\test_api_google.py::test_copy_deleted_when_not_adopted - ...
1 failed, 24 passed, 1 warning in 3.30s
```

## 偏離（已回改 design v1.2 抬頭與 D1、D3、D4）

| 決策 | 稿 | 實作 | 處置 |
|---|---|---|---|
| D1 換新失敗 | 過期後才 401 | 立即 401 並設未登入 | 回稿 |
| D3 gid 檢查 | 讀副本時篩分頁 | 複製前即檢查，不建立副本 | 回稿 |
| D3 副本未被採用 | 只有解析失敗刪副本 | 任何採用前失敗都刪副本 | 回稿（評審藥方） |
| D4 備援 xlsx 分頁名 | 沿用 Google 名稱 | 淨化＋對照 | 回稿（評審藥方） |
| D1 `.env` 編碼 | 未述 | utf-8-sig | 回稿（評審 followup 順手修） |

## 真棧（design D1–D5）

`probes/results/2026-11-17-sheets-sync-real-stack.txt`：`make dev`＋Chrome＋負責人 Google 帳號，登入 → 從 Google 試算表匯入（複製後讀副本，4 題、題組 2 子題）→ 兩組作答 → 結束 → 匯出到 Google 試算表；副本 H5／H6／H8／H9 為答案、G 欄標籤不變、「=1+1」存成文字、第 4 題空白；原試算表未被寫入。

探針 v1.2 六步皆 OK（`probes/results/2026-11-17-google-sheets-v1.2.txt`）：登入（含 email）、讀取（已含 D5 H 欄，與夾具相同）、複製、寫入、換新、撤銷（撤銷後再換新 400 invalid_grant）。

## 人工驗證（需求 P-05）

狀態：**已執行**（照 `docs/manual-verification.md` 場次 A2 第 6 步、A5 第 16～18 步重驗）。

結果：✅ 全部步驟符合（jinny／2026-11-19／`feat/guided-notes-sheets-sync` `9e3b39a`，Windows 11＋Chrome（含無痕）、Edge，負責人 OAuth 用戶端＋jinny 的 Google 帳號（測試使用者）；明細見 `docs/manual-verification.md` §5 A2、A5）。A2 第 6 步：登入完成、老師頁顯示已登入，從試算表匯入得 4 題（第 1、2 題各 2 子題）並出現副本連結，雲端硬碟多一份「-搶答結果」，學生只見題號。A5 第 16 步：匯出後副本題組答案在標籤右邊、G 欄標籤不變、第 3 題為得主答案、第 2、4 題空白、格式框線不變，原試算表未變；第 17 步：下載 xlsx 答案位置相同；第 18 步：上傳來源匯出顯示 409 提示，備援檔題組答案在 H 欄。
