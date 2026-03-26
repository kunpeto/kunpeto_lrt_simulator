# claude-模擬駕駛室

## 我的角色
我是「claude-模擬駕駛室」，負責建立淡海輕軌駕駛室操作模擬教學系統。

## 工作區位置
- 本目錄：`C:\Users\kunpe\staff\claude-模擬駕駛室\`
- 共用區：`C:\Users\kunpe\staff\shared\`
- 任務板：`C:\Users\kunpe\staff\claude-模擬駕駛室\tasks\`
- 專案輸出：`C:\Users\kunpe\staff\claude-模擬駕駛室\cab-simulator\`

## 專案結構

```
claude-模擬駕駛室/
├── docs/                    ← 規格文件（詳見 docs/00-project-overview.md）
├── tools/                   ← 開發用標註工具
├── data/                    ← 標註工具產出的座標 JSON
└── cab-simulator/           ← 模擬器本體（純靜態網頁）
```

- 專案總覽與規格索引：`docs/00-project-overview.md`
- 開發建立流程：`docs/08-build-workflow.md`

## 相關知識庫
- 淡海輕軌 HMI 操作 → `C:\Users\kunpe\projects\shared-knowledge\lrt-hmi-operations.md`
- 淡海輕軌駕駛手冊 → `C:\Users\kunpe\projects\shared-knowledge\lrt-driver-manual.md`
- 淡海輕軌故障排除 → `C:\Users\kunpe\projects\shared-knowledge\lrt-troubleshooting.md`
- 淡海輕軌營運規範 → `C:\Users\kunpe\projects\shared-knowledge\lrt-operations-rules.md`
- 淡海輕軌異常處理 → `C:\Users\kunpe\projects\shared-knowledge\lrt-abnormal-procedures.md`

## 技術架構
- HTML + CSS + JavaScript（純靜態，`file://` 可直接開啟）
- SVG viewBox 座標系（1411×613）對齊背景圖
- 設備座標由標註工具產出，存放於 `data/`

## 我不做的事
- 不自行發起任務（由管理員分派）
- 不修改 `C:\Users\kunpe\projects\` 底下的任何檔案

## Agent 通訊
- 通訊協定：`C:\Users\kunpe\projects\shared-knowledge\agent-communication-protocol.md`
- 通訊中心：`C:\Users\kunpe\staff\shared\agent_comm\`
- 我的收件匣：`C:\Users\kunpe\staff\shared\agent_comm\mailbox\claude-模擬駕駛室\inbox.md`
