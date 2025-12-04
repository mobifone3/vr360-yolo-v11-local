/**
 * Create label element for bounding box
 * @param {string} label - Label text
 * @param {number} score - Confidence score
 * @param {string} color - Color
 * @param {HTMLElement} container - Container element
 * @param {HTMLElement} canvas - Canvas element
 * @param {boolean} isScenePolygon - Whether this is a read-only scene polygon
 * @param {object} krpanoConfig - Krpano configuration
 */
function createLabel(label, score, color, container, canvas, isScenePolygon = false, krpanoConfig = null) {
  const labelDiv = document.createElement("div");

  Object.assign(labelDiv.style, {
    backgroundColor: color,
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "600",
    position: "absolute",
    top: "-28px",
    left: "-3px",
    padding: "4px 10px",
    borderRadius: "6px 6px 0 0",
    whiteSpace: "nowrap",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    letterSpacing: "0.3px",
    textShadow: "0 1px 3px rgba(0,0,0,0.3)",
  });

  // Create editable label text
  const labelText = document.createElement("span");
  labelText.textContent = `${label} (${Math.round(score * 100)}%)${isScenePolygon ? " [Scene]" : ""}`;
  Object.assign(labelText.style, {
    cursor: isScenePolygon ? "default" : "pointer",
    color: "#ffffff",
  });
  labelText.title = isScenePolygon ? "Scene polygon (read-only)" : "Click to edit title";

  // Make label editable on click (only for user polygons)
  if (!isScenePolygon) {
    labelText.addEventListener("click", (e) => {
      e.stopPropagation();

      // Create input field
      const input = document.createElement("input");
      input.type = "text";
      input.value = label;
      Object.assign(input.style, {
        backgroundColor: "white",
        color: color,
        fontSize: "13px",
        fontWeight: "600",
        border: "none",
        outline: "none",
        padding: "0",
        width: "150px",
        borderRadius: "3px",
      });

      // Replace text with input
      labelText.replaceWith(input);
      input.focus();
      input.select();

      // Save on Enter or blur
      const saveTitle = () => {
        const newTitle = input.value.trim() || label;
        container.dataset.label = newTitle;
        labelText.textContent = `${newTitle} (${Math.round(score * 100)}%)`;
        input.replaceWith(labelText);
        console.log(`✏️ Title updated: ${label} → ${newTitle}`);

        // Update the list if it exists
        if (typeof updateBoundingBoxList === "function") {
          updateBoundingBoxList();
        }
      };

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          saveTitle();
        } else if (e.key === "Escape") {
          e.preventDefault();
          labelText.textContent = `${label} (${Math.round(score * 100)}%)`;
          input.replaceWith(labelText);
        }
      });

      input.addEventListener("blur", saveTitle);
    });
  }

  labelDiv.appendChild(labelText);

  // Add duplicate button (only for user polygons)
  if (!isScenePolygon) {
    const duplicateBtn = document.createElement("span");
    duplicateBtn.textContent = "⊕";
    Object.assign(duplicateBtn.style, {
      cursor: "pointer",
      fontWeight: "bold",
      fontSize: "16px",
      marginLeft: "4px",
      transition: "transform 0.15s ease",
    });
    duplicateBtn.title = "Duplicate this box";

    duplicateBtn.addEventListener("mouseenter", () => {
      duplicateBtn.style.transform = "scale(1.2)";
    });
    duplicateBtn.addEventListener("mouseleave", () => {
      duplicateBtn.style.transform = "scale(1)";
    });
    duplicateBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      duplicateBoundingBox(container, label, score, color, canvas, krpanoConfig);
    });

    labelDiv.appendChild(duplicateBtn);
  }

  // Add send button (only for user polygons)
  if (!isScenePolygon) {
    const sendBtn = document.createElement("span");
    sendBtn.textContent = "📤";
    Object.assign(sendBtn.style, {
      cursor: "pointer",
      fontWeight: "bold",
      fontSize: "14px",
      marginLeft: "4px",
      transition: "transform 0.15s ease",
    });
    sendBtn.title = "Send polygon to VR360";

    sendBtn.addEventListener("mouseenter", () => {
      sendBtn.style.transform = "scale(1.2)";
    });
    sendBtn.addEventListener("mouseleave", () => {
      sendBtn.style.transform = "scale(1)";
    });
    sendBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      try {
        sendBtn.textContent = "⏳";
        await createPolygonFromBoundingBox(container);
        sendBtn.textContent = "✅";
        setTimeout(() => {
          sendBtn.textContent = "📤";
        }, 2000);
      } catch (error) {
        sendBtn.textContent = "❌";
        alert("Failed to create polygon: " + error.message);
        setTimeout(() => {
          sendBtn.textContent = "📤";
        }, 2000);
      }
    });

    labelDiv.appendChild(sendBtn);
  }

  // Add close button
  const closeBtn = document.createElement("span");
  closeBtn.textContent = isScenePolygon ? "👁️" : "✕";
  Object.assign(closeBtn.style, {
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px",
    marginLeft: "2px",
    transition: "transform 0.15s ease",
  });
  closeBtn.title = isScenePolygon ? "Toggle visibility" : "Remove this box";

  closeBtn.addEventListener("mouseenter", () => {
    closeBtn.style.transform = "scale(1.2)";
  });
  closeBtn.addEventListener("mouseleave", () => {
    closeBtn.style.transform = "scale(1)";
  });
  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();

    // Save state for undo before removing
    if (typeof saveStateForUndo === "function") {
      saveStateForUndo();
    }

    // Remove the entire container
    container.remove();

    // Update list
    if (typeof updateBoundingBoxList === "function") {
      updateBoundingBoxList();
    }
  });

  labelDiv.appendChild(closeBtn);

  return labelDiv;
}
