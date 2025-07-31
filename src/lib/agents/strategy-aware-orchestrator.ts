/**
 * 🎯 STRATEGY-AWARE SEQUENTIAL ORCHESTRATOR
 * Orchestrates sequential agent analysis with strategy-specific behavior
 */

import { 
  TradingStrategyType, 
  StrategyConfiguration, 
  StrategyOutput, 
  StrategyAnalysisContext,
  StrategySelectionRequest,
  STRATEGY_CONFIGS 
} from '../types/trading-strategy-types';

import { StrategyAwareAgentBase, StrategyAwareAgentOutput } from './strategy-aware-agent-base';
import { SequentialAgentOrchestrator } from './sequential-agent-orchestrator';

export interface StrategyAwareAnalysisInput {
  symbol: string;
  strategy: TradingStrategyType;
  previousAnalysis?: any;
  userId?: string;
}

export class StrategyAwareOrchestrator extends SequentialAgentOrchestrator {
  private currentStrategy!: StrategyConfiguration; // 🎯 FIX: Initialized in runStrategyAwareAnalysis
  private strategyContext!: StrategyAnalysisContext; // 🎯 FIX: Initialized in runStrategyAwareAnalysis

  constructor() {
    super();
  }

  /**
   * 🎯 MAIN ENTRY POINT: Run strategy-aware sequential analysis
   */
  async runStrategyAwareAnalysis(input: StrategyAwareAnalysisInput): Promise<StrategyOutput> {
    const startTime = Date.now();
    console.log(`🎯 [STRATEGY ORCHESTRATOR] Starting ${input.strategy.toUpperCase()} analysis for ${input.symbol}...`);

    try {
      // 1. Set up strategy configuration
      this.currentStrategy = STRATEGY_CONFIGS[input.strategy];
      console.log(`📋 [STRATEGY] Configuration: ${this.currentStrategy.name} (${this.currentStrategy.timeHorizon})`);

      // 2. Get market data with strategy-specific cache timeout
      const marketData = await this.getStrategyAwareMarketData(input.symbol);

      // 3. Create strategy context
      this.strategyContext = {
        strategy: this.currentStrategy,
        symbol: input.symbol,
        marketData,
        timestamp: new Date().toISOString()
      };

      // 4. Run sequential analysis with strategy awareness
      const agentResults = await this.runSequentialAgentsWithStrategy(input);

      // 5. Synthesize strategy-specific output
      const strategyOutput = await this.synthesizeStrategyOutput(agentResults, input);

      const processingTime = Date.now() - startTime;
      console.log(`✅ [STRATEGY ORCHESTRATOR] ${input.strategy.toUpperCase()} analysis completed in ${processingTime}ms`);

      return strategyOutput;

    } catch (error) {
      console.error(`❌ [STRATEGY ORCHESTRATOR] Error in ${input.strategy} analysis:`, error);
      return this.createErrorStrategyOutput(input, error);
    }
  }

  /**
   * Get market data with strategy-specific caching
   */
  private async getStrategyAwareMarketData(symbol: string): Promise<any> {
    // Use strategy-specific cache timeout
    const cacheTimeout = this.currentStrategy.cacheTimeout;
    console.log(`📊 [STRATEGY DATA] Using ${cacheTimeout}ms cache for ${this.currentStrategy.type} trading`);

    // TODO: Implement strategy-specific data fetching
    // For now, use existing data provider with strategy context
    try {
      const { createDataProviderOrchestrator } = await import('../services');
      const orchestrator = await createDataProviderOrchestrator();
      await orchestrator.initialize();
      
      const result = await orchestrator.getComprehensiveData(symbol);
      return result;
    } catch (error) {
      console.error('Error fetching strategy-aware market data:', error);
      return null;
    }
  }

