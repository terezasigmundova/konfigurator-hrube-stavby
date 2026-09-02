'use client';

import masterConfig from '@/lib/catalog/data/master_config.json';
import { getProductByCode } from '@/lib/catalog';

export interface PanelItemCalculation {
  catalogCode: string;
  title: string;
  areaM2: number;
  unitPriceExVat: number;
  totalExVat: number;
  category?: string;
  surchargesTotalExVat?: number;
}

export interface LogisticsInput {
  distanceKm?: number;
  flatPricePerTruckExVat?: number;
  truckAccess?: 'YES' | 'NO' | 'UNKNOWN';
  craneAccess?: 'YES' | 'NO' | 'UNKNOWN';
}

export interface PricingParameters {
  outerWallsM2: number;
  innerWallsM2: number;
  floorCeilingAreaM2: number;
  roofAreaM2: number;
  groundFloor1NPAreaM2?: number;
  includeGroundFloor1NP?: boolean;
  distanceKm?: number;
  flatPricePerTruckExVat?: number;
  storeysCount: number;
  constructionStepsCount?: number;
  hasDifficultAccess?: boolean;
  hasOversizedOpenings?: boolean;
  hasSpecialAcoustics?: boolean;
  hasHigherFireResistance?: boolean;
  hasLargeSpan?: boolean;
  outerWallCatalogCode?: string;
  innerWallCatalogCode?: string;
  ceilingCatalogCode?: string;
  roofCatalogCode?: string;
}

export interface PricingResult {
  totalExVat: number;
  totalIncVat: number;
  panelsTotalExVat: number;
  assemblyExVat: number; // Odborná montáž vč. spojovacího materiálu
  handlingExVat: number; // Autojeřáb a manipulace
  sitePrepExVat: number; // Zaměření ZD a zařízení staveniště vč. lešení
  transportExVat: number; // Kamionová doprava
  engineeringDocsExVat: number; // Výrobní dokumentace a koordinace PD
  contingencyExVat: number; // Technická rezerva včetně příplatků
  vatAmount: number;
  mountingDays: number;
  trucksCount: number;
}

export interface PricingCalculationResult {
  panelItems: PanelItemCalculation[];
  totalPanelsExVat: number;
  totalPanelAreaM2: number;
  totalFloorAreaM2: number;
  mountingDays: number;
  trucksCount: number;
  assemblyExVat: number;
  handlingExVat: number;
  sitePrepExVat: number;
  transportExVat: number;
  engineeringDocsExVat: number;
  contingencyExVat: number;
  technicalSurchargesExVat: number;
  subtotalExVat: number;
  roundedTotalExVat: number;
  vatAmount: number;
  grandTotalWithVat: number;
  surchargeFlags: string[];
}

export const CATALOG_UNIT_PRICES: Record<string, number> = {
  '1.1': 8500.0,
  '1.2': 10238.0,
  '1.3': 6450.0,
  '1.4': 9200.0,
  OS_VF_01: 8500.0,
  OS_VF_02: 10238.0,
  OS_VF_03: 6450.0,
  NS_VF_01: 3500.0,
  DS_VF_01: 5500.0,
  PS_VF_01: 2800.0,
  PODLAHA_1NP: 3500.0,
  STROP_RD: 3800.0,
  STROP_BD: 7850.0,
  STRECHA_SIKMA: 4500.0,
  STRECHA_PLOCHA: 5850.0,
};

export const SERVICE_RATES = {
  assemblyPct: 0.14,
  handlingDailyRate: 35000,
  vatPct: 0.12,
};

/**
 * Získá cenu za 1 kamion dle kilometrického pásma
 */
export function getTruckPriceForDistance(distanceKm: number = 60, truckType: 'Plachta' | 'Plato' = 'Plachta'): number {
  const bands = masterConfig.budgetRatesAndLogistics.transport.bands;
  const km = Math.max(1, distanceKm);
  const foundBand = bands.find((b) => km >= b.kmFrom && km <= b.kmTo);
  if (foundBand) {
    return truckType === 'Plato' ? foundBand.pricePlatoExVat : foundBand.pricePlachtaExVat;
  }
  return 12000;
}

