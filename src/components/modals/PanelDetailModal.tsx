'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { VesperIcon } from '@/components/ui/VesperIcon';
import { getProductByCode } from '@/lib/catalog';

interface PanelDetailModalProps {
  isOpen: boolean;
  panelCode: string | null;
  onClose: () => void;
}

export function PanelDetailModal({ isOpen, panelCode, onClose }: PanelDetailModalProps) {
  const [activeView, setActiveView] = useState<'cutaway' | 'exploded' | 'full'>('cutaway');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !panelCode || !mounted) return null;

  const product = getProductByCode(panelCode);
  if (!product) return null;

  const currentImageUrl =
    activeView === 'cutaway'
      ? product.images.assembledCutawayWebp
      : activeView === 'exploded'
      ? product.images.explodedWebp
      : product.images.fullWebp;

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] bg-[#292527]/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 select-none font-tech animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white border border-[var(--prefa-line)] rounded-sm shadow-2xl max-w-4xl w-full max-h-[88vh] flex flex-col overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-panel-title"
      >
        {/* Modal Header (Fixed at top) */}
        <div className="p-4 sm:p-5 border-b border-[var(--prefa-line)] flex items-center justify-between bg-[var(--prefa-paper)] shrink-0 font-sans">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-sm bg-[var(--prefa-ink)] text-white flex items-center justify-center shadow-xs shrink-0">
              <VesperIcon name="panel" className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-display font-bold uppercase tracking-wider text-[var(--prefa-aqua)] truncate">
                Skladba {product.code} • Obvodový panel
              </div>
              <h2 id="modal-panel-title" className="text-base sm:text-lg font-display font-bold text-[var(--prefa-ink)] tracking-tight truncate">
                {product.name}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-sm bg-white border border-[var(--prefa-line)] hover:bg-[var(--prefa-linen)] flex items-center justify-center text-[var(--prefa-stone)] hover:text-[var(--prefa-ink)] transition cursor-pointer shrink-0 ml-3"
            aria-label="Zavřít detail panelu"
          >
            <VesperIcon name="close" className="w-4 h-4 text-[var(--prefa-cedar)]" />
          </button>
        </div>

        {/* Modal Body (Scrollable content) */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 font-tech overscroll-contain">
          
          {/* Main Visual Cutaway Image View with State Switcher */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs font-display font-bold uppercase tracking-wider text-[var(--prefa-cedar)] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--prefa-aqua)]"></span>
                Fotorealistický 3D řez a rozklad skladby
              </h3>

              <div className="flex bg-[var(--prefa-paper)] p-1 rounded-sm border border-[var(--prefa-line)] text-xs font-display font-bold">
                <button
                  type="button"
                  onClick={() => setActiveView('cutaway')}
                  className={`px-3.5 py-1.5 rounded-xs transition cursor-pointer ${
                    activeView === 'cutaway' ? 'bg-[var(--prefa-ink)] text-white shadow-xs' : 'text-[var(--prefa-cedar)] hover:text-[var(--prefa-ink)] hover:bg-[var(--prefa-linen)]/60'
                  }`}
                >
                  Složený řez
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('exploded')}
                  className={`px-3.5 py-1.5 rounded-xs transition cursor-pointer ${
                    activeView === 'exploded' ? 'bg-[var(--prefa-ink)] text-white shadow-xs' : 'text-[var(--prefa-cedar)] hover:text-[var(--prefa-ink)] hover:bg-[var(--prefa-linen)]/60'
                  }`}
                >
                  Rozložený stav
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('full')}
                  className={`px-3.5 py-1.5 rounded-xs transition cursor-pointer ${
                    activeView === 'full' ? 'bg-[var(--prefa-ink)] text-white shadow-xs' : 'text-[var(--prefa-cedar)] hover:text-[var(--prefa-ink)] hover:bg-[var(--prefa-linen)]/60'
                  }`}
                >
                  Celkový pohled
                </button>
              </div>
            </div>

            <div className="relative w-full h-72 sm:h-[360px] rounded-sm overflow-hidden border border-[var(--prefa-line)] bg-[#f2ede4] flex items-center justify-center shadow-xs">
              <img
                src={currentImageUrl}
                alt={product.name}
                className="w-full h-full object-contain p-4"
              />
              <div className="absolute top-3 left-3 bg-white/95 border border-[var(--prefa-line)] backdrop-blur-md px-3 py-1 rounded-xs text-xs font-display font-bold text-[var(--prefa-ink)] shadow-xs">
                Skladba {product.code} • tl. {product.declaredThicknessMm.toString().replace('.', ',')} mm
              </div>
              <div className="absolute bottom-3 right-3 bg-[var(--prefa-ink)] text-white text-xs font-display font-bold px-4 py-1.5 rounded-xs shadow-md">
                Cena: {new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(product.unitPriceExVat)} / m²
              </div>
            </div>
          </div>

          {/* Technical Key Parameters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[var(--prefa-paper)] border border-[var(--prefa-line)] p-3.5 rounded-sm space-y-1">
              <div className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--prefa-cedar)]">Prostup tepla U</div>
              <div className="text-xs font-display font-bold text-[var(--prefa-ink)]">
                {product.technicalParameters.uValue ? `${product.technicalParameters.uValue} W/m²K` : 'Dle projektu'}
              </div>
            </div>
            <div className="bg-[var(--prefa-paper)] border border-[var(--prefa-line)] p-3.5 rounded-sm space-y-1">
              <div className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--prefa-cedar)]">Akustický útlum Rw</div>
              <div className="text-xs font-display font-bold text-[var(--prefa-ink)]">
                {product.technicalParameters.rwDb ? `${product.technicalParameters.rwDb} dB` : 'Dle projektu'}
              </div>
            </div>
            <div className="bg-[var(--prefa-paper)] border border-[var(--prefa-line)] p-3.5 rounded-sm space-y-1">
              <div className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--prefa-cedar)]">Požární odolnost</div>
              <div className="text-xs font-display font-bold text-[var(--prefa-ink)]">
                {product.technicalParameters.fireResistance || 'REI 60 / DP1'}
              </div>
            </div>
            <div className="bg-[var(--prefa-paper)] border border-[var(--prefa-line)] p-3.5 rounded-sm space-y-1">
              <div className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--prefa-cedar)]">Celková tloušťka</div>
              <div className="text-xs font-display font-bold text-[var(--prefa-ink)]">
                {product.declaredThicknessMm.toString().replace('.', ',')} mm
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-[var(--prefa-paper)] border border-[var(--prefa-line)] p-4 rounded-sm text-xs space-y-1.5">
            <div className="font-display font-bold text-xs uppercase tracking-wider text-[var(--prefa-ink)]">Popis a charakteristika panelu:</div>
            <p className="text-[var(--prefa-cedar)] leading-relaxed">{product.subtitle}</p>
          </div>

          {/* Electrical Preparation Section */}
          <div className="bg-[var(--prefa-linen)]/40 border border-[var(--prefa-line)] p-4 rounded-sm text-xs space-y-2">
            <div className="font-display font-bold text-xs text-[var(--prefa-ink)] flex items-center gap-2 uppercase tracking-wide">
              <VesperIcon name="installation" className="w-4 h-4 text-[var(--prefa-aqua)] shrink-0" />
              {product.electricalPreparation.heading}
            </div>
            <p className="text-[var(--prefa-cedar)] leading-relaxed">
              {product.electricalPreparation.description}
            </p>
            {product.electricalPreparation.includedItems.length > 0 && (
              <div className="mt-2 space-y-1 pt-1.5 border-t border-[var(--prefa-line)]/50">
                <span className="text-[11px] font-display font-bold uppercase tracking-wider text-[var(--prefa-ink)] block">
                  Součást dodávky panelu:
                </span>
                <ul className="list-disc list-inside text-[var(--prefa-cedar)] space-y-0.5">
                  {product.electricalPreparation.includedItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Detailed Layer Composition Table */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-display font-bold uppercase tracking-wider text-[var(--prefa-cedar)]">
              Přesné skladbové vrstvy panelu ({product.layers.length} vrstev od interiéru k exteriéru)
            </h4>
            <div className="border border-[var(--prefa-line)] rounded-sm overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--prefa-paper)] text-[var(--prefa-ink)] font-display font-bold text-[10px] uppercase tracking-wider border-b border-[var(--prefa-line)]">
                    <th className="py-3 px-3.5 w-10">#</th>
                    <th className="py-3 px-3.5">Název vrstvy a materiál</th>
                    <th className="py-3 px-3.5 w-28 text-right">Tloušťka</th>
                    <th className="py-3 px-4">Funkce ve skladbě</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--prefa-line-soft)] text-[var(--prefa-ink)]">
                  {product.layers.map((layer, idx) => (
                    <tr key={layer.id} className="hover:bg-[var(--prefa-paper)] transition">
                      <td className="py-2.5 px-3.5 font-display font-bold text-[var(--prefa-aqua)]">{idx + 1}.</td>
                      <td className="py-2.5 px-3.5 font-medium">
                        <div className="font-semibold text-[var(--prefa-ink)]">{layer.name}</div>
                        {!layer.additiveToTotal && (
                          <span className="text-[10px] text-[var(--prefa-stone)] italic">
                            (výplň nosného rámu – nezvyšuje celkovou tloušťku)
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-mono font-bold">
                        {layer.thicknessMm.toString().replace('.', ',')} mm
                      </td>
                      <td className="py-2.5 px-4 text-[var(--prefa-cedar)]">
                        {layer.function}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Delivery Scope Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="border border-[#C5DEDF] bg-[#EBF4F4] p-4 rounded-sm text-xs space-y-2 font-tech">
              <span className="font-display font-bold text-[#3B6365] text-xs uppercase tracking-wider block flex items-center gap-1.5">
                <VesperIcon name="check" className="w-3.5 h-3.5 text-[#3B6365] shrink-0" />
                Součástí dodávky panelu
              </span>
              <ul className="space-y-1 text-[#2D4C4E] text-[11px] font-medium leading-relaxed">
                {product.deliveryScope.included.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#3B6365] font-bold">•</span> <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border border-[#ECDCC7] bg-[#FAF4EC] p-4 rounded-sm text-xs space-y-2 font-tech">
              <span className="font-display font-bold text-[#9E6E2E] text-xs uppercase tracking-wider block flex items-center gap-1.5">
                <VesperIcon name="info" className="w-3.5 h-3.5 text-[#9E6E2E] shrink-0" />
                Zajišťuje klient na stavbě
              </span>
              <ul className="space-y-1 text-[#6F4E1D] text-[11px] font-medium leading-relaxed">
                {product.deliveryScope.clientSupplied.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#9E6E2E] font-bold">•</span> <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* Modal Footer (Fixed at bottom) */}
        <div className="p-3.5 border-t border-[var(--prefa-line)] bg-[var(--prefa-paper)] flex justify-end shrink-0 font-sans">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-sm bg-white border border-[var(--prefa-line)] hover:bg-[var(--prefa-linen)] text-[var(--prefa-cedar)] hover:text-[var(--prefa-ink)] font-semibold text-xs transition shadow-2xs cursor-pointer"
          >
            Zavřít detail
          </button>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
