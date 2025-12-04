/**
 * Rectangle Drawing Mode Module
 * Handles rectangle/bounding box drawing
 *
 * Dependencies:
 * - core/drawing/drawing-utils.js (findTargetCanvas, captureKrpanoConfig)
 * - core/ui-display.js (drawBoundingBox)
 * - core/undo-redo.js (saveStateForUndo)
 * - core/bbox-list/index.js (updateModernBoundingBoxList)
 */

/**
 * Start rectangle drawing mode
 * Click and drag to draw a rectangle
 */
function startRectangleDrawing() {
  console.log("⬜ Starting rectangle drawing mode...");

  const targetCanvas = findTargetCanvas();
  if (!targetCanvas) {
    alert("Canvas element not found. Cannot start drawing.");
    return;
  }

  // CRITICAL: Capture krpano config at start of drawing
  // This ensures accurate ath/atv conversion when rectangle is sent to API
  const krpanoConfig = captureKrpanoConfig();

  const canvasRect = targetCanvas.getBoundingClientRect();
  const drawingOverlay = document.createElement("div");
  drawingOverlay.id = "vr-rectangle-overlay";

  Object.assign(drawingOverlay.style, {
    position: "fixed",
    left: canvasRect.left + "px",
    top: canvasRect.top + "px",
    width: canvasRect.width + "px",
    height: canvasRect.height + "px",
    zIndex: "999998",
    cursor: "crosshair",
    border: "3px solid #2196F3",
    boxShadow: "0 0 20px rgba(33,150,243,0.5)",
  });

  let startX, startY;
  let rectangle = null;

  drawingOverlay.addEventListener("mousedown", (e) => {
    const rect = drawingOverlay.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;

    rectangle = document.createElement("div");
    Object.assign(rectangle.style, {
      position: "absolute",
      border: "3px solid #2196F3",
      backgroundColor: "rgba(33,150,243,0.1)",
      pointerEvents: "none",
    });
    drawingOverlay.appendChild(rectangle);
  });

  drawingOverlay.addEventListener("mousemove", (e) => {
    if (!rectangle) return;

    const rect = drawingOverlay.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);

    Object.assign(rectangle.style, {
      left: left + "px",
      top: top + "px",
      width: width + "px",
      height: height + "px",
    });
  });

  drawingOverlay.addEventListener("mouseup", (e) => {
    if (!rectangle) return;

    const rect = drawingOverlay.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;

    const left = Math.min(startX, endX);
    const top = Math.min(startY, endY);
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);

    if (width > 10 && height > 10) {
      // Create normalized vertices
      const normalizedVertices = [
        { x: left / canvasRect.width, y: top / canvasRect.height },
        { x: (left + width) / canvasRect.width, y: top / canvasRect.height },
        { x: (left + width) / canvasRect.width, y: (top + height) / canvasRect.height },
        { x: left / canvasRect.width, y: (top + height) / canvasRect.height },
      ];

      const color = "#2196F3";
      const label = "Rectangle";
      const score = 1.0;

      // Pass captured krpanoConfig for accurate ath/atv conversion
      drawBoundingBox(normalizedVertices, label, score, color, targetCanvas, krpanoConfig);
      saveStateForUndo();
      if (typeof updateModernBoundingBoxList === "function") {
        updateModernBoundingBoxList();
      }
    }

    drawingOverlay.remove();
    instruction.remove();
  });

  const instruction = document.createElement("div");
  instruction.textContent = "Click and drag to draw a rectangle";
  Object.assign(instruction.style, {
    position: "fixed",
    top: canvasRect.top + 20 + "px",
    left: canvasRect.left + 20 + "px",
    padding: "10px 20px",
    backgroundColor: "rgba(33,150,243,0.9)",
    color: "white",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "bold",
    zIndex: "999999",
  });

  document.body.appendChild(drawingOverlay);
  document.body.appendChild(instruction);
}
