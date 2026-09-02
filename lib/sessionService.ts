import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { sessions, type SessionDoc } from './db.js';
import { JOHARI_ADJECTIVES } from '../src/data/johariAdjectives.js';
import type { AdjectiveSelection } from '../src/types/johari.js';

/**
 * Framework-agnostic session logic, shared by the Vercel functions in /api
 * and the local Express server. Keeping one copy means local and production
 * behave identically.
 *
 * SECURITY MODEL — capability URLs, no login:
 *   sessionId  : in the peer invite link. Submit a review, read leader name only.
 *   ownerToken : in the leader dashboard link. Read results, edit self-selection, delete.
 * Both are 128-bit+ CSPRNG values. The owner token is stored only as a SHA-256
 * hash, so a database dump does not hand out edit rights.
 */

const MAX_ADJECTIVES = 6;
const MAX_PEER_REVIEWS = 500;
const MAX_NOTES_LENGTH = 2000;
const MAX_NAME_LENGTH = 120;

const VALID_ADJECTIVES = new Set(JOHARI_ADJECTIVES.map((a) => a.name));

const VALID_PEER_ROLES = new Set([
  'Manager',
  'Peer / Colleague',
  'Direct Report',
  'Cross-functional Partner',
  'Stakeholder',
  'Other',
]);

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string };

const fail = (status: number, error: string): Result<never> => ({ ok: false, status, error });

/** Session metadata safe to expose to anyone holding the peer link. */
export interface PublicSession {
  id: string;
  leaderName: string;
  leaderTitle: string;
  peerCount: number;
  createdAt: number;
}

/** Everything the leader dashboard needs. Owner token required. */
export interface FullSession extends PublicSession {
  selfSelection: AdjectiveSelection;
  peerSelections: AdjectiveSelection[];
  updatedAt: number;
}

// ---------------------------------------------------------------- helpers

const token = (bytes: number) => randomBytes(bytes).toString('base64url');
const hash = (value: string) => createHash('sha256').update(value).digest('hex');

function hashesMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

