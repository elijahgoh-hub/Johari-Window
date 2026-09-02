import React from 'react';
import { DetailedJohariAnalysis, UserSession } from '../types/johari';
import { LEADERSHIP_COMPETENCIES, getJohariAdjective } from '../data/johariAdjectives';
import { 
  Sparkles, 
  Target, 
  ArrowRight, 
  MessageSquare, 
  Compass, 
  ShieldCheck, 
  HelpCircle, 
  Lightbulb, 
  CheckCircle2, 
  TrendingUp, 
  Eye, 
  Lock,
  ChevronRight
} from 'lucide-react';

interface LeadershipInsightsViewProps {
  session: UserSession;
  analysis: DetailedJohariAnalysis;
  onSelectTab: (tab: 'matrix' | 'self' | 'peer' | 'competencies' | 'insights') => void;
}

export const LeadershipInsightsView: React.FC<LeadershipInsightsViewProps> = ({
  session,
  analysis,
  onSelectTab,
}) => {
  const { quadrants, adjectiveStats, arenaExpansionMetrics, keyTakeaways, totalPeers } = analysis;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Executive Coaching Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#FFD4BC] text-[#300266] text-xs font-bold uppercase tracking-widest mb-2 border border-[#FFA524]/40">
              <Sparkles className="w-3.5 h-3.5 text-[#801ED7]" />
              <span>Executive Development Strategy</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#300266] tracking-tight">
              Expanding the Arena: Executive Coaching Debrief
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1.5 max-w-3xl leading-relaxed">
              In the Johari Window leadership model, executive effectiveness scales with the size of the <span className="font-semibold text-[#300266]">Open Arena</span>. When self-awareness and peer perception align, interpersonal friction drops and enterprise velocity accelerates.
            </p>
          </div>

          {/* Core Recommended Action */}
          <div className="bg-[#300266] text-white p-5 rounded-2xl border border-[#46098c] max-w-md shrink-0 shadow-lg">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#FFA524] mb-1">
              Priority Coaching Recommendation
            </div>
            <p className="text-xs text-[#C9C4FF] font-medium leading-relaxed">
              "{keyTakeaways.recommendedAction}"
            </p>
          </div>
        </div>
      </div>

      {/* The 2 Core Arena Expansion Levers (Feedback & Disclosure) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Lever 1: Feedback Solicitation (Shrinks Blind Spot) */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#C9C4FF]/40 border border-[#801ED7]/30 text-[#801ED7] flex items-center justify-center font-bold">
                <Eye className="w-5 h-5 text-[#801ED7]" />
              </div>
              <div>
                <h3 className="font-extrabold text-[#300266] text-lg">
                  1. Solicit Feedback (Shrink the Blind Spot)
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  Moves traits from Quadrant 2 (Blind Spot) into Quadrant 1 (Arena)
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 mb-4 leading-relaxed">
              Your peers have highlighted attributes in you that you do not consciously claim in your self-image. Acknowledging and cultivating these creates powerful leverage.
            </p>

            {/* Blind Spot Traits to Inquire About */}
            <div className="mb-4">
              <div className="text-xs font-bold uppercase text-[#300266] mb-2">
                Top Observed Peer Traits ({quadrants.blindSpot.length}):
              </div>
              {quadrants.blindSpot.length === 0 ? (
                <p className="text-xs text-gray-400 italic">
                  No blind spot traits detected yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {quadrants.blindSpot.slice(0, 3).map((trait) => {
                    const stat = adjectiveStats[trait];
                    const obj = getJohariAdjective(trait);
                    return (
                      <div
                        key={trait}
                        className="p-3 bg-[#FAFAFD] rounded-xl border border-gray-200 flex items-start justify-between"
                      >
                        <div>
                          <div className="font-bold text-xs text-[#300266] flex items-center gap-2">
                            <span>{trait}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C9C4FF] text-[#300266] font-bold">
                              {stat?.peerCount} peer {stat?.peerCount === 1 ? 'vote' : 'votes'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{obj?.leadershipContext}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <div className="text-xs font-bold text-[#300266] mb-1">Executive Action:</div>
            <p className="text-xs text-gray-600">
              In your next 1-on-1s, ask: <em>"In what recent leadership moments did you see me demonstrate these qualities, and how can I bring more of that to our strategic goals?"</em>
            </p>
          </div>
        </div>

        {/* Lever 2: Intentional Disclosure (Shrinks Façade) */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#F8D3E8] border border-[#FFA4FB] text-[#91186E] flex items-center justify-center font-bold">
                <Lock className="w-5 h-5 text-[#91186E]" />
              </div>
              <div>
                <h3 className="font-extrabold text-[#300266] text-lg">
                  2. Intentional Disclosure (Shrink the Façade)
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  Moves traits from Quadrant 3 (Façade) into Quadrant 1 (Arena)
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 mb-4 leading-relaxed">
              These are qualities you identify with internally, but your colleagues have not yet witnessed in practice. Expand your leadership impact by visibly demonstrating these values.
            </p>

            {/* Façade Traits */}
            <div className="mb-4">
              <div className="text-xs font-bold uppercase text-[#300266] mb-2">
                Self-Perceived Traits Not Yet Validated by Peers ({quadrants.facade.length}):
              </div>
              {quadrants.facade.length === 0 ? (
                <p className="text-xs text-gray-400 italic">
                  High transparency! All of your self-selected attributes were affirmed by peers.
                </p>
              ) : (
                <div className="space-y-2">
                  {quadrants.facade.slice(0, 3).map((trait) => {
                    const obj = getJohariAdjective(trait);
                    return (
                      <div
                        key={trait}
                        className="p-3 bg-[#FAFAFD] rounded-xl border border-gray-200 flex items-start justify-between"
                      >
                        <div>
                          <div className="font-bold text-xs text-[#300266] flex items-center gap-2">
                            <span>{trait}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F8D3E8] text-[#91186E] font-bold">
                              Self-Identified
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{obj?.leadershipContext}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <div className="text-xs font-bold text-[#300266] mb-1">Executive Action:</div>
            <p className="text-xs text-gray-600">
              Increase intentional transparency. Share your reasoning, thought processes, and leadership intentions earlier in projects to make these qualities observable.
            </p>
          </div>
        </div>
      </div>

      {/* 30-60-90 Day Leadership Growth Plan */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#801ED7] text-white flex items-center justify-center font-bold shadow-xs">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-[#300266] text-xl">
              30-60-90 Day Leadership Action Plan
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              Structured developmental roadmap tailored to {session.leaderName}'s assessment results.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 30 Days */}
          <div className="p-5 rounded-2xl bg-[#FAFAFD] border border-gray-200 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#300266] text-white text-xs font-bold uppercase tracking-wider mb-3">
                <span>Days 1 – 30</span>
              </div>
              <h4 className="font-bold text-[#300266] text-sm mb-2">
                Deepen Awareness & Validate Blind Spots
              </h4>
              <ul className="text-xs text-gray-600 space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Schedule 15-minute debriefs with key peers to explore attributes in your Blind Spot ({quadrants.blindSpot.slice(0, 2).join(', ') || 'observed traits'}).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Anchor daily decision-making in your verified Arena signature strengths ({quadrants.arena.slice(0, 2).join(', ') || 'core strengths'}).
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* 60 Days */}
          <div className="p-5 rounded-2xl bg-[#FAFAFD] border border-gray-200 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFA524] text-[#300266] text-xs font-bold uppercase tracking-wider mb-3">
                <span>Days 31 – 60</span>
              </div>
              <h4 className="font-bold text-[#300266] text-sm mb-2">
                Intentional Disclosure & Alignment
              </h4>
              <ul className="text-xs text-gray-600 space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#801ED7] shrink-0 mt-0.5" />
                  <span>
                    Vocalize strategic intent and personal values in town halls or sprint retrospectives to pull hidden Façade traits into the Open Arena.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#801ED7] shrink-0 mt-0.5" />
                  <span>
                    Establish continuous pulse check-ins with direct reports regarding psychological safety and empowerment.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* 90 Days */}
          <div className="p-5 rounded-2xl bg-[#FAFAFD] border border-gray-200 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#91186E] text-white text-xs font-bold uppercase tracking-wider mb-3">
                <span>Days 61 – 90</span>
              </div>
              <h4 className="font-bold text-[#300266] text-sm mb-2">
                Unlocking the Unknown
              </h4>
              <ul className="text-xs text-gray-600 space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Take on cross-functional stretch mandates that require dormant competencies from the Unknown quadrant.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Re-run the Johari Window 360° Assessment to measure expansion of the Open Arena over time.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
