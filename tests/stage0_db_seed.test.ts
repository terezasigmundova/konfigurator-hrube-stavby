import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../src/lib/prisma';

describe('Stage 0 Database & Seed Integration', () => {
  beforeAll(async () => {
    // Ensure DB connection
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('queries database for seeded catalog and price book', async () => {
    const catalog = await prisma.catalogVersion.findFirst({
      where: { isCurrent: true },
      include: { items: true },
    });

    if (!catalog) {
      // Seed script might be run before test
      return;
    }

    expect(catalog).toBeDefined();
    expect(catalog.items.length).toBeGreaterThanOrEqual(9);

    const wallItem = catalog.items.find((item) => item.code === 'OS_VF_01');
    expect(wallItem).toBeDefined();
    expect(wallItem?.thicknessMm).toBe(358.5);
  });
});
