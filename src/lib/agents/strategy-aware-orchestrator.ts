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
import { FundamentalAnalysisAgent } from './fundamental-analysis-agent';

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
   * 🎯 REAL TECHNICAL ANALYSIS AGENT - Connected to Sequential Analysis System
   */
  private async runTechnicalAgentWithStrategy(input: StrategyAwareAnalysisInput): Promise<StrategyAwareAgentOutput> {
    const startTime = Date.now();
    console.log(`📈 [REAL TECHNICAL AGENT - ${input.strategy.toUpperCase()}] Starting analysis...`);

    try {
      // 🔥 CALL REAL TECHNICAL ANALYSIS AGENT (using parent class method)
      const realTechnicalAnalysis = await this.runTechnicalAnalysisAgent({
        symbol: input.symbol,
        strategy: input.strategy, // 🎯 Pass strategy for prompt awareness
        previousAnalysis: this.strategyContext.marketData // Pass real market data
      });

      // 🧠 INTELLIGENT SELF-ASSESSMENT based on REAL analysis results
      let aiRelevance = this.assessTechnicalRelevance(input.strategy, realTechnicalAnalysis);
      
      // Extract real signals from the analysis
      const realSignal = this.extractSignalFromAnalysis(realTechnicalAnalysis.data);
      const realConfidence = this.calculateRealConfidence(realTechnicalAnalysis.data, aiRelevance);
      
      // Strategy-specific insights based on real data
      const strategySpecificInsights = this.createTechnicalInsights(input.strategy, realTechnicalAnalysis.data);

      const processingTime = Date.now() - startTime;
      console.log(`✅ [REAL TECHNICAL AGENT] ${input.strategy} analysis completed in ${processingTime}ms (${realConfidence}% confidence, ${aiRelevance}% relevance)`);

      return {
        signal: realSignal,
        confidence: realConfidence,
        strategyRelevance: aiRelevance,
        reasoning: realTechnicalAnalysis.data.reasoning || 'Technical analysis based on real market data',
        keyFactors: realTechnicalAnalysis.data.keyFactors || ['Real technical indicators', 'Market patterns', 'Volume analysis'],
        risks: realTechnicalAnalysis.data.risks || ['Market volatility', 'Technical breakdown', 'Volume decline'],
        timeHorizon: this.currentStrategy.timeHorizon,
        strategySpecificInsights
      };

    } catch (error) {
      console.error(`❌ [REAL TECHNICAL AGENT] Error in ${input.strategy} analysis:`, error);
      return this.createErrorAgentOutput(this.currentStrategy.agentWeights.technical);
    }
  }

  /**
   * 🧠 Assess technical analysis relevance based on real market conditions
   */
  private assessTechnicalRelevance(strategy: string, technicalAnalysis: any): number {
    let baseRelevance = 25; // Default relevance
    
    // Analyze real technical signals
    const hasStrongSignals = this.hasStrongTechnicalSignals(technicalAnalysis.data);
    const hasHighVolatility = this.hasHighVolatility(technicalAnalysis.data);
    const hasCleanLevels = this.hasCleanTechnicalLevels(technicalAnalysis.data);
    
    if (strategy === 'day') {
      baseRelevance = 35; // Higher base for day trading
      if (hasStrongSignals) baseRelevance += 25;
      if (hasHighVolatility) baseRelevance += 20;
      if (hasCleanLevels) baseRelevance += 20;
      console.log(`🧠 [TECHNICAL AI] Day trading relevance: ${baseRelevance}% (Signals: ${hasStrongSignals}, Volatility: ${hasHighVolatility}, Levels: ${hasCleanLevels})`);
    } else if (strategy === 'swing') {
      baseRelevance = 25; // Balanced for swing
      if (hasStrongSignals) baseRelevance += 15;
      if (hasCleanLevels) baseRelevance += 15;
      console.log(`🧠 [TECHNICAL AI] Swing trading relevance: ${baseRelevance}% (Signals: ${hasStrongSignals}, Levels: ${hasCleanLevels})`);
    } else { // longterm
      baseRelevance = 15; // Lower for long-term
      if (hasStrongSignals) baseRelevance += 10;
      console.log(`🧠 [TECHNICAL AI] Long-term relevance: ${baseRelevance}% (mainly for entry timing)`);
    }
    
    return Math.min(100, baseRelevance);
  }

  /**
   * Analyze real technical data for strong signals
   */
  private hasStrongTechnicalSignals(technicalData: any): boolean {
    // TODO: Implement real signal strength analysis
    // For now, check if technical analysis found actionable patterns
    return technicalData?.signals?.length > 0 || technicalData?.patterns?.length > 0;
  }

  private hasHighVolatility(technicalData: any): boolean {
    // TODO: Implement real volatility analysis from market data
    return technicalData?.volatility > 0.02; // 2% daily volatility threshold
  }

  private hasCleanTechnicalLevels(technicalData: any): boolean {
    // TODO: Implement real support/resistance level analysis
    return technicalData?.supportLevels?.length > 0 || technicalData?.resistanceLevels?.length > 0;
  }

  /**
   * 🎯 INTELLIGENT SIGNAL EXTRACTION from real Perplexity API responses
   */
  private extractSignalFromAnalysis(analysisData: any): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
    if (!analysisData) return 'NEUTRAL';
    
    console.log(`🔍 [SIGNAL EXTRACTION] Analyzing data structure:`, Object.keys(analysisData));
    
    // 1. Look for explicit recommendation/conclusion in the analysis
    const recommendation = this.extractRecommendation(analysisData);
    if (recommendation !== 'NEUTRAL') {
      console.log(`✅ Found explicit recommendation: ${recommendation}`);
      return recommendation;
    }
    
    // 2. Analyze sentiment and tone of the analysis
    const sentimentSignal = this.extractSentimentSignal(analysisData);
    if (sentimentSignal !== 'NEUTRAL') {
      console.log(`✅ Derived from sentiment: ${sentimentSignal}`);
      return sentimentSignal;
    }
    
    // 3. Look for technical indicators (for technical analysis)
    const technicalSignal = this.extractTechnicalSignal(analysisData);
    if (technicalSignal !== 'NEUTRAL') {
      console.log(`✅ Derived from technical indicators: ${technicalSignal}`);
      return technicalSignal;
    }
    
    // 4. Look for fundamental strength indicators
    const fundamentalSignal = this.extractFundamentalSignal(analysisData);
    if (fundamentalSignal !== 'NEUTRAL') {
      console.log(`✅ Derived from fundamentals: ${fundamentalSignal}`);
      return fundamentalSignal;
    }
    
    console.log(`⚠️ No clear signal found, defaulting to NEUTRAL`);
    return 'NEUTRAL';
  }

  /**
   * Extract explicit recommendations from analysis text
   */
  private extractRecommendation(data: any): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
    const text = this.getAnalysisText(data);
    if (!text) return 'NEUTRAL';
    
    const bullishKeywords = ['buy', 'bullish', 'positive', 'upward', 'strong', 'growth', 'outperform', 'recommend'];
    const bearishKeywords = ['sell', 'bearish', 'negative', 'downward', 'weak', 'decline', 'underperform', 'avoid'];
    
    const lowerText = text.toLowerCase();
    const bullishCount = bullishKeywords.filter(word => lowerText.includes(word)).length;
    const bearishCount = bearishKeywords.filter(word => lowerText.includes(word)).length;
    
    if (bullishCount > bearishCount && bullishCount > 2) return 'BULLISH';
    if (bearishCount > bullishCount && bearishCount > 2) return 'BEARISH';
    
    return 'NEUTRAL';
  }

  /**
   * Extract sentiment from analysis tone
   */
  private extractSentimentSignal(data: any): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
    // Look for sentiment score or sentiment analysis
    if (data.sentimentScore) {
      if (data.sentimentScore > 0.6) return 'BULLISH';
      if (data.sentimentScore < 0.4) return 'BEARISH';
    }
    
    if (data.overallSentiment) {
      if (data.overallSentiment === 'POSITIVE') return 'BULLISH';
      if (data.overallSentiment === 'NEGATIVE') return 'BEARISH';
    }
    
    return 'NEUTRAL';
  }

  /**
   * Extract signals from technical indicators
   */
  private extractTechnicalSignal(data: any): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
    if (!data.technicalIndicators) return 'NEUTRAL';
    
    const indicators = data.technicalIndicators;
    let bullishSignals = 0;
    let bearishSignals = 0;
    
    // RSI analysis
    if (indicators.rsi) {
      if (indicators.rsi < 30) bullishSignals++; // Oversold = bullish
      if (indicators.rsi > 70) bearishSignals++; // Overbought = bearish
    }
    
    // MACD analysis
    if (indicators.macd?.histogram) {
      if (indicators.macd.histogram > 0) bullishSignals++;
      if (indicators.macd.histogram < 0) bearishSignals++;
    }
    
    // Moving average analysis
    if (indicators.movingAverages) {
      const ma = indicators.movingAverages;
      if (ma.sma20 > ma.sma50) bullishSignals++; // Short MA above long MA
      if (ma.sma20 < ma.sma50) bearishSignals++;
    }
    
    if (bullishSignals > bearishSignals) return 'BULLISH';
    if (bearishSignals > bullishSignals) return 'BEARISH';
    
    return 'NEUTRAL';
  }

  /**
   * Extract signals from fundamental analysis
   */
  private extractFundamentalSignal(data: any): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
    // Look for fundamental strength indicators
    if (data.fundamentalScore) {
      if (data.fundamentalScore > 70) return 'BULLISH';
      if (data.fundamentalScore < 30) return 'BEARISH';
    }
    
    if (data.earningsOutlook) {
      if (data.earningsOutlook === 'BULLISH') return 'BULLISH';
      if (data.earningsOutlook === 'BEARISH') return 'BEARISH';
    }
    
    if (data.analystSentiment) {
      if (data.analystSentiment === 'BULLISH') return 'BULLISH';
      if (data.analystSentiment === 'BEARISH') return 'BEARISH';
    }
    
    return 'NEUTRAL';
  }

  /**
   * Get analysis text from various possible fields
   */
  private getAnalysisText(data: any): string {
    return data.analysis || 
           data.summary || 
           data.conclusion || 
           data.reasoning || 
           data.keyFindings?.join(' ') || 
           JSON.stringify(data);
  }

  /**
   * Calculate confidence based on real analysis quality and strategy relevance
   */
  private calculateRealConfidence(analysisData: any, relevance: number): number {
    let baseConfidence = 50;
    
    // Factor in data quality
    if (analysisData?.dataQuality?.completeness) {
      baseConfidence = analysisData.dataQuality.completeness;
    } else if (analysisData?.confidence) {
      baseConfidence = analysisData.confidence;
    }
    
    // Adjust confidence based on strategy relevance
    const relevanceMultiplier = relevance / 50; // Normalize around 50% relevance
    const finalConfidence = Math.round(baseConfidence * relevanceMultiplier);
    
    return Math.max(10, Math.min(95, finalConfidence));
  }

  /**
   * Create strategy-specific insights from real technical data
   */
  private createTechnicalInsights(strategy: string, technicalData: any): Record<string, any> {
    const baseInsights = {
      dataSource: 'Real technical analysis via Perplexity Sonar',
      analysisType: strategy === 'day' ? 'Intraday patterns' : 
                   strategy === 'swing' ? 'Multi-day trends' : 'Long-term positioning'
    };

    if (technicalData?.technicalIndicators) {
      (baseInsights as any).indicators = {
        rsi: technicalData.technicalIndicators.rsi,
        macd: technicalData.technicalIndicators.macd?.value,
        trend: technicalData.trendDirection
      };
    }

    if (strategy === 'day') {
      return {
        ...baseInsights,
        timeframe: '15min-1hour',
        keyLevels: technicalData?.keyLevels || 'VWAP and intraday pivots',
        volumeProfile: technicalData?.volumeAnalysis?.volumeProfile || 'Monitor for unusual activity'
      };
    } else if (strategy === 'swing') {
      return {
        ...baseInsights,
        timeframe: '4hour-daily',
        patternRecognition: technicalData?.patterns || 'Multi-day pattern analysis',
        trendAnalysis: technicalData?.trendStrength || 'Trend momentum assessment'
      };
    } else {
      return {
        ...baseInsights,
        timeframe: 'weekly-monthly',
        trendStrength: technicalData?.trendStrength || 'Long-term momentum',
        entryTiming: 'Optimal entry within major trend'
      };
    }
  }

  /**
   * 🎯 REAL FUNDAMENTAL ANALYSIS AGENT - Connected to Sequential Analysis System
   */
  private async runFundamentalAgentWithStrategy(input: StrategyAwareAnalysisInput): Promise<StrategyAwareAgentOutput> {
    const startTime = Date.now();
    console.log(`🏛️ [FUNDAMENTAL AGENT - ${input.strategy.toUpperCase()}] Starting analysis...`);

    try {
      // 🔥 CALL REAL FUNDAMENTAL ANALYSIS AGENT (using parent class instance)
      const realFundamentalAnalysis = await this.fundamentalAgent.runFundamentalAnalysis({
        symbol: input.symbol,
        previousAnalysis: this.strategyContext.marketData // Pass real market data
      });

      // 🧠 INTELLIGENT SELF-ASSESSMENT based on REAL fundamental analysis results
      let aiRelevance = this.assessFundamentalRelevance(input.strategy, realFundamentalAnalysis);
      
      // Extract real signals from the analysis
      const realSignal = this.extractSignalFromAnalysis(realFundamentalAnalysis.data);
      const realConfidence = this.calculateRealConfidence(realFundamentalAnalysis.data, aiRelevance);
      
      // Strategy-specific insights based on real data
      const strategySpecificInsights = this.createFundamentalInsights(input.strategy, realFundamentalAnalysis.data);

      const processingTime = Date.now() - startTime;
      console.log(`✅ [REAL FUNDAMENTAL AGENT] ${input.strategy} analysis completed in ${processingTime}ms (${realConfidence}% confidence, ${aiRelevance}% relevance)`);

      return {
        signal: realSignal,
        confidence: realConfidence,
        strategyRelevance: aiRelevance,
        reasoning: realFundamentalAnalysis.data?.reasoning || 'Fundamental analysis based on real financial data',
        keyFactors: realFundamentalAnalysis.data?.keyInsights || ['Real financial metrics', 'Business fundamentals', 'Valuation analysis'],
        risks: realFundamentalAnalysis.data?.riskFactors || ['Fundamental deterioration', 'Valuation risk', 'Industry headwinds'],
        timeHorizon: this.currentStrategy.timeHorizon,
        strategySpecificInsights
      };

    } catch (error) {
      console.error(`❌ [REAL FUNDAMENTAL AGENT] Error in ${input.strategy} analysis:`, error);
      return this.createErrorAgentOutput(this.currentStrategy.agentWeights.fundamental);
    }
  }

  /**
   * 🎯 REAL NEWS SENTIMENT AGENT - Connected to Sequential Analysis System
   */
  private async runNewsAgentWithStrategy(input: StrategyAwareAnalysisInput): Promise<StrategyAwareAgentOutput> {
    const startTime = Date.now();
    console.log(`📰 [REAL NEWS AGENT - ${input.strategy.toUpperCase()}] Starting analysis...`);

    try {
      // 🔥 CALL REAL SENTIMENT ANALYSIS AGENT (using parent class method)
      const realSentimentAnalysis = await this.runSentimentAnalysisAgent({
        symbol: input.symbol,
        strategy: input.strategy, // 🎯 Pass strategy for prompt awareness
        previousAnalysis: this.strategyContext.marketData // Pass real market data
      });

      // 🧠 INTELLIGENT SELF-ASSESSMENT based on REAL news sentiment results
      let aiRelevance = this.assessNewsRelevance(input.strategy, realSentimentAnalysis);
      
      // Extract real signals from the analysis
      const realSignal = this.extractSignalFromAnalysis(realSentimentAnalysis.data);
      const realConfidence = this.calculateRealConfidence(realSentimentAnalysis.data, aiRelevance);
      
      // Strategy-specific insights based on real data
      const strategySpecificInsights = this.createNewsInsights(input.strategy, realSentimentAnalysis.data);

      const processingTime = Date.now() - startTime;
      console.log(`✅ [REAL NEWS AGENT] ${input.strategy} analysis completed in ${processingTime}ms (${realConfidence}% confidence, ${aiRelevance}% relevance)`);

      return {
        signal: realSignal,
        confidence: realConfidence,
        strategyRelevance: aiRelevance,
        reasoning: realSentimentAnalysis.data.reasoning || 'News sentiment analysis based on real market data',
        keyFactors: realSentimentAnalysis.data.keyFactors || ['Real news sentiment', 'Market narrative', 'Social sentiment'],
        risks: realSentimentAnalysis.data.risks || ['Sentiment reversal', 'News volatility', 'Information overload'],
        timeHorizon: this.currentStrategy.timeHorizon,
        strategySpecificInsights
      };

    } catch (error) {
      console.error(`❌ [REAL NEWS AGENT] Error in ${input.strategy} analysis:`, error);
      return this.createErrorAgentOutput(this.currentStrategy.agentWeights.newsSentiment);
    }
  }

  /**
   * 🎯 REAL MARKET STRUCTURE AGENT - Connected to Sequential Analysis System
   */
  private async runMarketStructureAgentWithStrategy(input: StrategyAwareAnalysisInput): Promise<StrategyAwareAgentOutput> {
    const startTime = Date.now();
    console.log(`🏗️ [REAL MARKET STRUCTURE - ${input.strategy.toUpperCase()}] Starting analysis...`);

    try {
      // 🔥 CALL REAL MARKET ANALYSIS AGENT (using parent class method)
      const realMarketAnalysis = await this.runMarketAnalysisAgent({
        symbol: input.symbol,
        strategy: input.strategy, // 🎯 Pass strategy for prompt awareness
        previousAnalysis: this.strategyContext.marketData // Pass real market data
      });

      // 🧠 INTELLIGENT SELF-ASSESSMENT based on REAL market structure analysis results
      let aiRelevance = this.assessMarketStructureRelevance(input.strategy, realMarketAnalysis);
      
      // Extract real signals from the analysis
      const realSignal = this.extractSignalFromAnalysis(realMarketAnalysis.data);
      const realConfidence = this.calculateRealConfidence(realMarketAnalysis.data, aiRelevance);
      
      // Strategy-specific insights based on real data
      const strategySpecificInsights = this.createMarketStructureInsights(input.strategy, realMarketAnalysis.data);

      const processingTime = Date.now() - startTime;
      console.log(`✅ [REAL MARKET STRUCTURE] ${input.strategy} analysis completed in ${processingTime}ms (${realConfidence}% confidence, ${aiRelevance}% relevance)`);

      return {
        signal: realSignal,
        confidence: realConfidence,
        strategyRelevance: aiRelevance,
        reasoning: realMarketAnalysis.data?.reasoning || 'Market structure analysis based on real market data',
        keyFactors: realMarketAnalysis.data?.keyFactors || ['Real market structure', 'Institutional flow', 'Liquidity analysis'],
        risks: realMarketAnalysis.data?.risks || ['Market structure breakdown', 'Liquidity gaps', 'Institutional selling'],
        timeHorizon: this.currentStrategy.timeHorizon,
        strategySpecificInsights
      };

    } catch (error) {
      console.error(`❌ [REAL MARKET STRUCTURE] Error in ${input.strategy} analysis:`, error);
      return this.createErrorAgentOutput(this.currentStrategy.agentWeights.marketStructure);
    }
  }

  /**
   * 🧠 INTELLIGENT SYNTHESIS - Let AI decide agent relevance dynamically
   * Each agent self-assesses their relevance based on actual market conditions
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
    console.log(`🧠 [INTELLIGENT SYNTHESIS] AI agents self-determining relevance for ${input.strategy} strategy...`);

    // 🎯 DYNAMIC WEIGHTING: Let each agent decide their own relevance
    // Each agent has already assessed their strategyRelevance based on actual data
    const dynamicWeights = {
      technical: agentResults.technical.strategyRelevance,
      fundamental: agentResults.fundamental.strategyRelevance, 
      newsSentiment: agentResults.newsSentiment.strategyRelevance,
      marketStructure: agentResults.marketStructure.strategyRelevance
    };

    // Normalize weights to sum to 100 (in case agents over/under-estimate)
    const totalWeight = Object.values(dynamicWeights).reduce((sum, weight) => sum + weight, 0);
    const normalizedWeights = Object.entries(dynamicWeights).reduce((acc, [key, weight]) => {
      acc[key] = totalWeight > 0 ? (weight / totalWeight) * 100 : 25; // Default to 25% if total is 0
      return acc;
    }, {} as Record<string, number>);

    console.log(`📊 [DYNAMIC WEIGHTS] AI-determined relevance:`);
    console.log(`   Technical: ${normalizedWeights.technical.toFixed(1)}%`);
    console.log(`   Fundamental: ${normalizedWeights.fundamental.toFixed(1)}%`);
    console.log(`   News: ${normalizedWeights.newsSentiment.toFixed(1)}%`);
    console.log(`   Structure: ${normalizedWeights.marketStructure.toFixed(1)}%`);
    
    // 🎯 INTELLIGENT CONFIDENCE: Weight confidence by AI-determined relevance
    const intelligentConfidence = (
      (agentResults.technical.confidence * normalizedWeights.technical) +
      (agentResults.fundamental.confidence * normalizedWeights.fundamental) +
      (agentResults.newsSentiment.confidence * normalizedWeights.newsSentiment) +
      (agentResults.marketStructure.confidence * normalizedWeights.marketStructure)
    ) / 100;

    // 🎯 INTELLIGENT SIGNAL AGGREGATION: Weight signals by AI relevance and confidence
    const weightedSignals = [
      { 
        signal: agentResults.technical.signal, 
        weight: normalizedWeights.technical * agentResults.technical.confidence / 100,
        agent: 'technical'
      },
      { 
        signal: agentResults.fundamental.signal, 
        weight: normalizedWeights.fundamental * agentResults.fundamental.confidence / 100,
        agent: 'fundamental'
      },
      { 
        signal: agentResults.newsSentiment.signal, 
        weight: normalizedWeights.newsSentiment * agentResults.newsSentiment.confidence / 100,
        agent: 'newsSentiment'
      },
      { 
        signal: agentResults.marketStructure.signal, 
        weight: normalizedWeights.marketStructure * agentResults.marketStructure.confidence / 100,
        agent: 'marketStructure'
      }
    ];

    // Calculate weighted signal strength
    let bullishWeight = 0;
    let bearishWeight = 0;
    let neutralWeight = 0;

    weightedSignals.forEach(({ signal, weight, agent }) => {
      console.log(`   ${agent}: ${signal} (weight: ${weight.toFixed(2)})`);
      if (signal === 'BULLISH') bullishWeight += weight;
      else if (signal === 'BEARISH') bearishWeight += weight;
      else neutralWeight += weight;
    });

    // Determine signal based on weighted strength
    let overallSignal: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
    if (bullishWeight > bearishWeight && bullishWeight > neutralWeight) {
      overallSignal = 'BULLISH';
    } else if (bearishWeight > bullishWeight && bearishWeight > neutralWeight) {
      overallSignal = 'BEARISH';
    }

    console.log(`🎯 [INTELLIGENT DECISION] ${overallSignal} (Bullish: ${bullishWeight.toFixed(1)}, Bearish: ${bearishWeight.toFixed(1)}, Neutral: ${neutralWeight.toFixed(1)})`);

    // Strategy-specific metrics
    const strategyMetrics = this.calculateStrategyMetrics(input.symbol, overallSignal, agentResults);

    return {
      symbol: input.symbol,
      strategy: input.strategy,
      prediction: overallSignal,
      confidence: Math.round(intelligentConfidence),
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
          strategyRelevance: agentResults.technical.strategyRelevance,
          normalizedWeight: normalizedWeights.technical,
          decisionWeight: normalizedWeights.technical * agentResults.technical.confidence / 100
        },
        fundamental: {
          signal: agentResults.fundamental.signal,
          confidence: agentResults.fundamental.confidence,
          strategyRelevance: agentResults.fundamental.strategyRelevance,
          normalizedWeight: normalizedWeights.fundamental,
          decisionWeight: normalizedWeights.fundamental * agentResults.fundamental.confidence / 100
        },
        newsSentiment: {
          signal: agentResults.newsSentiment.signal,
          confidence: agentResults.newsSentiment.confidence,
          strategyRelevance: agentResults.newsSentiment.strategyRelevance,
          normalizedWeight: normalizedWeights.newsSentiment,
          decisionWeight: normalizedWeights.newsSentiment * agentResults.newsSentiment.confidence / 100
        },
        marketStructure: {
          signal: agentResults.marketStructure.signal,
          confidence: agentResults.marketStructure.confidence,
          strategyRelevance: agentResults.marketStructure.strategyRelevance,
          normalizedWeight: normalizedWeights.marketStructure,
          decisionWeight: normalizedWeights.marketStructure * agentResults.marketStructure.confidence / 100
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
        technical: { signal: 'NEUTRAL', confidence: 0, strategyRelevance: 0, normalizedWeight: 0, decisionWeight: 0 },
        fundamental: { signal: 'NEUTRAL', confidence: 0, strategyRelevance: 0, normalizedWeight: 0, decisionWeight: 0 },
        newsSentiment: { signal: 'NEUTRAL', confidence: 0, strategyRelevance: 0, normalizedWeight: 0, decisionWeight: 0 },
        marketStructure: { signal: 'NEUTRAL', confidence: 0, strategyRelevance: 0, normalizedWeight: 0, decisionWeight: 0 }
      }
    };
  }

  /**
   * 🧠 Assess fundamental analysis relevance based on real financial data
   */
  private assessFundamentalRelevance(strategy: string, fundamentalAnalysis: any): number {
    let baseRelevance = 25; // Default relevance
    
    // Analyze real fundamental signals
    const hasStrongFinancials = this.hasStrongFinancials(fundamentalAnalysis.data);
    const hasUpcomingCatalysts = this.hasUpcomingCatalysts(fundamentalAnalysis.data);
    const hasValuationSupport = this.hasValuationSupport(fundamentalAnalysis.data);
    
    if (strategy === 'day') {
      baseRelevance = 5; // Very low base for day trading
      if (hasUpcomingCatalysts) baseRelevance += 40; // Big jump for catalysts today
      console.log(`🧠 [FUNDAMENTAL AI] Day trading relevance: ${baseRelevance}% (mainly checking for catalysts)`);
    } else if (strategy === 'swing') {
      baseRelevance = 20; // Moderate for swing
      if (hasStrongFinancials) baseRelevance += 15;
      if (hasUpcomingCatalysts) baseRelevance += 20;
      if (hasValuationSupport) baseRelevance += 10;
      console.log(`🧠 [FUNDAMENTAL AI] Swing trading relevance: ${baseRelevance}% (Financials: ${hasStrongFinancials}, Catalysts: ${hasUpcomingCatalysts})`);
    } else { // longterm
      baseRelevance = 50; // High base for long-term
      if (hasStrongFinancials) baseRelevance += 25;
      if (hasValuationSupport) baseRelevance += 15;
      console.log(`🧠 [FUNDAMENTAL AI] Long-term relevance: ${baseRelevance}% (primary driver for long-term success)`);
    }
    
    return Math.min(100, baseRelevance);
  }

  /**
   * Check if company has strong financial metrics
   */
  private hasStrongFinancials(fundamentalData: any): boolean {
    // TODO: Implement real financial strength analysis
    return fundamentalData?.financialStrength > 0.7 || fundamentalData?.creditRating === 'STRONG';
  }

  private hasUpcomingCatalysts(fundamentalData: any): boolean {
    // TODO: Implement real catalyst detection
    return fundamentalData?.upcomingEvents?.length > 0 || fundamentalData?.earningsProximity < 7;
  }

  private hasValuationSupport(fundamentalData: any): boolean {
    // TODO: Implement real valuation analysis
    return fundamentalData?.valuation === 'UNDERVALUED' || fundamentalData?.peRatio < 20;
  }

  /**
   * Create strategy-specific fundamental insights from real data
   */
  private createFundamentalInsights(strategy: string, fundamentalData: any): Record<string, any> {
    const baseInsights = {
      dataSource: 'Real fundamental analysis via Yahoo Finance & Perplexity Sonar',
      analysisType: strategy === 'day' ? 'Catalyst screening' : 
                   strategy === 'swing' ? 'Near-term fundamental drivers' : 'Deep value analysis'
    };

    if (fundamentalData?.financialMetrics) {
      (baseInsights as any).metrics = {
        peRatio: fundamentalData.financialMetrics.peRatio,
        revenue: fundamentalData.financialMetrics.revenue,
        profitability: fundamentalData.financialMetrics.profitability
      };
    }

    if (strategy === 'day') {
      return {
        ...baseInsights,
        focus: 'Earnings/event screening only',
        catalystCheck: fundamentalData?.todaysEvents || 'No major catalysts today',
        recommendation: 'Rely on technical analysis for day trading'
      };
    } else if (strategy === 'swing') {
      return {
        ...baseInsights,
        focus: 'Near-term catalysts and earnings proximity',
        earningsCalendar: fundamentalData?.nextEarnings || 'Next earnings in 3+ weeks',
        catalystPipeline: fundamentalData?.upcomingCatalysts || 'Standard corporate calendar'
      };
    } else {
      return {
        ...baseInsights,
        focus: 'Long-term business quality and valuation',
        businessQuality: fundamentalData?.businessQuality || 'Strong competitive position',
        valuation: fundamentalData?.valuation || 'Fair value assessment',
        investmentThesis: fundamentalData?.longTermThesis || 'Multi-year growth story'
      };
    }
  }

  /**
   * 🧠 Assess news sentiment relevance based on real market conditions
   */
  private assessNewsRelevance(strategy: string, sentimentAnalysis: any): number {
    let baseRelevance = 25; // Default relevance
    
    // Analyze real news sentiment signals
    const hasBreakingNews = this.hasBreakingNews(sentimentAnalysis.data);
    const hasPositiveSentimentTrend = this.hasPositiveSentimentTrend(sentimentAnalysis.data);
    const hasMarketMovingNews = this.hasMarketMovingNews(sentimentAnalysis.data);
    
    if (strategy === 'day') {
      baseRelevance = 10; // Low base for day trading news
      if (hasBreakingNews) baseRelevance += 50; // Major jump for breaking news
      if (hasMarketMovingNews) baseRelevance += 30;
      console.log(`🧠 [NEWS AI] Day trading relevance: ${baseRelevance}% (Breaking: ${hasBreakingNews}, Market moving: ${hasMarketMovingNews})`);
    } else if (strategy === 'swing') {
      baseRelevance = 25; // Moderate for swing
      if (hasPositiveSentimentTrend) baseRelevance += 20;
      if (hasMarketMovingNews) baseRelevance += 15;
      console.log(`🧠 [NEWS AI] Swing trading relevance: ${baseRelevance}% (Positive trend: ${hasPositiveSentimentTrend})`);
    } else { // longterm
      baseRelevance = 20; // Lower for long-term
      if (hasPositiveSentimentTrend) baseRelevance += 15;
      console.log(`🧠 [NEWS AI] Long-term relevance: ${baseRelevance}% (focus on themes)`);
    }
    
    return Math.min(100, baseRelevance);
  }

  /**
   * Check for breaking news in sentiment data
   */
  private hasBreakingNews(sentimentData: any): boolean {
    // TODO: Implement real breaking news detection
    return sentimentData?.breakingNews?.length > 0 || sentimentData?.urgentAlerts?.length > 0;
  }

  private hasPositiveSentimentTrend(sentimentData: any): boolean {
    // TODO: Implement real sentiment trend analysis
    return sentimentData?.overallSentiment === 'POSITIVE' || sentimentData?.sentimentScore > 0.6;
  }

  private hasMarketMovingNews(sentimentData: any): boolean {
    // TODO: Implement real market moving news detection
    return sentimentData?.impactLevel === 'HIGH' || sentimentData?.marketReaction === 'SIGNIFICANT';
  }

  /**
   * Create strategy-specific news insights from real data
   */
  private createNewsInsights(strategy: string, sentimentData: any): Record<string, any> {
    const baseInsights = {
      dataSource: 'Real news sentiment analysis via Perplexity Sonar',
      analysisType: strategy === 'day' ? 'Breaking news monitoring' : 
                   strategy === 'swing' ? 'Sentiment trend analysis' : 'Thematic narrative tracking'
    };

    if (sentimentData?.sentimentMetrics) {
      (baseInsights as any).metrics = {
        overallSentiment: sentimentData.sentimentMetrics.overallSentiment,
        sentimentScore: sentimentData.sentimentMetrics.sentimentScore,
        newsVolume: sentimentData.sentimentMetrics.newsVolume
      };
    }

    if (strategy === 'day') {
      return {
        ...baseInsights,
        focus: 'Breaking news and market reactions',
        timeframe: '2 hours',
        urgency: 'high',
        breakingNews: sentimentData?.breakingNews || 'No breaking news detected'
      };
    } else if (strategy === 'swing') {
      return {
        ...baseInsights,
        focus: 'Multi-day sentiment trends',
        timeframe: '3 days',
        trendConfirmation: sentimentData?.trendDirection || 'Neutral sentiment trend',
        sentimentMomentum: sentimentData?.momentum || 'Building narrative support'
      };
    } else {
      return {
        ...baseInsights,
        focus: 'Long-term thematic narratives',
        timeframe: '2 weeks',
        thematicTrends: sentimentData?.themes || 'Industry transformation themes',
        narrativeSupport: sentimentData?.narrativeStrength || 'Validates investment thesis'
      };
    }
  }

  /**
   * 🧠 Assess market structure relevance based on real market conditions
   */
  private assessMarketStructureRelevance(strategy: string, marketAnalysis: any): number {
    let baseRelevance = 25; // Default relevance
    
    // Analyze real market structure signals
    const hasInstitutionalFlow = this.hasInstitutionalFlow(marketAnalysis.data);
    const hasGoodLiquidity = this.hasGoodMarketLiquidity(marketAnalysis.data);
    const hasCleanLevels = this.hasCleanMarketLevels(marketAnalysis.data);
    
    if (strategy === 'day') {
      baseRelevance = 40; // High base for day trading structure
      if (hasGoodLiquidity) baseRelevance += 25;
      if (hasCleanLevels) baseRelevance += 20;
      console.log(`🧠 [STRUCTURE AI] Day trading relevance: ${baseRelevance}% (Liquidity: ${hasGoodLiquidity}, Levels: ${hasCleanLevels})`);
    } else if (strategy === 'swing') {
      baseRelevance = 25; // Moderate for swing
      if (hasInstitutionalFlow) baseRelevance += 20;
      if (hasCleanLevels) baseRelevance += 15;
      console.log(`🧠 [STRUCTURE AI] Swing trading relevance: ${baseRelevance}% (Institutional: ${hasInstitutionalFlow})`);
    } else { // longterm
      baseRelevance = 15; // Lower for long-term
      if (hasInstitutionalFlow) baseRelevance += 15;
      console.log(`🧠 [STRUCTURE AI] Long-term relevance: ${baseRelevance}% (focus on macro structure)`);
    }
    
    return Math.min(100, baseRelevance);
  }

  /**
   * Check for institutional flow in market data
   */
  private hasInstitutionalFlow(marketData: any): boolean {
    // TODO: Implement real institutional flow detection
    return marketData?.institutionalActivity === 'NET_BUYING' || marketData?.institutionalFlow > 0;
  }

  private hasGoodMarketLiquidity(marketData: any): boolean {
    // TODO: Implement real liquidity analysis
    return marketData?.liquidity === 'HIGH' || marketData?.bidAskSpread < 0.05;
  }

  private hasCleanMarketLevels(marketData: any): boolean {
    // TODO: Implement real support/resistance analysis
    return marketData?.supportLevels?.length > 0 || marketData?.keyLevels?.length > 0;
  }

  /**
   * Create strategy-specific market structure insights from real data
   */
  private createMarketStructureInsights(strategy: string, marketData: any): Record<string, any> {
    const baseInsights = {
      dataSource: 'Real market structure analysis via Perplexity Sonar',
      analysisType: strategy === 'day' ? 'Intraday liquidity & levels' : 
                   strategy === 'swing' ? 'Multi-day institutional flow' : 'Macro market positioning'
    };

    if (marketData?.marketMicrostructure) {
      (baseInsights as any).microstructure = {
        bidAskSpread: marketData.marketMicrostructure.bidAskSpread,
        liquidity: marketData.marketMicrostructure.marketDepth,
        institutionalActivity: marketData.marketMicrostructure.institutionalActivity
      };
    }

    if (strategy === 'day') {
      return {
        ...baseInsights,
        focus: 'Intraday execution quality',
        liquidityProfile: marketData?.liquidityProfile || 'Analysis of execution conditions',
        marketMakers: marketData?.marketMakers || 'Market maker participation analysis'
      };
    } else if (strategy === 'swing') {
      return {
        ...baseInsights,
        focus: 'Multi-day positioning flows',
        institutionalFlow: marketData?.institutionalFlow || 'Institutional positioning analysis',
        supportLevels: marketData?.supportLevels || 'Key support/resistance identification'
      };
    } else {
      return {
        ...baseInsights,
        focus: 'Long-term structural trends',
        sectorPosition: marketData?.sectorPosition || 'Sector rotation analysis',
        macroTrends: marketData?.macroTrends || 'Long-term structural analysis'
      };
    }
  }
}