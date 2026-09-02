'use client';

import React, { useState, useEffect } from 'react';
import { LeftStepsSidebar } from '@/components/sidebar/LeftStepsSidebar';
import { Step1WelcomeForm, Step1Data } from '@/components/planner/Step1WelcomeForm';
import { ContextProductPanel } from '@/components/planner/ContextProductPanel';
import { PdfDocumentUploader, UploadedSheetInfo } from '@/components/documents/PdfDocumentUploader';
import { InteractiveCanvas, TraceElement } from '@/components/canvas/InteractiveCanvas';
import { SurchargesAndChecklist } from '@/components/surcharges/SurchargesAndChecklist';
import { calculatePricing, PricingParameters, PricingResult, CATALOG_UNIT_PRICES } from '@/lib/pricing';
import { getTransportZoneForRegionFromBruntal } from '@/lib/ruian';
import { calculateProjectTransport } from '@/lib/transport';
import { calculateGroundFloorArea } from '@/lib/geometry';
import { PRODUCTION_MONTHS } from '@/components/surcharges/SeasonalDiscountTimeline';
import { MascotState } from '@/components/mascot/MascotGuideCard';
import { VesperIcon } from '@/components/ui/VesperIcon';

const iconPath = (name: string) => `/icons/${name}.svg`;

function Icon({ name, className = "" }: { name: string; className?: string }) {
  return <img className={`icon ${className}`} src={iconPath(name)} alt="" aria-hidden="true" />;
}

