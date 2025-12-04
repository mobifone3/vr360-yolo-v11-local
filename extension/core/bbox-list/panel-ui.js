/**
 * Panel UI for Bounding Box List Panel
 * Creates the main panel structure, header, and list container
 */

/**
 * Create the panel header element
 * @param {Function} onClose - Callback when close button is clicked
 * @returns {HTMLElement} The header element
 */
function createPanelHeader(onClose) {
  const header = document.createElement("div");
  Object.assign(header.style, {
    padding: "16px 20px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "move",
  });

  const titleContainer = document.createElement("div");
  titleContainer.style.display = "flex";
  titleContainer.style.alignItems = "center";
  titleContainer.style.gap = "10px";

  const icon = document.createElement("span");
  icon.textContent = "📦";
  icon.style.fontSize = "20px";

  const title = document.createElement("span");
  title.textContent = "Polygons";
  title.style.fontWeight = "600";
  title.style.fontSize = "16px";

  const countBadge = document.createElement("span");
  countBadge.id = "vr-bbox-count";
  countBadge.style.cssText = `
    background: rgba(255,255,255,0.3);
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
  `;
  countBadge.textContent = "0";

  titleContainer.appendChild(icon);
  titleContainer.appendChild(title);
  titleContainer.appendChild(countBadge);

  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = "✕";
  Object.assign(closeBtn.style, {
    background: "rgba(255,255,255,0.2)",
    border: "none",
    color: "white",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s",
  });
  closeBtn.onmouseenter = () => (closeBtn.style.background = "rgba(255,255,255,0.3)");
  closeBtn.onmouseleave = () => (closeBtn.style.background = "rgba(255,255,255,0.2)");
  closeBtn.onclick = onClose;

  header.appendChild(titleContainer);
  header.appendChild(closeBtn);

  return header;
}

/**
 * Create the list container element
 * @returns {HTMLElement} The list container element
 */
function createListContainer() {
  const listContainer = document.createElement("div");
  listContainer.id = "vr-bbox-list";
  Object.assign(listContainer.style, {
    flex: "1",
    overflowY: "auto",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  });

  // Empty state
  const emptyState = document.createElement("div");
  emptyState.id = "vr-empty-state";
  emptyState.innerHTML = `
    <div style="text-align: center; padding: 40px 20px; color: #999;">
      <div style="font-size: 48px; margin-bottom: 16px;">📭</div>
      <div style="font-size: 14px;">No polygons yet</div>
      <div style="font-size: 12px; margin-top: 8px; color: #bbb;">Draw or detect objects to create polygons</div>
    </div>
  `;
  listContainer.appendChild(emptyState);

  return listContainer;
}

/**
 * Create modern bounding box list panel
 * @returns {HTMLElement} The panel element
 */
function createModernBoundingBoxListPanel() {
  // Remove existing panel
  const existing = document.getElementById("vr-modern-bbox-panel");
  if (existing) existing.remove();

  const panel = document.createElement("div");
  panel.id = "vr-modern-bbox-panel";

  // Position next to toolbar (to the left)
  const toolbar = document.getElementById("vr-button-group");
  let rightPos = 80;
  if (toolbar) {
    const toolbarRect = toolbar.getBoundingClientRect();
    rightPos = window.innerWidth - toolbarRect.left + 10;
  }

  Object.assign(panel.style, {
    position: "fixed",
    top: "60px",
    right: `${rightPos}px`,
    width: "320px",
    maxHeight: "80vh",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
    zIndex: "999996",
    display: "none",
    flexDirection: "column",
    overflow: "hidden",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  });

  // Create header with close callback
  const header = createPanelHeader(() => {
    if (typeof toggleModernBoundingBoxPanel === "function") {
      toggleModernBoundingBoxPanel();
    }
  });

  // Create bulk actions bar with select all handler
  const bulkBar = createBulkActionsBar((e) => {
    const cards = document.querySelectorAll(".vr-polygon-card input[type='checkbox']");
    cards.forEach((cb) => {
      cb.checked = e.target.checked;
      if (typeof updateCardSelection === "function") {
        updateCardSelection(cb.closest(".vr-polygon-card"));
      }
    });
    if (typeof updateBulkActionsVisibility === "function") {
      updateBulkActionsVisibility();
    }
  });

  // Create list container
  const listContainer = createListContainer();

  panel.appendChild(header);
  panel.appendChild(bulkBar);
  panel.appendChild(listContainer);

  // Make draggable
  if (typeof makeModernPanelDraggable === "function") {
    makeModernPanelDraggable(panel, header);
  }

  document.body.appendChild(panel);
  return panel;
}

/**
 * Update the bounding box list
 */
function updateModernBoundingBoxList() {
  let panel = document.getElementById("vr-modern-bbox-panel");
  if (!panel) {
    panel = createModernBoundingBoxListPanel();
  }

  const listContainer = document.getElementById("vr-bbox-list");
  const countBadge = document.getElementById("vr-bbox-count");
  const emptyState = document.getElementById("vr-empty-state");

  if (!listContainer) return;

  // Clear existing cards (keep empty state)
  const existingCards = listContainer.querySelectorAll(".vr-polygon-card");
  existingCards.forEach((card) => card.remove());

  // Get all polygon containers
  const containers = document.querySelectorAll(".vr-auto-polygon-box");
  const count = containers.length;

  // Update count
  if (countBadge) countBadge.textContent = count;

  // Show/hide empty state
  if (emptyState) {
    emptyState.style.display = count === 0 ? "block" : "none";
  }

  // Create cards for each container
  containers.forEach((container, index) => {
    // Assign ID if missing
    if (!container.id) {
      container.id = `polygon-container-${Date.now()}-${index}`;
    }

    if (typeof createPolygonCard === "function") {
      const card = createPolygonCard(container, index);
      listContainer.appendChild(card);
    }

    // Add click handler to container for bidirectional highlighting
    if (!container.dataset.cardClickBound) {
      container.addEventListener("click", () => {
        if (typeof highlightCardForContainer === "function") {
          highlightCardForContainer(container);
        }
      });
      container.dataset.cardClickBound = "true";
    }
  });

  if (typeof updateBulkActionsVisibility === "function") {
    updateBulkActionsVisibility();
  }
}

/**
 * Toggle panel visibility
 */
function toggleModernBoundingBoxPanel() {
  let panel = document.getElementById("vr-modern-bbox-panel");

  if (!panel) {
    panel = createModernBoundingBoxListPanel();
  }

  const isVisible = panel.style.display !== "none";

  if (isVisible) {
    panel.style.display = "none";
  } else {
    // Update position relative to toolbar
    const toolbar = document.getElementById("vr-button-group");
    if (toolbar) {
      const toolbarRect = toolbar.getBoundingClientRect();
      panel.style.right = window.innerWidth - toolbarRect.left + 10 + "px";
    }

    panel.style.display = "flex";

    // Display stored scene polygons first
    if (typeof displayStoredScenePolygons === "function") {
      displayStoredScenePolygons();
    }

    // Then update the list
    updateModernBoundingBoxList();
  }
}

// Export for use in other modules
if (typeof window !== "undefined") {
  window.createPanelHeader = createPanelHeader;
  window.createListContainer = createListContainer;
  window.createModernBoundingBoxListPanel = createModernBoundingBoxListPanel;
  window.updateModernBoundingBoxList = updateModernBoundingBoxList;
  window.toggleModernBoundingBoxPanel = toggleModernBoundingBoxPanel;
}
