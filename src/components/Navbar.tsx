import React, { useState } from 'react';
import { UserSession } from '../types/johari';
import { 
  Compass, 
  BookOpen, 
  Download, 
  PlusCircle, 
  Users, 
  UserCheck, 
  LayoutGrid, 
  BarChart3, 
  Sparkles,
  Share2,
  Link,
  Check
} from 'lucide-react';
import { sessionStore } from '../utils/sessionStore';

interface NavbarProps {
  currentSession: UserSession;
  activeTab: 'matrix' | 'self' | 'competencies' | 'insights' | 'dictionary';
  setActiveTab: (tab: 'matrix' | 'self' | 'competencies' | 'insights' | 'dictionary') => void;
  peerCount: number;
  selfCount: number;
  onOpenDictionary: () => void;
  onOpenExport: () => void;
  onOpenInvitePeers: () => void;
  onOpenNewSession: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentSession,
  activeTab,
  setActiveTab,
  peerCount,
  selfCount,
  onOpenDictionary,
  onOpenExport,
  onOpenInvitePeers,
  onOpenNewSession,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyDashboardLink = () => {
    const url = sessionStore.getLeaderDashboardUrl(currentSession.id);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#300266] border-b border-[#46098c] shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setActiveTab('matrix')}
          >
            <div className="w-8 h-8 rounded-lg bg-[#FFA524] flex items-center justify-center font-bold text-[#300266] text-sm shadow-md shadow-[#FFA524]/20">
              <Compass className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl font-extrabold tracking-tight text-white flex items-center">
                LEADERSHIP<span className="text-[#FFA524]">PULSE</span>
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-[#46098c] text-[#C9C4FF] border border-[#801ED7]/50">
                JOHARI 360°
              </span>
            </div>
          </div>

          {/* Quick Tools & Leader Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Invite Peers CTA Button */}
            <button
              id="navbar-invite-peers-btn"
              onClick={onOpenInvitePeers}
              title="Invite your peers to assess you"
              className="px-3 sm:px-3.5 py-1.5 rounded-lg bg-[#FFA524] hover:bg-[#E9371F] text-[#300266] hover:text-white shadow-md shadow-[#FFA524]/20 transition flex items-center gap-1.5 text-xs font-extrabold cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Invite Peers</span>
              <span className="px-1.5 py-0.2 rounded bg-[#300266]/20 text-[10px] font-black">
                {peerCount}
              </span>
            </button>

            {/* Copy / Save My Dashboard Link */}
            <button
              id="navbar-copy-dashboard-link-btn"
              onClick={handleCopyDashboardLink}
              title="Save or copy your private dashboard link to return anytime"
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#46098c] hover:bg-[#801ED7] text-[#C9C4FF] hover:text-white border border-[#801ED7]/50 transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#FFA4FB]" />
                  <span className="text-[#FFA4FB] font-bold hidden sm:inline">Link Copied!</span>
                </>
              ) : (
                <>
                  <Link className="w-3.5 h-3.5 text-[#C9C4FF]" />
                  <span className="hidden sm:inline">Copy My Link</span>
                </>
              )}
            </button>

