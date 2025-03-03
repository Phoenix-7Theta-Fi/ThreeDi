import { MongoClient, ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { clientPromise } from '../../../lib/mongodb';

interface Strategy {
  value: string;
  label: string;
}

export async function GET() {
  try {
    const client: MongoClient = await clientPromise;
    const db = client.db('stockjournal');
    const strategies = await db.collection('strategies').find({}).toArray();
    
    return NextResponse.json(strategies);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch strategies' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: Strategy = await request.json();
    
    if (!body.value || !body.label) {
      return NextResponse.json(
        { error: 'Value and label are required' },
        { status: 400 }
      );
    }

    const client: MongoClient = await clientPromise;
    const db = client.db('stockjournal');
    
    // Check if strategy with same value already exists
    const existing = await db.collection('strategies').findOne({ value: body.value });
    if (existing) {
      return NextResponse.json(
        { error: 'Strategy with this value already exists' },
        { status: 400 }
      );
    }

    const result = await db.collection('strategies').insertOne(body);
    
    return NextResponse.json({
      _id: result.insertedId,
      ...body
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to create strategy' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, value, label }: { id: string; value: string; label: string } =
      await request.json();

    if (!id || !value || !label) {
      return NextResponse.json(
        { error: 'Id, value, and label are required' },
        { status: 400 }
      );
    }

    const client: MongoClient = await clientPromise;
    const db = client.db('stockjournal');

    const result = await db.collection('strategies').updateOne(
      { _id: new ObjectId(id) },
      { $set: { value, label } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Strategy not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ id, value, label });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to update strategy' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Strategy ID is required' },
        { status: 400 }
      );
    }

    const client: MongoClient = await clientPromise;
    const db = client.db('stockjournal');

    const result = await db.collection('strategies').deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Strategy not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ id });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to delete strategy' },
      { status: 500 }
    );
  }
}
