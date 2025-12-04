/**
 * VR-360 Auto Polygon Extension - Main Content Script
 * Coordinates between popup, scene capture, detection APIs, and UI display
 */

// Store authentication data
let authData = {
  bearerToken: null,
  cookies: null,
};

// Capture cookies directly from document.cookie as fallback
function captureCookiesFromDocument() {
  const cookies = document.cookie;
  if (cookies) {
    console.log("📝 Captured cookies from document.cookie");
    authData.cookies = cookies;

    // Also save to storage
    chrome.storage.local.get(["bearerToken"], (result) => {
      chrome.storage.local.set({
        bearerToken: result.bearerToken || authData.bearerToken,
        cookies: cookies,
        lastCaptured: new Date().toISOString(),
      });
    });

    return cookies;
  }
  return null;
}

// Try to capture cookies on page load and send to background
setTimeout(() => {
  const cookies = captureCookiesFromDocument();
  if (cookies) {
    console.log("✅ Cookies available from document:", cookies.substring(0, 50) + "...");

    // Send cookies to background script for storage
    chrome.runtime.sendMessage(
      {
        action: "storeCookies",
        cookies: cookies,
      },
      (response) => {
        if (response && response.status === "saved") {
          console.log("✅ Cookies sent to background and saved");
        }
      }
    );
  } else {
    console.log("⚠️ No cookies found in document.cookie (may be HttpOnly)");
  }
}, 1000);

// Monitor network requests to ensure background script can intercept them
console.log("🔍 Content script ready - will monitor for API requests");

// Load stored authentication data on init
chrome.storage.local.get(["bearerToken", "cookies", "lastCaptured"], (result) => {
  if (result.bearerToken) {
    authData.bearerToken = result.bearerToken;
    authData.cookies = result.cookies;
    console.log("✅ Loaded authentication data from storage");
    console.log("🔑 Bearer token:", result.bearerToken.substring(0, 20) + "...");
    console.log("📅 Last captured:", result.lastCaptured);
  } else {
    console.log("⏳ Waiting for authentication data... (will be captured from API requests)");
  }
});

// ============================================
// VIEW STATE PRESERVATION (Ctrl+R to reload)
// ============================================

/**
 * Listen for Ctrl+R (reload) and save current view state
 */
let ctrlRPressed = false;

document.addEventListener("keydown", (e) => {
  // Check for Ctrl+R or Cmd+R (Mac)
  // Handle both 'r' and 'R'
  if ((e.ctrlKey || e.metaKey) && (e.key === "r" || e.key === "R")) {
    console.log("🔄 Ctrl+R detected - marking for save");
    ctrlRPressed = true;

    // Try to save immediately
    if (typeof saveViewStateBeforeReload === "function") {
      saveViewStateBeforeReload();
    } else {
      console.warn("⚠️ saveViewStateBeforeReload function not found");
    }
  }
});

/**
 * Save view state before page unload (backup method)
 * This catches all page reloads/navigations
 */
window.addEventListener("beforeunload", (e) => {
  console.log("📤 Page unloading - saving view state");

  if (typeof saveViewStateBeforeReload === "function") {
    saveViewStateBeforeReload();
  }

  // Don't prevent the reload
  // (we don't return anything)
});

/**
 * Restore view state after page loads
 * Use a delayed retry mechanism to ensure the React UI is ready
 */
function attemptViewStateRestoration(attempt = 1, maxAttempts = 15) {
  // Progressive delay: Start at 1s, then 1.5s, 2s, 2.5s, 3s, 3s, 3s...
  const delay = Math.min(500 + 500 * attempt, 3000);

  setTimeout(() => {
    console.log(`🔄 Attempting to restore view state (attempt ${attempt}/${maxAttempts}, delay: ${delay}ms)...`);

    // Check if the inputs are available in the DOM
    const hasHlookat = document.querySelector(".ant-input-prefix")?.textContent?.toLowerCase().includes("hlookat");
    const hasZoom = Array.from(document.querySelectorAll(".label")).some((l) => l.textContent.trim().toLowerCase() === "zoom");

    console.log(`   DOM check: hlookat=${hasHlookat}, zoom=${hasZoom}`);

    if (typeof restoreViewStateAfterReload === "function") {
      const restored = restoreViewStateAfterReload();

      if (restored) {
        console.log("✅ View state restoration successful");
        return;
      }
    } else {
      console.warn("⚠️ restoreViewStateAfterReload function not found");
    }

    // If restoration failed and we haven't hit max attempts, try again
    if (attempt < maxAttempts) {
      attemptViewStateRestoration(attempt + 1, maxAttempts);
    } else {
      console.log("⏹️ View state restoration max attempts reached");
      // Clean up saved state if we couldn't restore it
      localStorage.removeItem("vr360-extension-view-state");
    }
  }, delay);
}