  /**
   * Run sequential agents with strategy context
   */
  private async runSequentialAgentsWithStrategy(input: StrategyAwareAnalysisInput): Promise<{
    technical: StrategyAwareAgentOutput;
    fundamental: StrategyAwareAgentOutput;
    newsSentiment: StrategyAwareAgentOutput;
    marketStructure: StrategyAwareAgentOutput;
  }> {
    console.log(`🤖 [AGENTS] Running sequential analysis with ${input.strategy} strategy weights...`);

    const weights = this.currentStrategy.agentWeights;
    console.log(`   Technical: ${weights.technical}% | Fundamental: ${weights.fundamental}% | News: ${weights.newsSentiment}% | Structure: ${weights.marketStructure}%`);

    // Run agents in sequence with strategy context
    const results = {
      technical: await this.runTechnicalAgentWithStrategy(input),
      fundamental: await this.runFundamentalAgentWithStrategy(input),
      newsSentiment: await this.runNewsAgentWithStrategy(input),
      marketStructure: await this.runMarketStructureAgentWithStrategy(input)
    };

    return results;
  }

  /**
   * Strategy-aware Technical Analysis Agent
   */
  private async runTechnicalAgentWithStrategy(input: StrategyAwareAnalysisInput): Promise<StrategyAwareAgentOutput> {
    const startTime = Date.now();
    console.log(`📈 [TECHNICAL AGENT - ${input.strategy.toUpperCase()}] Starting analysis...`);

    try {
      const relevance = this.currentStrategy.agentWeights.technical;
      const focusIndicators = this.getFocusIndicators();
      
      // Strategy-specific technical analysis logic
      let signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
      let confidence = 50;
      let reasoning = '';
      let keyFactors: string[] = [];
      let risks: string[] = [];
      let strategySpecificInsights: Record<string, any> = {};

      // Adapt analysis based on strategy
      if (input.strategy === 'day') {
        reasoning = 'Day trading technical analysis: Focus on intraday momentum and key levels';
        keyFactors = ['15-min RSI patterns', 'VWAP interaction', 'Volume spikes', 'Intraday support/resistance'];
        risks = ['Intraday reversals', 'Low volume periods', 'News catalyst risk'];
        strategySpecificInsights = {
          timeframe: '15min-1hour',
          keyLevels: 'VWAP, previous day high/low',
          volumeProfile: 'Monitor for unusual activity',
          exitStrategy: 'Before market close or stop loss'
        };
      } else if (input.strategy === 'swing') {
        reasoning = 'Swing trading technical analysis: Multi-day trends and pattern completion';
        keyFactors = ['Daily chart patterns', 'MACD crossovers', 'Key breakout levels', 'Volume confirmation'];
        risks = ['Failed breakouts', 'Earnings proximity', 'Weekend gap risk'];
        strategySpecificInsights = {
          timeframe: '4hour-daily',
          patternRecognition: 'Flag, pennant, triangle patterns',
          trendAnalysis: 'Multi-day momentum',
          holdingPeriod: '3-7 days typically'
        };
      } else { // longterm
        reasoning = 'Long-term technical analysis: Major trend identification and entry timing';
        keyFactors = ['Weekly/monthly trends', 'Long-term moving averages', 'Major support/resistance'];
        risks = ['Sector rotation', 'Long-term trend changes', 'Fundamental shifts'];
        strategySpecificInsights = {
          timeframe: 'weekly-monthly',
          trendStrength: 'Long-term momentum analysis',
          entryTiming: 'Optimal entry within long-term uptrend',
          positionSizing: 'Consider for portfolio allocation'
        };
      }

      // Mock confidence based on strategy relevance
      confidence = Math.min(90, 40 + relevance);

      const processingTime = Date.now() - startTime;
      console.log(`✅ [TECHNICAL AGENT] ${input.strategy} analysis completed in ${processingTime}ms (${confidence}% confidence)`);

      return {
        signal,
        confidence,
        strategyRelevance: relevance,
        reasoning,
        keyFactors,
        risks,
        timeHorizon: this.currentStrategy.timeHorizon,
        strategySpecificInsights
      };

    } catch (error) {
      console.error(`❌ [TECHNICAL AGENT] Error in ${input.strategy} analysis:`, error);
      return this.createErrorAgentOutput(this.currentStrategy.agentWeights.technical);
    }
  }

