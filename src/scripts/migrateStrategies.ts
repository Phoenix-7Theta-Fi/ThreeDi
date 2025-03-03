import { config } from 'dotenv';
config(); // Load environment variables from .env

import { clientPromise } from '../lib/mongodb';
import { MongoClient } from 'mongodb';

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
  try {
    console.log('Connecting to MongoDB...');
    const client: MongoClient = await clientPromise;
    const db = client.db('stockjournal');
    
    // Clear existing strategies
    console.log('Clearing existing strategies...');
    await db.collection('strategies').deleteMany({});
    
    // Insert initial strategies
    console.log('Inserting initial strategies...');
    const result = await db.collection('strategies').insertMany(INITIAL_STRATEGIES);
    
    console.log(`Successfully migrated ${result.insertedCount} strategies`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateStrategies();
