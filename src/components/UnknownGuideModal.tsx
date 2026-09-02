import React from 'react';
import { X, Sparkles, Compass, Lightbulb, Shield, Target, BookOpen } from 'lucide-react';
import { UNKNOWN_QUADRANT_CONTEXT_GUIDE } from '../utils/johariCalculator';

interface UnknownGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UnknownGuideModal: React.FC<UnknownGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const guide = UNKNOWN_QUADRANT_CONTEXT_GUIDE;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'undiscovered_potential':
        return <Sparkles className="w-5 h-5 text-[#FF5A1D]" />;
      case 'dormant_contextual':
        return <Shield className="w-5 h-5 text-indigo-600" />;
      case 'role_boundary':
        return <Compass className="w-5 h-5 text-amber-600" />;
      case 'growth_frontier':
        return <Target className="w-5 h-5 text-emerald-600" />;
      default:
        return <Lightbulb className="w-5 h-5 text-[#FF5A1D]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 bg-[#1A1A1A] text-white flex items-center justify-between border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF5A1D] flex items-center justify-center text-white font-bold shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{guide.title}</h2>
                <span className="text-[10px] px-2 py-0.5 bg-white/10 text-orange-300 rounded font-bold uppercase tracking-wider">
                  Quadrant 4
                </span>
              </div>
              <p className="text-xs text-gray-400">{guide.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 max-h-[calc(90vh-140px)]">
          {/* Executive Reframe Callout */}
          <div className="p-4 bg-[#FFF5F1] rounded-xl border border-[#FF5A1D]/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF5A1D]">
              <Sparkles className="w-4 h-4" />
              <span>Core Psychological Principle</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-medium">
              {guide.reframeConcept}
            </p>
          </div>

          {/* 4 Core Perspectives */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Four Interpretive Lenses for Unselected Traits
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {guide.perspectives.map((persp, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#F4F4F4] border border-gray-200 hover:border-gray-300 transition space-y-2.5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {getCategoryIcon(persp.category)}
                      <h4 className="font-bold text-sm text-[#1A1A1A]">{persp.heading}</h4>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{persp.description}</p>
                  </div>

                  <div className="pt-2.5 border-t border-gray-200/80 text-[11px] text-gray-700 bg-white/60 p-2.5 rounded-lg">
                    <span className="font-bold text-[#1A1A1A]">Executive Action: </span>
                    <span>{persp.actionableAdvice}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reflection Prompts */}
          <div className="p-5 bg-white rounded-xl border border-gray-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
              <BookOpen className="w-4 h-4 text-[#FF5A1D]" />
              <span>Leadership Coaching Reflection Prompts</span>
            </div>
            <ul className="space-y-2 text-xs text-gray-700">
              {guide.reflectionPrompts.map((prompt, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{prompt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Summary Box */}
          <div className="p-4 bg-[#1A1A1A] text-gray-300 rounded-xl text-xs leading-relaxed">
            <span className="text-white font-bold block mb-1">Takeaway for Executives:</span>
            {guide.executiveSummary}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F4F4F4] border-t border-gray-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-gray-500">
            Johari Window Developmental Framework (Luft & Ingham, 1955)
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#1A1A1A] hover:bg-neutral-800 text-white font-bold text-xs transition"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
