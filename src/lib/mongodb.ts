import { MongoClient, ServerApiVersion } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env');
}

const uri = process.env.MONGODB_URI;

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

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

// Helper functions for chart operations
export async function getCharts(query: Record<string, any> = {}) {
  const collection = await getCollection('charts');
  return collection.find(query).sort({ createdAt: -1 }).toArray();
}

export async function addChart(chart: any) {
  const collection = await getCollection('charts');
  const result = await collection.insertOne(chart);
  return result;
}

export async function getChartById(id: string) {
  const collection = await getCollection('charts');
  return collection.findOne({ id });
}

export async function updateChart(id: string, update: any) {
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
