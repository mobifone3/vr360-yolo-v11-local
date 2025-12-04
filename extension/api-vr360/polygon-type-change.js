/**
 * Polygon Type Change API Module
 * Handles changing polygon type via delete → create → update flow
 *
 * Since the update API only updates config, not the type field,
 * we need to: 1) Delete old polygon, 2) Create new with new type, 3) Update config if needed
 */

const TYPE_CHANGE_API_CONFIG = {
  baseUrl: "https://smarttravel-vr.mobifone.vn/vr-api/api/hotspot",
  endpoints: {
    create: "/create",
    update: "/update",
    delete: "/delete",
  },
};

/**
 * Change polygon type (complete flow: delete → create → update)
 * @param {object} polygonData - Original polygon data from scene
 * @param {string} newType - New type: 'image', 'video', 'link', 'article', 'point'
 * @returns {Promise<object>} - New polygon data
 */
async function changePolygonType(polygonData, newType) {
  const oldId = polygonData.id;
  const sceneId = polygonData.scene || polygonData.scene_id;

  console.log(`🔄 Changing polygon ${oldId} type from "${polygonData.type}" to "${newType}"`);

  // Get auth token
  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication token not found. Please log in.");
  }

  try {
    // Step 1: Delete old polygon
    console.log("📤 Step 1: Deleting old polygon...");
    await deletePolygonForTypeChange(oldId, token);
    console.log("✅ Old polygon deleted");

    // Step 2: Create new polygon with new type
    console.log("📤 Step 2: Creating new polygon with new type...");
    const newPolygon = await createPolygonWithType(polygonData, newType, sceneId, token);
    console.log("✅ New polygon created:", newPolygon.data.id);

    // Step 3: Update config if original had config (preserve article, style, etc.)
    if (polygonData.config && Object.keys(polygonData.config).length > 0) {
      console.log("📤 Step 3: Updating polygon config...");
      await updatePolygonConfig(newPolygon.data.id, polygonData.config, token);
      console.log("✅ Config updated");
    }

    console.log(`🎉 Successfully changed polygon type to "${newType}"`);
    return newPolygon;
  } catch (error) {
    console.error("❌ Failed to change polygon type:", error);
    throw error;
  }
}

/**
 * Delete polygon (internal use for type change)
 */
async function deletePolygonForTypeChange(polygonId, token) {
  const response = await fetch(`${TYPE_CHANGE_API_CONFIG.baseUrl}${TYPE_CHANGE_API_CONFIG.endpoints.delete}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json;charset=UTF-8",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ id: polygonId }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Delete failed: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

/**
 * Create polygon with specific type (internal use for type change)
 */
async function createPolygonWithType(originalData, newType, sceneId, token) {
  // Generate new ID
  const newId = generateFakeHotspotId();

  // Build payload preserving all original polygon data
  const payload = {
    id: newId,
    ath: originalData.ath || 0,
    atv: originalData.atv || 0,
    type: newType, // New type!
    title: originalData.title || "polygon",
    scene_id: sceneId,
    polygon: true,
    polygon_config: originalData.polygon_config,
  };

  // Add optional fields if they exist
  if (originalData.width) payload.width = originalData.width;
  if (originalData.height) payload.height = originalData.height;
  if (originalData.description) payload.description = originalData.description;

  console.log("📦 Create payload:", payload);

  const response = await fetch(`${TYPE_CHANGE_API_CONFIG.baseUrl}${TYPE_CHANGE_API_CONFIG.endpoints.create}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json;charset=UTF-8",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Create failed: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

/**
 * Update polygon config (internal use for type change)
 */
async function updatePolygonConfig(polygonId, config, token) {
  const payload = {
    id: polygonId,
    config: config,
  };

  const response = await fetch(`${TYPE_CHANGE_API_CONFIG.baseUrl}${TYPE_CHANGE_API_CONFIG.endpoints.update}`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json;charset=UTF-8",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Update config failed: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

/**
 * Bulk change polygon types
 * @param {Array} polygons - Array of {polygonData, newType}
 * @returns {Promise<object>} - Results summary
 */
async function bulkChangePolygonTypes(polygons) {
  const results = {
    success: [],
    failed: [],
  };

  for (const { polygonData, newType } of polygons) {
    try {
      const result = await changePolygonType(polygonData, newType);
      results.success.push({
        oldId: polygonData.id,
        newId: result.data.id,
        newType: newType,
      });
    } catch (error) {
      results.failed.push({
        id: polygonData.id,
        error: error.message,
      });
    }
  }

  console.log(`📊 Bulk type change complete: ${results.success.length} success, ${results.failed.length} failed`);
  return results;
}

// Export to window for global access
if (typeof window !== "undefined") {
  window.changePolygonType = changePolygonType;
  window.bulkChangePolygonTypes = bulkChangePolygonTypes;
}
