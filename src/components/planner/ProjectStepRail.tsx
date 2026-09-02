'use client';

import React from 'react';
import { VesperIcon, VesperIconName } from '@/components/ui/VesperIcon';

export interface StageGroup {
  id: string;
  number: number;
  title: string;
  substeps: {
    id: number;
    title: string;
    icon: VesperIconName;
    isCompleted: boolean;
    isActive: boolean;
  }[];
}

interface ProjectStepRailProps {
  currentStepId: number;
  completedStepIds: number[];
  storeysCount: number;
  onStepSelect: (stepId: number) => void;
}

export function ProjectStepRail({
  currentStepId,
  completedStepIds,
  storeysCount,
  onStepSelect,
}: ProjectStepRailProps) {
  const getStageGroups = (): StageGroup[] => {
    if (storeysCount === 1) {
      return [
        {
          id: 'stage-1',
          number: 1,
          title: 'O vašem domě',
          substeps: [
            { id: 1, title: 'Parametry & Místo', icon: 'home', isCompleted: completedStepIds.includes(1) || currentStepId > 1, isActive: currentStepId === 1 },
          ],
        },
        {
          id: 'stage-2',
          number: 2,
          title: 'Konstrukce 1.NP',
          substeps: [
            { id: 2, title: 'Vnější stěny 1.NP', icon: 'external-wall', isCompleted: completedStepIds.includes(2) || currentStepId > 2, isActive: currentStepId === 2 },
            { id: 3, title: 'Vnitřní stěny 1.NP', icon: 'internal-wall', isCompleted: completedStepIds.includes(3) || currentStepId > 3, isActive: currentStepId === 3 },
            { id: 4, title: 'Strop / Podhled', icon: 'floor-slab', isCompleted: completedStepIds.includes(4) || currentStepId > 4, isActive: currentStepId === 4 },
          ],
        },
        {
          id: 'stage-3',
          number: 3,
          title: 'Střecha',
          substeps: [
            { id: 5, title: 'Střešní roviny & sklon', icon: 'roof', isCompleted: completedStepIds.includes(5) || currentStepId > 5, isActive: currentStepId === 5 },
          ],
        },
        {
          id: 'stage-4',
          number: 4,
          title: 'Kontrola stavby',
          substeps: [
            { id: 6, title: 'Cena & Předobjednávka', icon: 'order', isCompleted: completedStepIds.includes(6) || currentStepId > 6, isActive: currentStepId === 6 },
          ],
        },
      ];
    }

    if (storeysCount === 2) {
      return [
        {
          id: 'stage-1',
          number: 1,
          title: 'O vašem domě',
          substeps: [
            { id: 1, title: 'Parametry & Místo', icon: 'home', isCompleted: completedStepIds.includes(1) || currentStepId > 1, isActive: currentStepId === 1 },
          ],
        },
        {
          id: 'stage-2',
          number: 2,
          title: 'Konstrukce podlaží',
          substeps: [
            { id: 2, title: 'Vnější stěny 1.NP', icon: 'external-wall', isCompleted: completedStepIds.includes(2) || currentStepId > 2, isActive: currentStepId === 2 },
            { id: 3, title: 'Vnitřní stěny 1.NP', icon: 'internal-wall', isCompleted: completedStepIds.includes(3) || currentStepId > 3, isActive: currentStepId === 3 },
            { id: 4, title: 'Strop mezi 1.NP a 2.NP', icon: 'floor-slab', isCompleted: completedStepIds.includes(4) || currentStepId > 4, isActive: currentStepId === 4 },
            { id: 5, title: 'Vnější stěny 2.NP', icon: 'external-wall', isCompleted: completedStepIds.includes(5) || currentStepId > 5, isActive: currentStepId === 5 },
            { id: 6, title: 'Vnitřní stěny 2.NP', icon: 'internal-wall', isCompleted: completedStepIds.includes(6) || currentStepId > 6, isActive: currentStepId === 6 },
          ],
        },
        {
          id: 'stage-3',
          number: 3,
          title: 'Střecha',
          substeps: [
            { id: 7, title: 'Střešní roviny & sklon', icon: 'roof', isCompleted: completedStepIds.includes(7) || currentStepId > 7, isActive: currentStepId === 7 },
          ],
        },
        {
          id: 'stage-4',
          number: 4,
          title: 'Kontrola stavby',
          substeps: [
            { id: 8, title: 'Cena & Předobjednávka', icon: 'order', isCompleted: completedStepIds.includes(8) || currentStepId > 8, isActive: currentStepId === 8 },
          ],
        },
      ];
    }

    return [
      {
        id: 'stage-1',
        number: 1,
        title: 'O vašem domě',
        substeps: [
          { id: 1, title: 'Parametry & Místo', icon: 'home', isCompleted: completedStepIds.includes(1) || currentStepId > 1, isActive: currentStepId === 1 },
        ],
      },
      {
        id: 'stage-2',
        number: 2,
        title: 'Konstrukce podlaží',
        substeps: [
          { id: 2, title: 'Vnější stěny 1.NP', icon: 'external-wall', isCompleted: completedStepIds.includes(2) || currentStepId > 2, isActive: currentStepId === 2 },
          { id: 3, title: 'Vnitřní stěny 1.NP', icon: 'internal-wall', isCompleted: completedStepIds.includes(3) || currentStepId > 3, isActive: currentStepId === 3 },
          { id: 4, title: 'Strop mezi 1.NP a 2.NP', icon: 'floor-slab', isCompleted: completedStepIds.includes(4) || currentStepId > 4, isActive: currentStepId === 4 },
          { id: 5, title: 'Vnější stěny 2.NP', icon: 'external-wall', isCompleted: completedStepIds.includes(5) || currentStepId > 5, isActive: currentStepId === 5 },
          { id: 6, title: 'Vnitřní stěny 2.NP', icon: 'internal-wall', isCompleted: completedStepIds.includes(6) || currentStepId > 6, isActive: currentStepId === 6 },
          { id: 7, title: 'Strop mezi 2.NP a 3.NP', icon: 'floor-slab', isCompleted: completedStepIds.includes(7) || currentStepId > 7, isActive: currentStepId === 7 },
          { id: 8, title: 'Vnější stěny 3.NP', icon: 'external-wall', isCompleted: completedStepIds.includes(8) || currentStepId > 8, isActive: currentStepId === 8 },
          { id: 9, title: 'Vnitřní stěny 3.NP', icon: 'internal-wall', isCompleted: completedStepIds.includes(9) || currentStepId > 9, isActive: currentStepId === 9 },
        ],
      },
      {
        id: 'stage-3',
        number: 3,
        title: 'Střecha',
        substeps: [
          { id: 10, title: 'Střešní roviny & sklon', icon: 'roof', isCompleted: completedStepIds.includes(10) || currentStepId > 10, isActive: currentStepId === 10 },
        ],
      },
      {
        id: 'stage-4',
        number: 4,
        title: 'Kontrola stavby',
        substeps: [
          { id: 11, title: 'Cena & Předobjednávka', icon: 'order', isCompleted: completedStepIds.includes(11) || currentStepId > 11, isActive: currentStepId === 11 },
        ],
      },
    ];
  };

  const stages = getStageGroups();

  return (
    <aside className="w-64 bg-[#f6f7f8] border-r border-[#d8dee8] p-4 flex flex-col gap-6 overflow-y-auto shrink-0 select-none font-sans">
      <div className="space-y-4">
        <h2 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
          Etapy plánování stavby
        </h2>

        {stages.map((stage) => (
          <div key={stage.id} className="space-y-1">
            <div className="text-xs font-black text-[#0f172a] px-2 py-1 flex items-center justify-between">
              <span>{stage.title}</span>
            </div>

            <div className="space-y-0.5 pl-1">
              {stage.substeps.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => onStepSelect(sub.id)}
                  aria-pressed={sub.isActive}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs transition flex items-center justify-between ${
                    sub.isActive
                      ? 'bg-[#0f172a] text-white font-black shadow-xs'
                      : sub.isCompleted
                      ? 'text-slate-800 hover:bg-slate-200/60 font-bold'
                      : 'text-slate-400 hover:bg-slate-200/40 hover:text-slate-700 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <VesperIcon name={sub.icon} className={`w-4 h-4 shrink-0 ${sub.isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span className="truncate">{sub.title}</span>
                  </div>
                  {sub.isCompleted && !sub.isActive && (
                    <VesperIcon name="complete" className="w-3.5 h-3.5 text-[#0f172a] shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
