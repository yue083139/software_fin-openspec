# student-qr — verification（v1.0）

## 變異實錄

```
變異1 拿掉 Cloudflare 標頭檢查（is_local 只看 Host）：test_api_host.py → 1 failed, 10 passed
變異2 is_local 一律回 True：test_api_host.py → 5 failed, 6 passed
```

## 真棧

見 `probes/results/2026-11-26-student-qr-real-stack.txt`。

## 門禁實錄

`make gate-pr`（2026-11-26，feat/student-qr）：

```
ruff：All checks passed!（server、ops probes）
server pytest：294 passed, 1 warning
ops pytest：48 passed
web vitest：Test Files 8 passed (8)；Tests 41 passed (41)
gate-zh-hant: 0 處簡體字
gate-secrets: 0 findings
openspec validate：Totals: 12 passed, 0 failed (12 items)
gate-agents: 0 處漂移
```

`gate-parity` 未跑：SpecKit 組同批移植待合流（本卡改了共用檔 `contracts/api.md`、`docs/manual-verification.md`）。

## 人工驗證（需求 P-05）

狀態：**待執行**（負責人，`docs/manual-verification.md` 場次 F）。
