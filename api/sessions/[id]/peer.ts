import type { VercelRequest, VercelResponse } from '@vercel/node';
import { addPeerReview } from '../../../lib/sessionService.js';
import { handler, methodNotAllowed, send, sessionId } from '../../../lib/http.js';

/**
 * POST /api/sessions/:id/peer — submit an anonymous peer review.
 *
 * Deliberately needs only the session id (that is what the invite link carries).
 * Returns just the new count, never the aggregated results.
 */
export default handler(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  const id = sessionId(req);
  if (!id) {
    res.status(400).json({ error: 'Session id required' });
    return;
  }

  const body = (req.body ?? {}) as Record<string, unknown>;
  send(
    res,
    await addPeerReview(id, {
      selectedAdjectives: body.selectedAdjectives,
      peerRole: body.peerRole,
      notes: body.notes,
    }),
    201
  );
});
