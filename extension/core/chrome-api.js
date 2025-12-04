/**
 * Chrome API Module
 * Handles communication with Chrome extension APIs
 */

/**
 * Request screenshot from background script
 */
function captureVisibleTab() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { action: 'captureVisibleTab' }, 
      (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (response && response.dataUrl) {
          resolve(response.dataUrl);
        } else if (response && response.error) {
          reject(new Error(response.error));
        } else {
          reject(new Error('No screenshot data received'));
        }
      }
    );
  });
}
