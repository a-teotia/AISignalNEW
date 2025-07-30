import { NextResponse } from "next/server";
import { AgentOrchestrator } from "@/lib/agents/agent-orchestrator";
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

    console.log(`🚀 Starting multi-agent prediction for ${symbol}`);
    
    const orchestrator = new AgentOrchestrator();
    const multiAgentResult = await orchestrator.runMultiAgentAnalysis(symbol);

    console.log(`✅ Multi-agent analysis completed for ${symbol}`);

    // Convert SIDEWAYS to NEUTRAL for database compatibility
    const verdict = multiAgentResult.finalPrediction.direction === 'SIDEWAYS' ? 'NEUTRAL' : multiAgentResult.finalPrediction.direction;

    // Save to database
    const predictionId = db.savePredictionVerdict({
      user_id,
      symbol,
      prediction_date: predictionDate || new Date().toISOString().split('T')[0],
      verdict: verdict as 'UP' | 'DOWN' | 'NEUTRAL',
      confidence: multiAgentResult.confidence,
      reasoning: multiAgentResult.agents.synth.data.reasoning?.chainOfThought || 
                `Multi-agent analysis: ${verdict} with ${multiAgentResult.confidence}% confidence`,
      market_context: JSON.stringify(multiAgentResult.agents),
      entry: multiAgentResult.finalPrediction.entryPrice,
      tp: multiAgentResult.finalPrediction.takeProfit,
      sl: multiAgentResult.finalPrediction.stopLoss,
      timeframe: tradingStyle === 'swing' ? '4H' : tradingStyle === 'day' ? '1H' : tradingStyle === 'long' ? '1D' : tradingStyle === 'scalper' ? '15M' : '4H',
      style: tradingStyle
    });

    console.log(`💾 Prediction saved to database with ID: ${predictionId}`);

    return NextResponse.json({
      success: true,
      predictionId,
      result: multiAgentResult,
      message: "Multi-agent analysis completed successfully"
    });

  } catch (error) {
    console.error("❌ Multi-agent analysis error:", error);
    return NextResponse.json({ 
      error: "Multi-agent analysis failed",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint to check agent status
export async function GET() {
  try {
    const orchestrator = new AgentOrchestrator();
    const agentStatus = orchestrator.getAgentStatus();
    
    return NextResponse.json({
      success: true,
      agents: agentStatus,
      message: "Multi-agent system is operational"
    });
  } catch (error) {
    console.error("❌ Agent status check failed:", error);
    return NextResponse.json({ 
      error: "Agent status check failed" 
    }, { status: 500 });
  }
}
