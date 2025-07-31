import { NextResponse } from "next/server";
import { db } from "@/lib/database";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SequentialAgentOrchestrator } from "@/lib/agents/sequential-agent-orchestrator";

export async function POST(req: Request) {
  const { symbol, predictionDate } = await req.json();

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
  }

  // Get user session
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user_id = session.user.email;

  try {
    console.log(`🔄 Starting sequential analysis for ${symbol}...`);
    
    // Validate symbol format
    if (!/^[A-Z0-9\-\.]+$/i.test(symbol)) {
      return NextResponse.json({ 
        error: 'Invalid symbol format',
        details: 'Symbol should contain only letters, numbers, dots, and hyphens'
      }, { status: 400 });
    }
    
    // Initialize the sequential orchestrator
    const orchestrator = new SequentialAgentOrchestrator();
    
    // Run the sequential agent chain with timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Analysis timeout after 5 minutes')), 300000)
    );
    
    const analysisResult = await Promise.race([
      orchestrator.runSequentialAnalysis(symbol),
      timeoutPromise
    ]) as any;
    
    // Map the final verdict to database format
    const dbVerdict = mapVerdictToDb(analysisResult.finalVerdict?.direction || 'HOLD');
    
    // Save comprehensive prediction to database
    let predictionId: number;
    try {
      predictionId = db.savePredictionVerdict({
        user_id,
        symbol,
        prediction_date: predictionDate || new Date().toISOString().split('T')[0],
        verdict: dbVerdict,
        confidence: analysisResult.finalVerdict?.confidence || 50,
        reasoning: analysisResult.finalVerdict?.reasoning || 'No reasoning available',
        market_context: JSON.stringify({
          type: 'sequential_analysis',
          executiveSummary: analysisResult.executiveSummary || 'No summary available',
          priceTarget: analysisResult.finalVerdict?.priceTarget || 0,
          timeHorizon: analysisResult.finalVerdict?.timeHorizon || 'Unknown',
          risk: analysisResult.finalVerdict?.risk || 'UNKNOWN',
          keyRisks: analysisResult.keyRisks || [],
          catalysts: analysisResult.catalysts || [],
          agentChain: analysisResult.agentChain || [],
          totalProcessingTime: analysisResult.totalProcessingTime || 0
        })
      });
    } catch (dbError) {
      console.error('Database save error:', dbError);
      // Continue with response even if database save fails
      predictionId = -1;
    }

    // Return comprehensive analysis result
    return NextResponse.json({
      success: true,
      predictionId,
      analysis: {
        symbol: analysisResult.symbol || symbol,
        timestamp: analysisResult.timestamp || new Date().toISOString(),
        executiveSummary: analysisResult.executiveSummary || 'No summary available',
        
        // Final verdict (with safe property access)
        finalVerdict: analysisResult.finalVerdict || {
          direction: 'HOLD',
          confidence: 50,
          priceTarget: 0,
          timeHorizon: 'Unknown',
          risk: 'UNKNOWN'
        },
        
        // Individual agent analyses (with safe property access)
        quantAnalysis: {
          priceAnalysis: analysisResult.quantAnalysis?.priceAnalysis || null,
          technicalIndicators: analysisResult.quantAnalysis?.technicalIndicators || null,
          volumeAnalysis: analysisResult.quantAnalysis?.volumeAnalysis || null,
          riskMetrics: analysisResult.quantAnalysis?.riskMetrics || null,
          confidence: analysisResult.quantAnalysis?.confidence || 0
        },
        
        marketAnalysis: {
          companyOverview: analysisResult.marketAnalysis?.companyOverview || null,
          financialHealth: analysisResult.marketAnalysis?.financialHealth || null,
          recentDevelopments: analysisResult.marketAnalysis?.recentDevelopments || [],
          upcomingCatalysts: analysisResult.marketAnalysis?.upcomingCatalysts || [],
          confidence: analysisResult.marketAnalysis?.confidence || 0
        },
        
        technicalAnalysis: {
          priceAction: analysisResult.technicalAnalysis?.priceAction || null,
          technicalIndicators: analysisResult.technicalAnalysis?.technicalIndicators || null,
          trendAnalysis: analysisResult.technicalAnalysis?.trendAnalysis || null,
          priceTargets: analysisResult.technicalAnalysis?.priceTargets || null,
          confidence: analysisResult.technicalAnalysis?.confidence || 0
        },
        
        sentimentAnalysis: {
          newsAnalysis: analysisResult.sentimentAnalysis?.newsAnalysis || null,
          analystSentiment: analysisResult.sentimentAnalysis?.analystSentiment || null,
          socialSentiment: analysisResult.sentimentAnalysis?.socialSentiment || null,
          overallSentiment: analysisResult.sentimentAnalysis?.sentimentIntegration?.overallSentimentScore || null,
          confidence: analysisResult.sentimentAnalysis?.confidence || 0
        },
        
        // Risk and catalysts (with safe property access)
        keyRisks: analysisResult.keyRisks || [],
        catalysts: analysisResult.catalysts || [],
        
        // Transparency (with safe property access)
        citedSources: analysisResult.allCitations || [],
        agentChain: analysisResult.agentChain || [],
        
        // Metadata
        totalProcessingTime: analysisResult.totalProcessingTime || 0
      }
    });

  } catch (error) {
    console.error(`❌ Sequential analysis failed for ${symbol}:`, error);
    
    // Return error with details for debugging
    return NextResponse.json({ 
      error: 'Sequential analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      symbol,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Helper function to map analysis verdict to database format
function mapVerdictToDb(direction: 'BUY' | 'SELL' | 'HOLD'): 'UP' | 'DOWN' | 'NEUTRAL' {
  switch (direction) {
    case 'BUY':
      return 'UP';
    case 'SELL':
      return 'DOWN';
    case 'HOLD':
    default:
      return 'NEUTRAL';
  }
}

// GET endpoint to retrieve analysis history
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol');
  const limit = parseInt(searchParams.get('limit') || '10');

  // Get user session
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get analysis history from database
    const user_id = session.user.email;
    const predictions = symbol ? 
      db.getPredictionsBySymbol(user_id, symbol, limit) : 
      db.getRecentPredictions(user_id, limit);
    
    // Parse market_context back to objects for comprehensive analyses
    const analysisHistory = predictions.map((prediction: any) => {
      let marketContext = {};
      try {
        marketContext = JSON.parse(prediction.market_context || '{}');
      } catch {
        marketContext = { note: 'Legacy prediction format' };
      }

      return {
        id: prediction.id,
        symbol: prediction.symbol,
        predictionDate: prediction.prediction_date,
        verdict: prediction.verdict,
        confidence: prediction.confidence,
        reasoning: prediction.reasoning,
        analysisDetails: marketContext,
        timestamp: prediction.created_at
      };
    });

    return NextResponse.json({
      success: true,
      symbol,
      analysisHistory,
      total: analysisHistory.length
    });

  } catch (error) {
    console.error('Error retrieving analysis history:', error);
    return NextResponse.json({ 
      error: 'Failed to retrieve analysis history',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}