/**
 * Canvas Capture Module
 * Handles various methods to capture canvas elements including WebGL
 */

/**
 * Main canvas capture coordinator - tries multiple methods
 */
async function captureCanvas(canvas) {
  console.log('📸 Capturing Canvas element...');
  console.log(`  Canvas: ${canvas.width}x${canvas.height}`);
  console.log(`  Parent: ${canvas.parentElement?.id || 'no-id'}`);
  
  // Try methods in order of reliability
  const methods = [
    tryKrpanoAPI,
    tryChromeScreenshot,
    tryDirectCanvasCapture
  ];
  
  for (const method of methods) {
    try {
      const result = await method(canvas);
      if (result && !isCanvasBlank(result)) {
        return result;
      }
    } catch (error) {
      console.warn(`Method ${method.name} failed:`, error.message);
    }
  }
  
  throw new Error('All canvas capture methods failed');
}

/**
 * Method 1: Try krpano API
 */
async function tryKrpanoAPI(canvas) {
  if (!window.krpanoJS) return null;
  
  console.log('🎯 Trying krpano API...');
  const krpano = window.krpanoJS();
  
  if (krpano && krpano.screenshot) {
    const screenshot = krpano.screenshot();
    if (screenshot) {
      console.log('✅ krpano API success');
      return screenshot;
    }
  }
  
  return null;
}

/**
 * Method 2: Chrome screenshot with crop
 */
async function tryChromeScreenshot(canvas) {
  console.log('🔄 Trying Chrome screenshot...');
  
  // Wait for render
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const screenshotData = await captureVisibleTab();
  if (!screenshotData || screenshotData.length < 10000) {
    throw new Error('Screenshot too small or empty');
  }
  
  console.log(`  Screenshot captured: ${Math.round(screenshotData.length/1024)}KB`);
  
  const croppedData = await cropToCanvas(screenshotData, canvas);
  
  if (!isCanvasBlank(croppedData)) {
    console.log('✅ Chrome screenshot success');
    return croppedData;
  }
  
  return null;
}

/**
 * Method 3: Direct canvas.toDataURL with retries
 */
async function tryDirectCanvasCapture(canvas) {
  console.log('🔄 Trying direct canvas capture...');
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    console.log(`  Attempt ${attempt}/3...`);
    
    // Progressive delay
    await new Promise(resolve => setTimeout(resolve, 200 * attempt));
    
    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      
      if (!isCanvasBlank(dataUrl)) {
        const sizeKB = Math.round(dataUrl.length / 1024);
        console.log(`✅ Direct capture success (attempt ${attempt}): ${sizeKB}KB`);
        return dataUrl;
      }
    } catch (e) {
      console.warn(`  Attempt ${attempt} error:`, e.message);
    }
  }
  
  return null;
}

/**
 * Crop screenshot to canvas bounds
 */
async function cropToCanvas(screenshotDataUrl, canvas) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const rect = canvas.getBoundingClientRect();
      console.log(`  Cropping to: ${rect.left},${rect.top} ${rect.width}x${rect.height}`);
      
      // Visual debug indicator
      showDebugBorder(rect);
      
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = rect.width;
      tempCanvas.height = rect.height;
      const ctx = tempCanvas.getContext('2d');
      
      ctx.drawImage(
        img,
        rect.left, rect.top, rect.width, rect.height,
        0, 0, rect.width, rect.height
      );
      
      const croppedUrl = tempCanvas.toDataURL('image/jpeg', 0.8);
      console.log(`  Cropped: ${Math.round(croppedUrl.length/1024)}KB`);
      
      resolve(croppedUrl);
    };
    
    img.onerror = reject;
    img.src = screenshotDataUrl;
  });
}

/**
 * Show red border to visualize capture area
 */
function showDebugBorder(rect) {
  const debugDiv = document.createElement('div');
  debugDiv.style.cssText = `
    position: fixed;
    left: ${rect.left}px;
    top: ${rect.top}px;
    width: ${rect.width}px;
    height: ${rect.height}px;
    border: 4px solid red;
    z-index: 999999;
    pointer-events: none;
    box-sizing: border-box;
  `;
  document.body.appendChild(debugDiv);
  setTimeout(() => debugDiv.remove(), 2000);
}

/**
 * Check if image is blank/empty
 */
function isCanvasBlank(dataUrl) {
  return !dataUrl || dataUrl.length < 1000;
}
