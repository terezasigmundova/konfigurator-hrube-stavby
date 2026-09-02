'use client';

import React from 'react';

interface PlannerHeaderProps {
  projectName?: string;
  isSaved?: boolean;
  onHelpClick?: () => void;
}

export function PlannerHeader({
  projectName,
  isSaved = true,
  onHelpClick,
}: PlannerHeaderProps) {
  return (
    <header className="h-[72px] bg-[#181a1c] border-b border-[#2d3139] px-6 lg:px-8 flex items-center justify-between z-30 shrink-0 select-none font-sans">
      {/* Brand Logo & Title from Mockups */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          {/* Stylized Vesper Homes vertical pillars logo icon */}
          <svg className="w-5 h-6 text-white shrink-0" viewBox="0 0 20 24" fill="currentColor">
            <path d="M0 24h4V6.5L0 11.5V24z M6 24h4V3L6 8v16z M12 24h4V0l-4 5v19z" />
          </svg>
          <span className="font-black text-base tracking-widest text-white uppercase">
            vesper homes
          </span>
        </div>
        <span className="text-slate-700 font-light text-sm">|</span>
        <span className="text-xs text-slate-400 font-bold tracking-wide">
          Konfigurátor hrubé stavby
        </span>
      </div>

      {/* Save Status & System Badge */}
      <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
        <div className="flex items-center gap-1.5 bg-[#2d3139] text-slate-300 border border-slate-700 px-3 py-1.5 rounded-full text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Uloženo</span>
        </div>

        <span className="bg-[#f7f6f4] text-[#181a1c] text-[10px] font-black px-4.5 py-2.5 rounded-full uppercase tracking-wider shadow-xs">
          Systém Vesper Frames
        </span>
      </div>
    </header>
  );
}
