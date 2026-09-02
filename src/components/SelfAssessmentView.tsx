import React, { useState } from 'react';
import { AdjectiveSelection, CompetencyCategory, JohariAdjective } from '../types/johari';
import { JOHARI_ADJECTIVES, LEADERSHIP_COMPETENCIES } from '../data/johariAdjectives';
import { Search, CheckCircle2, Info, Sparkles, Filter, X, ArrowRight } from 'lucide-react';

interface SelfAssessmentViewProps {
  leaderName: string;
  selfSelection: AdjectiveSelection;
  onUpdateSelfSelection: (selection: AdjectiveSelection) => void;
  onProceedToMatrix: () => void;
}

export const SelfAssessmentView: React.FC<SelfAssessmentViewProps> = ({
  leaderName,
  selfSelection,
  onUpdateSelfSelection,
  onProceedToMatrix,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompetency, setSelectedCompetency] = useState<string>('all');
  const [notes, setNotes] = useState(selfSelection.notes || '');

  const selectedList = selfSelection.selectedAdjectives || [];

  const handleToggleAdjective = (adjName: string) => {
    let updated: string[];
    if (selectedList.includes(adjName)) {
      updated = selectedList.filter((item) => item !== adjName);
    } else {
      if (selectedList.length >= 6) {
        // Replace or cap at 6
        return;
      }
      updated = [...selectedList, adjName];
    }

    onUpdateSelfSelection({
      ...selfSelection,
      selectedAdjectives: updated,
      notes,
    });
  };

  const handleNotesChange = (val: string) => {
    setNotes(val);
    onUpdateSelfSelection({
      ...selfSelection,
      notes: val,
    });
  };

  const filteredAdjectives = JOHARI_ADJECTIVES.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tags && item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesCompetency =
      selectedCompetency === 'all' || item.competency === selectedCompetency;
    return matchesSearch && matchesCompetency;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#FF5A1D]/10 text-[#FF5A1D] text-xs font-bold uppercase tracking-widest mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step 1: Leader Self-Perception</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
              Select 5–6 Adjectives That Describe Your Leadership
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1.5 max-w-3xl leading-relaxed">
              Choose the core attributes you believe define your leadership presence, operating style, and decision-making values. These choices form the baseline of your <span className="font-semibold text-[#1A1A1A]">Johari Window (Self-Known)</span>.
            </p>
          </div>

          {/* Counter Status Card */}
          <div className="flex items-center gap-4 bg-[#F4F4F4] border border-gray-200 rounded-xl p-4 shrink-0">
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase text-gray-500">Selected Traits</div>
              <div className="text-2xl font-black text-[#1A1A1A]">
                <span className={selectedList.length >= 5 ? 'text-[#FF5A1D]' : 'text-[#1A1A1A]'}>
                  {selectedList.length}
                </span>
                <span className="text-gray-400 text-lg font-medium"> / 6</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-xs">
              {selectedList.length >= 5 ? (
                <CheckCircle2 className="w-6 h-6 text-[#FF5A1D]" />
              ) : (
                <span className="text-xs font-bold text-gray-400">{6 - selectedList.length} left</span>
              )}
            </div>
          </div>
        </div>

        {/* Selected Badges Bar */}
        <div className="mt-6 pt-5 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Active Self-Image Selection ({selectedList.length})
            </span>
            {selectedList.length > 0 && (
              <button
                onClick={() =>
                  onUpdateSelfSelection({
                    ...selfSelection,
                    selectedAdjectives: [],
                  })
                }
                className="text-xs text-gray-500 hover:text-red-600 transition"
              >
                Clear all
              </button>
            )}
          </div>

          {selectedList.length === 0 ? (
            <div className="text-xs text-gray-400 italic py-2">
              No adjectives selected yet. Click any trait below from the 55 canonical Johari options.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedList.map((adj) => {
                return (
                  <span
                    key={adj}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#FF5A1D] text-white shadow-sm transition"
                  >
                    <span>{adj}</span>
                    <button
                      onClick={() => handleToggleAdjective(adj)}
                      className="p-0.5 rounded-full hover:bg-black/10 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Search & Competency Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="self-adjective-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 55 adjectives or competencies..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF5A1D] focus:border-transparent transition shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Competency Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCompetency('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              selectedCompetency === 'all'
                ? 'bg-[#1A1A1A] text-white'
                : 'bg-white text-gray-600 hover:text-[#1A1A1A] border border-gray-200'
            }`}
          >
            All 55 Traits
          </button>
          {Object.keys(LEADERSHIP_COMPETENCIES).map((cat) => {
            const comp = LEADERSHIP_COMPETENCIES[cat as CompetencyCategory];
            const isSelected = selectedCompetency === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCompetency(cat)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap border ${
                  isSelected
                    ? 'bg-[#FF5A1D] text-white border-[#FF5A1D] shadow-xs'
                    : 'bg-white text-gray-700 hover:border-gray-400 border-gray-200'
                }`}
              >
                {comp.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of 55 Adjectives */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {filteredAdjectives.map((item) => {
          const isSelected = selectedList.includes(item.name);
          const isMaxReached = selectedList.length >= 6 && !isSelected;

          return (
            <button
              key={item.id}
              id={`adj-card-${item.id}`}
              onClick={() => handleToggleAdjective(item.name)}
              disabled={isMaxReached}
              className={`text-left p-4 rounded-2xl border transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-white border-[#FF5A1D] border-l-4 border-l-[#FF5A1D] shadow-sm'
                  : isMaxReached
                  ? 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                  : 'bg-white border-gray-200 hover:border-gray-400 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-1.5">
                  <span className="font-bold text-[#1A1A1A] text-sm">{item.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                    {item.competency}
                  </span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 mb-2 leading-relaxed">
                  {item.definition}
                </p>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                <span className="text-gray-400 font-medium truncate max-w-[170px]">
                  {item.leadershipContext}
                </span>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ml-2 transition ${
                    isSelected
                      ? 'bg-[#FF5A1D] text-white font-bold text-xs'
                      : 'border border-gray-300 text-transparent'
                  }`}
                >
                  ✓
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Self-Reflection Context & Next Steps */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="w-full md:w-2/3">
          <label
            htmlFor="self-notes"
            className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1"
          >
            Optional Leadership Intent / Reflection
          </label>
          <input
            id="self-notes"
            type="text"
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="e.g. In my current executive mandate, I am leaning into long-range strategy and talent mentorship."
            className="w-full px-3.5 py-2.5 bg-[#F4F4F4] border border-gray-200 rounded-xl text-xs sm:text-sm text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF5A1D]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            id="proceed-matrix-btn"
            onClick={onProceedToMatrix}
            className="w-full md:w-auto px-6 py-3 rounded-xl bg-[#FF5A1D] hover:bg-[#E04E17] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#FF5A1D]/20 transition flex items-center justify-center gap-2"
          >
            <span>View 4-Quadrant Matrix</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
