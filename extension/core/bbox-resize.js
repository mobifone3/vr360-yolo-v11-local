/**
 * Bounding Box Resize Module
 * Handles resizing functionality for bounding boxes
 */

/**
 * Add resize handles to a bounding box (4 corners only with modern design)
 */
function addResizeHandles(container, color) {
  const positions = ["nw", "ne", "sw", "se"];

  positions.forEach((pos) => {
    const handle = document.createElement("div");
    handle.className = `resize-handle resize-${pos}`;

    Object.assign(handle.style, {
      position: "absolute",
      width: "10px",
      height: "10px",
      backgroundColor: "#ffffff",
      border: `2px solid ${color}`,
      borderRadius: "50%",
      zIndex: "1000000",
      pointerEvents: "auto",
      boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
      transition: "transform 0.15s ease, box-shadow 0.15s ease",
    });

    // Position corner handles
    if (pos.includes("n")) handle.style.top = "-5px";
    if (pos.includes("s")) handle.style.bottom = "-5px";
    if (pos.includes("w")) handle.style.left = "-5px";
    if (pos.includes("e")) handle.style.right = "-5px";

    // Set cursor
    if (pos === "nw" || pos === "se") handle.style.cursor = "nwse-resize";
    if (pos === "ne" || pos === "sw") handle.style.cursor = "nesw-resize";

    // Hover effect
    handle.addEventListener("mouseenter", () => {
      handle.style.transform = "scale(1.3)";
      handle.style.boxShadow = "0 3px 8px rgba(0,0,0,0.4)";
    });
    handle.addEventListener("mouseleave", () => {
      handle.style.transform = "scale(1)";
      handle.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
    });

    makeResizable(container, handle, pos);
    container.appendChild(handle);
  });
}

/**
 * Make a bounding box resizable
 */
function makeResizable(container, handle, position) {
  let isResizing = false;
  let startX, startY, startWidth, startHeight, startLeft, startTop;

  handle.addEventListener("mousedown", startResize);

  function startResize(e) {
    isResizing = true;
    startX = e.clientX;
    startY = e.clientY;
    startWidth = parseInt(container.style.width);
    startHeight = parseInt(container.style.height);
    startLeft = parseInt(container.style.left);
    startTop = parseInt(container.style.top);

    document.addEventListener("mousemove", resize);
    document.addEventListener("mouseup", stopResize);
    e.stopPropagation();
    e.preventDefault();
  }

  function resize(e) {
    if (!isResizing) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    // Handle resizing based on which handle is being dragged
    if (position.includes("e")) {
      container.style.width = `${Math.max(50, startWidth + dx)}px`;
    }
    if (position.includes("w")) {
      const newWidth = Math.max(50, startWidth - dx);
      container.style.width = `${newWidth}px`;
      container.style.left = `${startLeft + (startWidth - newWidth)}px`;
    }
    if (position.includes("s")) {
      container.style.height = `${Math.max(50, startHeight + dy)}px`;
    }
    if (position.includes("n")) {
      const newHeight = Math.max(50, startHeight - dy);
      container.style.height = `${newHeight}px`;
      container.style.top = `${startTop + (startHeight - newHeight)}px`;
    }

    e.preventDefault();
  }

  function stopResize(e) {
    isResizing = false;
    document.removeEventListener("mousemove", resize);
    document.removeEventListener("mouseup", stopResize);
  }
}
