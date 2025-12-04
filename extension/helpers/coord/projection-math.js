/**
 * Projection Math
 * Mathematical functions for rectilinear projection coordinate conversion
 */

/**
 * Convert degrees to radians
 * @param {number} deg - Angle in degrees
 * @returns {number} - Angle in radians
 */
function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Convert radians to degrees
 * @param {number} rad - Angle in radians
 * @returns {number} - Angle in degrees
 */
function radToDeg(rad) {
  return (rad * 180) / Math.PI;
}

/**
 * Calculate horizontal FOV from vertical FOV and aspect ratio
 * Formula: tan(hFov/2) = tan(vFov/2) * aspectRatio
 *
 * @param {number} vFovDeg - Vertical FOV in degrees
 * @param {number} aspectRatio - Width / Height
 * @returns {number} - Horizontal FOV in degrees
 */
function calculateHorizontalFov(vFovDeg, aspectRatio) {
  const vFovRad = degToRad(vFovDeg);
  const hFovRad = 2 * Math.atan(Math.tan(vFovRad / 2) * aspectRatio);
  return radToDeg(hFovRad);
}

/**
 * Convert screen offset to angular offset using rectilinear projection
 *
 * In rectilinear projection, the screen maps to a tangent plane.
 * For an offset from center (range -0.5 to 0.5):
 *   tangentPosition = offset * 2 * tan(fov/2)
 *   angle = atan(tangentPosition)
 *
 * @param {number} offset - Offset from center (-0.5 to 0.5)
 * @param {number} fovDeg - Field of view in degrees
 * @returns {number} - Angular offset in degrees
 */
function screenOffsetToAngle(offset, fovDeg) {
  const fovRad = degToRad(fovDeg);
  const tangentPos = 2 * offset * Math.tan(fovRad / 2);
  return radToDeg(Math.atan(tangentPos));
}

/**
 * Normalize ATH to -180 to +180 range
 * @param {number} ath - Azimuth angle
 * @returns {number} - Normalized angle
 */
function normalizeAth(ath) {
  while (ath > 180) ath -= 360;
  while (ath < -180) ath += 360;
  return ath;
}

/**
 * Clamp ATV to -90 to +90 range
 * @param {number} atv - Altitude angle
 * @returns {number} - Clamped angle
 */
function clampAtv(atv) {
  return Math.max(-90, Math.min(90, atv));
}
