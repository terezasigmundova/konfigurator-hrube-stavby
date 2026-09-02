'use client';

import React from 'react';

export interface CatalogDrawerItem {
  code: string;
  name: string;
  category: string;
  thicknessMm: number;
  description: string;
  unitPriceExVat: number;
  image3DUrl?: string;
  thermalU?: string;
  insulationLayers?: string;
  recommendedFor?: string;
}

const CATALOG_ITEMS: CatalogDrawerItem[] = [
  {
    code: '1.1',
    name: 'Obvodový panel s kontaktním zateplením a armovací vrstvou',
    category: 'WALL_OUTER',
    thicknessMm: 341.0,
    description: 'Difuzně otevřená skladba s minerálním kontaktním zateplením 100 mm a vyztuženou armovací vrstvou.',
    unitPriceExVat: 8500,
    image3DUrl: '/panels/catalog/1_1/panel_1_1_thumb.webp',
    thermalU: 'U = 0,14 W/m²K',
    insulationLayers: 'Fasádní izolace 100 mm + Minerální vata v rámu 160 mm',
    recommendedFor: 'Standardní novostavby rodinných domů (Doporučeno)',
  },
  {
    code: '1.2',
    name: 'Obvodový panel pro provětrávanou dřevěnou fasádu',
    category: 'WALL_OUTER',
    thicknessMm: 398.5,
    description: 'Masivnější nosný rám 240 mm, difuzní membrána a dvojitý dřevěný podkladní rošt.',
    unitPriceExVat: 10238,
    image3DUrl: '/panels/catalog/1_2/panel_1_2_thumb.webp',
    thermalU: 'U = 0,13 W/m²K',
    insulationLayers: 'Dvojitý rošt 2×40 mm + Minerální vata v rámu 240 mm',
    recommendedFor: 'Moderní ekologické domy s dřevěnou fasádou',
  },
  {
    code: '1.3',
    name: 'Ekonomický základní panel s otevřenou předstěnou',
    category: 'WALL_OUTER',
    thicknessMm: 225.5,
    description: 'Základní nosná konstrukce s otevřeným roštem; dokončení elektro, izolace a fasády zajišťuje klient.',
    unitPriceExVat: 6450,
    image3DUrl: '/panels/catalog/1_3/panel_1_3_thumb.webp',
    thermalU: 'U = 0,22 W/m²K',
    insulationLayers: 'Minerální vata v nosném rámu 160 mm',
    recommendedFor: 'Ekonomická stavba svépomocí / dokončení klientem',
  },
  {
    code: '1.4',
    name: 'CLT masivní panel 84 mm, jednostranně pohledový',
    category: 'WALL_OUTER',
    thicknessMm: 84.0,
    description: 'Třívrstvý křížem lepený masivní dřevěný panel s vyfrézovanými elektro-trasami přímo v těle masivu.',
    unitPriceExVat: 9200,
    image3DUrl: '/panels/catalog/1_4/panel_1_4_thumb.webp',
    thermalU: 'Pohledový masiv VI',
    insulationLayers: 'Křížem lepený smrkový masiv 28/28/28 mm',
    recommendedFor: 'Prémiové moderní dřevostavby z masivního dřeva',
  },
  {
    code: 'NS_VF_01',
    name: 'Vnitřní nosná stěna',
    category: 'WALL_INNER',
    thicknessMm: 170.0,
    description: 'Vnitřní nosný panel Skladba 2.1 s vysokou únosností a akustickou výplní.',
    unitPriceExVat: 3500,
    image3DUrl: '/panels/NS_VF_01_3D.jpg',
    thermalU: 'Akustika Rw = 46 dB',
    insulationLayers: 'KVH 120 mm + Minerální akustická vata + Opláštění 2×15 mm',
    recommendedFor: 'Vnitřní nosné stěny a schodišťová jádra',
  },
  {
    code: 'DS_VF_01',
    name: 'Akustická mezibytová příčka',
    category: 'WALL_INNER',
    thicknessMm: 300.0,
    description: 'Akustický mezibytový dělící panel Skladba 2.2 se vzduchovou mezerou.',
    unitPriceExVat: 5500,
    image3DUrl: '/panels/DS_VF_01_3D.jpg',
    thermalU: 'Akustika Rw = 62 dB',
    insulationLayers: 'Dvojitý KVH rám + Akustická mezerová izolace',
    recommendedFor: 'Odhlučnění ložnic a dělící stěny dvojdomků',
  },
  {
    code: 'PS_VF_01',
    name: 'Vnitřní nenosná příčka 100 mm',
    category: 'WALL_INNER',
    thicknessMm: 120.0,
    description: 'Příčkový mezipokojový panel Skladba 2.3.',
    unitPriceExVat: 2800,
    image3DUrl: '/panels/NS_VF_01_3D.jpg',
    thermalU: 'Akustika Rw = 42 dB',
    insulationLayers: 'KVH 100 mm + Minerální vata 100 mm',
    recommendedFor: 'Běžné pokojové vnitřní příčky',
  },

  {
    code: 'STROP_RD',
    name: 'Strop pro rodinné domy',
    category: 'CEILING',
    thicknessMm: 432.0,
    description: 'Mezipodlažní stropní panel Skladba 3.1 s kročejovou izolací.',
    unitPriceExVat: 6000,
    image3DUrl: '/panels/STROP_RD_3D.jpg',
    thermalU: 'Kročejová neprůzvučnost Lnw = 48 dB',
    recommendedFor: 'Mezipodlažní stropy rodinných domů',
  },
  {
    code: 'STRECHA_SIKMA',
    name: 'Šikmá střecha',
    category: 'ROOF',
    thicknessMm: 455.0,
    description: 'Prefabrikovaný střešní panel Skladba 4.1.',
    unitPriceExVat: 6500,
    image3DUrl: '/panels/STRECHA_SIKMA_3D.jpg',
    thermalU: 'U = 0,11 W/m²K',
    recommendedFor: 'Šikmé i pultové střešní konstrukce',
  },
];

