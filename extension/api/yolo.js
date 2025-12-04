// YOLOv12 API Detection Module

async function detectWithYOLO(base64Image, apiUrl) {
  // Require ngrok URL (localhost won't work due to CSP restrictions)
  if (!apiUrl || apiUrl.trim() === '') {
    throw new Error('NGROK_URL_REQUIRED: Please enter your Ngrok URL.\n\nLocalhost URLs are blocked by the website\'s Content Security Policy (CSP).\n\nYou must use your Ngrok public URL.');
  }
  
  // Clean up the URL
  apiUrl = apiUrl.trim();
  
  // Use hybrid endpoint for better detection (YOLO + OpenCV for frames)
  if (!apiUrl.endsWith('/detect/hybrid') && !apiUrl.endsWith('/detect')) {
    apiUrl = apiUrl.replace(/\/$/, '') + '/detect/hybrid';
  } else if (apiUrl.endsWith('/detect')) {
    // Switch to hybrid endpoint
    apiUrl = apiUrl.replace('/detect', '/detect/hybrid');
  }
  
  console.log('⚡ Calling YOLO Hybrid API:', apiUrl);
  
  // Convert base64 to blob
  const byteCharacters = atob(base64Image);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'image/jpeg' });
  
  const sizeKB = Math.round(blob.size / 1024);
  console.log(`📦 Sending image: ${sizeKB}KB`);
  
  // Create form data
  const formData = new FormData();
  formData.append('image', blob, 'screenshot.jpg');
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      let errorText = await response.text();
      let errorJson;
      
      try {
        errorJson = JSON.parse(errorText);
      } catch (e) {
        // Not JSON, keep as text
      }
      
      console.error('YOLO API Error:', response.status, errorText);
      
      if (response.status === 404) {
        throw new Error('YOLO API endpoint not found. Make sure the server is running on the correct URL.');
      } else if (response.status === 500) {
        throw new Error('YOLO API server error: ' + (errorJson?.error || errorText));
      } else {
        throw new Error('YOLO API Error: ' + (errorJson?.message || errorText || response.statusText));
      }
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Unknown error from YOLO API');
    }
    
    console.log('YOLO Hybrid API Response:', result);
    console.log(`Detection method: ${result.detection_method || 'hybrid'}`);
    
    // Get image dimensions from the response
    const imageWidth = result.image_size.width;
    const imageHeight = result.image_size.height;
    
    // Convert YOLO detections to the format expected by displayDetectedObjects
    // Format: { name, score, boundingPoly: { normalizedVertices } }
    const detectedObjects = result.detections.map(detection => {
      // Convert bbox to normalized vertices (0-1 range)
      const normalizedVertices = [
        { x: detection.bbox.x1 / imageWidth, y: detection.bbox.y1 / imageHeight }, // top-left
        { x: detection.bbox.x2 / imageWidth, y: detection.bbox.y1 / imageHeight }, // top-right
        { x: detection.bbox.x2 / imageWidth, y: detection.bbox.y2 / imageHeight }, // bottom-right
        { x: detection.bbox.x1 / imageWidth, y: detection.bbox.y2 / imageHeight }  // bottom-left
      ];
      
      return {
        name: detection.class,
        score: detection.confidence,
        boundingPoly: {
          normalizedVertices: normalizedVertices
        }
      };
    });
    
    console.log(`YOLO detected ${detectedObjects.length} objects`);
    return detectedObjects;
    
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Cannot connect to YOLO API. Make sure:\n\n' +
                     '1. The Python server is running (python app.py)\n' +
                     '2. Server is accessible at: ' + apiUrl + '\n' +
                     '3. Check console for connection errors\n\n' +
                     'Original error: ' + error.message);
    }
    throw error;
  }
}

// Test connection to YOLO API
async function testYOLOConnection(apiUrl) {
  if (!apiUrl || apiUrl.trim() === '') {
    throw new Error('Ngrok URL is required');
  }
  
  // Clean and remove /detect if present to get base URL
  apiUrl = apiUrl.trim().replace(/\/detect$/, '');
  
  try {
    const response = await fetch(apiUrl + '/health');
    if (response.ok) {
      const data = await response.json();
      console.log('YOLO API Health Check:', data);
      return {
        status: 'healthy',
        data: data
      };
    } else {
      return {
        status: 'error',
        message: 'Health check failed: ' + response.statusText
      };
    }
  } catch (error) {
    return {
      status: 'error',
      message: 'Cannot connect: ' + error.message
    };
  }
}
