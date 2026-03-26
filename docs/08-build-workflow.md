# 開發建立流程

> 版本：v1.0

---

## 1. 整體流程

```
[取得圖片素材] → [標註座標] → [切片素材] → [撰寫規格] → [實作程式] → [整合測試]
     ①              ②            ③             ④            ⑤            ⑥
```

---

## 2. 各步驟詳細說明

### ① 取得圖片素材

| 素材 | 來源 | 用途 |
|------|------|------|
| 駕駛室 3D 模型圖 | `img/cab-3d.png`（1411×613） | 主介面背景 |
| 實拍照片 | 現場拍攝 | 設備外觀與佈局參考 |
| 工程圖 / 手冊截圖 | 駕駛手冊 PDF | HMI 畫面參考 |
| 按鈕面板清晰圖 | 高解析度拍攝 | 按鈕排列確認 |

### ② 標註座標

使用 `tools/` 目錄下的標註工具，在圖片上標記設備位置。

| 工具 | 用途 | 輸出 |
|------|------|------|
| `annotation-tool.html` | 標記 43 項設備的圓點位置 | `data/equipment-coordinates.json` |
| `screen-annotation-tool.html` | 標記螢幕區域（四邊形/圓形） | `data/screen-regions.json` |

**操作步驟：**

1. 用瀏覽器開啟工具 HTML
2. 從下拉選單選擇設備
3. 在圖片上點擊精確位置
4. 工具自動跳到下一個未標記項目
5. 完成後按「匯出 JSON」下載座標檔

> 標註工具支援 localStorage 持久化，關閉瀏覽器後再開仍保留標記。

### ③ 切片素材

針對 CMS 等 HMI 螢幕，從截圖中裁切出 UI 元件。

| 工具 | 用途 | 輸出 |
|------|------|------|
| `cms-slice-tool.html` | 框選 CMS 螢幕各元件區域 | `data/cms-slices.json` |

**操作步驟：**

1. 開啟切片工具 HTML
2. 選擇要切片的項目（如 icon-panto、menubar）
3. 拖曳矩形框選該元件
4. 側欄 Canvas 即時預覽切片效果
5. 匯出 JSON 座標供程式使用

### ④ 撰寫規格

在 `docs/` 目錄建立各設備的規格文件：

| 文件 | 內容 |
|------|------|
| `01-equipment-spec.md` | 43 項設備的分區規格 |
| `02-cms-spec.md` | CMS 畫面佈局、色彩、子選單 |
| `03-dci-spec.md` | DCI 畫面規格 |
| `04-atp-spec.md` | ATP HMI 規格 |
| `05-speedometer-spec.md` | 車速表規格 |
| `06-cctv-spec.md` | CCTV 規格 |
| `07-interaction-logic.md` | 互動邏輯、狀態機、故障情境 |

### ⑤ 實作程式

根據座標資料和規格文件，在 `cab-simulator/` 中實作：

```
cab-simulator/
├── index.html               ← 主頁結構
├── css/style.css            ← 介面樣式
├── js/
│   ├── equipment-data.js    ← 座標資料（從 JSON 轉錄）
│   └── cab-simulator.js     ← 主邏輯：渲染、互動、狀態機
└── img/                     ← 圖片資源
```

**座標資料流：**
```
標註工具 → data/*.json → 人工/腳本轉錄 → js/equipment-data.js
```

### ⑥ 整合測試

1. 用瀏覽器開啟 `cab-simulator/index.html`
2. 確認所有設備圓點對齊背景圖
3. 測試各設備的點擊互動
4. 測試 HMI 螢幕放大面板
5. 測試啟動程序連鎖邏輯
6. 測試故障模擬情境
7. 測試不同瀏覽器視窗大小的適配

---

## 3. 新增 HMI 螢幕的標準流程

每當需要實作新的 HMI 螢幕（如 DCI、ATP）：

```
1. 收集該螢幕的截圖 / 工程圖
2. 在 docs/ 建立對應的 spec 文件
3. 如需切片：用 cms-slice-tool 標註元件座標
4. 在 cab-simulator/ 中建立螢幕 HTML/JS
5. 在 cab-simulator.js 中掛接觸發邏輯
6. 整合測試
```

---

## 4. 工具維護說明

標註工具目前為專案專用（圖片路徑寫死）。如需用於其他圖片：

- 修改 HTML 中的 `<img src="...">` 路徑
- 修改 JavaScript 中的 `IMG_W`、`IMG_H` 常數
- 或使用通用版 skill：`/image-annotate`、`/image-slice`
