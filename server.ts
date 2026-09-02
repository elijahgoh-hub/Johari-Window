import express from 'express';
import path from 'path';
import fs from 'fs';

const PORT = 3000;
const DATA_FILE = path.join(process.cwd(), 'sessions_db.json');

// Interface for sessions stored on server
interface StoredSession {
  session: {
    id: string;
    leaderName: string;
    leaderTitle?: string;
    createdTimestamp: number;
  };
  selfSelection: {
    userId: string;
    source: 'self';
    selectedAdjectives: string[];
    notes?: string;
    submittedAt?: number;
  };
  peerSelections: Array<{
    userId: string;
    source: 'peer';
    peerName?: string;
    peerRole?: string;
    selectedAdjectives: string[];
    notes?: string;
    submittedAt?: number;
  }>;
  updatedAt: number;
}

// In-memory store with disk sync
let sessionsCache: Record<string, StoredSession> = {};

function loadSessionsFromDisk() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      sessionsCache = JSON.parse(content);
    }
  } catch (err) {
    console.error('Error loading sessions from disk:', err);
    sessionsCache = {};
  }
}

function saveSessionsToDisk() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(sessionsCache, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving sessions to disk:', err);
  }
}

loadSessionsFromDisk();

async function startServer() {
  const app = express();

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: Date.now() });
  });

  // Get session by ID
  app.get('/api/sessions/:id', (req, res) => {
    const { id } = req.params;
    const session = sessionsCache[id];
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    return res.json(session);
  });

  // Create or update full session
  app.post('/api/sessions', (req, res) => {
    const body = req.body as StoredSession;
    if (!body || !body.session || !body.session.id) {
      return res.status(400).json({ error: 'Invalid session body' });
    }

    const id = body.session.id;
    const existing = sessionsCache[id];

    sessionsCache[id] = {
      session: {
        id,
        leaderName: body.session.leaderName || existing?.session?.leaderName || 'Leader',
        leaderTitle: body.session.leaderTitle || existing?.session?.leaderTitle || 'Executive Leader',
        createdTimestamp: body.session.createdTimestamp || existing?.session?.createdTimestamp || Date.now(),
      },
      selfSelection: body.selfSelection || existing?.selfSelection || {
        userId: `self-${id}`,
        source: 'self',
        selectedAdjectives: [],
        notes: '',
        submittedAt: Date.now(),
      },
      peerSelections: body.peerSelections || existing?.peerSelections || [],
      updatedAt: Date.now(),
    };

    saveSessionsToDisk();
    return res.json(sessionsCache[id]);
  });

  // Update self-selection
  app.post('/api/sessions/:id/self', (req, res) => {
    const { id } = req.params;
    const { selfSelection, leaderName, leaderTitle } = req.body;

    let existing = sessionsCache[id];
    if (!existing) {
      existing = {
        session: {
          id,
          leaderName: leaderName || 'Leader',
          leaderTitle: leaderTitle || 'Executive Leader',
          createdTimestamp: Date.now(),
        },
        selfSelection: {
          userId: `self-${id}`,
          source: 'self',
          selectedAdjectives: [],
          notes: '',
          submittedAt: Date.now(),
        },
        peerSelections: [],
        updatedAt: Date.now(),
      };
    }

    existing.selfSelection = selfSelection;
    if (leaderName) existing.session.leaderName = leaderName;
    if (leaderTitle) existing.session.leaderTitle = leaderTitle;
    existing.updatedAt = Date.now();

    sessionsCache[id] = existing;
    saveSessionsToDisk();
    return res.json(existing);
  });

  // Submit anonymous peer review
  app.post('/api/sessions/:id/peer', (req, res) => {
    const { id } = req.params;
    const { peerSubmission, leaderName, leaderTitle } = req.body;

    if (!peerSubmission || !Array.isArray(peerSubmission.selectedAdjectives)) {
      return res.status(400).json({ error: 'Invalid peer submission' });
    }

    let existing = sessionsCache[id];
    if (!existing) {
      existing = {
        session: {
          id,
          leaderName: leaderName || 'Leader',
          leaderTitle: leaderTitle || 'Executive Leader',
          createdTimestamp: Date.now(),
        },
        selfSelection: {
          userId: `self-${id}`,
          source: 'self',
          selectedAdjectives: [],
          notes: '',
          submittedAt: Date.now(),
        },
        peerSelections: [],
        updatedAt: Date.now(),
      };
    }

    // Sanitize anonymous submission
    const sanitizedReview = {
      userId: `peer-${Math.random().toString(36).substring(2, 8)}`,
      source: 'peer' as const,
      peerName: 'Anonymous Reviewer',
      peerRole: peerSubmission.peerRole || 'Peer / Colleague',
      selectedAdjectives: peerSubmission.selectedAdjectives.slice(0, 6),
      notes: typeof peerSubmission.notes === 'string' ? peerSubmission.notes.trim() : '',
      submittedAt: Date.now(),
    };

    existing.peerSelections.push(sanitizedReview);
    existing.updatedAt = Date.now();

    sessionsCache[id] = existing;
    saveSessionsToDisk();
    console.log(`[API] Peer review added for session ${id}. Total peer reviews: ${existing.peerSelections.length}`);

    return res.json({ success: true, count: existing.peerSelections.length, session: existing });
  });

  // Vite middleware in development vs static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Leadership Pulse Server running on http://localhost:${PORT}`);
  });
}

startServer();
