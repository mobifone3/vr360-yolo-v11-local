/**
 * Styles for Bounding Box List Panel
 * Centralized style definitions for consistent UI
 */

/**
 * Panel main container styles
 */
function getPanelStyles(rightPos) {
  return {
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
  };
}

/**
 * Panel header styles
 */
function getHeaderStyles() {
  return {
    padding: "16px 20px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "move",
  };
}

/**
 * Close button styles
 */
function getCloseButtonStyles() {
  return {
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
  };
}

/**
 * Bulk actions bar styles
 */
function getBulkBarStyles() {
  return {
    padding: "10px 16px",
    backgroundColor: "#f8f9fa",
    borderBottom: "1px solid #eee",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
  };
}

/**
 * List container styles
 */
function getListContainerStyles() {
  return {
    flex: "1",
    overflowY: "auto",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  };
}

/**
 * Polygon card styles
 */
function getCardStyles(isScenePolygon, color) {
  return {
    position: "relative",
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "14px",
    boxShadow: isScenePolygon ? `0 2px 8px rgba(0,0,0,0.08), 0 0 0 2px ${color}20` : "0 2px 8px rgba(0,0,0,0.08)",
    border: "none",
    transition: "all 0.25s ease",
    cursor: "pointer",
  };
}

/**
 * Card hover styles
 */
function getCardHoverStyles(color) {
  return {
    boxShadow: `0 8px 24px rgba(0,0,0,0.15), 0 0 0 2px ${color}40`,
    transform: "translateY(-2px)",
  };
}

/**
 * Card selected styles
 */
function getCardSelectedStyles(color) {
  return {
    backgroundColor: `${color}15`,
    boxShadow: `0 8px 24px rgba(0,0,0,0.12), 0 0 0 3px ${color}50`,
    transform: "translateY(-2px)",
  };
}

/**
 * Action button base styles
 */
function getActionButtonStyles() {
  return {
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
  };
}

/**
 * Delete button styles
 */
function getDeleteButtonStyles() {
  return {
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
  };
}

/**
 * Confirm button styles
 */
function getConfirmButtonStyles() {
  return {
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
  };
}

/**
 * Type button styles
 */
function getTypeButtonStyles(isActive, btnColor) {
  return {
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
  };
}

/**
 * Bulk type dropdown styles
 */
function getBulkTypeDropdownStyles() {
  return `
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
}

/**
 * Bulk type option styles
 */
function getBulkTypeOptionStyles() {
  return {
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
  };
}

/**
 * Empty state HTML
 */
function getEmptyStateHTML() {
  return `
    <div style="text-align: center; padding: 40px 20px; color: #999;">
      <div style="font-size: 48px; margin-bottom: 16px;">📭</div>
      <div style="font-size: 14px;">No polygons yet</div>
      <div style="font-size: 12px; margin-top: 8px; color: #bbb;">Draw or detect objects to create polygons</div>
    </div>
  `;
}

/**
 * Scene badge CSS text
 */
function getSceneBadgeStyles(color) {
  return `
    background: linear-gradient(135deg, ${color}, ${color}cc);
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.5px;
    flex-shrink: 0;
  `;
}

/**
 * Label input styles
 */
function getLabelInputStyles() {
  return `
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

// Export for use in other modules
if (typeof window !== "undefined") {
  window.BBoxListStyles = {
    getPanelStyles,
    getHeaderStyles,
    getCloseButtonStyles,
    getBulkBarStyles,
    getListContainerStyles,
    getCardStyles,
    getCardHoverStyles,
    getCardSelectedStyles,
    getActionButtonStyles,
    getDeleteButtonStyles,
    getConfirmButtonStyles,
    getTypeButtonStyles,
    getBulkTypeDropdownStyles,
    getBulkTypeOptionStyles,
    getEmptyStateHTML,
    getSceneBadgeStyles,
    getLabelInputStyles,
  };
}
