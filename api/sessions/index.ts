import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createSession } from '../../lib/sessionService';
import { handler, methodNotAllowed, send } from '../../lib/http';

/** POST /api/sessions — create a session, returns the sessionId + ownerToken. */
export default handler(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  const body = (req.body ?? {}) as Record<string, unknown>;
  send(
    res,
    await createSession({
      leaderName: body.leaderName,
      leaderTitle: body.leaderTitle,
      selectedAdjectives: body.selectedAdjectives,
      notes: body.notes,
    }),
    201
  );
});
