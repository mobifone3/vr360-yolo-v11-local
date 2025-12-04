/**
 * Scene Capture Orchestrator
 * Main coordinator for scene capture
 */

/**
 * Main entry point for scene capture
 */
async function captureSceneImage() {
  console.log('🎬 Starting scene capture...');
  
  // Find scene element
  const sceneElement = await findSceneElement();
  
  if (!sceneElement) {
    console.warn('⚠️ No scene element found, trying full viewport screenshot...');
    // Don't throw error, try full viewport immediately
    return await captureFullViewport();
  }
  
  // Capture based on element type
  try {
    const imageData = await captureByElementType(sceneElement);
    
    if (imageData && !isCanvasBlank(imageData)) {
      console.log('✅ Scene captured successfully');
      return imageData;
    }
    
    console.warn('⚠️ Captured image is blank, trying full viewport...');
    
  } catch (error) {
    console.error('❌ Capture failed:', error.message);
  }
  
  // Last resort: try full viewport screenshot
  return await captureFullViewport();
}

/**
 * Capture based on element type
 */
async function captureByElementType(element) {
  const tagName = element.tagName.toLowerCase();
  
  console.log(`📸 Capturing ${tagName} element...`);
  
  switch (tagName) {
    case 'canvas':
      return await captureCanvas(element);
    
    case 'svg':
      return await captureSVGElement(element);
    
    default:
      console.warn(`⚠️ Unsupported element type: ${tagName}`);
      return null;
  }
}

/**
 * Last resort: capture full viewport
 */
async function captureFullViewport() {
  console.log('🔄 Last resort: capturing full viewport...');
  
  try {
    // Wait a bit for page to render
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const screenshot = await captureVisibleTab();
    
    if (screenshot && screenshot.length > 10000) {
      console.log('✅ Full viewport captured successfully');
      console.log(`  Size: ${Math.round(screenshot.length/1024)}KB`);
      return screenshot;
    }
    
    console.error('❌ Screenshot too small:', screenshot ? screenshot.length : 0);
  } catch (error) {
    console.error('❌ Full viewport capture failed:', error.message);
    throw new Error(`Could not capture scene: ${error.message}`);
  }
  
  throw new Error('Could not capture scene: All capture methods failed');
}

/**
 * Capture SVG element
 */
async function captureSVGElement(svgElement) {
  console.log('📸 Capturing SVG...');
  
  return new Promise((resolve, reject) => {
    try {
      const bbox = svgElement.getBoundingClientRect();
      let width = Math.min(bbox.width, 1920);
      let height = Math.min(bbox.height, 1080);
      
      const clonedSvg = svgElement.cloneNode(true);
      clonedSvg.setAttribute('width', width);
      clonedSvg.setAttribute('height', height);
      
      const svgString = new XMLSerializer().serializeToString(clonedSvg);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG'));
      };
      
      img.src = url;
    } catch (error) {
      reject(error);
    }
  });
}
