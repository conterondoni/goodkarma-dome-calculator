/*
 * GoodKarma geometric kernel (experimental).
 *
 * It mirrors the stable part of Acidome's GoodKarma approach: a rib datum
 * plane is radial, and the neighbouring rib wall is offset by half of its
 * real thickness.  The result is a plane-to-plane datum, not a saw setting.
 */
(function (root) {
  const EPS = 1e-9;
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const length = a => Math.hypot(a[0], a[1], a[2]);
  const unit = a => { const n = length(a); if (n < EPS) throw new Error('Degenerate geometry'); return a.map(x => x / n); };
  const degrees = radians => radians * 180 / Math.PI;

  // Plane n·x + d = 0, normalized. For an unshifted rib this passes through
  // the sphere centre and the two centre-line vertices.
  function radialRibPlane(start, end) {
    return { normal: unit(cross(start, end)), d: 0 };
  }

  function orientedOffset(plane, referencePoint, thickness) {
    const side = dot(plane.normal, referencePoint) + plane.d;
    const sign = side < 0 ? 1 : -1;
    return { normal: plane.normal, d: plane.d + sign * thickness / 2, offset: sign * thickness / 2 };
  }

  function angleBetween(a, b) {
    return degrees(Math.acos(Math.min(1, Math.max(-1, Math.abs(dot(a.normal, b.normal))))));
  }

  // Returns the two radial planes that bound the GoodKarma datum at edge AB
  // in triangle ABC. Their offsets are the exact thickness-dependent input
  // for the eventual trapezoidal side faces.
  function triangleJointDatum(a, b, c, thickness) {
    const rib = radialRibPlane(a, b);
    const wallAtA = orientedOffset(radialRibPlane(a, c), b, thickness);
    const wallAtB = orientedOffset(radialRibPlane(b, c), a, thickness);
    return {
      rib,
      wallAtA,
      wallAtB,
      dihedralAtA: angleBetween(rib, wallAtA),
      dihedralAtB: angleBetween(rib, wallAtB),
      // The edge centre-line chord is only a datum. It is deliberately not
      // exported as a finished timber length.
      centreLineLength: length(sub(a, b))
    };
  }

  function validateDatum(datum) {
    return Number.isFinite(datum.centreLineLength) &&
      Number.isFinite(datum.dihedralAtA) && Number.isFinite(datum.dihedralAtB) &&
      datum.centreLineLength > 0 && datum.dihedralAtA > 0 && datum.dihedralAtB > 0;
  }

  root.GoodKarmaEngine = { radialRibPlane, orientedOffset, triangleJointDatum, validateDatum };
})(typeof window === 'undefined' ? globalThis : window);
