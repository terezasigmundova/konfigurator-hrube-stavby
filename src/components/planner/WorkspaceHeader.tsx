'use client';

import React from 'react';
import { VesperIcon } from '@/components/ui/VesperIcon';

interface WorkspaceHeaderProps {
  stepId: number;
  stepLabel: string;
  maxSteps: number;
  isCalibrated?: boolean;
  hasSheet?: boolean;
  isClosedLoop?: boolean;
  hasCatalogSelected?: boolean;
}

export function WorkspaceHeader({
  stepId,
  stepLabel,
  maxSteps,
  isCalibrated = false,
  hasSheet = false,
  isClosedLoop = false,
  hasCatalogSelected = true,
}: WorkspaceHeaderProps) {
  const getTaskDescription = () => {
    if (stepId === 1) {
      return 'Zadejte místo stavby, počet podlaží a požadovaný termín dodávky.';
    }
    if (stepLabel.includes('Vnější stěny')) {
      return 'Klikněte postupně do rohů vytápěné části domu. Posledním bodem tvar obvodu uzavřete.';
    }
    if (stepLabel.includes('Vnitřní stěny')) {
      return 'Zakreslete jednotlivé vnitřní nosné a dělící příčky od bodu k bodu. Cena zahrnuje dveřní otvory.';
    }
    if (stepLabel.includes('Strop')) {
      return 'Zkontrolujte plochu stropu nebo nahrajte samostatný výkres stropních panelů.';
    }
    if (stepLabel.includes('Střecha')) {
      return 'Obkreslete jednotlivé střešní roviny a zadejte jejich sklon ve stupních.';
    }
    return 'Zkontrolujte rozpad ceny a odešlete nezávaznou předobjednávku.';
  };

  const subSteps = [
    {
      id: 1,
      label: 'Nahrát',
      isCompleted: hasSheet,
      isActive: !hasSheet,
    },
    {
      id: 2,
      label: 'Měřítko',
      isCompleted: isCalibrated,
      isActive: hasSheet && !isCalibrated,
    },
    {
      id: 3,
      label: 'Obkreslit',
      isCompleted: isClosedLoop,
      isActive: isCalibrated && !isClosedLoop,
    },
    {
      id: 4,
      label: 'Zkontrolovat',
      isCompleted: isClosedLoop && hasCatalogSelected,
      isActive: isClosedLoop && !hasCatalogSelected,
    },
  ];

  return (
    <div className="bg-white border-b border-slate-200/80 px-6 py-4 space-y-4 shrink-0 select-none">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">Krok {stepId} z {maxSteps} •</span>
            <span>{stepLabel}</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {getTaskDescription()}
          </p>
        </div>

        {/* Step Validation Stepper (Only shown during drawing steps) */}
        {stepId >= 2 && stepId < maxSteps && (
          <div className="flex items-center gap-1.5 text-[10px] font-bold self-start md:self-auto flex-wrap">
            {subSteps.map((sub, idx) => {
              const isLast = idx === subSteps.length - 1;
              return (
                <React.Fragment key={sub.id}>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition ${
                    sub.isCompleted
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : sub.isActive
                      ? 'bg-[#181a1c] border-[#181a1c] text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    <span className={`w-4 h-4 rounded-sm flex items-center justify-center shrink-0 ${
                      sub.isCompleted
                        ? 'bg-[var(--prefa-aqua)] text-white'
                        : sub.isActive
                        ? 'bg-white'
                        : 'bg-slate-200'
                    }`}>
                      {sub.isCompleted ? (
                        <VesperIcon name="check" className="w-2.5 h-2.5" />
                      ) : (
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          sub.isActive ? 'bg-[#181a1c]' : 'bg-slate-400'
                        }`} />
                      )}
                    </span>
                    <span className="font-bold whitespace-nowrap">{sub.label}</span>
                  </div>
                  {!isLast && <span className="text-[var(--prefa-stone)] font-bold text-xs">→</span>}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
