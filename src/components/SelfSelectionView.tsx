import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  X, 
  ArrowRight, 
  Check, 
  BookOpen
} from 'lucide-react';
import { AdjectiveSelection } from '../types/johari';
import { JOHARI_ADJECTIVES } from '../data/johariAdjectives';

export interface SelfSelectionViewProps {
  leaderName: string;
  selfSelection: AdjectiveSelection;
  onUpdateSelfSelection: (selection: AdjectiveSelection) => void;
  onProceedToMatrix: () => void;
  onProceedToPeers?: () => void;
  onOpenDictionary?: () => void;
}

export const SelfSelectionView: React.FC<SelfSelectionViewProps> = ({
  leaderName,
  selfSelection,
  onUpdateSelfSelection,
  onProceedToMatrix,
  onProceedToPeers,
  onOpenDictionary,
}) => {
  const [notes, setNotes] = useState(selfSelection.notes || '');

  const selectedList = useMemo(
    () => selfSelection.selectedAdjectives || [],
    [selfSelection.selectedAdjectives]
  );

  const isSelectionValid = selectedList.length === 6;

  const handleToggleAdjective = (adjName: string) => {
    let updated: string[];
    if (selectedList.includes(adjName)) {
      updated = selectedList.filter((item) => item !== adjName);
    } else {
      if (selectedList.length >= 6) {
        return; // Prevent picking more than 6
      }
      updated = [...selectedList, adjName];
    }

    onUpdateSelfSelection({
      ...selfSelection,
      selectedAdjectives: updated,
      notes,
    });
  };

  const handleRemoveAdjective = (adjName: string) => {
    const updated = selectedList.filter((item) => item !== adjName);
    onUpdateSelfSelection({
      ...selfSelection,
      selectedAdjectives: updated,
      notes,
    });
  };

  const handleClearAll = () => {
    onUpdateSelfSelection({
      ...selfSelection,
      selectedAdjectives: [],
      notes,
    });
  };

  return (
    <div id="self-selection-view-container" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-24 lg:pb-12">
      {/* Header Banner */}
      <div id="self-selection-header-card" className="bg-white rounded-2xl p-5 sm:p-7 border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#FFD4BC] text-[#300266] text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#E9371F]" />
              <span>Step 1 &bull; Self-Assessment</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#300266] tracking-tight">
              Select 6 Adjectives that Describe You
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl leading-relaxed">
              Evaluating <span className="font-semibold text-[#300266]">{leaderName}</span>. Choose 6 canonical attributes that best reflect your leadership style and core strengths.
            </p>
          </div>

          {/* Interactive Badge Counter & Glossary Shortcut */}
          <div className="flex items-center gap-3">
            {onOpenDictionary && (
              <button
                type="button"
                onClick={onOpenDictionary}
                className="px-3.5 py-3 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 hover:text-[#300266] transition flex items-center gap-2 shadow-2xs cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-[#FFA524]" />
                <span className="hidden sm:inline">View Glossary & Definitions</span>
                <span className="sm:hidden">Glossary</span>
              </button>
            )}

            <div 
              id="self-selection-counter-badge" 
              className="flex items-center gap-3.5 bg-[#FAFAFD] border border-gray-200 rounded-xl p-3.5 shrink-0 transition"
            >
              <div className="text-right">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Self-Selection
                </div>
                <div className="text-xl sm:text-2xl font-black tracking-tight text-[#300266]">
                  <span className={isSelectionValid ? 'text-[#FFA524]' : 'text-[#300266]'}>
                    {selectedList.length}
                  </span>
                  <span className="text-gray-400 text-sm font-normal"> / 6 selected</span>
                </div>
              </div>

              <div 
                className={`w-10 h-10 rounded-xl flex items-center justify-center border transition shadow-2xs ${
                  isSelectionValid
                    ? 'bg-[#FFA524] text-[#300266] border-[#FFA524]'
                    : 'bg-white text-gray-400 border-gray-300'
                }`}
              >
                {isSelectionValid ? (
                  <Check className="w-5 h-5 stroke-[3]" />
                ) : (
                  <span className="text-xs font-bold">{6 - selectedList.length}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Active Selection Pill Bar */}
        <div id="self-selection-pill-bar" className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Your 6 Selected Traits ({selectedList.length}/6)
            </span>

            {selectedList.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-gray-400 hover:text-red-600 font-semibold transition cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>

          {selectedList.length === 0 ? (
            <div className="py-2.5 px-3 border border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-400">
              Tap any 6 words in the 5x11 grid below, or toggle to the Glossary view to read definitions
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {selectedList.map((adj) => (
                <span
                  key={adj}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#300266] text-white text-xs font-bold shadow-xs animate-in zoom-in-95 duration-100"
                >
                  <span>{adj}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAdjective(adj)}
                    className="hover:bg-[#46098c] rounded p-0.5 transition cursor-pointer"
                    aria-label={`Remove ${adj}`}
                  >
                    <X className="w-3.5 h-3.5 text-[#FFA4FB]" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 55 Adjectives 5x11 Grid (Words Only) */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#300266]">
              55 Canonical Johari Adjectives
            </h2>
            <span className="text-[11px] text-gray-400">
              Alphabetical 5 columns &times; 11 rows layout
            </span>
          </div>

          {onOpenDictionary && (
            <button
              type="button"
              onClick={onOpenDictionary}
              className="text-xs font-bold text-[#801ED7] hover:text-[#300266] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Read Definitions & Categories &rarr;</span>
            </button>
          )}
        </div>

        {/* 5x11 Word Grid on Desktop, 3 on tablet, 2 on mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-2.5 pt-1">
          {JOHARI_ADJECTIVES.map((item) => {
            const isSelected = selectedList.includes(item.name);
            const isDisabled = !isSelected && selectedList.length >= 6;

            return (
              <button
                key={item.id}
                type="button"
                id={`self-trait-${item.id}`}
                onClick={() => handleToggleAdjective(item.name)}
                disabled={isDisabled}
                className={`h-11 sm:h-12 px-3 rounded-xl border text-xs sm:text-sm font-bold transition flex items-center justify-between active:scale-[0.98] cursor-pointer select-none ${
                  isSelected
                    ? 'bg-[#FFA524] border-[#FFA524] text-[#300266] shadow-xs font-extrabold'
                    : isDisabled
                    ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'
                    : 'bg-[#FAFAFD] hover:bg-white hover:border-[#801ED7]/40 text-[#300266] border-gray-200 hover:shadow-2xs'
                }`}
              >
                <span className="truncate">{item.name}</span>
                {isSelected ? (
                  <Check className="w-4 h-4 text-[#300266] shrink-0 stroke-[2.8]" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-gray-500">
          {selectedList.length === 6 ? (
            <span className="text-[#300266] font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Ready! Exactly 6 of 6 adjectives selected.</span>
            </span>
          ) : (
            <span>
              Please select <strong>{6 - selectedList.length} more</strong> attribute{6 - selectedList.length === 1 ? '' : 's'} to proceed.
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            id="btn-save-self-proceed"
            onClick={onProceedToMatrix}
            disabled={selectedList.length !== 6}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#FFA524] hover:bg-[#E9371F] disabled:opacity-40 disabled:cursor-not-allowed text-[#300266] hover:text-white font-extrabold text-xs transition shadow-md shadow-[#FFA524]/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>View My Johari Window</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sticky Bottom Mobile Bar */}
      {selectedList.length > 0 && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-xl z-30 flex items-center justify-between gap-3">
          <div className="text-xs">
            <div className="font-bold text-[#300266]">{selectedList.length} / 6 selected</div>
            <div className="text-[10px] text-gray-500">
              {selectedList.length === 6 ? 'Ready to view matrix' : `Select ${6 - selectedList.length} more`}
            </div>
          </div>

          <button
            type="button"
            onClick={onProceedToMatrix}
            disabled={selectedList.length !== 6}
            className="px-5 py-2.5 rounded-xl bg-[#FFA524] hover:bg-[#E9371F] disabled:opacity-40 text-[#300266] hover:text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <span>View Matrix</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
