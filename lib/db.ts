import { MongoClient, type Collection } from 'mongodb';
import type { AdjectiveSelection } from '../src/types/johari';

/**
 * MongoDB access layer.
 *
 * Replaces the local `sessions_db.json` file store from the AI Studio build,
 * which cannot work on serverless hosting (read-only, ephemeral filesystem).
 */

export interface SessionDoc {
  /** Public session id — appears in the peer invite link. Grants submit-only access. */
  _id: string;
  /** SHA-256 of the owner token. The raw token is never stored. */
  ownerTokenHash: string;
  leaderName: string;
  leaderTitle: string;
  selfSelection: AdjectiveSelection;
  peerSelections: AdjectiveSelection[];
  createdAt: number;
  updatedAt: number;
}

const DB_NAME = process.env.MONGODB_DB || 'johari';
const COLLECTION = 'sessions';

// Cache the connection promise on globalThis so warm serverless invocations
// reuse one pool instead of opening a socket per request.
const globalForMongo = globalThis as typeof globalThis & {
  __johariMongoClient?: Promise<MongoClient>;
};

function connect(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      'MONGODB_URI is not set. Add it in Vercel → Settings → Environment Variables.'
    );
  }

  if (!globalForMongo.__johariMongoClient) {
    globalForMongo.__johariMongoClient = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
    }).connect();
  }

  return globalForMongo.__johariMongoClient;
}

export async function sessions(): Promise<Collection<SessionDoc>> {
  const client = await connect();
  return client.db(DB_NAME).collection<SessionDoc>(COLLECTION);
}
