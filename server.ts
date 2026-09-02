import 'dotenv/config';
import express, { type Response } from 'express';
import path from 'path';
import {
  addPeerReview,
  createSession,
  deleteSession,
  getFullSession,
  getPublicSession,
  updateSelfSelection,
  type Result,
} from './lib/sessionService';

/**
 * Local development server only. Production runs on Vercel serverless
 * functions in /api.
 *
 * Both paths call the same functions in lib/sessionService.ts, so behaviour
 * here matches what ships. Requires MONGODB_URI in a local .env file.
 */

const PORT = Number(process.env.PORT) || 3000;

function send<T>(res: Response, result: Result<T>, successStatus = 200) {
  if (result.ok) {
    res.status(successStatus).json(result.data);
  } else {
    res.status(result.status).json({ error: result.error });
  }
}

/** Owner token from header, falling back to a query param. */
function ownerToken(req: express.Request): string | undefined {
  const header = req.header('x-owner-token');
  if (header) return header;
  return typeof req.query.token === 'string' ? req.query.token : undefined;
}

async function startServer() {
  if (!process.env.MONGODB_URI) {
    console.error('\n  MONGODB_URI is not set. Copy .env.example to .env and fill it in.\n');
    process.exit(1);
  }

  const app = express();
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: Date.now() });
  });

  app.post('/api/sessions', async (req, res) => {
    send(res, await createSession(req.body ?? {}), 201);
  });

  app.get('/api/sessions/:id', async (req, res) => {
    const token = ownerToken(req);
    send(
      res,
      token
        ? await getFullSession(req.params.id, token)
        : await getPublicSession(req.params.id)
    );
  });

  app.delete('/api/sessions/:id', async (req, res) => {
    send(res, await deleteSession(req.params.id, ownerToken(req)));
  });

  app.put('/api/sessions/:id/self', async (req, res) => {
    send(res, await updateSelfSelection(req.params.id, ownerToken(req), req.body ?? {}));
  });

  app.post('/api/sessions/:id/peer', async (req, res) => {
    send(res, await addPeerReview(req.params.id, req.body ?? {}), 201);
  });

  // Vite middleware in development, static dist in production
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
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Leadership Pulse dev server → http://localhost:${PORT}`);
  });
}

startServer();
