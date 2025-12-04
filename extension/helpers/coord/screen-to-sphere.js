/**
 * Screen to Sphere Converter
 * Converts screen coordinates to spherical (ATH/ATV) coordinates for VR 360 panoramas.
 *
 * Uses proper 3D spherical projection math:
 * 1. Convert screen point to a 3D ray direction in camera space (rectilinear projection)
 * 2. Rotate the ray from camera space to world space using (hlookat, vlookat)
 * 3. Convert the world space direction to spherical coordinates (ath, atv)
 *
 * COORDINATE CONVENTIONS:
 * - Screen: X (0=left, 1=right), Y (0=top, 1=bottom)
 * - Krpano hlookat: horizontal pan angle (positive = looking right)
 * - Krpano vlookat: vertical tilt angle (positive = looking UP in standard krpano)
 * - API atv: vertical angle (positive = looking DOWN)
 * - Camera space: X=right, Y=up, Z=forward (into the screen)
 * - World space: X=East, Y=Up, Z=North (looking at ath=0, atv=0)
 */

/**
 * Convert normalized screen coordinates to spherical coordinates
 *
 * @param {number} normalizedX - X coordinate (0-1, left to right)
 * @param {number} normalizedY - Y coordinate (0-1, top to bottom)
 * @param {object} viewConfig - {hlookat, vlookat, fov, width, height}
 * @returns {object} - {ath, atv} in degrees (atv positive = looking down)
 */
function screenToSpherical(normalizedX, normalizedY, viewConfig) {
  const { hlookat, vlookat, fov, width, height } = viewConfig;

  // Calculate FOVs
  const aspectRatio = width / height;
  const vFov = fov;
  const hFov = calculateHorizontalFov(vFov, aspectRatio);

  // Screen offset from center (-0.5 to 0.5)
  const sx = normalizedX - 0.5; // + = right of center
  const sy = normalizedY - 0.5; // + = below center (in screen coords)

  // Convert FOV to radians
  const vFovRad = degToRad(vFov);
  const hFovRad = degToRad(hFov);

  // Step 1: Convert screen point to 3D ray in camera space
  // Using rectilinear (gnomonic) projection
  // Camera space: looking along +Z, +X is right, +Y is up
  // Screen center (0.5, 0.5) maps to (0, 0, 1)
  // Screen edges at ±0.5 map to ±tan(fov/2)
  const x_cam = sx * 2 * Math.tan(hFovRad / 2); // Right on screen = +X
  const y_cam = -sy * 2 * Math.tan(vFovRad / 2); // Down on screen = -Y (flip)
  const z_cam = 1.0; // Forward

  // Normalize to unit vector
  const len = Math.sqrt(x_cam * x_cam + y_cam * y_cam + z_cam * z_cam);
  const dx = x_cam / len;
  const dy = y_cam / len;
  const dz = z_cam / len;

  // Step 2: Rotate camera ray to world space
  // The camera is looking at direction (hlookat, vlookat)
  // We need to rotate the ray by the camera's orientation
  //
  // Standard convention: vlookat positive = looking up
  // Rotation order: first pitch (around X), then yaw (around Y)
  //
  // Pitch rotation (around X-axis) by vlookat:
  // - Positive vlookat means camera tilted up
  // - To convert camera ray to world, we rotate by +vlookat around X
  //
  // Yaw rotation (around Y-axis) by hlookat:
  // - Positive hlookat means camera rotated right
  // - To convert camera ray to world, we rotate by +hlookat around Y

  const pitchRad = degToRad(vlookat); // vlookat: positive = up
  const yawRad = degToRad(hlookat); // hlookat: positive = right

  // Apply pitch rotation (around X-axis)
  const cosP = Math.cos(pitchRad);
  const sinP = Math.sin(pitchRad);
  const x1 = dx;
  const y1 = dy * cosP - dz * sinP;
  const z1 = dy * sinP + dz * cosP;

  // Apply yaw rotation (around Y-axis)
  const cosY = Math.cos(yawRad);
  const sinY = Math.sin(yawRad);
  const x_world = x1 * cosY + z1 * sinY;
  const y_world = y1;
  const z_world = -x1 * sinY + z1 * cosY;

  // Step 3: Convert world direction to spherical coordinates
  // ath = horizontal angle from forward (Z-axis), positive = right
  // elevation = vertical angle from horizontal plane, positive = up
  let ath = radToDeg(Math.atan2(x_world, z_world));

  // Calculate elevation (angle from horizontal plane)
  const y_clamped = Math.max(-1, Math.min(1, y_world));
  const elevation = radToDeg(Math.asin(y_clamped));

  // Convert elevation to API atv convention
  // API atv: positive = looking DOWN
  // Elevation: positive = looking UP
  // So: atv = -elevation
  let atv = -elevation;

  // Normalize angles
  ath = normalizeAth(ath);
  atv = clampAtv(atv);

  // Debug logging with high precision
  console.log(`🔬 screenToSpherical:`);
  console.log(`   Screen: (${normalizedX.toFixed(6)}, ${normalizedY.toFixed(6)}) → offset: (${sx.toFixed(6)}, ${sy.toFixed(6)})`);
  console.log(`   View: h=${hlookat.toFixed(4)}°, v=${vlookat.toFixed(4)}°, vFov=${vFov}°, hFov=${hFov.toFixed(4)}°`);
  console.log(`   Camera ray: (${dx.toFixed(8)}, ${dy.toFixed(8)}, ${dz.toFixed(8)})`);
  console.log(`   World dir:  (${x_world.toFixed(8)}, ${y_world.toFixed(8)}, ${z_world.toFixed(8)})`);
  console.log(`   → ath=${ath.toFixed(6)}°, atv=${atv.toFixed(6)}° (elevation=${elevation.toFixed(6)}°)`);

  return { ath, atv };
}
