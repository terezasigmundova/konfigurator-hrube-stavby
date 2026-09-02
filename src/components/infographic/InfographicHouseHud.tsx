'use client';

import React from 'react';

interface InfographicHouseHudProps {
  currentStep: number;
  totalSteps: number;
  storeysCount: number;
}

export function InfographicHouseHud({
  currentStep,
  totalSteps,
  storeysCount,
}: InfographicHouseHudProps) {
  const completionPct = Math.min(100, Math.round(((currentStep - 1) / (totalSteps - 1)) * 100));

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
      {/* Left: Progress Indicator & Metrics */}
      <div className="flex items-center gap-4 flex-1 min-w-[280px]">
        <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-semibold text-xs tracking-wider shadow-xs">
          {completionPct}%
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs font-bold text-slate-900 tracking-tight">
              Postup sestavení konstrukce Vesper Frames
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              Krok {currentStep} z {totalSteps}
            </span>
          </div>

          {/* Clean Progress Line */}
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
            <div
              className="h-full bg-slate-900 rounded-full transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Right: Structural Milestone Pills */}
      <div className="flex items-center gap-2 text-xs">
        <span
          className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border transition ${
            currentStep >= 2
              ? 'bg-slate-900 text-white border-slate-900 font-bold'
              : 'bg-slate-50 text-slate-400 border-slate-200'
          }`}
        >
          1.NP
        </span>

        {storeysCount >= 2 && (
          <span
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border transition ${
              currentStep >= 5
                ? 'bg-slate-900 text-white border-slate-900 font-bold'
                : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}
          >
            2.NP
          </span>
        )}

        {storeysCount >= 3 && (
          <span
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border transition ${
              currentStep >= 8
                ? 'bg-slate-900 text-white border-slate-900 font-bold'
                : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}
          >
            3.NP
          </span>
        )}

        <span
          className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border transition ${
            currentStep >= totalSteps - 1
              ? 'bg-slate-900 text-white border-slate-900 font-bold'
              : 'bg-slate-50 text-slate-400 border-slate-200'
          }`}
        >
          Střecha
        </span>
      </div>
    </div>
  );
}
