/**
 * 駕駛室模擬器 — 主程式
 */
(function () {
  "use strict";

  // ===== DOM =====
  const cabView = document.getElementById("cabView");
  const cabContainer = document.getElementById("cabContainer");
  const cabImg = document.getElementById("cabImg");
  const overlaySvg = document.getElementById("overlaySvg");
  const tooltip = document.getElementById("tooltip");
  const statusText = document.getElementById("statusText");

  // E 區面板
  const ePanelOverlay = document.getElementById("ePanelOverlay");
  const ePanelClose = document.getElementById("ePanelClose");
  const ePanelOverlaySvg = document.getElementById("ePanelOverlaySvg");

  // HMI 面板
  const hmiOverlay = document.getElementById("hmiOverlay");
  const hmiClose = document.getElementById("hmiClose");
  const hmiTitle = document.getElementById("hmiTitle");
  const hmiBody = document.getElementById("hmiBody");

  // ===== 常數 =====
  const IMG_W = 1411;
  const IMG_H = 613;
  const SVG_NS = "http://www.w3.org/2000/svg";

  // ===== 車輛狀態 =====
  const state = {
    keyOn: false,
    drivingMode: "OFF",      // OFF, MainLine, Workshop, Washing, Reversing
    masterController: "STOP", // STOP, EB, SB, N, D
    interlockPressed: false,
    speed: 0,
    safetyBrakeActive: false
  };

  // ========================================
  //  初始化
  // ========================================
  function init() {
    renderInfoPanel();
    renderMainHotspots();
    renderEZoneTrigger();
    initEPanel();
    initDrag();
    initPanelEvents();
    initInfoTabs();
    fitToScreen();
    window.addEventListener("resize", fitToScreen);
  }

  // ========================================
  //  上方資訊面板（覆蓋在圖片頂部區域）
  // ========================================
  function renderInfoPanel() {
    const infoPanel = document.getElementById("infoPanel");
    if (!infoPanel) return;

    // 預設顯示列車狀態
    showInfoTab("status");
  }

  function initInfoTabs() {
    document.querySelectorAll(".info-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".info-tab").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        showInfoTab(tab.dataset.tab);
      });
    });

    // 收合/展開按鈕
    const toggleBtn = document.getElementById("infoPanelToggle");
    const infoPanel = document.getElementById("infoPanel");
    if (toggleBtn && infoPanel) {
      toggleBtn.addEventListener("click", () => {
        const collapsed = infoPanel.classList.toggle("collapsed");
        toggleBtn.classList.toggle("collapsed", collapsed);
        toggleBtn.textContent = collapsed ? "▼" : "▲";
        toggleBtn.title = collapsed ? "展開資訊面板" : "收合資訊面板";
      });
    }
  }

  function showInfoTab(tabName) {
    const content = document.getElementById("infoContent");
    if (!content) return;

    switch (tabName) {
      case "status":
        content.innerHTML = `
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">鑰匙</span>
              <span class="info-value" id="infoKeyState">OFF</span>
            </div>
            <div class="info-item">
              <span class="info-label">行車模式</span>
              <span class="info-value" id="infoDriveMode">關閉</span>
            </div>
            <div class="info-item">
              <span class="info-label">主控制器</span>
              <span class="info-value" id="infoMC">STOP</span>
            </div>
            <div class="info-item">
              <span class="info-label">車速</span>
              <span class="info-value" id="infoSpeed">0 km/h</span>
            </div>
            <div class="info-item">
              <span class="info-label">集電方式</span>
              <span class="info-value">CC（架空線）</span>
            </div>
            <div class="info-item">
              <span class="info-label">安全煞車</span>
              <span class="info-value" id="infoSB">正常</span>
            </div>
          </div>`;
        break;
      case "troubleshoot":
        content.innerHTML = `
          <div class="info-faq">
            <details>
              <summary>總故障燈亮紅燈怎麼辦？</summary>
              <p>1. 確認 CMS 診斷頁面的故障碼<br>
                 2. 若為牽引故障，嘗試重開機（KEY OFF → 等 30 秒 → KEY ON）<br>
                 3. 若仍無法排除，通報行控中心</p>
            </details>
            <details>
              <summary>車速表自檢不過怎麼辦？</summary>
              <p>1. 確認白針是否完成 0→90→0 動作<br>
                 2. 若指針卡住，KEY OFF 重新啟動<br>
                 3. 連續兩次失敗需通報檢修</p>
            </details>
            <details>
              <summary>車門無法開啟？</summary>
              <p>1. 確認車速為 0 且已停妥<br>
                 2. 確認已按下 F1/F3 預選方向<br>
                 3. 旋轉 F2 車門選擇至對應方向<br>
                 4. 若仍無法開啟，使用 E9 上下車門旁路</p>
            </details>
            <details>
              <summary>ATP 介入煞車如何復歸？</summary>
              <p>1. 等待列車完全停止<br>
                 2. 按下 ATP HMI 上的 Ruck（重置）按鈕<br>
                 3. 確認速限顯示恢復正常</p>
            </details>
          </div>`;
        break;
      case "procedure":
        content.innerHTML = `
          <div class="info-procedure">
            <h4>發車程序</h4>
            <ol>
              <li>KEY ON → 等待車速表自檢完成</li>
              <li>行車模式旋鈕 → 主線模式</li>
              <li>按住停機連鎖 → 主控制器推離 STOP</li>
              <li>確認 CMS 四個 T 亮起</li>
              <li>安全煞車測試（按下 → Se 顯示 → 復歸）</li>
              <li>確認 ATP 正常，即可出發</li>
            </ol>
            <h4>收車程序</h4>
            <ol>
              <li>車輛停妥，車速歸零</li>
              <li>按住停機連鎖 → 主控制器拉回 STOP</li>
              <li>行車模式旋鈕 → 關閉模式</li>
              <li>KEY OFF</li>
            </ol>
          </div>`;
        break;
      case "notes":
        content.innerHTML = `
          <div class="info-notes">
            <p><strong>速限提醒：</strong></p>
            <ul>
              <li>正線最高速限：70 km/h</li>
              <li>機廠區域：25 km/h</li>
              <li>洗車模式：5 km/h</li>
              <li>降級模式（EDM）：10 km/h</li>
              <li>倒車模式：10 km/h</li>
            </ul>
            <p style="margin-top:8px;"><strong>DSD 注意：</strong>行駛中需持續按住主控制器上的 DSD 按鈕，放開超過 3 秒將觸發保護煞停。</p>
          </div>`;
        break;
    }
  }

  // ========================================
  //  主圖：設備熱區渲染
  // ========================================
  function renderMainHotspots() {
    overlaySvg.innerHTML = "";

    Object.entries(MAIN_EQUIPMENT).forEach(([id, eq]) => {
      const color = ZONE_COLORS[eq.zone];
      const g = createSvgEl("g", { "data-id": id });

      // 脈衝外圈
      const pulse = createSvgEl("circle", {
        cx: eq.x, cy: eq.y, r: 16,
        fill: color, opacity: 0.3,
        class: "hotspot-pulse"
      });
      g.appendChild(pulse);

      // 主圓點
      const dot = createSvgEl("circle", {
        cx: eq.x, cy: eq.y, r: 10,
        fill: color, opacity: 0.8,
        class: "hotspot",
        "data-id": id
      });
      g.appendChild(dot);

      // 內圈白點
      const inner = createSvgEl("circle", {
        cx: eq.x, cy: eq.y, r: 3,
        fill: "white", opacity: 0.9,
        "pointer-events": "none"
      });
      g.appendChild(inner);

      // 編號標籤
      const label = createSvgEl("text", {
        x: eq.x, y: eq.y - 15,
        class: "hotspot-label"
      });
      label.textContent = id;
      g.appendChild(label);

      overlaySvg.appendChild(g);

      // 事件
      dot.addEventListener("mouseenter", (e) => showTooltip(e, id, eq));
      dot.addEventListener("mousemove", moveTooltip);
      dot.addEventListener("mouseleave", hideTooltip);
      dot.addEventListener("click", () => onEquipmentClick(id, eq));
    });
  }

  // ========================================
  //  主圖：E 區觸發熱區
  // ========================================
  function renderEZoneTrigger() {
    const ez = E_ZONE_HOTSPOT;
    const g = createSvgEl("g", { "data-id": "E-zone" });

    // 半透明區域
    const rect = createSvgEl("rect", {
      x: ez.x, y: ez.y, width: ez.width, height: ez.height,
      rx: 8,
      fill: ZONE_COLORS.E, opacity: 0.25,
      stroke: ZONE_COLORS.E, "stroke-width": 2, "stroke-dasharray": "6,3",
      class: "hotspot",
      "data-id": "E-zone"
    });
    g.appendChild(rect);

    // 文字
    const text = createSvgEl("text", {
      x: ez.x + ez.width / 2,
      y: ez.y + ez.height / 2 + 4,
      "text-anchor": "middle",
      "font-size": 11,
      fill: "white",
      "pointer-events": "none",
      "font-family": "Microsoft JhengHei, sans-serif"
    });
    text.textContent = "E 區 應急面板";
    g.appendChild(text);

    const subtext = createSvgEl("text", {
      x: ez.x + ez.width / 2,
      y: ez.y + ez.height / 2 + 18,
      "text-anchor": "middle",
      "font-size": 9,
      fill: "#c0c0c0",
      "pointer-events": "none",
      "font-family": "Microsoft JhengHei, sans-serif"
    });
    subtext.textContent = "（點擊展開）";
    g.appendChild(subtext);

    overlaySvg.appendChild(g);

    rect.addEventListener("mouseenter", (e) => {
      showTooltip(e, "E區", {
        name: "應急操作與控制面板",
        zone: "E",
        type: "panel"
      });
    });
    rect.addEventListener("mousemove", moveTooltip);
    rect.addEventListener("mouseleave", hideTooltip);
    rect.addEventListener("click", openEPanel);
  }

  // ========================================
  //  E 區面板：熱區渲染
  // ========================================
  function initEPanel() {
    Object.entries(E_PANEL_EQUIPMENT).forEach(([id, eq]) => {
      const r = eq.r || 20;
      const circle = createSvgEl("circle", {
        cx: eq.x, cy: eq.y, r: r,
        class: "e-hotspot",
        "data-id": id
      });
      ePanelOverlaySvg.appendChild(circle);

      circle.addEventListener("mouseenter", (e) => showTooltip(e, id, eq));
      circle.addEventListener("mousemove", moveTooltip);
      circle.addEventListener("mouseleave", hideTooltip);
      circle.addEventListener("click", () => onEquipmentClick(id, eq));
    });
  }

  function openEPanel() {
    ePanelOverlay.classList.remove("hidden");
  }
  function closeEPanel() {
    ePanelOverlay.classList.add("hidden");
  }

  // ========================================
  //  設備點擊處理
  // ========================================
  function onEquipmentClick(id, eq) {
    // 螢幕類設備 → 開啟 HMI 放大面板
    if (eq.type === "screen") {
      openHMI(id, eq);
      return;
    }

    // 其他設備 → 操作回饋（後續擴充）
    handleControl(id, eq);
  }

  function handleControl(id, eq) {
    switch (id) {
      case "D1":
        state.keyOn = !state.keyOn;
        setStatus(state.keyOn ? "鑰匙已轉至 ON — 系統啟動中..." : "鑰匙已轉至 OFF — 系統關閉");
        break;
      case "D2":
        state.interlockPressed = !state.interlockPressed;
        setStatus(state.interlockPressed ? "停機連鎖按鈕：按住中" : "停機連鎖按鈕：已釋放");
        break;
      case "B1":
        state.safetyBrakeActive = !state.safetyBrakeActive;
        setStatus(state.safetyBrakeActive ? "安全煞車：已啟動" : "安全煞車：已復歸");
        break;
      case "B9":
        setStatus("警笛：鳴響中");
        setTimeout(() => setStatus("系統就緒"), 1500);
        break;
      default:
        setStatus(`${eq.name}：已操作`);
        setTimeout(() => setStatus("系統就緒"), 2000);
    }
  }

  // ========================================
  //  HMI 螢幕放大（預留骨架）
  // ========================================
  function openHMI(id, eq) {
    hmiTitle.textContent = `${id} — ${eq.name}`;
    hmiBody.innerHTML = `<div style="text-align:center;color:#506070;">
      <p style="font-size:48px;margin-bottom:16px;">🖥</p>
      <p>${eq.name}</p>
      <p style="font-size:12px;margin-top:8px;">螢幕模擬功能開發中</p>
    </div>`;
    hmiOverlay.classList.remove("hidden");
  }
  function closeHMI() {
    hmiOverlay.classList.add("hidden");
  }

  // ========================================
  //  面板事件
  // ========================================
  function initPanelEvents() {
    ePanelClose.addEventListener("click", closeEPanel);
    ePanelOverlay.addEventListener("click", (e) => {
      if (e.target === ePanelOverlay) closeEPanel();
    });

    hmiClose.addEventListener("click", closeHMI);
    hmiOverlay.addEventListener("click", (e) => {
      if (e.target === hmiOverlay) closeHMI();
    });

    // ESC 關閉
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeEPanel();
        closeHMI();
      }
    });
  }

  // ========================================
  //  拖曳轉頭
  // ========================================
  function initDrag() {
    let isDragging = false;
    let startX = 0;
    let scrollStart = 0;

    cabView.addEventListener("mousedown", (e) => {
      // 不攔截設備熱區的點擊
      if (e.target.classList.contains("hotspot")) return;
      isDragging = true;
      startX = e.clientX;
      scrollStart = cabView.scrollLeft;
      cabView.classList.add("dragging");
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      cabView.scrollLeft = scrollStart - dx;
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
      cabView.classList.remove("dragging");
    });
  }

  // ========================================
  //  自動適配畫面
  // ========================================
  function fitToScreen() {
    const viewH = window.innerHeight - 40; // 扣掉 topBar
    const viewW = window.innerWidth;

    // 讓圖片高度填滿可視區域
    const scale = viewH / IMG_H;
    const displayW = IMG_W * scale;

    cabContainer.style.width = displayW + "px";
    cabContainer.style.height = viewH + "px";

    // 如果圖片寬度超過螢幕，自動捲到中間
    if (displayW > viewW) {
      cabView.scrollLeft = (displayW - viewW) / 2;
    }
  }

  // ========================================
  //  Tooltip
  // ========================================
  function showTooltip(e, id, eq) {
    const typeLabels = {
      screen: "點擊放大螢幕",
      gauge: "動態指針顯示",
      pushbutton: "按壓操作",
      rotary: "旋轉操作",
      indicator: "狀態指示燈",
      key: "鑰匙旋轉",
      lever: "推拉操作",
      "cover-btn": "掀蓋後按壓",
      panel: "點擊展開面板"
    };

    tooltip.innerHTML = `
      <span class="tip-id">${id}</span>
      <span class="tip-name">${eq.name}</span>
      <span class="tip-hint">${typeLabels[eq.type] || "互動操作"}</span>
    `;
    tooltip.style.display = "block";
    moveTooltip(e);
  }

  function moveTooltip(e) {
    tooltip.style.left = (e.clientX + 14) + "px";
    tooltip.style.top = (e.clientY - 40) + "px";
  }

  function hideTooltip() {
    tooltip.style.display = "none";
  }

  // ========================================
  //  狀態列
  // ========================================
  function setStatus(msg) {
    statusText.textContent = msg;
  }

  // ========================================
  //  工具
  // ========================================
  function createSvgEl(tag, attrs) {
    const el = document.createElementNS(SVG_NS, tag);
    if (attrs) {
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    }
    return el;
  }

  // ========================================
  //  啟動
  // ========================================
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
