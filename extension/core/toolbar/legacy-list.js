/**
 * Legacy Bounding Box List Module
 * Old-style bounding box list panel (kept for backward compatibility)
 *
 * Note: The modern list panel is in core/bbox-list/
 * This module provides the old toggleBoundingBoxList, createBoundingBoxListPanel, updateBoundingBoxList
 *
 * Dependencies:
 * - core/toolbar/toolbar-ui.js (setupToolbarDraggable)
 */

/**
 * Toggle bounding box list visibility (legacy)
 */
function toggleBoundingBoxList() {
  let listPanel = document.getElementById("vr-bbox-list-panel");

  if (!listPanel) {
    // Create the list panel
    listPanel = createBoundingBoxListPanel();
    document.body.appendChild(listPanel);
    console.log("📋 Bounding box list shown");
  } else {
    // Toggle visibility
    if (listPanel.style.display === "none") {
      listPanel.style.display = "block";
      updateBoundingBoxList();
      console.log("📋 Bounding box list shown");
    } else {
      listPanel.style.display = "none";
      console.log("📋 Bounding box list hidden");
    }
  }
}

/**
 * Create bounding box list panel (legacy)
 * @returns {HTMLElement} - List panel element
 */
function createBoundingBoxListPanel() {
  const panel = document.createElement("div");
  panel.id = "vr-bbox-list-panel";

  // Position left of the toolbar
  const toolbar = document.getElementById("vr-detector-circle-btn");
  let leftPos = "20px";

  if (toolbar) {
    const toolbarRect = toolbar.getBoundingClientRect();
    // Position to the left of toolbar with some spacing
    leftPos = `${toolbarRect.left - 320}px`;
  }

  Object.assign(panel.style, {
    position: "fixed",
    top: "20px",
    left: leftPos,
    width: "300px",
    maxHeight: "80vh",
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
    zIndex: "999998",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(0,0,0,0.08)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  });

  // Header
  const header = document.createElement("div");
  header.textContent = "Bounding Boxes";
  Object.assign(header.style, {
    padding: "15px 20px",
    fontSize: "16px",
    fontWeight: "bold",
    borderBottom: "1px solid rgba(0,0,0,0.08)",
    backgroundColor: "rgba(33,150,243,0.1)",
    color: "#1976D2",
  });

  // List container
  const listContainer = document.createElement("div");
  listContainer.id = "vr-bbox-list-content";
  Object.assign(listContainer.style, {
    padding: "10px",
    overflowY: "auto",
    flex: "1",
  });

  panel.appendChild(header);
  panel.appendChild(listContainer);

  // Make draggable using setupDraggable if available, or inline implementation
  if (typeof setupDraggable === "function") {
    setupDraggable(panel, header);
  } else {
    // Inline draggable implementation
    let isDragging = false;
    let currentX, currentY, initialX, initialY;

    header.style.cursor = "grab";
    header.addEventListener("mousedown", (e) => {
      isDragging = true;
      header.style.cursor = "grabbing";
      const rect = panel.getBoundingClientRect();
      initialX = e.clientX - rect.left;
      initialY = e.clientY - rect.top;
      e.preventDefault();
    });

    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        const maxX = window.innerWidth - panel.offsetWidth;
        const maxY = window.innerHeight - panel.offsetHeight;
        currentX = Math.max(0, Math.min(currentX, maxX));
        currentY = Math.max(0, Math.min(currentY, maxY));
        panel.style.left = currentX + "px";
        panel.style.top = currentY + "px";
        panel.style.right = "auto";
      }
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        header.style.cursor = "grab";
      }
    });
  }

  // Update list content
  updateBoundingBoxList();

  return panel;
}

/**
 * Update bounding box list content (legacy)
 */
