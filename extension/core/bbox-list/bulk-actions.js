/**
 * Bulk actions for Bounding Box List Panel
 * Handles bulk selection, type change, and delete operations
 */

/**
 * Update bulk actions bar visibility based on selection
 */
function updateBulkActionsVisibility() {
  const selectedCount = document.querySelectorAll(".vr-polygon-card input[type='checkbox']:checked").length;
  const bulkBar = document.getElementById("vr-bulk-actions");
  if (bulkBar) {
    bulkBar.style.display = selectedCount > 0 || document.querySelectorAll(".vr-polygon-card").length > 0 ? "flex" : "none";
  }
}

/**
 * Get all selected containers from checked cards
 * @returns {HTMLElement[]} Array of selected container elements
 */
function getSelectedContainers() {
  const selected = [];
  document.querySelectorAll(".vr-polygon-card input[type='checkbox']:checked").forEach((checkbox) => {
    const card = checkbox.closest(".vr-polygon-card");
    const containerId = card?.dataset.containerId;
    if (containerId) {
      const container =
        document.getElementById(containerId) ||
        document.querySelector(`[data-container-id="${containerId}"]`) ||
        document.querySelector(`.vr-auto-polygon-box[id="${containerId}"]`);
      if (container) {
        selected.push(container);
      }
    }
  });
  return selected;
}

/**
 * Bulk change type for all selected polygons
 * @param {string} newType - The new polygon type to apply
 */
async function bulkChangeType(newType) {
  const containers = getSelectedContainers();
  if (containers.length === 0) {
    alert("Please select polygons first");
    return;
  }

  if (!confirm(`Change ${containers.length} polygon(s) to "${newType}"?`)) return;

  let successCount = 0;
  let failCount = 0;

  for (const container of containers) {
    const isScenePolygon = container.dataset.isScenePolygon === "true";

    if (isScenePolygon) {
      try {
        const polygonData = JSON.parse(container.dataset.scenePolygonData || "{}");
        if (typeof changePolygonType === "function") {
          const result = await changePolygonType(polygonData, newType);
          container.dataset.polygonType = newType;
          container.dataset.hotspotId = result.data.id;
          container.dataset.scenePolygonData = JSON.stringify(result.data);
          successCount++;
        }
      } catch (error) {
        console.error("Failed to change type:", error);
        failCount++;
      }
    } else {
      container.dataset.polygonType = newType;
      successCount++;
    }
  }

  if (typeof updateModernBoundingBoxList === "function") {
    updateModernBoundingBoxList();
  }

  alert(`Changed ${successCount} polygon(s). ${failCount > 0 ? `Failed: ${failCount}` : ""}`);
}

/**
 * Bulk delete all selected polygons
 */
async function bulkDeleteSelected() {
  const containers = getSelectedContainers();
  if (containers.length === 0) {
    alert("Please select polygons first");
    return;
  }

  if (!confirm(`Delete ${containers.length} polygon(s)?`)) return;

  for (const container of containers) {
    const isScenePolygon = container.dataset.isScenePolygon === "true";
    const hotspotId = container.dataset.hotspotId;

    if (isScenePolygon && hotspotId && typeof deletePolygonHotspot === "function") {
      try {
        await deletePolygonHotspot(hotspotId);
      } catch (error) {
        console.error("Failed to delete:", error);
      }
    }
    container.remove();
  }

  if (typeof updateModernBoundingBoxList === "function") {
    updateModernBoundingBoxList();
  }
}

/**
 * Create bulk actions bar element
 * @param {Function} onSelectAllChange - Callback for select all checkbox change
 * @returns {HTMLElement} The bulk actions bar element
 */
