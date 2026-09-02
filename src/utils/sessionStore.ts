import { UserSession, AdjectiveSelection } from '../types/johari';

/**
 * Client-side session access.
 *
 * All persistence lives in MongoDB behind /api. localStorage is used only as
 * a convenience cache and to remember which sessions *this* browser owns.
 *
 * SECURITY MODEL — capability URLs, no login:
 *   Peer invite link      ?session=<id>&mode=peer          → submit only
 *   Leader dashboard link ?session=<id>&token=<ownerToken>  → read results, edit, delete
 * Holding the peer link does not let you view results, and only the owner
 * token can modify a session.
 */

const SESSION_PREFIX = 'johari_session_';
const OWNER_TOKEN_PREFIX = 'johari_owner_';
const ACTIVE_SESSION_KEY = 'johari_active_session_id';
const POLL_INTERVAL_MS = 10000;

export interface StoredSessionData {
  session: UserSession;
  selfSelection: AdjectiveSelection;
  peerSelections: AdjectiveSelection[];
  updatedAt: number;
}

/** Metadata visible to a peer holding the invite link. */
export interface PublicSessionInfo {
  id: string;
  leaderName: string;
  leaderTitle: string;
  peerCount: number;
}

interface ApiSession {
  id: string;
  leaderName: string;
  leaderTitle: string;
  peerCount: number;
  createdAt: number;
  selfSelection?: AdjectiveSelection;
  peerSelections?: AdjectiveSelection[];
  updatedAt?: number;
}

const hasWindow = () => typeof window !== 'undefined';

// Live cross-tab syncing
let syncChannel: BroadcastChannel | null = null;
try {
  if (hasWindow() && 'BroadcastChannel' in window) {
    syncChannel = new BroadcastChannel('johari_sync_channel');
  }
} catch {
  syncChannel = null;
}

function toStored(api: ApiSession): StoredSessionData {
  return {
    session: {
      id: api.id,
      leaderName: api.leaderName,
      leaderTitle: api.leaderTitle,
      createdTimestamp: api.createdAt,
    },
    selfSelection:
      api.selfSelection ?? {
        userId: `self-${api.id}`,
        source: 'self',
        selectedAdjectives: [],
        notes: '',
      },
    peerSelections: api.peerSelections ?? [],
    updatedAt: api.updatedAt ?? api.createdAt,
  };
}

