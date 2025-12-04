/**
 * Keyboard Shortcuts Module
 * Handles keyboard shortcuts for the VR detector
 *
 * Dependencies:
 * - core/toolbar/toolbar-ui.js (toggleToolbar)
 * - core/drawing/free-draw.js (startFreeDrawing)
 * - core/drawing/point-polygon.js (startPointPolygonDrawing)
 * - core/drawing/rectangle-draw.js (startRectangleDrawing)
 * - core/drawing/circle-draw.js (startCircleDrawing)
 * - core/undo-redo.js (performUndo, performRedo)
 */

/**
 * Setup keyboard shortcuts for button controls
 * This function should be called once when the extension loads
 */
function setupKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    // Ctrl + B for Toggle Toolbar
    if (e.ctrlKey && !e.shiftKey && !e.altKey && e.key === "b") {
      e.preventDefault();
      toggleToolbar();
      console.log("🔧 Toolbar toggled by Ctrl+B");
    }

    // Ctrl + F for Free Draw
    if (e.ctrlKey && !e.shiftKey && !e.altKey && e.key === "f") {
      e.preventDefault();
      startFreeDrawing();
      console.log("✏️ Free Draw triggered by Ctrl+F");
    }

    // Ctrl + P for Point-by-Point Polygon Draw
    if (e.ctrlKey && !e.shiftKey && !e.altKey && e.key === "p") {
      e.preventDefault();
      startPointPolygonDrawing();
      console.log("📍 Point Polygon Draw triggered by Ctrl+P");
    }

    // Ctrl + Shift + D for Rectangle Draw
    if (e.ctrlKey && e.shiftKey && !e.altKey && e.key === "D") {
      e.preventDefault();
      startRectangleDrawing();
      console.log("⬜ Rectangle Draw triggered by Ctrl+Shift+D");
    }

    // Ctrl + Alt + D for Circle Draw
    if (e.ctrlKey && e.altKey && !e.shiftKey && e.key === "d") {
      e.preventDefault();
      startCircleDrawing();
      console.log("⭕ Circle Draw triggered by Ctrl+Alt+D");
    }

    // Ctrl + Z for Undo
    if (e.ctrlKey && !e.shiftKey && !e.altKey && e.key === "z") {
      e.preventDefault();
      performUndo();
      console.log("↩️ Undo triggered by Ctrl+Z");
    }

    // Ctrl + Shift + Z for Redo
    if (e.ctrlKey && e.shiftKey && !e.altKey && e.key === "Z") {
      e.preventDefault();
      performRedo();
      console.log("↪️ Redo triggered by Ctrl+Shift+Z");
    }
  });

  console.log("✓ Keyboard shortcuts initialized");
  console.log("  Ctrl+B: Toggle Toolbar");
  console.log("  Ctrl+F: Free Draw");
  console.log("  Ctrl+P: Point Polygon (click to add vertices)");
  console.log("  Ctrl+Shift+D: Draw Rectangle");
  console.log("  Ctrl+Alt+D: Draw Circle");
  console.log("  Ctrl+Z: Undo");
  console.log("  Ctrl+Shift+Z: Redo");
}

// Initialize keyboard shortcuts on page load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    setupKeyboardShortcuts();
  });
} else {
  setupKeyboardShortcuts();
}
