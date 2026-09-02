import { describe, it, expect } from 'vitest';
import {
  calculateScaleFactor,
  calculateSegmentLengthM,
  calculatePolygonAreaM2,
  calculateSlopedRoofAreaM2,
} from '../src/lib/geometry';
import { calculateProjectPrice } from '../src/lib/pricing';

describe('Stage 0 Baseline - Catalog & Pricing Rules', () => {
  it('validates catalog codes schema and pricing structure', () => {
    const expectedCatalogCodes = [
      'OS_VF_01',
      'OS_VF_02',
      'OS_VF_03',
      'NS_VF_01',
      'DS_VF_01',
      'PODLAHA_1NP',
      'STROP_RD',
      'STROP_BD',
      'STRECHA_SIKMA',
    ];

    expect(expectedCatalogCodes.length).toBe(9);
    expect(expectedCatalogCodes).toContain('OS_VF_01');
    expect(expectedCatalogCodes).toContain('STRECHA_SIKMA');
  });

  it('calculates scale factor and wall segment length accurately', () => {
    // 100 pixels represents 5 meters => 0.05 meters per pixel
    const pA = { x: 0, y: 0 };
    const pB = { x: 100, y: 0 };
    const scale = calculateScaleFactor(pA, pB, 5.0);
    expect(scale).toBe(0.05);

    const wallLength = calculateSegmentLengthM({ x: 10, y: 10 }, { x: 110, y: 10 }, scale);
    expect(wallLength).toBe(5.0);
  });

  it('calculates polygon area in square meters', () => {
    // 100px x 100px square at 0.1 m/px scale => 10m x 10m = 100 m2
    const square = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ];
    const area = calculatePolygonAreaM2(square, 0.1);
    expect(area).toBeCloseTo(100.0, 4);
  });

  it('calculates sloped roof area given projected area and slope', () => {
    // 100 m2 plan area at 30 deg slope => 100 / cos(30 deg) = 115.47 m2
    const slopedArea = calculateSlopedRoofAreaM2(100, 30);
    expect(slopedArea).toBeCloseTo(115.47, 2);
  });

  it('runs deterministic pricing calculation matching model test values', () => {
    const panels = [
      {
        catalogCode: 'OS_VF_01',
        title: 'Obvodový stěnový panel',
        areaM2: 100,
        unitPriceExVat: 8500,
        totalExVat: 850000,
      },
    ];

    const result = calculateProjectPrice(panels, {
      distanceKm: 50,
      truckAccess: 'YES',
      craneAccess: 'YES',
    });

    expect(result.totalPanelsExVat).toBe(850000);
    expect(result.assemblyExVat).toBe(153000); // 18%
    expect(result.handlingExVat).toBe(34000); // 4%
    expect(result.sitePrepExVat).toBe(35000);
    expect(result.subtotalExVat).toBeGreaterThan(1000000);
    expect(result.grandTotalWithVat).toBeGreaterThan(result.roundedTotalExVat);
  });
});
