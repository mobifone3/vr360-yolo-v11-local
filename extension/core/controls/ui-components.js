/**
 * Create a control button with modern design
 */
function createControlButton(icon, title, color) {
  const btn = document.createElement("button");
  btn.className = "control-btn";
  btn.textContent = icon;
  btn.title = title;

  Object.assign(btn.style, {
    backgroundColor: "#ffffff",
    color: color,
    border: `2px solid ${color}`,
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    pointerEvents: "auto",
    transition: "all 0.2s ease",
    boxShadow: "0 3px 8px rgba(0,0,0,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0",
  });

  btn.addEventListener("mouseenter", () => {
    btn.style.transform = "scale(1.15) translateY(-2px)";
    btn.style.boxShadow = "0 5px 12px rgba(0,0,0,0.4)";
    btn.style.backgroundColor = color;
    btn.style.color = "#ffffff";
  });

  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "scale(1) translateY(0)";
    btn.style.boxShadow = "0 3px 8px rgba(0,0,0,0.3)";
    btn.style.backgroundColor = "#ffffff";
    btn.style.color = color;
  });

  btn.addEventListener("mousedown", () => {
    btn.style.transform = "scale(0.95) translateY(-2px)";
  });

  btn.addEventListener("mouseup", () => {
    btn.style.transform = "scale(1.15) translateY(-2px)";
  });

  return btn;
}
