import React, { useState, useMemo } from 'react';
import { 
  Eye, 
  EyeOff, 
  HelpCircle, 
  Sparkles, 
  Compass, 
  Info, 
  Filter, 
  User, 
  Users, 
  Layers, 
  X,
  Share2,
  CheckCircle2,
  TrendingUp,
  Award,
  Lock,
  ArrowRight,
  BarChart3,
  ShieldCheck
} from 'lucide-react';
import { 
  DetailedJohariAnalysis, 
  AdjectiveStat, 
  CompetencyCategory, 
  UserSession 
} from '../types/johari';
import { LEADERSHIP_COMPETENCIES, getJohariAdjective } from '../data/johariAdjectives';
import { UnknownGuideModal } from './UnknownGuideModal';

export interface JohariGridDisplayProps {
  session: UserSession;
  analysis: DetailedJohariAnalysis;
  onSelectTab?: (tab: 'matrix' | 'self' | 'competencies' | 'insights') => void;
  onOpenInvitePeers?: () => void;
}

export const JohariGridDisplay: React.FC<JohariGridDisplayProps> = ({
  session,
  analysis,
  onSelectTab,
  onOpenInvitePeers,
}) => {
  const [selectedAdjective, setSelectedAdjective] = useState<AdjectiveStat | null>(null);
  const [activeCompetencyFilter, setActiveCompetencyFilter] = useState<string>('all');
  const [isUnknownGuideOpen, setIsUnknownGuideOpen] = useState<boolean>(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const { quadrants, adjectiveStats, totalPeers, selfSelectionCount } = analysis;

  const filterListByCompetency = (list: string[]) => {
    if (activeCompetencyFilter === 'all') return list;
    return list.filter((name) => {
      const trait = getJohariAdjective(name);
      return trait && trait.competency === activeCompetencyFilter;
    });
  };

  const filteredArena = useMemo(() => filterListByCompetency(quadrants.arena), [quadrants.arena, activeCompetencyFilter]);
  const filteredBlindSpot = useMemo(() => filterListByCompetency(quadrants.blindSpot), [quadrants.blindSpot, activeCompetencyFilter]);
  const filteredFacade = useMemo(() => filterListByCompetency(quadrants.facade), [quadrants.facade, activeCompetencyFilter]);
  const filteredUnknown = useMemo(() => filterListByCompetency(quadrants.unknown), [quadrants.unknown, activeCompetencyFilter]);

  const quadrantTooltips = {
    arena: {
      title: 'Quadrant 1: The Arena (Open Self)',
      tagline: 'Known to Self & Known to Others',
      text: 'Verified signature strengths. Behaviors and competencies where your self-perception matches the empirical experience of your team.',
      formula: 'Self-Selected ∩ Peer-Selected',
    },
    blindSpot: {
      title: 'Quadrant 2: The Blind Spot (Blind Self)',
      tagline: 'Unknown to Self & Known to Others',
      text: 'Attributes peers consistently observe in your leadership that you undervalued or did not choose. Key area for unlocking expanded self-awareness.',
      formula: 'Peer-Selected \\ Self-Selected',
    },
    facade: {
      title: 'Quadrant 3: The Façade (Hidden Self)',
      tagline: 'Known to Self & Unknown to Others',
      text: 'Qualities you identify with internally that colleagues have not yet observed in visible action. Opportunities for intentional demonstration.',
      formula: 'Self-Selected \\ Peer-Selected',
    },
    unknown: {
      title: 'Quadrant 4: The Unknown (Developmental Frontier)',
      tagline: 'Latent Competencies & Emergent Horizon',
      text: 'Material neither self-identified nor actively observed in present operations. Represents future adaptability, dormant potential, and role boundaries.',
      formula: '(Self ∪ Peer)ᶜ',
    },
  };

  return (
    <div id="johari-grid-display-root" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner with Invite Peers CTA */}
      <div id="johari-grid-summary-card" className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#300266] text-white text-xs font-bold uppercase tracking-wider mb-2">
              <Layers className="w-3.5 h-3.5 text-[#FFA524]" />
              <span>Personalised 2x2 Johari Window</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#300266] tracking-tight">
              {session.leaderName}&rsquo;s Leadership Matrix
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl leading-relaxed">
              Synthesized from <span className="font-bold text-[#300266]">{selfSelectionCount} self-selected traits</span> and{' '}
              <span className="font-bold text-[#300266]">{totalPeers} anonymous peer assessment{totalPeers === 1 ? '' : 's'}</span>.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {onOpenInvitePeers && (
              <button
                id="btn-grid-invite-peers"
                onClick={onOpenInvitePeers}
                className="px-5 py-3 rounded-xl bg-[#FFA524] hover:bg-[#E9371F] text-[#300266] hover:text-white font-extrabold text-xs transition shadow-lg shadow-[#FFA524]/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Invite your peers to assess you</span>
                <span className="px-2 py-0.5 rounded-full bg-[#300266]/20 text-[10px] font-black">
                  {totalPeers} done
                </span>
              </button>
            )}

            {onSelectTab && (
              <button
                onClick={() => onSelectTab('insights')}
                className="px-4 py-3 rounded-xl bg-[#300266] hover:bg-[#46098c] text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#FFA4FB]" />
                <span>Coaching Debrief</span>
              </button>
            )}
          </div>
        </div>

        {/* 0-Peer Notice / Live Progress Bar */}
        {totalPeers === 0 ? (
          <div className="p-4 bg-[#FFD4BC]/40 border border-[#FFA524]/40 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FFA524] text-[#300266] flex items-center justify-center font-black text-xs shrink-0">
                !
              </div>
              <div className="text-xs text-[#300266]">
                <p className="font-bold">Awaiting Anonymous Peer Feedback</p>
                <p className="text-gray-700 text-[11px] mt-0.5">
                  Your 6 self-selected traits are currently located in your <strong>Façade (Hidden Self)</strong>. Once peers submit assessments via your invite link, traits will dynamically populate your <strong>Arena</strong> and <strong>Blind Spot</strong> quadrants.
                </p>
              </div>
            </div>

            {onOpenInvitePeers && (
              <button
                onClick={onOpenInvitePeers}
                className="px-3.5 py-1.5 bg-[#FFA524] hover:bg-[#E9371F] text-[#300266] hover:text-white text-xs font-extrabold rounded-lg shrink-0 transition cursor-pointer"
              >
                Get Invite Link &rarr;
              </button>
            )}
          </div>
        ) : (
          <div className="p-4 bg-[#C9C4FF]/30 border border-[#801ED7]/30 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#801ED7] text-white flex items-center justify-center font-bold text-xs shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-xs text-[#300266]">
                <p className="font-bold">
                  {totalPeers} Anonymous Peer Evaluation{totalPeers === 1 ? '' : 's'} Aggregated
                </p>
                <p className="text-gray-700 text-[11px] mt-0.5">
                  All individual reviewer responses are encrypted and strictly anonymized. Percentages indicate consensus frequency.
                </p>
              </div>
            </div>

            <div className="text-xs font-bold text-[#801ED7] hidden sm:block">
              {quadrants.arena.length} Open &bull; {quadrants.blindSpot.length} Blind Spots
            </div>
          </div>
        )}

        {/* 4 Quadrants Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-[#FAFAFD] p-3.5 rounded-xl border border-gray-200 text-center">
            <div className="text-[10px] font-bold uppercase text-gray-500">1. Arena (Open)</div>
            <div className="text-2xl font-black text-[#FFA524] mt-0.5">{quadrants.arena.length}</div>
            <div className="text-[10px] text-gray-500">Known to Self & Peers</div>
          </div>

          <div className="bg-[#FAFAFD] p-3.5 rounded-xl border border-gray-200 text-center">
            <div className="text-[10px] font-bold uppercase text-gray-500">2. Blind Spot</div>
            <div className="text-2xl font-black text-[#801ED7] mt-0.5">{quadrants.blindSpot.length}</div>
            <div className="text-[10px] text-gray-500">Observed by Peers Only</div>
          </div>

          <div className="bg-[#FAFAFD] p-3.5 rounded-xl border border-gray-200 text-center">
            <div className="text-[10px] font-bold uppercase text-gray-500">3. Façade (Hidden)</div>
            <div className="text-2xl font-black text-[#91186E] mt-0.5">{quadrants.facade.length}</div>
            <div className="text-[10px] text-gray-500">Self-Selected Only</div>
          </div>

          <div className="bg-[#FAFAFD] p-3.5 rounded-xl border border-gray-200 text-center">
            <div className="text-[10px] font-bold uppercase text-gray-500">4. Unknown</div>
            <div className="text-2xl font-black text-gray-400 mt-0.5">{quadrants.unknown.length}</div>
            <div className="text-[10px] text-gray-500">Latent Potential</div>
          </div>
        </div>

        {/* Competency Filter Toolbar */}
        <div className="pt-4 border-t border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#801ED7]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#300266]">
              Filter Quadrants By Competency:
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <button
              id="grid-filter-all"
              onClick={() => setActiveCompetencyFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeCompetencyFilter === 'all'
                  ? 'bg-[#300266] text-white shadow-2xs'
                  : 'bg-[#FAFAFD] text-gray-600 hover:text-[#300266] border border-gray-200'
              }`}
            >
              All (55)
            </button>
            {Object.values(LEADERSHIP_COMPETENCIES).map((comp) => {
              const isSelected = activeCompetencyFilter === comp.id;
              return (
                <button
                  key={comp.id}
                  id={`grid-filter-${comp.id.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setActiveCompetencyFilter(comp.id)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap border cursor-pointer ${
                    isSelected
                      ? 'bg-[#801ED7] text-white border-[#801ED7] shadow-2xs'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  {comp.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Axis Framing Grid: 2x2 Matrix */}
      <div id="johari-2x2-matrix-grid" className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* QUADRANT 1: THE ARENA (Open Self) - Braze Orange */}
        <div 
          id="quadrant-card-arena"
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 border-l-4 border-l-[#FFA524] flex flex-col justify-between min-h-[260px] relative transition hover:shadow-md"
        >
          <div>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FFD4BC] text-[#300266] flex items-center justify-center font-bold">
                  <Eye className="w-4 h-4 text-[#FFA524]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#300266] text-base tracking-tight flex items-center gap-2">
                    <span>1. The Arena</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFD4BC] text-[#300266] border border-[#FFA524]/40 uppercase">
                      Open Self
                    </span>
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium">Known to Self &bull; Known to Others</p>
                </div>
              </div>

              <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-[#FAFAFD] text-[#300266] border border-gray-200">
                {filteredArena.length} traits
              </span>
            </div>

            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              Signature leadership strengths recognized by both you and your peers.
            </p>

            {filteredArena.length === 0 ? (
              <div className="p-6 border-2 border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-400">
                {totalPeers === 0 
                  ? 'Awaiting peer assessments to confirm shared traits'
                  : 'No overlapping traits between self and peer selections yet.'}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {filteredArena.map((name) => {
                  const stat = adjectiveStats[name];
                  return (
                    <button
                      key={name}
                      id={`pill-arena-${name.toLowerCase()}`}
                      onClick={() => stat && setSelectedAdjective(stat)}
                      className="px-3 py-1.5 rounded-xl bg-[#FFD4BC]/40 hover:bg-[#FFD4BC] border border-[#FFA524]/50 text-xs font-bold text-[#300266] transition flex items-center gap-1.5 shadow-2xs cursor-pointer text-left"
                    >
                      <span>{name}</span>
                      {stat && totalPeers > 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-[#FFA524] text-[#300266] rounded-md font-extrabold">
                          {stat.peerCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
            <span>Verified Core Strengths</span>
            <span className="font-semibold text-[#FFA524]">Self ∩ Peers</span>
          </div>
        </div>

        {/* QUADRANT 2: THE BLIND SPOT - Braze Purple */}
        <div 
          id="quadrant-card-blindspot"
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 border-l-4 border-l-[#801ED7] flex flex-col justify-between min-h-[260px] relative transition hover:shadow-md"
        >
          <div>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#C9C4FF]/40 text-[#801ED7] flex items-center justify-center font-bold">
                  <EyeOff className="w-4 h-4 text-[#801ED7]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#300266] text-base tracking-tight flex items-center gap-2">
                    <span>2. The Blind Spot</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C9C4FF] text-[#300266] border border-[#801ED7]/40 uppercase">
                      Blind Self
                    </span>
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium">Unknown to Self &bull; Known to Others</p>
                </div>
              </div>

              <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-[#FAFAFD] text-[#300266] border border-gray-200">
                {filteredBlindSpot.length} traits
              </span>
            </div>

            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              Attributes observed by your team that you did not choose for yourself.
            </p>

            {filteredBlindSpot.length === 0 ? (
              <div className="p-6 border-2 border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-400">
                {totalPeers === 0 ? 'Collect peer feedback to surface unrecognized strengths' : 'No blind spots identified.'}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {filteredBlindSpot.map((name) => {
                  const stat = adjectiveStats[name];
                  return (
                    <button
                      key={name}
                      id={`pill-blindspot-${name.toLowerCase()}`}
                      onClick={() => stat && setSelectedAdjective(stat)}
                      className="px-3 py-1.5 rounded-xl bg-[#C9C4FF]/30 hover:bg-[#C9C4FF]/60 border border-[#801ED7]/30 text-xs font-bold text-[#300266] transition flex items-center gap-1.5 shadow-2xs cursor-pointer text-left"
                    >
                      <span>{name}</span>
                      {stat && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-[#801ED7] text-white rounded-md font-extrabold">
                          {stat.peerCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
            <span>External Feedback Vectors</span>
            <span className="font-semibold text-[#801ED7]">Peers \ Self</span>
          </div>
        </div>

        {/* QUADRANT 3: THE FAÇADE (Hidden Self) - Braze Pink */}
        <div 
          id="quadrant-card-facade"
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 border-l-4 border-l-[#91186E] flex flex-col justify-between min-h-[260px] relative transition hover:shadow-md"
        >
          <div>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#F8D3E8] text-[#91186E] flex items-center justify-center font-bold">
                  <User className="w-4 h-4 text-[#91186E]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#300266] text-base tracking-tight flex items-center gap-2">
                    <span>3. The Façade</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F8D3E8] text-[#91186E] border border-[#FFA4FB] uppercase">
                      Hidden Self
                    </span>
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium">Known to Self &bull; Unknown to Others</p>
                </div>
              </div>

              <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-[#FAFAFD] text-[#300266] border border-gray-200">
                {filteredFacade.length} traits
              </span>
            </div>

            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              Qualities you identify with internally that peers have not yet observed in action.
            </p>

            {filteredFacade.length === 0 ? (
              <div className="p-6 border-2 border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-400">
                All your self-selected traits have been validated by peers.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {filteredFacade.map((name) => {
                  const stat = adjectiveStats[name];
                  return (
                    <button
                      key={name}
                      id={`pill-facade-${name.toLowerCase()}`}
                      onClick={() => stat && setSelectedAdjective(stat)}
                      className="px-3 py-1.5 rounded-xl bg-[#F8D3E8]/40 hover:bg-[#F8D3E8] border border-[#FFA4FB]/70 text-xs font-bold text-[#91186E] transition flex items-center gap-1.5 shadow-2xs cursor-pointer text-left"
                    >
                      <span>{name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-[#FFA4FB] text-[#91186E] rounded-md font-bold">
                        Self
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
            <span>Intentional Demonstration Vectors</span>
            <span className="font-semibold text-[#91186E]">Self \ Peers</span>
          </div>
        </div>

        {/* QUADRANT 4: THE UNKNOWN - Slate Purple */}
        <div 
          id="quadrant-card-unknown"
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 border-l-4 border-l-[#C9C4FF] flex flex-col justify-between min-h-[260px] relative transition hover:shadow-md"
        >
          <div>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FAFAFD] text-[#300266] flex items-center justify-center font-bold">
                  <Compass className="w-4 h-4 text-[#801ED7]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#300266] text-base tracking-tight flex items-center gap-2">
                    <span>4. The Unknown</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAFAFD] text-[#300266] border border-gray-200 uppercase">
                      Latent Potential
                    </span>
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium">Unknown to Self &bull; Unknown to Others</p>
                </div>
              </div>

              <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-[#FAFAFD] text-gray-600 border border-gray-200">
                {filteredUnknown.length} traits
              </span>
            </div>

            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              Latent competencies, situational reserves, and emergent leadership horizons.
            </p>

            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
              {filteredUnknown.map((name) => {
                const stat = adjectiveStats[name];
                return (
                  <button
                    key={name}
                    id={`pill-unknown-${name.toLowerCase()}`}
                    onClick={() => stat && setSelectedAdjective(stat)}
                    className="px-2.5 py-1 rounded-lg bg-[#FAFAFD] hover:bg-white border border-gray-200 text-[11px] font-medium text-gray-600 hover:text-[#300266] transition text-left cursor-pointer"
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
            <span>Dormant Horizons</span>
            <button
              onClick={() => setIsUnknownGuideOpen(true)}
              className="font-bold text-[#801ED7] hover:underline cursor-pointer"
            >
              Explore Growth Frontiers &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Adjective Inspection Modal / Popover */}
      {selectedAdjective && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-extrabold text-[#300266]">{selectedAdjective.adjective}</h3>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#C9C4FF] text-[#300266] border border-[#801ED7]/30">
                    {selectedAdjective.quadrant.toUpperCase()}
                  </span>
                </div>
                <span className="text-xs font-bold text-[#801ED7] uppercase tracking-wider">
                  {selectedAdjective.competency}
                </span>
              </div>
              <button
                onClick={() => setSelectedAdjective(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-[#300266] hover:bg-[#FAFAFD] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-gray-700">
              <div className="p-3 bg-[#FAFAFD] rounded-xl border border-gray-200">
                <span className="text-xs font-bold text-[#300266] uppercase block mb-1">Definition</span>
                <p className="text-gray-800 leading-relaxed font-medium">{selectedAdjective.definition}</p>
              </div>

              <div className="p-3 bg-[#FAFAFD] rounded-xl border border-gray-200">
                <span className="text-xs font-bold text-[#801ED7] uppercase block mb-1">LCM Leadership Impact</span>
                <p className="text-gray-700 leading-relaxed">{selectedAdjective.leadershipContext}</p>
              </div>

              {/* Mentions Breakdown */}
              <div className="grid grid-cols-2 gap-2 text-center pt-1">
                <div className="p-2.5 bg-white border border-gray-200 rounded-xl">
                  <div className="text-[10px] font-bold uppercase text-gray-500">Leader Self-Rating</div>
                  <div className="text-sm font-bold text-[#300266] mt-0.5">
                    {selectedAdjective.isSelectedBySelf ? 'Selected (Self-Known)' : 'Not Selected'}
                  </div>
                </div>

                <div className="p-2.5 bg-white border border-gray-200 rounded-xl">
                  <div className="text-[10px] font-bold uppercase text-gray-500">360° Peer Mentions</div>
                  <div className="text-sm font-bold text-[#801ED7] mt-0.5">
                    {selectedAdjective.peerCount} of {totalPeers} Peers ({selectedAdjective.peerPercentage}%)
                  </div>
                </div>
              </div>

              {/* Anonymous Privacy Guarantee Note */}
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>100% Anonymous Aggregation: Individual reviewer identities are never stored or displayed.</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedAdjective(null)}
                className="px-5 py-2 bg-[#300266] hover:bg-[#801ED7] text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unknown Guide Modal */}
      <UnknownGuideModal
        isOpen={isUnknownGuideOpen}
        onClose={() => setIsUnknownGuideOpen(false)}
      />
    </div>
  );
};
