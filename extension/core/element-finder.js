/**
 * Element Finder Module
 * Locates VR-360 scene elements in the DOM
 */

/**
 * Find the main VR-360 scene element
 */
async function findSceneElement() {
  const selectors = [
    'canvas',                       // Most common for VR viewers
    '#krpanoContainer canvas',      // krpano specific
    'svg',
    '#scene',
    '#viewer',
    '.scene-container',
    '.viewer-container',
    '[class*="scene"]',
    '[class*="viewer"]',
    '[id*="scene"]',
    '[id*="viewer"]'
  ];
  
  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) continue;
    
    // Find largest element
    const candidate = findLargestElement(elements);
    
    if (isValidSceneElement(candidate)) {
      logFoundElement(candidate, selector);
      return candidate;
    }
  }
  
  return null;
}

/**
 * Find the largest element from a list
 */
function findLargestElement(elements) {
  return Array.from(elements).reduce((largest, current) => {
    const largestArea = largest.offsetWidth * largest.offsetHeight;
    const currentArea = current.offsetWidth * current.offsetHeight;
    return currentArea > largestArea ? current : largest;
  });
}

/**
 * Check if element is a valid scene element
 */
function isValidSceneElement(element) {
  return element && 
         element.offsetWidth > 500 && 
         element.offsetHeight > 300;
}

/**
 * Log information about found element
 */
function logFoundElement(element, selector) {
  const area = element.offsetWidth * element.offsetHeight;
  console.log(`✓ Found scene element: ${selector}`);
  console.log(`  Type: ${element.tagName.toLowerCase()}`);
  console.log(`  Size: ${element.offsetWidth}x${element.offsetHeight} (${Math.round(area/1000)}K px)`);
}
