import { NextRequest, NextResponse } from 'next/server';
import { VortexForgeAgent } from '@/lib/agents/vortexforge-agent';
import { db } from '@/lib/database';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { symbol, timeframe, realTimeData } = body;
    if (!symbol || !timeframe || !realTimeData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const agent = new VortexForgeAgent();
    const result = await agent.process({ symbol, timeframe, realTimeData });

    // Map agent output to PredictionVerdict structure
    const prediction = {
      user_id: 'demo', // TODO: Replace with real user ID from auth
      symbol,
      prediction_date: new Date().toISOString(),
      verdict: result.data.direction || 'NEUTRAL',
      confidence: result.confidence || 50,
      reasoning: result.data.reasoning || '',
      market_context: JSON.stringify({
        support: result.data.supportLevel,
        resistance: result.data.resistanceLevel,
        citations: result.data.citations
      }),
      entry: result.data.entry || 0,
      tp: result.data.takeProfit || 0,
      sl: result.data.stopLoss || 0,
      timeframe: result.data.timeframe || timeframe,
      style: realTimeData.style || '',
      // Optionally add sourceType for extensibility
      sourceType: 'vortexforge'
    };

    db.savePredictionVerdict(prediction);

    return NextResponse.json({ result });
  } catch (error) {
    console.error('VortexForge API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 