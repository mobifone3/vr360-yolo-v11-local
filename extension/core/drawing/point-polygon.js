/**
 * Point-by-Point Polygon Drawing Mode Module
 * Handles click-to-add-vertex polygon drawing
 *
 * Dependencies:
 * - core/drawing/drawing-utils.js (findTargetCanvas, captureKrpanoConfig)
 * - core/ui-display.js (drawPolygonOverlay)
 * - core/undo-redo.js (saveStateForUndo)
 * - core/bbox-list/index.js (updateModernBoundingBoxList)
 */

/**
 * Start point-by-point polygon drawing mode
 * Click to add vertices, double-click or press Enter to finish
 */
function startPointPolygonDrawing() {
  console.log("📍 Starting point-by-point polygon drawing mode...");

  // Find canvas
  const targetCanvas = findTargetCanvas();
  if (!targetCanvas) {
    alert("Canvas element not found. Cannot start drawing.");
    return;
  }

  const canvasRect = targetCanvas.getBoundingClientRect();

  // Create SVG overlay for drawing
  const svgOverlay = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgOverlay.id = "vr-point-polygon-overlay";
  svgOverlay.setAttribute("width", canvasRect.width);
  svgOverlay.setAttribute("height", canvasRect.height);

  Object.assign(svgOverlay.style, {
    position: "fixed",
    left: canvasRect.left + "px",
    top: canvasRect.top + "px",
    width: canvasRect.width + "px",
    height: canvasRect.height + "px",
    zIndex: "999998",
    cursor: "crosshair",
    border: "3px solid #FF5722",
    boxShadow: "0 0 20px rgba(255,87,34,0.5)",
  });

  // Create polygon element
  const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  polygon.setAttribute("fill", "rgba(255,87,34,0.2)");
  polygon.setAttribute("stroke", "#FF5722");
  polygon.setAttribute("stroke-width", "1.5");
  svgOverlay.appendChild(polygon);

  // Create polyline for preview (follows cursor)
  const previewLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
  previewLine.setAttribute("stroke", "#FF5722");
  previewLine.setAttribute("stroke-width", "1.5");
  previewLine.setAttribute("stroke-dasharray", "5,5");
  previewLine.style.display = "none";
  svgOverlay.appendChild(previewLine);

  const points = [];
  const pointMarkers = [];

  // CRITICAL: Get krpano config at start of drawing
  // This ensures accurate ath/atv conversion when polygon is sent to API
  const krpanoConfig = captureKrpanoConfig();

  // Update polygon display
  const updatePolygon = () => {
    if (points.length > 0) {
      polygon.setAttribute("points", points.map((p) => `${p.x},${p.y}`).join(" "));
    }
  };

  // Add point marker
  const addPointMarker = (x, y, index) => {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", "6");
    circle.setAttribute("fill", "#FF5722");
    circle.setAttribute("stroke", "white");
    circle.setAttribute("stroke-width", "2");
    circle.style.cursor = "pointer";

    // Add point number
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y - 12);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("fill", "white");
    text.setAttribute("font-size", "12");
    text.setAttribute("font-weight", "bold");
    text.textContent = index + 1;

    svgOverlay.appendChild(circle);
    svgOverlay.appendChild(text);
    pointMarkers.push({ circle, text });
  };

  // Click to add point
  svgOverlay.addEventListener("click", (e) => {
    const rect = svgOverlay.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    points.push({ x, y });
    addPointMarker(x, y, points.length - 1);
    updatePolygon();

    console.log(`📍 Added point ${points.length}: (${x.toFixed(0)}, ${y.toFixed(0)})`);

    // Update preview line start
    if (points.length > 0) {
      previewLine.setAttribute("x1", x);
      previewLine.setAttribute("y1", y);
      previewLine.style.display = "block";
    }

    // Update point count display
    const countEl = document.getElementById("point-count");
    if (countEl) countEl.textContent = points.length;
  });

  // Mouse move for preview line
  svgOverlay.addEventListener("mousemove", (e) => {
    if (points.length > 0) {
      const rect = svgOverlay.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      previewLine.setAttribute("x2", x);
      previewLine.setAttribute("y2", y);
    }
  });

  // Finish drawing function
  const finishDrawing = () => {
    if (points.length < 3) {
      alert("Please add at least 3 points to create a polygon.");
      return;
    }

    // Convert to normalized vertices
    const normalizedVertices = points.map((p) => ({
      x: p.x / canvasRect.width,
      y: p.y / canvasRect.height,
    }));

    const color = "#FF5722";
    const label = `Polygon (${points.length}pts)`;
    const score = 1.0;

    // Create the polygon overlay with captured krpanoConfig
    drawPolygonOverlay(normalizedVertices, label, score, color, targetCanvas, krpanoConfig);

    // Save state for undo and update list
    saveStateForUndo();
    if (typeof updateModernBoundingBoxList === "function") {
      updateModernBoundingBoxList();
    }

    // Cleanup
    svgOverlay.remove();
    instruction.remove();
    document.removeEventListener("keydown", keyHandler);

    console.log(`✓ Created polygon with ${points.length} vertices`);
  };

  // Double-click to finish
  svgOverlay.addEventListener("dblclick", (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Remove the last point added by the click event
    if (points.length > 0) {
      points.pop();
      const marker = pointMarkers.pop();
      if (marker) {
        marker.circle.remove();
        marker.text.remove();
      }
      updatePolygon();
    }
    finishDrawing();
  });

  // Key handler for Enter to finish, Escape to cancel, Backspace to remove last point
  const keyHandler = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      finishDrawing();
    } else if (e.key === "Escape") {
      e.preventDefault();
      svgOverlay.remove();
      instruction.remove();
      document.removeEventListener("keydown", keyHandler);
      console.log("📍 Point polygon drawing cancelled");
    } else if (e.key === "Backspace" && points.length > 0) {
      e.preventDefault();
      points.pop();
      const marker = pointMarkers.pop();
      if (marker) {
        marker.circle.remove();
        marker.text.remove();
      }
      updatePolygon();
      // Update preview line
      if (points.length > 0) {
        const lastPoint = points[points.length - 1];
        previewLine.setAttribute("x1", lastPoint.x);
        previewLine.setAttribute("y1", lastPoint.y);
      } else {
        previewLine.style.display = "none";
      }
      // Update point count
      const countEl = document.getElementById("point-count");
      if (countEl) countEl.textContent = points.length;
      console.log(`📍 Removed last point. ${points.length} points remaining.`);
    }
  };
  document.addEventListener("keydown", keyHandler);

  // Add instruction overlay
  const instruction = document.createElement("div");
  instruction.innerHTML = `
    <div style="margin-bottom:5px"><strong>📍 Point-by-Point Polygon</strong></div>
    <div>• Click to add vertices</div>
    <div>• Backspace to remove last point</div>
    <div>• Enter or Double-click to finish</div>
    <div>• Escape to cancel</div>
    <div style="margin-top:5px;color:#FFD54F">Points: <span id="point-count">0</span></div>
  `;
  Object.assign(instruction.style, {
    position: "fixed",
    top: canvasRect.top + 20 + "px",
    left: canvasRect.left + 20 + "px",
    padding: "12px 16px",
    backgroundColor: "rgba(255,87,34,0.95)",
    color: "white",
    borderRadius: "8px",
    fontSize: "13px",
    lineHeight: "1.5",
    zIndex: "999999",
    pointerEvents: "none",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
  });

  document.body.appendChild(svgOverlay);
  document.body.appendChild(instruction);
}
