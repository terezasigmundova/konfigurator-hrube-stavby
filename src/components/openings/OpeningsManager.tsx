'use client';

import React, { useState } from 'react';

interface OpeningsManagerProps {
  wallAreaM2: number;
  onDeductionChange?: (deductedAreaM2: number, hasOversizedOpenings: boolean) => void;
}

export function OpeningsManager({ wallAreaM2, onDeductionChange }: OpeningsManagerProps) {
  const [deductFlatRate, setDeductFlatRate] = useState<boolean>(true);
  const flatRatePct = 15;
  const [hasOversizedOpenings, setHasOversizedOpenings] = useState<boolean>(false);

  const calculatedDeductionM2 = deductFlatRate ? (wallAreaM2 * flatRatePct) / 100 : 0;
  const netWallAreaM2 = Math.max(0, wallAreaM2 - calculatedDeductionM2);

  const handleFlatRateToggle = (enabled: boolean) => {
    setDeductFlatRate(enabled);
    const deduction = enabled ? (wallAreaM2 * flatRatePct) / 100 : 0;
    if (onDeductionChange) onDeductionChange(deduction, hasOversizedOpenings);
  };

  const handleOversizedToggle = (checked: boolean) => {
    setHasOversizedOpenings(checked);
    if (onDeductionChange) onDeductionChange(calculatedDeductionM2, checked);
  };

  return (
    <div className="bg-white border border-slate-200/80 p-5 rounded-2xl my-4 space-y-4 shadow-xs font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Standardní odpočet otvorů oken a dveří (15 %)
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Paušální odečet 15 % z celkové plochy pláště pro běžná okna a vchodové dveře.
          </p>
        </div>
        <span className="text-xs font-bold text-slate-900 bg-slate-100 border border-slate-200 px-3 py-1 rounded-md">
          Plocha stěn: {wallAreaM2.toFixed(1)} m²
        </span>
      </div>

      {/* Standard 15% Flat Rate Deduction */}
      <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-2">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={deductFlatRate}
              onChange={(e) => handleFlatRateToggle(e.target.checked)}
              className="w-4 h-4 text-slate-900 bg-white border-slate-300 rounded focus:ring-slate-900"
            />
            <span className="text-xs font-bold text-slate-900">
              Uplatnit standardní paušální odpočet 15 % pro okna a vchodové dveře
            </span>
          </label>

          {deductFlatRate && (
            <span className="text-xs font-extrabold text-slate-900">
              - {calculatedDeductionM2.toFixed(1)} m²
            </span>
          )}
        </div>

        <div className="text-xs text-slate-600 pt-2 flex justify-between border-t border-slate-200/80 mt-2 font-medium">
          <span>Čistá výměra panelů pláště k dodávce:</span>
          <span className="font-extrabold text-slate-900">{netWallAreaM2.toFixed(1)} m²</span>
        </div>
      </div>

      {/* Oversized / Atypical Openings Checkbox */}
      <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-xl space-y-2">
        <div>
          <h4 className="text-xs font-bold text-amber-900">
            Atypické a nadrozměrné otvory nad 10 m²
          </h4>
          <p className="text-xs text-slate-700 font-medium leading-relaxed mt-0.5">
            Pokud stavba obsahuje nadrozměrné prosklené stěny nebo velké HS portály, vyžadují posouzení statikem pro dimenzování překladů.
          </p>
        </div>

        <label className="flex items-center gap-2.5 pt-2 border-t border-amber-200 cursor-pointer">
          <input
            type="checkbox"
            checked={hasOversizedOpenings}
            onChange={(e) => handleOversizedToggle(e.target.checked)}
            className="w-4 h-4 text-amber-600 bg-white border-amber-300 rounded focus:ring-amber-500"
          />
          <span className="text-xs font-bold text-slate-900">
            Projekt obsahuje velkoformátový otvor / HS portál nad 10 m² (Vyžaduje posouzení statika)
          </span>
        </label>
      </div>
    </div>
  );
}
