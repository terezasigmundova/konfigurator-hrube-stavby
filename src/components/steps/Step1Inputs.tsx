'use client';

import React, { useState } from 'react';
import { RUIAN_INDEX, RuianAddressItem } from '@/lib/ruian';
import { VesperIcon } from '@/components/ui/VesperIcon';

export interface Step1Data {
  projectName: string;
  municipalityName: string;
  municipalityCode: string;
  postalCode: string;
  distanceKmFromFactory: number;
  truckAccess: 'YES' | 'NO' | 'UNKNOWN';
  craneAccess: 'YES' | 'NO' | 'UNKNOWN';
  storeysCount: number;
  targetAssemblyDate: string;
}

interface Step1InputsProps {
  initialData?: Partial<Step1Data>;
  onChange?: (data: Step1Data) => void;
  onNext?: () => void;
}

export function Step1Inputs({ initialData, onChange, onNext }: Step1InputsProps) {
  const [projectName, setProjectName] = useState<string>(initialData?.projectName || 'Modelový rodinný dům');
  const [municipalitySearch, setMunicipalitySearch] = useState<string>(initialData?.municipalityName || 'Bruntál');
  const [selectedMunicipality, setSelectedMunicipality] = useState<RuianAddressItem | null>(
    RUIAN_INDEX.find((m) => m.municipalityName === (initialData?.municipalityName || 'Bruntál')) || RUIAN_INDEX[0]
  );
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  const [truckAccess, setTruckAccess] = useState<'YES' | 'NO' | 'UNKNOWN'>(initialData?.truckAccess || 'YES');
  const [craneAccess, setCraneAccess] = useState<'YES' | 'NO' | 'UNKNOWN'>(initialData?.craneAccess || 'YES');
  const [storeysCount, setStoreysCount] = useState<number>(initialData?.storeysCount || 2);
  const [targetAssemblyDate, setTargetAssemblyDate] = useState<string>(initialData?.targetAssemblyDate || '2026-10');

  const filteredMunicipalities = RUIAN_INDEX.filter(
    (m) =>
      m.municipalityName.toLowerCase().includes(municipalitySearch.toLowerCase()) ||
      m.postalCode.includes(municipalitySearch)
  ).slice(0, 5);

  const handleSelectMunicipality = (m: RuianAddressItem) => {
    setSelectedMunicipality(m);
    setMunicipalitySearch(m.municipalityName);
    setShowSuggestions(false);
    emitChange({ municipality: m });
  };

  const emitChange = (overrides?: {
    name?: string;
    municipality?: RuianAddressItem | null;
    truck?: 'YES' | 'NO' | 'UNKNOWN';
    crane?: 'YES' | 'NO' | 'UNKNOWN';
    storeys?: number;
    date?: string;
  }) => {
    if (!onChange) return;
    const m = overrides?.municipality !== undefined ? overrides.municipality : selectedMunicipality;

    onChange({
      projectName: overrides?.name !== undefined ? overrides.name : projectName,
      municipalityName: m?.municipalityName || municipalitySearch,
      municipalityCode: m?.municipalityCode || '',
      postalCode: m?.postalCode || '',
      distanceKmFromFactory: 0,
      truckAccess: overrides?.truck !== undefined ? overrides.truck : truckAccess,
      craneAccess: overrides?.crane !== undefined ? overrides.crane : craneAccess,
      storeysCount: overrides?.storeys !== undefined ? overrides.storeys : storeysCount,
      targetAssemblyDate: overrides?.date !== undefined ? overrides.date : targetAssemblyDate,
    });
  };

  return (
    <div className="bg-white border border-[#d8dee8] p-6 rounded-2xl shadow-xs space-y-6 max-w-3xl mx-auto my-4 font-sans select-none">
      <div className="border-b border-[#d8dee8] pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-[#0f172a] tracking-tight flex items-center gap-2">
            <VesperIcon name="home" className="w-5 h-5 text-[#0f172a]" />
            Příprava projektu rodinného domu Vesper Frames
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Zadejte lokalitu stavby a požadovaná podlaží pro specifikaci panelů.
          </p>
        </div>
        <span className="v-status v-status--complete">
          <VesperIcon name="complete" />
          Krok 1 / 7
        </span>
      </div>

      <div className="space-y-5">
        {/* Project Name Input */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
            <VesperIcon name="document" className="w-4 h-4 text-slate-600" />
            Název projektu / stavby
          </label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => {
              setProjectName(e.target.value);
              emitChange({ name: e.target.value });
            }}
            placeholder="např. Rodinný dům Bruntál..."
            className="w-full px-3.5 py-2.5 bg-white border border-[#d8dee8] rounded-xl text-slate-900 font-bold text-xs focus:outline-none focus:border-[#0f172a] transition"
          />
        </div>

        {/* RÚIAN Municipality Autocomplete */}
        <div className="relative">
          <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
            <VesperIcon name="location" className="w-4 h-4 text-slate-600" />
            Místo stavby (Obec nebo PSČ v ČR) *
          </label>
          <input
            type="text"
            value={municipalitySearch}
            onChange={(e) => {
              setMunicipalitySearch(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Začněte psát obec nebo PSČ (např. Bruntál, 792 01)..."
            className="w-full px-3.5 py-2.5 bg-white border border-[#d8dee8] rounded-xl text-slate-900 font-bold text-xs focus:outline-none focus:border-[#0f172a] transition"
          />

          {showSuggestions && filteredMunicipalities.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#d8dee8] rounded-xl shadow-lg z-50 overflow-hidden">
              {filteredMunicipalities.map((m) => (
                <div
                  key={m.municipalityCode}
                  onClick={() => handleSelectMunicipality(m)}
                  className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer flex justify-between items-center text-xs border-b border-slate-100 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <VesperIcon name="location" className="w-4 h-4 text-slate-400" />
                    <span className="font-bold text-slate-900">{m.municipalityName}</span>
                    <span className="text-slate-500 font-medium">({m.region})</span>
                  </div>
                  <div className="text-slate-400 font-mono text-[11px]">{m.postalCode}</div>
                </div>
              ))}
            </div>
          )}

          {selectedMunicipality && (
            <div className="mt-2 text-xs text-slate-700 bg-[#f1f3f5] border border-[#d8dee8] p-3 rounded-xl flex items-center justify-between font-medium">
              <div className="flex items-center gap-2">
                <VesperIcon name="complete" className="w-4 h-4 text-[#0f172a]" />
                <span className="font-bold text-slate-900">{selectedMunicipality.municipalityName}</span> ({selectedMunicipality.region}) — PSČ {selectedMunicipality.postalCode}
              </div>
              <div className="text-slate-900 font-extrabold flex items-center gap-1.5">
                <VesperIcon name="truck" className="w-4 h-4 text-slate-700" />
                {selectedMunicipality.zoneName}
              </div>
            </div>
          )}
        </div>

        {/* Storeys Count Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
            <VesperIcon name="storeys" className="w-4 h-4 text-slate-600" />
            Počet nadzemních podlaží
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { count: 1, title: '1.NP (Bungalov)', desc: 'Přízemní rodinný dům' },
              { count: 2, title: '2.NP (Patrový dům)', desc: '1.NP + 2.NP / Podkroví' },
              { count: 3, title: '3.NP (Vícenásobné)', desc: '2 patra + Podkroví' },
            ].map((st) => (
              <button
                key={st.count}
                type="button"
                aria-pressed={storeysCount === st.count}
                onClick={() => {
                  setStoreysCount(st.count);
                  emitChange({ storeys: st.count });
                }}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  storeysCount === st.count
                    ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-xs'
                    : 'bg-white text-slate-700 border-[#d8dee8] hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`text-xs font-extrabold ${storeysCount === st.count ? 'text-white' : 'text-slate-900'}`}>
                    {st.title}
                  </div>
                  <VesperIcon name="storeys" className={`w-4 h-4 ${storeysCount === st.count ? 'text-white' : 'text-slate-400'}`} />
                </div>
                <div className={`text-[11px] mt-1 font-medium ${storeysCount === st.count ? 'text-slate-300' : 'text-slate-500'}`}>
                  {st.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Logistics & Access Checks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <VesperIcon name="truck" className="w-4 h-4 text-slate-600" />
              Příjezd pro kamiony
            </label>
            <div className="flex gap-2">
              {[
                { val: 'YES', label: 'Bezproblémový' },
                { val: 'NO', label: 'Omezený / Posudek' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  aria-pressed={truckAccess === opt.val}
                  onClick={() => {
                    const v = opt.val as 'YES' | 'NO';
                    setTruckAccess(v);
                    emitChange({ truck: v });
                  }}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                    truckAccess === opt.val
                      ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-xs'
                      : 'bg-white text-slate-700 border-[#d8dee8] hover:bg-slate-50'
                  }`}
                >
                  <VesperIcon name="truck" className="w-3.5 h-3.5" />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <VesperIcon name="crane" className="w-4 h-4 text-slate-600" />
              Uplatnění autojeřábu
            </label>
            <div className="flex gap-2">
              {[
                { val: 'YES', label: 'Možné osazení' },
                { val: 'NO', label: 'Nutné posouzení BOZP' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  aria-pressed={craneAccess === opt.val}
                  onClick={() => {
                    const v = opt.val as 'YES' | 'NO';
                    setCraneAccess(v);
                    emitChange({ crane: v });
                  }}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                    craneAccess === opt.val
                      ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-xs'
                      : 'bg-white text-slate-700 border-[#d8dee8] hover:bg-slate-50'
                  }`}
                >
                  <VesperIcon name="crane" className="w-3.5 h-3.5" />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Assembly Date Target */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
            <VesperIcon name="calendar" className="w-4 h-4 text-slate-600" />
            Požadovaný termín montáže
          </label>
          <input
            type="month"
            value={targetAssemblyDate}
            onChange={(e) => {
              setTargetAssemblyDate(e.target.value);
              emitChange({ date: e.target.value });
            }}
            className="w-full px-3.5 py-2.5 bg-white border border-[#d8dee8] rounded-xl text-slate-900 font-bold text-xs focus:outline-none focus:border-[#0f172a] transition"
          />
        </div>
      </div>
    </div>
  );
}
