import { describe, it, expect } from 'vitest';

// Coordinate transformation helpers matching the planned implementation
function rotatePointCW(pt: { x: number; y: number }, imgWidth: number, imgHeight: number) {
  // Rotates 90 degrees clockwise. The new width is imgHeight, new height is imgWidth.
  return {
    x: imgHeight - pt.y,
    y: pt.x,
  };
}

function rotatePointCCW(pt: { x: number; y: number }, imgWidth: number, imgHeight: number) {
  // Rotates 90 degrees counter-clockwise. The new width is imgHeight, new height is imgWidth.
  return {
    x: pt.y,
    y: imgWidth - pt.x,
  };
}

describe('Stage 2 - Background Image Rotation Math', () => {
  it('correctly transforms points on 90deg clockwise rotation', () => {
    const W = 1000;
    const H = 600;

    // Corner points
    const topLeft = { x: 0, y: 0 };
    const topRight = { x: W, y: 0 };
    const bottomLeft = { x: 0, y: H };
    const bottomRight = { x: W, y: H };
    const center = { x: W / 2, y: H / 2 };

    // On CW: (x', y') with new W' = H, H' = W
    // topLeft (0,0) -> top-right (H, 0)
    expect(rotatePointCW(topLeft, W, H)).toEqual({ x: H, y: 0 });

    // bottomLeft (0, H) -> top-left (0, 0)
    expect(rotatePointCW(bottomLeft, W, H)).toEqual({ x: 0, y: 0 });

    // topRight (W, 0) -> bottom-right (H, W)
    expect(rotatePointCW(topRight, W, H)).toEqual({ x: H, y: W });

    // bottomRight (W, H) -> bottom-left (0, W)
    expect(rotatePointCW(bottomRight, W, H)).toEqual({ x: 0, y: W });

    // center (W/2, H/2) -> (H/2, W/2)
    expect(rotatePointCW(center, W, H)).toEqual({ x: H / 2, y: W / 2 });
  });

  it('correctly transforms points on 90deg counter-clockwise rotation', () => {
    const W = 1000;
    const H = 600;

    // Corner points
    const topLeft = { x: 0, y: 0 };
    const topRight = { x: W, y: 0 };
    const bottomLeft = { x: 0, y: H };
    const bottomRight = { x: W, y: H };
    const center = { x: W / 2, y: H / 2 };

    // On CCW: (x', y') with new W' = H, H' = W
    // topLeft (0,0) -> bottom-left (0, W)
    expect(rotatePointCCW(topLeft, W, H)).toEqual({ x: 0, y: W });

    // bottomLeft (0, H) -> bottom-right (H, W)
    expect(rotatePointCCW(bottomLeft, W, H)).toEqual({ x: H, y: W });

    // topRight (W, 0) -> top-left (0, 0)
    expect(rotatePointCCW(topRight, W, H)).toEqual({ x: 0, y: 0 });

    // bottomRight (W, H) -> top-right (H, 0)
    expect(rotatePointCCW(bottomRight, W, H)).toEqual({ x: H, y: 0 });

    // center (W/2, H/2) -> (H/2, W/2)
    expect(rotatePointCCW(center, W, H)).toEqual({ x: H / 2, y: W / 2 });
  });
});
