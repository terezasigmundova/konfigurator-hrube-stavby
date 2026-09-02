'use client';

import React from 'react';

interface SystemOverviewPanelProps {
  municipalityName?: string;
  zoneName?: string;
  storeysCount?: number;
}

export function SystemOverviewPanel({
  municipalityName = 'Bruntál',
  zoneName = 'Zóna 1 — Severní Morava (Bruntál & okolí)',
  storeysCount = 2,
}: SystemOverviewPanelProps) {
  const scopeItems = [
    {
      title: '1. Vnější & Vnitřní nosné stěny',
      desc: 'Certifikované stěnové panely z Výrobního závodu Bruntál s minerální vatou, kontaktním zateplením a opláštěním.',
      image3DUrl: '/panels/OS_VF_01_3D.jpg',
      specs: 'Tloušťka 358,5 mm • U = 0,14 W/m²K',
    },
    {
      title: '2. Mezipodlažní stropní panely',
      desc: 'Prefabrikované stropní dílce s integrovanou kročejovou izolací a vysokou únosností.',
      image3DUrl: '/panels/STROP_RD_3D.jpg',
      specs: 'Tloušťka 432 mm • Lnw = 48 dB',
    },
    {
      title: '3. Střešní panely & roviny',
      desc: 'Izolované střešní dílce s parotěsnou zábranou a přípravou pro finální střešní krytinu.',
      image3DUrl: '/panels/STRECHA_SIKMA_3D.jpg',
      specs: 'Tloušťka 455 mm • U = 0,11 W/m²K',
    },
  ];

  return (
    <aside className="w-80 lg:w-[360px] bg-white border-l border-slate-200/80 p-4 flex flex-col justify-between overflow-y-auto shrink-0 select-none font-sans space-y-5">
      <div className="space-y-4">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            Rozsah dodávky hrubé stavby
          </div>
          <h3 className="text-sm font-black text-slate-900 tracking-tight">
            Ucelený systém hrubé stavby
          </h3>
          <p className="text-[11px] font-normal text-slate-500 mt-0.5">
            Kompletní konstrukční dodávka z Výrobního závodu Bruntál
          </p>
        </div>

        {/* Scope Illustrative Cards */}
        <div className="space-y-3">
          {scopeItems.map((item, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-2"
            >
              <div className="relative w-full h-24 rounded-lg overflow-hidden border border-slate-200 bg-white">
                <img
                  src={item.image3DUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">{item.title}</h4>
                <p className="text-[11px] text-slate-500 font-normal leading-relaxed mt-0.5">
                  {item.desc}
                </p>
                <div className="text-[10px] font-bold text-slate-700 mt-1 pt-1 border-t border-slate-200/60">
                  {item.specs}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* System Badges & Guarantees */}
        <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2">
          <div className="text-xs font-black text-white">Garance kvality Vesper Frames</div>
          <ul className="text-[11px] text-slate-300 font-medium space-y-1">
            <li className="flex items-center gap-1.5">
              <span className="text-white font-black">✓</span> Certifikovaný systém DNK 1.1 & 1.2
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-white font-black">✓</span> Hrubá stavba pod střechou do tří dnů
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-white font-black">✓</span> Záruka 30 let na nosnou konstrukci
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
