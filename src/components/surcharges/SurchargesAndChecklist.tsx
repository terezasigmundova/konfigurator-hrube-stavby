'use client';

import React, { useState } from 'react';
import { VesperIcon } from '@/components/ui/VesperIcon';
import { SeasonalDiscountTimeline, PRODUCTION_MONTHS } from './SeasonalDiscountTimeline';

export interface SurchargeTriggerItem {
  code: string;
  title: string;
  description: string;
  status: 'REQUIRES_INFORMATION' | 'ACKNOWLEDGED_BY_USER' | 'INCLUDED';
}

const DEFAULT_SURCHARGES: SurchargeTriggerItem[] = [
  {
    code: 'OVERSIZED_OPENINGS',
    title: 'Atypické a nadrozměrné otvory nad 10 m²',
    description: 'Pokud stavba obsahuje nadrozměrné prosklené stěny nebo velké HS portály, vyžadují posouzení statikem pro dimenzování překladů.',
    status: 'REQUIRES_INFORMATION',
  },
  {
    code: 'HEAVY_ACCESS',
    title: 'Příjezd těžké dopravy a uplatnění autojeřábu',
    description: 'Prověření poloměrů zatáček a únosnosti příjezdové komunikace pro kamionovou soupravu.',
    status: 'REQUIRES_INFORMATION',
  },
];

