/**
 * Polygon Card UI for Bounding Box List Panel
 * Creates and manages individual polygon card elements
 */

/**
 * Create a simplified polygon card
 * @param {HTMLElement} container - The bounding box container
 * @param {number} index - The index of the container
 * @returns {HTMLElement} The created card element
 */
function createPolygonCard(container, index) {
  // Access constants from window
  const POLYGON_TYPES = window.POLYGON_TYPES || ["image", "video", "link", "article", "point"];
  const TYPE_ICONS = window.TYPE_ICONS || {
    image: "🖼️",
    video: "🎬",
    link: "🔗",
    article: "📄",
    point: "📍",
  };
  const TYPE_COLORS = window.TYPE_COLORS || {
    image: "#667eea",
    video: "#e91e63",
    link: "#00bcd4",
    article: "#ff9800",
    point: "#4caf50",
  };

  const card = document.createElement("div");
  card.className = "vr-polygon-card";
  card.dataset.containerId = container.id || `container-${index}`;

  const isScenePolygon = container.dataset.isScenePolygon === "true";
  const polygonType = container.dataset.polygonType || "image";
  const label = container.dataset.label || "polygon";
  const color = TYPE_COLORS[polygonType] || "#667eea";

  Object.assign(card.style, {
    position: "relative",
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "14px",
    boxShadow: isScenePolygon ? `0 2px 8px rgba(0,0,0,0.08), 0 0 0 2px ${color}20` : "0 2px 8px rgba(0,0,0,0.08)",
    border: "none",
    transition: "all 0.25s ease",
    cursor: "pointer",
  });

  // Store reference for highlighting
  card.dataset.containerRef = container.id || "";

  // Setup card event handlers
  setupCardEventHandlers(card, container, isScenePolygon, color, TYPE_COLORS);

  // Create action buttons
  const actionsContainer = createCardActions(container, card, isScenePolygon, polygonType);

  // Create main content row
  const mainRow = createMainContentRow(container, isScenePolygon, label, color);

  // Create type buttons row
  const typeRow = createTypeButtonsRow(container, card, polygonType, isScenePolygon, POLYGON_TYPES, TYPE_ICONS, TYPE_COLORS);

  card.appendChild(actionsContainer);
  card.appendChild(mainRow);
  card.appendChild(typeRow);

  return card;
}

/**
 * Setup event handlers for card hover, selection, and click
 */
function setupCardEventHandlers(card, container, isScenePolygon, color, TYPE_COLORS) {
  // Hover effects
  card.onmouseenter = () => {
    if (!card.classList.contains("selected")) {
      card.style.boxShadow = `0 8px 24px rgba(0,0,0,0.15), 0 0 0 2px ${color}40`;
      card.style.transform = "translateY(-2px)";
    }
    if (typeof highlightBoundingBox === "function") {
      highlightBoundingBox(container, true);
    }
  };

  card.onmouseleave = () => {
    if (!card.classList.contains("selected")) {
      card.style.boxShadow = isScenePolygon ? `0 2px 8px rgba(0,0,0,0.08), 0 0 0 2px ${color}20` : "0 2px 8px rgba(0,0,0,0.08)";
      card.style.transform = "translateY(0)";
    }
    if (typeof highlightBoundingBox === "function") {
      highlightBoundingBox(container, false);
    }
  };

  // Click to select/highlight (single selection)
  card.onclick = (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "BUTTON" || e.target.closest("button")) return;

    const wasSelected = card.classList.contains("selected");

    // Deselect all other cards first (single selection mode)
    document.querySelectorAll(".vr-polygon-card").forEach((otherCard) => {
      if (otherCard !== card) {
        otherCard.classList.remove("selected");
        const otherContainer = document.getElementById(otherCard.dataset.containerRef || otherCard.dataset.containerId);
        const otherIsScene = otherCard.dataset.containerRef && otherContainer?.dataset.isScenePolygon === "true";
        const otherType = otherContainer?.dataset.polygonType || "image";
        const otherColor = TYPE_COLORS[otherType] || "#667eea";
        otherCard.style.backgroundColor = "#fff";
        otherCard.style.boxShadow = otherIsScene
          ? `0 2px 8px rgba(0,0,0,0.08), 0 0 0 2px ${otherColor}20`
          : "0 2px 8px rgba(0,0,0,0.08)";
        otherCard.style.transform = "translateY(0)";
        if (otherContainer && typeof highlightBoundingBox === "function") {
          highlightBoundingBox(otherContainer, false);
        }
      }
    });

    // Toggle selection on clicked card
    const isSelected = !wasSelected;
    if (isSelected) {
      card.classList.add("selected");
      card.style.backgroundColor = `${color}15`;
      card.style.boxShadow = `0 8px 24px rgba(0,0,0,0.12), 0 0 0 3px ${color}50`;
      card.style.transform = "translateY(-2px)";
    } else {
      card.classList.remove("selected");
      card.style.backgroundColor = "#fff";
      card.style.boxShadow = isScenePolygon ? `0 2px 8px rgba(0,0,0,0.08), 0 0 0 2px ${color}20` : "0 2px 8px rgba(0,0,0,0.08)";
      card.style.transform = "translateY(0)";
    }

    // Highlight bounding box
    if (typeof highlightBoundingBox === "function") {
      highlightBoundingBox(container, isSelected);
    }

    // Scroll bounding box into view
    if (isSelected) {
      container.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };
}

