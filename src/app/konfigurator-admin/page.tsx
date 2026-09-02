'use client';

import React, { useState, useEffect } from 'react';
import { VesperIcon } from '@/components/ui/VesperIcon';
import { PanelDetailModal } from '@/components/modals/PanelDetailModal';

export default function KonfiguratorAdminPage() {
  const [configData, setConfigData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Active Tab: 'products' | 'texts' | 'budget' | 'backups'
  const [activeTab, setActiveTab] = useState<'products' | 'texts' | 'budget' | 'backups'>('products');

  // Selected Product for Tab 1
  const [selectedProductCode, setSelectedProductCode] = useState<string>('1.1');

  // Modal preview state
  const [previewPanelCode, setPreviewPanelCode] = useState<string | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/config');
      if (res.ok) {
        const data = await res.json();
        setConfigData(data);
      }
    } catch (e) {
      console.error('Failed to load master config:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      setSaveMessage(null);
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData),
      });
      if (res.ok) {
        setSaveMessage({ text: 'Změny byly úspěšně uloženy do centrálního katalogu.', type: 'success' });
        setTimeout(() => setSaveMessage(null), 4000);
      } else {
        setSaveMessage({ text: 'Chyba při ukládání konfigurace.', type: 'error' });
      }
    } catch (e) {
      setSaveMessage({ text: 'Nastala chyba při spojení se serverem.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(configData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `prefa_sop_master_config_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && parsed.products) {
            setConfigData(parsed);
            setSaveMessage({ text: 'Konfigurace byla úspěšně načtena ze souboru. Nezapomeňte změny uložit.', type: 'success' });
          } else {
            alert('Neplatná struktura JSON souboru.');
          }
        } catch (err) {
          alert('Chyba při parsování JSON souboru.');
        }
      };
    }
  };

  // Helper to update specific product
  const updateProduct = (code: string, updater: (p: any) => any) => {
    setConfigData((prev: any) => {
      const products = prev.products.map((p: any) => (p.code === code ? updater({ ...p }) : p));
      return { ...prev, products };
    });
  };

  // Helper to update UI texts
  const updateUiText = (stepKey: string, field: string, value: any) => {
    setConfigData((prev: any) => ({
      ...prev,
      stepUiTexts: {
        ...prev.stepUiTexts,
        [stepKey]: {
          ...prev.stepUiTexts[stepKey],
          [field]: value,
        },
      },
    }));
  };

  // Helper to update budget rates
  const updateBudgetRate = (section: string, field: string, value: any) => {
    setConfigData((prev: any) => ({
      ...prev,
      budgetRatesAndLogistics: {
        ...prev.budgetRatesAndLogistics,
        [section]: {
          ...prev.budgetRatesAndLogistics[section],
          [field]: value,
        },
      },
    }));
  };

  if (loading || !configData) {
    return (
      <div className="min-h-screen bg-[var(--prefa-paper)] flex items-center justify-center p-6 font-tech">
        <div className="bg-white border border-[var(--prefa-line)] p-8 rounded-sm shadow-sm flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[var(--prefa-aqua)] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-[var(--prefa-ink)]">Načítám centrální produktovou databázi...</span>
        </div>
      </div>
    );
  }

  const currentProduct = configData.products.find((p: any) => p.code === selectedProductCode) || configData.products[0];

  return (
    <div className="min-h-screen bg-[var(--prefa-paper)] text-[var(--prefa-ink)] font-tech select-none pb-20">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[var(--prefa-line)] shadow-2xs px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <a href="/" className="shrink-0" title="PREFA ŠOP">
            <img src="/brand/prefa-sop.svg" alt="PREFA ŠOP" className="h-7 w-auto" />
          </a>
          <div className="h-5 w-px bg-[var(--prefa-line)] hidden sm:block"></div>
          <div>
            <div className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--prefa-aqua)]">
              Centrální správa konfigurátoru • Zdroj pravdy
            </div>
            <h1 className="text-base font-display font-bold text-[var(--prefa-ink)] tracking-tight">
              Administrace produktů, textů a cenotvorby
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saveMessage && (
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-sm border flex items-center gap-1.5 animate-fadeIn ${
              saveMessage.type === 'success' ? 'bg-[#EBF4F4] text-[#3B6365] border-[#C5DEDF]' : 'bg-[#FAF4EC] text-[#9E6E2E] border-[#ECDCC7]'
            }`}>
              <VesperIcon name={saveMessage.type === 'success' ? 'check' : 'warning'} className="w-3.5 h-3.5" />
              <span>{saveMessage.text}</span>
            </span>
          )}

          <a
            href="/konfigurator"
            target="_blank"
            className="px-3.5 py-2 bg-white border border-[var(--prefa-line)] hover:bg-[var(--prefa-linen)] text-xs font-semibold text-[var(--prefa-cedar)] hover:text-[var(--prefa-ink)] rounded-sm transition flex items-center gap-1.5"
          >
            <span>Otevřít konfigurátor</span>
            <span className="text-[10px]">↗</span>
          </a>

          <button
            type="button"
            disabled={saving}
            onClick={handleSaveAll}
            className="px-5 py-2 bg-[var(--prefa-ink)] hover:bg-[var(--prefa-ink)]/90 text-white font-display font-bold text-xs uppercase tracking-wider rounded-sm transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <VesperIcon name="save" className="w-4 h-4" />
            <span>{saving ? 'Ukládám...' : 'Uložit změny'}</span>
          </button>
        </div>
      </header>

      {/* Main Tabs Navigation */}
      <nav className="bg-[var(--prefa-paper)] border-b border-[var(--prefa-line)] px-6">
        <div className="flex gap-2 max-w-7xl mx-auto pt-3 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 font-display font-bold text-xs uppercase tracking-wider rounded-t-sm border-t border-x transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'products'
                ? 'bg-white border-[var(--prefa-line)] text-[var(--prefa-ink)] -mb-px'
                : 'border-transparent text-[var(--prefa-cedar)] hover:text-[var(--prefa-ink)] hover:bg-white/50'
            }`}
          >
            <VesperIcon name="panel" className="w-4 h-4" />
            <span>1. Produkty a skladby (Katalog & Příplatky)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('texts')}
            className={`px-4 py-2.5 font-display font-bold text-xs uppercase tracking-wider rounded-t-sm border-t border-x transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'texts'
                ? 'bg-white border-[var(--prefa-line)] text-[var(--prefa-ink)] -mb-px'
                : 'border-transparent text-[var(--prefa-cedar)] hover:text-[var(--prefa-ink)] hover:bg-white/50'
            }`}
          >
            <VesperIcon name="document" className="w-4 h-4" />
            <span>2. Texty a informační bloky kroků</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('budget')}
            className={`px-4 py-2.5 font-display font-bold text-xs uppercase tracking-wider rounded-t-sm border-t border-x transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'budget'
                ? 'bg-white border-[var(--prefa-line)] text-[var(--prefa-ink)] -mb-px'
                : 'border-transparent text-[var(--prefa-cedar)] hover:text-[var(--prefa-ink)] hover:bg-white/50'
            }`}
          >
            <VesperIcon name="price" className="w-4 h-4" />
            <span>3. Cenotvorba & Strategie rozpočtu (Všechny položky)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('backups')}
            className={`px-4 py-2.5 font-display font-bold text-xs uppercase tracking-wider rounded-t-sm border-t border-x transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'backups'
                ? 'bg-white border-[var(--prefa-line)] text-[var(--prefa-ink)] -mb-px'
                : 'border-transparent text-[var(--prefa-cedar)] hover:text-[var(--prefa-ink)] hover:bg-white/50'
            }`}
          >
            <VesperIcon name="layers" className="w-4 h-4" />
            <span>4. Správa dat & Zálohy (JSON)</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* ========================================================================= */}
        {/* TAB 1: PRODUKTY & SKLADBY */}
        {/* ========================================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            
            {/* Product Selector Sub-nav */}
            <div className="bg-white border border-[var(--prefa-line)] p-4 rounded-sm shadow-2xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-display font-bold uppercase tracking-wider text-[var(--prefa-cedar)] mr-2">
                  Vyberte skladbu:
                </span>
                {configData.products.map((prod: any) => (
                  <button
                    key={prod.code}
                    type="button"
                    onClick={() => setSelectedProductCode(prod.code)}
                    className={`px-3.5 py-1.5 text-xs font-display font-bold rounded-xs transition cursor-pointer ${
                      selectedProductCode === prod.code
                        ? 'bg-[var(--prefa-ink)] text-white shadow-xs'
                        : 'bg-[var(--prefa-paper)] border border-[var(--prefa-line)] text-[var(--prefa-cedar)] hover:text-[var(--prefa-ink)]'
                    }`}
                  >
                    {prod.category === 'WALL_OUTER' ? 'Stěna' : prod.category === 'CEILING' ? 'Strop' : prod.category === 'ROOF' ? 'Střecha' : 'Příčka'} {prod.code} ({prod.declaredThicknessMm} mm)
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setPreviewPanelCode(currentProduct.code)}
                className="px-3.5 py-1.5 bg-[#EBF4F4] border border-[#C5DEDF] hover:bg-[#deeded] text-[#3B6365] font-display font-bold text-xs rounded-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <VesperIcon name="review" className="w-3.5 h-3.5" />
                <span>Živý náhled modalu</span>
              </button>
            </div>

            {/* Product Edit Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Basic Info & Technical Specs */}
              <div className="space-y-6">
                
                {/* A. Basic Info & Price */}
                <div className="bg-white border border-[var(--prefa-line)] p-5 rounded-sm shadow-2xs space-y-4">
                  <h3 className="font-display font-bold text-sm text-[var(--prefa-ink)] uppercase tracking-wider border-b border-[var(--prefa-line)] pb-2 flex items-center gap-2">
                    <VesperIcon name="panel" className="w-4 h-4 text-[var(--prefa-aqua)]" />
                    <span>Základní údaje & Cena</span>
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--prefa-cedar)] mb-1">Kód panelu</label>
                      <input
                        type="text"
                        value={currentProduct.code}
                        onChange={(e) => updateProduct(currentProduct.code, (p) => ({ ...p, code: e.target.value }))}
                        className="w-full h-9 px-3 text-xs font-bold border border-[var(--prefa-line)] rounded-sm bg-[var(--prefa-paper)]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--prefa-cedar)] mb-1">Název produktu</label>
                      <input
                        type="text"
                        value={currentProduct.name}
                        onChange={(e) => updateProduct(currentProduct.code, (p) => ({ ...p, name: e.target.value }))}
                        className="w-full h-9 px-3 text-xs font-bold border border-[var(--prefa-line)] rounded-sm bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--prefa-cedar)] mb-1">Podtitul / Krátký popis</label>
                      <textarea
                        rows={2}
                        value={currentProduct.subtitle || ''}
                        onChange={(e) => updateProduct(currentProduct.code, (p) => ({ ...p, subtitle: e.target.value }))}
                        className="w-full p-2.5 text-xs border border-[var(--prefa-line)] rounded-sm bg-white leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-xs font-semibold text-[var(--prefa-cedar)] mb-1">Základní cena / m²</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={currentProduct.unitPriceExVat}
                            onChange={(e) => updateProduct(currentProduct.code, (p) => ({ ...p, unitPriceExVat: parseFloat(e.target.value) || 0 }))}
                            className="w-full h-9 px-3 pr-8 text-xs font-mono font-bold border border-[var(--prefa-line)] rounded-sm bg-white text-[var(--prefa-aqua)]"
                          />
                          <span className="absolute right-2.5 top-2.5 text-[10px] text-[var(--prefa-stone)] font-bold">Kč</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[var(--prefa-cedar)] mb-1">Doporučený produkt</label>
                        <select
                          value={currentProduct.isRecommended ? 'true' : 'false'}
                          onChange={(e) => updateProduct(currentProduct.code, (p) => ({ ...p, isRecommended: e.target.value === 'true' }))}
                          className="w-full h-9 px-2 text-xs border border-[var(--prefa-line)] rounded-sm bg-white font-medium"
                        >
                          <option value="true">Ano (Doporučeno)</option>
                          <option value="false">Standardní volba</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* A2. Procentuální příplatky (Do technické rezervy) */}
                <div className="bg-[#FAF8F5] border border-[#ECDCC7] p-5 rounded-sm shadow-2xs space-y-4">
                  <div className="border-b border-[#ECDCC7] pb-2">
                    <div className="text-[10px] font-display font-bold uppercase tracking-wider text-[#9E6E2E]">Příplatky do technické rezervy</div>
                    <h3 className="font-display font-bold text-sm text-[var(--prefa-ink)] flex items-center gap-2">
                      <VesperIcon name="price" className="w-4 h-4 text-[#9E6E2E]" />
                      <span>Specifické % příplatky panelu</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--prefa-cedar)] mb-1">Akustika (%)</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.5"
                          value={currentProduct.surcharges?.acousticsSurchargePct || 0}
                          onChange={(e) => updateProduct(currentProduct.code, (p) => ({
                            ...p,
                            surcharges: { ...p.surcharges, acousticsSurchargePct: parseFloat(e.target.value) || 0 }
                          }))}
                          className="w-full h-9 px-3 pr-6 text-xs font-mono font-bold border border-[#ECDCC7] rounded-sm bg-white"
                        />
                        <span className="absolute right-2 top-2.5 text-[10px] text-[var(--prefa-stone)] font-bold">%</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--prefa-cedar)] mb-1">Požární odolnost (%)</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.5"
                          value={currentProduct.surcharges?.fireResistanceSurchargePct || 0}
                          onChange={(e) => updateProduct(currentProduct.code, (p) => ({
                            ...p,
                            surcharges: { ...p.surcharges, fireResistanceSurchargePct: parseFloat(e.target.value) || 0 }
                          }))}
                          className="w-full h-9 px-3 pr-6 text-xs font-mono font-bold border border-[#ECDCC7] rounded-sm bg-white"
                        />
                        <span className="absolute right-2 top-2.5 text-[10px] text-[var(--prefa-stone)] font-bold">%</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--prefa-cedar)] mb-1">Nadrozměrné otvory (%)</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.5"
                          value={currentProduct.surcharges?.oversizedOpeningsSurchargePct || 0}
                          onChange={(e) => updateProduct(currentProduct.code, (p) => ({
                            ...p,
                            surcharges: { ...p.surcharges, oversizedOpeningsSurchargePct: parseFloat(e.target.value) || 0 }
                          }))}
                          className="w-full h-9 px-3 pr-6 text-xs font-mono font-bold border border-[#ECDCC7] rounded-sm bg-white"
                        />
                        <span className="absolute right-2 top-2.5 text-[10px] text-[var(--prefa-stone)] font-bold">%</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--prefa-cedar)] mb-1">Velkorozponové konstr. (%)</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.5"
                          value={currentProduct.surcharges?.largeSpanSurchargePct || 0}
                          onChange={(e) => updateProduct(currentProduct.code, (p) => ({
                            ...p,
                            surcharges: { ...p.surcharges, largeSpanSurchargePct: parseFloat(e.target.value) || 0 }
                          }))}
                          className="w-full h-9 px-3 pr-6 text-xs font-mono font-bold border border-[#ECDCC7] rounded-sm bg-white"
                        />
                        <span className="absolute right-2 top-2.5 text-[10px] text-[var(--prefa-stone)] font-bold">%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* B. Technical Parameters */}
                <div className="bg-white border border-[var(--prefa-line)] p-5 rounded-sm shadow-2xs space-y-4">
                  <h3 className="font-display font-bold text-sm text-[var(--prefa-ink)] uppercase tracking-wider border-b border-[var(--prefa-line)] pb-2 flex items-center gap-2">
                    <VesperIcon name="ruler" className="w-4 h-4 text-[var(--prefa-aqua)]" />
                    <span>Technické a fyzikální parametry</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--prefa-cedar)] mb-1">Prostup tepla U (W/m²K)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={currentProduct.technicalParameters?.uValue || ''}
                        onChange={(e) => updateProduct(currentProduct.code, (p) => ({
                          ...p,
                          technicalParameters: { ...p.technicalParameters, uValue: parseFloat(e.target.value) || 0 }
                        }))}
                        className="w-full h-9 px-3 text-xs font-mono font-bold border border-[var(--prefa-line)] rounded-sm bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--prefa-cedar)] mb-1">Útlum Rw (dB)</label>
                      <input
                        type="number"
                        value={currentProduct.technicalParameters?.rwDb || ''}
                        onChange={(e) => updateProduct(currentProduct.code, (p) => ({
                          ...p,
                          technicalParameters: { ...p.technicalParameters, rwDb: parseInt(e.target.value) || 0 }
                        }))}
                        className="w-full h-9 px-3 text-xs font-mono font-bold border border-[var(--prefa-line)] rounded-sm bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--prefa-cedar)] mb-1">Požární odolnost</label>
                      <input
                        type="text"
                        value={currentProduct.technicalParameters?.fireResistance || ''}
                        onChange={(e) => updateProduct(currentProduct.code, (p) => ({
                          ...p,
                          technicalParameters: { ...p.technicalParameters, fireResistance: e.target.value }
                        }))}
                        className="w-full h-9 px-3 text-xs font-bold border border-[var(--prefa-line)] rounded-sm bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--prefa-cedar)] mb-1">Tloušťka panelu (mm)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={currentProduct.declaredThicknessMm}
                        onChange={(e) => updateProduct(currentProduct.code, (p) => ({ ...p, declaredThicknessMm: parseFloat(e.target.value) || 0 }))}
                        className="w-full h-9 px-3 text-xs font-mono font-bold border border-[var(--prefa-line)] rounded-sm bg-white text-[var(--prefa-aqua)]"
                      />
                    </div>
                  </div>
                </div>

                {/* C. Electrical Preparation */}
                <div className="bg-white border border-[var(--prefa-line)] p-5 rounded-sm shadow-2xs space-y-4">
                  <h3 className="font-display font-bold text-sm text-[var(--prefa-ink)] uppercase tracking-wider border-b border-[var(--prefa-line)] pb-2 flex items-center gap-2">
                    <VesperIcon name="installation" className="w-4 h-4 text-[var(--prefa-aqua)]" />
                    <span>Příprava pro elektroinstalaci</span>
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-[var(--prefa-line-soft)] pb-2">
                      <span className="text-xs font-semibold text-[var(--prefa-cedar)]">Zahrnuto v ceně panelu:</span>
                      <input
                        type="checkbox"
                        checked={currentProduct.electricalPreparation?.included || false}
                        onChange={(e) => updateProduct(currentProduct.code, (p) => ({
                          ...p,
                          electricalPreparation: { ...p.electricalPreparation, included: e.target.checked }
                        }))}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--prefa-cedar)] mb-1">Nadpis sekce</label>
                      <input
                        type="text"
                        value={currentProduct.electricalPreparation?.heading || ''}
                        onChange={(e) => updateProduct(currentProduct.code, (p) => ({
                          ...p,
                          electricalPreparation: { ...p.electricalPreparation, heading: e.target.value }
                        }))}
                        className="w-full h-9 px-3 text-xs font-bold border border-[var(--prefa-line)] rounded-sm bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--prefa-cedar)] mb-1">Popis řešení</label>
                      <textarea
                        rows={3}
                        value={currentProduct.electricalPreparation?.description || ''}
                        onChange={(e) => updateProduct(currentProduct.code, (p) => ({
                          ...p,
                          electricalPreparation: { ...p.electricalPreparation, description: e.target.value }
                        }))}
                        className="w-full p-2.5 text-xs border border-[var(--prefa-line)] rounded-sm bg-white leading-relaxed"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Middle & Right Column: Layers & Delivery Scope */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* D. Skladbové vrstvy panelu */}
                <div className="bg-white border border-[var(--prefa-line)] p-5 rounded-sm shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--prefa-line)] pb-2">
                    <h3 className="font-display font-bold text-sm text-[var(--prefa-ink)] uppercase tracking-wider flex items-center gap-2">
                      <VesperIcon name="layers" className="w-4 h-4 text-[var(--prefa-aqua)]" />
                      <span>Skladbové vrstvy panelu ({currentProduct.layers?.length || 0} vrstev)</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        const newLayer = {
                          id: `L${(currentProduct.layers?.length || 0) + 1}`,
                          order: (currentProduct.layers?.length || 0) + 1,
                          name: 'Nová vrstva skladby',
                          materialId: 'fermacell_raw',
                          thicknessMm: 12.5,
                          additiveToTotal: true,
                          function: 'Popis funkce vrstvy ve skladbě.',
                        };
                        updateProduct(currentProduct.code, (p) => ({ ...p, layers: [...(p.layers || []), newLayer] }));
                      }}
                      className="px-3 py-1 bg-[var(--prefa-linen)] hover:bg-[var(--prefa-line)] text-xs font-display font-bold rounded-xs transition cursor-pointer"
                    >
                      + Přidat vrstvu
                    </button>
                  </div>

                  <div className="border border-[var(--prefa-line)] rounded-sm overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[var(--prefa-paper)] text-[var(--prefa-ink)] font-display font-bold text-[10px] uppercase tracking-wider border-b border-[var(--prefa-line)]">
                          <th className="py-2.5 px-3 w-8">#</th>
                          <th className="py-2.5 px-3">Název vrstvy</th>
                          <th className="py-2.5 px-3 w-24 text-right">Tl. (mm)</th>
                          <th className="py-2.5 px-3 w-28 text-center">Do tloušťky</th>
                          <th className="py-2.5 px-3">Funkce</th>
                          <th className="py-2.5 px-2 w-10 text-center">Akce</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--prefa-line-soft)]">
                        {currentProduct.layers?.map((layer: any, idx: number) => (
                          <tr key={layer.id || idx} className="hover:bg-[var(--prefa-paper)]/50 transition">
                            <td className="py-2.5 px-3 font-display font-bold text-[var(--prefa-aqua)]">{idx + 1}.</td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={layer.name}
                                onChange={(e) => {
                                  const layers = [...currentProduct.layers];
                                  layers[idx].name = e.target.value;
                                  updateProduct(currentProduct.code, (p) => ({ ...p, layers }));
                                }}
                                className="w-full px-2 py-1 text-xs border border-transparent hover:border-[var(--prefa-line)] focus:border-[var(--prefa-aqua)] rounded-xs bg-transparent"
                              />
                            </td>
                            <td className="py-2 px-3 text-right">
                              <input
                                type="number"
                                step="0.5"
                                value={layer.thicknessMm}
                                onChange={(e) => {
                                  const layers = [...currentProduct.layers];
                                  layers[idx].thicknessMm = parseFloat(e.target.value) || 0;
                                  updateProduct(currentProduct.code, (p) => ({ ...p, layers }));
                                }}
                                className="w-16 px-1.5 py-1 text-xs text-right font-mono font-bold border border-transparent hover:border-[var(--prefa-line)] focus:border-[var(--prefa-aqua)] rounded-xs bg-transparent"
                              />
                            </td>
                            <td className="py-2 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={layer.additiveToTotal}
                                onChange={(e) => {
                                  const layers = [...currentProduct.layers];
                                  layers[idx].additiveToTotal = e.target.checked;
                                  updateProduct(currentProduct.code, (p) => ({ ...p, layers }));
                                }}
                                className="w-3.5 h-3.5 cursor-pointer"
                                title="Zda zvětšuje celkovou tloušťku nebo je výplní rámu"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={layer.function || ''}
                                onChange={(e) => {
                                  const layers = [...currentProduct.layers];
                                  layers[idx].function = e.target.value;
                                  updateProduct(currentProduct.code, (p) => ({ ...p, layers }));
                                }}
                                className="w-full px-2 py-1 text-xs text-[var(--prefa-cedar)] border border-transparent hover:border-[var(--prefa-line)] focus:border-[var(--prefa-aqua)] rounded-xs bg-transparent"
                              />
                            </td>
                            <td className="py-2 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  const layers = currentProduct.layers.filter((_: any, i: number) => i !== idx);
                                  updateProduct(currentProduct.code, (p) => ({ ...p, layers }));
                                }}
                                className="text-[var(--prefa-stone)] hover:text-red-600 transition p-1 cursor-pointer"
                                title="Smazat vrstvu"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* E. Rozsah dodávky */}
                <div className="bg-white border border-[var(--prefa-line)] p-5 rounded-sm shadow-2xs space-y-4">
                  <h3 className="font-display font-bold text-sm text-[var(--prefa-ink)] uppercase tracking-wider border-b border-[var(--prefa-line)] pb-2 flex items-center gap-2">
                    <VesperIcon name="order" className="w-4 h-4 text-[var(--prefa-aqua)]" />
                    <span>Rozsah dodávky (Součást dodávky vs. Zajišťuje klient)</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Included in Delivery */}
                    <div className="p-4 bg-[#EBF4F4] border border-[#C5DEDF] rounded-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-display font-bold text-xs uppercase tracking-wider text-[#3B6365] flex items-center gap-1.5">
                          <VesperIcon name="check" className="w-3.5 h-3.5 text-[#3B6365]" />
                          <span>Součást dodávky panelu</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const included = [...(currentProduct.deliveryScope?.included || []), 'Nová položka dodávky'];
                            updateProduct(currentProduct.code, (p) => ({
                              ...p,
                              deliveryScope: { ...p.deliveryScope, included }
                            }));
                          }}
                          className="text-[10px] font-bold px-2 py-0.5 bg-white border border-[#C5DEDF] rounded-xs text-[#3B6365] cursor-pointer"
                        >
                          + Přidat
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {currentProduct.deliveryScope?.included?.map((item: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={item}
                              onChange={(e) => {
                                const included = [...currentProduct.deliveryScope.included];
                                included[idx] = e.target.value;
                                updateProduct(currentProduct.code, (p) => ({
                                  ...p,
                                  deliveryScope: { ...p.deliveryScope, included }
                                }));
                              }}
                              className="w-full px-2 py-1 text-xs border border-transparent hover:border-[#C5DEDF] bg-white/70 rounded-xs"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const included = currentProduct.deliveryScope.included.filter((_: any, i: number) => i !== idx);
                                updateProduct(currentProduct.code, (p) => ({
                                  ...p,
                                  deliveryScope: { ...p.deliveryScope, included }
                                }));
                              }}
                              className="text-slate-400 hover:text-red-600 text-xs px-1"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Client Supplied */}
                    <div className="p-4 bg-[#FAF4EC] border border-[#ECDCC7] rounded-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-display font-bold text-xs uppercase tracking-wider text-[#9E6E2E] flex items-center gap-1.5">
                          <VesperIcon name="info" className="w-3.5 h-3.5 text-[#9E6E2E]" />
                          <span>Zajišťuje klient na stavbě</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const clientSupplied = [...(currentProduct.deliveryScope?.clientSupplied || []), 'Nová klientská položka'];
                            updateProduct(currentProduct.code, (p) => ({
                              ...p,
                              deliveryScope: { ...p.deliveryScope, clientSupplied }
                            }));
                          }}
                          className="text-[10px] font-bold px-2 py-0.5 bg-white border border-[#ECDCC7] rounded-xs text-[#9E6E2E] cursor-pointer"
                        >
                          + Přidat
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {currentProduct.deliveryScope?.clientSupplied?.map((item: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={item}
                              onChange={(e) => {
                                const clientSupplied = [...currentProduct.deliveryScope.clientSupplied];
                                clientSupplied[idx] = e.target.value;
                                updateProduct(currentProduct.code, (p) => ({
                                  ...p,
                                  deliveryScope: { ...p.deliveryScope, clientSupplied }
                                }));
                              }}
                              className="w-full px-2 py-1 text-xs border border-transparent hover:border-[#ECDCC7] bg-white/70 rounded-xs"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const clientSupplied = currentProduct.deliveryScope.clientSupplied.filter((_: any, i: number) => i !== idx);
                                updateProduct(currentProduct.code, (p) => ({
                                  ...p,
                                  deliveryScope: { ...p.deliveryScope, clientSupplied }
                                }));
                              }}
                              className="text-slate-400 hover:text-red-600 text-xs px-1"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: TEXTY A INFORMAČNÍ BLOKY KROKŮ */}
        {/* ========================================================================= */}
        {activeTab === 'texts' && (
          <div className="space-y-6">
            
            {/* Step 1 Texts */}
            <div className="bg-white border border-[var(--prefa-line)] p-5 rounded-sm shadow-2xs space-y-4">
              <h3 className="font-display font-bold text-sm text-[var(--prefa-ink)] uppercase tracking-wider border-b border-[var(--prefa-line)] pb-2">
                Krok 1: Nastavení projektu & Místo stavby
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--prefa-cedar)] mb-1">Nadpis v hlavičce (Tereza)</label>
                  <input
                    type="text"
                    value={configData.stepUiTexts?.step1?.supportTitle || ''}
                    onChange={(e) => updateUiText('step1', 'supportTitle', e.target.value)}
                    className="w-full h-9 px-3 text-xs font-bold border border-[var(--prefa-line)] rounded-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--prefa-cedar)] mb-1">Nápověda pro obec a PSČ</label>
                  <input
                    type="text"
                    value={configData.stepUiTexts?.step1?.locationHelp || ''}
                    onChange={(e) => updateUiText('step1', 'locationHelp', e.target.value)}
                    className="w-full h-9 px-3 text-xs border border-[var(--prefa-line)] rounded-sm bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-[var(--prefa-cedar)] mb-1">Úvodní text podpory Tereza</label>
                  <textarea
                    rows={2}
                    value={configData.stepUiTexts?.step1?.supportText || ''}
                    onChange={(e) => updateUiText('step1', 'supportText', e.target.value)}
                    className="w-full p-2.5 text-xs border border-[var(--prefa-line)] rounded-sm bg-white leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Step 2 Texts (Outer walls) */}
            <div className="bg-white border border-[var(--prefa-line)] p-5 rounded-sm shadow-2xs space-y-4">
              <h3 className="font-display font-bold text-sm text-[var(--prefa-ink)] uppercase tracking-wider border-b border-[var(--prefa-line)] pb-2">
                Krok 2: Vnější stěny 1. NP & Informační box
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--prefa-cedar)] mb-1">Nadpis v katalogu</label>
                    <input
                      type="text"
                      value={configData.stepUiTexts?.step2?.catalogHeading || ''}
                      onChange={(e) => updateUiText('step2', 'catalogHeading', e.target.value)}
                      className="w-full h-9 px-3 text-xs font-bold border border-[var(--prefa-line)] rounded-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--prefa-cedar)] mb-1">Nadpis informačního boxu</label>
                    <input
                      type="text"
                      value={configData.stepUiTexts?.step2?.infoBoxTitle || ''}
                      onChange={(e) => updateUiText('step2', 'infoBoxTitle', e.target.value)}
                      className="w-full h-9 px-3 text-xs font-bold border border-[var(--prefa-line)] rounded-sm bg-white"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[var(--prefa-cedar)]">
                      Informační odrážky pro vnější stěny (pod panelem):
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const bullets = [...(configData.stepUiTexts?.step2?.infoBullets || []), 'Nová informace o stěnách'];
                        updateUiText('step2', 'infoBullets', bullets);
                      }}
                      className="text-[10px] font-bold px-2 py-0.5 bg-[var(--prefa-linen)] rounded-xs cursor-pointer"
                    >
                      + Přidat odrážku
                    </button>
                  </div>
                  <div className="space-y-2">
                    {configData.stepUiTexts?.step2?.infoBullets?.map((bullet: string, bIdx: number) => (
                      <div key={bIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={bullet}
                          onChange={(e) => {
                            const bullets = [...configData.stepUiTexts.step2.infoBullets];
                            bullets[bIdx] = e.target.value;
                            updateUiText('step2', 'infoBullets', bullets);
                          }}
                          className="w-full px-3 py-1.5 text-xs border border-[var(--prefa-line)] rounded-xs bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const bullets = configData.stepUiTexts.step2.infoBullets.filter((_: any, i: number) => i !== bIdx);
                            updateUiText('step2', 'infoBullets', bullets);
                          }}
                          className="text-slate-400 hover:text-red-600 px-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CENOTVORBA & STRATEGIE ROZPOČTU */}
        {/* ========================================================================= */}
        {activeTab === 'budget' && (
          <div className="space-y-6">
            
            {/* 1. Kamionová doprava a tarify */}
            <div className="bg-white border border-[var(--prefa-line)] p-5 rounded-sm shadow-2xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--prefa-line)] pb-2">
                <h3 className="font-display font-bold text-sm text-[var(--prefa-ink)] uppercase tracking-wider flex items-center gap-2">
                  <VesperIcon name="truck" className="w-4 h-4 text-[var(--prefa-aqua)]" />
                  <span>2. Kamionová doprava (Ceník Ferdinand Šopík – Výchozí bod: centrum města Bruntál)</span>
                </h3>
                <span className="text-xs bg-[#EBF4F4] text-[#3B6365] border border-[#C5DEDF] px-2.5 py-0.5 rounded-xs font-bold">
                  Kapacita: max 25 m² panelů / 1 kamion
                </span>
              </div>

              <div className="bg-[var(--prefa-paper)] p-3 rounded-sm border border-[var(--prefa-line)] text-xs text-[var(--prefa-cedar)] flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-[var(--prefa-ink)] block">Vzorec pro výpočet dopravy:</span>
                  <span>Počet kamionů = Math.ceil(celková výměra panelů v m² / 25 m²). Celková cena = počet kamionů × sazba pásma.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Kapacita kamionu:</span>
                  <input
                    type="number"
                    value={configData.budgetRatesAndLogistics?.transport?.truckCapacityM2 || 25}
                    onChange={(e) => updateBudgetRate('transport', 'truckCapacityM2', parseInt(e.target.value) || 25)}
                    className="w-16 h-8 px-2 text-xs font-mono font-bold border border-[var(--prefa-line)] rounded-sm bg-white text-center"
                  />
                  <span className="text-xs font-bold">m²</span>
                </div>
              </div>

              {/* Table of transport distance bands */}
              <div className="border border-[var(--prefa-line)] rounded-sm overflow-hidden text-xs max-h-72 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-[var(--prefa-paper)]">
                    <tr className="text-[var(--prefa-ink)] font-display font-bold text-[10px] uppercase tracking-wider border-b border-[var(--prefa-line)]">
                      <th className="py-2.5 px-4">Vzdálenostní pásmo z výrobního závodu</th>
                      <th className="py-2.5 px-4 text-right">Cena za 1 kamion (Kč bez DPH)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--prefa-line-soft)]">
                    {configData.budgetRatesAndLogistics?.transport?.bands?.map((band: any, bIdx: number) => (
                      <tr key={bIdx} className="hover:bg-[var(--prefa-paper)]/50 transition">
                        <td className="py-2.5 px-4 font-semibold text-[var(--prefa-ink)]">
                          {band.kmFrom} – {band.kmTo} km
                        </td>
                        <td className="py-2 px-4 text-right">
                          <input
                            type="number"
                            value={band.pricePlachtaExVat}
                            onChange={(e) => {
                              const bands = [...configData.budgetRatesAndLogistics.transport.bands];
                              bands[bIdx].pricePlachtaExVat = parseInt(e.target.value) || 0;
                              setConfigData((prev: any) => ({
                                ...prev,
                                budgetRatesAndLogistics: {
                                  ...prev.budgetRatesAndLogistics,
                                  transport: { ...prev.budgetRatesAndLogistics.transport, bands }
                                }
                              }));
                            }}
                            className="w-32 px-2 py-1 text-xs text-right font-mono font-bold border border-transparent hover:border-[var(--prefa-line)] focus:border-[var(--prefa-aqua)] rounded-xs bg-transparent text-[var(--prefa-aqua)]"
                          />
                          <span className="text-xs font-semibold ml-1 text-[var(--prefa-cedar)]">Kč</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. & 4. Autojeřáb a Délka montáže */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Autojeřáb */}
              <div className="bg-white border border-[var(--prefa-line)] p-5 rounded-sm shadow-2xs space-y-4">
                <div className="border-b border-[var(--prefa-line)] pb-2">
                  <div className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--prefa-aqua)]">Položka rozpočtu 3</div>
                  <h3 className="font-display font-bold text-sm text-[var(--prefa-ink)] flex items-center gap-2">
                    <VesperIcon name="crane" className="w-4 h-4 text-[var(--prefa-aqua)]" />
                    <span>Autojeřáb & Manipulace (35 000 Kč / den)</span>
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--prefa-cedar)] mb-1">Denní sazba za autojeřáb (Kč bez DPH / den)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={configData.budgetRatesAndLogistics?.craneAndHandling?.dailyRateCzk || 35000}
                        onChange={(e) => updateBudgetRate('craneAndHandling', 'dailyRateCzk', parseInt(e.target.value) || 35000)}
                        className="w-full h-9 px-3 pr-8 text-xs font-mono font-bold border border-[var(--prefa-line)] rounded-sm bg-white text-[var(--prefa-aqua)]"
                      />
                      <span className="absolute right-2.5 top-2.5 text-[10px] text-[var(--prefa-stone)] font-bold">Kč/den</span>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--prefa-cedar)] leading-relaxed bg-[var(--prefa-paper)] p-3 rounded-sm border border-[var(--prefa-line)]">
                    💡 <strong>Pravidlo výpočtu:</strong> Délku nasazení a stání autojeřábu přesně určuje délka montáže. Cena celkem = počet dní montáže × 35 000 Kč.
                  </p>
                </div>
              </div>

              {/* 4. Délka montáže */}
              <div className="bg-white border border-[var(--prefa-line)] p-5 rounded-sm shadow-2xs space-y-4">
                <div className="border-b border-[var(--prefa-line)] pb-2">
                  <div className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--prefa-aqua)]">Položka rozpočtu 4</div>
                  <h3 className="font-display font-bold text-sm text-[var(--prefa-ink)] flex items-center gap-2">
                    <VesperIcon name="calendar" className="w-4 h-4 text-[var(--prefa-aqua)]" />
                    <span>Délka montáže (Dny dle podlahové plochy)</span>
                  </h3>
                </div>

                <div className="border border-[var(--prefa-line)] rounded-sm overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[var(--prefa-paper)] text-[var(--prefa-ink)] font-display font-bold text-[10px] uppercase tracking-wider border-b border-[var(--prefa-line)]">
                        <th className="py-2.5 px-3">Podlahová plocha stavby</th>
                        <th className="py-2.5 px-3 text-right">Počet dní montáže</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--prefa-line-soft)]">
                      {configData.budgetRatesAndLogistics?.mountingDuration?.intervals?.map((interval: any, iIdx: number) => (
                        <tr key={iIdx} className="hover:bg-[var(--prefa-paper)]/50 transition">
                          <td className="py-2 px-3 font-semibold text-[var(--prefa-ink)]">{interval.label}</td>
                          <td className="py-2 px-3 text-right">
                            <input
                              type="number"
                              value={interval.days}
                              onChange={(e) => {
                                const intervals = [...configData.budgetRatesAndLogistics.mountingDuration.intervals];
                                intervals[iIdx].days = parseInt(e.target.value) || 0;
                                setConfigData((prev: any) => ({
                                  ...prev,
                                  budgetRatesAndLogistics: {
                                    ...prev.budgetRatesAndLogistics,
                                    mountingDuration: { ...prev.budgetRatesAndLogistics.mountingDuration, intervals }
                                  }
                                }));
                              }}
                              className="w-16 px-2 py-1 text-xs text-right font-mono font-bold border border-transparent hover:border-[var(--prefa-line)] rounded-xs bg-transparent"
                            />
                            <span className="text-xs font-semibold ml-1">dní</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* 5. Zaměření ZD & Zařízení staveniště vč. lešení */}
            <div className="bg-white border border-[var(--prefa-line)] p-5 rounded-sm shadow-2xs space-y-4">
              <div className="border-b border-[var(--prefa-line)] pb-2">
                <div className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--prefa-aqua)]">Položka rozpočtu 5</div>
                <h3 className="font-display font-bold text-sm text-[var(--prefa-ink)] flex items-center gap-2">
                  <VesperIcon name="ruler" className="w-4 h-4 text-[var(--prefa-aqua)]" />
                  <span>Zaměření základové desky a zařízení staveniště včetně lešení</span>
                </h3>
              </div>

              <div className="border border-[var(--prefa-line)] rounded-sm overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[var(--prefa-paper)] text-[var(--prefa-ink)] font-display font-bold text-[10px] uppercase tracking-wider border-b border-[var(--prefa-line)]">
                      <th className="py-2.5 px-3">Podlahová plocha stavby</th>
                      <th className="py-2.5 px-3 text-right">Paušální cena (Kč bez DPH)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--prefa-line-soft)]">
                    {configData.budgetRatesAndLogistics?.sitePreparationAndScaffolding?.intervals?.map((interval: any, sIdx: number) => (
                      <tr key={sIdx} className="hover:bg-[var(--prefa-paper)]/50 transition">
                        <td className="py-2 px-3 font-semibold text-[var(--prefa-ink)]">{interval.label}</td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            value={interval.priceExVat}
                            onChange={(e) => {
                              const intervals = [...configData.budgetRatesAndLogistics.sitePreparationAndScaffolding.intervals];
                              intervals[sIdx].priceExVat = parseInt(e.target.value) || 0;
                              setConfigData((prev: any) => ({
                                ...prev,
                                budgetRatesAndLogistics: {
                                  ...prev.budgetRatesAndLogistics,
                                  sitePreparationAndScaffolding: { ...prev.budgetRatesAndLogistics.sitePreparationAndScaffolding, intervals }
                                }
                              }));
                            }}
                            className="w-32 px-2 py-1 text-xs text-right font-mono font-bold border border-transparent hover:border-[var(--prefa-line)] rounded-xs bg-transparent"
                          />
                          <span className="text-xs font-semibold ml-1">Kč</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 6., 7., 8. Procentuální položky rozpočtu */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* 6. Odborná montáž */}
              <div className="bg-white border border-[var(--prefa-line)] p-5 rounded-sm shadow-2xs space-y-3">
                <div className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--prefa-aqua)]">Položka rozpočtu 6</div>
                <h4 className="font-display font-bold text-xs text-[var(--prefa-ink)] uppercase tracking-wider border-b border-[var(--prefa-line)] pb-2 flex items-center gap-2">
                  <VesperIcon name="installation" className="w-4 h-4 text-[var(--prefa-aqua)]" />
                  <span>Odborná montáž vč. spojovacího mat.</span>
                </h4>
                <div>
                  <label className="block text-xs font-semibold text-[var(--prefa-cedar)] mb-1">Procento z celkové ceny všech panelů (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      value={configData.budgetRatesAndLogistics?.professionalAssembly?.percentageOfPanelsTotal || 14}
                      onChange={(e) => updateBudgetRate('professionalAssembly', 'percentageOfPanelsTotal', parseFloat(e.target.value) || 0)}
                      className="w-full h-9 px-3 pr-8 text-xs font-mono font-bold border border-[var(--prefa-line)] rounded-sm bg-white"
                    />
                    <span className="absolute right-2.5 top-2.5 text-[10px] text-[var(--prefa-stone)] font-bold">%</span>
                  </div>
                </div>
                <p className="text-[11px] text-[var(--prefa-cedar)] leading-relaxed">
                  Zahrnuje certifikovanou montážní četu a veškerý kotevní i spojovací materiál pro obvodové stěny, vnitřní stěny, stropy i střechu.
                </p>
              </div>

              {/* 7. Technická rezerva */}
              <div className="bg-white border border-[var(--prefa-line)] p-5 rounded-sm shadow-2xs space-y-3">
                <div className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--prefa-aqua)]">Položka rozpočtu 7</div>
                <h4 className="font-display font-bold text-xs text-[var(--prefa-ink)] uppercase tracking-wider border-b border-[var(--prefa-line)] pb-2 flex items-center gap-2">
                  <VesperIcon name="lock" className="w-4 h-4 text-[var(--prefa-aqua)]" />
                  <span>Technická rezerva</span>
                </h4>
                <div>
                  <label className="block text-xs font-semibold text-[var(--prefa-cedar)] mb-1">Základní rezerva z ceny panelů (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      value={configData.budgetRatesAndLogistics?.technicalContingency?.basePercentageOfPanels || 5}
                      onChange={(e) => updateBudgetRate('technicalContingency', 'basePercentageOfPanels', parseFloat(e.target.value) || 0)}
                      className="w-full h-9 px-3 pr-8 text-xs font-mono font-bold border border-[var(--prefa-line)] rounded-sm bg-white"
                    />
                    <span className="absolute right-2.5 top-2.5 text-[10px] text-[var(--prefa-stone)] font-bold">%</span>
                  </div>
                </div>
                <p className="text-[11px] text-[var(--prefa-cedar)] leading-relaxed">
                  Do této položky se automaticky připočítávají i specifické příplatky za požární odolnost, akustiku, nadrozměrné otvory a velkorozponové konstrukce.
                </p>
              </div>

              {/* 8. Výrobní dokumentace */}
              <div className="bg-white border border-[var(--prefa-line)] p-5 rounded-sm shadow-2xs space-y-3">
                <div className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--prefa-aqua)]">Položka rozpočtu 8</div>
                <h4 className="font-display font-bold text-xs text-[var(--prefa-ink)] uppercase tracking-wider border-b border-[var(--prefa-line)] pb-2 flex items-center gap-2">
                  <VesperIcon name="document" className="w-4 h-4 text-[var(--prefa-aqua)]" />
                  <span>Výrobní dokumentace & Koordinace</span>
                </h4>
                <div>
                  <label className="block text-xs font-semibold text-[var(--prefa-cedar)] mb-1">Procento z celkové ceny všech panelů (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      value={configData.budgetRatesAndLogistics?.productionDocumentation?.percentageOfPanelsTotal || 4.5}
                      onChange={(e) => updateBudgetRate('productionDocumentation', 'percentageOfPanelsTotal', parseFloat(e.target.value) || 0)}
                      className="w-full h-9 px-3 pr-8 text-xs font-mono font-bold border border-[var(--prefa-line)] rounded-sm bg-white"
                    />
                    <span className="absolute right-2.5 top-2.5 text-[10px] text-[var(--prefa-stone)] font-bold">%</span>
                  </div>
                </div>
                <p className="text-[11px] text-[var(--prefa-cedar)] leading-relaxed">
                  Zpracování výrobní 3D dokumentace pro CNC linky a koordinace projektové dokumentace s projektantem stavby.
                </p>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: SPRÁVA DAT & ZÁLOHY */}
        {/* ========================================================================= */}
        {activeTab === 'backups' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white border border-[var(--prefa-line)] p-6 rounded-sm shadow-2xs space-y-4">
              <h3 className="font-display font-bold text-sm text-[var(--prefa-ink)] uppercase tracking-wider border-b border-[var(--prefa-line)] pb-2">
                Záloha a Import / Export konfigurace (JSON)
              </h3>
              <p className="text-xs text-[var(--prefa-cedar)] leading-relaxed">
                Zde můžete stáhnout kompletní zálohu produktového katalogu, textů a cenových sazeb ve formátu JSON, nebo naopak nahrát aktualizovaný soubor.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="px-4 py-2.5 bg-[var(--prefa-ink)] hover:bg-[var(--prefa-ink)]/90 text-white font-display font-bold text-xs uppercase tracking-wider rounded-sm transition shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <VesperIcon name="upload" className="w-4 h-4" />
                  <span>Stáhnout zálohu (Exportovat JSON)</span>
                </button>

                <label className="px-4 py-2.5 bg-white border border-[var(--prefa-line)] hover:bg-[var(--prefa-linen)] text-[var(--prefa-ink)] font-display font-bold text-xs uppercase tracking-wider rounded-sm transition shadow-2xs flex items-center gap-2 cursor-pointer">
                  <VesperIcon name="document" className="w-4 h-4" />
                  <span>Nahrát konfiguraci (Importovat JSON)</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJson}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Live Preview Modal */}
      {previewPanelCode && (
        <PanelDetailModal
          isOpen={true}
          panelCode={previewPanelCode}
          onClose={() => setPreviewPanelCode(null)}
        />
      )}

    </div>
  );
}
