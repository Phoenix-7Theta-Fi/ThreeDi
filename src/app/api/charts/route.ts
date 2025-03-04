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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (id) {
      const chart = await getChartById(id);
      if (!chart) {
        return NextResponse.json({ error: 'Chart not found' }, { status: 404 });
      }
      return NextResponse.json(chart);
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

    const query: ChartQuery = {};

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

    // Add date range filter
    if (startDate && endDate) {
      // Convert to simple YYYY-MM-DD format for comparison
      const normalizedStartDate = new Date(startDate).toISOString().split('T')[0];
      const normalizedEndDate = new Date(endDate).toISOString().split('T')[0];
      
      console.log('Original dates:', { startDate, endDate });
      console.log('Normalized dates:', { normalizedStartDate, normalizedEndDate });
      
      query.date = {
        $gte: normalizedStartDate,
        $lte: normalizedEndDate
      };
    }

    const charts = await getCharts(query);
    console.log('Query:', JSON.stringify(query, null, 2));
    console.log('Charts found:', charts.length);
    if (charts.length > 0) {
      console.log('Sample chart dates:', charts.map(chart => chart.date).slice(0, 5));
    }
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

    if (!body.chartName || !body.stockSymbol || !body.imageUrls?.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const chart = {
      ...body,
      date: new Date(body.date).toISOString().split('T')[0], // Normalize date to YYYY-MM-DD
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
    const normalizedBody = {
      ...body,
      // Normalize date if it's being updated
      ...(body.date && { date: new Date(body.date).toISOString().split('T')[0] }),
      updatedAt: new Date().toISOString(),
    };
    const result = await updateChart(id, normalizedBody);

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

    // Get the chart to find its file keys
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

    // Delete all images from UploadThing
    for (const imageUrl of chart.imageUrls) {
      const fileKey = imageUrl.split('/').pop();
      if (fileKey) {
        await deleteUploadedFile(fileKey);
      }
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
