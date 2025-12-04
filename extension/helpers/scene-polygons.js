/**
 * Scene Polygons Manager
 * Fetches existing polygons from the VR360 API and stores them in localStorage
 * Persists polygon data (including ath/atv coordinates) for type change operations
 * Does NOT display polygons automatically - display is triggered by user action
 */

// LocalStorage key prefix for scene polygons
const STORAGE_KEY_PREFIX = "vr360_scene_polygons_";

// Global storage for scene polygons (loaded from localStorage or API)
let loadedScenePolygons = [];
let isScenePolygonsLoaded = false;
let currentSceneId = null;

/**
 * Get localStorage key for current scene
 * @param {string} sceneId - Scene ID
 * @returns {string} - Storage key
 */
function getStorageKey(sceneId) {
  return `${STORAGE_KEY_PREFIX}${sceneId}`;
}

/**
 * Save polygons to localStorage
 * @param {string} sceneId - Scene ID
 * @param {Array} polygons - Polygon data array
 */
function savePolygonsToStorage(sceneId, polygons) {
  try {
    const storageData = {
      sceneId,
      polygons,
      timestamp: Date.now(),
    };
    localStorage.setItem(getStorageKey(sceneId), JSON.stringify(storageData));
    console.log(`💾 Saved ${polygons.length} polygons to localStorage for scene ${sceneId}`);
  } catch (error) {
    console.error("❌ Error saving polygons to localStorage:", error);
  }
}

/**
 * Load polygons from localStorage
 * @param {string} sceneId - Scene ID
 * @returns {Array|null} - Polygon data or null if not found/expired
 */
function loadPolygonsFromStorage(sceneId) {
  try {
    const stored = localStorage.getItem(getStorageKey(sceneId));
    if (!stored) return null;

    const data = JSON.parse(stored);

    // Check if data is older than 24 hours (optional cache expiry)
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    if (Date.now() - data.timestamp > maxAge) {
      console.log(`⏰ Cached polygons for scene ${sceneId} expired, will refresh`);
      localStorage.removeItem(getStorageKey(sceneId));
      return null;
    }

    console.log(`📂 Loaded ${data.polygons.length} polygons from localStorage for scene ${sceneId}`);
    return data.polygons;
  } catch (error) {
    console.error("❌ Error loading polygons from localStorage:", error);
    return null;
  }
}

/**
 * Fetch all polygons for current scene from API
 * @returns {Promise<Array>} - Array of polygon hotspots
 */
