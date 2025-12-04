/**
 * Duplicate a bounding box
 */
function duplicateBoundingBox(originalBox, label, score, color, canvas, krpanoConfig = null) {
  // Try to get krpanoConfig from dataset if not provided
  if (!krpanoConfig && originalBox.dataset.krpanoConfig) {
    try {
      krpanoConfig = JSON.parse(originalBox.dataset.krpanoConfig);
    } catch (e) {
      console.warn("Failed to parse krpanoConfig from dataset:", e);
    }
  }

  const newBox = originalBox.cloneNode(true);

  // Offset the duplicate slightly
  const currentLeft = parseInt(originalBox.style.left);
  const currentTop = parseInt(originalBox.style.top);
  newBox.style.left = `${currentLeft + 30}px`;
  newBox.style.top = `${currentTop + 30}px`;

  // Re-attach event listeners
  makeDraggable(newBox);

  // Re-attach resize handles
  const resizeHandles = newBox.querySelectorAll(".resize-handle");
  resizeHandles.forEach((handle) => {
    const position = handle.className.split("resize-")[1];
    makeResizable(newBox, handle, position);
  });

  // Re-attach label buttons
  const labelDiv = newBox.querySelector('div[style*="top: -28px"]');
  if (labelDiv) {
    const buttons = labelDiv.querySelectorAll("span");

    // Duplicate button (⊕)
    if (buttons[0]) {
      const duplicateBtn = buttons[0];
      const newDuplicateBtn = duplicateBtn.cloneNode(true);
      duplicateBtn.parentNode.replaceChild(newDuplicateBtn, duplicateBtn);

      newDuplicateBtn.addEventListener("mouseenter", () => {
        newDuplicateBtn.style.transform = "scale(1.2)";
      });
      newDuplicateBtn.addEventListener("mouseleave", () => {
        newDuplicateBtn.style.transform = "scale(1)";
      });
      newDuplicateBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        duplicateBoundingBox(newBox, label, score, color, canvas, krpanoConfig);
      });
    }

    // Send button (📤)
    if (buttons[1]) {
      const sendBtn = buttons[1];
      const newSendBtn = sendBtn.cloneNode(true);
      sendBtn.parentNode.replaceChild(newSendBtn, sendBtn);

      newSendBtn.addEventListener("mouseenter", () => {
        newSendBtn.style.transform = "scale(1.2)";
      });
      newSendBtn.addEventListener("mouseleave", () => {
        newSendBtn.style.transform = "scale(1)";
      });
      newSendBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        try {
          newSendBtn.textContent = "⏳";
          await createPolygonFromBoundingBox(newBox);
          newSendBtn.textContent = "✅";
          setTimeout(() => {
            newSendBtn.textContent = "📤";
          }, 2000);
        } catch (error) {
          newSendBtn.textContent = "❌";
          alert("Failed to create polygon: " + error.message);
          setTimeout(() => {
            newSendBtn.textContent = "📤";
          }, 2000);
        }
      });
    }

    // Close button (✕) - FIX: Properly attach delete handler
    if (buttons[2]) {
      const closeBtn = buttons[2];
      const newCloseBtn = closeBtn.cloneNode(true);
      closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);

      newCloseBtn.addEventListener("mouseenter", () => {
        newCloseBtn.style.transform = "scale(1.2)";
      });
      newCloseBtn.addEventListener("mouseleave", () => {
        newCloseBtn.style.transform = "scale(1)";
      });
      newCloseBtn.addEventListener("click", (e) => {
        e.stopPropagation();

        // Save state for undo before removing
        if (typeof saveStateForUndo === "function") {
          saveStateForUndo();
        }

        // Remove the entire container
        newBox.remove();

        // Update list
        if (typeof updateBoundingBoxList === "function") {
          updateBoundingBoxList();
        }
      });
    }
  }

  document.body.appendChild(newBox);
  console.log(`📋 Duplicated bounding box: ${label}`);

  // Save state for undo and update list
  if (typeof saveStateForUndo === "function") {
    saveStateForUndo();
  }
  if (typeof updateBoundingBoxList === "function") {
    updateBoundingBoxList();
  }
}
