import { NextResponse } from "next/server";
import { SequentialAgentOrchestrator } from "@/lib/agents/sequential-agent-orchestrator";
import { db } from "@/lib/database";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { symbol, predictionDate, tradingStyle } = await req.json();

    if (!symbol) {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    // Get user session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user_id = session.user.email;

    console.log(`🚀 Starting sequential agent prediction for ${symbol}`);
    
    const orchestrator = new SequentialAgentOrchestrator();
    const sequentialResult = await orchestrator.runSequentialAnalysis(symbol);

    console.log(`✅ Sequential agent analysis completed for ${symbol}`);

    // Map verdict to database format
    const verdict = sequentialResult.finalVerdict.direction === 'BUY' ? 'UP' : 
                   sequentialResult.finalVerdict.direction === 'SELL' ? 'DOWN' : 'NEUTRAL';

    // Save to database
    const predictionId = db.savePredictionVerdict({
      user_id,
      symbol,
      prediction_date: predictionDate || new Date().toISOString().split('T')[0],
      verdict: verdict as 'UP' | 'DOWN' | 'NEUTRAL',
      confidence: sequentialResult.finalVerdict.confidence,
      reasoning: sequentialResult.finalVerdict.reasoning || 
                `Sequential analysis: ${verdict} with ${sequentialResult.finalVerdict.confidence}% confidence`,
      market_context: JSON.stringify({
        type: 'sequential_analysis',
        executiveSummary: sequentialResult.executiveSummary,
        allCitations: sequentialResult.allCitations,
        agentChain: sequentialResult.agentChain,
        processingTime: sequentialResult.totalProcessingTime
      }),
      entry: sequentialResult.finalVerdict.priceTarget, // Use price target as entry for now
      tp: sequentialResult.finalVerdict.priceTarget * 1.03, // 3% take profit
      sl: sequentialResult.finalVerdict.priceTarget * 0.97, // 3% stop loss
      timeframe: tradingStyle === 'swing' ? '4H' : tradingStyle === 'day' ? '1H' : tradingStyle === 'long' ? '1D' : tradingStyle === 'scalper' ? '15M' : '4H',
      style: tradingStyle
    });

    console.log(`💾 Prediction saved to database with ID: ${predictionId}`);

    return NextResponse.json({
      success: true,
      predictionId,
      result: sequentialResult,
      message: "Sequential agent analysis completed successfully"
    });

  } catch (error) {
    console.error("❌ Sequential agent analysis error:", error);
    return NextResponse.json({ 
      error: "Sequential agent analysis failed",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint to check agent status
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      agents: [
        { name: 'QuantitativeAnalysisAgent', description: 'Real market data, technical indicators, volume analysis' },
        { name: 'MarketAnalysisAgent', description: 'Company fundamentals, earnings, competitive position' },
        { name: 'TechnicalAnalysisAgent', description: 'Chart patterns, support/resistance levels' },
        { name: 'SentimentAnalysisAgent', description: 'News sentiment, analyst ratings, social media trends' },
        { name: 'FinalSynthesisAgent', description: 'Comprehensive report with citations and final recommendation' }
      ],
      message: "Sequential agent system is operational"
    });
  } catch (error) {
    console.error("❌ Agent status check failed:", error);
    return NextResponse.json({ 
      error: "Agent status check failed" 
    }, { status: 500 });
  }
}
