/**
 * Circle Drawing Mode Module
 * Handles circle drawing (converted to polygon)
 *
 * Dependencies:
 * - core/drawing/drawing-utils.js (findTargetCanvas, captureKrpanoConfig)
 * - core/ui-display.js (drawPolygonOverlay)
 * - core/undo-redo.js (saveStateForUndo)
 * - core/bbox-list/index.js (updateModernBoundingBoxList)
 */

/**
 * Start circle drawing mode
 * Click and drag to draw a circle (stored as 32-point polygon)
 */
function startCircleDrawing() {
  console.log("⭕ Starting circle drawing mode...");

  const targetCanvas = findTargetCanvas();
  if (!targetCanvas) {
    alert("Canvas element not found. Cannot start drawing.");
    return;
  }

  // CRITICAL: Capture krpano config at start of drawing
  // This ensures accurate ath/atv conversion when circle polygon is sent to API
  const krpanoConfig = captureKrpanoConfig();

  const canvasRect = targetCanvas.getBoundingClientRect();
  const drawingOverlay = document.createElement("div");
  drawingOverlay.id = "vr-circle-overlay";

  Object.assign(drawingOverlay.style, {
    position: "fixed",
    left: canvasRect.left + "px",
    top: canvasRect.top + "px",
    width: canvasRect.width + "px",
    height: canvasRect.height + "px",
    zIndex: "999998",
    cursor: "crosshair",
    border: "3px solid #E91E63",
    boxShadow: "0 0 20px rgba(233,30,99,0.5)",
  });

  let centerX, centerY;
  let circle = null;

  drawingOverlay.addEventListener("mousedown", (e) => {
    const rect = drawingOverlay.getBoundingClientRect();
    centerX = e.clientX - rect.left;
    centerY = e.clientY - rect.top;

    circle = document.createElement("div");
    Object.assign(circle.style, {
      position: "absolute",
      border: "3px solid #E91E63",
      backgroundColor: "rgba(233,30,99,0.1)",
      borderRadius: "50%",
      pointerEvents: "none",
    });
    drawingOverlay.appendChild(circle);
  });

  drawingOverlay.addEventListener("mousemove", (e) => {
    if (!circle) return;

    const rect = drawingOverlay.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const radius = Math.sqrt(Math.pow(currentX - centerX, 2) + Math.pow(currentY - centerY, 2));

    Object.assign(circle.style, {
      left: centerX - radius + "px",
      top: centerY - radius + "px",
      width: radius * 2 + "px",
      height: radius * 2 + "px",
    });
  });

  drawingOverlay.addEventListener("mouseup", (e) => {
    if (!circle) return;

    const rect = drawingOverlay.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;

    const radius = Math.sqrt(Math.pow(endX - centerX, 2) + Math.pow(endY - centerY, 2));

    if (radius > 10) {
      // Create circle as polygon with 32 points
      const points = 32;
      const normalizedVertices = [];
      for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        normalizedVertices.push({
          x: x / canvasRect.width,
          y: y / canvasRect.height,
        });
      }

      const color = "#E91E63";
      const label = "Circle";
      const score = 1.0;

      // Pass captured krpanoConfig for accurate ath/atv conversion
      drawPolygonOverlay(normalizedVertices, label, score, color, targetCanvas, krpanoConfig);
      saveStateForUndo();
      if (typeof updateModernBoundingBoxList === "function") {
        updateModernBoundingBoxList();
      }
    }

    drawingOverlay.remove();
    instruction.remove();
  });

  const instruction = document.createElement("div");
  instruction.textContent = "Click and drag to draw a circle";
  Object.assign(instruction.style, {
    position: "fixed",
    top: canvasRect.top + 20 + "px",
    left: canvasRect.left + 20 + "px",
    padding: "10px 20px",
    backgroundColor: "rgba(233,30,99,0.9)",
    color: "white",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "bold",
    zIndex: "999999",
  });

  document.body.appendChild(drawingOverlay);
  document.body.appendChild(instruction);
}
