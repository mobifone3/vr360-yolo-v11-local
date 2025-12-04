/**
 * VR360 Polygon API Module
 * Handles creating and deleting polygons via the VR360 API
 *
 * Dependencies:
 * - helpers/coordinate-converter.js (getAuthToken, generateFakeHotspotId, extractSceneId)
 * - helpers/bbox-to-polygon.js (prepareBoundingBoxForAPI, getAllBoundingBoxContainers, applyVisualFeedback, storeHotspotIdInContainer)
 */

// API Configuration
const POLYGON_API_CONFIG = {
  baseUrl: "https://smarttravel-vr.mobifone.vn/vr-api/api/hotspot",
  endpoints: {
    create: "/create",
    delete: "/delete",
    update: "/update",
  },
};

/**
 * Create a polygon hotspot via VR360 API
 * @param {object} polygonData - Polygon configuration
 * @returns {Promise<object>} - API response
 */
async function createPolygonHotspot(polygonData) {
  const {
    points, // Array of {ath, atv} points
    title, // Polygon title
    scene_id, // Scene ID
    id, // Fake hotspot ID (optional)
  } = polygonData;

  // Validate input
  validatePolygonData(points, scene_id);

  // Get auth token
  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication token not found. Please log in.");
  }

  // Generate fake ID if not provided
  const hotspotId = id || generateFakeHotspotId();

  // Prepare payload
  const payload = buildCreatePayload(hotspotId, title, scene_id, points);

  console.log("📤 Creating polygon hotspot:", payload);
  console.log(`📐 Sending ${payload.polygon_config.points.length} points with 6 decimal precision`);
  // Log first 3 points as sample
  payload.polygon_config.points.slice(0, 3).forEach((p, i) => {
    console.log(`   Point[${i}]: ath=${p.ath}, atv=${p.atv}`);
  });

  // Send API request
  const apiUrl = `${POLYGON_API_CONFIG.baseUrl}${POLYGON_API_CONFIG.endpoints.create}`;
  return await sendApiRequest(apiUrl, "POST", token, payload);
}

/**
 * Validate polygon data before API call
 * @param {Array} points - Polygon points
 * @param {string} sceneId - Scene ID
 * @throws {Error} - If validation fails
 */
function validatePolygonData(points, sceneId) {
  if (!points || points.length < 3) {
    throw new Error("Polygon must have at least 3 points");
  }
  if (!sceneId) {
    throw new Error("scene_id is required");
  }
}

/**
 * Build create payload for API
 * @param {string} hotspotId - Hotspot ID
 * @param {string} title - Polygon title
 * @param {string} sceneId - Scene ID
 * @param {Array} points - Polygon points
 * @returns {object} - API payload
 */
function buildCreatePayload(hotspotId, title, sceneId, points) {
  // Format points with high precision (6 decimal places) for accurate polygon rendering
  const highPrecisionPoints = points.map((p) => ({
    ath: parseFloat(p.ath.toFixed(6)),
    atv: parseFloat(p.atv.toFixed(6)),
  }));

  return {
    id: hotspotId,
    ath: 0,
    atv: 0,
    type: "image",
    title: title || "polygon",
    scene_id: sceneId,
    polygon: true,
    polygon_config: {
      points: highPrecisionPoints,
    },
  };
}

/**
 * Send API request with error handling
 * @param {string} url - API URL
 * @param {string} method - HTTP method
 * @param {string} token - Auth token
 * @param {object} payload - Request body
 * @returns {Promise<object>} - API response
 */
async function sendApiRequest(url, method, token, payload) {
  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log(`✅ ${method} request successful:`, result);
    return result;
  } catch (error) {
    console.error(`❌ ${method} request failed:`, error);
    throw error;
  }
}

/**
 * Delete a polygon hotspot via VR360 API
 * @param {string} hotspotId - Hotspot ID to delete
 * @returns {Promise<object>} - API response
 */
async function deletePolygonHotspot(hotspotId) {
  if (!hotspotId) {
    throw new Error("hotspotId is required");
  }

  // Get auth token
  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication token not found. Please log in.");
  }

  // Prepare payload
  const payload = { id: hotspotId };

  console.log("📤 Deleting polygon hotspot:", hotspotId);

  // Send API request
  const apiUrl = `${POLYGON_API_CONFIG.baseUrl}${POLYGON_API_CONFIG.endpoints.delete}`;
  return await sendApiRequest(apiUrl, "DELETE", token, payload);
}

/**
 * Update polygon name/title via VR360 API
 * @param {string} hotspotId - Hotspot ID to update
 * @param {string} newTitle - New title for the polygon
 * @returns {Promise<object>} - API response
 */
async function updatePolygonName(hotspotId, newTitle) {
  if (!hotspotId) {
    throw new Error("hotspotId is required");
  }

  if (!newTitle || typeof newTitle !== "string") {
    throw new Error("newTitle is required and must be a string");
  }

  // Get auth token
  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication token not found. Please log in.");
  }

  // Prepare payload
  const payload = {
    id: hotspotId,
    title: newTitle,
  };

  console.log("📤 Updating polygon name:", hotspotId, "→", newTitle);

  // Send API request to update endpoint
  const apiUrl = `${POLYGON_API_CONFIG.baseUrl}/update`;
  return await sendApiRequest(apiUrl, "PUT", token, payload);
}

/**
 * Create polygon from bounding box container element
 * Uses helper functions from bbox-to-polygon.js
 * @param {HTMLElement} container - Bounding box container element
 * @returns {Promise<object>} - API response
 */
async function createPolygonFromBoundingBox(container) {
  try {
    // Prepare polygon data using helper
    const polygonData = prepareBoundingBoxForAPI(container);

    // Create polygon via API
    const result = await createPolygonHotspot(polygonData);

    // Store hotspot ID in container for future deletion
    storeHotspotIdInContainer(container, result.data.id);

    return result;
  } catch (error) {
    console.error("Failed to create polygon from bounding box:", error);
    throw error;
  }
}

/**
 * Create all polygons from all bounding boxes on page
 * @returns {Promise<Array>} - Array of API responses
 */
async function createAllPolygons() {
  const containers = getAllBoundingBoxContainers();

  if (containers.length === 0) {
    alert("No bounding boxes found. Please detect objects or draw polygons first.");
    return [];
  }

  console.log(`📦 Creating ${containers.length} polygons...`);

  const results = [];
  const errors = [];

  for (const container of containers) {
    try {
      const result = await createPolygonFromBoundingBox(container);
      results.push(result);
      console.log(`✅ Created polygon ${results.length}/${containers.length}`);

      // Visual feedback
      applyVisualFeedback(container, "success");
    } catch (error) {
      console.error("Error creating polygon:", error);
      errors.push({ container, error });

      // Visual feedback for error
      applyVisualFeedback(container, "error");
    }
  }

  // Show summary
  showCreationSummary(results.length, errors.length);

  return results;
}

/**
 * Show summary alert after polygon creation
 * @param {number} successCount - Number of successful creations
 * @param {number} errorCount - Number of failed creations
 */
function showCreationSummary(successCount, errorCount) {
  if (successCount > 0) {
    alert(`✅ Successfully created ${successCount} polygon(s)!\n${errorCount > 0 ? `\n⚠️ Failed: ${errorCount}` : ""}`);
  } else {
    alert("❌ Failed to create any polygons. Check console for details.");
  }
}
