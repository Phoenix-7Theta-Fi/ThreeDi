import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
dotenv.config();

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env');
}

const INITIAL_STRATEGIES = [
  { value: 'momentum', label: 'Momentum Trading' },
  { value: 'price_action', label: 'Price Action' },
  { value: 'swing', label: 'Swing Trading' },
  { value: 'scalping', label: 'Scalping' },
  { value: 'breakout', label: 'Breakout Trading' },
  { value: 'trend_following', label: 'Trend Following' },
  { value: 'reversal', label: 'Reversal Trading' },
  { value: 'support_resistance', label: 'Support & Resistance' },
  { value: 'channel', label: 'Channel Trading' },
  { value: 'gap', label: 'Gap Trading' },
  { value: 'vwap', label: 'VWAP Trading' },
  { value: 'other', label: 'Other' },
];

async function migrateStrategies() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    const db = client.db('stockjournal');
    
    // Clear existing strategies
    console.log('Clearing existing strategies...');
    await db.collection('strategies').deleteMany({});
    
    // Insert initial strategies
    console.log('Inserting initial strategies...');
    const result = await db.collection('strategies').insertMany(INITIAL_STRATEGIES);
    
    console.log(`Successfully migrated ${result.insertedCount} strategies`);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.close();
    process.exit(0);
  }
}

migrateStrategies();
