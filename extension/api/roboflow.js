// Roboflow API Detection Module

async function detectWithRoboflow(base64Image, apiKey) {
  // IMPORTANT: You need a PRIVATE API key from Roboflow
  // Get it from: https://app.roboflow.com/settings/api → "Private API Key" section
  // Publishable keys only work with inferencejs library, not direct API calls
  
  // Parse the API key input (user might provide full URL or just key)
  let apiUrl;
  let actualApiKey;
  
  if (apiKey.includes('detect.roboflow.com')) {
    // User provided full URL
    apiUrl = apiKey;
  } else if (apiKey.includes('/')) {
    // User provided workspace/model/version format
    const parts = apiKey.split('?api_key=');
    const modelPath = parts[0];
    actualApiKey = parts[1] || '';
    apiUrl = `https://detect.roboflow.com/${modelPath}?api_key=${actualApiKey}`;
  } else {
    // Assume just API key provided, use Microsoft COCO model
    actualApiKey = apiKey;
    // Use Roboflow's public Microsoft COCO dataset model
    apiUrl = `https://detect.roboflow.com/microsoft-coco/3?api_key=${actualApiKey}`;
  }
  
  console.log('Calling Roboflow API:', apiUrl.replace(actualApiKey || apiKey, '***'));
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: base64Image
  });
  
  if (!response.ok) {
    let errorText = await response.text();
    let errorJson;
    
    try {
      errorJson = JSON.parse(errorText);
    } catch (e) {
      // Not JSON, keep as text
    }
    
    console.error('Roboflow API Error:', response.status, errorText);
    
    // Check for specific error messages
    if (errorText.includes('over quota') || errorText.includes('quota')) {
      throw new Error(`QUOTA_EXCEEDED: ${errorJson?.message || errorText}`);
    } else if (errorText.includes('Forbidden') && !errorText.includes('quota')) {
      throw new Error(`FORBIDDEN: ${errorJson?.message || errorText}`);
    } else {
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
  }
  
  const data = await response.json();
  console.log('Full Roboflow Response:', data);
  
  const predictions = data.predictions || [];
  const imageWidth = data.image?.width || window.innerWidth;
  const imageHeight = data.image?.height || window.innerHeight;
  const confidenceThreshold = 0.20; // Lower threshold to detect more objects (20%)
  
  const filteredPredictions = predictions.filter(p => p.confidence >= confidenceThreshold);
  
  console.log(`✅ Roboflow: Found ${filteredPredictions.length} objects (threshold: ${confidenceThreshold})`);
  
  // Convert to standard format
  return filteredPredictions.map(prediction => {
    const centerX = prediction.x / imageWidth;
    const centerY = prediction.y / imageHeight;
    const width = prediction.width / imageWidth;
    const height = prediction.height / imageHeight;
    
    return {
      name: prediction.class,
      score: prediction.confidence,
      boundingPoly: {
        normalizedVertices: [
          { x: centerX - width / 2, y: centerY - height / 2 }, // Top-left
          { x: centerX + width / 2, y: centerY - height / 2 }, // Top-right
          { x: centerX + width / 2, y: centerY + height / 2 }, // Bottom-right
          { x: centerX - width / 2, y: centerY + height / 2 }  // Bottom-left
        ]
      }
    };
  });
}

// Export for use in content.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { detectWithRoboflow };
}