export default function ConfiguratorPage() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [visitedSteps, setVisitedSteps] = useState<number[]>([1]);
  const [isHelpDrawerOpen, setIsHelpDrawerOpen] = useState<boolean>(false);
  const [hiddenBanners, setHiddenBanners] = useState<number[]>([]);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!visitedSteps.includes(currentStep)) {
      setVisitedSteps((prev) => [...prev, currentStep]);
    }
  }, [currentStep]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsHelpDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [stepNotes, setStepNotes] = useState<Record<number, string>>({});

  // Step 1 State — Default Factory Location: Bruntál (Moravskoslezský kraj)
  const [step1Data, setStep1Data] = useState<Step1Data>({
    targetDeliveryDate: '2026-10-02',
    municipalityName: 'Bruntál, 792 01',
    distanceKmFromFactory: 5,
    truckAccess: 'YES',
    craneAccess: 'YES',
    storeysCount: 2, // 1, 2, or 3 NP
  });

  const [selectedMonthCode, setSelectedMonthCode] = useState<string>('OCT');

  // Uploaded Sheets State per purpose
  const [sheet1NP, setSheet1NP] = useState<UploadedSheetInfo | null>(null);
  const [sheet2NP, setSheet2NP] = useState<UploadedSheetInfo | null>(null);
  const [sheet3NP, setSheet3NP] = useState<UploadedSheetInfo | null>(null);
  const [sheetCeiling, setSheetCeiling] = useState<UploadedSheetInfo | null>(null);
  const [sheetRoof, setSheetRoof] = useState<UploadedSheetInfo | null>(null);

  // Calibrated Scales Per Sheet
  const [scale1NP, setScale1NP] = useState<number | null>(null);
  const [scale2NP, setScale2NP] = useState<number | null>(null);
  const [scale3NP, setScale3NP] = useState<number | null>(null);
  const [scaleCeiling, setScaleCeiling] = useState<number | null>(null);
  const [scaleRoof, setScaleRoof] = useState<number | null>(null);

  // Selected Catalog Products Per Category
  const [outerWallCatalogCode, setOuterWallCatalogCode] = useState<string>('1.1');
  const [innerWallCatalogCode, setInnerWallCatalogCode] = useState<string>('NS_VF_01');
  const [ceilingCatalogCode, setCeilingCatalogCode] = useState<string>('STROP_RD');
  const [roofCatalogCode, setRoofCatalogCode] = useState<string>('STRECHA_SIKMA');

  // Traced CAD Geometry Lines & Polygons
  const [tracedElements, setTracedElements] = useState<TraceElement[]>([]);
  const [deductedOpeningsM2, setDeductedOpeningsM2] = useState<number>(0);
  const [hasOversizedOpenings, setHasOversizedOpenings] = useState<boolean>(false);
  const [includeGroundFloor1NP, setIncludeGroundFloor1NP] = useState<boolean>(false);

  const [ceilingSourceMode, setCeilingSourceMode] = useState<'USE_FLOOR_PLAN' | 'UPLOAD_NEW'>('UPLOAD_NEW');
  const [roofSourceMode, setRoofSourceMode] = useState<'USE_FLOOR_PLAN' | 'UPLOAD_NEW'>('UPLOAD_NEW');
  const [atticHeightMM, setAtticHeightMM] = useState<number>(1000);

  const handleResetAllData = () => {
    setCurrentStep(1);
    setVisitedSteps([1]);
    setIsHelpDrawerOpen(false);
    setHiddenBanners([]);
    setStepNotes({});
    setStep1Data({
      targetDeliveryDate: '2026-10-02',
      municipalityName: 'Bruntál, 792 01',
      distanceKmFromFactory: 5,
      truckAccess: 'YES',
      craneAccess: 'YES',
      storeysCount: 2,
    });
    setSelectedMonthCode('OCT');
    setSheet1NP(null);
    setSheet2NP(null);
    setSheet3NP(null);
    setSheetCeiling(null);
    setSheetRoof(null);
    setScale1NP(null);
    setScale2NP(null);
    setScale3NP(null);
    setScaleCeiling(null);
    setScaleRoof(null);
    setOuterWallCatalogCode('1.1');
    setInnerWallCatalogCode('NS_VF_01');
    setCeilingCatalogCode('STROP_RD');
    setRoofCatalogCode('STRECHA_SIKMA');
    setTracedElements([]);
    setDeductedOpeningsM2(0);
    setHasOversizedOpenings(false);
    setCeilingSourceMode('UPLOAD_NEW');
    setRoofSourceMode('UPLOAD_NEW');
    setAtticHeightMM(1000);
    localStorage.removeItem('vesper_state_v5_1');
  };

  const storeys = step1Data.storeysCount || 2;
  const maxSteps = 8;

  const getVisibleStepIndex = (stepId: number) => {
    if (storeys === 1) {
      if (stepId <= 4) return stepId;
      if (stepId === 7) return 5;
      if (stepId === 8) return 6;
    }
    return stepId;
  };
  const totalVisibleSteps = storeys === 1 ? 6 : 8;

  const completedSteps = (() => {
    const list: number[] = [];
    
    // Step 1: Parametry & Místo
    if (step1Data.municipalityName && step1Data.municipalityName.trim() !== '') {
      list.push(1);
    }
    
    // Step 2: Vnější stěny 1. NP
    const hasOuter1NP = tracedElements.some(e => e.storey === '1NP' && e.category === 'WALL_OUTER');
    if (sheet1NP && scale1NP !== null && hasOuter1NP) {
      list.push(2);
    }
    
    // Step 3: Vnitřní stěny 1. NP
    const hasInner1NP = tracedElements.some(e => e.storey === '1NP' && e.category === 'WALL_INNER');
    if (hasInner1NP) {
      list.push(3);
    }
    
    const groundFloor1NPAreaM2 = calculateGroundFloorArea(tracedElements);
    
    if (storeys >= 2) {
      // Step 4: Strop
      const hasCeiling = ceilingSourceMode === 'USE_FLOOR_PLAN' ? (groundFloor1NPAreaM2 > 0) : tracedElements.some(e => e.category === 'CEILING');
      const isCeilingSheetValid = ceilingSourceMode === 'USE_FLOOR_PLAN' || (sheetCeiling && scaleCeiling !== null);
      if (isCeilingSheetValid && hasCeiling) {
        list.push(4);
      }
      
      // Step 5: Vnější stěny 2. NP
      const hasOuter2NP = tracedElements.some(e => e.storey === '2NP' && e.category === 'WALL_OUTER');
      if (sheet2NP && scale2NP !== null && hasOuter2NP) {
        list.push(5);
      }
      
      // Step 6: Vnitřní stěny 2. NP
      const hasInner2NP = tracedElements.some(e => e.storey === '2NP' && e.category === 'WALL_INNER');
      if (hasInner2NP) {
        list.push(6);
      }
      
      // Step 7: Střecha
      const hasRoof = roofSourceMode === 'USE_FLOOR_PLAN' ? (groundFloor1NPAreaM2 > 0) : tracedElements.some(e => e.category === 'ROOF');
      const isRoofSheetValid = roofSourceMode === 'USE_FLOOR_PLAN' || (sheetRoof && scaleRoof !== null);
      if (isRoofSheetValid && hasRoof) {
        list.push(7);
      }
    } else {
      // Step 4: Střecha (1 storey house)
      const hasRoof = roofSourceMode === 'USE_FLOOR_PLAN' ? (groundFloor1NPAreaM2 > 0) : tracedElements.some(e => e.category === 'ROOF');
      const isRoofSheetValid = roofSourceMode === 'USE_FLOOR_PLAN' || (sheetRoof && scaleRoof !== null);
      if (isRoofSheetValid && hasRoof) {
        list.push(4);
      }
    }
    
    return list;
  })();

  const [hasHydrated, setHasHydrated] = useState<boolean>(false);

  // Load state from localStorage on client-side mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vesper_state_v5_1');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          if (data.step1Data) setStep1Data(data.step1Data);
          if (data.selectedMonthCode) setSelectedMonthCode(data.selectedMonthCode);
          if (data.sheet1NP) setSheet1NP(data.sheet1NP);
          if (data.sheet2NP) setSheet2NP(data.sheet2NP);
          if (data.sheetCeiling) setSheetCeiling(data.sheetCeiling);
          if (data.sheetRoof) setSheetRoof(data.sheetRoof);
          if (data.scale1NP !== undefined) setScale1NP(data.scale1NP);
          if (data.scale2NP !== undefined) setScale2NP(data.scale2NP);
          if (data.scaleCeiling !== undefined) setScaleCeiling(data.scaleCeiling);
          if (data.scaleRoof !== undefined) setScaleRoof(data.scaleRoof);
          if (data.outerWallCatalogCode) setOuterWallCatalogCode(data.outerWallCatalogCode);
          if (data.innerWallCatalogCode) setInnerWallCatalogCode(data.innerWallCatalogCode);
          if (data.ceilingCatalogCode) setCeilingCatalogCode(data.ceilingCatalogCode);
          if (data.roofCatalogCode) setRoofCatalogCode(data.roofCatalogCode);
          if (data.tracedElements) setTracedElements(data.tracedElements);
          if (data.deductedOpeningsM2 !== undefined) setDeductedOpeningsM2(data.deductedOpeningsM2);
          if (data.hasOversizedOpenings !== undefined) setHasOversizedOpenings(data.hasOversizedOpenings);
          if (data.includeGroundFloor1NP !== undefined) setIncludeGroundFloor1NP(data.includeGroundFloor1NP);
          if (data.ceilingSourceMode) setCeilingSourceMode(data.ceilingSourceMode);
          if (data.roofSourceMode) setRoofSourceMode(data.roofSourceMode);
          if (data.currentStep) setCurrentStep(data.currentStep);
          if (data.stepNotes) setStepNotes(data.stepNotes);
          if (data.atticHeightMM !== undefined) setAtticHeightMM(data.atticHeightMM);
        } catch (e) {
          console.warn('Failed to parse saved state from localStorage:', e);
        }
      }
      setHasHydrated(true);
    }
  }, []);

  // Save state to localStorage on any state changes
  useEffect(() => {
    if (hasHydrated && typeof window !== 'undefined') {
      const stateObj = {
        step1Data,
        selectedMonthCode,
        sheet1NP,
        sheet2NP,
        sheetCeiling,
        sheetRoof,
        scale1NP,
        scale2NP,
        scaleCeiling,
        scaleRoof,
        outerWallCatalogCode,
        innerWallCatalogCode,
        ceilingCatalogCode,
        roofCatalogCode,
        tracedElements,
        deductedOpeningsM2,
        hasOversizedOpenings,
        includeGroundFloor1NP,
        ceilingSourceMode,
        roofSourceMode,
        currentStep,
        completedSteps,
        stepNotes,
        atticHeightMM,
      };
      localStorage.setItem('vesper_state_v5_1', JSON.stringify(stateObj));
    }
  }, [
    hasHydrated,
    step1Data,
    selectedMonthCode,
    sheet1NP,
    sheet2NP,
    sheetCeiling,
    sheetRoof,
    scale1NP,
    scale2NP,
    scaleCeiling,
    scaleRoof,
    outerWallCatalogCode,
    innerWallCatalogCode,
    ceilingCatalogCode,
    roofCatalogCode,
    tracedElements,
    deductedOpeningsM2,
    hasOversizedOpenings,
    includeGroundFloor1NP,
    ceilingSourceMode,
    roofSourceMode,
    currentStep,
    completedSteps,
    stepNotes,
    atticHeightMM,
  ]);


  // Official Transport Tariff calculation from Ferdinand Šopík price list (Rýmařov / Bruntál)
  const transportCalc = calculateProjectTransport({
    locationQuery: step1Data.municipalityName || 'Bruntál',
    trucksCount: step1Data.storeysCount >= 2 ? 4 : 2,
    vehicleType: 'PLATO',
  });

  const transportZone = {
    pricePerTruck: transportCalc.pricePerTruckExVat,
    zoneName: `${transportCalc.bandLabel} (${transportCalc.distanceKm} km z výrobního závodu Bruntál)`,
    distanceKm: transportCalc.distanceKm,
  };

  // Calculation of Gross Quantities
  const outerWallsGrossM2 = tracedElements
    .filter((e) => e.category === 'WALL_OUTER')
    .reduce((sum, el) => sum + el.lengthOrAreaM * 2.8, 0);

  const innerWallsGrossM2 = tracedElements
    .filter((e) => e.category === 'WALL_INNER')
    .reduce((sum, el) => sum + el.lengthOrAreaM * 2.8, 0);

  const groundFloor1NPAreaM2 = calculateGroundFloorArea(tracedElements);

  const rawFloorAreaM2 = tracedElements
    .filter((e) => e.category === 'CEILING')
    .reduce((sum, el) => sum + el.lengthOrAreaM, 0);

  const floorAreaM2 = ceilingSourceMode === 'USE_FLOOR_PLAN' ? groundFloor1NPAreaM2 : rawFloorAreaM2;

  const finalCeilingAreaM2 = (step1Data.storeysCount >= 2 && floorAreaM2 > 0)
    ? Math.max(0, floorAreaM2 - 6)
    : floorAreaM2;

  const explicitRoofElements = tracedElements.filter((e) => e.category === 'ROOF');
  const explicitRoofAreaM2 = explicitRoofElements.reduce((sum, el) => {
    const pitch = el.pitchDegrees ?? 35;
    const pitchRad = (pitch * Math.PI) / 180;
    const realArea = pitch > 0 ? el.lengthOrAreaM / Math.cos(pitchRad) : el.lengthOrAreaM;
    return sum + realArea;
  }, 0);

  // Fallback building footprint & roof calculation:
  const footprintBaseM2 = groundFloor1NPAreaM2 > 0 ? groundFloor1NPAreaM2 : (floorAreaM2 > 0 ? floorAreaM2 : 0);
  const defaultPitchRad = (35 * Math.PI) / 180;
  const fallbackRoofAreaM2 = footprintBaseM2 > 0 ? footprintBaseM2 / Math.cos(defaultPitchRad) : 0;

  const roofAreaM2 = explicitRoofAreaM2 > 0 ? explicitRoofAreaM2 : fallbackRoofAreaM2;

  const constructionStepsCount = storeys >= 2 ? 6 : 3;

  const pricingParams: PricingParameters = {
    outerWallsM2: outerWallsGrossM2,
    innerWallsM2: innerWallsGrossM2,
    floorCeilingAreaM2: finalCeilingAreaM2,
    roofAreaM2,
    groundFloor1NPAreaM2,
    includeGroundFloor1NP,
    distanceKm: step1Data.distanceKmFromFactory,
    flatPricePerTruckExVat: transportZone.pricePerTruck,
    storeysCount: step1Data.storeysCount,
    constructionStepsCount,
    hasDifficultAccess: step1Data.truckAccess === 'NO' || step1Data.craneAccess === 'NO',
    hasOversizedOpenings,
    outerWallCatalogCode,
    innerWallCatalogCode,
    ceilingCatalogCode,
    roofCatalogCode,
  };

  const pricingResult: PricingResult = calculatePricing(pricingParams);

  const selectedMonth = PRODUCTION_MONTHS.find((m) => m.code === selectedMonthCode) || PRODUCTION_MONTHS[0];
  const discountAmountExVat = Math.round(pricingResult.panelsTotalExVat * (selectedMonth.discountPct / 100));
  const finalTotalExVat = Math.max(0, pricingResult.totalExVat - discountAmountExVat);
  const finalVatAmount = Math.round(finalTotalExVat * 0.12);
  const finalTotalIncVat = finalTotalExVat + finalVatAmount;

  // Helper to calculate exact step price (material + 18% assembly + 4% crane + 3% contingency + 1 truck transport)
  const getStepCostExVat = (step: number) => {
    if (step === 1 || step === maxSteps) return 0;

    let netM2 = 0;
    let unitPrice = 0;
    let groundFloorMat = 0;

    const category = getCurrentStepCategory(step);
    const storey = getCurrentStepStorey(step);

    if (category === 'WALL_OUTER') {
      const el = tracedElements.filter((e) => e.storey === storey && e.category === 'WALL_OUTER');
      const perim = el.reduce((sum, item) => sum + item.lengthOrAreaM, 0);
      const gross = perim * 2.8;
      netM2 = gross;
      unitPrice = CATALOG_UNIT_PRICES[outerWallCatalogCode] || 8500;

      if (includeGroundFloor1NP && storey === '1NP' && groundFloor1NPAreaM2 > 0) {
        groundFloorMat = groundFloor1NPAreaM2 * 3500;
      }
    } else if (category === 'WALL_INNER') {
      const el = tracedElements.filter((e) => e.storey === storey && e.category === 'WALL_INNER');
      const perim = el.reduce((sum, item) => sum + item.lengthOrAreaM, 0);
      netM2 = perim * 2.8;
      unitPrice = CATALOG_UNIT_PRICES[innerWallCatalogCode] || 3500;
    } else if (category === 'CEILING') {
      const el = tracedElements.filter((e) => e.category === 'CEILING');
      const drawnM2 = el.reduce((sum, item) => sum + item.lengthOrAreaM, 0);
      netM2 = drawnM2 > 0 ? drawnM2 : groundFloor1NPAreaM2;
      unitPrice = CATALOG_UNIT_PRICES[ceilingCatalogCode] || 6019.06;
    } else if (category === 'ROOF') {
      netM2 = roofAreaM2;
      unitPrice = CATALOG_UNIT_PRICES[roofCatalogCode] || 6196.76;
    }

    const matCost = netM2 * unitPrice + groundFloorMat;
    if (matCost <= 0) return 0;

    const assembly = matCost * 0.18;
    const handling = matCost * 0.04;
    const contingency = (matCost + assembly + handling) * 0.03;
    const truck = transportZone.pricePerTruck;

    return Math.round(matCost + assembly + handling + contingency + truck);
  };

  const getRunningTotalExVat = (step: number) => {
    if (step === 1) return 0;
    if (step === maxSteps) return finalTotalExVat;

    let runningSum = 0;
    for (let s = 2; s <= step; s++) {
      runningSum += getStepCostExVat(s);
    }
    if (runningSum > 0) {
      runningSum += 35000; // Site preparation fee (BOZP)
    }
    return Math.round(runningSum);
  };

  const getRunningTotalIncVat = (step: number) => {
    if (step === 1) return 0;
    if (step === maxSteps) return finalTotalIncVat;
    return Math.round(getRunningTotalExVat(step) * 1.12);
  };

  function getCurrentStepCategory(step: number) {
    if (step === 1) return 'SYSTEM';
    if (step === 2 || step === 5) return 'WALL_OUTER';
    if (step === 3 || step === 6) return 'WALL_INNER';
    if (step === 4 && storeys >= 2) return 'CEILING';
    if (step === maxSteps - 1) return 'ROOF';
    return 'SYSTEM';
  }

  function getCurrentStepStorey(step: number): '1NP' | '2NP' | '3NP' {
    if (step <= 4) return '1NP';
    if (step <= 6) return '2NP';
    return storeys >= 2 ? '2NP' : '1NP';
  }

  const handleStepSelect = (stepId: number) => {
    if (stepId >= 1 && stepId <= maxSteps) {
      setCurrentStep(stepId);
    }
  };

  const handleConfirmStep = (stepId: number) => {
    if (stepId === 4 && storeys === 1) {
      setCurrentStep(7);
    } else if (stepId < maxSteps) {
      setCurrentStep(stepId + 1);
    }
  };

  const updateStepNote = (stepId: number, note: string) => {
    setStepNotes((prev) => ({ ...prev, [stepId]: note }));
  };

  const currentCategory = getCurrentStepCategory(currentStep);
  const currentStorey = getCurrentStepStorey(currentStep);

  const getActiveSheetForStep = (step: number) => {
    if (step === 2 || step === 3) return sheet1NP;
    if (step === 4 && storeys >= 2) return ceilingSourceMode === 'USE_FLOOR_PLAN' ? sheet1NP : sheetCeiling;
    if (step === 5 || step === 6) return sheet2NP;
    if (step === maxSteps - 1) return roofSourceMode === 'USE_FLOOR_PLAN' ? (sheet2NP || sheet1NP) : sheetRoof;
    return sheet1NP;
  };

  const getActiveScaleForStep = (step: number) => {
    if (step === 2 || step === 3) return scale1NP;
    if (step === 4 && storeys >= 2) return ceilingSourceMode === 'USE_FLOOR_PLAN' ? scale1NP : scaleCeiling;
    if (step === 5 || step === 6) return scale2NP;
    if (step === maxSteps - 1) return roofSourceMode === 'USE_FLOOR_PLAN' ? (scale2NP || scale1NP) : scaleRoof;
    return scale1NP;
  };

  const activeSheet = getActiveSheetForStep(currentStep);
  const activeScale = getActiveScaleForStep(currentStep);

  const activeLabel =
    currentStep === 2
      ? 'Vnější stěny 1. NP'
      : currentStep === 3
      ? 'Vnitřní stěny 1. NP'
      : currentStep === 4
      ? 'Strop'
      : currentStep === 5
      ? 'Vnější stěny 2. NP'
      : currentStep === 6
      ? 'Vnitřní stěny 2. NP'
      : currentStep === maxSteps - 1
      ? 'Střecha'
      : 'Konfigurátor';

  const activeMascotHelp = getMascotHelpForStep(
    currentStep,
    maxSteps,
    !!getActiveSheetForStep(currentStep),
    getActiveScaleForStep(currentStep) !== null,
    currentStep === 2
      ? tracedElements.some((e) => e.storey === '1NP' && e.category === 'WALL_OUTER')
      : currentStep === 3
      ? tracedElements.some((e) => e.storey === '1NP' && e.category === 'WALL_INNER')
      : currentStep === 4
      ? tracedElements.some((e) => e.category === 'CEILING')
      : currentStep === 5
      ? tracedElements.some((e) => e.storey === '2NP' && e.category === 'WALL_OUTER')
      : currentStep === 6
      ? tracedElements.some((e) => e.storey === '2NP' && e.category === 'WALL_INNER')
      : currentStep === maxSteps - 1
      ? tracedElements.some((e) => e.category === 'ROOF')
      : false,
    activeLabel
  );

  if (currentStep === 1) {
    return (
      <Step1WelcomeForm
        initialData={step1Data}
        maxSteps={maxSteps}
        onChange={(partial) => {
          setStep1Data((prev) => ({ ...prev, ...partial }));
        }}
        onSubmit={(data) => {
          setStep1Data(data);
          handleConfirmStep(1);
        }}
      />
    );
  }

  const activeStage = !activeSheet ? 0 : activeScale === null ? 1 : !tracedElements.some(e => e.storey === currentStorey && e.category === currentCategory) ? 2 : 3;

  const getFooterActionText = () => {
    if (currentStep === maxSteps) return 'Odeslat nezávaznou poptávku';
    if (!activeSheet) return 'Nahrajte výkres';
    if (activeScale === null) return 'Zkalibrujte měřítko';
    
    if (currentStep === 2) return 'Pokračovat k vnitřním stěnám';
    if (currentStep === 3) return 'Pokračovat ke stropu';
    if (currentStep === 4) return 'Pokračovat k 2. podlaží';
    if (currentStep === 5) return 'Pokračovat k vnitřním stěnám 2.NP';
    if (currentStep === 6) return 'Pokračovat ke střeše';
    if (currentStep === 7) return 'Pokračovat k rozpočtu';
    return 'Pokračovat na další krok';
  };

  const isFooterActionDisabled = () => {
    if (currentStep === maxSteps) return false;
    if (currentStep === 1) return false;

    if (currentCategory === 'CEILING' && ceilingSourceMode === 'USE_FLOOR_PLAN') {
      return false;
    }

    if (currentCategory === 'ROOF' && roofSourceMode === 'USE_FLOOR_PLAN') {
      return false;
    }

    return !activeSheet || activeScale === null;
  };

  return (
    <main className="drawing-shell">
      <header className="drawing-header">
        <a href="/" className="brand" aria-label="PREFA ŠOP – úvodní stránka">
          <img src="/brand/prefa-sop.svg" alt="PREFA ŠOP" />
        </a>
        <div className="drawing-header-context">
          <span>Konfigurátor hrubé stavby</span>
          <i />
          <strong>Automaticky uloženo</strong>
        </div>
      </header>

      <div className="drawing-layout">
        <LeftStepsSidebar
          currentStep={currentStep}
          maxSteps={maxSteps}
          storeysCount={storeys}
          completedStepIds={completedSteps}
          visitedStepIds={visitedSteps}
          onSelectStep={handleStepSelect}
          onReset={() => setIsResetConfirmOpen(true)}
        />

        <section className="drawing-main">
          <div className="drawing-step-heading">
            <div>
              <p className="eyebrow">Krok {getVisibleStepIndex(currentStep)} z {totalVisibleSteps} · Konstrukce podlaží</p>
              <h1>{activeLabel}</h1>
              <p>
                {currentStep === 2 && "Nahrajte půdorys, nastavte měřítko a postupně označte vnější obrys domu."}
                {currentStep === 3 && "Nahrajte půdorys, nastavte měřítko a postupně označte vnitřní stěny."}
                {currentStep === 4 && "Vyberte provedení stropní konstrukce nebo nahrajte samostatný výkres stropu."}
                {currentStep === 5 && "Konfigurujeme 2. podlaží — stěny a vnitřní příčky 2.NP."}
                {currentStep === 6 && "Konfigurujeme 2. podlaží — vnitřní stěny a příčky 2.NP."}
                {currentStep === 7 && "Zadejte sklon a parametry střešní konstrukce pro výpočet panelů."}
                {currentStep === 8 && "Kompletní rozpočet hrubé stavby a odeslání předobjednávky."}
              </p>
            </div>
            {currentStep >= 2 && currentStep < maxSteps && (
              <div className="drawing-workflow flex items-center gap-2 h-11" aria-label="Pracovní postup">
                <button 
                  type="button" 
                  className={`h-11 px-4 flex items-center gap-2 text-sm font-semibold transition cursor-pointer border border-transparent rounded-sm ${activeStage === 0 ? "bg-[var(--prefa-ink)] text-white" : "bg-[var(--prefa-aqua)]/10 text-[var(--prefa-ink)]"}`}
                >
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border border-transparent"
                    style={{
                      backgroundColor: activeStage === 0 ? 'var(--prefa-linen)' : 'transparent',
                      color: activeStage === 0 ? 'var(--prefa-ink)' : 'var(--prefa-aqua)',
                    }}
                  >
                    {activeStage > 0 ? (
                      <VesperIcon name="check" className="w-3.5 h-3.5 shrink-0 text-[var(--prefa-aqua)]" />
                    ) : "1"}
                  </span>
                  <span>Nahrát</span>
                </button>
                <button 
                  type="button" 
                  className={`h-11 px-4 flex items-center gap-2 text-sm font-semibold transition border border-transparent rounded-sm ${activeStage === 1 ? "bg-[var(--prefa-ink)] text-white cursor-pointer" : activeStage > 1 ? "bg-[var(--prefa-aqua)]/10 text-[var(--prefa-ink)] cursor-pointer" : "bg-[var(--prefa-white)] text-[var(--prefa-stone)] opacity-50 cursor-not-allowed"}`}
                  disabled={!activeSheet}
                >
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border border-transparent"
                    style={{
                      backgroundColor: activeStage === 1 ? 'var(--prefa-linen)' : 'transparent',
                      color: activeStage === 1 ? 'var(--prefa-ink)' : activeStage > 1 ? 'var(--prefa-aqua)' : 'var(--prefa-stone)',
                      borderColor: activeStage < 1 ? 'var(--prefa-line)' : 'transparent',
                    }}
                  >
                    {activeStage > 1 ? (
                      <VesperIcon name="check" className="w-3.5 h-3.5 shrink-0 text-[var(--prefa-aqua)]" />
                    ) : "2"}
                  </span>
                  <span>Měřítko</span>
                </button>
                <button 
                  type="button" 
                  className={`h-11 px-4 flex items-center gap-2 text-sm font-semibold transition border border-transparent rounded-sm ${activeStage === 2 ? "bg-[var(--prefa-ink)] text-white cursor-pointer" : activeStage > 2 ? "bg-[var(--prefa-aqua)]/10 text-[var(--prefa-ink)] cursor-pointer" : "bg-[var(--prefa-white)] text-[var(--prefa-stone)] opacity-50 cursor-not-allowed"}`}
                  disabled={activeScale === null}
                >
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border border-transparent"
                    style={{
                      backgroundColor: activeStage === 2 ? 'var(--prefa-linen)' : 'transparent',
                      color: activeStage === 2 ? 'var(--prefa-ink)' : activeStage > 2 ? 'var(--prefa-aqua)' : 'var(--prefa-stone)',
                      borderColor: activeStage < 2 ? 'var(--prefa-line)' : 'transparent',
                    }}
                  >
                    {activeStage > 2 ? (
                      <VesperIcon name="check" className="w-3.5 h-3.5 shrink-0 text-[var(--prefa-aqua)]" />
                    ) : "3"}
                  </span>
                  <span>Obkreslit</span>
                </button>
                <button 
                  type="button" 
                  className={`h-11 px-4 flex items-center gap-2 text-sm font-semibold transition border border-transparent rounded-sm ${activeStage === 3 ? "bg-[var(--prefa-ink)] text-white cursor-pointer" : "bg-[var(--prefa-white)] text-[var(--prefa-stone)] opacity-50 cursor-not-allowed"}`}
                  disabled={!tracedElements.some(e => e.storey === currentStorey && e.category === currentCategory)}
                >
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border"
                    style={{
                      backgroundColor: activeStage === 3 ? 'var(--prefa-linen)' : 'transparent',
                      color: activeStage === 3 ? 'var(--prefa-ink)' : 'var(--prefa-stone)',
                      borderColor: activeStage === 3 ? 'transparent' : 'var(--prefa-line)',
                    }}
                  >
                    4
                  </span>
                  <span>Zkontrolovat</span>
                </button>
              </div>
            )}
          </div>

          {currentStep >= 2 && currentStep < maxSteps && activeMascotHelp.text && !hiddenBanners.includes(currentStep) && (
            <section className="drawing-guide" aria-label="Pokyn technické podpory" style={{ height: '74px', minHeight: '74px', borderRadius: '2px' }}>
              <img 
                src="/images/tereza.png" 
                alt="" 
                aria-hidden="true" 
                className="w-10 h-10 rounded-full border border-[var(--prefa-aqua)] object-cover" 
              />
              <div className="flex-1">
                <p className="eyebrow">Tereza · technická podpora</p>
                <strong className="line-clamp-1">{activeMascotHelp.text}</strong>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button 
                  type="button" 
                  className="h-11 px-4 flex items-center justify-center text-sm font-semibold text-white border border-white bg-transparent hover:bg-white hover:text-[var(--prefa-ink)] transition cursor-pointer rounded-sm shrink-0" 
                  onClick={() => setIsHelpDrawerOpen(true)}
                >
                  Poradit se
                </button>
                <button 
                  type="button" 
                  className="h-11 px-4 flex items-center justify-center text-sm font-semibold text-white/60 hover:text-white bg-transparent transition cursor-pointer rounded-sm shrink-0" 
                  onClick={() => setHiddenBanners((prev) => [...prev, currentStep])}
                >
                  Skrýt
                </button>
              </div>
            </section>
          )}

          <div className="drawing-stage-card flex-1 flex flex-col justify-start">
            {/* Step 2: Vnější stěny 1.NP */}
            {currentStep === 2 && (
              <div className="flex-1 flex flex-col space-y-4">
                {!sheet1NP ? (
                  <PdfDocumentUploader
                    title="Nahrát výkres půdorysu 1.NP"
                    subtitle="Nahrajte výkres 1.NP (PDF, PNG, JPG) pro obkreslení obvodových a vnitřních stěnových panelů."
                    onSheetSelected={(sheet) => setSheet1NP(sheet)}
                  />
                ) : (
                  <div className="space-y-4 flex-1 flex flex-col">
                    <InteractiveCanvas
                      backgroundImageUrl={sheet1NP.fileUrl}
                      opacity={sheet1NP.opacity}
                      rotation={sheet1NP.rotation}
                      activeCatalogCode={outerWallCatalogCode}
                      activeCategory="WALL_OUTER"
                      activeStorey="1NP"
                      initialScale={scale1NP}
                      initialElements={tracedElements}
                      onScaleCalibrated={(scale) => setScale1NP(scale)}
                      onElementsChange={(elements) => setTracedElements(elements)}
                      onResetSheet={() => setSheet1NP(null)}
                      onUpdateSheet={(fields) => setSheet1NP((prev) => prev ? { ...prev, ...fields } : null)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Vnitřní stěny 1.NP */}
            {currentStep === 3 && (
              <div className="flex-1 flex flex-col space-y-4">
                <InteractiveCanvas
                  backgroundImageUrl={sheet1NP?.fileUrl}
                  opacity={sheet1NP?.opacity}
                  rotation={sheet1NP?.rotation}
                  activeCatalogCode={innerWallCatalogCode}
                  activeCategory="WALL_INNER"
                  activeStorey="1NP"
                  initialScale={scale1NP}
                  initialElements={tracedElements}
                  onElementsChange={(elements) => setTracedElements(elements)}
                  onResetSheet={() => setSheet1NP(null)}
                  onUpdateSheet={(fields) => setSheet1NP((prev) => prev ? { ...prev, ...fields } : null)}
                />
              </div>
            )}

            {/* Step 4: Strop nad 1.NP */}
            {currentStep === 4 && (
              <div className="flex-1 flex flex-col space-y-4">
                <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0f172a]"></span>
                    <span className="text-xs font-bold text-slate-800">Zdroj výkresu stropu nad 1.NP:</span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      className={`px-3 py-1.5 rounded-lg border font-bold cursor-pointer transition ${
                        ceilingSourceMode === 'USE_FLOOR_PLAN'
                          ? 'bg-[#181a1c] text-white border-[#181a1c]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                      onClick={() => {
                        setCeilingSourceMode('USE_FLOOR_PLAN');
                        setCeilingCatalogCode('STROP_RD');
                      }}
                    >
                      Použít obvod 1.NP
                    </button>
                    <button
                      type="button"
                      className={`px-3 py-1.5 rounded-lg border font-bold cursor-pointer transition ${
                        ceilingSourceMode === 'UPLOAD_NEW'
                          ? 'bg-[#181a1c] text-white border-[#181a1c]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                      onClick={() => setCeilingSourceMode('UPLOAD_NEW')}
                    >
                      Nahrát nový výkres stropu
                    </button>
                  </div>
                </div>

                {ceilingSourceMode === 'USE_FLOOR_PLAN' ? (
                  <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#e8f5e9] text-[#2e7d32] flex items-center justify-center text-xl font-bold">✓</div>
                    <div>
                      <h4 className="text-sm font-black text-[#0f172a]">Stropní konstrukce je navázána na obvodové stěny 1.NP</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-md">
                        Pro stropní konstrukci se použije celá vnitřní vytápěná plocha 1.NP ({floorAreaM2.toFixed(1)} m²).
                      </p>
                    </div>
                  </div>
                ) : !sheetCeiling ? (
                  <PdfDocumentUploader
                    title="Nahrát výkres stropní konstrukce"
                    subtitle="Nahrajte výkres stropu nad 1.NP (PDF, PNG, JPG) pro přesné zaměření."
                    onSheetSelected={(sheet) => setSheetCeiling(sheet)}
                  />
                ) : (
                  <div className="space-y-4 flex-1 flex flex-col">
                    <InteractiveCanvas
                      backgroundImageUrl={sheetCeiling.fileUrl}
                      opacity={sheetCeiling.opacity}
                      rotation={sheetCeiling.rotation}
                      activeCatalogCode={ceilingCatalogCode}
                      activeCategory="CEILING"
                      activeStorey="1NP"
                      initialScale={scaleCeiling}
                      initialElements={tracedElements}
                      onScaleCalibrated={(scale) => setScaleCeiling(scale)}
                      onElementsChange={(elements) => setTracedElements(elements)}
                      onResetSheet={() => setSheetCeiling(null)}
                      onUpdateSheet={(fields) => setSheetCeiling((prev) => prev ? { ...prev, ...fields } : null)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Vnější stěny 2.NP */}
            {currentStep === 5 && (
              <div className="flex-1 flex flex-col space-y-4">
                {!sheet2NP ? (
                  <PdfDocumentUploader
                    title="Nahrát výkres půdorysu 2.NP"
                    subtitle="Nahrajte výkres 2.NP (PDF, PNG, JPG) pro obkreslení stěn druhého nadzemního podlaží."
                    onSheetSelected={(sheet) => setSheet2NP(sheet)}
                  />
                ) : (
                  <div className="space-y-4 flex-1 flex flex-col">
                    <InteractiveCanvas
                      backgroundImageUrl={sheet2NP.fileUrl}
                      opacity={sheet2NP.opacity}
                      rotation={sheet2NP.rotation}
                      activeCatalogCode={outerWallCatalogCode}
                      activeCategory="WALL_OUTER"
                      activeStorey="2NP"
                      initialScale={scale2NP}
                      initialElements={tracedElements}
                      onScaleCalibrated={(scale) => setScale2NP(scale)}
                      onElementsChange={(elements) => setTracedElements(elements)}
                      onResetSheet={() => setSheet2NP(null)}
                      onUpdateSheet={(fields) => setSheet2NP((prev) => prev ? { ...prev, ...fields } : null)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 6: Vnitřní stěny 2.NP */}
            {currentStep === 6 && (
              <div className="flex-1 flex flex-col space-y-4">
                <InteractiveCanvas
                  backgroundImageUrl={sheet2NP?.fileUrl}
                  opacity={sheet2NP?.opacity}
                  rotation={sheet2NP?.rotation}
                  activeCatalogCode={innerWallCatalogCode}
                  activeCategory="WALL_INNER"
                  activeStorey="2NP"
                  initialScale={scale2NP}
                  initialElements={tracedElements}
                  onElementsChange={(elements) => setTracedElements(elements)}
                  onResetSheet={() => setSheet2NP(null)}
                  onUpdateSheet={(fields) => setSheet2NP((prev) => prev ? { ...prev, ...fields } : null)}
                />
              </div>
            )}

            {/* Step 7: Střecha */}
            {currentStep === 7 && (
              <div className="flex-1 flex flex-col space-y-4">
                <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0f172a]"></span>
                    <span className="text-xs font-bold text-slate-800">Zdroj výkresu střešní roviny:</span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      className={`px-3 py-1.5 rounded-lg border font-bold cursor-pointer transition ${
                        roofSourceMode === 'USE_FLOOR_PLAN'
                          ? 'bg-[#181a1c] text-white border-[#181a1c]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                      onClick={() => {
                        setRoofSourceMode('USE_FLOOR_PLAN');
                        setRoofCatalogCode('STRECHA_SIKMA');
                      }}
                    >
                      Použít obvod podlaží
                    </button>
                    <button
                      type="button"
                      className={`px-3 py-1.5 rounded-lg border font-bold cursor-pointer transition ${
                        roofSourceMode === 'UPLOAD_NEW'
                          ? 'bg-[#181a1c] text-white border-[#181a1c]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                      onClick={() => setRoofSourceMode('UPLOAD_NEW')}
                    >
                      Nahrát nový výkres střechy
                    </button>
                  </div>
                </div>

                {roofSourceMode === 'USE_FLOOR_PLAN' ? (
                  <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#e8f5e9] text-[#2e7d32] flex items-center justify-center text-xl font-bold">✓</div>
                    <div>
                      <h4 className="text-sm font-black text-[#0f172a]">Střecha je navázána na půdorysnou plochu</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-md">
                        Základní plocha střechy ({roofAreaM2.toFixed(1)} m² pro sklon 35°) bude odvozena z nejvyššího podlaží.
                      </p>
                    </div>
                  </div>
                ) : !sheetRoof ? (
                  <PdfDocumentUploader
                    title="Nahrát výkres střešní roviny"
                    subtitle="Nahrajte výkres krovu nebo střechy (PDF, PNG, JPG) pro obkreslení střešních panelů."
                    onSheetSelected={(sheet) => setSheetRoof(sheet)}
                  />
                ) : (
                  <div className="space-y-4 flex-1 flex flex-col">
                    <InteractiveCanvas
                      backgroundImageUrl={sheetRoof.fileUrl}
                      opacity={sheetRoof.opacity}
                      rotation={sheetRoof.rotation}
                      activeCatalogCode={roofCatalogCode}
                      activeCategory="ROOF"
                      activeStorey={storeys >= 2 ? '2NP' : '1NP'}
                      initialScale={scaleRoof}
                      initialElements={tracedElements}
                      onScaleCalibrated={(scale) => setScaleRoof(scale)}
                      onElementsChange={(elements) => setTracedElements(elements)}
                      onResetSheet={() => setSheetRoof(null)}
                      onUpdateSheet={(fields) => setSheetRoof((prev) => prev ? { ...prev, ...fields } : null)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 8: Summary & Checklist */}
            {currentStep === maxSteps && (
              <SurchargesAndChecklist
                pricingResult={pricingResult}
                truckAccess={step1Data.truckAccess}
                craneAccess={step1Data.craneAccess}
                onChangeLogistics={(truck, crane) => {
                  setStep1Data((prev) => ({
                    ...prev,
                    truckAccess: truck,
                    craneAccess: crane,
                  }));
                }}
                hasOversizedOpenings={hasOversizedOpenings}
                selectedMonthCode={selectedMonthCode}
                onSelectMonth={setSelectedMonthCode}
                onSubmitOrder={async () => {
                  setIsSubmitting(true);
                  alert('Vaše konfigurace byla úspěšně odeslána k odborné kontrole! Náš specialista na dřevostavby se vám ozve do 24 hodin.');
                  setIsSubmitting(false);
                }}
                isSubmitting={isSubmitting}
              />
            )}
          </div>

          {currentStep < maxSteps && (
            <label className="drawing-note">
              <span>Poznámka ke kroku</span>
              <input
                value={stepNotes[currentStep] || ''}
                onChange={(e) => updateStepNote(currentStep, e.target.value)}
                placeholder="Např. fasáda bude kombinovat omítku a dřevěný obklad…"
              />
            </label>
          )}
        </section>

        {/* Right Panel: Context Product Panel */}
        {currentStep < maxSteps && !isHelpDrawerOpen && (
          <ContextProductPanel
            category={currentCategory === 'SYSTEM' ? 'WALL_OUTER' : currentCategory}
            selectedCode={
              currentCategory === 'WALL_OUTER'
                ? outerWallCatalogCode
                : currentCategory === 'WALL_INNER'
                ? innerWallCatalogCode
                : currentCategory === 'CEILING'
                ? ceilingCatalogCode
                : currentCategory === 'ROOF'
                ? roofCatalogCode
                : '1.1'
            }
            tracedElements={tracedElements}
            currentStorey={currentStorey}
            stepQuantityM2={
              currentCategory === 'WALL_OUTER'
                ? outerWallsGrossM2
                : currentCategory === 'WALL_INNER'
                ? innerWallsGrossM2
                : currentCategory === 'CEILING'
                ? finalCeilingAreaM2
                : roofAreaM2
            }
            flatPricePerTruckExVat={transportZone.pricePerTruck}
            zoneName={transportZone.zoneName}
            includeGroundFloor1NP={includeGroundFloor1NP}
            onToggleIncludeGroundFloor1NP={(include) => setIncludeGroundFloor1NP(include)}
            storeysCount={step1Data.storeysCount}
            atticHeight={atticHeightMM}
            onAtticHeightChange={setAtticHeightMM}
            onSelectCode={(code) => {
              if (currentCategory === 'WALL_OUTER') setOuterWallCatalogCode(code);
              if (currentCategory === 'WALL_INNER') setInnerWallCatalogCode(code);
              if (currentCategory === 'CEILING') setCeilingCatalogCode(code);
              if (currentCategory === 'ROOF') setRoofCatalogCode(code);
            }}
          />
        )}

        {isHelpDrawerOpen && (
          <aside className="support-drawer animate-slide-in font-sans">
            <header className="support-drawer-header">
              <h3>Technická podpora</h3>
              <button 
                type="button" 
                className="w-11 h-11 flex items-center justify-center cursor-pointer hover:bg-[var(--prefa-paper)] transition rounded-sm text-[var(--prefa-stone)] hover:text-[var(--prefa-ink)] shrink-0"
                onClick={() => setIsHelpDrawerOpen(false)}
                aria-label="Zavřít nápovědu"
              >
                <VesperIcon name="close" className="w-[18px] h-[18px]" />
              </button>
            </header>
            <div className="support-drawer-content">
              <div className="support-guide-intro">
                <img src="/images/tereza.png" alt="Tereza" />
                <div>
                  <strong>Tereza</strong>
                  <span>Specialista na dřevostavby</span>
                </div>
              </div>
              
              <div className="support-main-text">
                <h4 className="font-display">Jak v tomto kroku postupovat?</h4>
                <p className="font-tech">{activeMascotHelp.text || "V tomto kroku zadejte výchozí parametry domu a zvolte typ konstrukce."}</p>
              </div>

              <div className="support-faq font-tech">
                <h4 className="font-display">Časté otázky (FAQ)</h4>
                <ul>
                  {currentStep === 1 && (
                    <>
                      <li>
                        <strong>Jak zvolím správné místo stavby?</strong>
                        <p>Zadejte název obce nebo PSČ. Konfigurátor automaticky ověří vzdálenost a spočítá náklady na logistiku a kamiony.</p>
                      </li>
                      <li>
                        <strong>Co když plánuji stavět později než za 60 dní?</strong>
                        <p>Termín můžete zvolit i vzdálenější. Zimní a podzimní termíny montáže navíc nabízejí zajímavou kapacitní slevu.</p>
                      </li>
                    </>
                  )}
                  {currentStep === 2 && (
                    <>
                      <li>
                        <strong>Jak nastavit měřítko výkresu?</strong>
                        <p>Najděte na výkresu známou kótu (např. kótovanou stěnu), klikněte na její počátek a konec a zadejte její délku v milimetrech.</p>
                      </li>
                      <li>
                        <strong>Co když chci nahrát jiný výkres?</strong>
                        <p>Klikněte v horní liště na tlačítko Změnit výkres a nahrajte nový podklad.</p>
                      </li>
                    </>
                  )}
                  {currentStep === 3 && (
                    <>
                      <li>
                        <strong>Musím obkreslit všechny příčky?</strong>
                        <p>Doporučujeme obkreslit všechny nosné i nenosné stěny pro co nejpřesnější výkaz výměr a cenovou nabídku.</p>
                      </li>
                    </>
                  )}
                  {currentStep === 4 && (
                    <>
                      <li>
                        <strong>Jaký je rozdíl mezi materiály stropu?</strong>
                        <p>Standardní stropní panely jsou vhodné pro běžné rodinné domy. Pro náročnější konstrukce doporučujeme posouzení.</p>
                      </li>
                    </>
                  )}
                  {currentStep === 7 && (
                    <>
                      <li>
                        <strong>Jak ovlivní sklon střechy cenu?</strong>
                        <p>Sklon střechy určuje celkovou 3D plochu střešních panelů a množství spotřebovaného materiálu.</p>
                      </li>
                    </>
                  )}
                  {currentStep === 8 && (
                    <>
                      <li>
                        <strong>Jaké jsou další kroky po odeslání?</strong>
                        <p>Náš specialista do 24 hodin prověří vaši konfiguraci a telefonicky s vámi projde statické a logistické detaily.</p>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              <div className="support-contact font-tech">
                <h4 className="font-display">Potřebujete poradit telefonicky?</h4>
                <p>Můžete mě kontaktovat přímo:</p>
                <strong>+420 777 888 999</strong>
                <span>tereza.podpora@prefasop.cz</span>
              </div>
            </div>
          </aside>
        )}
      </div>

      <footer className="drawing-footer">
        <div className="footer-price">
          <span>Cena tohoto kroku</span>
          <strong className="tabular-nums">{getStepCostExVat(currentStep).toLocaleString('cs-CZ')} Kč <i>bez DPH</i></strong>
        </div>
        <div className="footer-status">
          <span>Do ceny započteno {completedSteps.filter(s => s >= 2 && s < maxSteps).length} ze 6 konstrukčních částí</span>
        </div>
        <div className="footer-overall">
          <span>Průběžná cena celkem</span>
          <strong className="tabular-nums">{getRunningTotalExVat(currentStep).toLocaleString('cs-CZ')} Kč</strong>
        </div>
        <button 
          className="footer-back cursor-pointer" 
          type="button" 
          onClick={() => {
            if (currentStep === 7 && storeys === 1) {
              setCurrentStep(4);
            } else {
              setCurrentStep(Math.max(1, currentStep - 1));
            }
          }}
        >
          Zpět
        </button>
        <button 
          className="footer-primary cursor-pointer" 
          type="button" 
          disabled={isFooterActionDisabled()}
          onClick={() => {
            if (currentStep === maxSteps) {
              const btn = document.getElementById('submit-config-btn');
              if (btn) btn.click();
            } else {
              handleConfirmStep(currentStep);
            }
          }}
        >
          <span>{getFooterActionText()}</span>
          <VesperIcon name="next" className="w-[18px] h-[18px] text-white shrink-0" />
        </button>
      </footer>
      {isResetConfirmOpen && (
        <div className="fixed inset-0 bg-[#292527]/50 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-sm w-full border border-[#ded8cf] text-center" style={{ borderRadius: '2px' }}>
            <h3 className="font-display font-bold text-base text-[#292527] mb-2">Smazat konfiguraci?</h3>
            <p className="text-xs font-tech text-[#5e5c55] leading-relaxed mb-6">
              Opravdu si přejete smazat všechna zadaná data, nahrané výkresy a začít s konfigurací od začátku? Tato akce je nevratná.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition cursor-pointer"
                style={{ borderRadius: '2px' }}
                onClick={() => {
                  handleResetAllData();
                  setIsResetConfirmOpen(false);
                }}
              >
                Smazat vše
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-[#e7e0d5] hover:bg-[#ded8cf] text-[#292527] text-xs font-bold transition cursor-pointer"
                style={{ borderRadius: '2px' }}
                onClick={() => setIsResetConfirmOpen(false)}
              >
                Zrušit
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function getMascotHelpForStep(
  step: number,
  maxSteps: number,
  hasSheet: boolean,
  isCalibrated: boolean,
  isClosedLoop: boolean,
  activeLabel: string
): { state: MascotState; text: string } {
  if (step === 1) {
    return {
      state: 'WELCOME',
      text: 'Vítám vás v konfigurátoru! Řekněte mi, kdy chcete mít hotovo a společně to tu celé nachystáme a spočítáme.',
    };
  }

  if (step === maxSteps) {
    return {
      state: 'SUCCESS',
      text: 'Zkontrolujte celkovou rekapitulaci rozpočtu. Pokud vše souhlasí, odešlete nezávaznou poptávku.',
    };
  }

  // Strop
  if (activeLabel.toLowerCase().includes('strop')) {
    if (!hasSheet) {
      return {
        state: 'UPLOAD',
        text: 'Nahrajte výkres stropní konstrukce. Výkres je potřeba k přesnému zaměření plochy stropních panelů. Jakmile ho nahrajete, zobrazí se na plátně.',
      };
    }
    if (!isCalibrated) {
      return {
        state: 'CALIBRATE',
        text: 'Teď nastavíme měřítko. Klikněte na tlačítko Kalibrovat A-B v liště pod výkresem, následně klikněte na dva konce známé kóty ve výkresu a zadejte její skutečnou délku v metrech. Tím zajistíme, že rozměry stropu budou odpovídat měřítku. Úspěšnou kalibraci poznáte podle toho, že se zpřístupní nástroje pro výběr stropních prvků.',
      };
    }
    return {
      state: 'SUCCESS',
      text: 'Plocha stropu je určena! Nyní zvolte provedení stropní konstrukce v pravém panelu a pokračujte na další krok.',
    };
  }

  // General drawing steps (Walls, Roof)
  if (!hasSheet) {
    return {
      state: 'UPLOAD',
      text: `Nahrajte výkres (PDF, PNG nebo JPG) pro ${activeLabel.toLowerCase()}. Výkres je potřeba k přesnému obkreslení stěn a zjištění výměry. Jakmile ho nahrajete, zobrazí se na plátně a posune nás k nastavení měřítka.`,
    };
  }

  if (!isCalibrated) {
    return {
      state: 'CALIBRATE',
      text: 'Teď nastavíme měřítko. Klikněte na tlačítko Kalibrovat A-B v liště pod výkresem, následně klikněte na dva konce známé kóty ve výkresu a zadejte její skutečnou délku v metrech. Tím zajistíme, že všechny kreslené rozměry budou přesně odpovídat realitě. Úspěšnou kalibraci poznáte podle toho, že se zpřístupní nástroje pro kreslení.',
    };
  }

  if (!isClosedLoop) {
    return {
      state: 'DRAW_OUTER',
      text: `Nyní obkreslete konstrukci. Klikáním na plátno veďte čáry podél stěn na výkresu (u vnějších stěn a střechy tvar uzavřete kliknutím do počátečního bodu). Tím získáme přesnou délku a plochu prvků. Hotovo bude, jakmile konstrukci obkreslíte a na plátně se zobrazí naměřené rozměry a vypočtená plocha.`,
    };
  }

  return {
    state: 'SUCCESS',
    text: 'Obvod je hotový. Zkontrolujte výměru a vybranou skladbu. Potom část potvrďte.',
  };
}
