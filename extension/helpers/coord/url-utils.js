/**
 * URL Utilities
 * Extract IDs and tokens from URL and storage
 */

/**
 * Extract scene_id from current URL
 * @returns {string|null} - Scene ID or null
 */
function extractSceneId() {
  const matches = [...window.location.pathname.matchAll(/\/scene\/([a-f0-9]+)/gi)];
  if (matches.length > 0) {
    const lastMatch = matches[matches.length - 1];
    console.log(`🔍 Found scene ID: ${lastMatch[1]}`);
    return lastMatch[1];
  }
  const params = new URLSearchParams(window.location.search);
  return params.get("scene_id") || null;
}

/**
 * Extract tour_id from current URL
 * @returns {string|null} - Tour ID or null
 */
function extractTourId() {
  const match = window.location.pathname.match(/\/editor\/([a-f0-9]+)/i);
  if (match && match[1]) return match[1];
  const params = new URLSearchParams(window.location.search);
  return params.get("tour_id") || null;
}

/**
 * Generate fake hotspot ID
 * @returns {string} - ID in format "fake-p_XXXXX"
 */
function generateFakeHotspotId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id = "fake-p_";
  for (let i = 0; i < 20; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

/**
 * Get authorization token from cookies or storage
 * @returns {string|null} - Bearer token or null
 */
function getAuthToken() {
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "panoee-studio-token") return value;
  }
  return localStorage.getItem("panoee-studio-token") || localStorage.getItem("authToken") || localStorage.getItem("token");
}
