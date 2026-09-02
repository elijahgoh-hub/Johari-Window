import type { VercelRequest, VercelResponse } from '@vercel/node';
import { updateSelfSelection } from '../../../lib/sessionService';
import { handler, methodNotAllowed, ownerToken, send, sessionId } from '../../../lib/http';

/** PUT /api/sessions/:id/self — update the leader's own selection. Owner only. */
export default handler(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'PUT') return methodNotAllowed(res, ['PUT']);

  const id = sessionId(req);
  if (!id) {
    res.status(400).json({ error: 'Session id required' });
    return;
  }

  const body = (req.body ?? {}) as Record<string, unknown>;
  send(
    res,
    await updateSelfSelection(id, ownerToken(req), {
      selectedAdjectives: body.selectedAdjectives,
      notes: body.notes,
      leaderName: body.leaderName,
      leaderTitle: body.leaderTitle,
    })
  );
});