/**
 * Stanoví délku montáže ve dnech dle podlahové plochy stavby
 */
export function getMountingDaysForFloorArea(floorAreaM2: number): number {
  const intervals = masterConfig.budgetRatesAndLogistics.mountingDuration.intervals;
  const area = Math.max(1, floorAreaM2);
  const found = intervals.find((i) => area <= i.maxAreaM2);
  return found ? found.days : 5;
}

/**
 * Stanoví paušální cenu zařízení staveniště a lešení dle podlahové plochy stavby
 */
export function getSitePrepPriceForFloorArea(floorAreaM2: number): number {
  const intervals = masterConfig.budgetRatesAndLogistics.sitePreparationAndScaffolding.intervals;
  const area = Math.max(1, floorAreaM2);
  const found = intervals.find((i) => area <= i.maxAreaM2);
  return found ? found.priceExVat : 115000;
}

/**
 * Hlavní kalkulátor ceny projektu hrubé stavby PREFA ŠOP
 */
export function calculatePricing(params: PricingParameters): PricingResult {
  const outerWallProduct = getProductByCode(params.outerWallCatalogCode || '1.1');
  const innerWallProduct = getProductByCode(params.innerWallCatalogCode || 'NS_VF_01');
  const ceilingProduct = getProductByCode(params.ceilingCatalogCode || 'STROP_RD');
  const roofProduct = getProductByCode(params.roofCatalogCode || 'STRECHA_SIKMA');

  const outerWallsTotal = Math.max(0, params.outerWallsM2 || 0) * (outerWallProduct?.unitPriceExVat || 8500);
  const innerWallsTotal = Math.max(0, params.innerWallsM2 || 0) * (innerWallProduct?.unitPriceExVat || 3500);
  const ceilingTotal = Math.max(0, params.floorCeilingAreaM2 || 0) * (ceilingProduct?.unitPriceExVat || 3800);
  let roofTotal = Math.max(0, params.roofAreaM2 || 0) * (roofProduct?.unitPriceExVat || 4500);

  const panelsTotalExVat = outerWallsTotal + innerWallsTotal + ceilingTotal + roofTotal;
  const totalPanelAreaM2 = (params.outerWallsM2 || 0) + (params.innerWallsM2 || 0) + (params.floorCeilingAreaM2 || 0) + (params.roofAreaM2 || 0);

  if (panelsTotalExVat === 0 || totalPanelAreaM2 === 0) {
    return {
      totalExVat: 0,
      totalIncVat: 0,
      panelsTotalExVat: 0,
      assemblyExVat: 0,
      handlingExVat: 0,
      sitePrepExVat: 0,
      transportExVat: 0,
      engineeringDocsExVat: 0,
      contingencyExVat: 0,
      vatAmount: 0,
      mountingDays: 0,
      trucksCount: 0,
    };
  }

  // Odhad podlahové plochy stavby (součet ploch podlaží)
  const floorAreaM2 = params.groundFloor1NPAreaM2 || (params.floorCeilingAreaM2 > 0 ? params.floorCeilingAreaM2 * Math.max(1, params.storeysCount) : (params.outerWallsM2 / 2.8 / 4) * (params.outerWallsM2 / 2.8 / 4) || 120);

  // 4. Délka montáže
  const mountingDays = getMountingDaysForFloorArea(floorAreaM2);

  // 3. Autojeřáb (35 000 Kč / den)
  const craneDailyRate = masterConfig.budgetRatesAndLogistics.craneAndHandling.dailyRateCzk || 35000;
  const handlingExVat = mountingDays * craneDailyRate;

  // 5. Zaměření ZD a zařízení staveniště vč. lešení
  const sitePrepExVat = getSitePrepPriceForFloorArea(floorAreaM2);

  // 2. Kamionová doprava (max 25 m² na kamion)
  const truckCapacityM2 = masterConfig.budgetRatesAndLogistics.transport.truckCapacityM2 || 25;
  const trucksCount = Math.max(1, Math.ceil(totalPanelAreaM2 / truckCapacityM2));
  const truckPrice = params.flatPricePerTruckExVat || getTruckPriceForDistance(params.distanceKm || 60, 'Plachta');
  const transportExVat = trucksCount * truckPrice;

  // 6. Odborná montáž vč. spojovacího materiálu (% z ceny všech panelů)
  const assemblyPct = (masterConfig.budgetRatesAndLogistics.professionalAssembly.percentageOfPanelsTotal || 14.0) / 100;
  const assemblyExVat = panelsTotalExVat * assemblyPct;

  // 8. Výrobní dokumentace a koordinace PD (% z ceny všech panelů)
  const docPct = (masterConfig.budgetRatesAndLogistics.productionDocumentation.percentageOfPanelsTotal || 4.5) / 100;
  const engineeringDocsExVat = panelsTotalExVat * docPct;

  // 7. Technická rezerva & Příplatky
  const baseContingencyPct = (masterConfig.budgetRatesAndLogistics.technicalContingency.basePercentageOfPanels || 5.0) / 100;
  let surchargesExVat = 0;

  if (params.hasOversizedOpenings && outerWallProduct?.surcharges?.oversizedOpeningsSurchargePct) {
    surchargesExVat += outerWallsTotal * (outerWallProduct.surcharges.oversizedOpeningsSurchargePct / 100);
  }
  if (params.hasSpecialAcoustics && outerWallProduct?.surcharges?.acousticsSurchargePct) {
    surchargesExVat += outerWallsTotal * (outerWallProduct.surcharges.acousticsSurchargePct / 100);
  }
  if (params.hasHigherFireResistance && outerWallProduct?.surcharges?.fireResistanceSurchargePct) {
    surchargesExVat += outerWallsTotal * (outerWallProduct.surcharges.fireResistanceSurchargePct / 100);
  }
  if (params.hasLargeSpan && (ceilingProduct?.surcharges?.largeSpanSurchargePct || roofProduct?.surcharges?.largeSpanSurchargePct)) {
    surchargesExVat += (ceilingTotal + roofTotal) * ((ceilingProduct?.surcharges?.largeSpanSurchargePct || 15) / 100);
  }

  const baseContingencyExVat = panelsTotalExVat * baseContingencyPct;
  const contingencyExVat = baseContingencyExVat + surchargesExVat;

  // Celkový součet
  const rawSubtotal = panelsTotalExVat + assemblyExVat + handlingExVat + sitePrepExVat + transportExVat + engineeringDocsExVat + contingencyExVat;
  const totalExVat = Math.ceil(rawSubtotal / 1000) * 1000;

  const vatPct = 0.12; // Snížená sazba DPH pro bytové stavby
  const vatAmount = totalExVat * vatPct;
  const totalIncVat = totalExVat + vatAmount;

  return {
    totalExVat,
    totalIncVat,
    panelsTotalExVat,
    assemblyExVat,
    handlingExVat,
    sitePrepExVat,
    transportExVat,
    engineeringDocsExVat,
    contingencyExVat,
    vatAmount,
    mountingDays,
    trucksCount,
  };
}

