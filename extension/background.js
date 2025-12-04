/**
 * Background service worker for VR-360 Object Detector
 * Handles Chrome APIs that can only be called from background context
 */

// Import login refresh module
importScripts("api-vr360/login-refresh.js");

// Start login auto-refresh when background script loads
if (self.loginRefresh) {
  self.loginRefresh.start();
}

// Intercept API requests to capture Bearer token and cookies
chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    // Look for profile API request or any authenticated API call
    if (details.url.includes("smarttravel-vr.mobifone.vn/vr-api/")) {
      console.log("🔍 Intercepted API request:", details.url);

      let bearerToken = null;
      let cookieString = null;

      // Extract Bearer token and Cookie header from request headers
      if (details.requestHeaders) {
        for (const header of details.requestHeaders) {
          if (header.name.toLowerCase() === "authorization" && header.value) {
            if (header.value.startsWith("Bearer ")) {
              bearerToken = header.value.substring(7); // Remove 'Bearer ' prefix
              console.log("✅ Captured Bearer token:", bearerToken.substring(0, 20) + "...");
            }
          }
          if (header.name.toLowerCase() === "cookie" && header.value) {
            cookieString = header.value;
            console.log("✅ Captured Cookie header:", cookieString.substring(0, 50) + "...");

            // Parse individual cookies
            const cookies = cookieString.split("; ").map((c) => {
              const [name, ...valueParts] = c.split("=");
              return { name, value: valueParts.join("=") };
            });
            console.log("Parsed cookies:", cookies.length, "cookies");
            console.log("Cookie names:", cookies.map((c) => c.name).join(", "));
          }
        }
      }

      // Store the authentication data if we have token or cookies
      if (bearerToken || cookieString) {
        // Get existing data first to merge
        chrome.storage.local.get(["bearerToken", "cookies"], (existing) => {
          chrome.storage.local.set(
            {
              bearerToken: bearerToken || existing.bearerToken,
              cookies: cookieString || existing.cookies,
              lastCaptured: new Date().toISOString(),
            },
            () => {
              console.log("💾 Saved authentication data to storage");

              // Notify ALL tabs with the content script that auth data is available
              chrome.tabs.query({ url: "https://smarttravel-vr.mobifone.vn/*" }, (tabs) => {
                tabs.forEach((tab) => {
                  chrome.tabs
                    .sendMessage(tab.id, {
                      action: "authDataCaptured",
                      bearerToken: bearerToken || existing.bearerToken,
                      cookies: cookieString || existing.cookies,
                    })
                    .catch(() => {
                      // Ignore if content script not ready
                    });
                });
              });
            }
          );
        });
      }
    }
  },
  { urls: ["https://smarttravel-vr.mobifone.vn/vr-api/*"] },
  ["requestHeaders", "extraHeaders"]
);

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "captureVisibleTab") {
    // Capture the visible area of the active tab
    chrome.tabs.captureVisibleTab(null, { format: "jpeg", quality: 80 }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        console.error("Screenshot capture error:", chrome.runtime.lastError);
        sendResponse({ error: chrome.runtime.lastError.message });
      } else {
        console.log("📸 Screenshot captured via Chrome API");
        sendResponse({ dataUrl: dataUrl });
      }
    });
    return true; // Keep message channel open for async response
  }

  if (request.action === "storeCookies") {
    console.log("📥 Received cookies from content script");

    // Get existing bearer token
    chrome.storage.local.get(["bearerToken"], (result) => {
      chrome.storage.local.set(
        {
          bearerToken: result.bearerToken || request.bearerToken,
          cookies: request.cookies,
          lastCaptured: new Date().toISOString(),
        },
        () => {
          console.log("💾 Saved cookies from content script");
          sendResponse({ status: "saved" });
        }
      );
    });
    return true;
  }

  // Handle manual login refresh request
  if (request.action === "refreshLoginToken") {
    console.log("🔄 Manual login refresh requested");
    if (self.loginRefresh) {
      self.loginRefresh.refresh().then((result) => {
        sendResponse(result);
      });
    } else {
      sendResponse({ success: false, error: "Login refresh module not loaded" });
    }
    return true;
  }

  // Handle start/stop auto-refresh
  if (request.action === "startLoginAutoRefresh") {
    if (self.loginRefresh) {
      self.loginRefresh.start();
      sendResponse({ status: "started" });
    }
    return true;
  }

  if (request.action === "stopLoginAutoRefresh") {
    if (self.loginRefresh) {
      self.loginRefresh.stop();
      sendResponse({ status: "stopped" });
    }
    return true;
  }
});

console.log("🚀 VR-360 Object Detector background script loaded");