// Start restoration attempts when page loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    console.log("📄 DOM Content Loaded - starting view state restoration");
    attemptViewStateRestoration(1);
  });
} else {
  // DOM already loaded
  console.log("📄 DOM already loaded - starting view state restoration");
  attemptViewStateRestoration(1);
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "captureScene") {
    console.log("Capturing VR-360 scene image...");
    // Show circle button when extension is triggered
    showCircleButton();
    captureSceneImage()
      .then((imageData) => {
        console.log("✅ Image captured successfully");
        sendResponse({ imageData: imageData });
      })
      .catch((error) => {
        console.error("❌ Error capturing scene:", error);
        const errorMsg = error.message || "Unknown error occurred";
        alert(`Failed to capture scene:\n\n${errorMsg}\n\nPlease check the console (F12) for more details.`);
        sendResponse({ error: errorMsg });
      });
    return true; // Keep channel open for async response
  }

  if (request.action === "detectObjects") {
    console.log("Received request to detect objects using:", request.method);

    // Route to appropriate detection handler
    switch (request.method) {
      case "yolo":
        handleYOLODetection(request.imageData, request.apiKey);
        break;
      case "tensorflow":
        handleTensorFlowDetection(request.imageData);
        break;
      case "roboflow":
        handleRoboflowDetection(request.imageData, request.apiKey);
        break;
      case "aws":
        handleAWSDetection(request.imageData, request.awsConfig);
        break;
      case "google":
      default:
        handleGoogleVisionDetection(request.imageData, request.apiKey);
        break;
    }

    sendResponse({ status: "started" });
  }

  if (request.action === "clearBoundingBoxes") {
    console.log("Clearing all bounding boxes...");
    clearAllBoundingBoxes();
    sendResponse({ status: "cleared" });
    return true;
  }

  if (request.action === "showToolbar") {
    console.log("Showing toolbar...");
    showCircleButton();
    sendResponse({ status: "shown" });
    return true;
  }

  if (request.action === "authDataCaptured") {
    authData.bearerToken = request.bearerToken;
    authData.cookies = request.cookies;
    sendResponse({ status: "updated" });
    return true;
  }

  // Handle cookie update from background script (login refresh)
  if (request.action === "updateLoginCookie") {
    console.log("🍪 Updating login cookie from background refresh...");
    if (request.token) {
      // Update the panoee-studio-token cookie in the page context
      document.cookie = `panoee-studio-token=${request.token}; path=/; secure; samesite=lax`;
      authData.bearerToken = request.token;
      console.log("✅ Login cookie updated successfully");
      sendResponse({ status: "updated" });
    } else {
      console.warn("⚠️ No token provided for cookie update");
      sendResponse({ status: "error", message: "No token provided" });
    }
    return true;
  }

  if (request.action === "getAuthData") {
    console.log("📤 Sending authentication data to popup");
    sendResponse({
      bearerToken: authData.bearerToken,
      cookies: authData.cookies,
    });
    return true;
  }

  return true;
});

/**
 * Clear all bounding boxes from the page
 */
function clearAllBoundingBoxes() {
  console.log("🗑️ Looking for bounding boxes to clear...");
  const boxes = document.querySelectorAll(".vr-auto-polygon-box");
  console.log(`Found ${boxes.length} box(es) with class 'vr-auto-polygon-box'`);
  boxes.forEach((box) => {
    console.log("Removing box:", box);
    box.remove();
  });

  console.log(`✓ Cleared ${boxes.length} bounding box(es)`);
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

// Start URL monitoring and cleaning (background job)
// This will automatically detect and clean URLs with repeated /editor/.../scene/ patterns
if (typeof startUrlMonitoring === "function") {
  startUrlMonitoring();
  console.log("✅ URL monitoring started - duplicate patterns will be cleaned automatically");
} else {
  console.warn("⚠️ URL cleaner not loaded - startUrlMonitoring function not found");
}

console.log("✅ VR-360 Auto Polygon content script loaded");
