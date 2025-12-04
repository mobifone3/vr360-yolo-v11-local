/**
 * UI Display Module (Main Coordinator)
 * Handles displaying detection results with bounding boxes
 *
 * Dependencies (loaded via manifest.json):
 * - bbox-drag.js: Drag functionality (makeDraggable)
 * - bbox-resize.js: Resize functionality (addResizeHandles, makeResizable)
 * - controls/label-factory.js: Label creation (createLabel)
 * - controls/box-duplicator.js: Box duplication (duplicateBoundingBox)
 * - bbox-draw.js: Manual drawing mode (enableBoundingBoxDrawing, disableBoundingBoxDrawing)
 */

/**
 * Display detected objects with bounding boxes
 */
function displayDetectedObjects(objects, krpanoConfig = null) {
  if (!objects || objects.length === 0) {
    console.warn("No objects to display");
    return;
  }

  console.log(`📦 Displaying ${objects.length} detected objects...`);
  if (krpanoConfig) {
    console.log(`📐 Using krpano config: h=${krpanoConfig.hlookat}, v=${krpanoConfig.vlookat}, fov=${krpanoConfig.fov}`);
  }

  // Find the canvas element to position boxes relative to it
  const canvas = findCanvasElement();

  objects.forEach((obj, index) => {
    const color = getColorForIndex(index);
    drawBoundingBox(obj.boundingPoly.normalizedVertices, obj.name, obj.score, color, canvas, krpanoConfig);
  });

  // Save state for undo and update list
  if (typeof saveStateForUndo === "function") {
    saveStateForUndo();
  }
  if (typeof updateModernBoundingBoxList === "function") {
    updateModernBoundingBoxList();
  }
}

/**
 * Find the VR canvas element
 */
function findCanvasElement() {
  // Try to find krpano canvas
  const krpanoCanvas = document.querySelector("#krpanoContainer canvas");
  if (krpanoCanvas) return krpanoCanvas;

  // Try to find any large canvas
  const canvases = document.querySelectorAll("canvas");
  for (const canvas of canvases) {
    if (canvas.offsetWidth > 500 && canvas.offsetHeight > 300) {
      return canvas;
    }
  }

  return null;
}

/**
 * Draw a single bounding box overlay
 */
function drawBoundingBox(vertices, label, score, color, canvas, krpanoConfig = null) {
  if (!vertices || vertices.length < 4) {
    console.warn("Invalid vertices for bounding box");
    return;
  }

  const container = document.createElement("div");
  container.className = "vr-auto-polygon-box";

  // Get canvas position and dimensions
  let canvasRect, canvasWidth, canvasHeight;

  if (canvas) {
    canvasRect = canvas.getBoundingClientRect();
    // Use offsetWidth/Height for actual rendered size (not scaled size)
    canvasWidth = canvas.offsetWidth;
    canvasHeight = canvas.offsetHeight;
    console.log(`  Canvas rect: left=${canvasRect.left}, top=${canvasRect.top}, width=${canvasWidth}, height=${canvasHeight}`);
  } else {
    // Fallback to viewport if no canvas found
    console.warn("  No canvas found, using viewport positioning");
    canvasRect = { left: 0, top: 0 };
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
  }

  // Get current krpano view if not provided
  if (!krpanoConfig && typeof getKrpanoViewFromUI === "function") {
    krpanoConfig = getKrpanoViewFromUI();
    if (krpanoConfig) {
      console.log(`  Using current UI view: h=${krpanoConfig.hlookat}, v=${krpanoConfig.vlookat}, fov=${krpanoConfig.fov}`);
    }
  }

  // NOTE: Detection returns normalized coordinates (0-1) relative to the captured image.
  // The captured image is the canvas screenshot, so map to canvas dimensions only.

  // Calculate bounding box from normalized vertices
  const xValues = vertices.map((v) => v.x || 0);
  const yValues = vertices.map((v) => v.y || 0);

  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);

  console.log(`  Normalized coords: x=[${minX.toFixed(3)}, ${maxX.toFixed(3)}], y=[${minY.toFixed(3)}, ${maxY.toFixed(3)}]`);

  // Map normalized coordinates to canvas coordinates
  // Position is relative to canvas position on screen (using canvasRect.left/top)
  const boxLeft = canvasRect.left + minX * canvasWidth;
  const boxTop = canvasRect.top + minY * canvasHeight;
  const boxWidth = (maxX - minX) * canvasWidth;
  const boxHeight = (maxY - minY) * canvasHeight;

  console.log(
    `  Canvas position: left=${boxLeft.toFixed(2)}, top=${boxTop.toFixed(2)}, width=${boxWidth.toFixed(
      2
    )}, height=${boxHeight.toFixed(2)}`
  );

  // Style the container
  Object.assign(container.style, {
    position: "fixed",
    left: `${boxLeft}px`,
    top: `${boxTop}px`,
    width: `${boxWidth}px`,
    height: `${boxHeight}px`,
    border: `3px solid ${color}`,
    borderRadius: "4px",
    zIndex: "999999",
    pointerEvents: "auto",
    boxSizing: "border-box",
    cursor: "move",
    transition: "box-shadow 0.2s ease",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  });

  // Add hover effect to container
  container.addEventListener("mouseenter", () => {
    container.style.boxShadow = `0 6px 20px ${color}40`;
  });
  container.addEventListener("mouseleave", () => {
    container.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
  });

  // Store data for duplication
  container.dataset.label = label;
  container.dataset.score = score;
  container.dataset.color = color;
  if (krpanoConfig) {
    container.dataset.krpanoConfig = JSON.stringify(krpanoConfig);
  }

  // Add resize handles (from bbox-resize.js)
  addResizeHandles(container, color);

  // Create label with buttons (from bbox-controls.js)
  const labelDiv = createLabel(label, score, color, container, canvas, false, krpanoConfig);

  container.appendChild(labelDiv);

  // Add drag functionality (from bbox-drag.js)
  makeDraggable(container);

  document.body.appendChild(container);
}

