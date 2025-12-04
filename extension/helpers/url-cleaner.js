/**
 * URL Cleaner Helper
 * Handles cleaning and rewriting URLs with repeated patterns
 * Specifically for VR-360 Editor URLs that may have duplicate /editor/.../scene/ segments
 */

/**
 * Detects if a URL has repeated /editor/.../scene/ pattern
 * @param {string} url - The URL to check
 * @returns {boolean} - True if the pattern repeats
 */
function hasRepeatedPattern(url) {
  // Pattern: /editor/{id}/tour-editor/scene/{sceneId}
  const pattern = /\/editor\/[^/]+\/tour-editor\/scene\/[^/]+/g;
  const matches = url.match(pattern);
  return matches && matches.length > 1;
}

/**
 * Extracts the last scene information from a URL with repeated patterns
 * @param {string} url - The URL to clean
 * @returns {object|null} - Object with editorId, sceneId, and remaining path, or null if no pattern found
 */
function extractLastSceneInfo(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    // Pattern: /editor/{editorId}/tour-editor/scene/{sceneId}
    const pattern = /\/editor\/([^/]+)\/tour-editor\/scene\/([^/]+)/g;
    const matches = [...pathname.matchAll(pattern)];

    if (matches.length === 0) {
      return null;
    }

    // Get the last match
    const lastMatch = matches[matches.length - 1];
    const editorId = lastMatch[1];
    const sceneId = lastMatch[2];

    // Get everything after the last scene pattern
    const lastMatchEnd = lastMatch.index + lastMatch[0].length;
    const remainingPath = pathname.substring(lastMatchEnd);

    return {
      editorId,
      sceneId,
      remainingPath,
      originalUrl: url,
      baseUrl: urlObj.origin,
    };
  } catch (error) {
    console.error("Error parsing URL:", error);
    return null;
  }
}

/**
 * Cleans a URL by removing duplicate /editor/.../scene/ patterns
 * and keeping only the last occurrence
 * @param {string} url - The URL to clean
 * @returns {string} - The cleaned URL
 */
function cleanUrl(url) {
  if (!hasRepeatedPattern(url)) {
    return url;
  }

  const sceneInfo = extractLastSceneInfo(url);
  if (!sceneInfo) {
    return url;
  }

  // Reconstruct the clean URL
  const cleanPath = `/editor/${sceneInfo.editorId}/tour-editor/scene/${sceneInfo.sceneId}${sceneInfo.remainingPath}`;
  const cleanUrl = `${sceneInfo.baseUrl}${cleanPath}`;

  console.log("🧹 URL cleaned:", {
    original: url,
    cleaned: cleanUrl,
    editorId: sceneInfo.editorId,
    sceneId: sceneInfo.sceneId,
  });

  return cleanUrl;
}

/**
 * Starts monitoring URL changes and rewrites them if needed
 * This should be called as a background job
 */
function startUrlMonitoring() {
  console.log("🔍 URL monitoring started");

  // Monitor URL changes using History API
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  // Override pushState
  history.pushState = function (...args) {
    const url = args[2];
    if (url && hasRepeatedPattern(url)) {
      const cleanedUrl = cleanUrl(url);
      args[2] = cleanedUrl;
      console.log("🔄 Intercepted pushState - URL cleaned");
    }
    return originalPushState.apply(this, args);
  };

  // Override replaceState
  history.replaceState = function (...args) {
    const url = args[2];
    if (url && hasRepeatedPattern(url)) {
      const cleanedUrl = cleanUrl(url);
      args[2] = cleanedUrl;
      console.log("🔄 Intercepted replaceState - URL cleaned");
    }
    return originalReplaceState.apply(this, args);
  };

  // Monitor popstate events (back/forward navigation)
  window.addEventListener("popstate", () => {
    const currentUrl = window.location.href;
    if (hasRepeatedPattern(currentUrl)) {
      const cleanedUrl = cleanUrl(currentUrl);
      history.replaceState(null, "", cleanedUrl);
      console.log("🔄 Back/Forward navigation - URL cleaned");
    }
  });

  // Check current URL on page load
  if (hasRepeatedPattern(window.location.href)) {
    const cleanedUrl = cleanUrl(window.location.href);
    history.replaceState(null, "", cleanedUrl);
    console.log("🔄 Initial page load - URL cleaned");
  }

  // Monitor URL changes every 500ms as a fallback
  // (in case React Router bypasses History API somehow)
  let lastUrl = window.location.href;
  setInterval(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      if (hasRepeatedPattern(currentUrl)) {
        const cleanedUrl = cleanUrl(currentUrl);
        if (cleanedUrl !== currentUrl) {
          history.replaceState(null, "", cleanedUrl);
          console.log("🔄 Polling detected dirty URL - cleaned");
        }
      }
    }
  }, 500);
}

/**
 * Parse the current URL to extract editor and scene IDs
 * Useful for API calls
 * @returns {object|null} - Object with editorId and sceneId, or null if not found
 */
function getCurrentSceneInfo() {
  const url = window.location.href;
  const sceneInfo = extractLastSceneInfo(url);

  if (!sceneInfo) {
    return null;
  }

  return {
    editorId: sceneInfo.editorId,
    sceneId: sceneInfo.sceneId,
    path: sceneInfo.remainingPath,
  };
}

// Export functions for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    hasRepeatedPattern,
    extractLastSceneInfo,
    cleanUrl,
    startUrlMonitoring,
    getCurrentSceneInfo,
  };
}
