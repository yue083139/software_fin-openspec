# 專案脈絡 — software_fin（OpenSpec 組）

Vibe Coding 課堂搶答系統：老師匯入 Guided Notes（填空式學習單）→ 開啟搶答 → 各組線上作答、伺服器判定最快組 → 結束後揭曉結果 → 把成功答案寫回原 Guided Notes 的填空格。元件：server（Python 3.12 / FastAPI / WebSocket）、web（React / Vite / TypeScript）。只在本機模擬。

## 權威文件

- 需求基線：`docs/requirements.md`（兩組共用）；兩組一致協議與共用選型：`docs/parity.md`
- 行為規格：`openspec/specs/`（按能力分目錄）；介面：`contracts/`（凍結件）
- 架構決策：`docs/decisions/`；工程規範：根 `CLAUDE.md`；先例正文 `docs/discipline-precedents.md`

## 卡的形態約定

- 卡名與 `docs/parity.md` §4 功能清單一致（如 `guided-notes-import`），SpecKit 組同名功能為 `specs/NNN-<卡名>/`。
- **S/B 檔**四件套完整：proposal（首屏決策摘要＋需求編號＋矩陣落點＋parity＋本卡不做＋驗收）、design（每條決策帶證偽欄）、specs 增量、tasks（最後一節為驗證）。評分檢驗這四件，B 檔也不省 design。
- 卡完成時在卡內追加 `verification.md`：`make gate-pr` 原樣輸出、評審結論行、**人工驗證紀錄**（誰、哪天、步驟、看到什麼）。
- 歸檔用 `openspec archive <卡名> --yes` 並入主規格；確實不改行為規格的卡在 `.openspec.yaml` 置 `skip_specs: true` 並寫一句理由。
- 一個 change 對應一張卡、一個 PR；檔位寫進 PR 首屏第一行。
