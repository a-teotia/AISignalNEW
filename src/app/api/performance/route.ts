import { NextResponse } from "next/server";
import { db } from "@/lib/database";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol');
    const timeframe = searchParams.get('timeframe') || 'all';

    if (!symbol) {
      return NextResponse.json({ error: 'Symbol parameter is required' }, { status: 400 });
    }

    // Get user session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user_id = session.user.email;

    const metrics = db.calculatePerformanceMetrics(user_id, symbol, timeframe);
    
    return NextResponse.json({ metrics });
  } catch (error) {
    console.error('Error calculating performance metrics:', error);
    return NextResponse.json({ error: 'Failed to calculate performance metrics' }, { status: 500 });
  }
} 