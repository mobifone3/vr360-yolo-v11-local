// Google Cloud Vision API Detection Module

async function detectWithGoogleVision(base64Image, apiKey) {
  const url = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
  const requestBody = {
    requests: [
      {
        image: {
          content: base64Image
        },
        features: [
          {
            type: 'OBJECT_LOCALIZATION',
            maxResults: 100,
            model: 'builtin/latest'
          }
        ]
      }
    ]
  };

  console.log('Calling Google Cloud Vision API...');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  const data = await response.json();
  console.log('Full API Response:', data);

  let detectedObjects = [];

  if (data.responses && data.responses[0]) {
    const responseData = data.responses[0];
    
    // Process object localization only
    if (responseData.localizedObjectAnnotations && responseData.localizedObjectAnnotations.length > 0) {
      const objects = responseData.localizedObjectAnnotations;
      const confidenceThreshold = 0.20; // Lower to 20% to detect more objects
      const filteredObjects = objects.filter(obj => obj.score >= confidenceThreshold);
      
      console.log(`✅ OBJECT_LOCALIZATION: Found ${filteredObjects.length} objects`);
      
      detectedObjects = filteredObjects.map(obj => ({
        name: obj.name,
        score: obj.score,
        boundingPoly: obj.boundingPoly
      }));
    } else {
      console.warn('❌ OBJECT_LOCALIZATION: No objects detected');
    }
  }
  
  return { objects: detectedObjects };
}

// Export for use in content.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { detectWithGoogleVision };
}
