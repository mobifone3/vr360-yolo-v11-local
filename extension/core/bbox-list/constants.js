/**
 * Constants for Bounding Box List Panel
 * Defines polygon types, icons, and colors
 */

const POLYGON_TYPES = ["image", "video", "link", "article", "point"];

const TYPE_ICONS = {
  image: "🖼️",
  video: "🎬",
  link: "🔗",
  article: "📄",
  point: "📍",
};

const TYPE_COLORS = {
  image: "#667eea",
  video: "#e91e63",
  link: "#00bcd4",
  article: "#ff9800",
  point: "#4caf50",
};

// Export for use in other modules
if (typeof window !== "undefined") {
  window.POLYGON_TYPES = POLYGON_TYPES;
  window.TYPE_ICONS = TYPE_ICONS;
  window.TYPE_COLORS = TYPE_COLORS;
}