  /**
   * Strategy-aware Fundamental Analysis Agent
   */
  private async runFundamentalAgentWithStrategy(input: StrategyAwareAnalysisInput): Promise<StrategyAwareAgentOutput> {
    const startTime = Date.now();
    console.log(`🏛️ [FUNDAMENTAL AGENT - ${input.strategy.toUpperCase()}] Starting analysis...`);

    try {
      const relevance = this.currentStrategy.agentWeights.fundamental;
      const depth = this.currentStrategy.parameters.fundamentalDepth;
      
      let signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
      let confidence = 50;
      let reasoning = '';
      let keyFactors: string[] = [];
      let risks: string[] = [];
      let strategySpecificInsights: Record<string, any> = {};

      // Adapt fundamental analysis based on strategy
      if (input.strategy === 'day') {
        reasoning = 'Day trading: Minimal fundamental analysis - checking for earnings/events today only';
        keyFactors = ['No earnings today', 'No major news expected', 'Clear for intraday trading'];
        risks = ['Unexpected news', 'Earnings whispers', 'Analyst comments'];
        confidence = Math.min(70, 30 + relevance); // Lower confidence for day trading fundamentals
        strategySpecificInsights = {
          analysisDepth: 'minimal',
          relevanceNote: 'Fundamentals less important for intraday moves',
          todaysEvents: 'No major catalysts scheduled',
          recommendation: 'Focus on technical analysis'
        };
      } else if (input.strategy === 'swing') {
        reasoning = 'Swing trading: Balanced fundamental analysis focusing on near-term catalysts';
        keyFactors = ['Earnings proximity', 'Recent analyst changes', 'Sector momentum', 'Event calendar'];
        risks = ['Earnings surprise', 'Guidance changes', 'Competitor impact'];
        confidence = Math.min(85, 50 + relevance);
        strategySpecificInsights = {
          analysisDepth: 'standard',
          earingsImpact: 'Next earnings in 3 weeks - low risk',
          analystSentiment: 'Recent upgrade cycle',
          catalystCalendar: 'No major events in next 7 days'
        };
      } else { // longterm
        reasoning = 'Long-term: Deep fundamental analysis of business quality and growth prospects';
        keyFactors = ['Revenue growth trends', 'Competitive moat', 'Management quality', 'Industry outlook'];
        risks = ['Industry disruption', 'Regulatory changes', 'Competitive pressure'];
        confidence = Math.min(95, 60 + relevance); // Highest confidence for long-term fundamentals
        strategySpecificInsights = {
          analysisDepth: 'comprehensive',
          businessQuality: 'Strong competitive position',
          growthProspects: 'Sustainable long-term growth',
          valuation: 'Reasonable at current levels',
          timeHorizon: 'Multi-year investment thesis'
        };
      }

      const processingTime = Date.now() - startTime;
      console.log(`✅ [FUNDAMENTAL AGENT] ${input.strategy} analysis completed in ${processingTime}ms (${confidence}% confidence)`);

      return {
        signal,
        confidence,
        strategyRelevance: relevance,
        reasoning,
        keyFactors,
        risks,
        timeHorizon: this.currentStrategy.timeHorizon,
        strategySpecificInsights
      };

    } catch (error) {
      console.error(`❌ [FUNDAMENTAL AGENT] Error in ${input.strategy} analysis:`, error);
      return this.createErrorAgentOutput(this.currentStrategy.agentWeights.fundamental);
    }
  }

