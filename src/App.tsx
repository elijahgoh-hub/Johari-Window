import React, { useState, useEffect, useCallback } from 'react';
import { UserSession, AdjectiveSelection } from './types/johari';
import { calculateJohariResults } from './utils/johariCalculator';
import { sessionStore, StoredSessionData } from './utils/sessionStore';
import { Navbar } from './components/Navbar';
import { StartAssessmentView } from './components/StartAssessmentView';
import { SelfSelectionView } from './components/SelfSelectionView';
import { AnonymousPeerReviewPage } from './components/AnonymousPeerReviewPage';
import { JohariGridDisplay } from './components/JohariGridDisplay';
import { CompetencyBreakdownView } from './components/CompetencyBreakdownView';
import { LeadershipInsightsView } from './components/LeadershipInsightsView';
import { AdjectiveDictionaryView } from './components/AdjectiveDictionaryView';
import { AdjectiveDictionaryModal } from './components/AdjectiveDictionaryModal';
import { ExportSummaryModal } from './components/ExportSummaryModal';
import { InvitePeersModal } from './components/InvitePeersModal';

export default function App() {
  // Read initial URL params
  const getUrlParams = () => {
    if (typeof window === 'undefined') return { sessionId: null, mode: null, view: null, leader: null, title: null };
    const params = new URLSearchParams(window.location.search);
    return {
      sessionId: params.get('session'),
      mode: params.get('mode'), // 'peer'
      view: params.get('view') as 'matrix' | 'self' | 'competencies' | 'insights' | 'dictionary' | 'start' | null,
      leader: params.get('leader') || params.get('name'),
      title: params.get('title'),
    };
  };

  const initialParams = getUrlParams();

  // Session state
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    if (initialParams.sessionId) return initialParams.sessionId;
    return sessionStore.getActiveSessionId();
  });

  const [sessionData, setSessionData] = useState<StoredSessionData | null>(() => {
    const id = initialParams.sessionId || sessionStore.getActiveSessionId();
    if (id) {
      return sessionStore.getSessionData(id);
    }
    return null;
  });

  // Peer review mode vs Leader mode
  const [isPeerMode, setIsPeerMode] = useState<boolean>(initialParams.mode === 'peer');

  // Active navigation tab (including full-page dictionary)
  const [activeTab, setActiveTab] = useState<'matrix' | 'self' | 'competencies' | 'insights' | 'dictionary'>(() => {
    if (initialParams.view && ['matrix', 'self', 'competencies', 'insights', 'dictionary'].includes(initialParams.view)) {
      return initialParams.view as any;
    }
    // If self selection is empty, prompt self selection
    if (sessionData && (!sessionData.selfSelection || sessionData.selfSelection.selectedAdjectives.length === 0)) {
      return 'self';
    }
    return 'matrix';
  });

  // Modals
  const [isInvitePeersOpen, setIsInvitePeersOpen] = useState(false);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [showStartScreen, setShowStartScreen] = useState<boolean>(!sessionData && !initialParams.sessionId);

  // Synchronize URL changes
  const updateUrl = useCallback((sessionId: string | null, mode: string | null, view: string | null) => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (sessionId) {
      url.searchParams.set('session', sessionId);
    } else {
      url.searchParams.delete('session');
    }

    if (mode) {
      url.searchParams.set('mode', mode);
    } else {
      url.searchParams.delete('mode');
      url.searchParams.delete('leader');
      url.searchParams.delete('title');
    }

    if (view) {
      url.searchParams.set('view', view);
    } else {
      url.searchParams.delete('view');
    }

    window.history.replaceState({}, '', url.toString());
  }, []);

  // Fetch session data from server and listen to real-time updates
  useEffect(() => {
    if (!activeSessionId) {
      setSessionData(null);
      return;
    }

    let isSubscribed = true;

    // Fetch fresh from backend server on mount or when activeSessionId changes
    sessionStore.fetchSessionFromServer(activeSessionId).then((serverData) => {
      if (isSubscribed && serverData) {
        setSessionData(serverData);
      }
    });

    const unsubscribe = sessionStore.subscribeToUpdates(activeSessionId, (updatedData) => {
      if (isSubscribed) {
        setSessionData(updatedData);
      }
    });

    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, [activeSessionId]);

  // Handle URL change (back/forward or external links)
  useEffect(() => {
    const handlePopState = () => {
      const { sessionId, mode, view } = getUrlParams();
      setIsPeerMode(mode === 'peer');
      if (sessionId) {
        setActiveSessionId(sessionId);
        sessionStore.fetchSessionFromServer(sessionId).then((data) => {
          if (data) {
            setSessionData(data);
            setShowStartScreen(false);
          } else {
            const local = sessionStore.getSessionData(sessionId);
            setSessionData(local);
            setShowStartScreen(!local);
          }
        });
      } else {
        setActiveSessionId(null);
        setSessionData(null);
        setShowStartScreen(true);
      }
      if (view && ['matrix', 'self', 'competencies', 'insights', 'dictionary'].includes(view)) {
        setActiveTab(view as any);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Start new assessment flow
  const handleStartNewAssessment = (leaderName: string, leaderTitle: string) => {
    const newSessionData = sessionStore.createSession(leaderName, leaderTitle);
    setActiveSessionId(newSessionData.session.id);
    setSessionData(newSessionData);
    setIsPeerMode(false);
    setShowStartScreen(false);
    setActiveTab('self');
    updateUrl(newSessionData.session.id, null, 'self');
  };

  // Resume an existing session
  const handleResumeSession = async (sessionId: string) => {
    const serverData = await sessionStore.fetchSessionFromServer(sessionId);
    const data = serverData || sessionStore.getSessionData(sessionId);
    if (data) {
      setActiveSessionId(sessionId);
      setSessionData(data);
      sessionStore.setActiveSessionId(sessionId);
      setIsPeerMode(false);
      setShowStartScreen(false);
      const nextTab = (!data.selfSelection || data.selfSelection.selectedAdjectives.length === 0) ? 'self' : 'matrix';
      setActiveTab(nextTab);
      updateUrl(sessionId, null, nextTab);
    } else {
      // If not in database yet, create container
      const newSessionData = sessionStore.createSession('Leader', 'Executive Leader');
      setActiveSessionId(sessionId);
      setSessionData(newSessionData);
      setIsPeerMode(false);
      setShowStartScreen(false);
      setActiveTab('self');
      updateUrl(sessionId, null, 'self');
    }
  };

  // Update self-selection
  const handleUpdateSelfSelection = (updatedSelection: AdjectiveSelection) => {
    if (!activeSessionId || !sessionData) return;

    const updatedData: StoredSessionData = {
      ...sessionData,
      selfSelection: updatedSelection,
      updatedAt: Date.now(),
    };

    setSessionData(updatedData);
    sessionStore.saveSessionData(activeSessionId, updatedData);
  };

  // Submit peer review (async)
  const handlePeerReviewSubmit = async (
    peerSubmission: AdjectiveSelection, 
    leaderName?: string, 
    leaderTitle?: string
  ) => {
    const targetSessionId = activeSessionId || initialParams.sessionId || 'active_session';
    await sessionStore.addPeerReview(targetSessionId, peerSubmission, leaderName, leaderTitle);
    const updated = await sessionStore.fetchSessionFromServer(targetSessionId);
    if (updated) {
      setSessionData(updated);
    }
  };

  // Switch tabs
  const handleTabChange = (tab: 'matrix' | 'self' | 'competencies' | 'insights' | 'dictionary') => {
    setActiveTab(tab);
    if (activeSessionId) {
      updateUrl(activeSessionId, null, tab);
    }
  };

  // Create new session button / Reset to start view
  const handleResetToStart = () => {
    sessionStore.clearActiveSessionId();
    setActiveSessionId(null);
    setSessionData(null);
    setShowStartScreen(true);
    setIsPeerMode(false);
    updateUrl(null, null, null);
  };

  // 1. Peer Feedback Mode View (Strictly Anonymous, with optional Dictionary Page Toggle)
  if (isPeerMode) {
    const currentParams = getUrlParams();
    const leaderName = sessionData?.session.leaderName || currentParams.leader || 'Your Colleague';
    const leaderTitle = sessionData?.session.leaderTitle || currentParams.title || 'Executive Leader';

    return (
      <AnonymousPeerReviewPage
        leaderName={leaderName}
        leaderTitle={leaderTitle}
        onSubmit={async (sub) => {
          await handlePeerReviewSubmit(sub, leaderName, leaderTitle);
        }}
      />
    );
  }

  // 2. Start Assessment Screen (If no session exists or user clicked New Assessment)
  if (showStartScreen || !sessionData) {
    return (
      <div className="min-h-screen bg-[#FAFAFD] text-[#300266] font-sans selection:bg-[#FFA524] selection:text-[#300266]">
        <header className="px-6 py-4 bg-[#300266] text-white border-b border-[#46098c] flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#FFA524] rounded-lg flex items-center justify-center font-bold text-[#300266] text-sm">
              J
            </div>
            <span className="font-extrabold tracking-tight text-white text-base">
              LEADERSHIP<span className="text-[#FFA524]">PULSE</span>
            </span>
          </div>

          <span className="text-[11px] font-bold text-[#C9C4FF] uppercase tracking-wider">
            Private 360° Johari Platform
          </span>
        </header>

        <main>
          <StartAssessmentView 
            onStart={handleStartNewAssessment} 
            onResumeSession={handleResumeSession}
          />
        </main>
      </div>
    );
  }

  // Calculate 4-Quadrant Johari Results
  const selfSelection = sessionData.selfSelection || {
    userId: `self-${sessionData.session.id}`,
    source: 'self',
    selectedAdjectives: [],
  };
  const peerSelections = sessionData.peerSelections || [];
  const analysis = calculateJohariResults(selfSelection, peerSelections);

  return (
    <div className="min-h-screen bg-[#FAFAFD] text-[#300266] flex flex-col font-sans selection:bg-[#FFA524] selection:text-[#300266]">
      {/* Top Navbar */}
      <Navbar
        currentSession={sessionData.session}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        peerCount={peerSelections.length}
        selfCount={(selfSelection.selectedAdjectives || []).length}
        onOpenDictionary={() => handleTabChange('dictionary')}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenInvitePeers={() => setIsInvitePeersOpen(true)}
        onOpenNewSession={handleResetToStart}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'matrix' && (
          <JohariGridDisplay
            session={sessionData.session}
            analysis={analysis}
            onSelectTab={handleTabChange}
            onOpenInvitePeers={() => setIsInvitePeersOpen(true)}
          />
        )}

        {activeTab === 'self' && (
          <SelfSelectionView
            leaderName={sessionData.session.leaderName}
            selfSelection={selfSelection}
            onUpdateSelfSelection={handleUpdateSelfSelection}
            onProceedToMatrix={() => handleTabChange('matrix')}
            onProceedToPeers={() => setIsInvitePeersOpen(true)}
            onOpenDictionary={() => handleTabChange('dictionary')}
          />
        )}

        {activeTab === 'competencies' && (
          <CompetencyBreakdownView
            analysis={analysis}
            leaderName={sessionData.session.leaderName}
          />
        )}

        {activeTab === 'insights' && (
          <LeadershipInsightsView
            session={sessionData.session}
            analysis={analysis}
            onSelectTab={handleTabChange}
          />
        )}

        {activeTab === 'dictionary' && (
          <AdjectiveDictionaryView
            onBack={() => handleTabChange('matrix')}
            selectedAdjectives={selfSelection.selectedAdjectives || []}
            onToggleAdjective={(adjName) => {
              const current = selfSelection.selectedAdjectives || [];
              let updated: string[];
              if (current.includes(adjName)) {
                updated = current.filter((a) => a !== adjName);
              } else {
                if (current.length >= 6) return;
                updated = [...current, adjName];
              }
              handleUpdateSelfSelection({
                ...selfSelection,
                selectedAdjectives: updated,
              });
            }}
            isSelectable={true}
            maxSelections={6}
            contextMode="leader"
            evaluatedName={sessionData.session.leaderName}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-8 py-3.5 bg-[#300266] text-[#C9C4FF] flex flex-col sm:flex-row justify-between items-center text-[10px] gap-2 border-t border-[#46098c] mt-auto">
        <div className="flex items-center gap-2 sm:gap-4 opacity-80 flex-wrap justify-center sm:justify-start">
          <span>Session: {sessionData.session.id}</span>
          <span>&bull;</span>
          <span>Leader: {sessionData.session.leaderName}</span>
          <span>&bull;</span>
          <button 
            onClick={() => handleTabChange('dictionary')}
            className="hover:text-white underline cursor-pointer"
          >
            Glossary (55 Adjectives & Competency Index)
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold tracking-wider uppercase text-[#C9C4FF]">
            {peerSelections.length} Peer Assessment{peerSelections.length === 1 ? '' : 's'} Aggregated &bull; 100% Anonymous
          </span>
        </div>
      </footer>

      {/* Modals */}
      <InvitePeersModal
        isOpen={isInvitePeersOpen}
        onClose={() => setIsInvitePeersOpen(false)}
        sessionId={sessionData.session.id}
        leaderName={sessionData.session.leaderName}
        leaderTitle={sessionData.session.leaderTitle}
        peerCount={peerSelections.length}
      />

      <AdjectiveDictionaryModal
        isOpen={isDictionaryOpen}
        onClose={() => setIsDictionaryOpen(false)}
      />

      <ExportSummaryModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        session={sessionData.session}
        analysis={analysis}
      />
    </div>
  );
}
