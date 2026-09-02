import React, { useState, useEffect, useCallback } from 'react';
import { UserSession, AdjectiveSelection } from './types/johari';
import { calculateJohariResults } from './utils/johariCalculator';
import { sessionStore, StoredSessionData, PublicSessionInfo } from './utils/sessionStore';
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
    if (typeof window === 'undefined') return { sessionId: null, mode: null, view: null, leader: null, title: null, token: null };
    const params = new URLSearchParams(window.location.search);
    return {
      sessionId: params.get('session'),
      mode: params.get('mode'), // 'peer'
      view: params.get('view') as 'matrix' | 'self' | 'competencies' | 'insights' | 'dictionary' | 'start' | null,
      // Legacy AI Studio invite links carried the leader name in the URL.
      leader: params.get('leader') || params.get('name'),
      title: params.get('title'),
      token: params.get('token'),
    };
  };

  const initialParams = getUrlParams();

  // Opening a dashboard link registers the owner token on this device before
  // any render reads it.
  if (initialParams.sessionId && initialParams.token) {
    sessionStore.setOwnerToken(initialParams.sessionId, initialParams.token);
  }

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

  // Peer-mode metadata (leader name + response count). Peers are only ever
  // served this, never the aggregated results.
  const [peerInfo, setPeerInfo] = useState<PublicSessionInfo | null>(null);
  const [isPeerInfoLoading, setIsPeerInfoLoading] = useState<boolean>(
    initialParams.mode === 'peer'
  );

  // Error surfaces
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

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
      // Never leave an owner token pointing at no session.
      url.searchParams.delete('token');
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

  // Peer mode: fetch only the public metadata for this session
  useEffect(() => {
    if (!isPeerMode || !activeSessionId) {
      setIsPeerInfoLoading(false);
      return;
    }

    let isSubscribed = true;
    setIsPeerInfoLoading(true);

    sessionStore.fetchPublicSession(activeSessionId).then((info) => {
      if (!isSubscribed) return;
      setPeerInfo(info);
      setIsPeerInfoLoading(false);
    });

    return () => {
      isSubscribed = false;
    };
  }, [isPeerMode, activeSessionId]);

  // Leader mode: fetch full results and poll for new peer responses.
  // Both calls are no-ops unless this browser holds the owner token.
  useEffect(() => {
    if (!activeSessionId || isPeerMode) {
      if (!activeSessionId) setSessionData(null);
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
  }, [activeSessionId, isPeerMode]);

  // Handle URL change (back/forward or external links)
  useEffect(() => {
    const handlePopState = () => {
      const { sessionId, mode, view, token } = getUrlParams();
      setIsPeerMode(mode === 'peer');
      if (sessionId) {
        if (token) sessionStore.setOwnerToken(sessionId, token);
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

  // Start new assessment flow. Throws on failure so the start screen can
  // surface the error rather than silently appearing to succeed.
  const handleStartNewAssessment = async (leaderName: string, leaderTitle: string) => {
    const newSessionData = await sessionStore.createSession(leaderName, leaderTitle);
    setActiveSessionId(newSessionData.session.id);
    setSessionData(newSessionData);
    setIsPeerMode(false);
    setShowStartScreen(false);
    setActiveTab('self');
    updateUrl(newSessionData.session.id, null, 'self');
  };

  /**
   * Resume an existing session. Requires the owner token — either already on
   * this device or supplied via a pasted dashboard link.
   */
  const handleResumeSession = async (sessionId: string, ownerToken?: string) => {
    if (ownerToken) sessionStore.setOwnerToken(sessionId, ownerToken);

    const data = await sessionStore.fetchSessionFromServer(sessionId);
    if (!data) {
      setResumeError(
        sessionStore.isOwner(sessionId)
          ? 'That session could not be loaded. It may have been deleted.'
          : 'You need the full dashboard link (the one containing "token=") to reopen this session.'
      );
      return;
    }

    setResumeError(null);
    setActiveSessionId(sessionId);
    setSessionData(data);
    sessionStore.setActiveSessionId(sessionId);
    setIsPeerMode(false);
    setShowStartScreen(false);
    const nextTab = !data.selfSelection?.selectedAdjectives?.length ? 'self' : 'matrix';
    setActiveTab(nextTab);
    updateUrl(sessionId, null, nextTab);
  };

  // Update self-selection. Optimistic locally, then persisted server-side.
  const handleUpdateSelfSelection = (updatedSelection: AdjectiveSelection) => {
    if (!activeSessionId || !sessionData) return;

    setSessionData({ ...sessionData, selfSelection: updatedSelection, updatedAt: Date.now() });

    sessionStore.updateSelfSelection(activeSessionId, updatedSelection).catch((err) => {
      console.error('Failed to save self-selection:', err);
      setSaveError('Your latest change could not be saved. Check your connection.');
    });
  };

  // Submit an anonymous peer review against the session in the invite link.
  const handlePeerReviewSubmit = async (peerSubmission: AdjectiveSelection) => {
    const targetSessionId = activeSessionId || initialParams.sessionId;
    if (!targetSessionId) throw new Error('This invite link is missing its session id.');

    const { peerCount } = await sessionStore.addPeerReview(targetSessionId, peerSubmission);
    setPeerInfo((prev) => (prev ? { ...prev, peerCount } : prev));
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

  // 1. Peer Feedback Mode View (Strictly Anonymous). Served only the public
  // metadata for this session — never the aggregated results.
  if (isPeerMode) {
    if (isPeerInfoLoading) {
      return (
        <div className="min-h-screen bg-[#FAFAFD] flex items-center justify-center">
          <div className="flex items-center gap-3 text-[#300266]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFA524] animate-pulse" />
            <span className="text-sm font-bold">Loading feedback request…</span>
          </div>
        </div>
      );
    }

    // Legacy invite links carried the leader name in the URL; fall back to it.
    const leaderName = peerInfo?.leaderName || initialParams.leader;
    const leaderTitle = peerInfo?.leaderTitle || initialParams.title || 'Executive Leader';

    if (!leaderName) {
      return (
        <div className="min-h-screen bg-[#FAFAFD] flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-gray-200 shadow-xl text-center space-y-3">
            <h1 className="text-lg font-extrabold text-[#300266]">This link isn't valid</h1>
            <p className="text-sm text-gray-600">
              The feedback request may have expired or been deleted. Ask the person who
              sent it for a fresh link.
            </p>
          </div>
        </div>
      );
    }

    return (
      <AnonymousPeerReviewPage
        leaderName={leaderName}
        leaderTitle={leaderTitle}
        onSubmit={handlePeerReviewSubmit}
      />
    );
  }

  // 2. Access guard — a session is addressed but this browser has no owner
  // token, so it must not see the dashboard.
  if (activeSessionId && !sessionStore.isOwner(activeSessionId)) {
    return (
      <div className="min-h-screen bg-[#FAFAFD] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-gray-200 shadow-xl text-center space-y-4">
          <h1 className="text-lg font-extrabold text-[#300266]">Dashboard link required</h1>
          <p className="text-sm text-gray-600">
            Viewing results needs the private dashboard link — the one containing
            <code className="mx-1 px-1.5 py-0.5 rounded bg-[#FAFAFD] border border-gray-200 text-xs">token=</code>
            that you saved when you created the assessment. A peer invite link alone
            can't open it.
          </p>
          <button
            onClick={handleResetToStart}
            className="w-full py-3 px-6 rounded-xl bg-[#FFA524] hover:bg-[#E9371F] text-[#300266] hover:text-white font-extrabold text-sm transition cursor-pointer"
          >
            Back to start
          </button>
        </div>
      </div>
    );
  }

  // 3. Start Assessment Screen (If no session exists or user clicked New Assessment)
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
          {resumeError && (
            <div className="max-w-2xl mx-auto px-4 pt-6">
              <p className="text-xs font-semibold text-[#E9371F] bg-[#FFF6F0] border border-[#FFA524] rounded-xl px-4 py-3">
                {resumeError}
              </p>
            </div>
          )}
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

      {saveError && (
        <div className="fixed bottom-16 right-4 z-50 max-w-sm bg-white border border-[#FFA524] shadow-xl rounded-xl px-4 py-3 flex items-start gap-3">
          <span className="text-xs font-semibold text-[#E9371F]">{saveError}</span>
          <button
            onClick={() => setSaveError(null)}
            className="text-xs font-bold text-gray-400 hover:text-[#300266] cursor-pointer"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

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
