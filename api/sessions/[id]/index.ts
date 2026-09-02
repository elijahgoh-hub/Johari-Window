import type { VercelRequest, VercelResponse } from '@vercel/node';
import { deleteSession, getFullSession, getPublicSession } from '../../../lib/sessionService';
import { handler, methodNotAllowed, ownerToken, send, sessionId } from '../../../lib/http';

/**
 * GET    /api/sessions/:id  — without a token: leader name + response count only.
 *                             with the owner token: full results.
 * DELETE /api/sessions/:id  — owner only.
 */
export default handler(async (req: VercelRequest, res: VercelResponse) => {
  const id = sessionId(req);
  if (!id) {
    res.status(400).json({ error: 'Session id required' });
    return;
  }

  const token = ownerToken(req);

  switch (req.method) {
    case 'GET':
      // No token means peer-link access, which must not expose any feedback.
      send(res, token ? await getFullSession(id, token) : await getPublicSession(id));
      return;

    case 'DELETE':
      send(res, await deleteSession(id, token));
      return;

    default:
      return methodNotAllowed(res, ['GET', 'DELETE']);
  }
});
