/**
 * Toolbar UI Module
 * Handles the main toolbar display and draggable functionality
 *
 * Dependencies:
 * - core/toolbar/toolbar-buttons.js (createDetectButton, createDrawButton, etc.)
 * - core/drawing/drawing-utils.js (findTargetCanvas)
 */

/**
 * Toggle toolbar visibility
 */
function toggleToolbar() {
  const buttonGroup = document.getElementById("vr-detector-circle-btn");

  if (!buttonGroup) {
    // Toolbar doesn't exist, create it
    showCircleButton();
    console.log("✓ Toolbar shown");
  } else {
    // Toolbar exists, toggle visibility
    if (buttonGroup.style.display === "none") {
      buttonGroup.style.display = "block";
      console.log("✓ Toolbar shown");
    } else {
      buttonGroup.style.display = "none";
      console.log("✓ Toolbar hidden");
    }
  }
}

/**
 * Show a button group with drag handle overlay on the page
 */
function showCircleButton() {
  // Check if button already exists
  if (document.getElementById("vr-detector-circle-btn")) return;

  const buttonGroup = document.createElement("div");
  buttonGroup.id = "vr-detector-circle-btn";

  // Create drag handle
  const dragHandle = document.createElement("div");
  dragHandle.id = "vr-drag-handle";
  dragHandle.innerHTML = "⋮⋮⋮";
  Object.assign(dragHandle.style, {
    fontSize: "16px",
    color: "rgba(100,100,100,0.6)",
    cursor: "grab",
    padding: "8px 12px",
    fontWeight: "bold",
    letterSpacing: "1px",
    userSelect: "none",
    textAlign: "center",
    borderBottom: "1px solid rgba(0,0,0,0.08)",
    transition: "color 0.2s ease",
  });
  dragHandle.title = "Drag to move";

  dragHandle.addEventListener("mouseenter", () => {
    dragHandle.style.color = "rgba(66, 133, 244, 0.8)";
  });
  dragHandle.addEventListener("mouseleave", () => {
    dragHandle.style.color = "rgba(100,100,100,0.6)";
  });

  // Create buttons container
  const buttonsContainer = document.createElement("div");
  Object.assign(buttonsContainer.style, {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "12px",
    alignItems: "center",
  });

  // Create buttons using toolbar-buttons.js functions
  const detectBtn = createDetectButton();
  const drawBtn = createDrawButton();
  const renderBtn = createRenderButton();
  const loadPolygonsBtn = createLoadPolygonsButton();
  const clearBtn = createClearButton();
  const sendAllBtn = createSendAllButton();
  const listToggleBtn = createListToggleButton();

  buttonsContainer.appendChild(detectBtn);
  buttonsContainer.appendChild(drawBtn);
  buttonsContainer.appendChild(renderBtn);
  buttonsContainer.appendChild(loadPolygonsBtn);
  buttonsContainer.appendChild(sendAllBtn);
  buttonsContainer.appendChild(listToggleBtn);
  buttonsContainer.appendChild(clearBtn);

  buttonGroup.appendChild(dragHandle);
  buttonGroup.appendChild(buttonsContainer);

  // Styling for button group
  Object.assign(buttonGroup.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
    zIndex: "999999",
    userSelect: "none",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(0,0,0,0.08)",
    overflow: "hidden",
  });

  // Make draggable (only from drag handle)
  setupToolbarDraggable(buttonGroup, dragHandle);

  document.body.appendChild(buttonGroup);
  console.log("✓ Button group added to page");
}

/**
 * Setup draggable functionality for toolbar
 * @param {HTMLElement} buttonGroup - The toolbar container
 * @param {HTMLElement} dragHandle - The drag handle element
 */
function setupToolbarDraggable(buttonGroup, dragHandle) {
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;

  dragHandle.addEventListener("mousedown", (e) => {
    isDragging = true;
    dragHandle.style.cursor = "grabbing";

    const rect = buttonGroup.getBoundingClientRect();
    initialX = e.clientX - rect.left;
    initialY = e.clientY - rect.top;
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      e.preventDefault();

      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;

      // Keep within viewport bounds
      const maxX = window.innerWidth - buttonGroup.offsetWidth;
      const maxY = window.innerHeight - buttonGroup.offsetHeight;

      currentX = Math.max(0, Math.min(currentX, maxX));
      currentY = Math.max(0, Math.min(currentY, maxY));

      buttonGroup.style.left = currentX + "px";
      buttonGroup.style.top = currentY + "px";
      buttonGroup.style.right = "auto";
      buttonGroup.style.bottom = "auto";
    }
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      dragHandle.style.cursor = "grab";
    }
  });
}

/**
 * Render all bounding boxes as permanent overlays
 * Creates a new bounding box at the center of the canvas
 */
function renderBoundingBoxesToCanvas() {
  console.log("🎨 Creating new bounding box...");

  // Try to find canvas
  const canvas = findTargetCanvas();

  if (!canvas) {
    console.error("Canvas element not found");
    alert("Canvas element not found. Cannot create box.");
    return;
  }

  const canvasRect = canvas.getBoundingClientRect();

  // Capture krpano config for accurate conversion
  const krpanoConfig = captureKrpanoConfig();

  // Create a box at center of canvas with 100x200px
  const boxWidth = 100;
  const boxHeight = 200;
  const boxLeft = canvasRect.left + canvasRect.width / 2 - boxWidth / 2;
  const boxTop = canvasRect.top + canvasRect.height / 2 - boxHeight / 2;

  // Calculate normalized coordinates relative to canvas
  const normalizedX = (boxLeft - canvasRect.left) / canvas.offsetWidth;
  const normalizedY = (boxTop - canvasRect.top) / canvas.offsetHeight;
  const normalizedWidth = boxWidth / canvas.offsetWidth;
  const normalizedHeight = boxHeight / canvas.offsetHeight;

  // Create vertices in normalized coordinates
  const vertices = [
    { x: normalizedX, y: normalizedY },
    { x: normalizedX + normalizedWidth, y: normalizedY },
    { x: normalizedX + normalizedWidth, y: normalizedY + normalizedHeight },
    { x: normalizedX, y: normalizedY + normalizedHeight },
  ];

  const color = "#FF0000"; // Red
  const label = "New Box";
  const score = 1.0;

  // Create a new bounding box overlay with krpanoConfig
  drawBoundingBox(vertices, label, score, color, canvas, krpanoConfig);

  // Save state and update list
  saveStateForUndo();
  if (typeof updateModernBoundingBoxList === "function") {
    updateModernBoundingBoxList();
  }

  console.log(`✓ Created new bounding box at center`);
}
