# 使用者回饋功能規格

> 版本：v1.0
> 適用：純靜態網頁（無伺服器）

---

## 1. 功能目的

讓模擬器的使用者（司機員、講師）可以在操作過程中直接回報問題或提出建議。回饋資料匯出為 JSON 檔案，開發端透過 Claude Code 讀取並處理。

---

## 2. 資料流

```
使用者操作模擬器
       │
       ▼
  [回饋按鈕] → 選擇類型 + 填寫內容
       │
       ▼
  localStorage 暫存（即時儲存，關閉不遺失）
       │
       ▼
  [匯出按鈕] → 下載 feedback.json
       │
       ▼
  使用者將檔案存入 data/feedback.json
       │
       ▼
  Claude Code 讀取 → 分析 → 處理 → 標記狀態
```

---

## 3. UI 規格

### 3.1 回饋按鈕

| 項目 | 規格 |
|------|------|
| 位置 | 畫面右下角，固定定位 |
| 外觀 | 小型圓形按鈕，半透明深色背景 |
| 圖示 | 對話氣泡或筆記圖示 |
| 未讀計數 | 若有 pending 項目，顯示數字徽章 |
| 不遮擋原則 | 不影響駕駛室操作區域 |

### 3.2 回饋面板

點擊回饋按鈕後展開的面板：

```
┌─────────────────────────┐
│  使用者回饋         [×]  │
├─────────────────────────┤
│  類型：○ 除錯  ○ 建議    │
│                         │
│  ┌─────────────────┐    │
│  │ 請描述問題或建議  │    │
│  │                 │    │
│  └─────────────────┘    │
│                         │
│  [送出]                  │
├─────────────────────────┤
│  歷史回饋（3 筆）        │
│  ● bug  車速表指針偏移   │  ← pending = 實心圓
│  ○ done CMS 文字太小    │  ← done = 空心圓
│  ● sug  希望加入夜間模式  │
├─────────────────────────┤
│  [匯出 JSON] [清除已完成] │
└─────────────────────────┘
```

### 3.3 視覺風格

| 元素 | 規格 |
|------|------|
| 面板背景 | `rgba(10, 12, 24, 0.95)`，與模擬器深色主題一致 |
| 邊框 | `1px solid #1a3a5c` |
| 圓角 | `8px` |
| 面板寬度 | `320px` |
| 面板最大高度 | `70vh`，超出可捲動 |
| 類型標籤色 | bug = `#e94560`（紅），suggestion = `#4590e9`（藍） |
| pending 標記 | 實心圓點 |
| done 標記 | 空心圓點，文字半透明 |

---

## 4. 回饋資料結構

### 4.1 單筆回饋

```json
{
  "id": "fb_1711400000000",
  "type": "bug",
  "content": "車速表自檢動畫偶爾卡在 50 不回 0",
  "context": {
    "page": "index.html",
    "state": {
      "keyOn": true,
      "drivingMode": "MainLine"
    }
  },
  "status": "pending",
  "note": "",
  "createdAt": "2026-03-26T10:30:00.000Z",
  "updatedAt": "2026-03-26T10:30:00.000Z"
}
```

### 4.2 欄位定義

| 欄位 | 類型 | 說明 |
|------|------|------|
| `id` | string | 唯一識別碼，格式 `fb_` + 時間戳毫秒 |
| `type` | enum | `bug`（除錯）、`suggestion`（建議） |
| `content` | string | 使用者填寫的回饋文字 |
| `context.page` | string | 提交時的頁面路徑 |
| `context.state` | object | 提交時的車輛狀態快照（keyOn、drivingMode 等） |
| `status` | enum | `pending`（待處理）、`confirmed`（確認問題）、`done`（已處理）、`wontfix`（不處理） |
| `note` | string | 開發端處理備註（Claude Code 寫入） |
| `createdAt` | string | 建立時間（ISO 8601） |
| `updatedAt` | string | 最後更新時間 |

### 4.3 完整 JSON 格式

`data/feedback.json`：

```json
{
  "version": 1,
  "exportedAt": "2026-03-26T11:00:00.000Z",
  "items": [
    { "id": "fb_1711400000000", "type": "bug", "content": "...", ... },
    { "id": "fb_1711400060000", "type": "suggestion", "content": "...", ... }
  ]
}
```

---

## 5. 狀態流程

```
pending ──→ confirmed ──→ done
   │
   └──→ wontfix
```

| 狀態 | 說明 | 由誰設定 |
|------|------|---------|
| `pending` | 新提交，尚未處理 | 系統自動 |
| `confirmed` | 確認為有效問題 | 開發端（Claude Code） |
| `done` | 已修復或已處理 | 開發端（Claude Code） |
| `wontfix` | 不屬於問題或暫不處理 | 開發端（Claude Code） |

---

## 6. 操作流程

### 6.1 使用者端

1. 操作模擬器時發現問題或有建議
2. 點擊右下角回饋按鈕
3. 選擇類型（除錯/建議），填寫文字
4. 按「送出」→ 自動存入 localStorage
5. 需要回報給開發端時，按「匯出 JSON」
6. 將下載的檔案存到專案 `data/feedback.json`

### 6.2 開發端（Claude Code）

1. 讀取 `data/feedback.json`
2. 篩選 `status === "pending"` 的項目
3. 分析回饋內容，判斷問題類型
4. 修復或回應後，更新 JSON 中的 `status` 和 `note`
5. 將更新後的 JSON 寫回 `data/feedback.json`

> Claude Code 更新後的 JSON 可再匯入回模擬器的 localStorage，讓使用者看到處理結果。

---

## 7. localStorage 管理

| 項目 | 規格 |
|------|------|
| 儲存 key | `cab-sim-feedback` |
| 格式 | 與 `data/feedback.json` 的 `items` 陣列相同 |
| 容量上限 | 建議最多保留 100 筆，超出時提示匯出並清除已完成項目 |
| 匯入功能 | 支援拖放 JSON 檔案或按鈕選擇檔案匯入 |

---

## 8. 實作要點

- 回饋面板使用 `position: fixed`，`z-index` 高於模擬器 overlay 但低於 HMI 彈出面板
- 送出時自動擷取 `state` 物件快照（從模擬器主程式取得）
- 匯出 JSON 使用 `Blob` + `URL.createObjectURL` + `<a>` 下載
- 匯入 JSON 使用 `FileReader` 讀取後合併（以 `id` 去重）
- 面板展開/收合使用 CSS transition 動畫