function cleanText(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

/**
 * Only canonical adjective names survive, duplicates are dropped, and the list
 * is capped. Prevents arbitrary strings being written into the dataset.
 */
function cleanAdjectives(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  for (const raw of value) {
    if (typeof raw !== 'string') continue;
    const name = raw.trim();
    if (VALID_ADJECTIVES.has(name)) seen.add(name);
    if (seen.size >= MAX_ADJECTIVES) break;
  }
  return [...seen];
}

function toPublic(doc: SessionDoc): PublicSession {
  return {
    id: doc._id,
    leaderName: doc.leaderName,
    leaderTitle: doc.leaderTitle,
    peerCount: doc.peerSelections.length,
    createdAt: doc.createdAt,
  };
}

function toFull(doc: SessionDoc): FullSession {
  return {
    ...toPublic(doc),
    selfSelection: doc.selfSelection,
    peerSelections: doc.peerSelections,
    updatedAt: doc.updatedAt,
  };
}

/** Loads a session and verifies the caller holds the owner token. */
async function authorize(id: string, ownerToken: unknown): Promise<Result<SessionDoc>> {
  if (typeof ownerToken !== 'string' || ownerToken.length === 0) {
    return fail(401, 'Owner token required');
  }

  const col = await sessions();
  const doc = await col.findOne({ _id: id });
  if (!doc) return fail(404, 'Session not found');

  if (!hashesMatch(doc.ownerTokenHash, hash(ownerToken))) {
    return fail(403, 'Invalid owner token for this session');
  }

  return { ok: true, data: doc };
}

// ---------------------------------------------------------------- operations

export async function createSession(input: {
  leaderName?: unknown;
  leaderTitle?: unknown;
  selectedAdjectives?: unknown;
  notes?: unknown;
}): Promise<Result<{ sessionId: string; ownerToken: string; session: FullSession }>> {
  const leaderName = cleanText(input.leaderName, MAX_NAME_LENGTH);
  if (!leaderName) return fail(400, 'Leader name is required');

  const sessionId = token(16); // 128 bits
  const ownerToken = token(32); // 256 bits
  const now = Date.now();

  const doc: SessionDoc = {
    _id: sessionId,
    ownerTokenHash: hash(ownerToken),
    leaderName,
    leaderTitle: cleanText(input.leaderTitle, MAX_NAME_LENGTH) || 'Executive Leader',
    selfSelection: {
      userId: `self-${sessionId}`,
      source: 'self',
      selectedAdjectives: cleanAdjectives(input.selectedAdjectives),
      notes: cleanText(input.notes, MAX_NOTES_LENGTH),
      submittedAt: now,
    },
    peerSelections: [],
    createdAt: now,
    updatedAt: now,
  };

  const col = await sessions();
  await col.insertOne(doc);

  return { ok: true, data: { sessionId, ownerToken, session: toFull(doc) } };
}

/** Peer-link access: leader name and response count only. No adjectives, no notes. */
export async function getPublicSession(id: string): Promise<Result<PublicSession>> {
  const col = await sessions();
  const doc = await col.findOne({ _id: id });
  if (!doc) return fail(404, 'Session not found');
  return { ok: true, data: toPublic(doc) };
}

/** Dashboard access: full results. Requires the owner token. */
export async function getFullSession(
  id: string,
  ownerToken: unknown
): Promise<Result<FullSession>> {
  const auth = await authorize(id, ownerToken);
  if (!auth.ok) return auth;
  return { ok: true, data: toFull(auth.data) };
}

/**
 * Updates the leader's own selection. Owner only.
 *
 * Note this writes *only* the selfSelection field — peerSelections are never
 * part of the payload, so a stale client cannot overwrite collected feedback.
 * That was the data-loss bug in the original server.ts.
 */
export async function updateSelfSelection(
  id: string,
  ownerToken: unknown,
  input: { selectedAdjectives?: unknown; notes?: unknown; leaderName?: unknown; leaderTitle?: unknown }
): Promise<Result<FullSession>> {
  const auth = await authorize(id, ownerToken);
  if (!auth.ok) return auth;

  const doc = auth.data;
  const now = Date.now();

  const selfSelection: AdjectiveSelection = {
    userId: doc.selfSelection?.userId || `self-${id}`,
    source: 'self',
    selectedAdjectives: cleanAdjectives(input.selectedAdjectives),
    notes: cleanText(input.notes, MAX_NOTES_LENGTH),
    submittedAt: now,
  };

  const leaderName = cleanText(input.leaderName, MAX_NAME_LENGTH) || doc.leaderName;
  const leaderTitle = cleanText(input.leaderTitle, MAX_NAME_LENGTH) || doc.leaderTitle;

  const col = await sessions();
  const updated = await col.findOneAndUpdate(
    { _id: id },
    { $set: { selfSelection, leaderName, leaderTitle, updatedAt: now } },
    { returnDocument: 'after' }
  );

  if (!updated) return fail(404, 'Session not found');
  return { ok: true, data: toFull(updated) };
}

/**
 * Appends an anonymous peer review. Requires only the session id — that is the
 * point of the invite link. Identity is stripped before storage.
 */
export async function addPeerReview(
  id: string,
  input: { selectedAdjectives?: unknown; peerRole?: unknown; notes?: unknown }
): Promise<Result<{ peerCount: number }>> {
  const selectedAdjectives = cleanAdjectives(input.selectedAdjectives);
  if (selectedAdjectives.length === 0) {
    return fail(400, 'Select at least one adjective');
  }

  const col = await sessions();
  const doc = await col.findOne({ _id: id }, { projection: { peerSelections: 1 } });
  if (!doc) return fail(404, 'Session not found');

  if (doc.peerSelections.length >= MAX_PEER_REVIEWS) {
    return fail(429, 'This session has reached its response limit');
  }

  const role = cleanText(input.peerRole, 60);

  const review: AdjectiveSelection = {
    userId: `peer-${token(8)}`,
    source: 'peer',
    peerName: 'Anonymous Reviewer',
    peerRole: (VALID_PEER_ROLES.has(role) ? role : 'Peer / Colleague') as AdjectiveSelection['peerRole'],
    selectedAdjectives,
    notes: cleanText(input.notes, MAX_NOTES_LENGTH),
    submittedAt: Date.now(),
  };

  const updated = await col.findOneAndUpdate(
    { _id: id },
    { $push: { peerSelections: review }, $set: { updatedAt: Date.now() } },
    { returnDocument: 'after', projection: { peerSelections: 1 } }
  );

  return { ok: true, data: { peerCount: updated?.peerSelections.length ?? 0 } };
}

/** Deletes a session outright. Owner only. */
export async function deleteSession(
  id: string,
  ownerToken: unknown
): Promise<Result<{ deleted: true }>> {
  const auth = await authorize(id, ownerToken);
  if (!auth.ok) return auth;

  const col = await sessions();
  await col.deleteOne({ _id: id });
  return { ok: true, data: { deleted: true } };
}
