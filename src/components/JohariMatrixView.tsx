import React, { useState } from 'react';
import { 
  DetailedJohariAnalysis, 
  UserSession, 
  AdjectiveStat, 
  CompetencyCategory 
} from '../types/johari';
import { LEADERSHIP_COMPETENCIES, JOHARI_ADJECTIVES } from '../data/johariAdjectives';
import { UnknownGuideModal } from './UnknownGuideModal';
import { AlgorithmUnitTestModal } from './AlgorithmUnitTestModal';
import { 
  Eye, 
  EyeOff, 
  Users, 
  User, 
  Sparkles, 
  HelpCircle, 
  ArrowUpRight, 
  ShieldAlert, 
  Lock, 
  Info,
  CheckCircle2,
  X,
  Share2,
  Lightbulb,
  Compass,
  Code2
} from 'lucide-react';

interface JohariMatrixViewProps {
  session: UserSession;
  analysis: DetailedJohariAnalysis;
  onSelectTab: (tab: 'matrix' | 'self' | 'peer' | 'competencies' | 'insights') => void;
}

export const JohariMatrixView: React.FC<JohariMatrixViewProps> = ({
  session,
  analysis,
  onSelectTab,
}) => {
  const [selectedAdjective, setSelectedAdjective] = useState<AdjectiveStat | null>(null);
  const [activeFilterCompetency, setActiveFilterCompetency] = useState<string>('all');
  const [isUnknownGuideOpen, setIsUnknownGuideOpen] = useState(false);
  const [isUnitTestOpen, setIsUnitTestOpen] = useState(false);

  const { quadrants, adjectiveStats, totalPeers, selfSelectionCount } = analysis;

  const filterList = (list: string[]) => {
    if (activeFilterCompetency === 'all') return list;
    return list.filter((item) => {
      const stat = adjectiveStats[item];
      return stat?.competency === activeFilterCompetency;
    });
  };

  const filteredArena = filterList(quadrants.arena);
  const filteredBlindSpot = filterList(quadrants.blindSpot);
  const filteredFacade = filterList(quadrants.facade);
  const filteredUnknown = filterList(quadrants.unknown);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Executive Overview Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#FF5A1D] mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>360° Johari Matrix Assessment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
              {session.leaderName}’s Leadership Matrix
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
              Mapping self-perception against {totalPeers} peer {totalPeers === 1 ? 'assessment' : 'assessments'} across the 55 canonical leadership adjectives.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#F4F4F4] border border-gray-200 rounded-xl p-3 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Arena (Open)</div>
              <div className="text-xl font-black text-[#1A1A1A]">{quadrants.arena.length}</div>
              <div className="text-[10px] text-[#FF5A1D] font-bold">Shared Strengths</div>
            </div>

            <div className="bg-[#F4F4F4] border border-gray-200 rounded-xl p-3 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Blind Spot</div>
              <div className="text-xl font-black text-[#1A1A1A]">{quadrants.blindSpot.length}</div>
              <div className="text-[10px] text-gray-600 font-semibold">Peer Observed</div>
            </div>

            <div className="bg-[#F4F4F4] border border-gray-200 rounded-xl p-3 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Façade (Hidden)</div>
              <div className="text-xl font-black text-[#1A1A1A]">{quadrants.facade.length}</div>
              <div className="text-[10px] text-gray-600 font-semibold">Private Self</div>
            </div>

            <div className="bg-[#F4F4F4] border border-gray-200 rounded-xl p-3 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Total Peers</div>
              <div className="text-xl font-black text-[#FF5A1D]">{totalPeers}</div>
              <div className="text-[10px] text-gray-500 font-medium">{selfSelectionCount} Self-Traits</div>
            </div>
          </div>
        </div>

        {/* Competency Filter Bar & Tooling Row */}
        <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Filter By Competency:
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={() => setActiveFilterCompetency('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  activeFilterCompetency === 'all'
                    ? 'bg-[#1A1A1A] text-white'
                    : 'bg-[#F4F4F4] text-gray-600 hover:text-[#1A1A1A] border border-gray-200'
                }`}
              >
                All Competencies
              </button>
              {Object.keys(LEADERSHIP_COMPETENCIES).map((cat) => {
                const comp = LEADERSHIP_COMPETENCIES[cat as CompetencyCategory];
                const isSelected = activeFilterCompetency === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveFilterCompetency(cat)}
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

            <button
              onClick={() => setIsUnitTestOpen(true)}
              className="px-3 py-1.5 bg-[#FFF5F1] hover:bg-[#FFECE4] border border-[#FF5A1D]/30 rounded-lg text-xs font-bold text-[#FF5A1D] flex items-center gap-1.5 transition ml-auto shadow-2xs whitespace-nowrap"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Unit Tests & Grid Logic</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2x2 Johari Matrix Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* QUADRANT 1: THE ARENA (Public Self) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 border-l-4 border-l-[#FF5A1D] flex flex-col justify-between min-h-[220px]">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-[#1A1A1A] text-base tracking-tight flex items-center gap-2">
                <span>THE ARENA</span>
                <span className="text-[10px] px-2 py-0.5 bg-[#FF5A1D]/10 text-[#FF5A1D] rounded font-bold uppercase tracking-wider">
                  Public Self
                </span>
              </h3>
              <span className="text-xs font-bold text-[#FF5A1D] bg-[#FFF3EE] px-2.5 py-0.5 rounded-full border border-[#FF5A1D]/20">
                {filteredArena.length} {filteredArena.length === 1 ? 'Trait' : 'Traits'}
              </span>
            </div>

            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Known to self & others. Core signature leadership strengths affirmed across your team.
            </p>

            {/* Adjective Badges */}
            {filteredArena.length === 0 ? (
              <div className="p-5 bg-[#F4F4F4] rounded-xl text-center border border-dashed border-gray-300 text-xs text-gray-400">
                No overlapping traits yet. Complete self-assessment and add reviewer inputs.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {filteredArena.map((adj) => {
                  const stat = adjectiveStats[adj];
                  return (
                    <button
                      key={adj}
                      onClick={() => setSelectedAdjective(stat)}
                      className="px-3 py-1.5 bg-[#F4F4F4] hover:bg-[#FF5A1D] hover:text-white border border-gray-200 rounded-full text-xs font-semibold text-[#1A1A1A] transition-all flex items-center gap-1.5 shadow-2xs hover:shadow-sm"
                    >
                      <span>{adj}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/70 text-gray-700 font-bold group-hover:bg-black/20 group-hover:text-white">
                        {stat?.peerCount}/{totalPeers}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 italic">
            <span>Known to self & others</span>
            <button onClick={() => onSelectTab('insights')} className="not-italic font-bold text-[#FF5A1D] hover:underline">
              Expand Arena &rarr;
            </button>
          </div>
        </div>

        {/* QUADRANT 2: BLIND SPOT (Peer Observed) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 border-l-4 border-l-gray-400 flex flex-col justify-between min-h-[220px]">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-[#1A1A1A] text-base tracking-tight flex items-center gap-2">
                <span>BLIND SPOT</span>
                <span className="text-[10px] px-2 py-0.5 bg-gray-100 rounded text-gray-600 uppercase font-bold tracking-wider">
                  Peer Observed
                </span>
              </h3>
              <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-200">
                {filteredBlindSpot.length} {filteredBlindSpot.length === 1 ? 'Trait' : 'Traits'}
              </span>
            </div>

            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Known to others, but not you. Attributes observed by reviewers that you did not claim.
            </p>

            {/* Adjective Badges */}
            {filteredBlindSpot.length === 0 ? (
              <div className="p-5 bg-[#F4F4F4] rounded-xl text-center border border-dashed border-gray-300 text-xs text-gray-400">
                No blind spot traits detected. Reviewers haven't chosen attributes outside your self-selection.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {filteredBlindSpot.map((adj) => {
                  const stat = adjectiveStats[adj];
                  return (
                    <button
                      key={adj}
                      onClick={() => setSelectedAdjective(stat)}
                      className="px-3 py-1.5 bg-[#F4F4F4] hover:border-gray-400 border border-gray-200 rounded-full text-xs font-semibold text-[#1A1A1A] transition-all flex items-center gap-1.5 shadow-2xs hover:shadow-sm"
                    >
                      <span>{adj}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gray-200 text-gray-700 font-bold">
                        {stat?.peerCount} {stat?.peerCount === 1 ? 'peer' : 'peers'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 italic">
            <span>Known to others, but not you</span>
            <button onClick={() => onSelectTab('insights')} className="not-italic font-bold text-gray-700 hover:text-black hover:underline">
              Inquire with Peers &rarr;
            </button>
          </div>
        </div>

        {/* QUADRANT 3: THE FAÇADE (Private Self) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 border-l-4 border-l-gray-400 flex flex-col justify-between min-h-[220px]">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-[#1A1A1A] text-base tracking-tight flex items-center gap-2">
                <span>THE FAÇADE</span>
                <span className="text-[10px] px-2 py-0.5 bg-gray-100 rounded text-gray-600 uppercase font-bold tracking-wider">
                  Private Self
                </span>
              </h3>
              <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-200">
                {filteredFacade.length} {filteredFacade.length === 1 ? 'Trait' : 'Traits'}
              </span>
            </div>

            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Known to you, but not others. Self-perceptions not yet affirmed or visible to colleagues.
            </p>

            {/* Adjective Badges */}
            {filteredFacade.length === 0 ? (
              <div className="p-5 bg-[#F4F4F4] rounded-xl text-center border border-dashed border-gray-300 text-xs text-gray-400">
                High transparency! All self-chosen attributes were recognized by reviewers.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {filteredFacade.map((adj) => {
                  const stat = adjectiveStats[adj];
                  return (
                    <button
                      key={adj}
                      onClick={() => setSelectedAdjective(stat)}
                      className="px-3 py-1.5 bg-[#F4F4F4] hover:border-gray-400 border border-gray-200 rounded-full text-xs font-semibold text-[#1A1A1A] transition-all flex items-center gap-1.5 shadow-2xs hover:shadow-sm"
                    >
                      <span>{adj}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gray-200 text-gray-700 font-bold">
                        Self-Only
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 italic">
            <span>Known to you, but not others</span>
            <button onClick={() => onSelectTab('insights')} className="not-italic font-bold text-gray-700 hover:text-black hover:underline">
              Disclosure Strategy &rarr;
            </button>
          </div>
        </div>

        {/* QUADRANT 4: UNKNOWN (Unexplored Potential) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 border-l-4 border-l-gray-300 flex flex-col justify-between min-h-[220px]">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-[#1A1A1A] text-base tracking-tight flex items-center gap-2">
                <span>UNKNOWN</span>
                <span className="text-[10px] px-2 py-1 bg-gray-100 rounded text-gray-500 uppercase font-bold tracking-widest">
                  Unexplored
                </span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsUnknownGuideOpen(true)}
                  className="text-[10px] font-bold px-2 py-1 bg-[#FFF5F1] text-[#FF5A1D] hover:bg-[#FFEAE1] border border-[#FF5A1D]/20 rounded-md transition flex items-center gap-1"
                  title="Learn why the Unknown quadrant represents developmental potential, not a trash bin"
                >
                  <Compass className="w-3 h-3" />
                  <span>Context Guide</span>
                </button>
                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-200">
                  {filteredUnknown.length} Adjectives
                </span>
              </div>
            </div>

            <div className="p-2.5 mb-3 bg-[#F9F9F9] rounded-xl border border-gray-200 text-xs text-gray-600 flex items-start gap-2">
              <Compass className="w-4 h-4 text-[#FF5A1D] shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <span className="font-bold text-[#1A1A1A]">Latent Developmental Potential: </span>
                <span>
                  Unselected traits represent dormant situational agility, future stretch horizons, or role boundaries—never a discard bin.
                </span>
              </div>
            </div>

            {/* Trait Cloud */}
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-[#F4F4F4] rounded-xl border border-gray-200 scrollbar-thin">
              {filteredUnknown.map((adj) => {
                const stat = adjectiveStats[adj];
                return (
                  <button
                    key={adj}
                    onClick={() => setSelectedAdjective(stat)}
                    className="px-2.5 py-1 bg-white hover:border-gray-400 text-gray-700 border border-gray-200 rounded-md text-[11px] font-medium transition shadow-2xs"
                  >
                    {adj}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 italic">
            <span>Latent talents & traits</span>
            <div className="flex items-center gap-3 not-italic">
              <button
                onClick={() => setIsUnknownGuideOpen(true)}
                className="font-bold text-[#FF5A1D] hover:underline"
              >
                Why Unknown is Not a Trash Bin &rarr;
              </button>
              <button
                onClick={() => onSelectTab('competencies')}
                className="font-bold text-gray-600 hover:text-black hover:underline"
              >
                Explore LCM &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* LCM Competency Alignment Bar (Sleek Progress Grid) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
            Leadership Competency Alignment (LCM)
          </h3>
          <span className="text-xs font-semibold text-gray-400">
            Calculated across {totalPeers} reviewer submissions & self-inputs
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {Object.keys(LEADERSHIP_COMPETENCIES).map((cat) => {
            const comp = LEADERSHIP_COMPETENCIES[cat as CompetencyCategory];
            const dist = analysis.competencyDistribution[cat as CompetencyCategory];
            const activeCount = dist.arena + dist.blindSpot + dist.facade;
            const percentage = Math.min(100, Math.round((activeCount / Math.max(1, dist.total)) * 100));
            const isHighArena = dist.arena > 0;

            return (
              <div key={cat} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-[#1A1A1A] truncate">{comp.name.split(' ')[0]}</span>
                  <span className={isHighArena ? 'text-[#FF5A1D] font-bold' : 'text-gray-600 font-bold'}>
                    {percentage}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${isHighArena ? 'bg-[#FF5A1D]' : 'bg-[#1A1A1A]'}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-[10px] text-gray-400 flex justify-between">
                  <span>{dist.arena} Arena</span>
                  <span>{dist.blindSpot + dist.facade} Active</span>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
          Your leadership traits in{' '}
          <span className="font-bold text-[#1A1A1A] underline decoration-[#FF5A1D]">
            {Object.keys(analysis.competencyDistribution).find(
              (c) => analysis.competencyDistribution[c as CompetencyCategory].arena > 0
            ) || 'Strategic'}
          </span>{' '}
          and{' '}
          <span className="font-bold text-[#1A1A1A] underline decoration-[#FF5A1D]">
            {Object.keys(analysis.competencyDistribution).filter(
              (c) => analysis.competencyDistribution[c as CompetencyCategory].arena > 0
            )[1] || 'Execution'}
          </span>{' '}
          are highly aligned with peer observations, placing them firmly in your Open Arena.
        </p>
      </div>

      {/* Trait Inspector Modal / Detail Sheet */}
      {selectedAdjective && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedAdjective(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FF5A1D]/10 text-[#FF5A1D] flex items-center justify-center font-black text-xl">
                {selectedAdjective.adjective.charAt(0)}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-2xl font-black text-neutral-900">
                    {selectedAdjective.adjective}
                  </h3>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                      LEADERSHIP_COMPETENCIES[selectedAdjective.competency]?.badgeColor
                    }`}
                  >
                    {selectedAdjective.competency}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 font-medium">
                  Canonical Johari Window Leadership Trait
                </p>
              </div>
            </div>

            {/* Definition & Leadership Context */}
            <div className="space-y-3 mb-6">
              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
                <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  Psychological & Behavioral Definition
                </div>
                <p className="text-xs text-neutral-800 leading-relaxed font-medium">
                  {selectedAdjective.definition}
                </p>
              </div>

              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
                <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  Leadership Competency Impact
                </div>
                <p className="text-xs text-neutral-800 leading-relaxed">
                  {
                    JOHARI_ADJECTIVES.find((a) => a.name === selectedAdjective.adjective)
                      ?.leadershipContext
                  }
                </p>
              </div>
            </div>

            {/* Assessment Breakdown */}
            <div className="bg-neutral-900 text-white rounded-xl p-4 mb-6">
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-3">
                360° Assessment Status
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-neutral-400 text-[11px]">Leader Self-Choice:</div>
                  <div className="font-bold flex items-center space-x-1 mt-0.5">
                    {selectedAdjective.isSelf ? (
                      <span className="text-emerald-400 font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Included in Self-Image</span>
                      </span>
                    ) : (
                      <span className="text-neutral-400">Not selected by leader</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-neutral-400 text-[11px]">Peer Consensus:</div>
                  <div className="font-bold text-[#FF5A1D] mt-0.5">
                    {selectedAdjective.peerCount} of {totalPeers} peers ({selectedAdjective.peerPercentage}%)
                  </div>
                </div>
              </div>

              {selectedAdjective.selectedByPeers.length > 0 && (
                <div className="mt-3 pt-3 border-t border-neutral-800 text-[11px]">
                  <span className="text-neutral-400">Selected by: </span>
                  <span className="text-neutral-200 font-semibold">
                    {selectedAdjective.selectedByPeers.join(', ')}
                  </span>
                </div>
              )}
            </div>

            {/* Action Tip */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-neutral-500">
                Quadrant:{' '}
                <span className="font-bold text-neutral-900">
                  {selectedAdjective.isSelf && selectedAdjective.peerCount > 0
                    ? 'Arena (Open)'
                    : !selectedAdjective.isSelf && selectedAdjective.peerCount > 0
                    ? 'Blind Spot'
                    : selectedAdjective.isSelf && selectedAdjective.peerCount === 0
                    ? 'Façade (Hidden)'
                    : 'Unknown Area'}
                </span>
              </div>
              <button
                onClick={() => setSelectedAdjective(null)}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unknown Quadrant Psychological Context Guide Modal */}
      <UnknownGuideModal
        isOpen={isUnknownGuideOpen}
        onClose={() => setIsUnknownGuideOpen(false)}
      />

      {/* Algorithm & Unit Test Suite Inspector Modal */}
      <AlgorithmUnitTestModal
        isOpen={isUnitTestOpen}
        onClose={() => setIsUnitTestOpen(false)}
      />
    </div>
  );
};
