/**
 * Scene Capture Module
 * Handles capturing VR-360 scenes from various sources (Canvas, SVG, WebGL)
 * NOTE: Main captureSceneImage() is now in scene-orchestrator.js
 * This file kept for backward compatibility with helper functions
 */

/**
 * Legacy function - replaced by scene-orchestrator.js
 * Keeping for reference and helper functions below
 */
async function legacyCaptureSceneImage() {
  console.log('🎬 Looking for VR-360 scene element...');
  
  const sceneElement = await findSceneElement();
  
  if (!sceneElement) {
    console.warn('⚠️ Could not find VR-360 scene element, falling back to document.body');
    console.warn('💡 TIP: Check SCENE_CAPTURE.md to add custom selectors');
  }
  
  const element = sceneElement || document.body;
  console.log('📸 Capturing scene image...');
  
  // Try primary capture method
  try {
    const imageData = await captureElement(element);
    if (imageData) {
      console.log('✅ Scene captured successfully');
      return imageData;
    }
  } catch (error) {
    console.error('❌ Scene capture failed:', error);
  }
  
  // Fallback 1: Try Chrome tab screenshot API
  console.log('🔄 Trying Chrome tab screenshot API...');
  try {
    const screenshotData = await captureVisibleTab();
    if (screenshotData) {
      console.log('✅ Screenshot captured via Chrome API');
      const croppedData = await cropImageToElement(screenshotData, element);
      return croppedData;
    }
  } catch (error) {
    console.warn('⚠️ Chrome screenshot API failed:', error);
  }
  
  // Fallback 2: Try any visible element
  return await captureAnyVisibleElement();
}

/**
 * Find the VR-360 scene element in the DOM
 * NOTE: This is duplicated in element-finder.js - using that version instead
 */
async function legacyFindSceneElement() {
  const selectors = [
    'svg',
    '#scene',
    '#viewer',
    '.scene-container',
    '.viewer-container',
    'canvas',
    '[class*="scene"]',
    '[class*="viewer"]',
    '[id*="scene"]',
    '[id*="viewer"]'
  ];
  
  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) continue;
    
    // Get the largest element
    const candidate = Array.from(elements).reduce((largest, current) => {
      const largestArea = largest.offsetWidth * largest.offsetHeight;
      const currentArea = current.offsetWidth * current.offsetHeight;
      return currentArea > largestArea ? current : largest;
    });
    
    if (candidate && candidate.offsetWidth > 500 && candidate.offsetHeight > 300) {
      const area = candidate.offsetWidth * candidate.offsetHeight;
      console.log(`✓ Found scene element using selector: ${selector}`);
      console.log(`  Element type: ${candidate.tagName.toLowerCase()}`);
      console.log(`  Dimensions: ${candidate.offsetWidth}x${candidate.offsetHeight} (${Math.round(area/1000)}K pixels)`);
      
      // If SVG, use immediately
      if (candidate.tagName.toLowerCase() === 'svg') {
        console.log('  ✅ Using SVG (most reliable)');
        return candidate;
      }
      
      // If canvas, keep looking for SVG
      if (candidate.tagName.toLowerCase() === 'canvas') {
        console.log('  ⚠️ Found canvas, but will keep looking for SVG...');
        continue;
      }
      
      return candidate;
    }
  }
  
  return null;
}

/**
 * Capture a specific DOM element
 */
async function captureElement(element) {
  if (element.tagName.toLowerCase() === 'canvas') {
    return await captureCanvas(element);
  }
  
  if (element.tagName.toLowerCase() === 'svg') {
    return await captureSVGElement(element);
  }
  
  // Fallback for other elements
  return await captureGenericElement(element);
}

/**
 * Capture canvas element (handles WebGL)
 */