/**
 * Get color for object by index
 */
function getColorForIndex(index) {
  const colors = [
    "#FF0000", // Red
    "#00FF00", // Green
    "#0000FF", // Blue
    "#FFFF00", // Yellow
    "#FF00FF", // Magenta
    "#00FFFF", // Cyan
    "#FFA500", // Orange
    "#800080", // Purple
    "#008000", // Dark Green
    "#FFC0CB", // Pink
  ];
  return colors[index % colors.length];
}

/**
 * Convert pixel vertices to normalized coordinates
 */
function convertToNormalizedVertices(vertices) {
  const width = window.innerWidth;
  const height = window.innerHeight;

  return vertices.map((v) => ({
    x: (v.x || 0) / width,
    y: (v.y || 0) / height,
  }));
}

/**
 * Remove all bounding boxes from the page
 */
function clearAllBoundingBoxes() {
  // Save state for undo before clearing
  if (typeof saveStateForUndo === "function") {
    saveStateForUndo();
  }

  document.querySelectorAll(".vr-auto-polygon-box").forEach((el) => el.remove());
  console.log("🧹 Cleared all bounding boxes");

  // Update list
  if (typeof updateBoundingBoxList === "function") {
    updateBoundingBoxList();
  }
}

/**
 * Placeholder for future polygon automation
 */
function automatePolygonCreation(objectData) {
  console.log("Automating polygon for:", objectData.name);

  // TODO: Implement polygon creation automation
  // This will require inspecting the specific VR viewer's API

  console.warn("⚠️ Polygon automation not yet implemented");
  console.log("💡 You need to manually inspect the VR viewer to find:");
  console.log("  1. How to activate polygon drawing mode");
  console.log("  2. How to programmatically add polygon points");
  console.log("  3. How to save/finalize the polygon");
}

/**
 * Draw a polygon overlay (for free-drawn shapes or existing scene polygons)
 * @param {Array} vertices - [{x, y}, ...] normalized screen coordinates
 * @param {string} label - Label for the polygon
 * @param {number} score - Confidence score (0-1)
 * @param {string} color - CSS color for the polygon
 * @param {HTMLElement} canvas - Canvas element (optional)
 * @param {object} krpanoConfig - Krpano configuration (optional)
 * @param {boolean} isScenePolygon - Whether this is from scene API (optional)
 * @param {object} scenePolygonData - Original polygon data from API (optional)
 */
