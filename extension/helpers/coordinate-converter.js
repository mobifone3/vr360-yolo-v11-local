/**
 * Coordinate Converter - Main Module
 *
 * This file combines all coordinate conversion modules.
 * Individual logic is in separate files under helpers/coord/
 *
 * Dependencies (loaded via manifest.json):
 * - coord/ui-extractor.js
 * - coord/projection-math.js
 * - coord/screen-to-sphere.js
 * - coord/url-utils.js
 */

// ============================================================================
// VIEW CONFIG
// ============================================================================

/**
 * Get the current view configuration
 * @param {object} passedConfig - Optional config (stored when polygon created)
 * @returns {object} - {hlookat, vlookat, fov, width, height}
 */
function getViewConfig(passedConfig = null) {
  const canvas = document.querySelector("#krpanoContainer canvas") || document.querySelector("canvas");
  let width = window.innerWidth;
  let height = window.innerHeight;

  if (canvas) {
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
  }

  // Priority 1: Passed config (from when polygon was drawn)
  if (passedConfig && passedConfig.hlookat !== undefined) {
    console.log(`📐 Using stored config: h=${passedConfig.hlookat}, v=${passedConfig.vlookat}, fov=${passedConfig.fov}`);
    return {
      hlookat: passedConfig.hlookat || 0,
      vlookat: passedConfig.vlookat || 0,
      fov: passedConfig.fov || 90,
      width: passedConfig.width || width,
      height: passedConfig.height || height,
    };
  }

  // Priority 2: Current UI
  const uiView = getKrpanoViewFromUI();
  if (uiView) {
    console.log(`📐 Using UI config: h=${uiView.hlookat}, v=${uiView.vlookat}, fov=${uiView.fov}`);
    return { ...uiView, width, height };
  }

  // Priority 3: Global krpano
  if (typeof krpano !== "undefined" && krpano.get) {
    const config = {
      hlookat: parseFloat(krpano.get("view.hlookat")) || 0,
      vlookat: parseFloat(krpano.get("view.vlookat")) || 0,
      fov: parseFloat(krpano.get("view.fov")) || 90,
      width,
      height,
    };
    console.log(`📐 Using krpano config: h=${config.hlookat}, v=${config.vlookat}, fov=${config.fov}`);
    return config;
  }

  console.warn("⚠️ Using default config (0, 0, 90)");
  return { hlookat: 0, vlookat: 0, fov: 90, width, height };
}

// ============================================================================
// MAIN CONVERSION FUNCTIONS
// ============================================================================

/**
 * Convert normalized screen coordinates to spherical coordinates
 * @param {number} normalizedX - X (0-1, left to right)
 * @param {number} normalizedY - Y (0-1, top to bottom)
 * @param {object} krpanoConfig - Optional config
 * @returns {object} - {ath, atv}
 */
function convertScreenToSpherical(normalizedX, normalizedY, krpanoConfig = null) {
  const viewConfig = getViewConfig(krpanoConfig);
  const result = screenToSpherical(normalizedX, normalizedY, viewConfig);

  console.log(
    `🔄 screen(${normalizedX.toFixed(6)}, ${normalizedY.toFixed(6)}) → ath=${result.ath.toFixed(6)}°, atv=${result.atv.toFixed(
      6
    )}°`
  );

  return result;
}

/**
 * Convert array of vertices to polygon points
 * @param {Array} vertices - [{x, y}, ...]
 * @param {object} canvas - Canvas element (unused, API compat)
 * @param {object} passedConfig - Krpano config
 * @returns {Array} - [{ath, atv}, ...]
 */
function convertBoundingBoxToPolygon(vertices, canvas = null, passedConfig = null) {
  if (!vertices || vertices.length < 3) {
    console.error("Invalid vertices");
    return [];
  }

  const viewConfig = getViewConfig(passedConfig);
  console.log(
    `📐 Converting ${vertices.length} vertices @ h=${viewConfig.hlookat.toFixed(1)}°, v=${viewConfig.vlookat.toFixed(1)}°, fov=${
      viewConfig.fov
    }°`
  );

  const points = vertices.map((v, i) => {
    const pt = screenToSpherical(v.x, v.y, viewConfig);
    if (i === 0) {
      console.log(`   [0] (${v.x.toFixed(6)}, ${v.y.toFixed(6)}) → ath=${pt.ath.toFixed(6)}°, atv=${pt.atv.toFixed(6)}°`);
    }
    return pt;
  });

  console.log(`✅ Converted ${vertices.length} vertices`);
  return points;
}

// ============================================================================
// DEBUG
// ============================================================================

/**
 * Test coordinate conversion - call from console: testCoords()
 */
function testCoords() {
  const v = getViewConfig();
  console.log("View:", v);

  const c = screenToSpherical(0.5, 0.5, v);
  console.log(`Center → ath=${c.ath.toFixed(6)}° (expect ${v.hlookat}), atv=${c.atv.toFixed(6)}° (expect ${v.vlookat})`);

  const tr = screenToSpherical(1, 0, v);
  const bl = screenToSpherical(0, 1, v);
  console.log(`TopRight → ath=${tr.ath.toFixed(6)}°, atv=${tr.atv.toFixed(6)}°`);
  console.log(`BottomLeft → ath=${bl.ath.toFixed(6)}°, atv=${bl.atv.toFixed(6)}°`);
}

if (typeof window !== "undefined") {
  window.testCoords = testCoords;
}
