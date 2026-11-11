# 操作紀錄（ops-log）

AI 代理在本 repo 執行的對外或難以回復的操作（建立 repo、推送、改遠端設定、建立本機以外的資源）逐筆記錄；每個階段前打 `rollback/NN-<階段>` 標籤。

| 時間 | 分支 | 操作 | 影響 | 回復方式 |
|---|---|---|---|---|
| 2026-11-11 | main | 創世提交（治理文件、工具初始化、門禁、CI），打標籤 `rollback/00-genesis` | 僅本 repo | 刪除 GitHub repo 即全部回復（`gh repo delete yue083139/software_fin-openspec`） |
| 2026-11-11 | main、dev | `gh repo create yue083139/software_fin-openspec --private`，推送 `main`、由 `main` 開出並推送 `dev`（創世唯一例外，見先例正文「創世提交」） | GitHub 新增私人 repo | `gh repo delete yue083139/software_fin-openspec --yes` |
| 2026-11-11 | feat/app-skeleton…feat/guided-notes-export | 負責人以 `!` 推送五個功能分支與標籤 `rollback/01-pre-phase1`（指向第一期前的 dev e28fc3f）；開 PR #2–#6 | GitHub 新增分支與 PR | 刪除分支；`git reset` 前先以標籤回到 e28fc3f |
| 2026-11-11 | dev | 依負責人「合」合併：#2 入 dev；`--delete-branch` 使 #3、#5 被關閉、#4、#6 合入中間分支（事故，見先例正文「疊層 PR 的合併順序」）；開替代 PR #7（feat/results-view → dev）合入 | dev 含第一期五卡 | 以 `rollback/01-pre-phase1` 開回復分支經 PR 還原 |