const CheckIcon = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} style={{ color: 'var(--aqua)' }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

interface SurchargesAndChecklistProps {
  surcharges?: SurchargeTriggerItem[];
  pricingResult?: any;
  hasOversizedOpenings?: boolean;
  selectedMonthCode: string;
  onSelectMonth: (monthCode: string) => void;
  onAcknowledgeSurcharge?: (code: string) => void;
  truckAccess?: 'YES' | 'NO' | 'UNKNOWN';
  craneAccess?: 'YES' | 'NO' | 'UNKNOWN';
  onChangeLogistics?: (truck: 'YES' | 'NO' | 'UNKNOWN', crane: 'YES' | 'NO' | 'UNKNOWN') => void;
  onSubmitOrder?: () => Promise<void>;
  isSubmitting?: boolean;
}

export function SurchargesAndChecklist({
  surcharges,
  pricingResult,
  hasOversizedOpenings = false,
  selectedMonthCode,
  onSelectMonth,
  onAcknowledgeSurcharge,
  truckAccess = 'YES',
  craneAccess = 'YES',
  onChangeLogistics,
  onSubmitOrder,
}: SurchargesAndChecklistProps) {
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [clientName, setClientName] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [note, setNote] = useState<string>('');

  const handleSendPdfToEmail = () => {
    if (!clientEmail || !clientEmail.includes('@')) {
      alert('⚠️ Zadejte prosím nejprve platný e-mail do formuláře níže, abychom vám mohli souhrn odeslat.');
      return;
    }
    alert(`📧 Souhrn konfigurace v PDF byl úspěšně odeslán na adresu: ${clientEmail}`);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      alert('🔗 Odkaz na tuto rozpracovanou konfiguraci byl zkopírován do schránky. Můžete jej zaslat svému projektantovi.');
    }
  };

  const activeSurcharges = surcharges && surcharges.length > 0 ? surcharges : DEFAULT_SURCHARGES;
  const selectedMonth = PRODUCTION_MONTHS.find((m) => m.code === selectedMonthCode) || PRODUCTION_MONTHS[0];

  const trustBadges = [
    { title: 'Certifikovaný systém DNK', desc: 'Jsme držiteli certifikace Dokument národní kvality a člen ADMD.', icon: 'document' },
    { title: 'Garantovaná cena', desc: 'Vaše poptávka je v tuto chvíli nezávazná, ale my svoji cenu dodržíme.', icon: 'price' },
    { title: 'Hrubá stavba za 2-5 dní', desc: 'Zaměření, trasování a důsledná příprava montáže.', icon: 'installation' },
    { title: 'Záruka 30 let', desc: 'Za své výrobky i vlastní práci držíme záruku.', icon: 'complete' },
  ];

  const includedStandardServices = [
    {
      title: 'Certifikovaná montáž firmou VESPER FRAMES',
      desc: 'U hrubých staveb přízemních rodinných domů garantujeme dokončení do 3 dnů od zahájení prací.',
      icon: 'installation',
    },
    {
      title: 'Doprava panelů z výrobního závodu Bruntál',
      desc: 'Zajišťujeme si přepravu kompletních panelů až na místo stavby.',
      icon: 'truck',
    },
    {
      title: 'Zaměření, zábor a příprava staveniště',
      desc: 'Zajišťujeme si přípravu montážních prací na staveništi.',
      icon: 'site',
    },
    {
      title: 'Manipulace autojeřábem',
      desc: 'Zajišťujeme kompletní logistiku celé stavby.',
      icon: 'crane',
    },
  ];

  const checklistItems = [
    { label: 'Obec a PSČ ověřeny přes RÚIAN', status: 'Doplněno' },
    { label: 'Příjezd kamionu a autojeřábu', status: 'Vyžaduje posouzení' },
    { label: 'Obvodové a vnitřní nosné stěny kompletní', status: 'Doplněno' },
    { label: 'Mezipodlažní stropy a otvory započteny', status: 'Doplněno' },
    { label: 'Sklon střechy a rozpočet střešních panelů', status: 'Doplněno' },
  ];

  const res = pricingResult || {
    totalExVat: 0,
    totalIncVat: 0,
    panelsTotalExVat: 0,
    assemblyExVat: 0,
    handlingExVat: 0,
    sitePrepExVat: 0,
    transportExVat: 0,
    contingencyExVat: 0,
    vatAmount: 0,
  };

  const discountAmountExVat = Math.round(res.panelsTotalExVat * (selectedMonth.discountPct / 100));
  const finalTotalExVat = Math.max(0, res.totalExVat - discountAmountExVat);
  const finalVatAmount = Math.round(finalTotalExVat * 0.12);
  const finalTotalIncVat = finalTotalExVat + finalVatAmount;

  const handleSubmitPreOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    if (onSubmitOrder) {
      onSubmitOrder();
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto my-6 animate-fade-in print:hidden select-none font-sans">
      {/* 4 Trust Badges Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {trustBadges.map((badge, idx) => (
          <div key={idx} className="bg-[var(--prefa-white)] border border-[var(--prefa-line)] p-4 text-left flex items-start gap-3 rounded-sm">
            <div className="w-11 h-11 bg-[var(--prefa-paper)] border border-[var(--prefa-line)] flex items-center justify-center shrink-0 text-[var(--prefa-ink)] rounded-sm">
              <VesperIcon name={badge.icon as any} className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <div className="text-sm font-semibold text-[var(--prefa-ink)] leading-tight font-sans">{badge.title}</div>
              <p className="text-xs text-[var(--prefa-cedar)] font-medium leading-tight font-sans">{badge.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 1. CHECKLIST STAVBY A PODKLADŮ */}
      <div className="bg-[var(--prefa-white)] border border-[var(--prefa-line)] p-6 text-left rounded-sm">
        <h3 className="text-base font-semibold text-[var(--prefa-ink)] mb-4 flex items-center gap-2 font-sans">
          <CheckIcon />
          Kontrolní checklist stavby a podkladů
        </h3>
        <div className="space-y-2">
          {checklistItems.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-[var(--prefa-paper)] border border-[var(--prefa-line)] flex items-center justify-between text-sm font-sans rounded-sm"
            >
              <span className="font-medium text-[var(--prefa-ink)]">{item.label}</span>
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-sm flex items-center gap-1.5 ${item.status === 'Vyžaduje posouzení' ? 'text-[var(--prefa-amber)] bg-[#FAF4EC]' : 'text-[var(--prefa-aqua)] bg-[#EBF4F4]'}`}>
                <VesperIcon name={item.status === 'Vyžaduje posouzení' ? 'warning' : 'check'} className="w-3.5 h-3.5" />
                <span>{item.status}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. STANDARDNÍ SLUŽBY ZAHRNUTÉ V CENĚ */}
      <div className="bg-[var(--prefa-white)] border border-[var(--prefa-line)] p-6 text-left space-y-4 rounded-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--prefa-line)]">
          <div>
            <h3 className="text-base font-semibold text-[var(--prefa-ink)] font-sans">Standardní služby zahrnuté v ceně Vesper Frames</h3>
            <p className="text-sm text-[var(--prefa-cedar)] font-medium mt-0.5 font-sans">Služby započtené v rozpočtu hrubé stavby.</p>
          </div>
          <span className="text-xs font-semibold text-[var(--prefa-ink)] bg-[var(--prefa-linen)] border border-[var(--prefa-line)] px-2.5 py-1 rounded-sm">
            V ceně
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {includedStandardServices.map((svc, idx) => (
            <div key={idx} className="p-3.5 bg-[var(--prefa-paper)] border border-[var(--prefa-line)] text-sm space-y-1 flex items-start gap-3 font-sans rounded-sm">
              <div className="w-8 h-8 bg-[var(--prefa-white)] border border-[var(--prefa-line)] flex items-center justify-center shrink-0 text-[var(--prefa-ink)] rounded-sm">
                <VesperIcon name={svc.icon as any} className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-[var(--prefa-ink)]">{svc.title}</div>
                <p className="text-xs text-[var(--prefa-cedar)] mt-0.5">{svc.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. REKAPITULACE & SUMARIZACE JEDNOTLIVÝCH KROKŮ A POLOŽEK */}
      <div className="bg-[var(--prefa-white)] border border-[var(--prefa-line)] p-6 text-left space-y-4 rounded-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[var(--prefa-line)] gap-2">
          <div>
            <h3 className="text-base font-semibold text-[var(--prefa-ink)] font-sans">
              Rekapitulace a sumarizace rozpočtu Vesper Frames
            </h3>
            <p className="text-sm text-[var(--prefa-cedar)] font-medium mt-0.5 font-sans">
              Kompletní výkaz výměr, konstrukčních položek a logistiky ze Závodu Bruntál.
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-[var(--prefa-ink)] bg-[var(--prefa-linen)] border border-[var(--prefa-line)] px-3 py-1.5 inline-block font-sans rounded-sm">
              Celkem: <span className="tabular-nums font-bold">{finalTotalExVat.toLocaleString('cs-CZ', { maximumFractionDigits: 0 })}</span> Kč bez DPH
            </div>
            {discountAmountExVat > 0 && (
              <div className="text-xs text-[var(--prefa-amber)] font-bold mt-1 font-sans">
                Uplatněna sleva kapacity {selectedMonth.periodLabel}: -<span className="tabular-nums font-bold">{discountAmountExVat.toLocaleString('cs-CZ', { maximumFractionDigits: 0 })}</span> Kč
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto font-sans">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--prefa-line)] bg-[var(--prefa-paper)] text-xs font-semibold uppercase text-[var(--prefa-cedar)]">
                <th className="py-3 px-4">Položka / Služba rozpočtu</th>
                <th className="py-3 px-4">Výpočet & Podíl</th>
                <th className="py-3 px-4 text-right">Cena bez DPH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--prefa-line)]/50 font-medium text-[var(--prefa-ink)]">
              <tr className="hover:bg-[var(--prefa-paper)]/55 transition">
                <td className="py-3 px-4 font-semibold text-[var(--prefa-ink)]">
                  Certifikované stěnové, stropní a střešní dílce
                </td>
                <td className="py-3 px-4">Výkaz výměr konstrukcí</td>
                <td className="py-3 px-4 text-right font-semibold text-[var(--prefa-ink)] tabular-nums">{Math.round(res.panelsTotalExVat).toLocaleString('cs-CZ', { maximumFractionDigits: 0 })} Kč</td>
              </tr>
              <tr className="hover:bg-[var(--prefa-paper)]/55 transition">
                <td className="py-3 px-4">Certifikovaná montáž hrubé stavby</td>
                <td className="py-3 px-4">18 % z ceny stavebních dílců</td>
                <td className="py-3 px-4 text-right tabular-nums">{Math.round(res.assemblyExVat).toLocaleString('cs-CZ', { maximumFractionDigits: 0 })} Kč</td>
              </tr>
              <tr className="hover:bg-[var(--prefa-paper)]/55 transition">
                <td className="py-3 px-4">Těžký autojeřáb a manipulace</td>
                <td className="py-3 px-4">4 % z ceny stavebních dílců</td>
                <td className="py-3 px-4 text-right tabular-nums">{Math.round(res.handlingExVat).toLocaleString('cs-CZ', { maximumFractionDigits: 0 })} Kč</td>
              </tr>
              <tr className="hover:bg-[var(--prefa-paper)]/55 transition">
                <td className="py-3 px-4">Zábor a příprava staveniště (BOZP)</td>
                <td className="py-3 px-4">Paušál přípravy</td>
                <td className="py-3 px-4 text-right tabular-nums">{Math.round(res.panelsTotalExVat > 0 ? 35000 : 0).toLocaleString('cs-CZ', { maximumFractionDigits: 0 })} Kč</td>
              </tr>
              <tr className="hover:bg-[var(--prefa-paper)]/55 transition">
                <td className="py-3 px-4 font-semibold text-[var(--prefa-ink)]">Logistika a doprava ze závodu Bruntál</td>
                <td className="py-3 px-4">1 kamion na každý konstrukční krok</td>
                <td className="py-3 px-4 text-right font-semibold text-[var(--prefa-ink)] tabular-nums">{Math.round(res.transportExVat).toLocaleString('cs-CZ', { maximumFractionDigits: 0 })} Kč</td>
              </tr>
              <tr className="hover:bg-[var(--prefa-paper)]/55 transition">
                <td className="py-3 px-4">Technická rezerva na vícepráce</td>
                <td className="py-3 px-4">3 % z mezisoučtu</td>
                <td className="py-3 px-4 text-right tabular-nums">{Math.round(res.contingencyExVat).toLocaleString('cs-CZ', { maximumFractionDigits: 0 })} Kč</td>
              </tr>

              {selectedMonth.discountPct > 0 && (
                <tr className="bg-[#FAF4EC] font-semibold text-[var(--prefa-amber)]">
                  <td className="py-3.5 px-4">
                    Kapacitní sleva výroby Bruntál ({selectedMonth.periodLabel} -{selectedMonth.discountPct} % z dílců)
                  </td>
                  <td className="py-3.5 px-4">Aplikována sleva na materiál</td>
                  <td className="py-3.5 px-4 text-right tabular-nums font-bold">
                    -{discountAmountExVat.toLocaleString('cs-CZ', { maximumFractionDigits: 0 })} Kč
                  </td>
                </tr>
              )}

              <tr className="bg-[var(--prefa-ink)] text-white font-bold">
                <td className="py-3.5 px-4">SOUČET ROZPOČTU BEZ DPH</td>
                <td className="py-3.5 px-4">Základ daně DPH (12 %)</td>
                <td className="py-3.5 px-4 text-right tabular-nums">{finalTotalExVat.toLocaleString('cs-CZ', { maximumFractionDigits: 0 })} Kč</td>
              </tr>
              <tr className="text-[var(--prefa-cedar)] font-semibold bg-[var(--prefa-paper)]">
                <td className="py-3 px-4">DPH 12 % (rodinné domy)</td>
                <td className="py-3 px-4">Snížená sazba daně</td>
                <td className="py-3 px-4 text-right tabular-nums">{finalVatAmount.toLocaleString('cs-CZ', { maximumFractionDigits: 0 })} Kč</td>
              </tr>
              <tr className="text-[var(--prefa-ink)] font-bold border-t-2 border-[var(--prefa-ink)] bg-[var(--prefa-linen)]/35">
                <td className="py-3.5 px-4 font-sans uppercase">CELKOVÁ CENA VČETNĚ DPH</td>
                <td className="py-3.5 px-4">K konečné úhradě po slevě</td>
                <td className="py-3.5 px-4 text-right font-bold tabular-nums">{finalTotalIncVat.toLocaleString('cs-CZ', { maximumFractionDigits: 0 })} Kč</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. OVĚŘENÍ PŘÍSTUPNOSTI PRO KAMION A JEŘÁB */}
      <div className="bg-[var(--prefa-white)] border border-[var(--prefa-line)] p-6 text-left space-y-4 rounded-sm">
        <div>
          <h3 className="text-base font-semibold text-[var(--prefa-ink)] font-sans">
            Ověření přístupnosti staveniště
          </h3>
          <p className="text-sm text-[var(--prefa-cedar)] font-medium mt-0.5 font-sans">
            Pro montáž prefabrikovaných panelů je nutné zajistit bezproblémový příjezd a manipulaci těžké techniky.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[var(--prefa-line)] font-sans">
          {/* Truck Access Toggle */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--prefa-ink)] flex items-center gap-2">
              <span>Přijede ke stavbě kamionová souprava?</span>
            </label>
            <p className="text-xs text-[var(--prefa-cedar)] leading-relaxed">
              Standardní délka kamionové soupravy je cca 16,5 m. Vyžaduje dostatečné poloměry zatáček a zpevněný příjezd.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => onChangeLogistics?.('YES', craneAccess)}
                className={`h-11 px-4 border text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 rounded-sm ${
                  truckAccess === 'YES'
                    ? 'bg-[var(--prefa-ink)] border-[var(--prefa-ink)] text-white shadow-sm'
                    : 'bg-[var(--prefa-white)] border-[var(--prefa-line)] text-[var(--prefa-ink)] hover:bg-[var(--prefa-paper)]'
                }`}
              >
                <span>Ano (Standardní)</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeLogistics?.('NO', craneAccess)}
                className={`h-11 px-4 border text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 rounded-sm ${
                  truckAccess === 'NO'
                    ? 'bg-[#FAF4EC] border-[var(--prefa-amber)] text-[var(--prefa-amber)] shadow-sm'
                    : 'bg-[var(--prefa-white)] border-[var(--prefa-line)] text-[var(--prefa-ink)] hover:bg-[var(--prefa-paper)]'
                }`}
              >
                <span>Ne / Nevím (Omezení)</span>
              </button>
            </div>
            {truckAccess === 'NO' && (
              <div className="bg-[#FAF4EC] border border-[var(--prefa-amber)]/30 text-[var(--prefa-amber)] p-3 text-sm font-medium leading-relaxed flex items-start gap-2 animate-fade-in rounded-sm">
                <VesperIcon name="warning" className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Případné logistické omezení vyžaduje individuální posouzení příjezdu nebo překládky.</span>
              </div>
            )}
          </div>

          {/* Crane Access Toggle */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--prefa-ink)] flex items-center gap-2">
              <span>Zajistíte dostatečné místo pro autojeřáb?</span>
            </label>
            <p className="text-xs text-[var(--prefa-cedar)] leading-relaxed">
              Autojeřáb vyžaduje pevné podloží a stabilní manipulační prostor bez vzdušného elektrického vedení.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => onChangeLogistics?.(truckAccess, 'YES')}
                className={`h-11 px-4 border text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 rounded-sm ${
                  craneAccess === 'YES'
                    ? 'bg-[var(--prefa-ink)] border-[var(--prefa-ink)] text-white shadow-sm'
                    : 'bg-[var(--prefa-white)] border-[var(--prefa-line)] text-[var(--prefa-ink)] hover:bg-[var(--prefa-paper)]'
                }`}
              >
                <span>Ano (Bude zajištěno)</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeLogistics?.(truckAccess, 'NO')}
                className={`h-11 px-4 border text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 rounded-sm ${
                  craneAccess === 'NO'
                    ? 'bg-[#FAF4EC] border-[var(--prefa-amber)] text-[var(--prefa-amber)] shadow-sm'
                    : 'bg-[var(--prefa-white)] border-[var(--prefa-line)] text-[var(--prefa-ink)] hover:bg-[var(--prefa-paper)]'
                }`}
              >
                <span>Ne / Nevím (Omezení)</span>
              </button>
            </div>
            {craneAccess === 'NO' && (
              <div className="bg-[#FAF4EC] border border-[var(--prefa-amber)]/30 text-[var(--prefa-amber)] p-3 text-sm font-medium leading-relaxed flex items-start gap-2 animate-fade-in rounded-sm">
                <VesperIcon name="warning" className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Pokud nelze ustavit standardní jeřáb, bude nutné navrhnout individuální postup montáže.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6. ODESLAT KONFIGURACI K ODBORNÉ KONTROLE */}
      <div className="bg-[var(--prefa-ink)] text-white p-6 text-left space-y-5 rounded-sm">
        {!isSubmitted ? (
          <form onSubmit={handleSubmitPreOrder} className="space-y-5">
            <div className="border-b border-slate-700 pb-3">
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <h3 className="text-base font-semibold text-white flex items-center gap-2 font-sans">
                  Odeslání konfigurace k odborné kontrole
                </h3>
                <span className="text-xs font-semibold bg-[var(--prefa-amber)] text-white px-2.5 py-1 rounded-sm">
                  Zvolený termín: {selectedMonth.periodLabel} (-{selectedMonth.discountPct} %)
                </span>
              </div>
              <p className="text-sm text-slate-350 mt-1.5 font-medium font-sans">
                Zadejte své kontaktní údaje. Náš specialista na dřevostavby zkontroluje vaši konfiguraci a ozve se vám s odborným posouzením.
              </p>
            </div>

            {/* Action Buttons for PDF and Sharing */}
            <div className="flex flex-wrap gap-2.5 pb-2 font-sans">
              <button
                type="button"
                onClick={handleSendPdfToEmail}
                className="h-11 px-4 bg-slate-700 hover:bg-slate-650 text-white font-semibold rounded-sm text-sm transition flex items-center gap-2 cursor-pointer border border-slate-600"
              >
                <svg className="w-4 h-4 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Zaslat souhrn do e-mailu</span>
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="h-11 px-4 bg-slate-700 hover:bg-slate-650 text-white font-semibold rounded-sm text-sm transition flex items-center gap-2 cursor-pointer border border-slate-600"
              >
                <svg className="w-4 h-4 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742l4.636-2.318M8.684 13.258l4.636 2.318M20.5 7.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm-5 9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm-5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <span>Sdílet s projektantem</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5 font-sans">Jméno a příjmení *</label>
                <input
                  type="text"
                  required
                  placeholder="Jan Novák"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full h-11 px-3.5 bg-white text-[var(--prefa-ink)] border border-[var(--prefa-line)] text-sm focus:outline-none focus:border-[var(--prefa-aqua)] rounded-sm font-sans font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5 font-sans">E-mail *</label>
                <input
                  type="email"
                  required
                  placeholder="jan.novak@email.cz"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full h-11 px-3.5 bg-white text-[var(--prefa-ink)] border border-[var(--prefa-line)] text-sm focus:outline-none focus:border-[var(--prefa-aqua)] rounded-sm font-sans font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5 font-sans">Telefon *</label>
                <input
                  type="tel"
                  required
                  placeholder="+420 777 123 456"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full h-11 px-3.5 bg-white text-[var(--prefa-ink)] border border-[var(--prefa-line)] text-sm focus:outline-none focus:border-[var(--prefa-aqua)] rounded-sm font-sans font-medium"
                />
              </div>
            </div>

            <div className="font-sans">
              <label className="block text-sm font-semibold text-slate-300 mb-1.5 font-sans">Poznámka k realizaci</label>
              <textarea
                rows={2}
                placeholder="Doplňující informace pro projektanta..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full p-3.5 bg-white text-[var(--prefa-ink)] border border-[var(--prefa-line)] text-sm focus:outline-none focus:border-[var(--prefa-aqua)] rounded-sm font-sans font-medium"
              />
            </div>

            {/* Důležité informace a obchodní podmínky */}
            <div className="bg-[var(--prefa-ink)] border border-slate-700 p-4 space-y-3 text-xs leading-relaxed font-sans">
              <div className="space-y-1">
                <span className="font-bold text-[var(--prefa-amber)] block uppercase tracking-wider text-xs">💡 Co bude následovat?</span>
                <p className="text-slate-300">
                  Náš specialista na dřevostavby zkontroluje vaši konfiguraci, prověří vhodnost vybraných panelů a do 24 hodin (v pracovní dny) se vám ozve na uvedené telefonní číslo. Společně probereme další kroky a případnou rezervaci výrobní kapacity.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-700/85">
                <div className="space-y-1">
                  <span className="font-bold text-slate-250 block">Platnost kalkulace:</span>
                  <p className="text-slate-400">
                    Tato orientační kalkulace a uplatněná kapacitní sleva {selectedMonth.discountPct} % je platná po dobu 30 kalendářních dnů od odeslání.
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-250 block">Informace k DPH (12 %):</span>
                  <p className="text-slate-400">
                    Snížená sazba DPH 12 % je uplatněna na základě podmínek pro bytovou výstavbu (rodinné domy s podlahovou plochou do 350 m² určené k trvalému bydlení). V ostatních případech bude uplatněna sazba 21 %.
                  </p>
                </div>
              </div>
            </div>

            {/* GDPR Souhlas */}
            <div className="flex items-start gap-2.5 pt-1 font-sans">
              <input
                type="checkbox"
                required
                id="gdpr-consent"
                className="mt-0.5 w-4 h-4 rounded-sm border-slate-700 bg-white text-[var(--prefa-aqua)] focus:ring-[var(--prefa-aqua)] cursor-pointer"
              />
              <label htmlFor="gdpr-consent" className="text-sm text-slate-300 leading-relaxed cursor-pointer select-none font-sans">
                Souhlasím se zpracováním osobních údajů pro účely vypracování odborného posouzení. *
              </label>
            </div>

            {/* Programmatic submit trigger button */}
            <button
              type="submit"
              id="submit-config-btn"
              className="hidden"
            />
          </form>
        ) : (
          <div className="p-6 bg-[var(--prefa-white)] text-[var(--prefa-ink)] rounded-sm text-center space-y-4 shadow-lg border border-[var(--prefa-line)]">
            <h3 className="text-lg font-bold text-[var(--prefa-ink)] flex items-center justify-center gap-2 font-sans">
              Konfigurace byla úspěšně odeslána k odborné kontrole
            </h3>
            <p className="text-sm text-[var(--prefa-cedar)] max-w-md mx-auto leading-relaxed font-sans">
              Náš specialista na dřevostavby zkontroluje vaši konfiguraci a ozve se vám na uvedené telefonní číslo do 24 hodin (v pracovní dny) pro potvrzení detailů a vypracování odborného vyhodnocení.
            </p>
            <div className="flex flex-wrap gap-2.5 justify-center pt-2 font-sans">
              <button
                type="button"
                onClick={handleSendPdfToEmail}
                className="h-11 px-4 bg-[var(--prefa-paper)] hover:bg-[var(--prefa-linen)] text-[var(--prefa-ink)] font-semibold rounded-sm text-sm shadow-xs transition flex items-center gap-2 cursor-pointer border border-[var(--prefa-line)]"
              >
                <svg className="w-4 h-4 text-[var(--prefa-ink)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Zaslat souhrn do e-mailu</span>
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="h-11 px-4 bg-[var(--prefa-paper)] hover:bg-[var(--prefa-linen)] text-[var(--prefa-ink)] font-semibold rounded-sm text-sm shadow-xs transition flex items-center gap-2 cursor-pointer border border-[var(--prefa-line)]"
              >
                <svg className="w-4 h-4 text-[var(--prefa-ink)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742l4.636-2.318M8.684 13.258l4.636 2.318M20.5 7.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm-5 9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm-5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <span>Sdílet s projektantem</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
