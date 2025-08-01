/**
 * 🎯 STRATEGY-AWARE ANALYSIS API ENDPOINT
 * Handles sequential analysis with strategy-specific agent behavior
 */

import { NextRequest, NextResponse } from 'next/server';
import { StrategyAwareOrchestrator } from '@/lib/agents/strategy-aware-orchestrator';
import { TradingStrategyType } from '@/lib/types/trading-strategy-types';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('🎯 [STRATEGY API] Starting strategy-aware analysis...');
    
    const body = await request.json();
    const { symbol, strategy, predictionDate, userId } = body;

    // Validate inputs
    if (!symbol) {
      return NextResponse.json({
        success: false,
        error: 'Symbol is required'
      }, { status: 400 });
    }

    if (!strategy) {
      return NextResponse.json({
        success: false,
        error: 'Trading strategy is required'
      }, { status: 400 });
    }

    // Validate strategy type
    const validStrategies: TradingStrategyType[] = ['day', 'swing', 'longterm'];
    if (!validStrategies.includes(strategy)) {
      return NextResponse.json({
        success: false,
        error: `Invalid strategy. Must be one of: ${validStrategies.join(', ')}`
      }, { status: 400 });
    }

    console.log(`🎯 [STRATEGY API] Analyzing ${symbol} with ${strategy} strategy...`);

    // Initialize strategy-aware orchestrator
    const orchestrator = new StrategyAwareOrchestrator();
    
    // Run strategy-aware analysis
    const result = await orchestrator.runStrategyAwareAnalysis({
      symbol: symbol.toUpperCase(),
      strategy: strategy as TradingStrategyType,
      userId: userId || 'anonymous'
    });

    const processingTime = Date.now() - startTime;
    console.log(`✅ [STRATEGY API] Analysis completed in ${processingTime}ms`);

    // Transform result to match existing dashboard expectations
    const transformedResult = {
      success: true,
      analysis: {
        symbol: result.symbol,
        executiveSummary: result.reasoning.primary,
        finalVerdict: {
          direction: result.prediction === 'BULLISH' ? 'BUY' : 
                    result.prediction === 'BEARISH' ? 'SELL' : 'HOLD',
          confidence: result.confidence,
          priceTarget: result.strategyMetrics.targetPrice || 0,
          timeHorizon: result.timeHorizon,
          risk: result.strategyMetrics.riskRewardRatio.includes('1:4') ? 'LOW' :
                result.strategyMetrics.riskRewardRatio.includes('1:3') ? 'MEDIUM' : 'HIGH',
          reasoning: result.reasoning.primary
        },
        
        // Strategy-specific analysis breakdown
        strategyAnalysis: {
          strategy: result.strategy,
          agentWeights: result.agentContributions,
          validityPeriod: result.validityPeriod,
          analysisTimestamp: result.analysisTimestamp,
          strategyMetrics: result.strategyMetrics
        },

        // Agent results (transformed for compatibility)
        quantAnalysis: {
          signal: result.agentContributions.technical.signal,
          confidence: result.agentContributions.technical.confidence,
          reasoning: 'Technical analysis adapted for ' + result.strategy + ' trading'
        },
        
        marketAnalysis: {
          signal: result.agentContributions.marketStructure.signal,
          confidence: result.agentContributions.marketStructure.confidence,
          reasoning: 'Market structure analysis for ' + result.strategy + ' timeframe'
        },
        
        technicalAnalysis: {
          signal: result.agentContributions.technical.signal,
          confidence: result.agentContributions.technical.confidence,
          reasoning: 'Strategy-aware technical analysis'
        },
        
        sentimentAnalysis: {
          signal: result.agentContributions.newsSentiment.signal,
          confidence: result.agentContributions.newsSentiment.confidence,
          reasoning: 'News sentiment analysis tailored for ' + result.strategy
        },
        
        fundamentalAnalysis: {
          signal: result.agentContributions.fundamental.signal,
          confidence: result.agentContributions.fundamental.confidence,
          reasoning: 'Fundamental analysis weighted for ' + result.strategy + ' strategy'
        },

        keyRisks: result.reasoning.risks,
        catalysts: result.reasoning.catalysts.map(catalyst => ({
          type: 'positive',
          description: catalyst,
          impact: 'medium'
        })),
        citedSources: [], // TODO: Implement source tracking
        agentChain: [
          'StrategyConfiguration',
          'TechnicalAnalysis',
          'FundamentalAnalysis', 
          'NewsSentiment',
          'MarketStructure',
          'FinalSynthesis'
        ],
        totalProcessingTime: processingTime,

        // Enhanced strategy-specific data
        strategyOutput: result // Include full strategy output for enhanced UI
      }
    };

    return NextResponse.json(transformedResult);

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('❌ [STRATEGY API] Error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Strategy analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      processingTime
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fetchHistory = searchParams.get('history');
    
    // If requesting analysis history
    if (fetchHistory === 'true') {
      const { getServerSession } = await import('next-auth');
      const { authOptions } = await import('@/lib/auth');
      const { db } = await import('@/lib/database');
      
      const symbol = searchParams.get('symbol');
      const limit = parseInt(searchParams.get('limit') || '10');
      
      // Get user session
      const session = await getServerSession(authOptions);
      if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      const user_id = session.user.email;
      
      // Get analysis history from database
      const predictions = symbol ? 
        db.getPredictionsBySymbol(user_id, symbol, limit) :
        db.getPredictionsWithResults(user_id, '', limit);
      
      // Transform data to include strategy-aware information
      const transformedAnalyses = predictions.map((analysis: any) => ({
        id: analysis.id,
        symbol: analysis.symbol,
        timestamp: analysis.timestamp,
        verdict: analysis.verdict,
        confidence: analysis.confidence,
        reasoning: analysis.reasoning,
        priceTarget: analysis.analysisDetails?.priceTarget,
        strategy: analysis.strategy || 'swing', // Default to swing if not specified
        agentChain: analysis.analysisDetails?.agentChain || [
          'StrategyConfiguration', 'TechnicalAnalysis', 'FundamentalAnalysis', 
          'NewsSentiment', 'MarketStructure', 'FinalSynthesis'
        ],
        fullAnalysis: {
          executiveSummary: analysis.analysisDetails?.executiveSummary || analysis.reasoning,
          finalVerdict: analysis.analysisDetails?.finalVerdict || {
            direction: analysis.verdict,
            confidence: analysis.confidence,
            reasoning: analysis.reasoning
          },
          strategyAnalysis: analysis.analysisDetails?.strategyAnalysis || {
            strategy: analysis.strategy || 'swing',
            agentWeights: {}
          }
        }
      }));
      
      return NextResponse.json({
        success: true,
        analysisHistory: transformedAnalyses,
        totalCount: predictions.length
      });
    }
    
    // Default: Return strategy configuration information
    const { STRATEGY_CONFIGS } = await import('@/lib/types/trading-strategy-types');
    
    return NextResponse.json({
      success: true,
      strategies: STRATEGY_CONFIGS,
      availableStrategies: ['day', 'swing', 'longterm'],
      message: 'Strategy-aware analysis endpoint ready'
    });
    
  } catch (error) {
    console.error('❌ [STRATEGY API] GET Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to load strategy configurations or analysis history'
    }, { status: 500 });
  }
}