function updateBoundingBoxList() {
  const listContainer = document.getElementById("vr-bbox-list-content");
  if (!listContainer) return;

  const boxes = document.querySelectorAll(".vr-auto-polygon-box");

  if (boxes.length === 0) {
    listContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">No bounding boxes</div>';
    return;
  }

  listContainer.innerHTML = "";

  boxes.forEach((box, index) => {
    const item = document.createElement("div");
    const label = box.dataset.label || "Unknown";
    const color = box.dataset.color || "#000";

    Object.assign(item.style, {
      padding: "10px",
      margin: "5px 0",
      borderRadius: "8px",
      backgroundColor: "rgba(0,0,0,0.03)",
      cursor: "pointer",
      transition: "all 0.2s ease",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      border: "2px solid transparent",
    });

    // Color indicator
    const colorDot = document.createElement("div");
    Object.assign(colorDot.style, {
      width: "12px",
      height: "12px",
      borderRadius: "50%",
      backgroundColor: color,
      flexShrink: "0",
    });

    // Label text (editable)
    const labelText = document.createElement("span");
    labelText.textContent = `${index + 1}. ${label}`;
    Object.assign(labelText.style, {
      flex: "1",
      fontSize: "14px",
      color: "#333",
    });
    labelText.title = "Click to edit name";

    // Make label editable on click
    labelText.addEventListener("click", (e) => {
      e.stopPropagation();

      // Create input field
      const input = document.createElement("input");
      input.type = "text";
      input.value = label;
      Object.assign(input.style, {
        flex: "1",
        fontSize: "14px",
        border: "1px solid " + color,
        borderRadius: "4px",
        padding: "2px 6px",
        outline: "none",
      });

      // Replace text with input
      labelText.replaceWith(input);
      input.focus();
      input.select();

      // Save on Enter or blur
      const saveTitle = () => {
        const newTitle = input.value.trim() || label;
        box.dataset.label = newTitle;
        labelText.textContent = `${index + 1}. ${newTitle}`;
        input.replaceWith(labelText);
        console.log(`✏️ Title updated in list: ${label} → ${newTitle}`);

        // Update the label on the bounding box itself
        const bboxLabel = box.querySelector('div[style*="top: -28px"] span');
        if (bboxLabel) {
          const score = box.dataset.score || 1;
          bboxLabel.textContent = `${newTitle} (${Math.round(score * 100)}%)`;
        }
      };

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          saveTitle();
        } else if (e.key === "Escape") {
          e.preventDefault();
          labelText.textContent = `${index + 1}. ${label}`;
          input.replaceWith(labelText);
        }
      });

      input.addEventListener("blur", saveTitle);
    });

    item.appendChild(colorDot);
    item.appendChild(labelText);

    // Hover effect
    item.addEventListener("mouseenter", () => {
      item.style.backgroundColor = "rgba(33,150,243,0.1)";
      item.style.borderColor = color;
      box.style.boxShadow = `0 0 20px ${color}`;
      box.style.border = `4px solid ${color}`;
    });

    item.addEventListener("mouseleave", () => {
      item.style.backgroundColor = "rgba(0,0,0,0.03)";
      item.style.borderColor = "transparent";
      box.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
      box.style.border = `3px solid ${color}`;
    });

    // Click to highlight and scroll to box
    item.addEventListener("click", () => {
      // Remove highlight from all boxes
      document.querySelectorAll(".vr-auto-polygon-box").forEach((b) => {
        const bColor = b.dataset.color || "#000";
        b.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
        b.style.border = `3px solid ${bColor}`;
        b.style.transform = "scale(1)";
      });

      // Remove highlight from all list items
      listContainer.querySelectorAll("div").forEach((i) => {
        i.style.backgroundColor = "rgba(0,0,0,0.03)";
        i.style.borderColor = "transparent";
      });

      // Highlight selected box with animation
      box.scrollIntoView({ behavior: "smooth", block: "center" });
      box.style.boxShadow = `0 0 40px ${color}, 0 0 20px ${color}`;
      box.style.border = `5px solid ${color}`;
      box.style.transform = "scale(1.02)";

      // Highlight selected item
      item.style.backgroundColor = `${color}20`;
      item.style.borderColor = color;

      // Flash effect
      let flashCount = 0;
      const flashInterval = setInterval(() => {
        if (flashCount >= 3) {
          clearInterval(flashInterval);
          box.style.border = `4px solid ${color}`;
          return;
        }
        box.style.border = flashCount % 2 === 0 ? `6px solid ${color}` : `4px solid ${color}`;
        flashCount++;
      }, 200);

      // Reset after delay
      setTimeout(() => {
        box.style.transform = "scale(1)";
      }, 2000);
    });

    listContainer.appendChild(item);
  });
}