  /**
   * Strategy-aware News Sentiment Agent
   */
  private async runNewsAgentWithStrategy(input: StrategyAwareAnalysisInput): Promise<StrategyAwareAgentOutput> {
    const startTime = Date.now();
    console.log(`📰 [NEWS AGENT - ${input.strategy.toUpperCase()}] Starting analysis...`);

    try {
      const relevance = this.currentStrategy.agentWeights.newsSentiment;
      const timeframe = this.currentStrategy.parameters.newsTimeframe;
      
      let signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
      let confidence = 50;
      let reasoning = '';
      let keyFactors: string[] = [];
      let risks: string[] = [];
      let strategySpecificInsights: Record<string, any> = {};

      // Strategy-specific news analysis
      if (input.strategy === 'day') {
        reasoning = `Day trading: Monitoring breaking news from last ${timeframe} for immediate market impact`;
        keyFactors = ['No breaking news', 'Sector stability', 'Market sentiment neutral'];
        risks = ['Breaking news risk', 'Market maker activity', 'Algo trading reactions'];
        strategySpecificInsights = {
          timeframe: '2 hours',
          urgency: 'high',
          impactType: 'immediate price movement',
          monitoring: 'Real-time news alerts recommended'
        };
      } else if (input.strategy === 'swing') {
        reasoning = `Swing trading: Analyzing news sentiment over ${timeframe} for trend confirmation`;
        keyFactors = ['Positive sector rotation', 'Analyst upgrade cycle', 'No negative headlines'];
        risks = ['Sentiment shift', 'Competitive news', 'Macro headwinds'];
        strategySpecificInsights = {
          timeframe: '3 days',
          trendConfirmation: 'News supports technical setup',
          sentimentMomentum: 'Building positive narrative',
          riskEvents: 'None identified in holding period'
        };
      } else { // longterm
        reasoning = `Long-term: Evaluating news themes over ${timeframe} for investment thesis validation`;
        keyFactors = ['Strong industry tailwinds', 'Management execution', 'ESG improvements'];
        risks = ['Regulatory changes', 'Industry disruption', 'Macro policy shifts'];
        strategySpecificInsights = {
          timeframe: '2 weeks',
          thematicTrends: 'Sector transformation accelerating',
          fundamentalSupport: 'News validates long-term thesis',
          sustainabilityFactors: 'ESG momentum building'
        };
      }

      confidence = Math.min(85, 45 + relevance);

      const processingTime = Date.now() - startTime;
      console.log(`✅ [NEWS AGENT] ${input.strategy} analysis completed in ${processingTime}ms (${confidence}% confidence)`);

      return {
        signal,
        confidence,
        strategyRelevance: relevance,
        reasoning,
        keyFactors,
        risks,
        timeHorizon: this.currentStrategy.timeHorizon,
        strategySpecificInsights
      };

    } catch (error) {
      console.error(`❌ [NEWS AGENT] Error in ${input.strategy} analysis:`, error);
      return this.createErrorAgentOutput(this.currentStrategy.agentWeights.newsSentiment);
    }
  }

  /**
   * Strategy-aware Market Structure Agent
   */
  private async runMarketStructureAgentWithStrategy(input: StrategyAwareAnalysisInput): Promise<StrategyAwareAgentOutput> {
    const startTime = Date.now();
    console.log(`🏗️ [MARKET STRUCTURE - ${input.strategy.toUpperCase()}] Starting analysis...`);

    try {
      const relevance = this.currentStrategy.agentWeights.marketStructure;
      
      let signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
      let confidence = 50;
      let reasoning = '';
      let keyFactors: string[] = [];
      let risks: string[] = [];
      let strategySpecificInsights: Record<string, any> = {};

      // Strategy-specific market structure analysis
      if (input.strategy === 'day') {
        reasoning = 'Day trading: Intraday market structure and liquidity analysis';
        keyFactors = ['Strong intraday liquidity', 'Clear support/resistance', 'Normal bid-ask spreads'];
        risks = ['Liquidity gaps', 'Market maker positioning', 'End-of-day volatility'];
        strategySpecificInsights = {
          liquidityProfile: 'Excellent for day trading',
          marketMakers: 'Active participation',
          volatilityExpected: 'Normal intraday range',
          optimalTradingHours: '9:30 AM - 3:00 PM EST'
        };
      } else if (input.strategy === 'swing') {
        reasoning = 'Swing trading: Multi-day market structure and institutional flow analysis';
        keyFactors = ['Institutional accumulation', 'Options positioning supportive', 'Clean technical levels'];
        risks = ['Options expiration impact', 'Institutional selling', 'Gap risk over weekends'];
        strategySpecificInsights = {
          institutionalFlow: 'Net buying detected',
          optionsActivity: 'Moderate call activity',
          gapRisk: 'Low based on news calendar',
          supportLevels: 'Strong institutional support identified'
        };
      } else { // longterm
        reasoning = 'Long-term: Macro market structure and positioning analysis';
        keyFactors = ['Favorable sector rotation', 'Long-term trend intact', 'Institutional conviction'];
        risks = ['Sector rotation risk', 'Style rotation', 'Macro headwinds'];
        strategySpecificInsights = {
          sectorPosition: 'Beneficiary of current rotation',
          institutionalHoldings: 'Stable ownership base',
          macroEnvironment: 'Supportive for growth',
          longTermTrend: 'Secular growth story intact'
        };
      }

      confidence = Math.min(80, 40 + relevance);

      const processingTime = Date.now() - startTime;
      console.log(`✅ [MARKET STRUCTURE] ${input.strategy} analysis completed in ${processingTime}ms (${confidence}% confidence)`);

      return {
        signal,
        confidence,
        strategyRelevance: relevance,
        reasoning,
        keyFactors,
        risks,
        timeHorizon: this.currentStrategy.timeHorizon,
        strategySpecificInsights
      };

    } catch (error) {
      console.error(`❌ [MARKET STRUCTURE] Error in ${input.strategy} analysis:`, error);
      return this.createErrorAgentOutput(this.currentStrategy.agentWeights.marketStructure);
    }
  }

