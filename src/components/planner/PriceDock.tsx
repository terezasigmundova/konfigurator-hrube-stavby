'use client';

import React from 'react';

interface PriceDockProps {
  currentStepPriceExVat?: number;
  totalExVat?: number;
  totalIncVat?: number;
  totalRunningPriceExVat?: number;
  discountAmountExVat?: number;
  currentStep: number;
  maxSteps: number;
  currentStepLabel?: string;
  isSubmitting?: boolean;
  canGoPrev?: boolean;
  onNext: () => void;
  onPrev: () => void;
}

export function PriceDock({
  currentStepPriceExVat = 0,
  totalExVat = 0,
  totalIncVat = 0,
  totalRunningPriceExVat,
  discountAmountExVat = 0,
  currentStep,
  maxSteps,
  currentStepLabel,
  isSubmitting = false,
  canGoPrev = true,
  onNext,
  onPrev,
}: PriceDockProps) {
  const isFinalStep = currentStep === maxSteps;

  const actualTotalExVat = totalRunningPriceExVat !== undefined ? totalRunningPriceExVat : totalExVat;
  const actualTotalIncVat = totalIncVat > 0 ? totalIncVat : actualTotalExVat * 1.12;

  const formatPrice = (val: number) => {
    const num = isNaN(val) ? 0 : val;
    return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(num);
  };

  const getPriceCoverageNotice = () => {
    if (isFinalStep) {
      return 'Kompletní orientační rozpočet hrubé stavby Vesper Frames';
    }
    const completedParts = Math.max(0, currentStep - 2);
    const totalParts = maxSteps - 2;
    return `Do ceny započteno ${completedParts} ze ${totalParts} konstrukčních částí`;
  };

  const stepLabels: Record<number, string> = {
    1: 'Úvodní nastavení',
    2: 'Vnější stěny 1.NP',
    3: 'Vnitřní stěny 1.NP',
    4: 'Strop nad 1.NP',
    5: 'Vnější stěny 2.NP',
    6: 'Vnitřní stěny 2.NP',
    7: 'Střešní konstrukce',
    8: 'Závěrečný přehled',
  };

  const getButtonText = () => {
    if (isSubmitting) {
      return 'Odesílá se...';
    }
    if (isFinalStep) {
      return 'Odeslat konfiguraci k odborné kontrole ➔';
    }
    const label = currentStepLabel && currentStepLabel !== 'undefined' ? currentStepLabel : stepLabels[currentStep] || 'tento krok';
    return `Uložit ${label} a pokračovat →`;
  };

  return (
    <footer className="h-20 bg-[#181a1c] border-t border-[#2d3139] px-6 flex items-center justify-between z-40 shrink-0 select-none shadow-xl">
      {/* Left: Step price & Coverage explanation */}
      <div className="flex items-center gap-6">
        <div>
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Cena tohoto kroku
          </div>
          <div className="text-sm font-extrabold text-white">
            {formatPrice(currentStepPriceExVat)} <span className="text-xs font-bold text-slate-400">bez DPH</span>
          </div>
        </div>

        <div className="hidden sm:block border-l border-slate-700 pl-6">
          <span className="text-xs font-bold text-slate-300 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-full">
            {getPriceCoverageNotice()}
          </span>
        </div>
      </div>

      {/* Right: Průběžná celková cena & Primary Action Button */}
      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            {isFinalStep && discountAmountExVat > 0 ? 'Celková cena po slevě (bez DPH)' : isFinalStep ? 'Celková cena bez DPH' : 'Průběžná cena celkem'}
          </div>
          <div className="text-base font-black text-white tracking-tight">
            {formatPrice(actualTotalExVat)} <span className="text-xs font-bold text-slate-400">bez DPH</span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium flex flex-col items-end leading-tight">
            <span>vč. DPH 12 %: {formatPrice(actualTotalIncVat)}</span>
            {isFinalStep && discountAmountExVat > 0 && (
              <span className="text-[9px] text-[#4dbde6] font-extrabold">
                Sleva za termín: -{formatPrice(discountAmountExVat)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canGoPrev && currentStep > 1 && (
            <button
              type="button"
              onClick={onPrev}
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#2d3139] hover:bg-[#383d47] text-slate-200 text-xs font-bold rounded-full border border-slate-700 transition disabled:opacity-40 cursor-pointer"
            >
              Zpět
            </button>
          )}

          <button
            type="button"
            onClick={onNext}
            disabled={isSubmitting}
            className="px-7 py-3 bg-[#4dbde6] hover:bg-sky-400 text-[#181a1c] text-xs font-black rounded-full shadow-md transition disabled:opacity-40 flex items-center gap-2 cursor-pointer"
          >
            {getButtonText()}
          </button>
        </div>
      </div>
    </footer>
  );
}
