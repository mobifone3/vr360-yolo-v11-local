/**
 * Highlighting functions for Bounding Box List Panel
 * Handles visual highlighting of boxes and cards
 */

/**
 * Highlight bounding box on canvas
 * @param {HTMLElement} container - The bounding box container
 * @param {boolean} highlight - Whether to highlight or remove highlight
 */
function highlightBoundingBox(container, highlight) {
  if (highlight) {
    container.style.boxShadow = "0 0 0 3px #667eea, 0 0 20px rgba(102,126,234,0.4)";
    container.style.zIndex = "999999";
  } else {
    container.style.boxShadow = "";
    container.style.zIndex = "";
  }
}

/**
 * Highlight card when bounding box is clicked
 * @param {HTMLElement} container - The bounding box container
 */
function highlightCardForContainer(container) {
  const panel = document.getElementById("vr-modern-bbox-panel");
  if (!panel || panel.style.display === "none") return;

  const containerId = container.id || container.dataset.containerId;
  const cards = document.querySelectorAll(".vr-polygon-card");

  // Access TYPE_COLORS from window
  const TYPE_COLORS = window.TYPE_COLORS || {
    image: "#667eea",
    video: "#e91e63",
    link: "#00bcd4",
    article: "#ff9800",
    point: "#4caf50",
  };

  cards.forEach((card) => {
    const isMatch = card.dataset.containerRef === containerId || card.dataset.containerId === containerId;

    if (isMatch) {
      // Highlight this card
      card.classList.add("selected");
      const polygonType = container.dataset.polygonType || "image";
      const color = TYPE_COLORS[polygonType] || "#667eea";
      card.style.backgroundColor = `${color}15`;
      card.style.boxShadow = `0 8px 24px rgba(0,0,0,0.12), 0 0 0 3px ${color}50`;
      card.style.transform = "translateY(-2px)";

      // Scroll into view
      card.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      // Deselect other cards
      card.classList.remove("selected");
      const otherContainer = document.getElementById(card.dataset.containerRef || card.dataset.containerId);
      const isScene = otherContainer?.dataset.isScenePolygon === "true";
      const otherType = otherContainer?.dataset.polygonType || "image";
      const otherColor = TYPE_COLORS[otherType] || "#667eea";
      card.style.backgroundColor = "#fff";
      card.style.boxShadow = isScene ? `0 2px 8px rgba(0,0,0,0.08), 0 0 0 2px ${otherColor}20` : "0 2px 8px rgba(0,0,0,0.08)";
      card.style.transform = "translateY(0)";
    }
  });
}

/**
 * Update card selection visual based on checkbox state
 * @param {HTMLElement} card - The polygon card element
 */
function updateCardSelection(card) {
  const checkbox = card.querySelector("input[type='checkbox']");
  if (checkbox && checkbox.checked) {
    card.style.backgroundColor = "#f5f5ff";
  } else if (!card.classList.contains("selected")) {
    card.style.backgroundColor = "#fff";
  }
}

// Export for use in other modules
if (typeof window !== "undefined") {
  window.highlightBoundingBox = highlightBoundingBox;
  window.highlightCardForContainer = highlightCardForContainer;
  window.updateCardSelection = updateCardSelection;
}
