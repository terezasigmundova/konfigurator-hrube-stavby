export interface Point2D {
  x: number;
  y: number;
}

export interface CalibrationData {
  pointA: Point2D;
  pointB: Point2D;
  realDistanceM: number;
  scaleMetresPerPx: number;
}

/**
 * Calculates distance between two points in 2D space.
 */
export function distance2D(p1: Point2D, p2: Point2D): number {
  if (!p1 || !p2) return 0;
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Computes scale factor (meters per source pixel) from 2 calibration points and known real-world distance in meters.
 */
export function calculateScaleFactor(
  pointA: Point2D,
  pointB: Point2D,
  realDistanceM: number
): number {
  const sourcePxDist = distance2D(pointA, pointB);
  if (sourcePxDist === 0) return 0;
  return realDistanceM / sourcePxDist;
}

/**
 * Converts a point from Source Pixels (S) to Model Meters (M) relative to origin (0,0).
 */
export function sourceToModelPoint(
  point: Point2D,
  scaleMetresPerPx: number
): Point2D {
  return {
    x: point.x * scaleMetresPerPx,
    y: point.y * scaleMetresPerPx,
  };
}

/**
 * Calculates length of wall segments in meters given source points and scale factor.
 * Supports passing either 2 points (single segment) OR an array of points (polyline).
 */
export function calculateSegmentLengthM(
  p1OrPoints: Point2D | Point2D[],
  p2OrScale?: Point2D | number,
  scaleMetresPerPx?: number
): number {
  if (Array.isArray(p1OrPoints)) {
    const points = p1OrPoints;
    const scale = typeof p2OrScale === 'number' ? p2OrScale : scaleMetresPerPx || 1;
    if (points.length < 2 || !scale) return 0;
    let totalDistPx = 0;
    for (let i = 0; i < points.length - 1; i++) {
      totalDistPx += distance2D(points[i], points[i + 1]);
    }
    return totalDistPx * scale;
  }

  if (p1OrPoints && p2OrScale && typeof p2OrScale !== 'number') {
    const scale = scaleMetresPerPx || 1;
    const distPx = distance2D(p1OrPoints, p2OrScale);
    return distPx * scale;
  }

  return 0;
}

/**
 * Calculates area of a closed polygon in square meters using Shoelace formula.
 */
export function calculatePolygonAreaM2(
  points: Point2D[],
  scaleMetresPerPx: number
): number {
  if (points.length < 3 || !scaleMetresPerPx) return 0;

  let areaPx = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    areaPx += points[i].x * points[j].y;
    areaPx -= points[j].x * points[i].y;
  }
  areaPx = Math.abs(areaPx) / 2;

  // Scale area by (metresPerPx)^2
  return areaPx * (scaleMetresPerPx * scaleMetresPerPx);
}

/**
 * Calculates sloped roof area from horizontal projected plan area and roof slope angle in degrees.
 */
export function calculateSlopedRoofAreaM2(
  projectedPlanAreaM2: number,
  slopeDegrees: number
): number {
  if (slopeDegrees <= 0) return projectedPlanAreaM2;
  const slopeRad = (slopeDegrees * Math.PI) / 180;
  return projectedPlanAreaM2 / Math.cos(slopeRad);
}

/**
 * Reconstructs a continuous list of vertices from individual segment lines.
 */
export function reconstructPolygonFromSegments(
  segments: { points: Point2D[] }[],
  scale: number
): Point2D[] {
  if (segments.length < 3) return [];

  const pts: Point2D[] = [segments[0].points[0], segments[0].points[1]];
  const remaining = [...segments.slice(1)];
  const tolerancePx = 0.35 / (scale || 0.02);

  let currentEnd = pts[pts.length - 1];
  let updated = true;

  while (updated && remaining.length > 0) {
    updated = false;
    for (let i = 0; i < remaining.length; i++) {
      const seg = remaining[i];
      const pA = seg.points[0];
      const pB = seg.points[1];

      const distToA = Math.sqrt(Math.pow(pA.x - currentEnd.x, 2) + Math.pow(pA.y - currentEnd.y, 2));
      if (distToA < tolerancePx) {
        pts.push(pB);
        currentEnd = pB;
        remaining.splice(i, 1);
        updated = true;
        break;
      }

      const distToB = Math.sqrt(Math.pow(pB.x - currentEnd.x, 2) + Math.pow(pB.y - currentEnd.y, 2));
      if (distToB < tolerancePx) {
        pts.push(pA);
        currentEnd = pA;
        remaining.splice(i, 1);
        updated = true;
        break;
      }
    }
  }

  return pts;
}