async function captureCanvas(canvas) {
  console.log('📸 Capturing Canvas element...');
  console.log(`  Canvas element: ${canvas.width}x${canvas.height}`);
  console.log(`  Parent: ${canvas.parentElement?.id || 'no-id'}, ${canvas.parentElement?.className || 'no-class'}`);
  
  // Strategy: Try multiple methods in order of reliability for krpano
  
  // Method 1: Try to access krpano API directly
  if (window.krpanoJS) {
    console.log('🎯 krpano detected - trying krpano screenshot API...');
    try {
      const krpano = window.krpanoJS();
      if (krpano && krpano.screenshot) {
        const screenshot = krpano.screenshot();
        if (screenshot) {
          console.log('✅ Screenshot from krpano API');
          return screenshot;
        }
      }
    } catch (e) {
      console.warn('⚠️ krpano API failed:', e);
    }
  }
  
  // Method 2: Use Chrome tabs.captureVisibleTab
  console.log('🔄 Trying Chrome screenshot API...');
  try {
    await new Promise(resolve => setTimeout(resolve, 500)); // Wait for render
    const screenshotData = await captureVisibleTab();
    if (screenshotData && screenshotData.length > 10000) {
      console.log('✅ Screenshot captured via Chrome API');
      const croppedData = await cropImageToElement(screenshotData, canvas);
      
      if (!isCanvasBlank(croppedData)) {
        console.log('✅ Image verified - contains content');
        return croppedData;
      }
    }
  } catch (error) {
    console.error('❌ Chrome screenshot API failed:', error.message);
  }
  
  // Method 3: Try canvas.toDataURL with multiple attempts
  console.log('🔄 Trying direct canvas capture...');
  for (let attempt = 1; attempt <= 3; attempt++) {
    console.log(`  Attempt ${attempt}/3...`);
    await new Promise(resolve => setTimeout(resolve, 200 * attempt));
    
    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      if (!isCanvasBlank(dataUrl)) {
        const sizeKB = Math.round(dataUrl.length / 1024);
        console.log(`✅ Canvas captured on attempt ${attempt}: ${sizeKB}KB`);
        return dataUrl;
      }
    } catch (e) {
      console.warn(`  Attempt ${attempt} failed:`, e.message);
    }
  }
  
  // Last resort: Return a blank canvas with error message
  console.error('❌ All capture methods failed - canvas remains blank');
  throw new Error('Unable to capture WebGL canvas - all methods failed');
}

/**
 * Capture WebGL canvas using readPixels
 */
async function captureWebGLCanvas(canvas) {
  console.log('🎮 Attempting WebGL pixel readout...');
  
  try {
    // Check for Three.js and force render
    if (window.THREE) {
      console.log('  Detected Three.js - attempting renderer capture...');
      const renderers = [];
      
      if (window.renderer) renderers.push(window.renderer);
      if (window.scene && window.scene.renderer) renderers.push(window.scene.renderer);
      
      for (const renderer of renderers) {
        if (renderer && renderer.render && renderer.domElement === canvas) {
          console.log('  Found Three.js renderer - forcing render...');
          try {
            if (window.scene && window.camera) {
              renderer.render(window.scene, window.camera);
            }
          } catch (e) {
            console.warn('  Could not force render:', e);
          }
        }
      }
    }
    
    // Get WebGL context
    const gl = canvas.getContext('webgl') || 
               canvas.getContext('webgl2') || 
               canvas.getContext('experimental-webgl');
    
    if (!gl) {
      console.warn('⚠️ No WebGL context found on canvas');
      return null;
    }
    
    console.log(`  Canvas dimensions: ${canvas.width}x${canvas.height}`);
    
    // Create temp canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const ctx = tempCanvas.getContext('2d');
    
    // Read pixels from WebGL
    const pixels = new Uint8Array(canvas.width * canvas.height * 4);
    gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    
    // Analyze pixel data
    let nonZeroPixels = 0;
    let totalBrightness = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      const brightness = pixels[i] + pixels[i+1] + pixels[i+2];
      totalBrightness += brightness;
      if (brightness > 30) nonZeroPixels++;
    }
    const avgBrightness = totalBrightness / (pixels.length / 4) / 3;
    console.log(`  Pixel analysis: ${nonZeroPixels} non-black pixels, avg brightness: ${avgBrightness.toFixed(1)}`);
    
    if (avgBrightness < 5) {
      console.warn('⚠️ WebGL buffer appears mostly black - may be empty');
      return null;
    }
    
    // Create ImageData and flip vertically (WebGL origin is bottom-left)
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const srcIdx = (y * canvas.width + x) * 4;
        const dstIdx = ((canvas.height - 1 - y) * canvas.width + x) * 4;
        imageData.data[dstIdx] = pixels[srcIdx];
        imageData.data[dstIdx + 1] = pixels[srcIdx + 1];
        imageData.data[dstIdx + 2] = pixels[srcIdx + 2];
        imageData.data[dstIdx + 3] = pixels[srcIdx + 3];
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.8);
    
    const sizeKB = Math.round(dataUrl.length / 1024);
    console.log(`✅ WebGL canvas captured via readPixels: ${canvas.width}x${canvas.height}, ${sizeKB}KB`);
    
    // Debug: Download the captured image to verify content
    console.log('🔍 DEBUG: Click here to download captured image:', dataUrl.substring(0, 100) + '...');
    const debugLink = document.createElement('a');
    debugLink.href = dataUrl;
    debugLink.download = 'webgl-capture-debug.jpg';
    debugLink.textContent = '📥 Download captured image for debugging';
    debugLink.style.cssText = 'position:fixed;top:10px;right:10px;z-index:999999;background:red;color:white;padding:10px;font-weight:bold;';
    document.body.appendChild(debugLink);
    setTimeout(() => debugLink.remove(), 10000);
    
    return dataUrl;
  } catch (error) {
    console.warn('⚠️ WebGL pixel readout failed:', error);
    return null;
  }
}

