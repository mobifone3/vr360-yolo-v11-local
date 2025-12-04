/**
 * Sphere to Screen Converter
 * Converts spherical (ATH/ATV) coordinates back to screen coordinates for VR 360 panoramas.
 * This is the inverse operation of screen-to-sphere.js
 *
 * COORDINATE CONVENTIONS:
 * - Spherical: ath (horizontal angle), atv (vertical angle, positive = down)
 * - Screen: X (0=left, 1=right), Y (0=top, 1=bottom)
 * - Krpano hlookat: horizontal pan angle (positive = looking right)
 * - Krpano vlookat: vertical tilt angle (positive = looking UP in standard krpano)
 * - API atv: vertical angle (positive = looking DOWN)
 */

/**
 * Convert spherical coordinates to normalized screen coordinates
 *
 * @param {number} ath - Azimuth angle in degrees (spherical horizontal)
 * @param {number} atv - Altitude angle in degrees (spherical vertical, positive = down)
 * @param {object} viewConfig - {hlookat, vlookat, fov, width, height}
 * @returns {object} - {x, y} normalized (0-1, left to right, top to bottom) or null if out of view
 */
function sphericalToScreen(ath, atv, viewConfig) {
  const { hlookat, vlookat, fov, width, height } = viewConfig;

  // Calculate FOVs
  const aspectRatio = width / height;
  const vFov = fov;
  const hFov = calculateHorizontalFov(vFov, aspectRatio);

  // Step 1: Convert spherical coordinates to world space direction vector
  // ath: horizontal angle from north (Z-axis), positive = right (east)
  // atv: vertical angle, positive = down (API convention)
  // Convert atv to elevation: elevation = -atv
  const elevation = -atv;

  const athRad = degToRad(ath);
  const elevationRad = degToRad(elevation);

  // World space: X=East, Y=Up, Z=North (looking at ath=0, atv=0)
  const x_world = Math.sin(athRad) * Math.cos(elevationRad);
  const y_world = Math.sin(elevationRad);
  const z_world = Math.cos(athRad) * Math.cos(elevationRad);

  // Step 2: Rotate world direction to camera space
  // Inverse of the rotation in screenToSpherical
  // First inverse yaw (around Y-axis) by -hlookat
  // Then inverse pitch (around X-axis) by -vlookat

  const pitchRad = degToRad(vlookat);
  const yawRad = degToRad(hlookat);

  // Inverse yaw rotation (around Y-axis) by -hlookat
  const cosY = Math.cos(-yawRad);
  const sinY = Math.sin(-yawRad);
  const x1 = x_world * cosY + z_world * sinY;
  const y1 = y_world;
  const z1 = -x_world * sinY + z_world * cosY;

  // Inverse pitch rotation (around X-axis) by -vlookat
  const cosP = Math.cos(-pitchRad);
  const sinP = Math.sin(-pitchRad);
  const dx = x1;
  const dy = y1 * cosP - z1 * sinP;
  const dz = y1 * sinP + z1 * cosP;

  // Step 3: Check if point is in front of camera
  if (dz <= 0) {
    console.warn(`Point (ath=${ath.toFixed(2)}°, atv=${atv.toFixed(2)}°) is behind camera`);
    return null;
  }

  // Step 4: Project camera space ray to screen plane using rectilinear projection
  const vFovRad = degToRad(vFov);
  const hFovRad = degToRad(hFov);

  // Rectilinear projection: divide by z and apply tangent scaling
  const x_screen = dx / dz / (2 * Math.tan(hFovRad / 2));
  const y_screen = -(dy / dz) / (2 * Math.tan(vFovRad / 2)); // Flip back to screen coords

  // Step 5: Convert from screen space [-0.5, 0.5] to normalized [0, 1]
  const normalizedX = x_screen + 0.5;
  const normalizedY = y_screen + 0.5;

  // Check if within view bounds
  if (normalizedX < 0 || normalizedX > 1 || normalizedY < 0 || normalizedY > 1) {
    console.warn(
      `Point (ath=${ath.toFixed(2)}°, atv=${atv.toFixed(2)}°) is outside screen bounds: (${normalizedX.toFixed(
        3
      )}, ${normalizedY.toFixed(3)})`
    );
    return null;
  }

  // Debug logging
  console.log(`🔬 sphericalToScreen:`);
  console.log(`   Spherical: ath=${ath.toFixed(6)}°, atv=${atv.toFixed(6)}° (elevation=${elevation.toFixed(6)}°)`);
  console.log(`   World dir: (${x_world.toFixed(8)}, ${y_world.toFixed(8)}, ${z_world.toFixed(8)})`);
  console.log(`   Camera ray: (${dx.toFixed(8)}, ${dy.toFixed(8)}, ${dz.toFixed(8)})`);
  console.log(`   → Screen: (${normalizedX.toFixed(6)}, ${normalizedY.toFixed(6)})`);

  return { x: normalizedX, y: normalizedY };
}

/**
 * Convert array of spherical points to screen vertices
 * @param {Array} points - [{ath, atv}, ...]
 * @param {object} viewConfig - {hlookat, vlookat, fov, width, height}
 * @returns {Array} - [{x, y}, ...] normalized screen coordinates (filters out-of-view points
 */
function convertPolygonToScreenVertices(points, viewConfig) {
  if (!points || points.length < 3) {
    console.error("Invalid polygon points");
    return [];
  }

  const screenVertices = [];

  points.forEach((p, i) => {
    const screenCoord = sphericalToScreen(p.ath, p.atv, viewConfig);
    if (screenCoord) {
      screenVertices.push(screenCoord);
    } else {
      console.warn(`Point ${i} out of view, skipping`);
    }
  });

  if (screenVertices.length < 3) {
    console.warn("Polygon has less than 3 visible points, cannot render");
    return [];
  }

  console.log(`✅ Converted ${points.length} sphere points to ${screenVertices.length} screen vertices`);
  return screenVertices;
}
