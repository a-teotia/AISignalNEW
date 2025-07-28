import { NextRequest, NextResponse } from 'next/server';
import { LivePerformanceTracker } from '../../../lib/testing/live-performance-tracker';

let tracker: LivePerformanceTracker | null = null;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, symbols, intervalMinutes } = body;

    switch (action) {
      case 'start':
        if (!symbols || !Array.isArray(symbols)) {
          return NextResponse.json({ error: 'Symbols array is required' }, { status: 400 });
        }

        if (tracker) {
          await tracker.stopTracking();
        }

        tracker = new LivePerformanceTracker();
        await tracker.startTracking(symbols, intervalMinutes || 60);

        return NextResponse.json({
          success: true,
          message: `Live tracking started for ${symbols.length} symbols`,
          symbols,
          intervalMinutes: intervalMinutes || 60
        });

      case 'stop':
        if (tracker) {
          await tracker.stopTracking();
          tracker = null;
          return NextResponse.json({
            success: true,
            message: 'Live tracking stopped'
          });
        } else {
          return NextResponse.json({
            success: false,
            message: 'No active tracking to stop'
          });
        }

      case 'status':
        const isActive = tracker !== null;
        const metrics = tracker ? tracker.getMetrics() : null;
        const predictions = tracker ? tracker.getPredictions() : [];

        return NextResponse.json({
          success: true,
          isActive,
          metrics,
          totalPredictions: predictions.length,
          recentPredictions: predictions.slice(-10) // Last 10 predictions
        });

      case 'metrics':
        if (!tracker) {
          return NextResponse.json({
            success: false,
            message: 'No active tracking'
          });
        }

        const currentMetrics = tracker.getMetrics();
        return NextResponse.json({
          success: true,
          metrics: currentMetrics
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Live tracking API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const isActive = tracker !== null;
    const metrics = tracker ? tracker.getMetrics() : null;
    const predictions = tracker ? tracker.getPredictions() : [];

    return NextResponse.json({
      success: true,
      isActive,
      metrics,
      totalPredictions: predictions.length,
      recentPredictions: predictions.slice(-5) // Last 5 predictions
    });

  } catch (error) {
    console.error('Live tracking GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 