/**
 * Capture SVG element
 */
function captureSVGElement(svgElement) {
  console.log('📸 Capturing SVG element...');
  
  return new Promise((resolve, reject) => {
    try {
      const bbox = svgElement.getBoundingClientRect();
      let width = Math.min(bbox.width, 1920);
      let height = Math.min(bbox.height, 1080);
      
      if (bbox.width > 1920 || bbox.height > 1080) {
        const scale = Math.min(1920 / bbox.width, 1080 / bbox.height);
        width = Math.floor(bbox.width * scale);
        height = Math.floor(bbox.height * scale);
        console.log(`  Resizing from ${bbox.width}x${bbox.height} to ${width}x${height}`);
      }
      
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
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        const sizeKB = Math.round(dataUrl.length / 1024);
        console.log(`✅ SVG captured: ${width}x${height}, ${sizeKB}KB`);
        
        URL.revokeObjectURL(url);
        resolve(dataUrl);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG as image'));
      };
      img.src = url;
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Capture generic element (fallback)
 */
async function captureGenericElement(element) {
  console.log('📸 Using generic element capture...');
  
  const bbox = element.getBoundingClientRect();
  const canvas = document.createElement('canvas');
  canvas.width = bbox.width;
  canvas.height = bbox.height;
  
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  console.warn('⚠️ Generic capture - may not capture actual content');
  return canvas.toDataURL('image/jpeg', 0.8);
}

/**
 * Request screenshot from background script
 */
function captureVisibleTab() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: 'captureVisibleTab' }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else if (response && response.dataUrl) {
        resolve(response.dataUrl);
      } else {
        reject(new Error('No screenshot data received'));
      }
    });
  });
}

/**
 * Crop screenshot to element bounds
 */
async function cropImageToElement(imageDataUrl, element) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const rect = element.getBoundingClientRect();
      console.log(`  Cropping to: left=${rect.left}, top=${rect.top}, width=${rect.width}, height=${rect.height}`);
      
      const canvas = document.createElement('canvas');
      canvas.width = rect.width;
      canvas.height = rect.height;
      const ctx = canvas.getContext('2d');
      
      // Show red border for 2 seconds to visualize capture area
      const debugDiv = document.createElement('div');
      debugDiv.style.cssText = `position:fixed;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;border:4px solid red;z-index:999999;pointer-events:none;box-sizing:border-box;`;
      document.body.appendChild(debugDiv);
      setTimeout(() => debugDiv.remove(), 2000);
      
      ctx.drawImage(
        img,
        rect.left, rect.top, rect.width, rect.height,
        0, 0, rect.width, rect.height
      );
      
      const croppedUrl = canvas.toDataURL('image/jpeg', 0.8);
      const sizeKB = Math.round(croppedUrl.length / 1024);
      console.log(`✅ Cropped image: ${rect.width}x${rect.height}, ${sizeKB}KB`);
      
      resolve(croppedUrl);
    };
    img.onerror = reject;
    img.src = imageDataUrl;
  });
}

/**
 * Last resort: capture any visible element
 */
async function captureAnyVisibleElement() {
  console.log('🔄 Trying fallback: looking for any large SVG or canvas...');
  
  const allSvgs = document.querySelectorAll('svg');
  const allCanvases = document.querySelectorAll('canvas');
  
  // Try SVGs
  for (const svg of allSvgs) {
    if (svg.offsetWidth > 300 && svg.offsetHeight > 300) {
      console.log(`🔄 Trying SVG: ${svg.offsetWidth}x${svg.offsetHeight}`);
      try {
        return await captureSVGElement(svg);
      } catch (e) {
        console.error('Failed:', e);
      }
    }
  }
  
  // Try canvases
  for (const canvas of allCanvases) {
    if (canvas.offsetWidth > 300 && canvas.offsetHeight > 300) {
      console.log(`🔄 Trying Canvas: ${canvas.offsetWidth}x${canvas.offsetHeight}`);
      try {
        const data = canvas.toDataURL('image/jpeg', 0.7);
        if (!isCanvasBlank(data)) {
          return data;
        }
      } catch (e) {
        console.error('Failed:', e);
      }
    }
  }
  
  throw new Error('Could not capture any scene element');
}

/**
 * Check if canvas is blank
 */
function isCanvasBlank(dataUrl) {
  return dataUrl.length < 1000;
}
