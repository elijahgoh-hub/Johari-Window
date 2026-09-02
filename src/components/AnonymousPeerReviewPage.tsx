import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ShieldCheck, 
  X, 
  Check, 
  Send, 
  Lock,
  Compass,
  ArrowRight,
  BookOpen,
  LayoutGrid
} from 'lucide-react';
import { AdjectiveSelection } from '../types/johari';
import { JOHARI_ADJECTIVES } from '../data/johariAdjectives';
import { AdjectiveDictionaryView } from './AdjectiveDictionaryView';

export interface AnonymousPeerReviewPageProps {
  leaderName: string;
  leaderTitle?: string;
  onSubmit: (submission: AdjectiveSelection) => void;
}

export const AnonymousPeerReviewPage: React.FC<AnonymousPeerReviewPageProps> = ({
  leaderName,
  leaderTitle = 'Executive Leader',
  onSubmit,
}) => {
  const [selectedAdjectives, setSelectedAdjectives] = useState<string[]>([]);
  const [peerRole, setPeerRole] = useState<string>('Peer / Colleague');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  // Toggle between clean 5x11 grid vs full dictionary with categories & definitions
  const [viewMode, setViewMode] = useState<'grid' | 'dictionary'>('grid');

  const isSelectionValid = selectedAdjectives.length === 6;

  const handleToggleAdjective = (adjName: string) => {
    if (selectedAdjectives.includes(adjName)) {
      setSelectedAdjectives(selectedAdjectives.filter((a) => a !== adjName));
    } else {
      if (selectedAdjectives.length >= 6) {
        return; // strictly cap at 6
      }
      setSelectedAdjectives([...selectedAdjectives, adjName]);
    }
  };

  const handleRemoveAdjective = (adjName: string) => {
    setSelectedAdjectives(selectedAdjectives.filter((a) => a !== adjName));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAdjectives.length !== 6 || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);
    const submission: AdjectiveSelection = {
      userId: `peer-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      source: 'peer',
      peerName: 'Anonymous Reviewer',
      peerRole: peerRole as AdjectiveSelection['peerRole'],
      selectedAdjectives,
      notes: notes.trim(),
      submittedAt: Date.now(),
    };

    try {
      await onSubmit(submission);
      setIsSubmitted(true);
    } catch (err) {
      // Never show the thank-you screen on failure — the feedback was not saved
      // and the peer needs the chance to retry.
      console.error('Submission error:', err);
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Your feedback could not be submitted. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Post-submission Thank You Confirmation View
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#F4F4F4] text-[#1A1A1A] flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white rounded-3xl p-6 sm:p-10 max-w-lg w-full border border-gray-200 shadow-xl text-center space-y-5 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
            <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full uppercase tracking-wider">
              Assessment Submitted
            </span>
            <h2 className="text-2xl font-extrabold text-[#1A1A1A]">
              Thank You!
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Your 6 adjective observations have been anonymously submitted and added to <strong className="text-[#1A1A1A]">{leaderName}</strong>&rsquo;s 360° Johari Window.
            </p>
          </div>

          <div className="p-4 bg-[#F4F4F4] rounded-xl border border-gray-200 text-left space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
              Your 6 Selected Attributes:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedAdjectives.map((adj) => (
                <span
                  key={adj}
                  className="px-2.5 py-1 bg-white text-[#1A1A1A] text-xs font-bold rounded-lg border border-gray-200 shadow-2xs"
                >
                  {adj}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-2 text-xs text-gray-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Anonymous &bull; No identity stored</span>
          </div>
        </div>
      </div>
    );
  }

  // If in Glossary Mode, render the full glossary page with live selection sync
  if (viewMode === 'dictionary') {
    return (
      <div className="min-h-screen bg-[#FAFAFD] text-[#300266] pb-24 lg:pb-12 pt-4 sm:pt-6 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto mb-4 flex items-center justify-between bg-[#300266] text-white p-4 rounded-2xl border border-[#46098c]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#C9C4FF]">Evaluating:</span>
            <span className="text-sm font-extrabold text-[#FFA524]">{leaderName}</span>
          </div>

          <button
            onClick={() => setViewMode('grid')}
            className="px-4 py-2 bg-white text-[#300266] hover:bg-[#FFD4BC] rounded-xl text-xs font-extrabold transition flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <LayoutGrid className="w-4 h-4 text-[#801ED7]" />
            <span>Back to Word Grid ({selectedAdjectives.length}/6)</span>
          </button>
        </div>

        <AdjectiveDictionaryView
          onBack={() => setViewMode('grid')}
          selectedAdjectives={selectedAdjectives}
          onToggleAdjective={handleToggleAdjective}
          isSelectable={true}
          maxSelections={6}
          contextMode="peer"
          evaluatedName={leaderName}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFD] text-[#300266] pb-24 lg:pb-12 pt-4 sm:pt-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Header Banner */}
        <header className="bg-[#300266] text-white rounded-2xl p-5 sm:p-7 border border-[#46098c] shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FFA524] rounded-xl flex items-center justify-center font-bold text-[#300266] shadow-md shadow-[#FFA524]/20 shrink-0">
                <Compass className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#C9C4FF]">
                  Johari Window 360° Peer Assessment
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                  You are evaluating <span className="text-[#FFA524]">{leaderName}</span>
                </h1>
                {leaderTitle && (
                  <p className="text-xs text-[#C9C4FF] mt-0.5">{leaderTitle}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Glossary Toggle CTA for Peer Reviewer */}
              <button
                type="button"
                onClick={() => setViewMode('dictionary')}
                className="px-3.5 py-2 rounded-xl bg-[#46098c] hover:bg-[#801ED7] border border-[#801ED7]/50 text-white font-bold text-xs transition flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-[#FFA524]" />
                <span className="hidden sm:inline">Glossary & Definitions</span>
                <span className="sm:hidden">Glossary</span>
              </button>

              <div className="px-3 py-1.5 rounded-xl bg-[#24014d] border border-[#46098c] flex items-center gap-2 shrink-0">
                <Lock className="w-3.5 h-3.5 text-[#FFA4FB]" />
                <div className="text-left">
                  <div className="text-xs font-bold text-white">100% Anonymous</div>
                  <div className="text-[9px] text-[#C9C4FF]">Identity never revealed</div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#C9C4FF] leading-relaxed border-t border-[#46098c] pt-3">
            Please select <strong className="text-white">exactly 6 adjectives</strong> from the 55 traits below that best describe <span className="text-[#FFA524] font-semibold">{leaderName}</span>&rsquo;s leadership style, communication, and strengths.
          </p>
        </header>

        {/* Form: Relationship Selector */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-xs space-y-2">
          <label htmlFor="peer-relationship-dropdown" className="block text-xs font-bold uppercase tracking-wider text-[#300266]">
            1. Your Working Relationship to {leaderName} <span className="text-[#E9371F]">*</span>
          </label>
          <select
            id="peer-relationship-dropdown"
            value={peerRole}
            onChange={(e) => setPeerRole(e.target.value)}
            className="w-full sm:max-w-md px-3.5 py-2.5 bg-[#FAFAFD] border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold text-[#300266] focus:outline-none focus:ring-2 focus:ring-[#801ED7] focus:bg-white transition"
          >
            <option value="Manager">Manager / Senior Executive</option>
            <option value="Direct Report">Direct Report</option>
            <option value="Peer / Colleague">Peer / Colleague</option>
            <option value="Cross-functional Partner">Cross-functional Partner</option>
            <option value="Stakeholder / Client">Stakeholder / Client</option>
            <option value="Other">Other Professional Contact</option>
          </select>
        </div>

        {/* Selected Traits Active Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-xs space-y-2.5 sticky top-2 z-20 backdrop-blur-md bg-white/95">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#300266]">
                2. Selected Attributes
              </span>
              <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                selectedAdjectives.length === 6
                  ? 'bg-[#C9C4FF] text-[#300266] border border-[#801ED7]/30 font-bold'
                  : 'bg-[#FFD4BC] text-[#300266] border border-[#FFA524]/40 font-bold'
              }`}>
                {selectedAdjectives.length} of 6 selected
              </span>
            </div>

            {selectedAdjectives.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedAdjectives([])}
                className="text-xs text-gray-400 hover:text-red-600 font-semibold transition cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {selectedAdjectives.length === 0 ? (
            <div className="py-2.5 px-3 border border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-400 flex items-center justify-between">
              <span>Tap any 6 words in the grid below</span>
              <button
                type="button"
                onClick={() => setViewMode('dictionary')}
                className="text-[#801ED7] font-bold hover:underline text-xs flex items-center gap-1 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Read trait definitions &rarr;</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {selectedAdjectives.map((adj) => (
                <span
                  key={adj}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#300266] text-white text-xs font-bold shadow-xs animate-in zoom-in-95 duration-100"
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

        {/* 55 Adjectives 5x11 Word Grid (Clean words only) */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#300266]">
                Select 6 Adjectives (55 Canonical Johari Words)
              </h2>
              <span className="text-[11px] text-gray-400">
                Alphabetical 5 &times; 11 Layout
              </span>
            </div>

            <button
              type="button"
              onClick={() => setViewMode('dictionary')}
              className="text-xs font-bold text-[#801ED7] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Read Definitions & Categories &rarr;</span>
            </button>
          </div>

          {/* Grid Layout: 5 columns on desktop (5x11), 3 on tablet, 2 on mobile */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-2.5 pt-1">
            {JOHARI_ADJECTIVES.map((item) => {
              const isSelected = selectedAdjectives.includes(item.name);
              const isDisabled = !isSelected && selectedAdjectives.length >= 6;

              return (
                <button
                  key={item.id}
                  type="button"
                  id={`peer-trait-${item.id}`}
                  onClick={() => handleToggleAdjective(item.name)}
                  disabled={isDisabled}
                  className={`h-11 sm:h-12 px-3 rounded-xl border text-xs sm:text-sm font-bold transition flex items-center justify-between active:scale-[0.98] cursor-pointer select-none ${
                    isSelected
                      ? 'bg-[#801ED7] border-[#801ED7] text-white shadow-xs font-extrabold'
                      : isDisabled
                      ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'
                      : 'bg-[#FAFAFD] hover:bg-white hover:border-[#801ED7]/40 text-[#300266] border-gray-200 hover:shadow-2xs'
                  }`}
                >
                  <span className="truncate">{item.name}</span>
                  {isSelected ? (
                    <Check className="w-4 h-4 text-white shrink-0 stroke-[2.8]" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Qualitative Notes */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-xs space-y-4">
          <div>
            <label htmlFor="peer-notes" className="block text-xs font-bold uppercase tracking-wider text-[#300266] mb-1">
              3. Optional Note to {leaderName} (Anonymous)
            </label>
            <textarea
              id="peer-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={`Share an example of when ${leaderName} exemplified these attributes or an encouraging leadership insight...`}
              className="w-full px-3.5 py-2.5 bg-[#FAFAFD] border border-gray-200 rounded-xl text-xs sm:text-sm text-[#300266] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#801ED7] transition"
            />
          </div>

          <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-500">
              {selectedAdjectives.length === 6 ? (
                <span className="text-[#300266] font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Ready! 6 of 6 adjectives selected.</span>
                </span>
              ) : (
                <span>
                  Please select <strong>{6 - selectedAdjectives.length} more</strong> attribute{6 - selectedAdjectives.length === 1 ? '' : 's'}.
                </span>
              )}
            </div>

            <button
              type="submit"
              id="btn-submit-peer-assessment"
              disabled={selectedAdjectives.length !== 6 || isSubmitting}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#801ED7] hover:bg-[#300266] disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-xs transition shadow-md shadow-[#801ED7]/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Anonymous Assessment'}</span>
            </button>
          </div>

          {submitError && (
            <p className="text-xs font-semibold text-[#E9371F] bg-[#FFF6F0] border border-[#FFA524] rounded-xl px-4 py-3">
              {submitError} Your responses are still selected above — press submit to retry.
            </p>
          )}
        </form>
      </div>

      {/* Sticky Bottom Mobile Bar for effortless submission on phones */}
      {selectedAdjectives.length > 0 && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-xl z-30 flex items-center justify-between gap-3">
          <div className="text-xs">
            <div className="font-bold text-[#300266]">{selectedAdjectives.length} / 6 selected</div>
            <div className="text-[10px] text-gray-500">
              {selectedAdjectives.length === 6 ? 'Ready to submit' : `Pick ${6 - selectedAdjectives.length} more`}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={selectedAdjectives.length !== 6 || isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-[#801ED7] hover:bg-[#300266] disabled:opacity-40 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <span>Submit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
