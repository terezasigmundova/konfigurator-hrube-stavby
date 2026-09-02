'use client';

import React from 'react';
import { VesperIcon } from '@/components/ui/VesperIcon';

export type MascotState =
  | 'WELCOME'
  | 'UPLOAD'
  | 'CALIBRATE'
  | 'DRAW_OUTER'
  | 'DRAW_INNER'
  | 'SUCCESS'
  | 'WARNING'
  | 'PANEL_EXPERT';

interface MascotGuideCardProps {
  state?: MascotState;
  customText?: string;
  customTitle?: string;
  className?: string;
  compact?: boolean;
  size?: 'normal' | 'large';
  frameless?: boolean;
  sidebar?: boolean;
}

const MASCOT_CONFIG: Record<
  MascotState,
  { defaultTitle: string; defaultText: string; accentColor: string }
> = {
  WELCOME: {
    defaultTitle: '',
    defaultText: 'Vítám vás v konfigurátoru! Řekněte mi, kdy chcete mít hotovo a společně to tu celé nachystáme a spočítáme.',
    accentColor: 'border-[#ded8cf] bg-[#f7f5f1]/90',
  },
  UPLOAD: {
    defaultTitle: '',
    defaultText: 'Zde nahrajte půdorysný plán svého domu, pro který vyberete vhodné panely pro vnější i vnitřní stěny.',
    accentColor: 'border-[#ded8cf] bg-[#f7f5f1]/90',
  },
  CALIBRATE: {
    defaultTitle: '',
    defaultText:
      'Než do výkresu začneme kreslit stěny, musíme si zkalibrovat měřítko. Zvládnete to snadno umístěním bodů A a B do míst se známým rozměrem. Tento rozměr nezapomeňte opsat do pole kalibrace.',
    accentColor: 'border-[#ded8cf] bg-[#f7f5f1]/90',
  },
  DRAW_OUTER: {
    defaultTitle: '',
    defaultText:
      'Teď si můžete vybrat zda bude váš dům s omítkou nebo dřevěným obkladem a jednoduše povedete lomenou čáru nad vnější linií stěn.',
    accentColor: 'border-[#ded8cf] bg-[#f7f5f1]/90',
  },
  DRAW_INNER: {
    defaultTitle: '',
    defaultText: 'Na řadě jsou vnitřní příčky. Dejte si ale pozor na výběr vlastností. Vnitřní stěny mohou být požadovány jako nosné nebo s lepšími akustickými vlastnostmi.',
    accentColor: 'border-[#ded8cf] bg-[#f7f5f1]/90',
  },
  SUCCESS: {
    defaultTitle: '',
    defaultText: 'Obvod stěn byl úspěšně uzavřen a výměra byla automaticky započítána do rozpočtu.',
    accentColor: 'border-[#ded8cf] bg-[#f7f5f1]/90',
  },
  WARNING: {
    defaultTitle: '',
    defaultText: 'Zkontrolujte prosím přístupnost staveniště pro kamion a autojeřáb.',
    accentColor: 'border-[#ded8cf] bg-amber-50/90',
  },
  PANEL_EXPERT: {
    defaultTitle: '',
    defaultText: 'Každý náš certifikovaný panel vyniká tepelně-izolačními a akustickými parametry.',
    accentColor: 'border-[#ded8cf] bg-[#f7f5f1]/90',
  },
};

export function MascotGuideCard({
  state = 'WELCOME',
  customText,
  customTitle,
  className = '',
  compact = false,
  size = 'normal',
  frameless = false,
  sidebar = false,
}: MascotGuideCardProps) {
  const config = MASCOT_CONFIG[state] || MASCOT_CONFIG.WELCOME;
  const title = customTitle !== undefined ? customTitle : config.defaultTitle;
  const text = customText || config.defaultText;

  const imageSrc = '/images/tereza.png';

  if (compact) {
    return (
      <div className={`p-3 rounded-[2px] border ${config.accentColor} flex items-center gap-3 shadow-sm ${className}`}>
        <div className="relative w-12 h-12 shrink-0 flex items-center justify-center rounded-full overflow-hidden border border-[#ded8cf] bg-white">
          <img src={imageSrc} alt="Technická podpora Tereza" className="w-full h-full object-cover" />
        </div>
        <div className="space-y-0.5 min-w-0 flex-1">
          {title && (
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-800 flex items-center gap-1">
              <VesperIcon name="info" className="w-3 h-3 text-[#759192]" /> {title}
            </div>
          )}
          <p className="text-xs font-semibold text-slate-800 leading-snug">{text}</p>
        </div>
      </div>
    );
  }

  // Sidebar Embedded Mode (Placed directly under the active step)
  if (sidebar) {
    return (
      <div className={`my-2 p-3 bg-[#f7f5f1]/70 border border-[#ded8cf]/80 rounded-[2px] space-y-2 relative shadow-xs ${className}`}>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full overflow-hidden border border-[#ded8cf] bg-white">
            <img src={imageSrc} alt="Technická podpora Tereza" className="w-full h-full object-cover" />
          </div>
          
          <div className="flex-1 min-w-0">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-700 bg-white px-2 py-0.5 rounded-[2px] border border-[#ded8cf] shadow-2xs inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#759192] animate-pulse"></span>
              Technická podpora Tereza
            </span>
          </div>
        </div>

        {/* Speech Bubble */}
        <div className="relative bg-white p-2.5 rounded-[2px] border border-[#ded8cf] shadow-2xs">
          <div className="absolute left-6 -top-1.5 w-3 h-3 bg-white border-l border-t border-[#ded8cf] transform rotate-45"></div>
          <p className="text-[11px] font-bold text-slate-800 leading-relaxed italic">
            „{text}“
          </p>
        </div>
      </div>
    );
  }

  const isLarge = size === 'large';
  const containerClasses = frameless
    ? `flex flex-col sm:flex-row items-center gap-4 lg:gap-6 relative overflow-visible ${className}`
    : `p-4 lg:p-6 rounded-[2px] border ${config.accentColor} flex flex-col sm:flex-row items-center gap-4 lg:gap-6 shadow-md relative overflow-visible ${className}`;

  return (
    <div className={containerClasses}>
      {/* Free-standing rounded avatar */}
      <div className={`relative shrink-0 flex items-center justify-center rounded-full overflow-hidden border-2 border-[#759192] bg-white shadow-md z-20 ${
        isLarge ? 'w-24 h-24 sm:w-28 sm:h-28' : 'w-20 h-20'
      }`}>
        <img
          src={imageSrc}
          alt="Technická podpora Tereza"
          className="w-full h-full object-cover hover:scale-105 transition duration-300 transform"
        />
      </div>

      {/* Clean Speech Bubble (Only the citation is framed) */}
      <div className="flex-1 space-y-2 relative z-10 w-full">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 bg-[#e7e0d5] px-2.5 py-0.5 rounded-[2px] border border-[#ded8cf] shadow-xs flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#759192] animate-pulse"></span>
            Technická podpora Tereza
          </span>
          {title ? <span className="text-xs font-black text-slate-900">{title}</span> : null}
        </div>

        <div className="relative bg-white p-4 lg:p-5 rounded-[2px] border border-[#ded8cf] shadow-md">
          {/* Left Speech Arrow */}
          <div className="hidden sm:block absolute -left-2 top-6 w-3 h-3 bg-white border-l border-b border-[#ded8cf] transform rotate-45"></div>

          <p className={`font-bold text-slate-800 leading-relaxed italic ${isLarge ? 'text-xs sm:text-sm' : 'text-xs'}`}>
            „{text}“
          </p>
        </div>
      </div>
    </div>
  );
}
