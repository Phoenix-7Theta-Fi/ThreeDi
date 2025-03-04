import { MongoClient, ServerApiVersion, Document } from 'mongodb';
import { ChartEntry } from '../types/chart';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env');
}

const uri = process.env.MONGODB_URI;

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

interface GlobalMongo {
  _mongoClientPromise?: Promise<MongoClient>;
}

if (process.env.NODE_ENV === 'development') {
  const globalWithMongo = global as typeof globalThis & GlobalMongo;

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  clientPromise = client.connect();
}

export async function getDb() {
  const client = await clientPromise;
  return client.db('stockjournal');
}

export async function getCollection(collectionName: string) {
  const db = await getDb();
  return db.collection(collectionName);
}

interface ChartQuery {
  $or?: Array<{ [key: string]: { $regex: string; $options: string } }>;
  strategy?: string;
  marketCap?: string;
  execution?: string;
  date?: {
    $gte: string;
    $lte: string;
  };
}

// Helper functions for chart operations
export async function getCharts(query: ChartQuery = {}) {
  const collection = await getCollection('charts');
  // Add debug logging
  if (query.date) {
    console.log('MongoDB query date range:', query.date);
  }

  const result = await collection.find<ChartEntry>(query).sort({ createdAt: -1 }).toArray();
  
  // Add debug logging for results
  if (query.date) {
    console.log('Found charts count:', result.length);
    console.log('Charts dates:', result.map(chart => chart.date));
  }
  
  return result;
}

export async function addChart(chart: Omit<ChartEntry, 'id'>) {
  const collection = await getCollection('charts');
  const result = await collection.insertOne(chart as Document);
  return result;
}

export async function getChartById(id: string) {
  const collection = await getCollection('charts');
  return collection.findOne<ChartEntry>({ id });
}

export async function updateChart(id: string, update: Partial<ChartEntry>) {
  const collection = await getCollection('charts');
  const result = await collection.updateOne(
    { id },
    { $set: { ...update, updatedAt: new Date().toISOString() } }
  );
  return result;
}

export async function deleteChart(id: string) {
  const collection = await getCollection('charts');
  const result = await collection.deleteOne({ id });
  return result;
}

export { clientPromise };
