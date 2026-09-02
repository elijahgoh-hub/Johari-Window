# Next.js (App Router) Backend API Routes & Dynamic Routing

This reference specification documents the complete **Next.js App Router** structure for Johari Window 360° sessions, dynamic peer URLs, anonymous storage, and aggregated calculations.

---

## Directory Structure

```text
app/
├── api/
│   └── sessions/
│       ├── create/
│       │   └── route.ts                  # POST: Generate session UUID with leader selections
│       └── [sessionId]/
│           ├── route.ts                  # GET: Public metadata (leader name, anonymized peer stats)
│           ├── peer-submit/
│           │   └── route.ts              # POST: Anonymous peer 5-6 adjective submission
│           └── results/
│               └── route.ts              # GET: Aggregated 2x2 Johari matrix for leader dashboard
├── dashboard/
│   └── [sessionId]/
│       └── page.tsx                      # Dynamic Leader Matrix Dashboard
└── johari/
    └── [sessionId]/
        └── page.tsx                      # Dynamic Friction-free Peer Review Page
lib/
└── db.ts                                 # Supabase / Firebase / DB persistence adapter
```

---

## 1. `POST /api/sessions/create`
**File:** `app/api/sessions/create/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { leaderName, leaderTitle, selectedAdjectives, notes } = body;

    // Validation: Require 5 to 6 adjectives
    if (!leaderName || typeof leaderName !== 'string') {
      return NextResponse.json({ error: 'Leader name is required' }, { status: 400 });
    }

    if (!Array.isArray(selectedAdjectives) || selectedAdjectives.length < 5 || selectedAdjectives.length > 6) {
      return NextResponse.json(
        { error: 'Leader must select exactly 5 to 6 adjectives.' },
        { status: 400 }
      );
    }

    const sessionId = randomUUID();
    const createdAt = Date.now();

    const session = {
      id: sessionId,
      leaderName: leaderName.trim(),
      leaderTitle: leaderTitle?.trim() || 'Executive Leader',
      selfSelection: {
        userId: `leader-${sessionId}`,
        source: 'self' as const,
        selectedAdjectives: selectedAdjectives.map((a: string) => a.trim()),
        notes: notes || '',
        submittedAt: createdAt,
      },
      peerSelections: [],
      createdAt,
      updatedAt: createdAt,
    };

    await db.saveSession(session);

    return NextResponse.json({
      success: true,
      sessionId,
      shareablePeerUrl: `/johari/${sessionId}`,
      dashboardUrl: `/dashboard/${sessionId}`,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
```

---

## 2. `GET /api/sessions/[sessionId]`
**File:** `app/api/sessions/[sessionId]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await db.getSession(params.sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // SANITIZATION: Protect peer psychological safety & prevent self-selection bias
    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        leaderName: session.leaderName,
        leaderTitle: session.leaderTitle,
        totalPeerResponses: session.peerSelections?.length || 0,
        createdAt: session.createdAt,
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load session' }, { status: 500 });
  }
}
```

---

## 3. `POST /api/sessions/[sessionId]/peer-submit`
**File:** `app/api/sessions/[sessionId]/peer-submit/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await db.getSession(params.sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const { selectedAdjectives, peerRole, notes } = await req.json();

    if (!Array.isArray(selectedAdjectives) || selectedAdjectives.length < 5 || selectedAdjectives.length > 6) {
      return NextResponse.json(
        { error: 'Peers must select exactly 5 to 6 adjectives.' },
        { status: 400 }
      );
    }

    const peerSubmission = {
      userId: `peer-${randomUUID().substring(0, 8)}`,
      source: 'peer' as const,
      peerName: 'Anonymous Reviewer',
      peerRole: peerRole || 'Peer / Colleague',
      selectedAdjectives: selectedAdjectives.map((a: string) => a.trim()),
      notes: notes?.trim() || '',
      submittedAt: Date.now(),
    };

    await db.addPeerSelection(params.sessionId, peerSubmission);

    return NextResponse.json({
      success: true,
      message: 'Anonymous feedback recorded successfully.',
      totalPeersSubmitted: (session.peerSelections?.length || 0) + 1,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}
```

---

## 4. `GET /api/sessions/[sessionId]/results`
**File:** `app/api/sessions/[sessionId]/results/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateJohariResults } from '@/utils/johariCalculator';

export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await db.getSession(params.sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Run 2x2 grid partitioning engine
    const analysis = calculateJohariResults(session);

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      leaderName: session.leaderName,
      leaderTitle: session.leaderTitle,
      totalPeers: session.peerSelections?.length || 0,
      analysis: {
        quadrants: analysis.quadrants,
        adjectiveStats: analysis.adjectiveStats,
        peerConsensusDistribution: analysis.peerConsensusDistribution,
        summary: analysis.summary,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to compute results' }, { status: 500 });
  }
}
```

---

## 5. Dynamic Peer Route Page
**File:** `app/johari/[sessionId]/page.tsx`

```tsx
import { notFound } from 'next/navigation';
import { PeerFeedbackView } from '@/components/PeerFeedbackView';
import { db } from '@/lib/db';

export default async function PeerPage({ params }: { params: { sessionId: string } }) {
  const session = await db.getSession(params.sessionId);
  if (!session) notFound();

  return (
    <div className="min-h-screen bg-[#F4F4F4] py-8">
      <PeerFeedbackView
        leaderName={session.leaderName}
        leaderTitle={session.leaderTitle}
        peerSelections={session.peerSelections}
        onAddPeerSelection={async (peerData) => {
          'use server';
          await db.addPeerSelection(params.sessionId, peerData);
        }}
      />
    </div>
  );
}
```
