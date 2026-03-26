/**
 * 設備資料與座標
 * - 主圖座標系：1411 x 613（cab-3d.png）
 * - E 區座標系：600 x 700（e-panel.svg）
 */

const ZONE_COLORS = {
  A: "#e94560",
  B: "#e9a045",
  C: "#45e9a0",
  D: "#4590e9",
  E: "#a045e9",
  F: "#e9e045"
};

const ZONE_NAMES = {
  A: "上層顯示器",
  B: "右側按鈕面板",
  C: "後視鏡",
  D: "主控區",
  E: "應急操作面板",
  F: "扶手按鈕"
};

// 主圖上的設備座標（A~D, F 區）
const MAIN_EQUIPMENT = {
  A1:  { name: "CCTV 螢幕",         zone: "A", x: 360,  y: 332, type: "screen" },
  A2:  { name: "CMS 螢幕 (Selectron)", zone: "A", x: 581,  y: 300, type: "screen" },
  A5:  { name: "車速表",             zone: "A", x: 725,  y: 340, type: "gauge" },
  A6:  { name: "ATP 速度監控 HMI",   zone: "A", x: 726,  y: 246, type: "screen" },
  A7:  { name: "DCI 螢幕 (THALES)",  zone: "A", x: 874,  y: 308, type: "screen" },
  B1:  { name: "安全煞車",           zone: "B", x: 1018, y: 274, type: "pushbutton" },
  B2:  { name: "客室緊急煞車動作",   zone: "B", x: 1061, y: 281, type: "indicator" },
  B3:  { name: "總故障 ERROR",       zone: "B", x: 1097, y: 290, type: "indicator" },
  B4:  { name: "無架空線區間",       zone: "B", x: 1018, y: 313, type: "indicator" },
  B5:  { name: "集電方式選擇",       zone: "B", x: 1055, y: 322, type: "rotary" },
  B6:  { name: "架空線區間",         zone: "B", x: 1090, y: 330, type: "indicator" },
  B7:  { name: "霧燈",               zone: "B", x: 1011, y: 352, type: "rotary" },
  B8:  { name: "頭燈",               zone: "B", x: 1047, y: 363, type: "rotary" },
  B9:  { name: "警笛",               zone: "B", x: 1083, y: 372, type: "pushbutton" },
  B10: { name: "方向燈/警示燈",      zone: "B", x: 1004, y: 392, type: "rotary" },
  B11: { name: "雨刷",               zone: "B", x: 1039, y: 402, type: "rotary" },
  B12: { name: "通話",               zone: "B", x: 1077, y: 410, type: "pushbutton" },
  C1:  { name: "後視鏡 CCTV",       zone: "C", x: 194,  y: 372, type: "screen" },
  D1:  { name: "主控鑰匙開關",       zone: "D", x: 393,  y: 484, type: "key" },
  D2:  { name: "停機連鎖按鈕",       zone: "D", x: 436,  y: 462, type: "pushbutton" },
  D3:  { name: "行車模式選擇旋鈕",   zone: "D", x: 392,  y: 517, type: "rotary" },
  D4:  { name: "主控制器把手",       zone: "D", x: 490,  y: 472, type: "lever" },
  D5:  { name: "DSD 駕駛失能保護",   zone: "D", x: 526,  y: 451, type: "pushbutton" },
  F1:  { name: "左側開門",           zone: "F", x: 959,  y: 438, type: "pushbutton" },
  F2:  { name: "車門選擇",           zone: "F", x: 991,  y: 444, type: "rotary" },
  F3:  { name: "右側開門",           zone: "F", x: 1019, y: 451, type: "pushbutton" },
  F4:  { name: "電磁軌道煞車 MTB",   zone: "F", x: 1048, y: 459, type: "pushbutton" },
  F5:  { name: "撒砂 Sand",         zone: "F", x: 1080, y: 466, type: "pushbutton" }
};

// E 區面板的設備（獨立座標系 600x700）
const E_PANEL_EQUIPMENT = {
  E1:  { name: "集電弓降弓 HV OFF",     zone: "E", x: 100, y: 120, type: "pushbutton", r: 28 },
  E2:  { name: "客室110V插座開關",       zone: "E", x: 200, y: 120, type: "pushbutton", r: 22 },
  E3:  { name: "蓄電池24V",             zone: "E", x: 310, y: 120, type: "indicator",   r: 22 },
  E4:  { name: "駐車煞車 P",            zone: "E", x: 420, y: 120, type: "indicator",   r: 22 },
  E5:  { name: "零速度 Zero Speed",     zone: "E", x: 110, y: 242, type: "cover-btn",   r: 24 },
  E6:  { name: "列車自動保護 ATP",       zone: "E", x: 198, y: 242, type: "cover-btn",   r: 24 },
  E7:  { name: "空調關閉 HVAC OFF",     zone: "E", x: 286, y: 242, type: "cover-btn",   r: 24 },
  E8:  { name: "降級模式 EDM",           zone: "E", x: 110, y: 352, type: "cover-btn",   r: 24 },
  E9:  { name: "上下車門 Doors",         zone: "E", x: 198, y: 352, type: "cover-btn",   r: 24 },
  E10: { name: "煞車解除 Brake Release", zone: "E", x: 110, y: 462, type: "cover-btn",   r: 24 },
  E11: { name: "拖救模式 Towing",       zone: "E", x: 198, y: 462, type: "cover-btn",   r: 24 },
  E12: { name: "駕駛室照明",             zone: "E", x: 420, y: 242, type: "rotary",      r: 20 },
  E13: { name: "客室照明",               zone: "E", x: 420, y: 348, type: "rotary",      r: 20 },
  E14: { name: "電動遮陽簾",             zone: "E", x: 310, y: 462, type: "rotary",      r: 22 },
  E15: { name: "第一道車門開/關",         zone: "E", x: 420, y: 462, type: "rotary",      r: 28 }
};

// E 區在主圖上的觸發區域（點擊此範圍開啟 E 面板）
const E_ZONE_HOTSPOT = {
  x: 180, y: 480, width: 120, height: 80,
  label: "E 區：應急操作面板（點擊展開）"
};
