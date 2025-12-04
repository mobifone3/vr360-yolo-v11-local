/**
 * Toolbar Buttons Module
 * Creates individual toolbar buttons
 *
 * Dependencies:
 * - core/drawing/free-draw.js (startFreeDrawing)
 * - core/scene-capture.js (captureSceneImage)
 * - core/detection-handlers.js (handleYOLODetection, handleTensorFlowDetection, etc.)
 * - core/ui-display.js (clearAllBoundingBoxes)
 * - api-vr360/polygon-api.js (createAllPolygons)
 * - core/bbox-list/index.js (toggleModernBoundingBoxPanel)
 */

/**
 * Base button style configuration
 */
const BUTTON_BASE_STYLE = {
  width: "48px",
  height: "48px",
  borderRadius: "12px",
  border: "none",
  color: "white",
  fontSize: "20px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

/**
 * Add hover effects to a button
 * @param {HTMLElement} btn - Button element
 * @param {string} bgColor - Normal background color
 * @param {string} hoverColor - Hover background color
 * @param {string} shadowColor - Box shadow color (rgba format)
 */
function addButtonHoverEffects(btn, bgColor, hoverColor, shadowColor) {
  btn.addEventListener("mouseenter", () => {
    btn.style.transform = "translateY(-2px)";
    btn.style.boxShadow = `0 4px 12px ${shadowColor}`;
    btn.style.backgroundColor = hoverColor;
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "translateY(0)";
    btn.style.boxShadow = `0 2px 8px ${shadowColor.replace("0.4", "0.3")}`;
    btn.style.backgroundColor = bgColor;
  });
}

/**
 * Create the Detect Object button
 * @returns {HTMLElement} - Detect button element
 */
function createDetectButton() {
  const detectBtn = document.createElement("button");
  detectBtn.innerHTML = "🔍";
  detectBtn.title = "Detect Objects";
  Object.assign(detectBtn.style, {
    ...BUTTON_BASE_STYLE,
    backgroundColor: "#4CAF50",
    boxShadow: "0 2px 8px rgba(76,175,80,0.3)",
  });

  addButtonHoverEffects(detectBtn, "#4CAF50", "#45a049", "rgba(76,175,80,0.4)");

  detectBtn.addEventListener("click", () => {
    // Trigger detection with stored settings
    chrome.storage.sync.get(["detectionMethod", "yoloApiUrl", "googleCloudApiKey", "roboflowApiKey"], (result) => {
      const method = result.detectionMethod || "yolo";
      captureSceneImage().then((imageData) => {
        let apiKey;

        // Get the correct API key/URL based on method
        switch (method) {
          case "yolo":
            apiKey = result.yoloApiUrl;
            break;
          case "roboflow":
            apiKey = result.roboflowApiKey;
            break;
          case "google":
            apiKey = result.googleCloudApiKey;
            break;
        }

        switch (method) {
          case "yolo":
            handleYOLODetection(imageData, apiKey);
            break;
          case "tensorflow":
            handleTensorFlowDetection(imageData);
            break;
          case "roboflow":
            handleRoboflowDetection(imageData, apiKey);
            break;
          case "google":
            handleGoogleVisionDetection(imageData, apiKey);
            break;
          default:
            handleYOLODetection(imageData, apiKey);
            break;
        }
      });
    });
  });

  return detectBtn;
}

/**
 * Create the Free Draw button
 * @returns {HTMLElement} - Draw button element
 */
function createDrawButton() {
  const drawBtn = document.createElement("button");
  drawBtn.innerHTML = "✏️";
  drawBtn.title = "Free Draw";
  Object.assign(drawBtn.style, {
    ...BUTTON_BASE_STYLE,
    backgroundColor: "#9C27B0",
    boxShadow: "0 2px 8px rgba(156,39,176,0.3)",
  });

  addButtonHoverEffects(drawBtn, "#9C27B0", "#7B1FA2", "rgba(156,39,176,0.4)");

  drawBtn.addEventListener("click", () => {
    startFreeDrawing();
  });

  return drawBtn;
}

/**
 * Create the Render to Canvas button (Add new bounding box)
 * @returns {HTMLElement} - Render button element
 */
function createRenderButton() {
  const renderBtn = document.createElement("button");
  renderBtn.innerHTML = "+";
  renderBtn.title = "Add New Bounding Box";
  Object.assign(renderBtn.style, {
    ...BUTTON_BASE_STYLE,
    backgroundColor: "#2196F3",
    fontSize: "28px",
    fontWeight: "bold",
    lineHeight: "1",
    boxShadow: "0 2px 8px rgba(33,150,243,0.3)",
  });

  addButtonHoverEffects(renderBtn, "#2196F3", "#1976D2", "rgba(33,150,243,0.4)");

  renderBtn.addEventListener("click", () => {
    renderBoundingBoxesToCanvas();
  });

  return renderBtn;
}

/**
 * Create the Clear All button
 * @returns {HTMLElement} - Clear button element
 */
function createClearButton() {
  const clearBtn = document.createElement("button");
  clearBtn.innerHTML = "🗑️";
  clearBtn.title = "Clear All Bounding Boxes";
  Object.assign(clearBtn.style, {
    ...BUTTON_BASE_STYLE,
    backgroundColor: "#f44336",
    boxShadow: "0 2px 8px rgba(244,67,54,0.3)",
  });

  addButtonHoverEffects(clearBtn, "#f44336", "#da190b", "rgba(244,67,54,0.4)");

  clearBtn.addEventListener("click", () => {
    clearAllBoundingBoxes();
  });

  return clearBtn;
}

/**
 * Create the Send All Polygons button
 * @returns {HTMLElement} - Send all button element
 */
function createSendAllButton() {
  const sendAllBtn = document.createElement("button");
  sendAllBtn.innerHTML = "📤";
  sendAllBtn.title = "Send All Polygons to VR360";
  Object.assign(sendAllBtn.style, {
    ...BUTTON_BASE_STYLE,
    backgroundColor: "#FF9800",
    boxShadow: "0 2px 8px rgba(255,152,0,0.3)",
  });

  addButtonHoverEffects(sendAllBtn, "#FF9800", "#F57C00", "rgba(255,152,0,0.4)");

  sendAllBtn.addEventListener("click", async () => {
    const boxes = document.querySelectorAll(".vr-auto-polygon-box");
    if (boxes.length === 0) {
      alert("No bounding boxes found. Please detect objects or draw polygons first.");
      return;
    }

    // Confirm before sending
    if (!confirm(`Send ${boxes.length} polygon(s) to VR360?`)) {
      return;
    }

    // Disable button during processing
    sendAllBtn.disabled = true;
    sendAllBtn.innerHTML = "⏳";
    sendAllBtn.style.cursor = "wait";

    try {
      await createAllPolygons();
      sendAllBtn.innerHTML = "✅";
      setTimeout(() => {
        sendAllBtn.innerHTML = "📤";
        sendAllBtn.disabled = false;
        sendAllBtn.style.cursor = "pointer";
      }, 2000);
    } catch (error) {
      console.error("Error sending all polygons:", error);
      sendAllBtn.innerHTML = "❌";
      alert("Failed to send polygons: " + error.message);
      setTimeout(() => {
        sendAllBtn.innerHTML = "📤";
        sendAllBtn.disabled = false;
        sendAllBtn.style.cursor = "pointer";
      }, 2000);
    }
  });

  return sendAllBtn;
}

/**
 * Create the List Toggle button
 * @returns {HTMLElement} - List toggle button element
 */
function createListToggleButton() {
  const listToggleBtn = document.createElement("button");
  listToggleBtn.innerHTML = "📋";
  listToggleBtn.title = "Show/Hide Bounding Box List";
  Object.assign(listToggleBtn.style, {
    ...BUTTON_BASE_STYLE,
    backgroundColor: "#607D8B",
    boxShadow: "0 2px 8px rgba(96,125,139,0.3)",
  });

  addButtonHoverEffects(listToggleBtn, "#607D8B", "#455A64", "rgba(96,125,139,0.4)");

  listToggleBtn.addEventListener("click", () => {
    console.log("📋 List toggle button clicked");
    if (typeof toggleModernBoundingBoxPanel === "function") {
      toggleModernBoundingBoxPanel();
    } else if (typeof window.toggleModernBoundingBoxPanel === "function") {
      window.toggleModernBoundingBoxPanel();
    } else {
      console.error("toggleModernBoundingBoxPanel function not found");
    }
  });

  return listToggleBtn;
}

/**
 * Create the Load Scene Polygons button
 * @returns {HTMLElement} - Load polygons button element
 */
function createLoadPolygonsButton() {
  const loadBtn = document.createElement("button");
  loadBtn.innerHTML = "📦";
  loadBtn.title = "Show Polygon List";
  Object.assign(loadBtn.style, {
    ...BUTTON_BASE_STYLE,
    backgroundColor: "#17A2B8",
    boxShadow: "0 2px 8px rgba(23,162,184,0.3)",
  });

  loadBtn.addEventListener("mouseenter", () => {
    loadBtn.style.boxShadow = "0 4px 12px rgba(23,162,184,0.5)";
    loadBtn.style.transform = "scale(1.05)";
  });

  loadBtn.addEventListener("mouseleave", () => {
    loadBtn.style.boxShadow = "0 2px 8px rgba(23,162,184,0.3)";
    loadBtn.style.transform = "scale(1)";
  });

  loadBtn.addEventListener("click", () => {
    console.log("📦 Show Polygon List button clicked");
    // Toggle the modern bounding box panel
    if (typeof toggleModernBoundingBoxPanel === "function") {
      toggleModernBoundingBoxPanel();
    } else if (typeof window.toggleModernBoundingBoxPanel === "function") {
      window.toggleModernBoundingBoxPanel();
    } else {
      console.error("toggleModernBoundingBoxPanel function not found");
      alert("Panel module not loaded. Please refresh the page.");
    }
  });

  return loadBtn;
}