interface CatalogDrawerProps {
  activeCategory?: string;
  category?: string;
  selectedCode?: string;
  onSelectCode: (code: string) => void;
}

export function CatalogDrawer({
  activeCategory,
  category,
  selectedCode = 'OS_VF_01',
  onSelectCode,
}: CatalogDrawerProps) {
  const currentCategory = category || activeCategory || 'WALL_OUTER';

  const filteredItems = CATALOG_ITEMS.filter(
    (item) => item.category === currentCategory
  );

  return (
    <aside className="w-full lg:w-80 bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col h-full shadow-xs space-y-4">
      <div className="pb-3 border-b border-slate-200">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Panely Vesper Frames
          </h3>
          <span className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
            {currentCategory === 'WALL_OUTER'
              ? 'Vnější obvodové'
              : currentCategory === 'WALL_INNER'
              ? 'Vnitřní nosné & dělící'
              : currentCategory === 'CEILING'
              ? 'Stropní dílce'
              : 'Střešní dílce'}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1 font-medium">
          Vyberte certifikovaný panel pro zakreslení výkresu
        </p>
      </div>

      <div className="space-y-3 overflow-y-auto pr-1 flex-1 max-h-[620px]">
        {filteredItems.map((item) => {
          const isSelected = item.code === selectedCode;

          return (
            <div
              key={item.code}
              onClick={() => onSelectCode(item.code)}
              className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col gap-2.5 ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              {/* 3D Visual Render Preview */}
              {item.image3DUrl && (
                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                  <img
                    src={item.image3DUrl}
                    alt={item.name}
                    className="w-full h-full object-cover transform hover:scale-105 transition duration-300"
                  />
                  {isSelected && (
                    <span className="absolute top-2 right-2 bg-blue-500 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow-xs">
                      Aktivní volba
                    </span>
                  )}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className={`text-xs font-extrabold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {item.name}
                  </h4>
                </div>
                <p className={`text-[11px] leading-tight mb-2 font-medium ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {item.description}
                </p>

                {item.thermalU && (
                  <div className={`text-[10px] font-semibold px-2 py-1 rounded border mb-2 ${
                    isSelected ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}>
                    {item.thermalU} {item.insulationLayers ? `• ${item.insulationLayers}` : ''}
                  </div>
                )}
              </div>

              <div className={`flex items-center justify-between text-xs pt-2 border-t ${
                isSelected ? 'border-slate-800' : 'border-slate-200'
              }`}>
                <span className={`text-[11px] font-medium ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                  Tloušťka {item.thicknessMm} mm
                </span>
                <span className={`font-black text-xs ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                  {new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(item.unitPriceExVat)} / m²
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