function drawPolygonOverlay(
  vertices,
  label,
  score,
  color,
  canvas,
  krpanoConfig = null,
  isScenePolygon = false,
  scenePolygonData = null
) {
  if (!vertices || vertices.length < 3) {
    console.warn("Invalid vertices for polygon overlay");
    return;
  }

  const container = document.createElement("div");
  container.className = "vr-auto-polygon-box";
  if (isScenePolygon) {
    container.classList.add("vr-scene-polygon");
  }

  // Get canvas position and dimensions
  let canvasRect, canvasWidth, canvasHeight;

  if (canvas) {
    canvasRect = canvas.getBoundingClientRect();
    canvasWidth = canvas.offsetWidth;
    canvasHeight = canvas.offsetHeight;
  } else {
    console.warn("  No canvas found, using viewport positioning");
    canvasRect = { left: 0, top: 0 };
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
  }

  // Calculate bounding box from vertices for container positioning
  const xValues = vertices.map((v) => v.x || 0);
  const yValues = vertices.map((v) => v.y || 0);

  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);

  const boxLeft = canvasRect.left + minX * canvasWidth;
  const boxTop = canvasRect.top + minY * canvasHeight;
  const boxWidth = (maxX - minX) * canvasWidth;
  const boxHeight = (maxY - minY) * canvasHeight;

  // Create SVG for polygon path
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", boxWidth);
  svg.setAttribute("height", boxHeight);
  svg.style.position = "absolute";
  svg.style.top = "0";
  svg.style.left = "0";
  svg.style.pointerEvents = "none";

  // Create polygon path
  const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");

  // Convert normalized coordinates to SVG coordinates relative to bounding box
  const points = vertices
    .map((v) => {
      const x = ((v.x - minX) / (maxX - minX)) * boxWidth;
      const y = ((v.y - minY) / (maxY - minY)) * boxHeight;
      return `${x},${y}`;
    })
    .join(" ");

  polygon.setAttribute("points", points);
  polygon.setAttribute("fill", isScenePolygon ? "rgba(0,150,200,0.1)" : "none");
  polygon.setAttribute("stroke", color);
  polygon.setAttribute("stroke-width", "1.5");
  polygon.setAttribute("stroke-linejoin", "round");
  polygon.setAttribute("stroke-linecap", "round");

  svg.appendChild(polygon);

  // Style the container
  Object.assign(container.style, {
    position: "fixed",
    left: `${boxLeft}px`,
    top: `${boxTop}px`,
    width: `${boxWidth}px`,
    height: `${boxHeight}px`,
    zIndex: "999999",
    pointerEvents: "auto",
    boxSizing: "border-box",
    cursor: "move",
    transition: "filter 0.2s ease",
  });

  // Add hover effect
  container.addEventListener("mouseenter", () => {
    container.style.filter = `drop-shadow(0 0 8px ${color})`;
  });
  container.addEventListener("mouseleave", () => {
    container.style.filter = "none";
  });

  // Store data for duplication
  container.dataset.label = label;
  container.dataset.score = score;
  container.dataset.color = color;
  container.dataset.vertices = JSON.stringify(vertices);
  container.dataset.isScenePolygon = isScenePolygon ? "true" : "false";

  // Store polygon type and hotspot ID from scene data
  if (scenePolygonData) {
    container.dataset.polygonType = scenePolygonData.type || "image";
    container.dataset.hotspotId = scenePolygonData.id || "";
    // Store full scene polygon data for type change operations
    container.dataset.scenePolygonData = JSON.stringify(scenePolygonData);
    // Store original sphere points for type change operations
    if (scenePolygonData.polygon_config?.points) {
      container.dataset.spherePoints = JSON.stringify(scenePolygonData.polygon_config.points);
    }
  } else {
    container.dataset.polygonType = "image";
  }

  // Store krpano config for accurate polygon creation
  if (krpanoConfig) {
    container.dataset.krpanoConfig = JSON.stringify(krpanoConfig);
  } else if (!isScenePolygon && typeof getKrpanoViewFromUI === "function") {
    const currentConfig = getKrpanoViewFromUI();
    if (currentConfig) {
      container.dataset.krpanoConfig = JSON.stringify(currentConfig);
    }
  }

  // Add resize handles at each vertex (only for user polygons, not scene polygons)
  if (!isScenePolygon) {
    vertices.forEach((vertex, index) => {
      const handle = document.createElement("div");
      const handleX = ((vertex.x - minX) / (maxX - minX)) * boxWidth;
      const handleY = ((vertex.y - minY) / (maxY - minY)) * boxHeight;

      Object.assign(handle.style, {
        position: "absolute",
        left: `${handleX - 4}px`,
        top: `${handleY - 4}px`,
        width: "8px",
        height: "8px",
        backgroundColor: color,
        border: "2px solid white",
        borderRadius: "50%",
        cursor: "pointer",
        zIndex: "2",
        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
      });

      handle.title = `Point ${index + 1}`;
      container.appendChild(handle);
    });
  }

  // Create label with buttons (from bbox-controls.js)
  const labelDiv = createLabel(label, score, color, container, canvas, isScenePolygon);

  container.appendChild(svg);
  container.appendChild(labelDiv);

  // Add drag functionality only for user polygons (from bbox-drag.js)
  if (!isScenePolygon) {
    makeDraggable(container);
  }

  document.body.appendChild(container);

  console.log(`✓ Created ${isScenePolygon ? "scene " : ""}polygon overlay with ${vertices.length} vertices`);
}
