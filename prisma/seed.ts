import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with DNK catalog and benchmark price book...');

  // 1. Catalog Version
  const catalogVersion = await prisma.catalogVersion.upsert({
    where: { id: 'catalog-v5-1-baseline' },
    update: {},
    create: {
      id: 'catalog-v5-1-baseline',
      versionName: 'DNK Catalog 2026.1',
      isCurrent: true,
    },
  });

  const catalogItems = [
    {
      code: 'OS_VF_01',
      name: 'Obvodový stěnový panel s kontaktním zateplením a omítkovou fasádou',
      category: 'WALL_OUTER',
      thicknessMm: 358.5,
      description: 'Certifikovaný panel DNK 1.1 s omítkovým zateplovacím systémem.',
    },
    {
      code: 'OS_VF_02',
      name: 'Obvodový stěnový panel s provětrávanou dřevěnou fasádou',
      category: 'WALL_OUTER',
      thicknessMm: 431.0,
      description: 'Certifikovaný panel DNK 1.2 s provětrávaným modřínovým obkladem.',
    },
    {
      code: 'OS_VF_03',
      name: 'Obvodový stěnový panel DP1 s ocelovým rámem a omítkovou fasádou',
      category: 'WALL_OUTER',
      thicknessMm: 368.5,
      description: 'Požárně odolný panel DP1 (DNK 1.3).',
    },
    {
      code: 'NS_VF_01',
      name: 'Vnitřní nosný stěnový panel s KVH rámem 120 mm',
      category: 'WALL_INNER',
      thicknessMm: 170.0,
      description: 'Vnitřní nosný panel DNK 2.1.',
    },
    {
      code: 'DS_VF_01',
      name: 'Vnitřní akustická a požárně dělicí dvojitá stěna 2×120 mm',
      category: 'WALL_INNER',
      thicknessMm: 300.0,
      description: 'Akustický mezibytový dělící panel DNK 2.2.',
    },
    {
      code: 'PODLAHA_1NP',
      name: 'Podlahový panel 1. NP s podlahovým vytápěním',
      category: 'FLOOR',
      thicknessMm: 220.1,
      description: 'Základový podlahový dílec s integrovanými rozvody.',
    },
    {
      code: 'STROP_RD',
      name: 'Mezipodlažní stropní panel pro rodinné domy',
      category: 'CEILING',
      thicknessMm: 432.0,
      description: 'Mezipodlažní stropní panel.',
    },
    {
      code: 'STROP_BD',
      name: 'Akustický mezipodlažní stropní panel pro bytové domy',
      category: 'CEILING',
      thicknessMm: 492.0,
      description: 'Zesílený mezipodlažní akustický strop.',
    },
    {
      code: 'STRECHA_SIKMA',
      name: 'Panel šikmé střechy s falcovanou krytinou',
      category: 'ROOF',
      thicknessMm: 455.0,
      description: 'Prefabrikovaný panely šikmé střechy.',
    },
  ];

  for (const item of catalogItems) {
    await prisma.catalogItem.upsert({
      where: { id: `item-${item.code}` },
      update: {
        name: item.name,
        category: item.category,
        thicknessMm: item.thicknessMm,
        description: item.description,
      },
      create: {
        id: `item-${item.code}`,
        catalogVersionId: catalogVersion.id,
        code: item.code,
        name: item.name,
        category: item.category,
        thicknessMm: item.thicknessMm,
        description: item.description,
        unit: 'm2',
      },
    });
  }

  // 2. Price Book Version
  const priceBookVersion = await prisma.priceBookVersion.upsert({
    where: { id: 'pricebook-2026-08' },
    update: {},
    create: {
      id: 'pricebook-2026-08',
      versionName: 'Sazebník ŠOPÍK / Vesper 2026.Q3',
      isCurrent: true,
      currency: 'CZK',
    },
  });

  const priceItems = [
    { catalogCode: 'OS_VF_01', unitPriceExVat: 8500.0 },
    { catalogCode: 'OS_VF_02', unitPriceExVat: 10238.04 },
    { catalogCode: 'OS_VF_03', unitPriceExVat: 8682.3 },
    { catalogCode: 'NS_VF_01', unitPriceExVat: 3500.0 },
    { catalogCode: 'DS_VF_01', unitPriceExVat: 5500.0 },
    { catalogCode: 'PODLAHA_1NP', unitPriceExVat: 3500.0 },
    { catalogCode: 'STROP_RD', unitPriceExVat: 6019.06 },
    { catalogCode: 'STROP_BD', unitPriceExVat: 6667.45 },
    { catalogCode: 'STRECHA_SIKMA', unitPriceExVat: 6196.76 },
  ];

  for (const item of priceItems) {
    await prisma.priceItem.upsert({
      where: { id: `price-${item.catalogCode}` },
      update: {
        unitPriceExVat: item.unitPriceExVat,
      },
      create: {
        id: `price-${item.catalogCode}`,
        priceBookVersionId: priceBookVersion.id,
        catalogCode: item.catalogCode,
        unitPriceExVat: item.unitPriceExVat,
      },
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
