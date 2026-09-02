import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Result } from './sessionService.js';

/** Reads the owner token from the header, falling back to a query param. */
export function ownerToken(req: VercelRequest): string | undefined {
  const header = req.headers['x-owner-token'];
  if (typeof header === 'string' && header) return header;
  const query = req.query.token;
  if (typeof query === 'string' && query) return query;
  return undefined;
}

/** Extracts the [id] path segment. */
export function sessionId(req: VercelRequest): string | undefined {
  const id = req.query.id;
  if (typeof id === 'string' && id) return id;
  if (Array.isArray(id) && typeof id[0] === 'string') return id[0];
  return undefined;
}

/** Maps a Result onto the HTTP response. */
export function send<T>(res: VercelResponse, result: Result<T>, successStatus = 200): void {
  if (result.ok) {
    res.status(successStatus).json(result.data);
  } else {
    res.status(result.status).json({ error: result.error });
  }
}

/**
 * Wraps a handler so unexpected throws become 500s instead of opaque platform
 * errors, and a missing MONGODB_URI reports itself clearly.
 */
export function handler(
  fn: (req: VercelRequest, res: VercelResponse) => Promise<void>
) {
  return async (req: VercelRequest, res: VercelResponse): Promise<void> => {
    // Session data is per-request and token-gated; never let a CDN cache it.
    res.setHeader('Cache-Control', 'no-store');
    try {
      await fn(req, res);
    } catch (err) {
      console.error('[api] Unhandled error:', err);
      const message = err instanceof Error ? err.message : 'Internal server error';
      res.status(500).json({ error: message });
    }
  };
}

export function methodNotAllowed(res: VercelResponse, allowed: string[]): void {
  res.setHeader('Allow', allowed.join(', '));
  res.status(405).json({ error: 'Method not allowed' });
}