  /**
   * Synthesize all agent outputs into final strategy-aware output
   */
  private async synthesizeStrategyOutput(
    agentResults: {
      technical: StrategyAwareAgentOutput;
      fundamental: StrategyAwareAgentOutput;
      newsSentiment: StrategyAwareAgentOutput;
      marketStructure: StrategyAwareAgentOutput;
    },
    input: StrategyAwareAnalysisInput
  ): Promise<StrategyOutput> {
    console.log(`🔮 [SYNTHESIS] Creating ${input.strategy} strategy output...`);

    const weights = this.currentStrategy.agentWeights;
    
    // Weighted confidence calculation
    const weightedConfidence = (
      (agentResults.technical.confidence * weights.technical) +
      (agentResults.fundamental.confidence * weights.fundamental) +
      (agentResults.newsSentiment.confidence * weights.newsSentiment) +
      (agentResults.marketStructure.confidence * weights.marketStructure)
    ) / 100;

    // Determine overall signal based on weighted inputs
    let overallSignal: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
    
    // Simple signal aggregation (can be enhanced with more sophisticated logic)
    const signals = [
      agentResults.technical.signal,
      agentResults.fundamental.signal,
      agentResults.newsSentiment.signal,
      agentResults.marketStructure.signal
    ];
    
    const bullishCount = signals.filter(s => s === 'BULLISH').length;
    const bearishCount = signals.filter(s => s === 'BEARISH').length;
    
    if (bullishCount > bearishCount) {
      overallSignal = 'BULLISH';
    } else if (bearishCount > bullishCount) {
      overallSignal = 'BEARISH';
    }

    // Strategy-specific metrics
    const strategyMetrics = this.calculateStrategyMetrics(input.symbol, overallSignal, agentResults);

    return {
      symbol: input.symbol, // 🎯 FIX: Added missing symbol property
      strategy: input.strategy,
      prediction: overallSignal,
      confidence: Math.round(weightedConfidence),
      timeHorizon: this.currentStrategy.timeHorizon,
      
      validityPeriod: this.currentStrategy.validityPeriod,
      analysisTimestamp: new Date().toISOString(),
      
      strategyMetrics,
      
      reasoning: {
        primary: this.generatePrimaryReasoning(overallSignal, input.strategy, agentResults),
        supporting: this.extractSupportingFactors(agentResults),
        risks: this.extractRisks(agentResults),
        catalysts: this.extractCatalysts(agentResults, input.strategy)
      },
      
      agentContributions: {
        technical: {
          signal: agentResults.technical.signal,
          confidence: agentResults.technical.confidence,
          strategyRelevance: agentResults.technical.strategyRelevance
        },
        fundamental: {
          signal: agentResults.fundamental.signal,
          confidence: agentResults.fundamental.confidence,
          strategyRelevance: agentResults.fundamental.strategyRelevance
        },
        newsSentiment: {
          signal: agentResults.newsSentiment.signal,
          confidence: agentResults.newsSentiment.confidence,
          strategyRelevance: agentResults.newsSentiment.strategyRelevance
        },
        marketStructure: {
          signal: agentResults.marketStructure.signal,
          confidence: agentResults.marketStructure.confidence,
          strategyRelevance: agentResults.marketStructure.strategyRelevance
        }
      }
    };
  }

