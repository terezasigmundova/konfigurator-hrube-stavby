'use client';

import React from 'react';
import { VesperIcon } from '@/components/ui/VesperIcon';

export interface ProductionMonthOption {
  code: string;
  monthName: string;
  periodLabel: string;
  discountPct: number;
  isRecommended?: boolean;
  capacityStatus: string;
}

export const PRODUCTION_MONTHS: ProductionMonthOption[] = [
  {
    code: 'OCT',
    monthName: 'Říjen',
    periodLabel: 'Říjen 2026',
    discountPct: 30,
    isRecommended: true,
    capacityStatus: 'Vysoká volná kapacita výroby',
  },
  {
    code: 'NOV',
    monthName: 'Listopad',
    periodLabel: 'Listopad 2026',
    discountPct: 25,
    capacityStatus: 'Volná kapacita výroby',
  },
  {
    code: 'DEC',
    monthName: 'Prosinec',
    periodLabel: 'Prosinec 2026',
    discountPct: 20,
    capacityStatus: 'Střední kapacita výroby',
  },
  {
    code: 'JAN',
    monthName: 'Leden',
    periodLabel: 'Leden 2027',
    discountPct: 20,
    capacityStatus: 'Zimní plánování výroby',
  },
  {
    code: 'FEB',
    monthName: 'Únor',
    periodLabel: 'Únor 2027',
    discountPct: 0,
    capacityStatus: 'Standardní kapacita (0 %)',
  },
  {
    code: 'MAR',
    monthName: 'Březen',
    periodLabel: 'Březen 2027',
    discountPct: 25,
    capacityStatus: 'Jarní náběh kapacity',
  },
  {
    code: 'APR',
    monthName: 'Duben',
    periodLabel: 'Duben 2027',
    discountPct: 30,
    isRecommended: true,
    capacityStatus: 'Vysoká volná kapacita výroby',
  },
];

interface SeasonalDiscountTimelineProps {
  panelsTotalExVat: number;
  selectedMonthCode: string;
  onSelectMonth: (monthCode: string) => void;
}

export function SeasonalDiscountTimeline({
  panelsTotalExVat,
  selectedMonthCode,
  onSelectMonth,
}: SeasonalDiscountTimelineProps) {
  return (
    <div className="bg-white border border-[#d8dee8] p-6 rounded-2xl shadow-xs space-y-4 font-sans select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#d8dee8] gap-2">
        <div>
          <h3 className="text-base font-black text-[#0f172a] flex items-center gap-2">
            <VesperIcon name="calendar" className="w-5 h-5 text-[#0f172a]" />
            Pobídka kapacity výroby — Vyberte termín montáže a uplatněte slevu
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Sleva se počítá výhradně z ceny certifikovaných stěnových, stropních a střešních panelů Vesper Frames.
          </p>
        </div>

        <span className="text-[11px] font-display font-bold uppercase tracking-wider text-[var(--prefa-ink)] bg-[var(--prefa-linen)] border border-[var(--prefa-line)] px-3 py-1.5 rounded-sm shrink-0">
          Úspora až 30 % z materiálu
        </span>
      </div>

      {/* Grid Timeline Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-3">
        {PRODUCTION_MONTHS.map((m) => {
          const isSelected = m.code === selectedMonthCode;
          const discountAmountCZK = Math.round(panelsTotalExVat * (m.discountPct / 100));

          return (
            <div
              key={m.code}
              onClick={() => onSelectMonth(m.code)}
              className={`relative p-3 border-2 transition cursor-pointer flex flex-col justify-between space-y-2 text-left min-h-[125px] ${
                isSelected
                  ? 'bg-[#292527] border-[#292527] text-white shadow-md'
                  : 'bg-white border-[#ded8cf] text-[#292527] hover:border-[#9e998e] hover:bg-[#e7e0d5]/40'
              }`}
              style={{ borderRadius: '2px' }}
            >
              {/* Recommendation Badge */}
              {m.isRecommended && (
                <div
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap z-10 ${
                    isSelected ? 'bg-[#d39a52] text-white border border-[#d39a52]' : 'bg-[#d39a52]/10 text-[#d39a52] border border-[#d39a52]/30'
                  }`}
                >
                  Top Termín -30%
                </div>
              )}

              <div className="space-y-1.5 pt-0.5">
                <div className="flex items-center justify-between gap-1 w-full font-display">
                  <span className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-[#292527]'}`}>
                    {m.monthName}
                  </span>

                  {m.discountPct > 0 ? (
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.5 font-mono tabular-nums ${
                        isSelected ? 'bg-[#d39a52] text-white' : 'bg-[#292527] text-white'
                      }`}
                      style={{ borderRadius: '2px' }}
                    >
                      -{m.discountPct} %
                    </span>
                  ) : (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 ${
                        isSelected ? 'bg-[#e7e0d5] text-[#292527]' : 'bg-[#e7e0d5] text-[#5e5c55]'
                      }`}
                      style={{ borderRadius: '2px' }}
                    >
                      Std
                    </span>
                  )}
                </div>

                <div className={`text-[10px] font-medium leading-tight h-7 flex items-center ${isSelected ? 'text-slate-350' : 'text-[#5e5c55]'}`}>
                  {m.capacityStatus}
                </div>
              </div>

              <div className="pt-2 border-t border-[#ded8cf]/45 mt-auto">
                {m.discountPct > 0 ? (
                  <div className="space-y-0.5">
                    <div className={`text-[9px] font-bold uppercase tracking-wider ${isSelected ? 'text-[#d39a52]' : 'text-[#5e5c55]'}`}>
                      Ušetříte
                    </div>
                    <div className={`text-xs font-black tracking-tight tabular-nums ${isSelected ? 'text-white' : 'text-[#292527]'}`}>
                      {discountAmountCZK.toLocaleString('cs-CZ')} Kč
                    </div>
                  </div>
                ) : (
                  <div className={`text-[10px] font-bold py-1 ${isSelected ? 'text-slate-400' : 'text-[#5e5c55]'}`}>
                    Standardní cena
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
