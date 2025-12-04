/**
 * Element Finder Helper Module
 * Utility functions for finding DOM elements in the VR360 viewer
 */

/**
 * Find the VR canvas element
 * @returns {HTMLCanvasElement|null} - Canvas element or null if not found
 */
function findCanvasElement() {
  // Try to find krpano canvas
  const krpanoCanvas = document.querySelector("#krpanoContainer canvas");
  if (krpanoCanvas) return krpanoCanvas;

  // Try to find any large canvas
  const canvases = document.querySelectorAll("canvas");
  for (const canvas of canvases) {
    if (canvas.offsetWidth > 500 && canvas.offsetHeight > 300) {
      return canvas;
    }
  }

  return null;
}

/**
 * Find the krpano container element
 * @returns {HTMLElement|null} - Container element or null if not found
 */
function findKrpanoContainer() {
  return document.querySelector("#krpanoContainer") || findCanvasElement()?.parentElement;
}

/**
 * Find bounding box overlay container
 * @returns {HTMLElement|null} - Overlay container or null if not found
 */
function findOverlayContainer() {
  return document.getElementById("vr-auto-polygon-overlay");
}

/**
 * Create or get overlay container for bounding boxes
 * @returns {HTMLElement} - Overlay container element
 */
function getOrCreateOverlayContainer() {
  let overlay = findOverlayContainer();

  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "vr-auto-polygon-overlay";
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1000;
    `;

    const container = findKrpanoContainer();
    if (container) {
      container.style.position = "relative";
      container.appendChild(overlay);
    } else {
      document.body.appendChild(overlay);
    }
  }

  return overlay;
}
