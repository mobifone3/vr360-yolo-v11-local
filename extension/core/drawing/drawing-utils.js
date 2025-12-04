/**
 * Drawing Utilities Module
 * Shared utility functions for all drawing modes
 *
 * Dependencies:
 * - helpers/coord/ui-extractor.js (getKrpanoViewFromUI)
 * - core/ui-display.js (drawPolygonOverlay)
 * - core/undo-redo.js (saveStateForUndo)
 * - core/bbox-list/index.js (updateModernBoundingBoxList)
 */

/**
 * Find the VR canvas element
 * @returns {HTMLCanvasElement|null} - Canvas element or null
 */
function findTargetCanvas() {
  let targetCanvas = document.querySelector("#krpanoContainer canvas");
  if (!targetCanvas) {
    const canvases = document.querySelectorAll("canvas");
    for (const c of canvases) {
      if (c.offsetWidth > 500 && c.offsetHeight > 300) {
        targetCanvas = c;
        break;
      }
    }
  }
  return targetCanvas;
}

/**
 * Capture current krpano view configuration
 * CRITICAL: This must be called at the START of drawing to ensure accurate ath/atv conversion
 * @returns {object|null} - {hlookat, vlookat, fov} or null
 */
function captureKrpanoConfig() {
  let krpanoConfig = null;
  if (typeof getKrpanoViewFromUI === "function") {
    krpanoConfig = getKrpanoViewFromUI();
    if (krpanoConfig) {
      console.log(`📐 Captured krpano config: h=${krpanoConfig.hlookat}, v=${krpanoConfig.vlookat}, fov=${krpanoConfig.fov}`);
    }
  }
  return krpanoConfig;
}

/**
 * Convert free drawing points to simplified polygon preserving shape
 * Uses uniform sampling to maintain curves and shapes
 * @param {Array} points - Array of {x, y} points
 * @param {number} targetPoints - Target number of points (default: 80)
 * @returns {Array} - Simplified array of {x, y} points
 */
function convertToPolygon(points, targetPoints = 80) {
  if (points.length <= targetPoints) return points;

  // Use uniform sampling to preserve shape better
  const step = Math.floor(points.length / targetPoints);
  const sampled = [];

  for (let i = 0; i < points.length; i += step) {
    sampled.push(points[i]);
  }

  // Always include the last point to close the shape
  if (sampled[sampled.length - 1] !== points[points.length - 1]) {
    sampled.push(points[points.length - 1]);
  }

  // Apply light smoothing with Douglas-Peucker if still too many points
  if (sampled.length > targetPoints * 1.5) {
    const bounds = getPointsBounds(sampled);
    const size = Math.max(bounds.width, bounds.height);
    const epsilon = size * 0.002; // Even smaller epsilon (0.2%) to preserve fine details
    return simplifyDouglasPeucker(sampled, epsilon);
  }

  return sampled;
}

/**
 * Douglas-Peucker line simplification algorithm
 * @param {Array} points - Array of {x, y} points
 * @param {number} epsilon - Tolerance value
 * @returns {Array} - Simplified array of {x, y} points
 */
function simplifyDouglasPeucker(points, epsilon) {
  if (points.length < 3) return points;

  // Find point with maximum distance
  let maxDist = 0;
  let index = 0;
  const end = points.length - 1;

  for (let i = 1; i < end; i++) {
    const dist = perpendicularDistance(points[i], points[0], points[end]);
    if (dist > maxDist) {
      maxDist = dist;
      index = i;
    }
  }

  // If max distance is greater than epsilon, recursively simplify
  if (maxDist > epsilon) {
    const left = simplifyDouglasPeucker(points.slice(0, index + 1), epsilon);
    const right = simplifyDouglasPeucker(points.slice(index), epsilon);
    return left.slice(0, -1).concat(right);
  } else {
    return [points[0], points[end]];
  }
}

/**
 * Calculate perpendicular distance from point to line
 * @param {object} point - {x, y} point
 * @param {object} lineStart - {x, y} start of line
 * @param {object} lineEnd - {x, y} end of line
 * @returns {number} - Perpendicular distance
 */
function perpendicularDistance(point, lineStart, lineEnd) {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;

  const numerator = Math.abs(dy * point.x - dx * point.y + lineEnd.x * lineStart.y - lineEnd.y * lineStart.x);
  const denominator = Math.sqrt(dx * dx + dy * dy);

  return numerator / denominator;
}

/**
 * Get bounding box of points
 * @param {Array} points - Array of {x, y} points
 * @returns {object} - {minX, maxX, minY, maxY, width, height}
 */
function getPointsBounds(points) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  };
}

/**
 * Create bounding box from polygon points
 * @param {Array} polygon - Array of {x, y} points in canvas coordinates
 * @param {HTMLElement} canvas - Canvas element
 * @param {DOMRect} canvasRect - Canvas bounding rect
 * @param {object} krpanoConfig - Krpano view config (optional, will be fetched if not provided)
 */
function createPolygonBoundingBox(polygon, canvas, canvasRect, krpanoConfig = null) {
  // Normalize points relative to canvas with high precision
  const normalizedVertices = polygon.map((p) => ({
    x: p.x / canvas.offsetWidth,
    y: p.y / canvas.offsetHeight,
  }));

  const color = "#9C27B0"; // Purple
  const label = `Free Draw (${polygon.length}pts)`;
  const score = 1.0;

  // Use passed config or fetch from UI as fallback
  if (!krpanoConfig && typeof getKrpanoViewFromUI === "function") {
    krpanoConfig = getKrpanoViewFromUI();
    console.log(
      `📐 Using current krpano config: h=${krpanoConfig?.hlookat}, v=${krpanoConfig?.vlookat}, fov=${krpanoConfig?.fov}`
    );
  }

  // Create polygon overlay with captured config
  drawPolygonOverlay(normalizedVertices, label, score, color, canvas, krpanoConfig);

  // Save state for undo and update modern list
  saveStateForUndo();
  if (typeof updateModernBoundingBoxList === "function") {
    updateModernBoundingBoxList();
  }
}

/**
 * Create an instruction overlay for drawing modes
 * @param {string} text - Instruction text or HTML
 * @param {DOMRect} canvasRect - Canvas bounding rect
 * @param {string} bgColor - Background color (CSS)
 * @returns {HTMLElement} - Instruction overlay element
 */
function createDrawingInstruction(text, canvasRect, bgColor) {
  const instruction = document.createElement("div");
  if (text.includes("<")) {
    instruction.innerHTML = text;
  } else {
    instruction.textContent = text;
  }
  Object.assign(instruction.style, {
    position: "fixed",
    top: canvasRect.top + 20 + "px",
    left: canvasRect.left + 20 + "px",
    padding: "10px 20px",
    backgroundColor: bgColor,
    color: "white",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "bold",
    zIndex: "999999",
    pointerEvents: "none",
  });
  return instruction;
}
