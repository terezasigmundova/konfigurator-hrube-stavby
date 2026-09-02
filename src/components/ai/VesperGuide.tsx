'use client';

import React, { useState } from 'react';
import { VesperIcon } from '@/components/ui/VesperIcon';

interface VesperGuideProps {
  currentStepId: number;
  currentStepLabel: string;
  isCalibrated?: boolean;
}

export function VesperGuide({ currentStepId, currentStepLabel, isCalibrated = false }: VesperGuideProps) {
  const [dismissedSteps, setDismissedSteps] = useState<number[]>([]);

  if (dismissedSteps.includes(currentStepId)) {
    return null;
  }

  const getGuideAdvice = () => {
    if (currentStepId === 1) {
      return {
        title: 'Zadání lokality a počtu podlaží',
        text: 'Zadejte místo stavby pro nájezd kamionů a autojeřábu.',
      };
    }
    if (currentStepId === 2) {
      return {
        title: 'Obkreslení obálky 1.NP',
        text: 'Určete kótovací úsečku A-B (přesnost 0,1 m) a obkreslete vnější stěny vytápěné části domu.',
      };
    }
    if (currentStepId === 3) {
      return {
        title: 'Vnitřní nosné a dělící stěny',
        text: 'Cena vnitřních stěnových dílců již zahrnuje otvory pro interiérové dveře.',
      };
    }
    if (currentStepId === 4) {
      return {
        title: 'Stropní panely',
        text: 'Zkontrolujte mezipodlažní stropní dílce s integrovaným kročejovým útlumem.',
      };
    }
    return {
      title: 'Průvodce konfigurací',
      text: 'Postupujte podle instrukcí krok za krokem. Všechna zadání se automaticky ukládají.',
    };
  };

  const advice = getGuideAdvice();

  return (
    <div className="bg-[#f7f5f1] border border-[#ded8cf] p-3.5 rounded-[2px] shadow-xs flex items-start justify-between gap-3 text-xs select-none font-sans relative">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden border border-[#ded8cf] bg-white shrink-0 shadow-xs flex items-center justify-center">
          <img
            src="/images/tereza.png"
            alt="Technická podpora Tereza"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback if image path differs
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
        <div>
          <h4 className="font-bold text-[var(--prefa-ink)] flex items-center gap-1.5 font-display">
            <span>Technická podpora Tereza radí:</span>
            <span className="text-[var(--prefa-aqua)] font-bold">• {advice.title}</span>
          </h4>
          <p className="text-[var(--prefa-cedar)] mt-0.5 font-medium leading-relaxed font-tech">{advice.text}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setDismissedSteps((prev) => [...prev, currentStepId])}
        className="text-[var(--prefa-stone)] hover:text-[var(--prefa-ink)] text-xs shrink-0 p-1 cursor-pointer"
        aria-label="Skrýt radu"
      >
        <VesperIcon name="close" className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