            {/* Glossary Tab Button */}
            <button
              id="open-dictionary-btn"
              onClick={() => setActiveTab('dictionary')}
              title="55 Adjectives & Competency Index"
              className={`px-3 py-1.5 rounded-lg transition text-xs font-semibold hidden lg:flex items-center gap-1.5 border cursor-pointer ${
                activeTab === 'dictionary'
                  ? 'bg-[#FFA524] text-[#300266] border-[#FFA524] font-bold'
                  : 'bg-[#46098c] hover:bg-[#801ED7] text-[#C9C4FF] hover:text-white border-[#801ED7]/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Glossary</span>
            </button>

            {/* Export Report */}
            <button
              id="export-report-btn"
              onClick={onOpenExport}
              title="Export Leadership Report"
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#46098c] hover:bg-[#801ED7] text-[#C9C4FF] hover:text-white border border-[#801ED7]/50 transition text-xs font-semibold hidden md:flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#C9C4FF]" />
              <span>Export</span>
            </button>

            {/* Private Leader Profile Badge */}
            <div className="pl-2 sm:pl-3 border-l border-[#46098c] flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white tracking-wide uppercase truncate max-w-[120px]">
                  {currentSession.leaderName}
                </p>
                <p className="text-[10px] text-[#C9C4FF] truncate max-w-[120px]">
                  {currentSession.leaderTitle || 'Leader'}
                </p>
              </div>
              <div
                title={`${currentSession.leaderName} (Session: ${currentSession.id})`}
                className="w-8 h-8 rounded-full bg-[#46098c] border-2 border-[#FFA524] flex items-center justify-center font-bold text-xs text-white shrink-0"
              >
                {currentSession.leaderName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase() || 'L'}
              </div>
            </div>

            {/* Start New Private Assessment Button */}
            <button
              id="btn-new-assessment-nav"
              onClick={onOpenNewSession}
              title="Start a new assessment or switch profile"
              className="px-3 py-1.5 rounded-lg bg-[#FFA524] hover:bg-[#E9371F] text-[#300266] hover:text-white transition text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#FFA524]/20"
            >
              <span>+ New Assessment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Underline Navigation Tabs */}
      <div className="bg-[#24014d] border-t border-[#46098c]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-3 sm:gap-6 text-sm font-medium overflow-x-auto py-2.5 scrollbar-none">
            <button
              id="tab-matrix-btn"
              onClick={() => setActiveTab('matrix')}
              className={`flex items-center gap-1.5 sm:gap-2 text-xs font-bold transition-colors whitespace-nowrap pb-1 cursor-pointer ${
                activeTab === 'matrix'
                  ? 'text-[#FFA524] border-b-2 border-[#FFA524]'
                  : 'text-[#C9C4FF] hover:text-white border-b-2 border-transparent'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Johari Window</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                activeTab === 'matrix' ? 'bg-[#FFA524] text-[#300266] font-extrabold' : 'bg-[#46098c] text-[#C9C4FF]'
              }`}>
                {peerCount}
              </span>
            </button>

            <button
              id="tab-competencies-btn"
              onClick={() => setActiveTab('competencies')}
              className={`flex items-center gap-1.5 sm:gap-2 text-xs font-bold transition-colors whitespace-nowrap pb-1 cursor-pointer ${
                activeTab === 'competencies'
                  ? 'text-[#FFA524] border-b-2 border-[#FFA524]'
                  : 'text-[#C9C4FF] hover:text-white border-b-2 border-transparent'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Competency Map</span>
            </button>

            <button
              id="tab-insights-btn"
              onClick={() => setActiveTab('insights')}
              className={`flex items-center gap-1.5 sm:gap-2 text-xs font-bold transition-colors whitespace-nowrap pb-1 cursor-pointer ${
                activeTab === 'insights'
                  ? 'text-[#FFA524] border-b-2 border-[#FFA524]'
                  : 'text-[#C9C4FF] hover:text-white border-b-2 border-transparent'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FFA4FB]" />
              <span>Executive Coaching</span>
            </button>

            <button
              id="tab-dictionary-page-btn"
              onClick={() => setActiveTab('dictionary')}
              className={`flex items-center gap-1.5 sm:gap-2 text-xs font-bold transition-colors whitespace-nowrap pb-1 cursor-pointer ${
                activeTab === 'dictionary'
                  ? 'text-[#FFA524] border-b-2 border-[#FFA524]'
                  : 'text-[#C9C4FF] hover:text-white border-b-2 border-transparent'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Glossary</span>
            </button>

            <button
              id="tab-self-btn"
              onClick={() => setActiveTab('self')}
              className={`flex items-center gap-1.5 sm:gap-2 text-xs font-bold transition-colors whitespace-nowrap pb-1 ml-auto cursor-pointer ${
                activeTab === 'self'
                  ? 'text-[#FFA524] border-b-2 border-[#FFA524]'
                  : 'text-[#C9C4FF] hover:text-white border-b-2 border-transparent'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Self-Selection</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                activeTab === 'self' ? 'bg-[#FFA524] text-[#300266] font-extrabold' : 'bg-[#46098c] text-[#C9C4FF]'
              }`}>
                {selfCount}/6
              </span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
