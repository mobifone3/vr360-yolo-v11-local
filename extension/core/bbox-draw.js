/**
 * Bounding Box Drawing Module
 * Handles user-drawn bounding boxes with drag-to-size
 */

let isDrawing = false;
let drawStartX = 0;
let drawStartY = 0;
let currentDrawBox = null;

/**
 * Enable manual bounding box drawing mode
 */
function enableBoundingBoxDrawing(canvas) {
  console.log("🎨 Bounding box drawing mode enabled");

  const targetElement = canvas || document.body;

  // Change cursor to crosshair
  targetElement.style.cursor = "crosshair";

  // Add event listeners for drawing
  targetElement.addEventListener("mousedown", startDrawing);
  document.addEventListener("mousemove", continueDrawing);
  document.addEventListener("mouseup", finishDrawing);

  // Store references for cleanup
  targetElement.dataset.drawingEnabled = "true";
}

/**
 * Disable manual bounding box drawing mode
 */
function disableBoundingBoxDrawing(canvas) {
  console.log("🛑 Bounding box drawing mode disabled");

  const targetElement = canvas || document.body;

  // Reset cursor
  targetElement.style.cursor = "";

  // Remove event listeners
  targetElement.removeEventListener("mousedown", startDrawing);
  document.removeEventListener("mousemove", continueDrawing);
  document.removeEventListener("mouseup", finishDrawing);

  // Clean up any partial drawing
  if (currentDrawBox) {
    currentDrawBox.remove();
    currentDrawBox = null;
  }

  targetElement.dataset.drawingEnabled = "false";
}

/**
 * Start drawing a new bounding box
 */
function startDrawing(e) {
  // Ignore if clicking on existing boxes or controls
  if (
    e.target.classList.contains("vr-auto-polygon-box") ||
    e.target.classList.contains("resize-handle") ||
    e.target.closest(".vr-auto-polygon-box")
  ) {
    return;
  }

  isDrawing = true;
  drawStartX = e.clientX;
  drawStartY = e.clientY;

  // Create initial box
  currentDrawBox = document.createElement("div");
  currentDrawBox.className = "vr-auto-polygon-box drawing";

  const color = getColorForIndex(document.querySelectorAll(".vr-auto-polygon-box").length);

  Object.assign(currentDrawBox.style, {
    position: "fixed",
    left: `${drawStartX}px`,
    top: `${drawStartY}px`,
    width: "0px",
    height: "0px",
    border: `3px solid ${color}`,
    borderRadius: "4px",
    zIndex: "999999",
    pointerEvents: "none",
    boxSizing: "border-box",
    backgroundColor: `${color}10`,
  });

  currentDrawBox.dataset.color = color;
  document.body.appendChild(currentDrawBox);

  e.preventDefault();
}

/**
 * Continue drawing (resize box as mouse moves)
 */
function continueDrawing(e) {
  if (!isDrawing || !currentDrawBox) return;

  const currentX = e.clientX;
  const currentY = e.clientY;

  // Calculate width and height
  const width = Math.abs(currentX - drawStartX);
  const height = Math.abs(currentY - drawStartY);

  // Calculate left and top (handle all directions)
  const left = Math.min(currentX, drawStartX);
  const top = Math.min(currentY, drawStartY);

  // Update box dimensions
  currentDrawBox.style.left = `${left}px`;
  currentDrawBox.style.top = `${top}px`;
  currentDrawBox.style.width = `${width}px`;
  currentDrawBox.style.height = `${height}px`;

  e.preventDefault();
}

/**
 * Finish drawing and create permanent bounding box
 */
function finishDrawing(e) {
  if (!isDrawing || !currentDrawBox) return;

  isDrawing = false;

  const width = parseInt(currentDrawBox.style.width);
  const height = parseInt(currentDrawBox.style.height);

  // Only create box if it has meaningful size (at least 20x20 pixels)
  if (width >= 20 && height >= 20) {
    const color = currentDrawBox.dataset.color;
    const left = parseInt(currentDrawBox.style.left);
    const top = parseInt(currentDrawBox.style.top);

    // Remove drawing class and make it permanent
    currentDrawBox.classList.remove("drawing");
    currentDrawBox.style.pointerEvents = "auto";
    currentDrawBox.style.cursor = "move";
    currentDrawBox.style.backgroundColor = "transparent";

    // Get canvas for reference
    const canvas = findCanvasElement();

    // Get current krpano view if available
    let krpanoConfig = null;
    if (typeof getKrpanoViewFromUI === "function") {
      krpanoConfig = getKrpanoViewFromUI();
    }

    // Store data
    const label = "Manual Box";
    const score = 1.0;
    currentDrawBox.dataset.label = label;
    currentDrawBox.dataset.score = score;
    if (krpanoConfig) {
      currentDrawBox.dataset.krpanoConfig = JSON.stringify(krpanoConfig);
    }

    // Add resize handles
    addResizeHandles(currentDrawBox, color);

    // Create label with buttons
    const labelDiv = createLabel(label, score, color, currentDrawBox, canvas, false, krpanoConfig);
    currentDrawBox.appendChild(labelDiv);

    // Add drag functionality
    makeDraggable(currentDrawBox);

    console.log(`✓ Created manual bounding box at (${left}, ${top}) with size ${width}x${height}`);

    // Save state for undo and update list
    if (typeof saveStateForUndo === "function") {
      saveStateForUndo();
    }
    if (typeof updateBoundingBoxList === "function") {
      updateBoundingBoxList();
    }
  } else {
    // Box too small, remove it
    currentDrawBox.remove();
    console.log("⚠️ Box too small, ignored");
  }

  currentDrawBox = null;
  e.preventDefault();
}

/**
 * Create a manual bounding box at a specific location
 */
function createManualBoundingBox(x, y, width, height, label = "Manual Box") {
  const canvas = findCanvasElement();
  const color = getColorForIndex(document.querySelectorAll(".vr-auto-polygon-box").length);

  // Get current krpano view if available
  let krpanoConfig = null;
  if (typeof getKrpanoViewFromUI === "function") {
    krpanoConfig = getKrpanoViewFromUI();
  }

  const container = document.createElement("div");
  container.className = "vr-auto-polygon-box";

  Object.assign(container.style, {
    position: "fixed",
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`,
    border: `3px solid ${color}`,
    borderRadius: "4px",
    zIndex: "999999",
    pointerEvents: "auto",
    boxSizing: "border-box",
    cursor: "move",
    transition: "box-shadow 0.2s ease",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  });

  container.dataset.label = label;
  container.dataset.score = "1.0";
  container.dataset.color = color;
  if (krpanoConfig) {
    container.dataset.krpanoConfig = JSON.stringify(krpanoConfig);
  }

  // Add resize handles
  addResizeHandles(container, color);

  // Create label with buttons
  const labelDiv = createLabel(label, 1.0, color, container, canvas, false, krpanoConfig);
  container.appendChild(labelDiv);

  // Add drag functionality
  makeDraggable(container);

  document.body.appendChild(container);

  console.log(`✓ Created manual bounding box: ${label}`);

  // Save state for undo and update list
  if (typeof saveStateForUndo === "function") {
    saveStateForUndo();
  }
  if (typeof updateBoundingBoxList === "function") {
    updateBoundingBoxList();
  }

  return container;
}
