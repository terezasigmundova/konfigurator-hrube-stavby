'use client';

import React from 'react';
import { VesperButton } from '@/components/ui/VesperButton';

interface BottomPriceBarProps {
  totalExVat?: number;
  totalIncVat?: number;
  projectTotalExVat?: number;
  projectTotalWithVat?: number;
  currentStep: number;
  maxSteps?: number;
  currentStepLabel?: string;
  isSubmitting?: boolean;
  canGoNext?: boolean;
  canGoPrev?: boolean;
  onNext: () => void;
  onPrev: () => void;
}

export function BottomPriceBar({
  totalExVat = 0,
  totalIncVat = 0,
  projectTotalExVat = 0,
  projectTotalWithVat = 0,
  currentStep,
  maxSteps = 6,
  currentStepLabel = 'Vnější stěny',
  isSubmitting = false,
  canGoNext = true,
  canGoPrev = true,
  onNext,
  onPrev,
}: BottomPriceBarProps) {
  const safeExVat = isNaN(totalExVat) ? (isNaN(projectTotalExVat) ? 0 : projectTotalExVat) : totalExVat;
  const safeIncVat = isNaN(totalIncVat) ? (isNaN(projectTotalWithVat) ? 0 : projectTotalWithVat) : totalIncVat;

  const formatPrice = (val: number) => {
    const num = isNaN(val) ? 0 : val;
    return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(num);
  };

  const isFinalStep = currentStep === maxSteps;

  const getPriceStatusText = () => {
    if (isFinalStep) {
      return 'Kompletní orientační rozpočet Vesper Frames';
    }
    return `Průběžný odhad — započteno ${currentStep - 1} z ${maxSteps - 1} částí`;
  };

  const getButtonText = () => {
    if (isSubmitting) {
      return 'Odesílám předobjednávku...';
    }
    if (isFinalStep) {
      return 'Potvrdit a odeslat nezávaznou předobjednávku';
    }
    return `Uložit ${currentStepLabel} a pokračovat`;
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[var(--vesper-border,#d8dee8)] px-6 py-3.5 shadow-2xl font-sans select-none">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Left: Subtitled Price Status Coverage */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-bold hidden sm:inline">
            Krok {currentStep} z {maxSteps}
          </span>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span className="text-xs text-slate-800 font-bold bg-[var(--vesper-surface-soft,#f1f3f5)] border border-[var(--vesper-border,#d8dee8)] px-3 py-1 rounded-full">
            {getPriceStatusText()}
          </span>
        </div>

        {/* Right: Strong Price Ticker & Primary CTA */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Cena bez DPH</div>
            <div className="text-2xl font-black text-[var(--vesper-navy,#0f172a)] tracking-tight">
              {formatPrice(safeExVat)}
            </div>
            <div className="text-[10px] text-slate-500 font-bold">
              včetně DPH (12 %): {formatPrice(safeIncVat)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canGoPrev && currentStep > 1 && (
              <VesperButton
                variant="secondary"
                onClick={onPrev}
                disabled={isSubmitting}
                icon="back"
              >
                Zpět
              </VesperButton>
            )}

            {/* Primary Action Button */}
            <VesperButton
              variant="primary"
              large
              disabled={isSubmitting}
              onClick={onNext}
              iconAfter="next"
            >
              {getButtonText()}
            </VesperButton>
          </div>
        </div>
      </div>
    </footer>
  );
}