  private calculateStrategyMetrics(symbol: string, signal: string, agentResults: any): any {
    // Mock strategy-specific metrics (in real implementation, calculate based on market data)
    return {
      expectedHoldPeriod: this.currentStrategy.timeHorizon,
      riskRewardRatio: this.currentStrategy.type === 'day' ? '1:2' : 
                      this.currentStrategy.type === 'swing' ? '1:3' : '1:4',
      stopLoss: 195.50,
      targetPrice: 225.00,
      keyLevels: {
        support: [195.50, 190.00],
        resistance: [210.00, 225.00]
      }
    };
  }

  private generatePrimaryReasoning(signal: string, strategy: string, agentResults: any): string {
    return `${signal} ${strategy} trading opportunity based on weighted analysis of technical patterns, fundamental factors, news sentiment, and market structure.`;
  }

  private extractSupportingFactors(agentResults: any): string[] {
    const factors: string[] = [];
    Object.values(agentResults).forEach((result: any) => {
      factors.push(...result.keyFactors.slice(0, 2)); // Top 2 factors from each agent
    });
    return factors.slice(0, 6); // Limit to top 6 overall
  }

  private extractRisks(agentResults: any): string[] {
    const risks: string[] = [];
    Object.values(agentResults).forEach((result: any) => {
      risks.push(...result.risks.slice(0, 2));
    });
    return risks.slice(0, 6);
  }

  private extractCatalysts(agentResults: any, strategy: string): string[] {
    // Strategy-specific catalyst identification
    const catalysts = strategy === 'day' ? 
      ['Volume breakout', 'Technical breakout', 'News catalyst'] :
      strategy === 'swing' ?
      ['Earnings beat', 'Analyst upgrade', 'Sector rotation'] :
      ['Management guidance', 'New product launch', 'Market expansion'];
    
    return catalysts;
  }

  private getFocusIndicators(): string[] {
    return this.currentStrategy.parameters.focusIndicators;
  }

  private createErrorAgentOutput(relevance: number): StrategyAwareAgentOutput {
    return {
      signal: 'NEUTRAL',
      confidence: 0,
      strategyRelevance: relevance,
      reasoning: 'Analysis failed due to technical error',
      keyFactors: [],
      risks: ['Analysis unavailable'],
      timeHorizon: 'Unknown',
      strategySpecificInsights: {}
    };
  }

  private createErrorStrategyOutput(input: StrategyAwareAnalysisInput, error: any): StrategyOutput {
    return {
      symbol: input.symbol, // 🎯 FIX: Added missing symbol property
      strategy: input.strategy,
      prediction: 'NEUTRAL',
      confidence: 0,
      timeHorizon: 'Unknown',
      validityPeriod: {
        optimal: 'Unknown',
        acceptable: 'Unknown',
        stale: 'Unknown',
        degradeRate: 0
      },
      analysisTimestamp: new Date().toISOString(),
      strategyMetrics: {
        expectedHoldPeriod: 'Unknown',
        riskRewardRatio: 'Unknown',
        keyLevels: { support: [], resistance: [] }
      },
      reasoning: {
        primary: `Strategy analysis failed: ${error.message}`,
        supporting: [],
        risks: ['Analysis unavailable due to technical error'],
        catalysts: []
      },
      agentContributions: {
        technical: { signal: 'NEUTRAL', confidence: 0, strategyRelevance: 0 },
        fundamental: { signal: 'NEUTRAL', confidence: 0, strategyRelevance: 0 },
        newsSentiment: { signal: 'NEUTRAL', confidence: 0, strategyRelevance: 0 },
        marketStructure: { signal: 'NEUTRAL', confidence: 0, strategyRelevance: 0 }
      }
    };
  }
}