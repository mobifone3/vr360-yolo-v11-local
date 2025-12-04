/**
 * Krpano Injector Module
 * Injects a script into the page to access the krpano object directly
 * and retrieve view parameters (hlookat, vlookat, fov)
 */

function injectKrpanoScript() {
  const scriptContent = `
    (function() {
      // console.log("🚀 Krpano Injector: Started");
      
      function findKrpano() {
        // Try standard krpano object
        if (window.krpano) return window.krpano;
        
        // Try getting from container
        const container = document.getElementById("krpanoContainer");
        if (container && container.get) return container; // Sometimes the container IS the interface
        
        // Try finding embedded object
        if (document.getElementById("krpanoSWFObject")) return document.getElementById("krpanoSWFObject");
        
        return null;
      }

      function broadcastView() {
        const krpano = findKrpano();
        if (!krpano || !krpano.get) return;

        try {
          const hlookat = parseFloat(krpano.get("view.hlookat")) || 0;
          const vlookat = parseFloat(krpano.get("view.vlookat")) || 0;
          const fov = parseFloat(krpano.get("view.fov")) || 90;
          
          window.postMessage({
            type: "KRPANO_VIEW_UPDATE",
            payload: { hlookat, vlookat, fov }
          }, "*");
        } catch (e) {
          // console.warn("Error reading krpano view:", e);
        }
      }

      // Broadcast periodically
      setInterval(broadcastView, 500);
      
      // Also broadcast on mouse/touch events on the container
      const container = document.getElementById("krpanoContainer");
      if (container) {
        ['mouseup', 'touchend', 'wheel', 'mousemove'].forEach(evt => {
          container.addEventListener(evt, () => setTimeout(broadcastView, 50));
        });
      }
      
      // console.log("✅ Krpano Injector: Active");
    })();
  `;

  const script = document.createElement("script");
  script.textContent = scriptContent;
  (document.head || document.documentElement).appendChild(script);
  script.remove();
}

// Listen for messages from the injected script
window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (event.data.type && event.data.type === "KRPANO_VIEW_UPDATE") {
    // Store in global variable for coordinate-converter.js to use
    window.krpanoViewConfig = event.data.payload;
    // console.log("Updated krpano view:", window.krpanoViewConfig);
  }
});

// Run injection
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectKrpanoScript);
} else {
  injectKrpanoScript();
}
