/**
 * Card action handlers for Bounding Box List Panel
 * Handles delete, duplicate, type change, and label editing
 */

/**
 * Confirm type change using delete → create → update flow
 * @param {HTMLElement} container - The bounding box container
 * @param {HTMLElement} card - The polygon card element
 * @param {string} newType - The new polygon type
 */
async function confirmTypeChange(container, card, newType) {
  const polygonData = container.dataset.scenePolygonData ? JSON.parse(container.dataset.scenePolygonData) : null;

  if (!polygonData) {
    console.error("No polygon data found for type change");
    return;
  }

  const confirmBtn = card.querySelector(".vr-confirm-type-btn");
  const originalContent = confirmBtn.innerHTML;

  try {
    // Show loading state
    confirmBtn.innerHTML = "⏳";
    confirmBtn.style.pointerEvents = "none";

    // Use the new changePolygonType API
    if (typeof changePolygonType === "function") {
      const result = await changePolygonType(polygonData, newType);

      // Update container with new data
      container.dataset.polygonType = newType;
      container.dataset.hotspotId = result.data.id;
      container.dataset.scenePolygonData = JSON.stringify(result.data);

      // Update stored scene polygons
      if (typeof updateStoredScenePolygon === "function") {
        updateStoredScenePolygon(polygonData.id, result.data);
      }

      // Visual feedback
      confirmBtn.innerHTML = "✓";
      confirmBtn.style.backgroundColor = "#4caf50";
      confirmBtn.style.color = "white";

      setTimeout(() => {
        confirmBtn.style.display = "none";
        confirmBtn.innerHTML = originalContent;
        confirmBtn.style.backgroundColor = "#e8f5e9";
        confirmBtn.style.color = "#4caf50";
        confirmBtn.style.pointerEvents = "";

        // Refresh the list
        if (typeof updateModernBoundingBoxList === "function") {
          updateModernBoundingBoxList();
        }
      }, 1000);

      console.log(`✅ Changed polygon type to "${newType}"`);
    } else {
      throw new Error("changePolygonType function not available");
    }
  } catch (error) {
    console.error("Failed to change polygon type:", error);
    confirmBtn.innerHTML = "✕";
    confirmBtn.style.backgroundColor = "#f44336";
    confirmBtn.style.color = "white";

    setTimeout(() => {
      confirmBtn.innerHTML = originalContent;
      confirmBtn.style.backgroundColor = "#e8f5e9";
      confirmBtn.style.color = "#4caf50";
      confirmBtn.style.pointerEvents = "";
    }, 2000);

    alert(`Failed to change type: ${error.message}`);
  }
}

/**
 * Delete polygon (API call for scene polygons)
 * @param {HTMLElement} container - The bounding box container
 * @param {HTMLElement} card - The polygon card element
 */
async function deletePolygonCard(container, card) {
  const isScenePolygon = container.dataset.isScenePolygon === "true";
  const hotspotId = container.dataset.hotspotId;

  if (isScenePolygon && hotspotId) {
    if (!confirm("Delete this polygon from the scene?")) return;

    try {
      if (typeof deletePolygonHotspot === "function") {
        await deletePolygonHotspot(hotspotId);
      }
    } catch (error) {
      console.error("Failed to delete polygon:", error);
      alert(`Failed to delete: ${error.message}`);
      return;
    }
  }

  // Remove from DOM
  container.remove();
  card.remove();

  if (typeof updateModernBoundingBoxList === "function") {
    updateModernBoundingBoxList();
  }
}

/**
 * Duplicate bounding box
 * @param {HTMLElement} container - The bounding box container to duplicate
 */
function duplicateBoundingBox(container) {
  if (typeof duplicateBox === "function") {
    duplicateBox(container);
    setTimeout(() => {
      if (typeof updateModernBoundingBoxList === "function") {
        updateModernBoundingBoxList();
      }
    }, 100);
  }
}

/**
 * Edit card label inline
 * @param {HTMLElement} labelSpan - The label span element
 * @param {HTMLElement} container - The bounding box container
 */
function editCardLabel(labelSpan, container) {
  const currentLabel = labelSpan.textContent;
  const input = document.createElement("input");
  input.type = "text";
  input.value = currentLabel;

  // Use styles from BBoxListStyles if available
  const styles = window.BBoxListStyles;
  if (styles && styles.getLabelInputStyles) {
    input.style.cssText = styles.getLabelInputStyles();
  } else {
    input.style.cssText = `
      font-size: 14px;
      font-weight: 500;
      padding: 2px 6px;
      border: 1px solid #667eea;
      border-radius: 4px;
      outline: none;
      width: 100%;
      color: #333;
      background-color: #fff;
    `;
  }

  const saveLabel = async () => {
    const newLabel = input.value.trim() || currentLabel;
    labelSpan.textContent = newLabel;
    container.dataset.label = newLabel;
    input.replaceWith(labelSpan);

    // Call API to update polygon name if it's a scene polygon
    const isScenePolygon = container.dataset.isScenePolygon === "true";
    const hotspotId = container.dataset.hotspotId;

    if (isScenePolygon && hotspotId && newLabel !== currentLabel) {
      try {
        if (typeof updatePolygonName === "function") {
          await updatePolygonName(hotspotId, newLabel);
          console.log(`✅ Polygon name updated to "${newLabel}"`);
        }
      } catch (error) {
        console.error("Failed to update polygon name:", error);
      }
    }
  };

  input.onblur = saveLabel;

  input.onkeydown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      input.blur();
    }
    if (e.key === "Escape") {
      input.value = currentLabel;
      input.blur();
    }
  };

  labelSpan.replaceWith(input);
  input.focus();
  input.select();
}

// Export for use in other modules
if (typeof window !== "undefined") {
  window.confirmTypeChange = confirmTypeChange;
  window.deletePolygonCard = deletePolygonCard;
  window.duplicateBoundingBox = duplicateBoundingBox;
  window.editCardLabel = editCardLabel;
}
