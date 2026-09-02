import { describe, it, expect } from 'vitest';
import { searchRuianAddress } from '../src/lib/ruian';
import { calculateProjectPrice } from '../src/lib/pricing';
import { prisma } from '../src/lib/prisma';

describe('Stage 9 E2E Integration Protocol', () => {
  it('performs full end-to-end workflow from inputs to DB snapshot', async () => {
    // 1. RÚIAN Address search
    const addressResults = searchRuianAddress('Hustopeče');
    expect(addressResults.length).toBeGreaterThan(0);
    const selectedAddress = addressResults[0];
    expect(selectedAddress.postalCode).toBe('693 01');

    // 2. Pricing Engine Calculation
    const panels = [
      {
        catalogCode: 'OS_VF_01',
        title: 'Obvodový stěnový panel',
        areaM2: 120,
        unitPriceExVat: 8500,
        totalExVat: 1020000,
      },
      {
        catalogCode: 'STROP_RD',
        title: 'Mezipodlažní stropní panel',
        areaM2: 100,
        unitPriceExVat: 6019.06,
        totalExVat: 601906,
      },
    ];

    const pricing = calculateProjectPrice(panels, {
      distanceKm: 50,
      truckAccess: 'YES',
      craneAccess: 'YES',
    });

    expect(pricing.totalPanelsExVat).toBe(1621906);
    expect(pricing.assemblyExVat).toBeCloseTo(1621906 * 0.18, 2);

    // 3. Database Persistence & Snapshot
    const project = await prisma.project.create({
      data: {
        name: 'E2E Testovací Rodinný Dům',
        inputs: {
          create: {
            municipalityName: selectedAddress.municipalityName,
            municipalityCode: selectedAddress.municipalityCode,
            postalCode: selectedAddress.postalCode,
            truckAccess: 'YES',
            craneAccess: 'YES',
            storeysCount: 2,
            targetAssemblyDate: '2026-10',
          },
        },
        revisions: {
          create: {
            revisionNumber: 1,
            status: 'SUBMITTED',
            snapshots: {
              create: {
                catalogVersionName: 'DNK Catalog 2026.1',
                priceBookVersionName: 'Sazebník ŠOPÍK / Vesper 2026.Q3',
                snapshotData: JSON.stringify(pricing),
              },
            },
          },
        },
      },
      include: {
        inputs: true,
        revisions: {
          include: {
            snapshots: true,
          },
        },
      },
    });

    expect(project.id).toBeDefined();
    expect(project.inputs?.municipalityName).toBe('Hustopeče');
    expect(project.revisions[0].snapshots[0].snapshotData).toContain('1621906');
  });
});