async function request<T>(
  path: string,
  init: RequestInit & { ownerToken?: string } = {}
): Promise<T> {
  const { ownerToken: token, headers, ...rest } = init;

  const res = await fetch(path, {
    ...rest,
    headers: {
      ...(rest.body ? { 'Content-Type': 'application/json' } : {}),
      // Sent as a header rather than a query param so the token stays out of
      // server access logs.
      ...(token ? { 'x-owner-token': token } : {}),
      ...headers,
    },
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // non-JSON error body
    }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

export const sessionStore = {
  // -------------------------------------------------------- owner tokens

  /** The owner token for a session, from the URL if present, else localStorage. */
  getOwnerToken(sessionId: string): string | null {
    if (!hasWindow()) return null;

    const fromUrl = new URLSearchParams(window.location.search).get('token');
    const active = new URLSearchParams(window.location.search).get('session');
    if (fromUrl && active === sessionId) {
      // Opening the dashboard link on a new device registers ownership here.
      this.setOwnerToken(sessionId, fromUrl);
      return fromUrl;
    }

    return localStorage.getItem(`${OWNER_TOKEN_PREFIX}${sessionId}`);
  },

  setOwnerToken(sessionId: string, token: string): void {
    if (!hasWindow()) return;
    localStorage.setItem(`${OWNER_TOKEN_PREFIX}${sessionId}`, token);
  },

  /** True when this browser holds the owner token — i.e. can see the dashboard. */
  isOwner(sessionId: string): boolean {
    return !!this.getOwnerToken(sessionId);
  },

  // -------------------------------------------------------- local cache

  getSessionData(sessionId: string): StoredSessionData | null {
    if (!hasWindow()) return null;
    try {
      const raw = localStorage.getItem(`${SESSION_PREFIX}${sessionId}`);
      return raw ? (JSON.parse(raw) as StoredSessionData) : null;
    } catch {
      return null;
    }
  },

  cacheSessionData(sessionId: string, data: StoredSessionData): void {
    if (!hasWindow()) return;
    try {
      localStorage.setItem(`${SESSION_PREFIX}${sessionId}`, JSON.stringify(data));
      syncChannel?.postMessage({ type: 'SESSION_UPDATED', sessionId, data });
    } catch {
      // storage full or unavailable — the server remains the source of truth
    }
  },

  getActiveSessionId(): string | null {
    return hasWindow() ? localStorage.getItem(ACTIVE_SESSION_KEY) : null;
  },

  setActiveSessionId(sessionId: string): void {
    if (hasWindow()) localStorage.setItem(ACTIVE_SESSION_KEY, sessionId);
  },

  clearActiveSessionId(): void {
    if (hasWindow()) localStorage.removeItem(ACTIVE_SESSION_KEY);
  },

  /** Sessions this browser owns, newest first. */
  getAllSavedSessions(): StoredSessionData[] {
    if (!hasWindow()) return [];
    const out: StoredSessionData[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(SESSION_PREFIX)) continue;
      try {
        const parsed = JSON.parse(localStorage.getItem(key) || '');
        if (parsed?.session?.id && this.isOwner(parsed.session.id)) out.push(parsed);
      } catch {
        // skip corrupted entry
      }
    }
    return out.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  },

  // -------------------------------------------------------- reads

  /** Full results. Requires the owner token; returns null if this browser lacks it. */
  async fetchSessionFromServer(sessionId: string): Promise<StoredSessionData | null> {
    const token = this.getOwnerToken(sessionId);
    if (!token) return null;

    try {
      const api = await request<ApiSession>(`/api/sessions/${encodeURIComponent(sessionId)}`, {
        ownerToken: token,
      });
      const data = toStored(api);
      this.cacheSessionData(sessionId, data);
      return data;
    } catch (err) {
      console.warn('Could not load session from server:', err);
      return this.getSessionData(sessionId);
    }
  },

  /** Leader name and response count only — what a peer is allowed to see. */
  async fetchPublicSession(sessionId: string): Promise<PublicSessionInfo | null> {
    try {
      const api = await request<ApiSession>(`/api/sessions/${encodeURIComponent(sessionId)}`);
      return {
        id: api.id,
        leaderName: api.leaderName,
        leaderTitle: api.leaderTitle,
        peerCount: api.peerCount,
      };
    } catch {
      return null;
    }
  },

  // -------------------------------------------------------- writes

  /** Creates a session server-side and stores the returned owner token. */
  async createSession(
    leaderName: string,
    leaderTitle: string = 'Executive Leader'
  ): Promise<StoredSessionData> {
    const result = await request<{
      sessionId: string;
      ownerToken: string;
      session: ApiSession;
    }>('/api/sessions', {
      method: 'POST',
      body: JSON.stringify({ leaderName, leaderTitle }),
    });

    this.setOwnerToken(result.sessionId, result.ownerToken);
    this.setActiveSessionId(result.sessionId);

    const data = toStored(result.session);
    this.cacheSessionData(result.sessionId, data);
    return data;
  },

  /**
   * Saves the leader's own selection. Owner only.
   *
   * Only the self-selection is sent — peer feedback is never part of the
   * payload, so a stale tab cannot overwrite collected responses.
   */
  async updateSelfSelection(
    sessionId: string,
    selection: AdjectiveSelection
  ): Promise<StoredSessionData> {
    const token = this.getOwnerToken(sessionId);
    if (!token) throw new Error('You do not have permission to edit this session');

    const api = await request<ApiSession>(
      `/api/sessions/${encodeURIComponent(sessionId)}/self`,
      {
        method: 'PUT',
        ownerToken: token,
        body: JSON.stringify({
          selectedAdjectives: selection.selectedAdjectives,
          notes: selection.notes,
        }),
      }
    );

    const data = toStored(api);
    this.cacheSessionData(sessionId, data);
    return data;
  },

  /** Submits an anonymous peer review. Needs only the session id. */
  async addPeerReview(
    sessionId: string,
    peerSubmission: AdjectiveSelection
  ): Promise<{ peerCount: number }> {
    return request<{ peerCount: number }>(
      `/api/sessions/${encodeURIComponent(sessionId)}/peer`,
      {
        method: 'POST',
        body: JSON.stringify({
          selectedAdjectives: peerSubmission.selectedAdjectives,
          peerRole: peerSubmission.peerRole,
          notes: peerSubmission.notes,
        }),
      }
    );
  },

  /** Deletes the session on the server. Owner only. */
  async deleteSession(sessionId: string): Promise<void> {
    const token = this.getOwnerToken(sessionId);

    if (token) {
      try {
        await request(`/api/sessions/${encodeURIComponent(sessionId)}`, {
          method: 'DELETE',
          ownerToken: token,
        });
      } catch (err) {
        console.warn('Server delete failed:', err);
      }
    }

    if (!hasWindow()) return;
    localStorage.removeItem(`${SESSION_PREFIX}${sessionId}`);
    localStorage.removeItem(`${OWNER_TOKEN_PREFIX}${sessionId}`);
    if (this.getActiveSessionId() === sessionId) this.clearActiveSessionId();
  },

  // -------------------------------------------------------- links

  /**
   * Peer invite link. Carries the session id only — no owner token, so a peer
   * cannot switch to the dashboard view and read results.
   */
  getPeerInviteUrl(sessionId: string): string {
    if (!hasWindow()) return `/?session=${sessionId}&mode=peer`;
    const url = new URL(window.location.href);
    url.search = '';
    url.searchParams.set('session', sessionId);
    url.searchParams.set('mode', 'peer');
    return url.toString();
  },

  /** Leader dashboard link. Contains the owner token — treat it as a password. */
  getLeaderDashboardUrl(sessionId: string): string {
    const token = this.getOwnerToken(sessionId);
    if (!hasWindow()) return `/?session=${sessionId}`;
    const url = new URL(window.location.href);
    url.search = '';
    url.searchParams.set('session', sessionId);
    if (token) url.searchParams.set('token', token);
    url.searchParams.set('view', 'matrix');
    return url.toString();
  },

  // -------------------------------------------------------- live updates

  /** Polls the server for new peer responses and syncs across tabs. */
  subscribeToUpdates(
    sessionId: string,
    callback: (data: StoredSessionData) => void
  ): () => void {
    if (!hasWindow() || !this.isOwner(sessionId)) return () => {};

    let stopped = false;

    const refresh = async () => {
      if (stopped || document.visibilityState === 'hidden') return;
      const data = await this.fetchSessionFromServer(sessionId);
      if (data && !stopped) callback(data);
    };

    refresh();
    const intervalId = setInterval(refresh, POLL_INTERVAL_MS);

    const handleChannelMessage = (e: MessageEvent) => {
      if (e.data?.type === 'SESSION_UPDATED' && e.data.sessionId === sessionId) {
        callback(e.data.data);
      }
    };

    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    syncChannel?.addEventListener('message', handleChannelMessage);

    return () => {
      stopped = true;
      clearInterval(intervalId);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
      syncChannel?.removeEventListener('message', handleChannelMessage);
    };
  },
};
