/**
 * Free Drawing Mode Module
 * Handles free-hand drawing to create polygons
 *
 * Dependencies:
 * - core/drawing/drawing-utils.js (findTargetCanvas, captureKrpanoConfig, convertToPolygon, createPolygonBoundingBox, createDrawingInstruction)
 */

/**
 * Start free drawing mode
 * User draws freely with mouse, polygon is created on mouse up
 */
function startFreeDrawing() {
  console.log("✏️ Starting free drawing mode...");

  // Find canvas
  const targetCanvas = findTargetCanvas();
  if (!targetCanvas) {
    alert("Canvas element not found. Cannot start drawing.");
    return;
  }

  // CRITICAL: Capture krpano config at start of drawing (before user can rotate view)
  // This ensures accurate ath/atv conversion when the polygon is sent to API
  const krpanoConfig = captureKrpanoConfig();

  // Create overlay canvas for drawing
  const drawingCanvas = document.createElement("canvas");
  const canvasRect = targetCanvas.getBoundingClientRect();

  drawingCanvas.id = "vr-drawing-overlay";
  drawingCanvas.width = canvasRect.width;
  drawingCanvas.height = canvasRect.height;

  Object.assign(drawingCanvas.style, {
    position: "fixed",
    left: canvasRect.left + "px",
    top: canvasRect.top + "px",
    width: canvasRect.width + "px",
    height: canvasRect.height + "px",
    zIndex: "999998",
    cursor: "crosshair",
    border: "3px solid #9C27B0",
    boxShadow: "0 0 20px rgba(156,39,176,0.5)",
  });

  const ctx = drawingCanvas.getContext("2d");
  ctx.strokeStyle = "#9C27B0";
  ctx.lineWidth = 1.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  let isDrawing = false;
  let points = [];

  // Start drawing
  drawingCanvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    const rect = drawingCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    points.push({ x, y });
    ctx.beginPath();
    ctx.moveTo(x, y);
  });

  // Continue drawing
  drawingCanvas.addEventListener("mousemove", (e) => {
    if (!isDrawing) return;

    const rect = drawingCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    points.push({ x, y });
    ctx.lineTo(x, y);
    ctx.stroke();
  });

  // Finish drawing
  const finishDrawing = () => {
    if (!isDrawing || points.length < 3) {
      drawingCanvas.remove();
      instruction.remove();
      return;
    }

    isDrawing = false;

    // Convert free drawing to polygon with more points to preserve curves
    const polygon = convertToPolygon(points, 80); // Use 80 points for higher precision curves

    console.log(`📐 Original points: ${points.length}, Simplified to: ${polygon.length}`);

    // Create bounding box from polygon with captured krpanoConfig
    // This ensures the krpanoConfig captured at START is used, not current view
    createPolygonBoundingBox(polygon, targetCanvas, canvasRect, krpanoConfig);

    // Remove drawing canvas
    drawingCanvas.remove();
    instruction.remove();

    console.log(`✓ Created polygon with ${polygon.length} points`);
  };

  drawingCanvas.addEventListener("mouseup", finishDrawing);
  drawingCanvas.addEventListener("mouseleave", finishDrawing);

  // Add instruction overlay
  const instruction = document.createElement("div");
  instruction.textContent = "Draw freely. Release mouse to finish.";
  Object.assign(instruction.style, {
    position: "fixed",
    top: canvasRect.top + 20 + "px",
    left: canvasRect.left + 20 + "px",
    padding: "10px 20px",
    backgroundColor: "rgba(156,39,176,0.9)",
    color: "white",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "bold",
    zIndex: "999999",
    pointerEvents: "none",
  });

  document.body.appendChild(drawingCanvas);
  document.body.appendChild(instruction);

  // Remove instruction after drawing
  drawingCanvas.addEventListener("mouseup", () => {
    setTimeout(() => instruction.remove(), 100);
  });
}
