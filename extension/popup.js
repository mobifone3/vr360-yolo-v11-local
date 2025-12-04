document.addEventListener('DOMContentLoaded', () => {
  const detectionMethodSelect = document.getElementById('detectionMethod');
  const apiKeySection = document.getElementById('apiKeySection');
  const apiKeyInput = document.getElementById('apiKey');
  const apiKeyLabel = document.getElementById('apiKeyLabel');
  const apiKeyHelp = document.getElementById('apiKeyHelp');
  const showToolbarBtn = document.getElementById('showToolbarBtn');
  const detectBtn = document.getElementById('detectBtn');
  const clearBtn = document.getElementById('clearBtn');
  const statusDiv = document.getElementById('status');
  const authStatusDiv = document.getElementById('authStatus');

  // Load and display authentication status
  function updateAuthStatus() {
    chrome.storage.local.get(['bearerToken', 'cookies', 'lastCaptured'], (result) => {
      if (result.bearerToken) {
        const token = result.bearerToken;
        const tokenPreview = token.substring(0, 15) + '...' + token.substring(token.length - 15);
        const timeAgo = result.lastCaptured ? new Date(result.lastCaptured).toLocaleString() : 'Unknown';
        
        // Count cookies if available
        let cookieCount = 0;
        if (result.cookies) {
          cookieCount = result.cookies.split('; ').length;
        }
        
        authStatusDiv.innerHTML = `
          <strong style="color: #4CAF50;">Authenticated</strong><br>
          Token: <code style="font-size: 9px;">${tokenPreview}</code><br>
          Cookies: ${result.cookies ? `${cookieCount} cookies captured` : 'Not found'}<br>
          Last: ${timeAgo}
        `;
      } else {
        authStatusDiv.innerHTML = `
          <strong style="color: #FF9800;">Waiting...</strong><br>
          <span style="font-size: 10px;">Navigate to any page on smarttravel-vr.mobifone.vn<br>to capture authentication data</span>
        `;
      }
    });
  }
  
  // Update auth status on load
  updateAuthStatus();
  
  // Refresh auth status every 2 seconds
  setInterval(updateAuthStatus, 2000);

  // Update UI based on detection method
  function updateUIForMethod(method) {
    if (method === 'tensorflow') {
      apiKeySection.style.display = 'none';
    } else {
      apiKeySection.style.display = 'block';
      
      if (method === 'roboflow') {
        apiKeyLabel.textContent = 'Roboflow PRIVATE API Key:';
        apiKeyHelp.innerHTML = '⚠️ Need PRIVATE key (not Publishable)<br>Get it: <a href=\"https://app.roboflow.com/settings/api\" target=\"_blank\">roboflow.com/settings/api</a> → \"Private API Key\" section';
      } else if (method === 'aws') {
        apiKeyLabel.textContent = 'AWS Configuration:';
        apiKeyHelp.innerHTML = '⚠️ AWS requires backend setup<br>Use Roboflow or Google instead for browser-based detection';
      } else if (method === 'google') {
        apiKeyLabel.textContent = 'Google Cloud Vision API Key:';
        apiKeyHelp.innerHTML = 'Get your key from <a href=\"https://console.cloud.google.com/apis/credentials\" target=\"_blank\">Google Cloud Console</a>';
      }
    }
  }

  // Show/hide API key field based on detection method
  detectionMethodSelect.addEventListener('change', (e) => {
    updateUIForMethod(e.target.value);
  });
  
  // Initialize with YOLO as default
  updateUIForMethod('yolo');

  // Show Toolbar button
  showToolbarBtn.addEventListener('click', () => {
    statusDiv.textContent = 'Showing toolbar...';
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        statusDiv.textContent = 'Error: No active tab';
        return;
      }
      
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'showToolbar'
      }, (response) => {
        if (chrome.runtime.lastError) {
          statusDiv.textContent = 'Error: Refresh the page and try again.';
          return;
        }
        statusDiv.textContent = 'Toolbar shown!';
      });
    });
  });

  // Load saved API keys
  chrome.storage.sync.get(['googleCloudApiKey', 'roboflowApiKey', 'yoloApiUrl'], (result) => {
    const method = detectionMethodSelect.value;
    if (method === 'yolo' && result.yoloApiUrl) {
      apiKeyInput.value = result.yoloApiUrl;
    } else if (method === 'google' && result.googleCloudApiKey) {
      apiKeyInput.value = result.googleCloudApiKey;
    } else if (method === 'roboflow' && result.roboflowApiKey) {
      apiKeyInput.value = result.roboflowApiKey;
    }
  });
  
  // Load appropriate key when method changes
  detectionMethodSelect.addEventListener('change', (e) => {
    const method = e.target.value;
    chrome.storage.sync.get(['googleCloudApiKey', 'roboflowApiKey', 'yoloApiUrl'], (result) => {
      if (method === 'yolo' && result.yoloApiUrl) {
        apiKeyInput.value = result.yoloApiUrl;
      } else if (method === 'google' && result.googleCloudApiKey) {
        apiKeyInput.value = result.googleCloudApiKey;
      } else if (method === 'roboflow' && result.roboflowApiKey) {
        apiKeyInput.value = result.roboflowApiKey;
      } else if (method === 'aws') {
        apiKeyInput.value = 'AWS requires backend setup';
      } else {
        apiKeyInput.value = '';
      }
    });
  });

  detectBtn.addEventListener('click', () => {
    const method = detectionMethodSelect.value;
    const apiKey = apiKeyInput.value.trim();
    
    if ((method === 'google' || method === 'roboflow' || method === 'yolo') && !apiKey) {
      statusDiv.textContent = method === 'yolo' ? 'Please enter your Ngrok URL.' : 'Please enter an API Key.';
      return;
    }
    
    if (method === 'aws') {
      statusDiv.textContent = 'AWS requires backend setup. Use Roboflow or Google instead.';
      return;
    }

    // Save API key/URL based on method
    if (method === 'yolo') {
      chrome.storage.sync.set({ yoloApiUrl: apiKey });
    } else if (method === 'google') {
      chrome.storage.sync.set({ googleCloudApiKey: apiKey });
    } else if (method === 'roboflow') {
      chrome.storage.sync.set({ roboflowApiKey: apiKey });
    }

    statusDiv.textContent = 'Capturing scene...';

    // Send request to content script to capture SVG/canvas
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        statusDiv.textContent = 'Error: No active tab';
        return;
      }
      
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'captureScene'
      }, (response) => {
        if (chrome.runtime.lastError) {
          statusDiv.textContent = 'Error: Refresh the page and try again.';
          return;
        }
        
        if (!response || !response.imageData) {
          statusDiv.textContent = 'Error: Could not capture scene image';
          return;
        }

        statusDiv.textContent = 'Processing...';

        // Send detection request with captured scene image
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'detectObjects',
          imageData: response.imageData,
          method: method,
          apiKey: apiKey
        }, (detectResponse) => {
          if (chrome.runtime.lastError) {
            statusDiv.textContent = 'Error sending to page. Try again.';
          } else {
            if (method === 'yolo') {
              statusDiv.textContent = 'Calling YOLOv12 API...';
            } else if (method === 'tensorflow') {
              statusDiv.textContent = 'Running TensorFlow.js detection...';
            } else if (method === 'roboflow') {
              statusDiv.textContent = 'Calling Roboflow API...';
            } else if (method === 'aws') {
              statusDiv.textContent = 'AWS detection started...';
            } else if (method === 'google') {
              statusDiv.textContent = 'Calling Google Vision API...';
            } else {
              statusDiv.textContent = 'Request sent to page.';
            }
          }
        });
      });
    });
  });

  clearBtn.addEventListener('click', () => {
    console.log('Clear button clicked');
    statusDiv.textContent = 'Clearing bounding boxes...';
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        statusDiv.textContent = 'Error: No active tab';
        console.error('No active tab found');
        return;
      }
      
      console.log('Sending clearBoundingBoxes message to tab:', tabs[0].id);
      
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'clearBoundingBoxes'
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Chrome runtime error:', chrome.runtime.lastError);
          statusDiv.textContent = 'Error: ' + chrome.runtime.lastError.message;
          return;
        }
        
        console.log('Clear response received:', response);
        
        if (response && response.status === 'cleared') {
          statusDiv.textContent = 'All bounding boxes cleared!';
        } else {
          statusDiv.textContent = 'Cleared.';
        }
      });
    });
  });
});