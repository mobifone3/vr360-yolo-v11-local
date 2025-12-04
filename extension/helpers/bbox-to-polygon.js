/**
 * Bounding Box to Polygon Converter Module
 * Handles conversion of bounding boxes to VR360 polygon format
 */

/**
 * Extract vertices from a bounding box container element
 * @param {HTMLElement} container - Bounding box container element
 * @param {HTMLElement} canvas - Canvas element for coordinate calculation
 * @returns {Array} - Array of normalized vertices [{x, y}, ...]
 */
function extractVerticesFromContainer(container, canvas) {
  // Check if container has stored vertices (polygon mode)
  if (container.dataset.vertices) {
    return JSON.parse(container.dataset.vertices);
  }

  // Extract from bounding box position
  const rect = container.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();
  const canvasWidth = canvas.offsetWidth;
  const canvasHeight = canvas.offsetHeight;

  // Calculate normalized coordinates relative to canvas
  const minX = (rect.left - canvasRect.left) / canvasWidth;
  const minY = (rect.top - canvasRect.top) / canvasHeight;
  const maxX = (rect.right - canvasRect.left) / canvasWidth;
  const maxY = (rect.bottom - canvasRect.top) / canvasHeight;

  console.log(`📐 Bounding box extraction:`);
  console.log(
    `  Container rect: left=${rect.left.toFixed(2)}, top=${rect.top.toFixed(2)}, right=${rect.right.toFixed(
      2
    )}, bottom=${rect.bottom.toFixed(2)}`
  );
  console.log(
    `  Canvas rect: left=${canvasRect.left.toFixed(2)}, top=${canvasRect.top.toFixed(
      2
    )}, width=${canvasWidth}, height=${canvasHeight}`
  );
  console.log(`  Normalized: minX=${minX.toFixed(3)}, minY=${minY.toFixed(3)}, maxX=${maxX.toFixed(3)}, maxY=${maxY.toFixed(3)}`);

  // Create vertices for rectangle (4 corners)
  return [
    { x: minX, y: minY },
    { x: maxX, y: minY },
    { x: maxX, y: maxY },
    { x: minX, y: maxY },
  ];
}

/**
 * Get krpano configuration from container or UI
 * @param {HTMLElement} container - Bounding box container element
 * @returns {object|null} - Krpano config {hlookat, vlookat, fov} or null
 */
function getKrpanoConfigFromContainer(container) {
  let krpanoConfig = null;

  // Priority: stored config > current UI config
  if (container.dataset.krpanoConfig) {
    try {
      krpanoConfig = JSON.parse(container.dataset.krpanoConfig);
      console.log(
        `  ✅ Using stored krpano config: h=${krpanoConfig.hlookat}, v=${krpanoConfig.vlookat}, fov=${krpanoConfig.fov}`
      );
    } catch (e) {
      console.warn("Failed to parse stored krpano config:", e);
    }
  }

  if (!krpanoConfig && typeof getKrpanoViewFromUI === "function") {
    krpanoConfig = getKrpanoViewFromUI();
    console.log(
      `  ⚠️ Using current UI config (box may have been created at different view): h=${krpanoConfig?.hlookat}, v=${krpanoConfig?.vlookat}, fov=${krpanoConfig?.fov}`
    );
  }

  return krpanoConfig;
}

/**
 * Prepare polygon data from bounding box container
 * @param {HTMLElement} container - Bounding box container element
 * @returns {object} - Polygon data ready for API {points, title, scene_id}
 */
function prepareBoundingBoxForAPI(container) {
  // Extract scene ID from URL
  const sceneId = extractSceneId();
  if (!sceneId) {
    throw new Error("Could not extract scene_id from URL");
  }

  // Get label from container
  const label = container.dataset.label || "polygon";

  // Find canvas for coordinate conversion
  const canvas = findCanvasElement();
  if (!canvas) {
    throw new Error("Canvas element not found");
  }

  // Extract vertices from container
  const vertices = extractVerticesFromContainer(container, canvas);

  // Get krpano config
  const krpanoConfig = getKrpanoConfigFromContainer(container);

  // Convert to spherical coordinates
  const points = convertBoundingBoxToPolygon(vertices, canvas, krpanoConfig);

  return {
    points: points,
    title: label,
    scene_id: sceneId,
  };
}

/**
 * Get all bounding box containers on page
 * @returns {NodeList} - List of bounding box container elements
 */
function getAllBoundingBoxContainers() {
  return document.querySelectorAll(".vr-auto-polygon-box");
}

/**
 * Apply visual feedback to container
 * @param {HTMLElement} container - Bounding box container element
 * @param {string} type - 'success' or 'error'
 */
function applyVisualFeedback(container, type) {
  if (type === "success") {
    container.style.border = "3px solid #4CAF50";
    setTimeout(() => {
      container.style.border = `3px solid ${container.dataset.color}`;
    }, 500);
  } else if (type === "error") {
    container.style.border = "3px solid #f44336";
  }
}

/**
 * Store hotspot ID in container for future deletion
 * @param {HTMLElement} container - Bounding box container element
 * @param {string} hotspotId - Hotspot ID from API response
 */
function storeHotspotIdInContainer(container, hotspotId) {
  container.dataset.hotspotId = hotspotId;
}
