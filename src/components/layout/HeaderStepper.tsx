'use client';

import React from 'react';
import { VesperIcon, VesperIconName } from '@/components/ui/VesperIcon';

export interface StepItem {
  id: number;
  label: string;
  sublabel: string;
  status: 'not_started' | 'in_progress' | 'complete';
}

interface HeaderStepperProps {
  currentStep: number;
  steps?: StepItem[];
  projectName?: string;
  autosaveStatus?: 'saved' | 'saving' | 'error';
  isSaved?: boolean;
  onStepClick: (stepId: number) => void;
}

const STEP_ICONS: Record<number, VesperIconName> = {
  1: 'home',
  2: 'external-wall',
  3: 'internal-wall',
  4: 'floor-slab',
  5: 'external-wall',
  6: 'internal-wall',
  7: 'roof',
  8: 'order',
};

export function HeaderStepper({
  currentStep,
  steps,
  projectName = 'Modelový rodinný dům',
  autosaveStatus = 'saved',
  onStepClick,
}: HeaderStepperProps) {
  const activeSteps = steps || [];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-3 shadow-xs font-sans select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        {/* Brand identity — Modern Clean Line Style */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0f172a] text-white font-black flex items-center justify-center text-lg tracking-wider shadow-xs">
            V
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Konfigurátor hrubé stavby
            </div>
            <h1 className="text-sm font-black text-[#0f172a] tracking-tight">
              Vesper Frames
            </h1>
          </div>
        </div>

        {/* Dynamic Stepper Navigation — Clean Line Pipeline (IKEA Style) */}
        <div className="hidden lg:flex items-center gap-1 bg-[#f8fafc] p-1 rounded-full border border-slate-200">
          {activeSteps.map((step) => {
            const isActive = currentStep === step.id;
            const isComplete = currentStep > step.id;
            const iconName = STEP_ICONS[step.id] || 'document';

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => onStepClick(step.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs transition flex items-center gap-2 font-bold ${
                  isActive
                    ? 'bg-[#0f172a] text-white shadow-xs'
                    : isComplete
                    ? 'text-[#0f172a] hover:bg-slate-200/60 font-black'
                    : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-800'
                }`}
              >
                <VesperIcon name={iconName} className="w-4 h-4" />
                <span>{step.label}</span>
              </button>
            );
          })}
        </div>

        {/* Autosave Status Badge */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              autosaveStatus === 'saving'
                ? 'bg-amber-500 animate-pulse'
                : autosaveStatus === 'error'
                ? 'bg-rose-500'
                : 'bg-[#0f172a]'
            }`}
          />
          <span className="hidden sm:inline text-slate-700 font-bold text-xs">
            {autosaveStatus === 'saving' ? 'Ukládám...' : autosaveStatus === 'error' ? 'Chyba uložení' : 'Automaticky uloženo'}
          </span>
        </div>
      </div>
    </header>
  );
}
