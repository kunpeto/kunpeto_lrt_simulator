# 使用者回饋功能規格

> 版本：v1.1
> 適用：純靜態網頁（GitHub Pages 部署 + 本機開發）

---

## 1. 功能目的

讓模擬器的使用者（司機員、講師）可以在操作過程中直接回報問題或提出建議。回饋資料透過適當的管道送達開發端，由 Claude Code 讀取並處理。

---

## 2. 部署環境與資料流

本系統支援兩種部署環境，回饋的傳遞方式不同：

### 2.1 本機開發環境（`file://`）

```
使用者操作模擬器
       │
       ▼
  [回饋按鈕] → 選擇類型 + 填寫內容
       │
       ▼
  localStorage 暫存
       │
       ▼
  [匯出按鈕] → 下載 feedback.json → 存入 data/feedback.json
       │
       ▼
  Claude Code 讀取 → 分析 → 處理 → 標記狀態
```

### 2.2 GitHub Pages 線上環境

線上環境使用者無法直接存檔到 repo，需透過外部服務傳遞回饋。提供兩個候選方案（擇一實作，待評估後決定）：

#### 方案 A：Google Sheets（透過 Apps Script）

```
使用者按「送出」
       │
       ▼
  fetch → Google Apps Script Web App（免費）
       │
       ▼
  寫入 Google Sheets（指定試算表）
       │
       ▼
  Claude Code 透過 Google Sheets API 讀取 → 處理回饋
```

**優點：**
- 回饋即時送達，使用者無需額外操作
- Claude Code 已有 Google API 憑證，可直接讀取
- 可在試算表中直接瀏覽、篩選、標記狀態
- 不需使用者有任何帳號

**實作要點：**
- 建立 Google Apps Script Web App，接收 POST 請求
- Apps Script 將資料寫入指定 Google Sheets
- 前端用 `fetch()` 送出回饋（CORS 由 Apps Script 處理）
- Google Sheets 欄位對應回饋資料結構（見第 4 節）

**Google Sheets 欄位規劃：**

| 欄 | 標題 | 對應欄位 |
|----|------|---------|
| A | ID | `id` |
| B | 類型 | `type`（bug / suggestion） |
| C | 內容 | `content` |
| D | 頁面 | `context.page` |
| E | 狀態快照 | `context.state`（JSON 字串） |
| F | 狀態 | `status`（pending / confirmed / done / wontfix） |
| G | 處理備註 | `note` |
| H | 建立時間 | `createdAt` |
| I | 更新時間 | `updatedAt` |

#### 方案 C：Google Forms 嵌入

```
使用者按「回饋」按鈕
       │
       ▼
  開啟預填的 Google 表單（新分頁或內嵌 iframe）
  - 自動帶入：頁面路徑、車輛狀態
  - 使用者填入：類型、描述
       │
       ▼
  Google Forms → 自動寫入 Google Sheets
       │
       ▼
  Claude Code 透過 Google Sheets API 讀取 → 處理回饋
```

**優點：**
- 實作最簡單，幾乎不需要寫後端程式碼
- Google Forms 自帶表單驗證與垃圾訊息防護
- 不需使用者有任何帳號

**缺點：**
- 體驗不如方案 A 流暢（需跳轉或開新視窗）
- 自動帶入上下文資訊需透過 URL 預填參數，欄位有限
- 介面風格無法完全融入模擬器深色主題

**實作要點：**
- 建立 Google Form，設定回應寫入 Google Sheets
- 使用 Google Forms 預填 URL 帶入自動欄位
- 預填 URL 格式：`https://docs.google.com/forms/d/e/{FORM_ID}/viewform?usp=pp_url&entry.XXX={value}`
- 回饋按鈕以 `window.open()` 開啟預填好的表單 URL

### 2.3 方案比較

| 項目 | 方案 A（Apps Script） | 方案 C（Google Forms） |
|------|---------------------|---------------------|
| 使用者體驗 | 無縫，在模擬器內完成 | 需跳轉，風格不一致 |
| 實作複雜度 | 中（需寫 Apps Script） | 低（只需建表單） |
| 上下文自動帶入 | 完整（可傳任意 JSON） | 有限（URL 參數長度限制） |
| 維護成本 | 低 | 最低 |
| 離線支援 | 可搭配 localStorage 排隊 | 不支援離線 |

> **決策：待評估後擇一實作。** 兩個方案的後端（Google Sheets）相同，差異在前端送出方式。

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
4. 按「送出」：
   - **本機環境**：存入 localStorage，需要時按「匯出 JSON」下載並存到 `data/feedback.json`
   - **線上環境（方案 A）**：直接送至 Google Sheets，同時存入 localStorage 作為本地備份
   - **線上環境（方案 C）**：開啟預填的 Google Form，使用者在表單中送出

### 6.2 開發端（Claude Code）

**本機環境：**
1. 讀取 `data/feedback.json`
2. 篩選 `status === "pending"` 的項目
3. 修復或回應後，更新 JSON 中的 `status` 和 `note`
4. 將更新後的 JSON 寫回 `data/feedback.json`

**線上環境：**
1. 透過 Google Sheets API 讀取回饋試算表
2. 篩選狀態為 `pending` 的列
3. 修復或回應後，透過 API 更新該列的 `status` 和 `note` 欄位

> 兩種環境的回饋最終都可在 Google Sheets 中統一管理。

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
