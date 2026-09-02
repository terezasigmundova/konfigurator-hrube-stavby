'use client';

import React, { useState } from 'react';
import { TraceElement } from '@/components/canvas/InteractiveCanvas';
import { VesperIcon, VesperIconName } from '@/components/ui/VesperIcon';
import { calculatePolygonAreaM2, calculateGroundFloorArea, isEnvelopeClosed } from '@/lib/geometry';
import { PanelDetailModal } from '@/components/modals/PanelDetailModal';
import { WALL_PANELS, getProductByCode } from '@/lib/catalog';

const iconPath = (name: string) => `/icons/${name}.svg`;

function Icon({ name, className = "" }: { name: string; className?: string }) {
  return <img className={`icon ${className}`} src={iconPath(name)} alt="" aria-hidden="true" />;
}

export interface ProductOption {
  code: string;
  userTitle: string;
  badgeTag?: string;
  description: string;
  stepPriceExVat: number;
  unitPriceM2: number;
  image3DUrl?: string;
  priceDeltaText?: string;
  isRecommended?: boolean;
  requiresReview?: boolean;
  technicalCode: string;
  insulationLayers?: string;
  iconName?: VesperIconName;
}

interface ContextProductPanelProps {
  category: 'WALL_OUTER' | 'WALL_INNER' | 'CEILING' | 'ROOF';
  selectedCode: string;
  tracedElements?: TraceElement[];
  currentStorey?: '1NP' | '2NP' | '3NP';
  stepQuantityM2?: number;
  flatPricePerTruckExVat?: number;
  zoneName?: string;
  includeGroundFloor1NP?: boolean;
  onToggleIncludeGroundFloor1NP?: (include: boolean) => void;
  onSelectCode: (code: string) => void;
  storeysCount?: number;
  atticHeight?: number;
  onAtticHeightChange?: (val: number) => void;
}