/**
 * Kompletní detailní kalkulace rozpočtu pro nákupní košík / rozpad
 */
export function calculateProjectPrice(
  panelItems: PanelItemCalculation[],
  logistics: LogisticsInput,
  additionalParams: { floorAreaM2?: number; hasOversizedOpenings?: boolean; hasLargeSpan?: boolean } = {}
): PricingCalculationResult {
  let totalPanelsExVat = 0;
  let totalPanelAreaM2 = 0;
  let technicalSurchargesExVat = 0;

  for (const item of panelItems) {
    totalPanelsExVat += item.totalExVat;
    totalPanelAreaM2 += item.areaM2;
    if (item.surchargesTotalExVat) {
      technicalSurchargesExVat += item.surchargesTotalExVat;
    }
  }

  if (totalPanelsExVat === 0 || totalPanelAreaM2 === 0) {
    return {
      panelItems: [],
      totalPanelsExVat: 0,
      totalPanelAreaM2: 0,
      totalFloorAreaM2: 0,
      mountingDays: 0,
      trucksCount: 0,
      assemblyExVat: 0,
      handlingExVat: 0,
      sitePrepExVat: 0,
      transportExVat: 0,
      engineeringDocsExVat: 0,
      contingencyExVat: 0,
      technicalSurchargesExVat: 0,
      subtotalExVat: 0,
      roundedTotalExVat: 0,
      vatAmount: 0,
      grandTotalWithVat: 0,
      surchargeFlags: [],
    };
  }

  const floorAreaM2 = additionalParams.floorAreaM2 || Math.max(80, totalPanelAreaM2 / 3);

  // 4. Délka montáže
  const mountingDays = getMountingDaysForFloorArea(floorAreaM2);

  // 3. Autojeřáb (35 000 Kč / den)
  const craneDailyRate = masterConfig.budgetRatesAndLogistics.craneAndHandling.dailyRateCzk || 35000;
  const handlingExVat = mountingDays * craneDailyRate;

  // 5. Zaměření ZD a lešení
  const sitePrepExVat = getSitePrepPriceForFloorArea(floorAreaM2);

  // 2. Doprava (25 m² na kamion)
  const truckCapacityM2 = masterConfig.budgetRatesAndLogistics.transport.truckCapacityM2 || 25;
  const trucksCount = Math.max(1, Math.ceil(totalPanelAreaM2 / truckCapacityM2));
  const truckPrice = logistics.flatPricePerTruckExVat || getTruckPriceForDistance(logistics.distanceKm || 60, 'Plachta');
  const transportExVat = trucksCount * truckPrice;

  // 6. Odborná montáž (14 %)
  const assemblyPct = (masterConfig.budgetRatesAndLogistics.professionalAssembly.percentageOfPanelsTotal || 14.0) / 100;
  const assemblyExVat = totalPanelsExVat * assemblyPct;

  // 8. Výrobní dokumentace (4.5 %)
  const docPct = (masterConfig.budgetRatesAndLogistics.productionDocumentation.percentageOfPanelsTotal || 4.5) / 100;
  const engineeringDocsExVat = totalPanelsExVat * docPct;

  // 7. Technická rezerva (5 % + příplatky)
  const baseContingencyPct = (masterConfig.budgetRatesAndLogistics.technicalContingency.basePercentageOfPanels || 5.0) / 100;
  const baseContingencyExVat = totalPanelsExVat * baseContingencyPct;
  const contingencyExVat = baseContingencyExVat + technicalSurchargesExVat;

  const surchargeFlags: string[] = [];
  if (logistics.truckAccess === 'NO' || logistics.craneAccess === 'NO') {
    surchargeFlags.push('site_logistics_restriction');
  }

  const rawSubtotal = totalPanelsExVat + assemblyExVat + handlingExVat + sitePrepExVat + transportExVat + engineeringDocsExVat + contingencyExVat;
  const roundedTotalExVat = Math.ceil(rawSubtotal / 1000) * 1000;

  const vatPct = 0.12;
  const vatAmount = roundedTotalExVat * vatPct;
  const grandTotalWithVat = roundedTotalExVat + vatAmount;

  return {
    panelItems,
    totalPanelsExVat,
    totalPanelAreaM2,
    totalFloorAreaM2: floorAreaM2,
    mountingDays,
    trucksCount,
    assemblyExVat,
    handlingExVat,
    sitePrepExVat,
    transportExVat,
    engineeringDocsExVat,
    contingencyExVat,
    technicalSurchargesExVat,
    subtotalExVat: rawSubtotal,
    roundedTotalExVat,
    vatAmount,
    grandTotalWithVat,
    surchargeFlags,
  };
}
