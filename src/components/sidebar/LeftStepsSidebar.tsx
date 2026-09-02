'use client';

import React from 'react';
import { VesperIcon } from '../ui/VesperIcon';

interface LeftStepsSidebarProps {
  currentStep: number;
  maxSteps: number;
  storeysCount: number;
  completedStepIds: number[];
  visitedStepIds?: number[];
  onSelectStep: (stepId: number) => void;
  onReset?: () => void;
}

export function LeftStepsSidebar({
  currentStep,
  maxSteps = 8,
  storeysCount,
  completedStepIds,
  visitedStepIds = [],
  onSelectStep,
  onReset,
}: LeftStepsSidebarProps) {
  const steps = [
    { id: 1, label: 'Parametry a místo' },
    { id: 2, label: 'Vnější stěny 1. NP' },
    { id: 3, label: 'Vnitřní stěny 1. NP' },
    { id: 4, label: 'Strop' },
    { id: 5, label: 'Vnější stěny 2. NP' },
    { id: 6, label: 'Vnitřní stěny 2. NP' },
    { id: 7, label: 'Střešní roviny a sklon' },
    { id: 8, label: 'Rozpočet a předobjednávka' },
  ].filter(s => {
    if (storeysCount === 1 && (s.id === 5 || s.id === 6)) {
      return false;
    }
    return true;
  });

  const getStepState = (id: number) => {
    if (currentStep === id) return 'active';
    
    const isVisited = visitedStepIds.includes(id);
    const isCompleted = completedStepIds.includes(id);
    if (isVisited && !isCompleted) return 'attention';
    if (isCompleted) return 'done';
    
    const highestCompleted = completedStepIds.length > 0 ? Math.max(...completedStepIds) : 1;
    const highestCompletedIndex = steps.findIndex(s => s.id === highestCompleted);
    const thisIndex = steps.findIndex(s => s.id === id);
    
    if (id === 1 || thisIndex <= highestCompletedIndex + 1) return 'ready';
    
    return 'locked';
  };

  const handleStepClick = (id: number, state: string) => {
    if (state !== 'locked') {
      onSelectStep(id);
    }
  };

  return (
    <aside className="drawing-sidebar" aria-label="Postup konfigurace">
      <p className="sidebar-kicker">Konfigurace domu</p>
      <ol>
        {steps.map((step, idx) => {
          const state = getStepState(step.id);
          const formattedNumber = String(idx + 1).padStart(2, '0');
          return (
            <li 
              className={`${state} cursor-pointer select-none`} 
              onClick={() => handleStepClick(step.id, state)}
              key={step.id}
              aria-current={state === 'active' ? 'step' : undefined}
            >
              <span>
                {state === 'done' ? (
                  <VesperIcon name="check" className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--white)' }} />
                ) : state === 'attention' ? (
                  <VesperIcon name="warning" className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--prefa-amber)' }} />
                ) : (
                  formattedNumber
                )}
              </span>
              <p>{step.label}</p>
              {state === 'locked' && <VesperIcon name="lock" className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--prefa-stone)' }} />}
            </li>
          );
        })}
      </ol>

      <div className="sidebar-reset-container border-t border-[#ded8cf] pt-4 mt-8 w-full flex justify-center">
        <button
          type="button"
          className="flex items-center justify-center gap-2 h-11 text-sm text-[var(--prefa-cedar)] hover:text-red-600 transition cursor-pointer font-semibold px-3 w-full"
          onClick={onReset}
        >
          <VesperIcon name="delete" className="w-[18px] h-[18px] shrink-0" />
          <span>Smazat konfiguraci</span>
        </button>
      </div>
    </aside>
  );
}