export function ContextProductPanel({
  category = 'WALL_OUTER',
  selectedCode = 'OS_VF_01',
  tracedElements = [],
  currentStorey = '1NP',
  stepQuantityM2 = 0,
  flatPricePerTruckExVat = 6500,
  zoneName = 'Zóna 1 — Severní Morava (Bruntál)',
  includeGroundFloor1NP = true,
  onToggleIncludeGroundFloor1NP,
  onSelectCode,
  storeysCount = 2,
  atticHeight = 1000,
  onAtticHeightChange,
}: ContextProductPanelProps) {
  const [modalPanelCode, setModalPanelCode] = useState<string | null>(null);
  const [isCatalogOpen, setIsCatalogOpen] = useState<boolean>(false);

  React.useEffect(() => {
    setIsCatalogOpen(false);
  }, [category, currentStorey]);

  const activeElements = tracedElements.filter(
    (el) => el.category === category && (category === 'ROOF' || category === 'CEILING' || el.storey === currentStorey)
  );

  const hasDrawnElements = activeElements.length > 0;

  const wallPerimeterM = category.startsWith('WALL')
    ? activeElements.reduce((sum, el) => sum + el.lengthOrAreaM, 0)
    : 0;

  const grossWallAreaM2 = category.startsWith('WALL')
    ? wallPerimeterM * 2.8
    : category === 'ROOF'
    ? (hasDrawnElements
        ? activeElements.reduce((sum, el) => {
            const pitch = el.pitchDegrees ?? 35;
            const pitchRad = (pitch * Math.PI) / 180;
            return sum + (pitch > 0 ? el.lengthOrAreaM / Math.cos(pitchRad) : el.lengthOrAreaM);
          }, 0)
        : stepQuantityM2)
    : hasDrawnElements
    ? activeElements.reduce((sum, el) => sum + el.lengthOrAreaM, 0)
    : stepQuantityM2;

  // Pricing calculations are performed on 100% gross panel area (no opening deductions)
  const netAreaM2 = grossWallAreaM2;

  const groundFloorAreaM2 = calculateGroundFloorArea(tracedElements);
  const groundFloorCost = 0;

  const getProductOptions = (): ProductOption[] => {
    if (category === 'WALL_OUTER') {
      const baseCost = netAreaM2 * 8500;
      return WALL_PANELS.map((p) => {
        const stepCost = netAreaM2 * p.unitPriceExVat;
        const delta = stepCost - baseCost;
        return {
          code: p.code,
          userTitle: p.name,
          badgeTag: `Skladba ${p.code}`,
          description: p.subtitle,
          stepPriceExVat: stepCost,
          unitPriceM2: p.unitPriceExVat,
          image3DUrl: p.images.thumbnailWebp || p.images.assembledCutawayWebp,
          isRecommended: p.isRecommended,
          priceDeltaText: delta !== 0 && netAreaM2 > 0 ? `${delta > 0 ? '+' : ''}${new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(delta)}` : undefined,
          technicalCode: `${p.code} (tl. ${p.declaredThicknessMm.toString().replace('.', ',')} mm • U = ${p.technicalParameters.uValue ?? 0.14} W/m²K)`,
          insulationLayers: p.layers.slice(0, 3).map((l) => l.name).join(' • '),
          iconName: 'external-wall' as VesperIconName,
        };
      });
    }

    if (category === 'WALL_INNER') {
      return [
        {
          code: 'NS_VF_01',
          userTitle: 'Vnitřní nosná stěna',
          badgeTag: 'Skladba 2.1',
          description: 'Vnitřní nosný panel s vysokou únosností a akustickou izolací mezi místnostmi.',
          stepPriceExVat: netAreaM2 * 3500,
          unitPriceM2: 3500,
          image3DUrl: '/panels/NS_VF_01_3D.jpg',
          isRecommended: true,
          technicalCode: 'NS_VF_01 (tl. 170 mm • Rw = 46 dB)',
          insulationLayers: 'KVH 120 mm + Minerální akustická vata + 2×15 mm opláštění',
          iconName: 'internal-wall',
        },
        {
          code: 'DS_VF_01',
          userTitle: 'Akustická mezibytová příčka',
          badgeTag: 'Skladba 2.2',
          description: 'Akustická mezibytová dvojitá stěna se vzduchovou mezerou pro ložnice a dvojdomky.',
          stepPriceExVat: netAreaM2 * 5500,
          unitPriceM2: 5500,
          image3DUrl: '/panels/DS_VF_01_3D.jpg',
          priceDeltaText: 'Vyšší akustický útlum Rw = 62 dB',
          technicalCode: 'DS_VF_01 (tl. 300 mm • Rw = 62 dB)',
          insulationLayers: 'Dvojitý KVH rám + Akustická mezerová izolace',
          iconName: 'internal-wall',
        },
        {
          code: 'PS_VF_01',
          userTitle: 'Vnitřní nenosná příčka 100 mm',
          badgeTag: 'Skladba 2.3',
          description: 'Lehký mezipokojový dělící panel pro nenosné vnitřní příčky.',
          stepPriceExVat: netAreaM2 * 2800,
          unitPriceM2: 2800,
          image3DUrl: '/panels/NS_VF_01_3D.jpg',
          technicalCode: 'PS_VF_01 (tl. 130 mm • Rw = 42 dB)',
          insulationLayers: 'KVH 100 mm + Minerální izolace + 2×12,5 mm opláštění',
          iconName: 'internal-wall',
        },
      ];
    }

    if (category === 'CEILING') {
      if (storeysCount === 1) {
        return [
          {
            code: 'STROP_RD',
            userTitle: 'A) Pochůzný strop (galerie, loft)',
            badgeTag: 'Skladba 3.1',
            description: 'Vhodný pro pochůznou galerii, loft nebo úložné prostory. Vyžaduje zakreslení plochy na plátno.',
            stepPriceExVat: netAreaM2 * 6000,
            unitPriceM2: 6000,
            image3DUrl: '/panels/STROP_RD_3D.jpg',
            technicalCode: 'STROP_RD (tl. 432 mm)',
            iconName: 'floor-slab',
          },
          {
            code: 'STROP_OPEN_TRUSS',
            userTitle: 'B) Prostor otevřený do krovu',
            badgeTag: 'Oblíbený benefit',
            description: 'Designový prvek otevřeného štítu dodáváme bez příplatku k ceně sedlové střechy.',
            stepPriceExVat: 0,
            unitPriceM2: 0,
            image3DUrl: '/panels/STROP_RD_3D.jpg',
            technicalCode: 'OTEVŘENÝ KROV (0 Kč)',
            iconName: 'roof',
          },
          {
            code: 'STROP_SUSPENDED',
            userTitle: 'C) Zavěšený podhled (nerealizuje se)',
            badgeTag: 'Dokončovací práce',
            description: 'Zavěšené podhledy nerealizujeme. Jsou předmětem dokončovacích prací ze strany klienta.',
            stepPriceExVat: 0,
            unitPriceM2: 0,
            image3DUrl: '/panels/STROP_RD_3D.jpg',
            technicalCode: 'ZAVĚŠENÝ PODHLED (0 Kč)',
            iconName: 'info',
          },
        ];
      } else {
        return [
          {
            code: 'STROP_RD',
            userTitle: 'Strop pro rodinné domy',
            badgeTag: 'Skladba 3.1',
            description: 'Prefabrikovaný mezipodlažní stropní dílec s podlahovým vytápěním a kročejovou izolací.',
            stepPriceExVat: netAreaM2 * 6000,
            unitPriceM2: 6000,
            image3DUrl: '/panels/STROP_RD_3D.jpg',
            isRecommended: true,
            technicalCode: 'STROP_RD (tl. 432 mm • Lnw = 48 dB)',
            insulationLayers: 'Dřevěné nosníky + Kročejová izolace + Zklopový podhled',
            iconName: 'floor-slab',
          },
          {
            code: 'STROP_BD',
            userTitle: 'Akustický strop pro bytové domy',
            badgeTag: 'Skladba 3.2',
            description: 'Akustický stropní dílec se sádrovláknitým voštinovým akustickým ZÁSYPEM pro mezipodlaží bytových domů.',
            stepPriceExVat: netAreaM2 * 7500,
            unitPriceM2: 7500,
            image3DUrl: '/panels/STROP_RD_3D.jpg',
            priceDeltaText: 'Fermacell voštinový zásyp pro útlum zvuku',
            technicalCode: 'STROP_BD (tl. 492 mm • Rw = 64 dB • Lnw = 41 dB)',
            insulationLayers: 'Voštinový akustický zásyp + Minerální vata 140mm + Akustické závěsy',
            iconName: 'floor-slab',
          },
        ];
      }
    }

    return [
      {
        code: 'STRECHA_SIKMA',
        userTitle: 'Šikmá střecha',
        badgeTag: 'Skladba 4.1',
        description: 'Prefabrikovaný izolovaný dílec pro šikmé střechy. Cena je kompletní včetně střešního pláště a krytiny.',
        stepPriceExVat: netAreaM2 * 6500,
        unitPriceM2: 6500,
        image3DUrl: '/panels/STRECHA_SIKMA_3D.jpg',
        isRecommended: true,
        technicalCode: 'STRECHA_SIKMA (tl. 455 mm • U = 0,11 W/m²K)',
        insulationLayers: 'Krokevní nosníky + Parotěsná zábrana + Minerální vata 360 mm',
        iconName: 'roof',
      },
      {
        code: 'STRECHA_PLOCHA',
        userTitle: 'Plochá střecha s atikou',
        badgeTag: 'Skladba 4.2',
        description: 'Prefabrikovaný dílec ploché střechy se spádovou izolací a atikou. Obvodová atika je započtena v ceně.',
        stepPriceExVat: netAreaM2 * 7000,
        unitPriceM2: 7000,
        image3DUrl: '/panels/STRECHA_PLOCHA_3D.jpg',
        technicalCode: 'STRECHA_PLOCHA (tl. 564,5 mm • U = 0,12 W/m²K)',
        insulationLayers: 'Spádové dílce + Parotěsná fólie + Tepelná izolace EPS/minerál',
        iconName: 'roof',
      },
    ];
  };

  const options = getProductOptions();
  const activeOption = options.find((o) => o.code === selectedCode) || options[0];

  const panelsCost = Math.round((activeOption ? activeOption.unitPriceM2 * netAreaM2 : 0) + groundFloorCost);
  const assemblyCost = Math.round(panelsCost * 0.18);
  const handlingCost = Math.round(panelsCost * 0.04);
  const transportCost = (category === 'WALL_OUTER' || category === 'CEILING' || category === 'ROOF') 
    ? (flatPricePerTruckExVat || 15000) 
    : 0;
  const contingencyCost = Math.round((panelsCost + assemblyCost + handlingCost + transportCost) * 0.03);
  const currentStepTotalExVat = panelsCost + assemblyCost + handlingCost + transportCost + contingencyCost;
  return (
    <>
      <aside className="drawing-catalog" aria-label="Výběr panelu a cena">
      <div className="catalog-heading">
        <p className="eyebrow">Katalog konstrukcí</p>
        <h2>Panel pro aktuální krok</h2>
        <p>Vyberte certifikovanou konstrukci pro {category === 'WALL_OUTER' ? 'obvodové stěny' : category === 'WALL_INNER' ? 'vnitřní stěny' : category === 'CEILING' ? 'stropní panely' : 'střešní panely'} {currentStorey}.</p>
      </div>

      <article className="panel-card bg-[var(--prefa-white)] border border-[var(--prefa-line)] rounded-sm overflow-hidden text-left">
        <div className="panel-visual bg-[#f2ede4] flex items-center justify-center p-3 border-b border-[var(--prefa-line)] h-[175px] overflow-hidden">
          {activeOption.image3DUrl ? (
            <img
              src={activeOption.image3DUrl}
              alt={activeOption.userTitle}
              className="max-h-[155px] w-auto max-w-[85%] object-contain object-center drop-shadow-xs"
            />
          ) : (
            <VesperIcon name={activeOption.iconName || 'external-wall'} className="w-16 h-16 text-[var(--prefa-ink)]" />
          )}
        </div>
        <div className="panel-card-copy p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold text-[var(--prefa-ink)] font-sans">{activeOption.userTitle}</h3>
            <button
              type="button"
              onClick={() => setModalPanelCode(activeOption.code)}
              className="text-xs text-[var(--prefa-aqua)] hover:text-[var(--prefa-ink)] font-bold transition shrink-0 cursor-pointer underline decoration-dotted"
            >
              Vlastnosti panelu
            </button>
          </div>
          <p className="text-xs text-[var(--prefa-cedar)] mt-1.5 leading-relaxed font-sans">{activeOption.description}</p>
          <dl className="mt-3.5 space-y-0.5 font-sans">
            <div className="flex items-center justify-between border-t border-[var(--prefa-line)]/40 py-2">
              <dt className="text-xs font-medium text-[var(--prefa-cedar)]">Skladba</dt>
              <dd className="text-xs font-bold text-[var(--prefa-ink)]">{activeOption.badgeTag || activeOption.code}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-[var(--prefa-line)]/40 py-2">
              <dt className="text-xs font-medium text-[var(--prefa-cedar)]">Parametry</dt>
              <dd className="text-xs font-bold text-[var(--prefa-ink)]">{activeOption.technicalCode.includes('•') ? activeOption.technicalCode.split('•')[1]?.trim() : activeOption.technicalCode}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-[var(--prefa-line)]/40 py-2">
              <dt className="text-xs font-medium text-[var(--prefa-cedar)]">Cena panelu</dt>
              <dd className="text-xs font-bold text-[var(--prefa-ink)] tabular-nums">{activeOption.unitPriceM2.toLocaleString('cs-CZ')} Kč/m²</dd>
            </div>
          </dl>

          <div className="panel-variant-container flex flex-col border-t border-[var(--prefa-line)]/40 pt-3.5 mt-2 font-sans text-xs space-y-2">
            {category === 'WALL_OUTER' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[var(--prefa-cedar)] uppercase tracking-wider">Volba skladby obvodové stěny</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5" aria-label="Skladba obvodové stěny">
                  {options.map((opt) => (
                    <button
                      key={opt.code}
                      type="button"
                      className={`h-11 flex items-center justify-center font-bold border transition cursor-pointer rounded-sm text-xs ${opt.code === selectedCode ? 'active bg-[var(--prefa-ink)] border-[var(--prefa-ink)] text-white shadow-xs' : 'bg-[var(--prefa-white)] border-[var(--prefa-line)] text-[var(--prefa-ink)] hover:bg-[var(--prefa-paper)]'}`}
                      onClick={() => onSelectCode(opt.code)}
                    >
                      <span>{opt.code}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : category === 'WALL_INNER' ? (
              <div className="space-y-3">
                <div>
                  <p className="font-bold text-[var(--prefa-cedar)] uppercase tracking-wider text-[10px] mb-1.5">Nosné stěny</p>
                  <div className="flex flex-wrap gap-1.5">
                    {options.slice(0, 2).map((opt) => (
                      <button
                        key={opt.code}
                        type="button"
                        onClick={() => onSelectCode(opt.code)}
                        className={`h-11 px-3 flex items-center justify-center font-bold border transition cursor-pointer rounded-sm text-xs ${opt.code === selectedCode ? 'active bg-[var(--prefa-ink)] border-[var(--prefa-ink)] text-white' : 'bg-[var(--prefa-white)] border-[var(--prefa-line)] text-[var(--prefa-ink)] hover:bg-[var(--prefa-paper)]'}`}
                      >
                        {opt.userTitle.replace('Vnitřní ', '').replace('Akustická ', '')}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-bold text-[var(--prefa-cedar)] uppercase tracking-wider text-[10px] mb-1.5">Příčky</p>
                  <div className="flex flex-wrap gap-1.5">
                    {options.slice(2).map((opt) => (
                      <button
                        key={opt.code}
                        type="button"
                        onClick={() => onSelectCode(opt.code)}
                        className={`h-11 px-3 flex items-center justify-center font-bold border transition cursor-pointer rounded-sm text-xs ${opt.code === selectedCode ? 'active bg-[var(--prefa-ink)] border-[var(--prefa-ink)] text-white' : 'bg-[var(--prefa-white)] border-[var(--prefa-line)] text-[var(--prefa-ink)] hover:bg-[var(--prefa-paper)]'}`}
                      >
                        {opt.userTitle.replace('Vnitřní nenosná ', '')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : category === 'CEILING' && storeysCount === 1 ? (
              <div className="space-y-3">
                <p className="font-bold text-[var(--prefa-cedar)] uppercase tracking-wider text-[10px] mb-1">Volba konstrukce stropu</p>
                <div className="flex flex-col gap-1.5">
                  {options.map((opt) => (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => onSelectCode(opt.code)}
                      className={`h-11 px-3 flex items-center justify-between font-bold border transition cursor-pointer rounded-sm text-xs ${opt.code === selectedCode ? 'active bg-[var(--prefa-ink)] border-[var(--prefa-ink)] text-white' : 'bg-[var(--prefa-white)] border-[var(--prefa-line)] text-[var(--prefa-ink)] hover:bg-[var(--prefa-paper)]'}`}
                    >
                      <span>{opt.userTitle.split(') ')[1] || opt.userTitle}</span>
                      <span className="text-[10px] font-medium opacity-75">{opt.code === 'STROP_RD' ? 'Standardní' : 'Zdarma / Nerealizujeme'}</span>
                    </button>
                  ))}
                </div>

                {selectedCode === 'STROP_RD' && onAtticHeightChange && (
                  <div className="mt-3 p-3 bg-[var(--prefa-paper)] border border-[var(--prefa-line)] rounded-sm space-y-1.5 font-sans text-xs">
                    <label className="block font-bold text-[var(--prefa-ink)]" htmlFor="attic-height">
                      Výška atiky / nadezdívky nad stropem:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="attic-height"
                        type="number"
                        min="0"
                        max="3000"
                        value={atticHeight}
                        onChange={(e) => onAtticHeightChange(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full h-9 px-3 border border-[var(--prefa-line)] bg-white rounded-sm text-sm text-[var(--prefa-ink)] focus:outline-none focus:border-[var(--prefa-aqua)]"
                      />
                      <span className="text-slate-500 font-bold">mm</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[var(--prefa-cedar)] align-baseline">Varianta</span>
                <div className="panel-switcher flex items-center gap-1.5 h-11" aria-label="Typ konstrukce">
                  {options.map((opt, idx) => (
                    <button
                      key={opt.code}
                      type="button"
                      className={`w-11 h-11 flex items-center justify-center font-bold border transition cursor-pointer rounded-sm text-sm ${opt.code === selectedCode ? 'active bg-[var(--prefa-ink)] border-[var(--prefa-ink)] text-white' : 'bg-[var(--prefa-white)] border-[var(--prefa-line)] text-[var(--prefa-ink)] hover:bg-[var(--prefa-paper)]'}`}
                      onClick={() => onSelectCode(opt.code)}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </article>

      {/* User Information Explanatory Notes */}
      {category === 'WALL_OUTER' && (
        <div className="mt-4 p-4 bg-[var(--prefa-paper)] border border-[var(--prefa-line)] rounded-sm space-y-2.5 text-xs font-sans text-[var(--prefa-cedar)] text-left">
          <div className="flex items-center justify-between pb-1.5 border-b border-[var(--prefa-line)]/50">
            <span className="font-bold text-[var(--prefa-ink)] flex items-center gap-1.5">
              <VesperIcon name="info" className="w-4 h-4" />
              Informace o vnějších stěnách
            </span>
          </div>
          <ul className="list-disc pl-4 space-y-1 leading-relaxed font-medium">
            <li><strong>Výška stěn:</strong> Konstrukční výška stěnových panelů PREFA je <strong>2,8 m</strong> (započteno v kalkulaci).</li>
            <li><strong>Okna a otvory:</strong> Kalkulace již uvažuje s přípravou standardních stavebních otvorů pro rodinné domy.</li>
            <li><strong>Kalkulační plocha:</strong> Výměra je počítána ze 100 % hrubé plochy panelů (cena za m² již uvažuje se "ztratným" na otvory).</li>
            <li><strong>Nadrozměrné otvory:</strong> Otvory nad 10 m² (velká okna/portály) vyžadují posouzení statikem.</li>
            <li><strong>Požární odolnost:</strong> U požární stěny <strong>OS_VF_03 (DP1)</strong> ověřujeme konfiguraci podle PBŘ a projektové dokumentace.</li>
          </ul>
        </div>
      )}

      {category === 'WALL_INNER' && (
        <div className="mt-4 p-4 bg-[var(--prefa-paper)] border border-[var(--prefa-line)] rounded-sm space-y-2.5 text-xs font-sans text-[var(--prefa-cedar)] text-left">
          <div className="flex items-center justify-between pb-1.5 border-b border-[var(--prefa-line)]/50">
            <span className="font-bold text-[var(--prefa-ink)] flex items-center gap-1.5">
              <VesperIcon name="info" className="w-4 h-4" />
              Informace o vnitřních panelech
            </span>
          </div>
          <ul className="list-disc pl-4 space-y-1 leading-relaxed font-medium">
            <li><strong>Výška stěn:</strong> Konstrukční výška vnitřních příček a nosných stěn je <strong>2,8 m</strong>.</li>
            <li><strong>Dveřní otvory:</strong> Kalkulace uvažuje se standardní přípravou stavebních otvorů pro interiérové dveře.</li>
            <li><strong>Plocha panelů:</strong> Výměra je počítána ze 100 % hrubé plochy panelů bez odpočtu menších otvorů.</li>
          </ul>
        </div>
      )}

      {category === 'CEILING' && (
        <div className="mt-4 p-4 bg-[var(--prefa-paper)] border border-[var(--prefa-line)] rounded-sm space-y-2.5 text-xs font-sans text-[var(--prefa-cedar)] text-left">
          <div className="flex items-center justify-between pb-1.5 border-b border-[var(--prefa-line)]/50">
            <span className="font-bold text-[var(--prefa-ink)] flex items-center gap-1.5">
              <VesperIcon name="info" className="w-4 h-4" />
              Informace o stropní konstrukci
            </span>
          </div>
          <ul className="list-disc pl-4 space-y-1 leading-relaxed font-medium">
            {storeysCount === 1 ? (
              <>
                <li><strong>Otevřený krov (Option B):</strong> Velký benefit! Designový prvek otevřeného štítu dodáváme bez příplatku k ceně sedlové střechy.</li>
                <li><strong>Pochůzný strop (Option A):</strong> Vhodný pro galerii či úložné prostory. Vyžaduje zakreslení plochy na plátno.</li>
                <li><strong>Zavěšené podhledy (Option C):</strong> Nerealizujeme, jsou předmětem dokončovacích prací.</li>
              </>
            ) : (
              <>
                <li><strong>Schodišťový otvor:</strong> Kalkulace automaticky zohledňuje paušální odpočet plochy schodiště (<strong>-6 m²</strong>).</li>
                <li><strong>Skladba stropu:</strong> Strop RD obsahuje kročejovou izolaci a integrované podlahové vytápění.</li>
              </>
            )}
          </ul>
        </div>
      )}

      {category === 'ROOF' && (
        <div className="mt-4 p-4 bg-[var(--prefa-paper)] border border-[var(--prefa-line)] rounded-sm space-y-2.5 text-xs font-sans text-[var(--prefa-cedar)] text-left">
          <div className="flex items-center justify-between pb-1.5 border-b border-[var(--prefa-line)]/50">
            <span className="font-bold text-[var(--prefa-ink)] flex items-center gap-1.5">
              <VesperIcon name="info" className="w-4 h-4" />
              Informace o střešní konstrukci
            </span>
          </div>
          <ul className="list-disc pl-4 space-y-1 leading-relaxed font-medium">
            <li><strong>Střešní plášť:</strong> Cena obou střešních variant je kompletní včetně střešního pláště (krytiny, hydroizolace, laťování a parotěsné zábrany).</li>
            {selectedCode === 'STRECHA_PLOCHA' && (
              <li><strong>Konstrukce atiky:</strong> V ceně ploché střechy je započtena i konstrukce obvodové atiky střechy (2 800 Kč/bm).</li>
            )}
          </ul>
        </div>
      )}

      <article className="price-card bg-[var(--prefa-linen)]/35 border border-[var(--prefa-line)] rounded-sm p-4 text-left mt-4">
        <div className="price-card-title flex items-center justify-between gap-3 mb-3 font-sans">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[var(--prefa-white)] border border-[var(--prefa-line)] flex items-center justify-center text-[var(--prefa-ink)] rounded-sm shrink-0">
              <VesperIcon name="receipt" className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[var(--prefa-cedar)] uppercase tracking-wider">Průběžný výpočet</p>
              <strong className="text-sm font-semibold text-[var(--prefa-ink)]">
                {category === 'WALL_OUTER'
                  ? `Vnější stěny ${currentStorey}`
                  : category === 'WALL_INNER'
                  ? `Vnitřní stěny ${currentStorey}`
                  : category === 'CEILING'
                  ? 'Stropní panely'
                  : 'Střecha'}
              </strong>
            </div>
          </div>

          {category === 'WALL_OUTER' && hasDrawnElements && (
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-sm shrink-0 flex items-center gap-1 ${isEnvelopeClosed(tracedElements, currentStorey, 0.02).isClosed ? 'bg-[#EBF4F4] text-[var(--prefa-aqua)]' : 'bg-[#FAF4EC] text-[var(--prefa-amber)]'}`}>
              <VesperIcon name={isEnvelopeClosed(tracedElements, currentStorey, 0.02).isClosed ? 'check' : 'warning'} className="w-3 h-3" />
              <span>{isEnvelopeClosed(tracedElements, currentStorey, 0.02).isClosed ? 'Uzavřená obálka' : 'Otevřená obálka'}</span>
            </span>
          )}
        </div>
        {!hasDrawnElements && !(category === 'CEILING' && storeysCount === 1 && selectedCode !== 'STROP_RD') ? (
          <div className="py-8 px-4 text-center border border-[var(--prefa-line)] bg-[var(--prefa-paper)]/50 text-sm font-sans text-[var(--prefa-cedar)] my-3 rounded-sm">
            <p className="leading-relaxed font-medium">
              {category.startsWith('WALL')
                ? 'Cena se dopočítá po obkreslení stěn na výkresu.'
                : category === 'CEILING'
                ? 'Cena se dopočítá po výběru varianty stropu.'
                : 'Cena se dopočítá po obkreslení plochy střechy.'}
            </p>
          </div>
        ) : (
          <>
            <dl className="mt-3.5 space-y-0.5 font-sans">
              <div className="flex items-center justify-between border-t border-[var(--prefa-line)]/30 py-2">
                <dt className="text-xs font-medium text-[var(--prefa-cedar)]">Plocha konstrukcí</dt>
                <dd className="text-xs font-bold text-[var(--prefa-ink)] tabular-nums">{netAreaM2.toFixed(1).replace('.', ',')} m²</dd>
              </div>
              <div className="flex items-center justify-between border-t border-[var(--prefa-line)]/30 py-2">
                <dt className="text-xs font-medium text-[var(--prefa-cedar)]">Výroba panelů</dt>
                <dd className="text-xs font-bold text-[var(--prefa-ink)] tabular-nums">{panelsCost.toLocaleString('cs-CZ')} Kč</dd>
              </div>
              <div className="flex items-center justify-between border-t border-[var(--prefa-line)]/30 py-2">
                <dt className="text-xs font-medium text-[var(--prefa-cedar)]">Odborná montáž</dt>
                <dd className="text-xs font-bold text-[var(--prefa-ink)] tabular-nums">{assemblyCost.toLocaleString('cs-CZ')} Kč</dd>
              </div>
              <div className="flex items-center justify-between border-t border-[var(--prefa-line)]/30 py-2">
                <dt className="text-xs font-medium text-[var(--prefa-cedar)]">Jeřáb a manipulace</dt>
                <dd className="text-xs font-bold text-[var(--prefa-ink)] tabular-nums">{handlingCost.toLocaleString('cs-CZ')} Kč</dd>
              </div>
              <div className="flex items-center justify-between border-t border-[var(--prefa-line)]/30 py-2">
                <dt className="text-xs font-medium text-[var(--prefa-cedar)]">Doprava</dt>
                <dd className="text-xs font-bold text-[var(--prefa-ink)] tabular-nums">{transportCost.toLocaleString('cs-CZ')} Kč</dd>
              </div>
              <div className="flex items-center justify-between border-t border-[var(--prefa-line)]/30 py-2">
                <dt className="text-xs font-medium text-[var(--prefa-cedar)]">Technická rezerva</dt>
                <dd className="text-xs font-bold text-[var(--prefa-ink)] tabular-nums">{contingencyCost.toLocaleString('cs-CZ')} Kč</dd>
              </div>
            </dl>
            <div className="price-total mt-4 pt-4 border-t-2 border-[var(--prefa-ink)] flex flex-col items-stretch text-left">
              <span className="text-xs font-semibold text-[var(--prefa-cedar)] uppercase tracking-wider font-sans">Cena kroku bez DPH</span>
              <strong className="text-[30px] font-bold text-[var(--prefa-ink)] font-display tracking-tight tabular-nums mt-1">{currentStepTotalExVat.toLocaleString('cs-CZ')} Kč</strong>
            </div>
            <p className="text-[11px] text-[var(--prefa-cedar)] mt-3 leading-relaxed font-sans">Každá položka bude v závěrečném rozpočtu rozepsána samostatně.</p>
          </>
        )}
      </article>
    </aside>

    {/* Render High-Resolution Technical Detail Modal */}
    <PanelDetailModal
      isOpen={!!modalPanelCode}
      panelCode={modalPanelCode}
      onClose={() => setModalPanelCode(null)}
    />
  </>
);
}
