/**
 * Draggable functionality for Bounding Box List Panel
 * Makes the panel movable by dragging the header
 */

/**
 * Make panel draggable by header
 * @param {HTMLElement} panel - The panel element
 * @param {HTMLElement} handle - The drag handle element (usually header)
 */
function makeModernPanelDraggable(panel, handle) {
  let isDragging = false;
  let startX, startY, startLeft, startTop;

  handle.addEventListener("mousedown", (e) => {
    if (e.target.tagName === "BUTTON") return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = panel.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;
    panel.style.transition = "none";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    panel.style.left = startLeft + dx + "px";
    panel.style.top = startTop + dy + "px";
    panel.style.right = "auto";
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    panel.style.transition = "";
  });
}

// Export for use in other modules
if (typeof window !== "undefined") {
  window.makeModernPanelDraggable = makeModernPanelDraggable;
}
