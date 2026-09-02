import React from 'react';
import { DetailedJohariAnalysis, CompetencyCategory } from '../types/johari';
import { LEADERSHIP_COMPETENCIES, JOHARI_ADJECTIVES } from '../data/johariAdjectives';
import { 
  BarChart3, 
  CheckCircle2, 
  Eye, 
  Lock, 
  HelpCircle, 
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface CompetencyBreakdownViewProps {
  analysis: DetailedJohariAnalysis;
  leaderName: string;
}

export const CompetencyBreakdownView: React.FC<CompetencyBreakdownViewProps> = ({
  analysis,
  leaderName,
}) => {
  const { competencyDistribution, adjectiveStats, totalPeers } = analysis;

  const categories = Object.keys(LEADERSHIP_COMPETENCIES) as CompetencyCategory[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#FFD4BC] text-[#300266] text-xs font-bold uppercase tracking-widest mb-2 border border-[#FFA524]/40">
              <BarChart3 className="w-3.5 h-3.5 text-[#801ED7]" />
              <span>Braze Leadership Competencies (LCM) Synthesis</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#300266] tracking-tight">
              Competency Alignment & Quadrant Distribution
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1.5 max-w-3xl leading-relaxed">
              Every Johari Window attribute maps to one of the six Braze Leadership Competencies: Build Capability & Capacity, Shape the Future, Execute with Excellence, Seek the Truth & Make Sound Decisions, Lead with Empathy & Inclusivity, and Inspire, Influence & Collaborate.
            </p>
          </div>

          {/* Legend */}
          <div className="bg-[#FAFAFD] p-4 rounded-xl border border-gray-200 shrink-0 text-xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
              Quadrant Key
            </div>
            <div className="grid grid-cols-2 gap-2 font-bold">
              <div className="flex items-center gap-1.5 text-[#FFA524]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFA524]"></span>
                <span className="text-[#300266]">Arena (Open)</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#801ED7]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#801ED7]"></span>
                <span className="text-[#300266]">Blind Spot</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#91186E]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#91186E]"></span>
                <span className="text-[#300266]">Façade (Hidden)</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-300"></span>
                <span>Unknown</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Competency Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {categories.map((category) => {
          const comp = LEADERSHIP_COMPETENCIES[category];
          const dist = competencyDistribution[category];
          const totalInCat = dist.total || 1;

          const arenaPct = Math.round((dist.arena / totalInCat) * 100);
          const blindPct = Math.round((dist.blindSpot / totalInCat) * 100);
          const facadePct = Math.round((dist.facade / totalInCat) * 100);
          const unknownPct = Math.max(0, 100 - arenaPct - blindPct - facadePct);

          // Get all adjectives in this competency
          const adjsInComp = JOHARI_ADJECTIVES.filter((a) => a.competency === category);

          return (
            <div
              key={category}
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-2xs hover:shadow-sm transition flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#300266] text-[#FFA524] flex items-center justify-center font-black">
                      {category.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-[#300266] text-base">{comp.name}</h3>
                      <p className="text-xs text-gray-500 line-clamp-1">{comp.description}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#300266] bg-[#FAFAFD] px-2.5 py-1 rounded-full border border-gray-200">
                    {adjsInComp.length} Attributes
                  </span>
                </div>

                {/* Progress Distribution Bar */}
                <div className="my-4">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-gray-600 mb-1.5">
                    <span>Quadrant Distribution</span>
                    <span>
                      {dist.arena > 0 && <span className="text-[#300266] font-bold"><span className="text-[#FFA524] font-black">{dist.arena}</span> Arena </span>}
                      {dist.blindSpot > 0 && <span className="text-[#300266] font-bold">&bull; <span className="text-[#801ED7] font-black">{dist.blindSpot}</span> Blind </span>}
                      {dist.facade > 0 && <span className="text-[#300266] font-bold">&bull; <span className="text-[#91186E] font-black">{dist.facade}</span> Façade</span>}
                    </span>
                  </div>

                  <div className="w-full h-3 bg-[#FAFAFD] rounded-full overflow-hidden flex shadow-2xs border border-gray-100">
                    {dist.arena > 0 && (
                      <div
                        style={{ width: `${(dist.arena / totalInCat) * 100}%` }}
                        className="bg-[#FFA524] h-full transition-all duration-500"
                        title={`Arena: ${dist.arena}`}
                      />
                    )}
                    {dist.blindSpot > 0 && (
                      <div
                        style={{ width: `${(dist.blindSpot / totalInCat) * 100}%` }}
                        className="bg-[#801ED7] h-full transition-all duration-500"
                        title={`Blind Spot: ${dist.blindSpot}`}
                      />
                    )}
                    {dist.facade > 0 && (
                      <div
                        style={{ width: `${(dist.facade / totalInCat) * 100}%` }}
                        className="bg-[#91186E] h-full transition-all duration-500"
                        title={`Façade: ${dist.facade}`}
                      />
                    )}
                    {dist.unknown > 0 && (
                      <div
                        style={{ width: `${(dist.unknown / totalInCat) * 100}%` }}
                        className="bg-gray-200 h-full transition-all duration-500"
                        title={`Unknown: ${dist.unknown}`}
                      />
                    )}
                  </div>
                </div>

                {/* Trait Matrix Pills */}
                <div className="space-y-1.5 mt-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Attributes & Observed Status
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {adjsInComp.map((adj) => {
                      const stat = adjectiveStats[adj.name];
                      let badgeStyle = 'bg-[#FAFAFD] text-gray-600 border-gray-200';
                      let icon = null;

                      if (stat?.isSelf && stat?.peerCount > 0) {
                        badgeStyle = 'bg-[#FFD4BC]/40 text-[#300266] border-[#FFA524]/60 font-bold';
                        icon = <CheckCircle2 className="w-3 h-3 text-[#FFA524]" />;
                      } else if (!stat?.isSelf && stat?.peerCount > 0) {
                        badgeStyle = 'bg-[#C9C4FF]/40 text-[#300266] border-[#801ED7]/40 font-bold';
                        icon = <Eye className="w-3 h-3 text-[#801ED7]" />;
                      } else if (stat?.isSelf && stat?.peerCount === 0) {
                        badgeStyle = 'bg-[#F8D3E8] text-[#91186E] border-[#FFA4FB] font-bold';
                        icon = <Lock className="w-3 h-3 text-[#91186E]" />;
                      }

                      return (
                        <span
                          key={adj.id}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${badgeStyle}`}
                          title={`${adj.name}: ${adj.definition}`}
                        >
                          {icon}
                          <span>{adj.name}</span>
                          {stat?.peerCount > 0 && (
                            <span className="text-[10px] opacity-75 font-semibold">
                              ({stat.peerCount})
                            </span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Insight */}
              <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-600">
                {dist.arena > 0 && (
                  <div className="text-[#300266] font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#FFA524]" />
                    <span>Established leadership asset in this competency area.</span>
                  </div>
                )}
                {dist.arena === 0 && dist.blindSpot > 0 && (
                  <div className="text-[#300266] font-semibold flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-[#801ED7]" />
                    <span>Colleagues see strong capability that you haven't claimed as a self-identity.</span>
                  </div>
                )}
                {dist.arena === 0 && dist.blindSpot === 0 && dist.facade > 0 && (
                  <div className="text-[#91186E] font-semibold flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-[#91186E]" />
                    <span>Internal strength held privately; increase outward demonstration.</span>
                  </div>
                )}
                {dist.arena === 0 && dist.blindSpot === 0 && dist.facade === 0 && (
                  <div className="text-gray-500 font-medium">
                    Emerging developmental frontier for future leadership growth.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
