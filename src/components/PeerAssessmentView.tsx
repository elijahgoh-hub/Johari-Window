import React, { useState } from 'react';
import { AdjectiveSelection, CompetencyCategory } from '../types/johari';
import { JOHARI_ADJECTIVES, LEADERSHIP_COMPETENCIES } from '../data/johariAdjectives';
import { 
  Users, 
  Plus, 
  Trash2, 
  UserPlus, 
  Sparkles, 
  CheckCircle, 
  MessageSquareQuote, 
  ShieldCheck,
  Search,
  X,
  Shuffle
} from 'lucide-react';

interface PeerAssessmentViewProps {
  leaderName: string;
  peerSelections: AdjectiveSelection[];
  onAddPeerSelection: (peer: AdjectiveSelection) => void;
  onDeletePeerSelection: (userId: string) => void;
  onClearAllPeers: () => void;
  onGenerateSimulatedPeers: () => void;
}

export const PeerAssessmentView: React.FC<PeerAssessmentViewProps> = ({
  leaderName,
  peerSelections,
  onAddPeerSelection,
  onDeletePeerSelection,
  onClearAllPeers,
  onGenerateSimulatedPeers,
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newPeerName, setNewPeerName] = useState('');
  const [newPeerRole, setNewPeerRole] = useState<AdjectiveSelection['peerRole']>('Peer / Colleague');
  const [selectedAdjectives, setSelectedAdjectives] = useState<string[]>([]);
  const [peerNote, setPeerNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompetency, setSelectedCompetency] = useState<string>('all');

  const handleToggleAdjective = (name: string) => {
    if (selectedAdjectives.includes(name)) {
      setSelectedAdjectives(selectedAdjectives.filter((item) => item !== name));
    } else {
      if (selectedAdjectives.length >= 6) return;
      setSelectedAdjectives([...selectedAdjectives, name]);
    }
  };

  const handleSavePeer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPeerName.trim() || selectedAdjectives.length === 0) return;

    const newPeer: AdjectiveSelection = {
      userId: `peer-${Date.now()}`,
      source: 'peer',
      peerName: newPeerName.trim(),
      peerRole: newPeerRole,
      selectedAdjectives: [...selectedAdjectives],
      notes: peerNote.trim(),
      submittedAt: Date.now(),
    };

    onAddPeerSelection(newPeer);
    setIsAddingNew(false);
    setNewPeerName('');
    setSelectedAdjectives([]);
    setPeerNote('');
  };

  const filteredAdjectives = JOHARI_ADJECTIVES.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchQuery.toLowerCase());
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
              <Users className="w-3.5 h-3.5" />
              <span>Step 2: 360° Observer Feedback</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
              Manage Peer Assessments for {leaderName}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1.5 max-w-3xl leading-relaxed">
              Johari Window analysis requires feedback from managers, direct reports, and cross-functional colleagues. Enter live peer assessments or generate realistic 360° reviewer datasets to illuminate your <span className="font-semibold text-[#1A1A1A]">Arena & Blind Spot</span>.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              id="generate-simulated-peers-btn"
              onClick={onGenerateSimulatedPeers}
              className="px-4 py-2.5 rounded-xl bg-[#F4F4F4] hover:bg-gray-200 text-[#1A1A1A] font-bold text-xs flex items-center gap-2 border border-gray-300 transition"
            >
              <Sparkles className="w-4 h-4 text-[#FF5A1D]" />
              <span>Generate 360° Cohort</span>
            </button>

            <button
              id="add-custom-peer-btn"
              onClick={() => setIsAddingNew(true)}
              className="px-4 py-2.5 rounded-xl bg-[#FF5A1D] hover:bg-[#E04E17] text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-[#FF5A1D]/20 transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Peer Review</span>
            </button>
          </div>
        </div>

        {/* Peer Summary Metric Bar */}
        <div className="mt-6 pt-5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-xs">
            <div>
              <span className="text-gray-500 uppercase font-semibold">Total Reviewers: </span>
              <span className="font-bold text-[#1A1A1A] text-sm ml-1">{peerSelections.length}</span>
            </div>
            <div>
              <span className="text-gray-500 uppercase font-semibold">Roles Represented: </span>
              <span className="font-bold text-[#1A1A1A] text-sm ml-1">
                {new Set(peerSelections.map((p) => p.peerRole)).size} groups
              </span>
            </div>
          </div>

          {peerSelections.length > 0 && (
            <button
              onClick={onClearAllPeers}
              className="text-xs text-gray-500 hover:text-red-600 transition flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset All Reviewers</span>
            </button>
          )}
        </div>
      </div>

      {/* New Peer Input Modal / Drawer */}
      {isAddingNew && (
        <div className="bg-[#1A1A1A] text-white rounded-2xl p-6 sm:p-8 border border-neutral-800 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#FF5A1D] flex items-center justify-center text-white font-bold">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Submit Peer Feedback</h3>
                <p className="text-xs text-gray-400">
                  Select 5–6 adjectives that best represent how you experience {leaderName}’s leadership.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAddingNew(false)}
              className="p-1 rounded-lg hover:bg-neutral-800 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSavePeer}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Observer Name / Identifier *
                </label>
                <input
                  type="text"
                  required
                  value={newPeerName}
                  onChange={(e) => setNewPeerName(e.target.value)}
                  placeholder="e.g. Jordan Hayes"
                  className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#FF5A1D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Professional Relationship *
                </label>
                <select
                  value={newPeerRole}
                  onChange={(e) => setNewPeerRole(e.target.value as any)}
                  className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF5A1D]"
                >
                  <option value="Manager">Executive Manager / Board</option>
                  <option value="Peer / Colleague">Peer / Functional Colleague</option>
                  <option value="Direct Report">Direct Report / Team Member</option>
                  <option value="Cross-functional Partner">Cross-functional Partner</option>
                  <option value="Stakeholder">Key Stakeholder / Client</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Adjective Selector */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
                  Select 5–6 Adjectives ({selectedAdjectives.length}/6 Selected)
                </label>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search trait..."
                    className="px-2.5 py-1 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-[#FF5A1D]"
                  />
                  <select
                    value={selectedCompetency}
                    onChange={(e) => setSelectedCompetency(e.target.value)}
                    className="px-2.5 py-1 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#FF5A1D]"
                  >
                    <option value="all">All Competencies</option>
                    {Object.keys(LEADERSHIP_COMPETENCIES).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selected Pills */}
              {selectedAdjectives.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4 p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                  {selectedAdjectives.map((a) => (
                    <span
                      key={a}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF5A1D] text-white text-xs font-bold"
                    >
                      <span>{a}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleAdjective(a)}
                        className="hover:bg-black/20 rounded p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Trait Selection Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-56 overflow-y-auto p-2 bg-neutral-900 rounded-xl border border-neutral-800 scrollbar-thin">
                {filteredAdjectives.map((item) => {
                  const isChecked = selectedAdjectives.includes(item.name);
                  const isMax = selectedAdjectives.length >= 6 && !isChecked;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={isMax}
                      onClick={() => handleToggleAdjective(item.name)}
                      className={`text-left p-2 rounded-lg text-xs font-semibold transition border truncate ${
                        isChecked
                          ? 'bg-[#FF5A1D] border-[#FF5A1D] text-white'
                          : isMax
                          ? 'bg-neutral-800/40 border-neutral-800 text-neutral-600 cursor-not-allowed'
                          : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:text-white'
                      }`}
                      title={`${item.name}: ${item.definition}`}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Qualitative Feedback */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                Optional Leadership Context / Observational Note
              </label>
              <textarea
                rows={2}
                value={peerNote}
                onChange={(e) => setPeerNote(e.target.value)}
                placeholder={`What specific impact does ${leaderName} make on projects, culture, or strategic decisions?`}
                className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#FF5A1D]"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-4 py-2 rounded-xl text-gray-400 hover:text-white text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newPeerName.trim() || selectedAdjectives.length === 0}
                className="px-5 py-2.5 rounded-xl bg-[#FF5A1D] hover:bg-[#E04E17] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md shadow-[#FF5A1D]/20 transition flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Save Reviewer Feedback</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviewer Cards Grid */}
      {peerSelections.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#1A1A1A]">No Peer Assessments Yet</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mt-1 mb-6">
            Johari Window requires peer observation to reveal blind spots and validate your open arena.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onGenerateSimulatedPeers}
              className="px-4 py-2.5 rounded-xl bg-[#1A1A1A] hover:bg-neutral-800 text-white font-bold text-xs flex items-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4 text-[#FF5A1D]" />
              <span>Generate 4 Reviewers</span>
            </button>
            <button
              onClick={() => setIsAddingNew(true)}
              className="px-4 py-2.5 rounded-xl bg-[#FF5A1D] hover:bg-[#E04E17] text-white font-bold text-xs flex items-center gap-2 transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add First Peer</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {peerSelections.map((peer) => (
            <div
              key={peer.userId}
              className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs hover:shadow-sm transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F4F4F4] border border-gray-200 font-bold text-[#1A1A1A] flex items-center justify-center text-sm">
                      {(peer.peerName || 'Peer').charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1A1A1A] text-sm">{peer.peerName || 'Reviewer'}</h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                        {peer.peerRole || 'Peer'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeletePeerSelection(peer.userId)}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition rounded-lg hover:bg-gray-50"
                    title="Remove reviewer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Selected Traits */}
                <div className="mb-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Observed Adjectives ({peer.selectedAdjectives.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {peer.selectedAdjectives.map((adj) => {
                      return (
                        <span
                          key={adj}
                          className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F4F4F4] text-[#1A1A1A] border border-gray-200"
                        >
                          {adj}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Note */}
                {peer.notes && (
                  <div className="p-3 bg-[#F4F4F4] rounded-xl border border-gray-200 text-xs text-gray-700 italic flex items-start gap-2">
                    <MessageSquareQuote className="w-4 h-4 text-[#FF5A1D] shrink-0 mt-0.5" />
                    <span>"{peer.notes}"</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
                <span>Recorded Assessment</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Active in Matrix</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
