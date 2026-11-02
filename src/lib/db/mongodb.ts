import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
const options = {};

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

// Extend global namespace for development cache
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (uri) {
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
} else {
  // Graceful log when MONGODB_URI is not set
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[MongoDB] MONGODB_URI is not configured in .env.local. Operating in memory-fallback mode.');
  }
}

export async function getDatabase(): Promise<Db | null> {
  if (!clientPromise) {
    return null;
  }
  try {
    const connectedClient = await clientPromise;
    return connectedClient.db('matrix_solver_db');
  } catch (error) {
    console.error('[MongoDB] Connection error:', error);
    return null;
  }
}

// In-memory fallback collection for when MongoDB URI is not yet configured
interface InMemoryRecord {
  _id: string;
  dimension: number;
  matrixA: number[][];
  vectorB: number[];
  method: string;
  answers: number[];
  createdAt: string;
}

const inMemoryStore: InMemoryRecord[] = [];

export async function saveProblemToDatabase(doc: {
  dimension: number;
  matrixA: number[][];
  vectorB: number[];
  method: string;
  answers: number[];
}): Promise<string> {
  const db = await getDatabase();
  const id = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const record = {
    _id: id,
    ...doc,
    createdAt: new Date().toISOString()
  };

  if (db) {
    try {
      const collection = db.collection('solved_problems');
      await collection.insertOne(record as any);
      return id;
    } catch (e) {
      console.warn('[MongoDB] Failed to write to MongoDB, falling back to memory store:', e);
    }
  }

  // Fallback to in-memory store
  inMemoryStore.unshift(record);
  if (inMemoryStore.length > 50) inMemoryStore.pop();
  return id;
}

export async function getRecentProblemsFromDatabase(limit: number = 10): Promise<InMemoryRecord[]> {
  const db = await getDatabase();
  if (db) {
    try {
      const collection = db.collection('solved_problems');
      const docs = await collection
        .find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
      return docs.map(d => ({
        _id: d._id.toString(),
        dimension: d.dimension,
        matrixA: d.matrixA,
        vectorB: d.vectorB,
        method: d.method,
        answers: d.answers,
        createdAt: d.createdAt
      }));
    } catch (e) {
      console.warn('[MongoDB] Failed to read from MongoDB, falling back to memory store:', e);
    }
  }

  return inMemoryStore.slice(0, limit);
}

export async function getProblemByIdFromDatabase(id: string): Promise<InMemoryRecord | null> {
  const db = await getDatabase();
  if (db) {
    try {
      const collection = db.collection('solved_problems');
      const doc = await collection.findOne({ _id: id as any });
      if (doc) {
        return {
          _id: doc._id.toString(),
          dimension: doc.dimension,
          matrixA: doc.matrixA,
          vectorB: doc.vectorB,
          method: doc.method,
          answers: doc.answers,
          createdAt: doc.createdAt
        };
      }
    } catch (e) {
      console.warn('[MongoDB] Failed to read ID from MongoDB:', e);
    }
  }

  const found = inMemoryStore.find(r => r._id === id);
  return found || null;
}
