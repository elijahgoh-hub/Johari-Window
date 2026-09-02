import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  X, 
  Check, 
  Send, 
  Copy, 
  UserCheck, 
  RotateCcw,
  MessageSquare,
  Lock,
  Share2
} from 'lucide-react';
import { AdjectiveSelection, CompetencyCategory } from '../types/johari';
import { JOHARI_ADJECTIVES, LEADERSHIP_COMPETENCIES } from '../data/johariAdjectives';

export interface PeerFeedbackViewProps {
  leaderName: string;
  leaderTitle?: string;
  peerSelections?: AdjectiveSelection[];
  onAddPeerSelection: (peer: AdjectiveSelection) => void;
  onProceedToMatrix?: () => void;
}

export const PeerFeedbackView: React.FC<PeerFeedbackViewProps> = ({
  leaderName,
  leaderTitle = 'Executive Leader',
  peerSelections = [],
  onAddPeerSelection,
  onProceedToMatrix,
}) => {
  const [selectedAdjectives, setSelectedAdjectives] = useState<string[]>([]);
  const [peerRole, setPeerRole] = useState<string>('Peer / Colleague');
  const [peerAlias, setPeerAlias] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCompetency, setSelectedCompetency] = useState<string>('all');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [linkCopied, setLinkCopied] = useState<boolean>(false);

  const isSelectionValid = selectedAdjectives.length >= 5 && selectedAdjectives.length <= 6;
  const isAtLimit = selectedAdjectives.length >= 6;

  const handleToggleAdjective = (adjName: string) => {
    if (selectedAdjectives.includes(adjName)) {
      setSelectedAdjectives(selectedAdjectives.filter((a) => a !== adjName));
    } else {
      if (selectedAdjectives.length >= 6) {
        return;
      }
      setSelectedAdjectives([...selectedAdjectives, adjName]);
    }
  };

  const handleResetForm = () => {
    setSelectedAdjectives([]);
    setNotes('');
    setPeerAlias('');
    setIsSubmitted(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSelectionValid) return;

    const newSubmission: AdjectiveSelection = {
      userId: `peer-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      source: 'peer',
      peerName: peerAlias.trim() ? peerAlias.trim() : `Anonymous (${peerRole})`,
      peerRole,
      selectedAdjectives,
      notes: notes.trim(),
      submittedAt: Date.now(),
    };

    onAddPeerSelection(newSubmission);
    setIsSubmitted(true);
  };

  const handleCopyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  const filteredAdjectives = useMemo(() => {
    return JOHARI_ADJECTIVES.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.definition.toLowerCase().includes(q) ||
        (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)));
      const matchesCompetency =
        selectedCompetency === 'all' || item.competency === selectedCompetency;
      return matchesSearch && matchesCompetency;
    });
  }, [searchQuery, selectedCompetency]);

  if (isSubmitted) {
    return (
      <div id="peer-feedback-submitted-state" className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
            <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold px-3 py-1 bg-emerald-100/80 text-emerald-800 rounded-full uppercase tracking-wider">
              Feedback Recorded Anonymously
            </span>
            <h2 className="text-2xl font-extrabold text-[#1A1A1A]">
              Thank You for Supporting {leaderName}&rsquo;s Leadership Journey
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
              Your 360° observations have been encrypted and aggregated into the Johari Window matrix. Your feedback remains completely anonymous.
            </p>
          </div>

          {/* Submitted Summary Pill Grid */}
          <div className="p-4 bg-[#F4F4F4] rounded-xl border border-gray-200 text-left space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Submitted Adjectives ({selectedAdjectives.length})
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

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              id="btn-submit-another-peer"
              onClick={handleResetForm}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold text-xs transition"
            >
              Submit Another 360° Assessment
            </button>
            {onProceedToMatrix && (
              <button
                id="btn-view-matrix-from-peer"
                onClick={onProceedToMatrix}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#FF5A1D] hover:bg-[#E04E17] text-white font-bold text-xs transition shadow-md shadow-[#FF5A1D]/20 flex items-center justify-center gap-1.5"
              >
                <span>View Johari Window Matrix</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="peer-feedback-view-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div id="peer-feedback-header-card" className="bg-[#1A1A1A] text-white rounded-2xl p-6 sm:p-7 border border-neutral-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#FF5A1D]/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FF5A1D]" />
              <span>360° Anonymous Peer Evaluation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Observe Leadership: {leaderName}
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1.5 max-w-3xl leading-relaxed">
              No account or login required. Select exactly <span className="text-white font-semibold">5 to 6 adjectives</span> that represent what you observe in {leaderName}&rsquo;s day-to-day leadership, execution, and communication.
            </p>
          </div>

          {/* Psychological Safety & Frictionless Badge */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="p-3.5 bg-neutral-900 rounded-xl border border-neutral-800 flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-lg bg-[#FF5A1D]/20 text-[#FF5A1D] flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white">100% Anonymous</div>
                <div className="text-[11px] text-gray-400">Aggregated with {peerSelections.length} other peers</div>
              </div>
            </div>

            <button
              id="btn-copy-share-invitation"
              onClick={handleCopyShareLink}
              className="px-3.5 py-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl text-xs font-bold text-white flex items-center gap-2 transition"
              title="Copy link to invite other colleagues"
            >
              {linkCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-[#FF5A1D]" />}
              <span>{linkCopied ? 'Link Copied!' : 'Share Invitation'}</span>
            </button>
          </div>
        </div>

        {/* Selection Status Bar inside Charcoal Banner */}
        <div className="mt-6 pt-5 border-t border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Your Peer Selections:
            </span>
            <span className="text-sm font-black text-white">
              <span className={isSelectionValid ? 'text-[#FF5A1D]' : 'text-white'}>
                {selectedAdjectives.length}
              </span>
              <span className="text-gray-400 font-normal"> / 6 selected</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {selectedAdjectives.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {selectedAdjectives.map((adj) => (
                  <span
                    key={adj}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#FF5A1D] text-white"
                  >
                    <span>{adj}</span>
                    <button
                      onClick={() => handleToggleAdjective(adj)}
                      className="p-0.5 hover:bg-black/20 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-gray-400 italic">Select 5 to 6 traits below to unlock submission.</span>
            )}
          </div>
        </div>
      </div>

      {/* Role and Context Card */}
      <div id="peer-context-card" className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F4F4F4] text-gray-700 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5 text-[#FF5A1D]" />
          </div>
          <div>
            <label htmlFor="peer-role-select" className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
              Your Working Relationship (For 360° Perspective Breakdown)
            </label>
            <p className="text-[11px] text-gray-500">Helps segment blind spots by stakeholder group</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            id="peer-role-select"
            value={peerRole}
            onChange={(e) => setPeerRole(e.target.value)}
            className="px-3.5 py-2 bg-[#F4F4F4] border border-gray-200 rounded-xl text-xs font-bold text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FF5A1D] transition"
          >
            <option value="Manager">Manager / Senior Executive</option>
            <option value="Direct Report">Direct Report / Team Member</option>
            <option value="Peer / Colleague">Peer / Functional Colleague</option>
            <option value="Cross-functional Partner">Cross-functional Partner</option>
            <option value="Client / External Partner">Client / External Partner</option>
            <option value="Anonymous">Prefer Not to Specify</option>
          </select>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div id="peer-selection-filters" className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="peer-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search adjectives or tags..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF5A1D] transition shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          <button
            id="peer-filter-all"
            onClick={() => setSelectedCompetency('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedCompetency === 'all'
                ? 'bg-[#1A1A1A] text-white'
                : 'bg-white text-gray-600 hover:text-[#1A1A1A] border border-gray-200'
            }`}
          >
            All (55)
          </button>
          {Object.keys(LEADERSHIP_COMPETENCIES).map((cat) => {
            const comp = LEADERSHIP_COMPETENCIES[cat as CompetencyCategory];
            const isSelected = selectedCompetency === cat;
            return (
              <button
                key={cat}
                id={`peer-filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setSelectedCompetency(cat)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap border ${
                  isSelected
                    ? 'bg-[#FF5A1D] text-white border-[#FF5A1D] shadow-2xs'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
                }`}
              >
                {comp.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Adjective Card Grid */}
      <div 
        id="peer-adjective-cards-grid" 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5"
      >
        {filteredAdjectives.map((item) => {
          const isSelected = selectedAdjectives.includes(item.name);
          const isDisabled = !isSelected && isAtLimit;

          return (
            <div
              key={item.id}
              id={`peer-card-adjective-${item.name.toLowerCase()}`}
              onClick={() => !isDisabled && handleToggleAdjective(item.name)}
              className={`p-4 rounded-xl border transition-all duration-150 flex flex-col justify-between select-none ${
                isSelected
                  ? 'bg-white border-[#FF5A1D] ring-2 ring-[#FF5A1D]/20 shadow-md cursor-pointer'
                  : isDisabled
                  ? 'bg-gray-50/60 border-gray-200 opacity-50 cursor-not-allowed'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm cursor-pointer'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className={`font-bold text-base ${isSelected ? 'text-[#FF5A1D]' : 'text-[#1A1A1A]'}`}>
                    {item.name}
                  </span>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition shrink-0 ${
                      isSelected
                        ? 'bg-[#FF5A1D] border-[#FF5A1D] text-white'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>

                <div className="mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F4F4F4] text-gray-600 border border-gray-200">
                    {item.competency}
                  </span>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed font-normal">
                  {item.definition}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                <span>#{item.tags[0]}</span>
                <span className="text-[10px] text-gray-500 font-medium">
                  {isSelected ? 'Selected' : 'Click to select'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Peer Feedback Submission Form */}
      <form onSubmit={handleSubmit} id="peer-feedback-submit-form" className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
        <div>
          <label htmlFor="peer-qualitative-notes" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Qualitative Observations (Optional & Anonymous)
          </label>
          <textarea
            id="peer-qualitative-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={`Share an example of when ${leaderName} exemplified these traits or a supportive suggestion...`}
            className="w-full px-3.5 py-2.5 bg-[#F4F4F4] border border-gray-200 rounded-xl text-xs sm:text-sm text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF5A1D] transition"
          />
        </div>

        <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-gray-500">
            {isSelectionValid ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Ready to submit ({selectedAdjectives.length} of 6 traits selected)</span>
              </span>
            ) : (
              <span>Pick at least 5 traits (current: {selectedAdjectives.length}/6) to unlock submission.</span>
            )}
          </div>

          <button
            type="submit"
            id="btn-submit-peer-feedback"
            disabled={!isSelectionValid}
            className="w-full sm:w-auto px-7 py-2.5 rounded-xl bg-[#FF5A1D] hover:bg-[#E04E17] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs transition shadow-md shadow-[#FF5A1D]/20 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Submit Anonymous 360° Feedback</span>
          </button>
        </div>
      </form>
    </div>
  );
};
