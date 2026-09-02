import { UserSession, AdjectiveSelection } from '../types/johari';

const SESSION_PREFIX = 'johari_session_';
const ACTIVE_SESSION_KEY = 'johari_active_session_id';

export interface StoredSessionData {
  session: UserSession;
  selfSelection: AdjectiveSelection;
  peerSelections: AdjectiveSelection[];
  updatedAt: number;
}

// Broadcast Channel for live cross-tab syncing
let syncChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    syncChannel = new BroadcastChannel('johari_sync_channel');
  }
} catch (e) {
  // Fallback
}

export const sessionStore = {
  // Generate a random clean session ID
  generateSessionId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID().slice(0, 10);
    }
    return 'johari_' + Math.random().toString(36).substring(2, 8);
  },

  // Save session to localStorage and sync to server
  saveSessionData(sessionId: string, data: StoredSessionData): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`${SESSION_PREFIX}${sessionId}`, JSON.stringify(data));
      localStorage.setItem(ACTIVE_SESSION_KEY, sessionId);

      if (syncChannel) {
        syncChannel.postMessage({ type: 'SESSION_UPDATED', sessionId, data });
      }

      // Async sync to server
      fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).catch((err) => console.warn('Server sync background notice:', err));
    } catch (e) {
      console.error('Failed to save session', e);
    }
  },

  // Get session synchronously from localStorage
  getSessionData(sessionId: string): StoredSessionData | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(`${SESSION_PREFIX}${sessionId}`);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to load session from localStorage', e);
      return null;
    }
  },

  // Fetch session from server (with localStorage fallback)
  async fetchSessionFromServer(sessionId: string): Promise<StoredSessionData | null> {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`);
      if (res.ok) {
        const serverData: StoredSessionData = await res.json();
        // Update local cache
        if (typeof window !== 'undefined' && serverData && serverData.session) {
          localStorage.setItem(`${SESSION_PREFIX}${sessionId}`, JSON.stringify(serverData));
        }
        return serverData;
      }
    } catch (err) {
      console.warn('Could not fetch session from server, using local fallback:', err);
    }
    return this.getSessionData(sessionId);
  },

  // Get active session ID
  getActiveSessionId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACTIVE_SESSION_KEY);
  },

  // Set active session ID
  setActiveSessionId(sessionId: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACTIVE_SESSION_KEY, sessionId);
  },

  // Clear active session ID
  clearActiveSessionId(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  },

  // Get all saved sessions on this device
  getAllSavedSessions(): StoredSessionData[] {
    if (typeof window === 'undefined') return [];
    try {
      const sessions: StoredSessionData[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(SESSION_PREFIX)) {
          const raw = localStorage.getItem(key);
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              if (parsed && parsed.session && parsed.session.id) {
                sessions.push(parsed);
              }
            } catch (e) {
              // skip corrupted
            }
          }
        }
      }
      return sessions.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    } catch (e) {
      return [];
    }
  },

  // Delete a session
  deleteSession(sessionId: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(`${SESSION_PREFIX}${sessionId}`);
      if (this.getActiveSessionId() === sessionId) {
        localStorage.removeItem(ACTIVE_SESSION_KEY);
      }
    } catch (e) {
      console.error('Failed to delete session', e);
    }
  },

  // Create a new session
  createSession(leaderName: string, leaderTitle: string = 'Executive Leader'): StoredSessionData {
    const sessionId = this.generateSessionId();
    const newSession: UserSession = {
      id: sessionId,
      leaderName: leaderName.trim(),
      leaderTitle: leaderTitle.trim() || 'Executive Leader',
      createdTimestamp: Date.now(),
    };

    const selfSelection: AdjectiveSelection = {
      userId: `self-${sessionId}`,
      source: 'self',
      selectedAdjectives: [],
      notes: '',
      submittedAt: Date.now(),
    };

    const data: StoredSessionData = {
      session: newSession,
      selfSelection,
      peerSelections: [],
      updatedAt: Date.now(),
    };

    this.saveSessionData(sessionId, data);
    return data;
  },

  // Add an anonymous peer review to a session (local + server sync)
  async addPeerReview(
    sessionId: string, 
    peerSubmission: AdjectiveSelection, 
    leaderName?: string, 
    leaderTitle?: string
  ): Promise<boolean> {
    // 1. Post to Server API directly
    try {
      const res = await fetch(`/api/sessions/${sessionId}/peer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          peerSubmission,
          leaderName,
          leaderTitle,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        if (result && result.session) {
          localStorage.setItem(`${SESSION_PREFIX}${sessionId}`, JSON.stringify(result.session));
          if (syncChannel) {
            syncChannel.postMessage({ type: 'SESSION_UPDATED', sessionId, data: result.session });
          }
          return true;
        }
      }
    } catch (e) {
      console.warn('Direct server peer submission notice:', e);
    }

    // 2. Local fallback if offline
    let existing = this.getSessionData(sessionId);
    if (!existing) {
      existing = {
        session: {
          id: sessionId,
          leaderName: leaderName?.trim() || 'Leader',
          leaderTitle: leaderTitle?.trim() || 'Executive Leader',
          createdTimestamp: Date.now(),
        },
        selfSelection: {
          userId: `self-${sessionId}`,
          source: 'self',
          selectedAdjectives: [],
          notes: '',
          submittedAt: Date.now(),
        },
        peerSelections: [],
        updatedAt: Date.now(),
      };
    }

    const sanitizedSubmission: AdjectiveSelection = {
      userId: `peer-${Math.random().toString(36).substring(2, 8)}`,
      source: 'peer',
      peerName: 'Anonymous Reviewer',
      peerRole: peerSubmission.peerRole || 'Peer / Colleague',
      selectedAdjectives: peerSubmission.selectedAdjectives,
      notes: peerSubmission.notes?.trim() || '',
      submittedAt: Date.now(),
    };

    existing.peerSelections.push(sanitizedSubmission);
    existing.updatedAt = Date.now();
    this.saveSessionData(sessionId, existing);
    return true;
  },

  // Get peer shareable URL with explicit leader name & title in query
  getPeerInviteUrl(sessionId: string, leaderName?: string, leaderTitle?: string): string {
    if (typeof window === 'undefined') return `/johari/${sessionId}`;
    const url = new URL(window.location.href);
    url.searchParams.set('session', sessionId);
    url.searchParams.set('mode', 'peer');
    if (leaderName) {
      url.searchParams.set('leader', leaderName.trim());
    }
    if (leaderTitle) {
      url.searchParams.set('title', leaderTitle.trim());
    }
    url.searchParams.delete('view');
    return url.toString();
  },

  // Get leader dashboard URL
  getLeaderDashboardUrl(sessionId: string): string {
    if (typeof window === 'undefined') return `/dashboard/${sessionId}`;
    const url = new URL(window.location.href);
    url.searchParams.set('session', sessionId);
    url.searchParams.delete('mode');
    url.searchParams.delete('leader');
    url.searchParams.delete('title');
    url.searchParams.set('view', 'matrix');
    return url.toString();
  },

  // Subscribe to updates across tabs and poll server periodically
  subscribeToUpdates(sessionId: string, callback: (data: StoredSessionData) => void): () => void {
    if (typeof window === 'undefined') return () => {};

    // 1. Initial fetch from server
    this.fetchSessionFromServer(sessionId).then((data) => {
      if (data) callback(data);
    });

    // 2. Storage event listener (same origin tabs)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === `${SESSION_PREFIX}${sessionId}` && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          callback(parsed);
        } catch (err) {
          // ignore
        }
      }
    };

    // 3. Broadcast channel listener
    const handleChannelMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'SESSION_UPDATED' && e.data.sessionId === sessionId) {
        callback(e.data.data);
      }
    };

    // 4. Polling interval from server every 3 seconds for instant multi-device / multi-browser updates
    const intervalId = setInterval(async () => {
      const serverData = await this.fetchSessionFromServer(sessionId);
      if (serverData) {
        callback(serverData);
      }
    }, 3000);

    // 5. On window focus, refresh immediately
    const handleFocus = () => {
      this.fetchSessionFromServer(sessionId).then((data) => {
        if (data) callback(data);
      });
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleFocus);
    if (syncChannel) {
      syncChannel.addEventListener('message', handleChannelMessage);
    }

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
      if (syncChannel) {
        syncChannel.removeEventListener('message', handleChannelMessage);
      }
    };
  },
};
