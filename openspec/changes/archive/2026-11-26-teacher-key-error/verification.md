# teacher-key-error — verification（v1.1）

## 門禁實錄

`make gate-pr`（2026-11-26，rebase 到 origin/dev 0a14a7c 之後）exit=0：

```
All checks passed!
All checks passed!
317 passed, 1 warning in 16.24s
48 passed in 4.87s
 Test Files  14 passed (14)
      Tests  68 passed (68)
gate-zh-hant: 0 處簡體字
gate-secrets: 0 findings
Totals: 13 passed, 0 failed (13 items)
gate-agents: 0 處漂移
```

web 第二次 `npx vitest run`：`Tests  68 passed (68)`。測試先紅：伺服器新增 3 例在實作前 3 failed（交握前關閉時 `websocket_connect` 直接拋例外）。

## 評審紀錄

- 對抗通道（diff）：CLEARED——990 條並發錯金鑰連線實測，關閉前無任何 view、不入連線清單、不觸發推播。followup：原 `test_bad_key_connection_gets_no_pushes` 不是並發測試 ⇒ 已改名 `test_good_connection_unaffected_after_bad_key`。
- 架構通道（全卡掃）：NOT CLEARED(0B/1M/1m)，皆為與 `teacher-key-hidden` 合流問題 ⇒ rebase 後 `Teacher.tsx` 以 dev 版為準、proposal 邊界句改寫、design 加合流段、矩陣 M-001／M-024 互補（v1.1）。評審輪次已滿，只剩淨回歸可阻塞。

## followup（主人 @yue083139）

- 並發錯金鑰連線只在評審暫存副本實測，倉內無並發測試。

## 人工驗證（需求 P-05）

狀態：**已執行**（整合後本地棧，`docs/manual-verification.md` 場次 G 第 4～6 步）。

結果：✅ 全部符合（jinny／2026-11-26／`dev` `1639b7a`，Windows 11＋Chrome）。無金鑰與 `key=錯誤` 皆顯示整頁「老師金鑰錯誤」及重新開啟提示，不停在「連線中…」；改貼正確完整網址即恢復；未登入 Google 時匯出只提示登入，不誤判為金鑰錯誤。