async function fetchScenePolygonsFromAPI() {
  try {
    const sceneId = extractSceneId();
    if (!sceneId) {
      console.warn("⚠️ Could not extract scene ID from URL");
      return [];
    }

    const token = getAuthToken();
    if (!token) {
      console.warn("⚠️ No authentication token available");
      return [];
    }

    const apiUrl = `https://smarttravel-vr.mobifone.vn/vr-api/api/hotspot/gets?limit=1000&page=1&scene_id=${sceneId}`;

    console.log(`🔄 Fetching polygons for scene ${sceneId} from API...`);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error ${response.status}`);
    }

    const result = await response.json();
    const polygons = result.data?.docs?.filter((doc) => doc.polygon && doc.polygon_config?.points) || [];

    console.log(`✅ Fetched ${polygons.length} polygons from API`);
    return polygons;
  } catch (error) {
    console.error("❌ Error fetching scene polygons from API:", error);
    return [];
  }
}

/**
 * Fetch scene polygons - tries localStorage first, then API
 * @param {boolean} forceRefresh - Force fetch from API
 * @returns {Promise<Array>} - Array of polygon hotspots
 */
async function fetchScenePolygons(forceRefresh = false) {
  const sceneId = extractSceneId();
  if (!sceneId) {
    console.warn("⚠️ Could not extract scene ID from URL");
    return [];
  }

  currentSceneId = sceneId;

  // Try localStorage first (unless force refresh)
  if (!forceRefresh) {
    const cachedPolygons = loadPolygonsFromStorage(sceneId);
    if (cachedPolygons && cachedPolygons.length > 0) {
      loadedScenePolygons = cachedPolygons;
      isScenePolygonsLoaded = true;
      return cachedPolygons;
    }
  }

  // Fetch from API
  const polygons = await fetchScenePolygonsFromAPI();

  // Save to localStorage
  if (polygons.length > 0) {
    savePolygonsToStorage(sceneId, polygons);
  }

  loadedScenePolygons = polygons;
  isScenePolygonsLoaded = true;
  return polygons;
}

/**
 * Get stored scene polygons
 * @returns {Array} - Stored polygon data
 */
function getStoredScenePolygons() {
  // If not loaded in memory, try localStorage
  if (loadedScenePolygons.length === 0 && currentSceneId) {
    const cached = loadPolygonsFromStorage(currentSceneId);
    if (cached) {
      loadedScenePolygons = cached;
    }
  }
  return loadedScenePolygons;
}

/**
 * Check if scene polygons are loaded
 * @returns {boolean}
 */
function areScenePolygonsLoaded() {
  return isScenePolygonsLoaded;
}

/**
 * Refresh scene polygons from API (force refresh)
 * @returns {Promise<Array>}
 */
async function refreshScenePolygons() {
  return await fetchScenePolygons(true); // Force refresh from API
}

/**
 * Display stored scene polygons as bounding box overlays
 * Called when user clicks the icon to show polygons
 * @returns {number} - Number of polygons displayed
 */
function displayStoredScenePolygons() {
  if (loadedScenePolygons.length === 0) {
    console.log("ℹ️ No stored polygons to display");
    return 0;
  }

  // Find canvas
  const canvas = document.querySelector("#krpanoContainer canvas") || document.querySelector("canvas");
  if (!canvas) {
    console.error("Canvas not found");
    return 0;
  }

  // Get current view config
  let viewConfig = getViewConfig();

  console.log(`📐 Rendering ${loadedScenePolygons.length} scene polygons...`);

  let displayedCount = 0;

  loadedScenePolygons.forEach((polygon, index) => {
    const points = polygon.polygon_config?.points;
    if (!points || points.length < 3) {
      console.warn(`Polygon ${index} has invalid points`);
      return;
    }

    // Check if this polygon is already displayed
    const existingContainer = document.querySelector(`[data-hotspot-id="${polygon.id}"]`);
    if (existingContainer) {
      console.log(`Polygon ${polygon.id} already displayed, skipping`);
      return;
    }

    // Convert sphere coordinates to screen coordinates
    const screenVertices = convertPolygonToScreenVertices(points, viewConfig);

    if (screenVertices.length >= 3) {
      // Create display overlay for existing polygon
      const color = getPolygonTypeColor(polygon.type || "image");
      const label = polygon.title || `Polygon ${index + 1}`;

      // Draw polygon overlay with scene polygon data
      drawPolygonOverlay(screenVertices, label, 1.0, color, canvas, null, true, polygon);

      displayedCount++;
      console.log(`✓ Rendered polygon: ${label}`);
    }
  });

  return displayedCount;
}

/**
 * Get color based on polygon type
 */
function getPolygonTypeColor(type) {
  const colors = {
    image: "#667eea",
    video: "#e91e63",
    link: "#00bcd4",
    article: "#ff9800",
    point: "#4caf50",
  };
  return colors[type] || "#667eea";
}

/**
 * Silently load scene polygons on page ready
 * Tries localStorage first, then API if needed
 */
function initScenePolygons() {
  setTimeout(async () => {
    const sceneId = extractSceneId();
    if (!sceneId) return;

    currentSceneId = sceneId;

    // Try localStorage first
    const cachedPolygons = loadPolygonsFromStorage(sceneId);
    if (cachedPolygons && cachedPolygons.length > 0) {
      loadedScenePolygons = cachedPolygons;
      isScenePolygonsLoaded = true;
      console.log(`📦 Loaded ${loadedScenePolygons.length} cached scene polygons from localStorage`);
    } else {
      // Fetch from API and save to localStorage
      loadedScenePolygons = await fetchScenePolygonsFromAPI();
      isScenePolygonsLoaded = true;
      if (loadedScenePolygons.length > 0) {
        savePolygonsToStorage(sceneId, loadedScenePolygons);
      }
      console.log(`📦 Fetched and cached ${loadedScenePolygons.length} scene polygons`);
    }
  }, 2000);
}

// Auto-init when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initScenePolygons);
} else {
  initScenePolygons();
}

/**
 * Update stored scene polygon after type change
 * Also persists to localStorage
 * @param {string} oldId - Original polygon ID (deleted)
 * @param {object} newPolygonData - New polygon data from API
 */
function updateStoredScenePolygon(oldId, newPolygonData) {
  // Find and replace the old polygon data
  const index = loadedScenePolygons.findIndex((p) => p.id === oldId);
  if (index !== -1) {
    loadedScenePolygons[index] = newPolygonData;
    console.log(`📝 Updated stored polygon: ${oldId} → ${newPolygonData.id}`);
  } else {
    // If not found (shouldn't happen), add the new one
    loadedScenePolygons.push(newPolygonData);
    console.log(`📝 Added new polygon to store: ${newPolygonData.id}`);
  }

  // Persist to localStorage
  if (currentSceneId) {
    savePolygonsToStorage(currentSceneId, loadedScenePolygons);
  }
}

/**
 * Remove polygon from stored list
 * Also persists to localStorage
 * @param {string} polygonId - Polygon ID to remove
 */
function removeStoredScenePolygon(polygonId) {
  const index = loadedScenePolygons.findIndex((p) => p.id === polygonId);
  if (index !== -1) {
    loadedScenePolygons.splice(index, 1);
    console.log(`🗑️ Removed polygon from store: ${polygonId}`);

    // Persist to localStorage
    if (currentSceneId) {
      savePolygonsToStorage(currentSceneId, loadedScenePolygons);
    }
  }
}

/**
 * Add new polygon to stored list
 * Also persists to localStorage
 * @param {object} polygonData - Polygon data from API
 */
function addStoredScenePolygon(polygonData) {
  // Check if already exists
  const exists = loadedScenePolygons.find((p) => p.id === polygonData.id);
  if (!exists) {
    loadedScenePolygons.push(polygonData);
    console.log(`➕ Added new polygon to store: ${polygonData.id}`);

    // Persist to localStorage
    if (currentSceneId) {
      savePolygonsToStorage(currentSceneId, loadedScenePolygons);
    }
  }
}

/**
 * Get polygon by ID from stored list
 * @param {string} polygonId - Polygon ID
 * @returns {object|null} - Polygon data or null
 */
function getStoredPolygonById(polygonId) {
  return loadedScenePolygons.find((p) => p.id === polygonId) || null;
}

/**
 * Clear cached polygons for current scene
 */
function clearScenePolygonsCache() {
  if (currentSceneId) {
    localStorage.removeItem(getStorageKey(currentSceneId));
    loadedScenePolygons = [];
    isScenePolygonsLoaded = false;
    console.log(`🧹 Cleared polygon cache for scene ${currentSceneId}`);
  }
}

// Export for global access
window.getStoredScenePolygons = getStoredScenePolygons;
window.displayStoredScenePolygons = displayStoredScenePolygons;
window.refreshScenePolygons = refreshScenePolygons;
window.areScenePolygonsLoaded = areScenePolygonsLoaded;
window.updateStoredScenePolygon = updateStoredScenePolygon;
window.removeStoredScenePolygon = removeStoredScenePolygon;
window.addStoredScenePolygon = addStoredScenePolygon;
window.getStoredPolygonById = getStoredPolygonById;
window.clearScenePolygonsCache = clearScenePolygonsCache;
