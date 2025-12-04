/**
 * Bounding Box Drag Module
 * Handles dragging functionality for bounding boxes
 */

/**
 * Make a bounding box draggable
 */
function makeDraggable(element) {
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  let xOffset = 0;
  let yOffset = 0;

  element.addEventListener("mousedown", dragStart);
  document.addEventListener("mousemove", drag);
  document.addEventListener("mouseup", dragEnd);

  function dragStart(e) {
    // Don't drag if clicking on resize handle or control button
    if (
      e.target.classList.contains("resize-handle") ||
      e.target.classList.contains("control-btn") ||
      e.target.tagName === "BUTTON" ||
      e.target.tagName === "SPAN" ||
      e.target.tagName === "INPUT"
    ) {
      return;
    }

    isDragging = true;
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;
    element.style.cursor = "grabbing";
  }

  function drag(e) {
    if (isDragging) {
      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
      xOffset = currentX;
      yOffset = currentY;

      const currentLeft = parseFloat(element.style.left);
      const currentTop = parseFloat(element.style.top);

      element.style.left = `${currentLeft + currentX}px`;
      element.style.top = `${currentTop + currentY}px`;

      initialX = e.clientX;
      initialY = e.clientY;
    }
  }

  function dragEnd(e) {
    if (isDragging) {
      initialX = currentX;
      initialY = currentY;
      isDragging = false;
      element.style.cursor = "move";
    }
  }
}
