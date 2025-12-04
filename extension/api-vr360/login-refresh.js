/**
 * Login Auto-Refresh Module
 * Automatically refreshes login token every 30 minutes to maintain session
 *
 * This runs in the background service worker context
 */

const LOGIN_REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes in milliseconds
const LOGIN_API_URL = "https://smarttravel-vr.mobifone.vn/vr-api/api/auth/login";

const LOGIN_CREDENTIALS = {
  email: "hue.smarttravel@mobifone.vn",
  password: "hue@123456",
};

let refreshIntervalId = null;

/**
 * Refresh login token by calling the login API
 * @returns {Promise<{success: boolean, token?: string, error?: string}>}
 */
async function refreshLoginToken() {
  console.log("🔄 [LoginRefresh] Auto-refreshing login token...");

  try {
    const response = await fetch(LOGIN_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify(LOGIN_CREDENTIALS),
    });

    if (!response.ok) {
      throw new Error(`Login failed with status: ${response.status}`);
    }

    const data = await response.json();

    if (data.token) {
      // Save tokens to chrome storage
      await chrome.storage.local.set({
        bearerToken: data.token,
        refreshToken: data.refreshToken,
        lastLoginRefresh: new Date().toISOString(),
      });

      console.log("✅ [LoginRefresh] Token refreshed successfully");
      console.log("🔑 [LoginRefresh] New token:", data.token.substring(0, 30) + "...");

      // Notify all tabs to update their cookie
      notifyTabsToUpdateCookie(data.token);

      return { success: true, token: data.token };
    } else {
      throw new Error("No token in response");
    }
  } catch (error) {
    console.error("❌ [LoginRefresh] Failed to refresh token:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Notify all smarttravel-vr tabs to update the cookie
 * @param {string} token - The new token to set
 */
function notifyTabsToUpdateCookie(token) {
  chrome.tabs.query({ url: "https://smarttravel-vr.mobifone.vn/*" }, (tabs) => {
    tabs.forEach((tab) => {
      chrome.tabs
        .sendMessage(tab.id, {
          action: "updateLoginCookie",
          token: token,
        })
        .catch(() => {
          // Ignore if content script not ready
        });
    });
  });

  // Also update cookie via Chrome cookies API (more reliable)
  chrome.cookies.set(
    {
      url: "https://smarttravel-vr.mobifone.vn",
      name: "panoee-studio-token",
      value: token,
      path: "/",
      secure: true,
      sameSite: "lax",
    },
    (cookie) => {
      if (cookie) {
        console.log("🍪 [LoginRefresh] Cookie updated via Chrome API");
      } else {
        console.warn("⚠️ [LoginRefresh] Failed to set cookie via Chrome API");
      }
    }
  );
}

/**
 * Start the auto-refresh interval
 */
function startLoginAutoRefresh() {
  // Clear any existing interval
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
  }

  console.log(`⏰ [LoginRefresh] Starting auto-refresh (every ${LOGIN_REFRESH_INTERVAL / 60000} minutes)`);

  // Set up interval for future refreshes
  refreshIntervalId = setInterval(refreshLoginToken, LOGIN_REFRESH_INTERVAL);

  // Store interval start time
  chrome.storage.local.set({
    loginRefreshStarted: new Date().toISOString(),
  });
}

/**
 * Stop the auto-refresh interval
 */
function stopLoginAutoRefresh() {
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
    refreshIntervalId = null;
    console.log("⏹️ [LoginRefresh] Auto-refresh stopped");
  }
}

/**
 * Manually trigger a token refresh
 * @returns {Promise<{success: boolean, token?: string, error?: string}>}
 */
async function manualRefreshToken() {
  return await refreshLoginToken();
}

// Export for use in background.js
// Note: In service worker context, we use global scope
self.loginRefresh = {
  start: startLoginAutoRefresh,
  stop: stopLoginAutoRefresh,
  refresh: manualRefreshToken,
  INTERVAL: LOGIN_REFRESH_INTERVAL,
};
