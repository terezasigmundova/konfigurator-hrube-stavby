'use client';

import React, { useState } from 'react';
import { AiSuggestionItem } from '@/lib/ai/adapter';

interface AiSuggestionBarProps {
  onAcceptSuggestion: (suggestion: AiSuggestionItem) => void;
}

export function AiSuggestionBar({ onAcceptSuggestion }: AiSuggestionBarProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AiSuggestionItem[]>([]);
  const [dismissed, setDismissed] = useState(false);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageNumber: 1 }),
      });
      const data = await res.json();
      if (data.success && data.suggestions) {
        setSuggestions(data.suggestions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (dismissed) return null;

  return (
    <div className="bg-[#0f172a] border border-slate-700 rounded-xl p-4 my-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-sm">AI Asistent (Volitelný)</span>
          <span className="text-xs text-slate-400">Automatická detekce kót a linií výkresu</span>
        </div>

        {suggestions.length === 0 ? (
          <button
            type="button"
            disabled={loading}
            onClick={fetchSuggestions}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-[#0f172a] text-xs font-black rounded-lg transition disabled:opacity-50 shadow-xs cursor-pointer"
          >
            {loading ? 'Analýza výkresu...' : 'Analyzovat výkres AI'}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-xs text-slate-400 hover:text-white cursor-pointer"
          >
            Skrýt
          </button>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="mt-3 space-y-2">
          {suggestions.map((sug) => (
            <div
              key={sug.suggestionId}
              className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg flex items-center justify-between text-xs"
            >
              <div>
                <span className="text-white font-semibold">{sug.explanation}</span>
                <span className="text-slate-500 ml-2">(Jistota: {Math.round(sug.confidence * 100)}%)</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onAcceptSuggestion(sug);
                    setSuggestions((prev) => prev.filter((item) => item.suggestionId !== sug.suggestionId));
                  }}
                  className="px-3 py-1 bg-white hover:bg-slate-200 text-[#0f172a] font-black rounded text-[11px]"
                >
                  Přijmout návrh
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSuggestions((prev) => prev.filter((item) => item.suggestionId !== sug.suggestionId))
                  }
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded text-[11px]"
                >
                  Odmítnout
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
