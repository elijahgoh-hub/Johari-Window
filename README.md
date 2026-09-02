# Johari Window Leadership Navigator

Executive self-awareness and 360° peer feedback platform. Maps the 55 canonical
Johari Window adjectives to the Braze Leadership Competency Model.

A leader picks 6 adjectives that describe themselves, shares an anonymous invite
link with peers, and sees the aggregated 2×2 Johari matrix — Arena, Blind Spot,
Façade, Unknown — as responses arrive.

## Stack

| Layer | Choice |
|---|---|
| Frontend | React 19 + Vite 6 + Tailwind 4 |
| API | Vercel serverless functions (`/api`) |
| Database | MongoDB Atlas |
| Hosting | Vercel |

## Access model

There is no login. Access is by unguessable link ("capability URL"), with two
distinct secrets per session:

| Link | Contains | Grants |
|---|---|---|
| Peer invite | `?session=<id>&mode=peer` | Submit one anonymous review; read the leader's name only |
| Leader dashboard | `?session=<id>&token=<ownerToken>` | Read results, edit self-selection, delete the session |

- `sessionId` is 128 bits, `ownerToken` is 256 bits, both from a CSPRNG.
- The owner token is stored server-side only as a SHA-256 hash.
- Holding a peer link does **not** allow reading results.
- Only the owner token can modify or delete a session.

**The dashboard link is a password.** Anyone who has it can read all feedback for
that session. Never send it to peers — use the invite link for that.

## Deploying

1. **MongoDB Atlas** — create a free M0 cluster. Add a database user, and under
   Network Access allow `0.0.0.0/0` (Vercel's function IPs are not fixed).
   Copy the SRV connection string.
2. **Vercel** — import this GitHub repo. It auto-detects Vite; `vercel.json`
   pins the build command and SPA rewrite.
3. Set environment variables in Vercel → Settings → Environment Variables:

   | Name | Value |
   |---|---|
   | `MONGODB_URI` | your Atlas SRV string, with the real password substituted |
   | `MONGODB_DB` | `johari` (optional) |

4. Deploy. No other configuration is needed.

## API

| Method | Route | Auth | Purpose |
|---|---|---|---|
| `POST` | `/api/sessions` | — | Create a session; returns `sessionId` + `ownerToken` |
| `GET` | `/api/sessions/:id` | — | Public metadata: leader name, title, response count |
| `GET` | `/api/sessions/:id` | owner token | Full results including all peer selections |
| `PUT` | `/api/sessions/:id/self` | owner token | Update the leader's own selection |
| `POST` | `/api/sessions/:id/peer` | — | Submit an anonymous peer review |
| `DELETE` | `/api/sessions/:id` | owner token | Delete the session |

The owner token is sent in an `x-owner-token` header so it stays out of server
access logs. A `?token=` query param is accepted as a fallback.

Peer submissions are validated against the canonical 55-adjective list,
deduplicated, capped at 6, and stripped of any identifying fields before storage.

## Running locally

Requires Node.js 20+ and a MongoDB connection string.

```bash
npm install
cp .env.example .env   # then fill in MONGODB_URI
npm run dev            # http://localhost:3000
```

`server.ts` is a local-only Express wrapper. It calls the same
`lib/sessionService.ts` functions as the deployed serverless functions, so local
behaviour matches production.

```bash
npm run lint           # tsc --noEmit
npm run build          # vite build → dist/
```

## Notes

- `NEXTJS_APP_ROUTER_SPEC.md` is an earlier design sketch describing a Next.js
  structure that was never built. It does not reflect this codebase.
- This app does not call any AI model. The AI Studio scaffold included
  `@google/genai`, but nothing ever imported it; the dependency has been removed.
