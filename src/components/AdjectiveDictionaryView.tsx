import React, { useState } from 'react';
import { JOHARI_ADJECTIVES, LEADERSHIP_COMPETENCIES } from '../data/johariAdjectives';
import { CompetencyCategory } from '../types/johari';
import { 
  BookOpen, 
  Search, 
  Tag, 
  ArrowLeft, 
  Check, 
  Plus, 
  Sparkles, 
  Info,
  Filter,
  Eye,
  Layers
} from 'lucide-react';

export interface AdjectiveDictionaryViewProps {
  onBack?: () => void;
  // Optional selection integration if used inside evaluation flows
  selectedAdjectives?: string[];
  onToggleAdjective?: (name: string) => void;
  maxSelections?: number;
  isSelectable?: boolean;
  contextMode?: 'leader' | 'peer' | 'general';
  evaluatedName?: string;
}

export const AdjectiveDictionaryView: React.FC<AdjectiveDictionaryViewProps> = ({
  onBack,
  selectedAdjectives = [],
  onToggleAdjective,
  maxSelections = 6,
  isSelectable = false,
  contextMode = 'general',
  evaluatedName,
}) => {
  const [search, setSearch] = useState('');
  const [selectedComp, setSelectedComp] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'cards' | 'by-category'>('cards');

  const filtered = JOHARI_ADJECTIVES.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.definition.toLowerCase().includes(search.toLowerCase()) ||
      item.leadershipContext.toLowerCase().includes(search.toLowerCase()) ||
      (item.tags && item.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));
    const matchesComp = selectedComp === 'all' || item.competency === selectedComp;
    return matchesSearch && matchesComp;
  });

  const categories = Object.keys(LEADERSHIP_COMPETENCIES) as CompetencyCategory[];

  return (
    <div id="adjective-dictionary-view-container" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-24 lg:pb-12">
      {/* Header Banner */}
      <header className="bg-white rounded-2xl p-5 sm:p-7 border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#300266] transition mr-1 cursor-pointer"
                  title="Return to previous view"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFD4BC] text-[#300266] text-xs font-bold uppercase tracking-wider border border-[#FFA524]/40">
                <BookOpen className="w-3.5 h-3.5 text-[#801ED7]" />
                <span>Johari Adjective Glossary Reference</span>
              </div>
            </div>
            
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#300266] tracking-tight">
              Johari Adjective Glossary & Leadership Taxonomies
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 max-w-3xl leading-relaxed">
              Explore the full definitions, leadership behavioral contexts, and 6 competency domain classifications for all 55 canonical traits developed by Joseph Luft & Harrington Ingham (1955).
            </p>
          </div>

          {/* Interactive selection badge if embedded in selection flow */}
          {isSelectable && (
            <div className="bg-[#FAFAFD] border border-gray-200 rounded-xl p-3.5 flex items-center gap-3 shrink-0">
              <div className="text-right">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  {contextMode === 'peer' ? 'Peer Selections' : 'Self Selections'}
                </div>
                <div className="text-xl font-black text-[#300266]">
                  <span className={selectedAdjectives.length === maxSelections ? 'text-emerald-600' : 'text-[#801ED7]'}>
                    {selectedAdjectives.length}
                  </span>
                  <span className="text-gray-400 text-sm font-normal"> / {maxSelections}</span>
                </div>
              </div>
              {onBack && (
                <button
                  onClick={onBack}
                  className="px-3.5 py-2 bg-[#300266] text-white hover:bg-[#801ED7] rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  Return to Grid
                </button>
              )}
            </div>
          )}
        </div>

        {/* View Toggle Bar & Search */}
        <div className="pt-3 border-t border-gray-100 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search adjectives, definitions, tags..."
              className="w-full pl-9 pr-4 py-2 bg-[#FAFAFD] border border-gray-200 rounded-xl text-xs text-[#300266] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#801ED7] transition"
            />
            {search && (
              <button 
                onClick={() => setSearch('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#300266] text-xs font-bold cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center bg-[#FAFAFD] border border-gray-200 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setActiveTab('cards')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeTab === 'cards'
                    ? 'bg-[#300266] text-white shadow-xs'
                    : 'text-gray-600 hover:text-[#300266]'
                }`}
              >
                All Cards ({filtered.length})
              </button>
              <button
                onClick={() => setActiveTab('by-category')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeTab === 'by-category'
                    ? 'bg-[#300266] text-white shadow-xs'
                    : 'text-gray-600 hover:text-[#300266]'
                }`}
              >
                By Competency Domain (6)
              </button>
            </div>
          </div>
        </div>

        {/* Competency Filter Chips */}
        {activeTab === 'cards' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
            <button
              onClick={() => setSelectedComp('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedComp === 'all'
                  ? 'bg-[#300266] text-white shadow-xs'
                  : 'bg-[#FAFAFD] text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              All Categories (55)
            </button>
            {categories.map((c) => {
              const count = JOHARI_ADJECTIVES.filter((a) => a.competency === c).length;
              return (
                <button
                  key={c}
                  onClick={() => setSelectedComp(c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap border cursor-pointer ${
                    selectedComp === c
                      ? 'bg-[#801ED7] text-white border-[#801ED7] shadow-xs'
                      : 'bg-white text-gray-700 hover:bg-[#FAFAFD] border-gray-200'
                  }`}
                >
                  <span>{c}</span>
                  <span className="ml-1.5 opacity-70 text-[10px]">({count})</span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      {activeTab === 'cards' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-500 px-1">
            <span>Showing {filtered.length} of 55 Adjectives</span>
            {isSelectable && (
              <span>Click card to {selectedAdjectives.length >= maxSelections ? 'deselect' : 'select trait'}</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => {
              const comp = LEADERSHIP_COMPETENCIES[item.competency];
              const isSelected = selectedAdjectives.includes(item.name);
              const isLimitReached = selectedAdjectives.length >= maxSelections && !isSelected;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (isSelectable && onToggleAdjective) {
                      onToggleAdjective(item.name);
                    }
                  }}
                  className={`p-5 rounded-2xl border transition relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#300266] text-white border-[#801ED7] shadow-md ring-2 ring-[#FFA524]'
                      : 'bg-white text-[#300266] border-gray-200 hover:border-[#801ED7]/40 hover:shadow-xs'
                  } ${isSelectable ? 'cursor-pointer' : ''} ${
                    isLimitReached && isSelectable ? 'opacity-60 hover:opacity-100' : ''
                  }`}
                >
                  <div>
                    {/* Card Top Row */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-black tracking-tight ${isSelected ? 'text-white' : 'text-[#300266]'}`}>
                          {item.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isSelected
                              ? 'bg-[#46098c] text-[#C9C4FF] border-[#801ED7]'
                              : 'bg-[#FAFAFD] text-[#801ED7] border-[#801ED7]/30'
                          }`}
                        >
                          {item.competency}
                        </span>

                        {isSelectable && (
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center transition shrink-0 ${
                              isSelected
                                ? 'bg-[#FFA524] text-[#300266]'
                                : 'bg-[#FAFAFD] text-gray-400 group-hover:text-[#300266]'
                            }`}
                          >
                            {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3.5 h-3.5" />}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Definition */}
                    <p className={`text-xs leading-relaxed font-medium mb-3 ${isSelected ? 'text-[#C9C4FF]' : 'text-gray-700'}`}>
                      {item.definition}
                    </p>

                    {/* Leadership Context */}
                    <div className={`p-3 rounded-xl text-xs space-y-1 mb-3 ${
                      isSelected ? 'bg-[#200144] border border-[#46098c] text-[#E5E2FA]' : 'bg-[#FAFAFD] border border-gray-100 text-gray-600'
                    }`}>
                      <div className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-[#FFA524]' : 'text-[#801ED7]'}`}>
                        Executive Leadership Impact:
                      </div>
                      <p className="leading-snug">
                        {item.leadershipContext}
                      </p>
                    </div>
                  </div>

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-100/10">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                            isSelected
                              ? 'bg-[#46098c] text-[#C9C4FF]'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Categorized by 6 Leadership Competency Domains */
        <div className="space-y-8">
          {categories.map((catName) => {
            const comp = LEADERSHIP_COMPETENCIES[catName];
            const traits = JOHARI_ADJECTIVES.filter((a) => a.competency === catName);

            return (
              <div
                key={catName}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4"
              >
                {/* Domain Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border bg-[#FFD4BC] text-[#300266] border-[#FFA524]/40">
                        Domain
                      </span>
                      <h2 className="text-xl font-extrabold text-[#300266]">
                        {comp.name}
                      </h2>
                      <span className="text-xs font-bold text-gray-400">
                        ({traits.length} canonical traits)
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {comp.description}
                    </p>
                  </div>
                </div>

                {/* Grid of Traits in this Domain */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {traits.map((item) => {
                    const isSelected = selectedAdjectives.includes(item.name);

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (isSelectable && onToggleAdjective) {
                            onToggleAdjective(item.name);
                          }
                        }}
                        className={`p-4 rounded-xl border transition ${
                          isSelected
                            ? 'bg-[#300266] text-white border-[#801ED7] ring-2 ring-[#FFA524]'
                            : 'bg-[#FAFAFD] text-[#300266] border-gray-200 hover:border-[#801ED7]/30'
                        } ${isSelectable ? 'cursor-pointer' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-extrabold text-sm">{item.name}</span>
                          {isSelectable && (
                            <div
                              className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                                isSelected ? 'bg-[#FFA524] text-[#300266]' : 'bg-white text-gray-400 border border-gray-300'
                              }`}
                            >
                              {isSelected ? '✓' : '+'}
                            </div>
                          )}
                        </div>
                        <p className={`text-xs leading-relaxed mb-2 ${isSelected ? 'text-[#C9C4FF]' : 'text-gray-700'}`}>
                          {item.definition}
                        </p>
                        <div className={`text-[11px] leading-snug pt-2 border-t ${
                          isSelected ? 'border-[#46098c] text-[#E5E2FA]' : 'border-gray-200 text-gray-500'
                        }`}>
                          <strong className={isSelected ? 'text-[#FFA524]' : 'text-[#300266]'}>Impact: </strong>
                          {item.leadershipContext}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
