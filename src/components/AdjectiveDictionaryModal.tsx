import React, { useState } from 'react';
import { JOHARI_ADJECTIVES, LEADERSHIP_COMPETENCIES } from '../data/johariAdjectives';
import { BookOpen, Search, X } from 'lucide-react';

interface AdjectiveDictionaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdjectiveDictionaryModal: React.FC<AdjectiveDictionaryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [search, setSearch] = useState('');
  const [selectedComp, setSelectedComp] = useState<string>('all');

  if (!isOpen) return null;

  const filtered = JOHARI_ADJECTIVES.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.definition.toLowerCase().includes(search.toLowerCase()) ||
      item.leadershipContext.toLowerCase().includes(search.toLowerCase()) ||
      (item.tags && item.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));
    const matchesComp = selectedComp === 'all' || item.competency === selectedComp;
    return matchesSearch && matchesComp;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 bg-[#300266] text-white flex items-center justify-between border-b border-[#46098c] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#801ED7] flex items-center justify-center text-white font-bold">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Johari Window Adjective Glossary
              </h2>
              <p className="text-xs text-[#C9C4FF]">
                55 canonical traits mapped to Leadership Competency Model (LCM) taxonomies
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-[#46098c] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 bg-[#FAFAFD] border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search glossary adjectives or tags..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-xl text-xs text-[#300266] focus:outline-none focus:ring-2 focus:ring-[#801ED7]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
            <button
              onClick={() => setSelectedComp('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedComp === 'all'
                  ? 'bg-[#300266] text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              All (55)
            </button>
            {Object.keys(LEADERSHIP_COMPETENCIES).map((c) => (
              <button
                key={c}
                onClick={() => setSelectedComp(c)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap border cursor-pointer ${
                  selectedComp === c
                    ? 'bg-[#801ED7] text-white border-[#801ED7]'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* List Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-3">
          <div className="text-xs font-bold uppercase text-gray-400 mb-2">
            Showing {filtered.length} of 55 Adjectives
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((item) => {
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-gray-200 bg-white hover:border-[#801ED7]/40 hover:shadow-2xs transition"
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <span className="font-extrabold text-[#300266] text-base">{item.name}</span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAFAFD] text-[#801ED7] border border-[#801ED7]/20"
                    >
                      {item.competency}
                    </span>
                  </div>

                  <p className="text-xs text-gray-700 font-medium mb-2 leading-relaxed">
                    {item.definition}
                  </p>

                  <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-500">
                    <span className="font-bold text-[#300266]">Leadership Impact: </span>
                    <span>{item.leadershipContext}</span>
                  </div>

                  {item.tags && item.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAFAFD] text-[#801ED7] font-medium"
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

        {/* Footer */}
        <div className="p-4 bg-[#FAFAFD] border-t border-gray-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-gray-500">
            Standard Johari Window taxonomy developed by Joseph Luft & Harrington Ingham (1955).
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#300266] hover:bg-[#801ED7] text-white font-bold text-xs transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
