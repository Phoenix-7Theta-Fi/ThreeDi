import { NextResponse } from 'next/server';
import { getCharts, addChart, getChartById, updateChart, deleteChart } from '../../../lib/mongodb';
import { deleteUploadedFile } from '../uploadthing/core';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const searchQuery = searchParams.get('search') || '';
    const strategy = searchParams.get('strategy') || 'all';
    const marketCap = searchParams.get('marketCap') || 'all';
    const execution = searchParams.get('execution') || 'all';

    if (id) {
      const chart = await getChartById(id);
      if (!chart) {
        return NextResponse.json({ error: 'Chart not found' }, { status: 404 });
      }
      return NextResponse.json(chart);
    }

    let query: any = {};

    // Add search filter
    if (searchQuery) {
      query.$or = [
        { chartName: { $regex: searchQuery, $options: 'i' } },
        { stockSymbol: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    // Add strategy filter
    if (strategy !== 'all') {
      query.strategy = strategy;
    }

    // Add marketCap filter
    if (marketCap !== 'all') {
      query.marketCap = marketCap;
    }

    // Add execution filter
    if (execution !== 'all') {
      query.execution = execution;
    }

    const charts = await getCharts(query);
    return NextResponse.json(charts);
  } catch (error) {
    console.error('Error fetching charts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch charts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.chartName || !body.stockSymbol || !body.imageUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const chart = {
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await addChart(chart);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating chart:', error);
    return NextResponse.json(
      { error: 'Failed to create chart' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Chart ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const result = await updateChart(id, body);

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Chart not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating chart:', error);
    return NextResponse.json(
      { error: 'Failed to update chart' },
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
        { error: 'Chart ID is required' },
        { status: 400 }
      );
    }

    // Get the chart to find its file key
    const chart = await getChartById(id);
    if (!chart) {
      return NextResponse.json(
        { error: 'Chart not found' },
        { status: 404 }
      );
    }

    // Delete the chart from MongoDB
    const result = await deleteChart(id);
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to delete chart' },
        { status: 500 }
      );
    }

    // Extract file key from the URL
    const fileKey = chart.imageUrl.split('/').pop();
    if (fileKey) {
      // Delete the file from UploadThing
      await deleteUploadedFile(fileKey);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chart:', error);
    return NextResponse.json(
      { error: 'Failed to delete chart' },
      { status: 500 }
    );
  }
}