function createBulkActionsBar(onSelectAllChange) {
  const POLYGON_TYPES = window.POLYGON_TYPES || ["image", "video", "link", "article", "point"];
  const TYPE_ICONS = window.TYPE_ICONS || {
    image: "🖼️",
    video: "🎬",
    link: "🔗",
    article: "📄",
    point: "📍",
  };

  const bulkBar = document.createElement("div");
  bulkBar.id = "vr-bulk-actions";
  Object.assign(bulkBar.style, {
    padding: "10px 16px",
    backgroundColor: "#f8f9fa",
    borderBottom: "1px solid #eee",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
  });

  // Select all checkbox
  const selectAllContainer = document.createElement("label");
  selectAllContainer.style.cssText =
    "display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; color: #555;";

  const selectAllCheckbox = document.createElement("input");
  selectAllCheckbox.type = "checkbox";
  selectAllCheckbox.id = "vr-select-all";
  selectAllCheckbox.style.cssText = "width: 16px; height: 16px; cursor: pointer;";
  selectAllCheckbox.onchange = onSelectAllChange;

  selectAllContainer.appendChild(selectAllCheckbox);
  selectAllContainer.appendChild(document.createTextNode("All"));

  // Bulk action buttons
  const bulkBtns = document.createElement("div");
  bulkBtns.style.cssText = "display: flex; gap: 6px;";

  // Bulk type change dropdown
  const bulkTypeBtn = document.createElement("div");
  bulkTypeBtn.style.cssText = "position: relative;";

  const bulkTypeToggle = document.createElement("button");
  bulkTypeToggle.innerHTML = "🏷️";
  bulkTypeToggle.title = "Change type for selected";
  Object.assign(bulkTypeToggle.style, {
    width: "32px",
    height: "32px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "white",
    cursor: "pointer",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  });

  const bulkTypeDropdown = document.createElement("div");
  bulkTypeDropdown.style.cssText = `
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    padding: 6px;
    display: none;
    z-index: 1000;
    min-width: 120px;
  `;

  POLYGON_TYPES.forEach((type) => {
    const option = document.createElement("button");
    option.innerHTML = `${TYPE_ICONS[type]} ${type}`;
    Object.assign(option.style, {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      width: "100%",
      padding: "8px 12px",
      border: "none",
      background: "none",
      cursor: "pointer",
      borderRadius: "6px",
      fontSize: "13px",
      color: "#333",
      textAlign: "left",
    });
    option.onmouseenter = () => (option.style.backgroundColor = "#f0f0f0");
    option.onmouseleave = () => (option.style.backgroundColor = "transparent");
    option.onclick = () => {
      bulkChangeType(type);
      bulkTypeDropdown.style.display = "none";
    };
    bulkTypeDropdown.appendChild(option);
  });

  bulkTypeToggle.onclick = (e) => {
    e.stopPropagation();
    bulkTypeDropdown.style.display = bulkTypeDropdown.style.display === "none" ? "block" : "none";
  };

  bulkTypeBtn.appendChild(bulkTypeToggle);
  bulkTypeBtn.appendChild(bulkTypeDropdown);

  // Bulk delete button
  const bulkDeleteBtn = document.createElement("button");
  bulkDeleteBtn.innerHTML = "🗑️";
  bulkDeleteBtn.title = "Delete selected";
  Object.assign(bulkDeleteBtn.style, {
    width: "32px",
    height: "32px",
    border: "1px solid #ffcdd2",
    borderRadius: "8px",
    backgroundColor: "#fff5f5",
    cursor: "pointer",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  });
  bulkDeleteBtn.onclick = () => bulkDeleteSelected();

  bulkBtns.appendChild(bulkTypeBtn);
  bulkBtns.appendChild(bulkDeleteBtn);

  bulkBar.appendChild(selectAllContainer);
  bulkBar.appendChild(bulkBtns);

  // Close dropdown when clicking outside
  document.addEventListener("click", () => {
    bulkTypeDropdown.style.display = "none";
  });

  return bulkBar;
}

// Export for use in other modules
if (typeof window !== "undefined") {
  window.updateBulkActionsVisibility = updateBulkActionsVisibility;
  window.getSelectedContainers = getSelectedContainers;
  window.bulkChangeType = bulkChangeType;
  window.bulkDeleteSelected = bulkDeleteSelected;
  window.createBulkActionsBar = createBulkActionsBar;
}