/**
 * Create card action buttons (confirm, duplicate, delete)
 */
function createCardActions(container, card, isScenePolygon, polygonType) {
  const actionsContainer = document.createElement("div");
  Object.assign(actionsContainer.style, {
    position: "absolute",
    top: "8px",
    right: "8px",
    display: "flex",
    gap: "4px",
    alignItems: "center",
  });

  // Confirm type change button (hidden by default)
  const confirmBtn = document.createElement("button");
  confirmBtn.className = "vr-confirm-type-btn";
  confirmBtn.innerHTML = "✓";
  confirmBtn.title = "Confirm type change";
  Object.assign(confirmBtn.style, {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    border: "2px solid #4caf50",
    backgroundColor: "#e8f5e9",
    color: "#4caf50",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "bold",
    display: "none",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
  });
  confirmBtn.onmouseenter = () => {
    confirmBtn.style.backgroundColor = "#4caf50";
    confirmBtn.style.color = "white";
  };
  confirmBtn.onmouseleave = () => {
    confirmBtn.style.backgroundColor = "#e8f5e9";
    confirmBtn.style.color = "#4caf50";
  };
  confirmBtn.onclick = async (e) => {
    e.stopPropagation();
    const selectedType = card.querySelector(".vr-type-btn.selected")?.dataset.type;
    if (selectedType && selectedType !== polygonType) {
      if (typeof confirmTypeChange === "function") {
        await confirmTypeChange(container, card, selectedType);
      }
    }
  };

  // Duplicate button
  const duplicateBtn = document.createElement("button");
  duplicateBtn.innerHTML = "📋";
  duplicateBtn.title = "Duplicate";
  Object.assign(duplicateBtn.style, {
    width: "24px",
    height: "24px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#f0f0f0",
    cursor: "pointer",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s",
  });
  duplicateBtn.onmouseenter = () => (duplicateBtn.style.backgroundColor = "#e0e0e0");
  duplicateBtn.onmouseleave = () => (duplicateBtn.style.backgroundColor = "#f0f0f0");
  duplicateBtn.onclick = (e) => {
    e.stopPropagation();
    if (typeof duplicateBoundingBox === "function") {
      duplicateBoundingBox(container);
    }
  };

  // Delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.innerHTML = "✕";
  deleteBtn.title = "Delete";
  Object.assign(deleteBtn.style, {
    width: "24px",
    height: "24px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#ffebee",
    color: "#e53935",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s",
  });
  deleteBtn.onmouseenter = () => {
    deleteBtn.style.backgroundColor = "#e53935";
    deleteBtn.style.color = "white";
  };
  deleteBtn.onmouseleave = () => {
    deleteBtn.style.backgroundColor = "#ffebee";
    deleteBtn.style.color = "#e53935";
  };
  deleteBtn.onclick = async (e) => {
    e.stopPropagation();
    if (typeof deletePolygonCard === "function") {
      await deletePolygonCard(container, card);
    }
  };

  actionsContainer.appendChild(confirmBtn);
  actionsContainer.appendChild(duplicateBtn);
  actionsContainer.appendChild(deleteBtn);

  return actionsContainer;
}

/**
 * Create main content row with checkbox, badge, and label
 */