/**
 * Calculates ground floor slab area (1.NP) using either closed outer wall loop, reconstructed segments, or fallback formula.
 */
export function calculateGroundFloorArea(tracedElements: any[]): number {
  const outerWall1NPElements = tracedElements.filter((e) => e.storey === '1NP' && e.category === 'WALL_OUTER');
  if (outerWall1NPElements.length === 0) return 0;

  const closed1NPPolygon = outerWall1NPElements.find((e) => e.isClosedLoop);
  if (closed1NPPolygon) {
    let perimeterPx = 0;
    const pts = closed1NPPolygon.points;
    for (let i = 0; i < pts.length; i++) {
      const nextPt = pts[(i + 1) % pts.length];
      perimeterPx += distance2D(pts[i], nextPt);
    }
    const polygonScale = perimeterPx > 0 ? closed1NPPolygon.lengthOrAreaM / perimeterPx : 0;
    return calculatePolygonAreaM2(closed1NPPolygon.points, polygonScale);
  }

  // Reconstruct polygon from segment list
  const firstSeg = outerWall1NPElements.find(e => e.points && e.points.length >= 2);
  if (!firstSeg) return 0;
  const pxDist = distance2D(firstSeg.points[0], firstSeg.points[1]);
  const segScale = pxDist > 0 ? firstSeg.lengthOrAreaM / pxDist : 0.02;

  const pts = reconstructPolygonFromSegments(outerWall1NPElements, segScale);
  if (pts.length >= 3) {
    return calculatePolygonAreaM2(pts, segScale);
  }

  const outer1NPPerimeter = outerWall1NPElements.reduce((sum, el) => sum + el.lengthOrAreaM, 0);
  if (outer1NPPerimeter > 0) {
    return Math.pow(outer1NPPerimeter / 4, 2);
  }
  return 0;
}

/**
 * Checks if outer walls form a closed loop (envelope).
 */
export function isEnvelopeClosed(
  elements: any[],
  storey: string,
  scale: number
): { isClosed: boolean; openVertices: Point2D[] } {
  const outerWalls = elements.filter((e) => e.storey === storey && e.category === 'WALL_OUTER');
  if (outerWalls.length === 0) return { isClosed: false, openVertices: [] };

  const points: { x: number; y: number; elId: string; endType: 'start' | 'end' }[] = [];
  outerWalls.forEach((el) => {
    if (el.points && el.points.length >= 2) {
      points.push({ x: el.points[0].x, y: el.points[0].y, elId: el.id, endType: 'start' });
      points.push({ x: el.points[el.points.length - 1].x, y: el.points[el.points.length - 1].y, elId: el.id, endType: 'end' });
    }
  });

  const toleranceM = 0.35; // 35 cm snapping tolerance
  const tolerancePx = toleranceM / (scale || 0.02);

  const groups: { x: number; y: number; pts: typeof points }[] = [];
  points.forEach((pt) => {
    const foundGroup = groups.find((g) => {
      const dx = g.x - pt.x;
      const dy = g.y - pt.y;
      return Math.sqrt(dx * dx + dy * dy) < tolerancePx;
    });

    if (foundGroup) {
      foundGroup.pts.push(pt);
    } else {
      groups.push({ x: pt.x, y: pt.y, pts: [pt] });
    }
  });

  const openGroups = groups.filter((g) => g.pts.length < 2);
  const openVertices = openGroups.map((g) => ({ x: g.x, y: g.y }));

  return {
    isClosed: openVertices.length === 0,
    openVertices,
  };
}