function createMainContentRow(container, isScenePolygon, label, color) {
  const mainRow = document.createElement("div");
  mainRow.style.cssText = "display: flex; align-items: center; gap: 10px; padding-right: 70px;";

  // Checkbox
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.style.cssText = "width: 16px; height: 16px; cursor: pointer; flex-shrink: 0;";
  checkbox.onclick = (e) => e.stopPropagation();
  checkbox.onchange = () => {
    if (typeof updateCardSelection === "function") {
      updateCardSelection(checkbox.closest(".vr-polygon-card"));
    }
    if (typeof updateBulkActionsVisibility === "function") {
      updateBulkActionsVisibility();
    }
  };

  // Scene badge
  if (isScenePolygon) {
    const badge = document.createElement("span");
    badge.textContent = "SCENE";
    badge.style.cssText = `
      background: linear-gradient(135deg, ${color}, ${color}cc);
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.5px;
      flex-shrink: 0;
    `;
    mainRow.appendChild(checkbox);
    mainRow.appendChild(badge);
  } else {
    mainRow.appendChild(checkbox);
  }

  // Label (editable)
  const labelSpan = document.createElement("span");
  labelSpan.textContent = label;
  labelSpan.title = "Click to edit";
  labelSpan.style.cssText = `
    font-size: 14px;
    font-weight: 500;
    color: #333;
    cursor: text;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `;
  labelSpan.onclick = (e) => {
    e.stopPropagation();
    if (typeof editCardLabel === "function") {
      editCardLabel(labelSpan, container);
    }
  };

  mainRow.appendChild(labelSpan);

  return mainRow;
}

/**
 * Create type buttons row
 */
function createTypeButtonsRow(container, card, polygonType, isScenePolygon, POLYGON_TYPES, TYPE_ICONS, TYPE_COLORS) {
  const typeRow = document.createElement("div");
  typeRow.style.cssText = "display: flex; gap: 6px; margin-top: 10px; flex-wrap: wrap;";

  POLYGON_TYPES.forEach((type) => {
    const typeBtn = document.createElement("button");
    typeBtn.className = "vr-type-btn";
    typeBtn.dataset.type = type;
    typeBtn.innerHTML = TYPE_ICONS[type];
    typeBtn.title = type.charAt(0).toUpperCase() + type.slice(1);

    const isActive = type === polygonType;
    const btnColor = TYPE_COLORS[type];

    Object.assign(typeBtn.style, {
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      border: isActive ? `2px solid ${btnColor}` : "2px solid #e0e0e0",
      backgroundColor: isActive ? `${btnColor}20` : "white",
      cursor: "pointer",
      fontSize: "14px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.2s",
    });

    if (isActive) {
      typeBtn.classList.add("selected");
    }

    typeBtn.onmouseenter = () => {
      if (!typeBtn.classList.contains("selected")) {
        typeBtn.style.borderColor = btnColor;
        typeBtn.style.backgroundColor = `${btnColor}10`;
      }
    };
    typeBtn.onmouseleave = () => {
      if (!typeBtn.classList.contains("selected")) {
        typeBtn.style.borderColor = "#e0e0e0";
        typeBtn.style.backgroundColor = "white";
      }
    };

    typeBtn.onclick = (e) => {
      e.stopPropagation();

      // Deselect all type buttons in this card
      card.querySelectorAll(".vr-type-btn").forEach((btn) => {
        btn.classList.remove("selected");
        btn.style.borderColor = "#e0e0e0";
        btn.style.backgroundColor = "white";
      });

      // Select this button
      typeBtn.classList.add("selected");
      typeBtn.style.borderColor = btnColor;
      typeBtn.style.backgroundColor = `${btnColor}20`;

      // Show/hide confirm button
      const originalType = container.dataset.polygonType || "image";
      const confirmBtn = card.querySelector(".vr-confirm-type-btn");

      if (type !== originalType && isScenePolygon) {
        confirmBtn.style.display = "flex";
      } else {
        confirmBtn.style.display = "none";
        // For non-scene polygons, update immediately
        if (!isScenePolygon && type !== originalType) {
          container.dataset.polygonType = type;
        }
      }
    };

    typeRow.appendChild(typeBtn);
  });

  return typeRow;
}

// Export for use in other modules
if (typeof window !== "undefined") {
  window.createPolygonCard = createPolygonCard;
}
