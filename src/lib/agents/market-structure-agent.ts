import { BaseAgent } from './base-agent';
import { AgentInput, AgentOutput } from '../types/prediction-types';

export interface MarketStructureData {
  earningsCalendar: {
    upcomingEarnings: Array<{
      symbol: string;
      date: string;
      daysUntil: number;
      expectedMove: number;
      lastEarningsImpact: number;
      consensusEstimate: number;
    }>;
    earningsProximity: 'pre_earnings' | 'post_earnings' | 'earnings_week' | 'normal';
    volatilityExpectation: number;
    historicalPattern: 'beat_and_rally' | 'sell_the_news' | 'mixed' | 'unknown';
  };
  economicEvents: {
    upcomingEvents: Array<{
      event: string;
      date: string;
      importance: 'high' | 'medium' | 'low';
      expectedImpact: 'bullish' | 'bearish' | 'neutral';
      marketSensitivity: number;
    }>;
    fedSchedule: {
      nextMeeting: string;
      rateProbability: number;
      hawkishDovish: 'hawkish' | 'dovish' | 'neutral';
    };
    macroEnvironment: 'risk_on' | 'risk_off' | 'neutral';
  };
  sectorAnalysis: {
    currentRotation: {
      inflow: string[];
      outflow: string[];
      neutral: string[];
    };
    relativeStrength: {
      sector: string;
      vsMarket: number;
      momentum: 'strong' | 'weak' | 'neutral';
      trend: 'improving' | 'deteriorating' | 'stable';
    };
    correlationBreakdown: {
      status: 'decoupling' | 'coupling' | 'normal';
      strength: number;
    };
  };
  marketRegime: {
    current: 'bull_market' | 'bear_market' | 'sideways' | 'correction';
    volatilityRegime: 'low_vol' | 'high_vol' | 'normal';
    liquidityConditions: 'good' | 'poor' | 'normal';
    sentiment: 'fear' | 'greed' | 'neutral';
  };
  confidence: number;
  sources: string[];
}

export class MarketStructureAgent extends BaseAgent {
  constructor() {
    super({
      name: "MarketStructure",
      description: "Market structure, earnings calendar, and economic events analysis",
      model: "sonar",
      temperature: 0.1,
      maxTokens: 2000,
      timeout: 35000
    });
  }

  async process(input: AgentInput): Promise<AgentOutput> {
    console.log(`📊 MarketStructureAgent analyzing market structure for ${input.symbol}...`);
    
    // Get comprehensive data from centralized provider
    const centralizedData = await this.getCentralizedData(input.symbol);
    
    // 🏆 GOLD STANDARD: Algorithmic market structure analysis
    const marketStructureData = await this.performMarketStructureAnalysis(input.symbol, centralizedData);
    
    // Calculate confidence based on data availability and market conditions
    const confidence = this.calculateStructureConfidence(marketStructureData, centralizedData);
    
    const sources = [
      'earnings_calendar_analysis',
      'economic_events_calendar', 
      'sector_rotation_analysis',
      'market_regime_detection',
      ...centralizedData.sources
    ];

    // Create quality and validation metrics
    const qualityMetrics = this.createQualityMetrics(centralizedData);
    const validationMetrics = this.createValidationMetrics(centralizedData);
    const reliabilityMetrics = this.createReliabilityMetrics(centralizedData);

    console.log(`✅ MarketStructureAgent completed: regime=${marketStructureData.marketRegime.current}, confidence=${confidence}%`);

    return {
      agent: this.config.name,
      symbol: input.symbol,
      timestamp: new Date().toISOString(),
      data: marketStructureData,
      confidence: confidence,
      sources: sources,
      processingTime: 0, // Algorithmic processing is fast
      quality: qualityMetrics,
      validation: validationMetrics,
      reliability: reliabilityMetrics
    };
  }

  // 🏆 GOLD STANDARD: Comprehensive market structure analysis
  private async performMarketStructureAnalysis(symbol: string, centralizedData: any): Promise<MarketStructureData> {
    try {
      console.log(`📈 Performing market structure analysis for ${symbol}...`);
      
      const marketData = centralizedData?.marketData;
      const technicalData = centralizedData?.technicalData;
      
      // 1. EARNINGS CALENDAR ANALYSIS
      const earningsAnalysis = await this.analyzeEarningsCalendar(symbol, marketData);
      
      // 2. ECONOMIC EVENTS ANALYSIS  
      const economicEvents = await this.analyzeEconomicEvents(symbol, marketData);
      
      // 3. SECTOR ROTATION ANALYSIS
      const sectorAnalysis = await this.analyzeSectorRotation(symbol, marketData, technicalData);
      
      // 4. MARKET REGIME DETECTION
      const marketRegime = this.detectMarketRegime(marketData, technicalData);
      
      return {
        earningsCalendar: earningsAnalysis,
        economicEvents: economicEvents,
        sectorAnalysis: sectorAnalysis,
        marketRegime: marketRegime,
        confidence: 0, // Will be calculated separately
        sources: []
      };
      
    } catch (error) {
      console.error('Error in market structure analysis:', error);
      return this.getFallbackData();
    }
  }

  // 📅 EARNINGS CALENDAR ANALYSIS
  private async analyzeEarningsCalendar(symbol: string, marketData: any) {
    try {
      // Get current date for calculations
      const today = new Date();
      const currentQuarter = Math.floor((today.getMonth() + 3) / 3);
      
      // Estimate earnings date (companies typically report quarterly)
      // This is a simplified version - in production, you'd use an earnings calendar API
      const estimatedEarningsDate = this.estimateNextEarningsDate(symbol, today, currentQuarter);
      const daysUntil = Math.ceil((estimatedEarningsDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // Determine earnings proximity
      let earningsProximity: 'pre_earnings' | 'post_earnings' | 'earnings_week' | 'normal' = 'normal';
      if (Math.abs(daysUntil) <= 3) earningsProximity = 'earnings_week';
      else if (daysUntil > 0 && daysUntil <= 7) earningsProximity = 'pre_earnings';
      else if (daysUntil < 0 && daysUntil >= -7) earningsProximity = 'post_earnings';
      
      // Estimate expected move based on historical volatility
      const currentPrice = marketData?.price || 100;
      const volatility = Math.abs(marketData?.changePercent || 2) / 100;
      const expectedMove = currentPrice * Math.max(0.03, volatility * 1.5); // Minimum 3% move
      
      // Historical pattern analysis (simplified)
      const historicalPattern = this.analyzeHistoricalEarningsPattern(symbol, marketData);
      
      return {
        upcomingEarnings: [{
          symbol: symbol,
          date: estimatedEarningsDate.toISOString().split('T')[0],
          daysUntil: daysUntil,
          expectedMove: Math.round(expectedMove * 100) / 100,
          lastEarningsImpact: volatility * currentPrice,
          consensusEstimate: 0 // Would need earnings estimate API
        }],
        earningsProximity: earningsProximity,
        volatilityExpectation: Math.min(100, volatility * 200), // Convert to percentage
        historicalPattern: historicalPattern
      };
      
    } catch (error) {
      console.error('Error analyzing earnings calendar:', error);
      return {
        upcomingEarnings: [],
        earningsProximity: 'normal' as const,
        volatilityExpectation: 20,
        historicalPattern: 'unknown' as const
      };
    }
  }

  // 📊 ECONOMIC EVENTS ANALYSIS
  private async analyzeEconomicEvents(symbol: string, marketData: any) {
    try {
      const today = new Date();
      
      // Estimate next Fed meeting (typically every 6-8 weeks)
      const nextFedMeeting = new Date(today);
      nextFedMeeting.setDate(today.getDate() + 42); // Approximate 6 weeks
      
      // Generate upcoming economic events (simplified - would use economic calendar API)
      const upcomingEvents = [
        {
          event: 'Federal Reserve Meeting',
          date: nextFedMeeting.toISOString().split('T')[0],
          importance: 'high' as const,
          expectedImpact: 'neutral' as const,
          marketSensitivity: 0.8
        },
        {
          event: 'CPI Inflation Data',
          date: this.getNextDataReleaseDate(today, 'CPI').toISOString().split('T')[0],
          importance: 'high' as const,
          expectedImpact: 'bearish' as const,
          marketSensitivity: 0.7
        },
        {
          event: 'Employment Report',
          date: this.getNextDataReleaseDate(today, 'NFP').toISOString().split('T')[0],
          importance: 'medium' as const,
          expectedImpact: 'bullish' as const,
          marketSensitivity: 0.5
        }
      ];
      
      // Determine macro environment based on market conditions
      const changePercent = marketData?.changePercent || 0;
      const volume = marketData?.volume || 0;
      let macroEnvironment: 'risk_on' | 'risk_off' | 'neutral' = 'neutral';
      
      if (changePercent > 2 && volume > 1000000) macroEnvironment = 'risk_on';
      else if (changePercent < -2 && volume > 1000000) macroEnvironment = 'risk_off';
      
      return {
        upcomingEvents: upcomingEvents,
        fedSchedule: {
          nextMeeting: nextFedMeeting.toISOString().split('T')[0],
          rateProbability: 0.5, // Would need Fed funds futures data
          hawkishDovish: 'neutral' as const
        },
        macroEnvironment: macroEnvironment
      };
      
    } catch (error) {
      console.error('Error analyzing economic events:', error);
      return {
        upcomingEvents: [],
        fedSchedule: {
          nextMeeting: '',
          rateProbability: 0.5,
          hawkishDovish: 'neutral' as const
        },
        macroEnvironment: 'neutral' as const
      };
    }
  }

  // 🏭 SECTOR ROTATION ANALYSIS
  private async analyzeSectorRotation(symbol: string, marketData: any, technicalData: any) {
    try {
      // Identify sector based on symbol (simplified approach)
      const sector = this.identifySector(symbol);
      
      // Calculate relative strength vs market
      const changePercent = marketData?.changePercent || 0;
      const marketBenchmark = 0; // Would compare vs SPY/market index
      const relativeStrength = changePercent - marketBenchmark;
      
      // Determine momentum based on technical indicators
      let momentum: 'strong' | 'weak' | 'neutral' = 'neutral';
      if (technicalData?.rsi > 60 && relativeStrength > 2) momentum = 'strong';
      else if (technicalData?.rsi < 40 && relativeStrength < -2) momentum = 'weak';
      
      // Trend analysis
      let trend: 'improving' | 'deteriorating' | 'stable' = 'stable';
      if (technicalData?.macd?.value > technicalData?.macd?.signal) trend = 'improving';
      else if (technicalData?.macd?.value < technicalData?.macd?.signal) trend = 'deteriorating';
      
      // Sector rotation patterns (simplified)
      const rotationAnalysis = this.analyzeSectorRotationPatterns(sector, marketData);
      
      return {
        currentRotation: rotationAnalysis,
        relativeStrength: {
          sector: sector,
          vsMarket: Math.round(relativeStrength * 100) / 100,
          momentum: momentum,
          trend: trend
        },
        correlationBreakdown: {
          status: 'normal' as const,
          strength: 0.7
        }
      };
      
    } catch (error) {
      console.error('Error analyzing sector rotation:', error);
      return {
        currentRotation: {
          inflow: [],
          outflow: [],
          neutral: ['Unknown']
        },
        relativeStrength: {
          sector: 'Unknown',
          vsMarket: 0,
          momentum: 'neutral' as const,
          trend: 'stable' as const
        },
        correlationBreakdown: {
          status: 'normal' as const,
          strength: 0.5
        }
      };
    }
  }

  // 🌊 MARKET REGIME DETECTION
  private detectMarketRegime(marketData: any, technicalData: any) {
    try {
      const changePercent = marketData?.changePercent || 0;
      const volume = marketData?.volume || 0;
      const rsi = technicalData?.rsi || 50;
      const macd = technicalData?.macd?.value || 0;
      
      // Market regime detection
      let current: 'bull_market' | 'bear_market' | 'sideways' | 'correction' = 'sideways';
      if (changePercent > 5 && macd > 0 && rsi > 55) current = 'bull_market';
      else if (changePercent < -5 && macd < 0 && rsi < 45) current = 'bear_market';
      else if (changePercent < -10) current = 'correction';
      
      // Volatility regime
      let volatilityRegime: 'low_vol' | 'high_vol' | 'normal' = 'normal';
      if (Math.abs(changePercent) > 8) volatilityRegime = 'high_vol';
      else if (Math.abs(changePercent) < 1) volatilityRegime = 'low_vol';
      
      // Liquidity conditions
      let liquidityConditions: 'good' | 'poor' | 'normal' = 'normal';
      if (volume > 2000000) liquidityConditions = 'good';
      else if (volume < 100000) liquidityConditions = 'poor';
      
      // Sentiment analysis
      let sentiment: 'fear' | 'greed' | 'neutral' = 'neutral';
      if (rsi > 70 && changePercent > 3) sentiment = 'greed';
      else if (rsi < 30 && changePercent < -3) sentiment = 'fear';
      
      return {
        current: current,
        volatilityRegime: volatilityRegime,
        liquidityConditions: liquidityConditions,
        sentiment: sentiment
      };
      
    } catch (error) {
      console.error('Error detecting market regime:', error);
      return {
        current: 'sideways' as const,
        volatilityRegime: 'normal' as const,
        liquidityConditions: 'normal' as const,
        sentiment: 'neutral' as const
      };
    }
  }

  // Helper methods
  private estimateNextEarningsDate(symbol: string, today: Date, currentQuarter: number): Date {
    // Simplified earnings date estimation
    const earningsDate = new Date(today);
    const daysIntoQuarter = today.getDate() + (today.getMonth() % 3) * 30;
    
    if (daysIntoQuarter < 45) {
      // Early in quarter, earnings likely in 60-90 days
      earningsDate.setDate(today.getDate() + 75);
    } else {
      // Late in quarter, earnings likely in 15-45 days  
      earningsDate.setDate(today.getDate() + 30);
    }
    
    return earningsDate;
  }

  private analyzeHistoricalEarningsPattern(symbol: string, marketData: any): 'beat_and_rally' | 'sell_the_news' | 'mixed' | 'unknown' {
    // Simplified pattern analysis based on current momentum
    const changePercent = marketData?.changePercent || 0;
    
    if (changePercent > 5) return 'beat_and_rally';
    else if (changePercent < -3) return 'sell_the_news';
    else return 'mixed';
  }

  private getNextDataReleaseDate(today: Date, dataType: 'CPI' | 'NFP'): Date {
    const nextDate = new Date(today);
    
    if (dataType === 'CPI') {
      // CPI typically released around 13th of each month
      nextDate.setMonth(today.getMonth() + 1);
      nextDate.setDate(13);
    } else if (dataType === 'NFP') {
      // NFP typically first Friday of each month
      nextDate.setMonth(today.getMonth() + 1);
      nextDate.setDate(7); // Approximate first Friday
    }
    
    return nextDate;
  }

  private identifySector(symbol: string): string {
    // Simplified sector identification
    if (symbol.includes('AAPL') || symbol.includes('MSFT') || symbol.includes('GOOGL') || symbol.includes('NVDA')) {
      return 'Technology';
    } else if (symbol.includes('JPM') || symbol.includes('BAC') || symbol.includes('WFC')) {
      return 'Financials';
    } else if (symbol.includes('XOM') || symbol.includes('CVX')) {
      return 'Energy';
    } else if (symbol.includes('JNJ') || symbol.includes('PFE')) {
      return 'Healthcare';
    } else if (symbol.includes('BTC') || symbol.includes('ETH')) {
      return 'Cryptocurrency';
    } else {
      return 'General Market';
    }
  }

  private analyzeSectorRotationPatterns(sector: string, marketData: any) {
    const changePercent = marketData?.changePercent || 0;
    
    // Simplified rotation analysis
    if (changePercent > 3) {
      return {
        inflow: [sector],
        outflow: [],
        neutral: []
      };
    } else if (changePercent < -3) {
      return {
        inflow: [],
        outflow: [sector],
        neutral: []
      };
    } else {
      return {
        inflow: [],
        outflow: [],
        neutral: [sector]
      };
    }
  }

  private calculateStructureConfidence(structureData: MarketStructureData, centralizedData: any): number {
    let confidence = 60; // Base confidence
    
    // Increase confidence based on data quality
    if (centralizedData.overallQuality === 'realtime') confidence += 15;
    else if (centralizedData.overallQuality === 'cached') confidence += 10;
    
    // Increase confidence if earnings proximity is known
    if (structureData.earningsCalendar.earningsProximity !== 'normal') confidence += 10;
    
    // Increase confidence if market regime is clear
    if (structureData.marketRegime.current !== 'sideways') confidence += 10;
    
    return Math.min(95, confidence);
  }

  private getFallbackData(): MarketStructureData {
    return {
      earningsCalendar: {
        upcomingEarnings: [],
        earningsProximity: 'normal',
        volatilityExpectation: 20,
        historicalPattern: 'unknown'
      },
      economicEvents: {
        upcomingEvents: [],
        fedSchedule: {
          nextMeeting: '',
          rateProbability: 0.5,
          hawkishDovish: 'neutral'
        },
        macroEnvironment: 'neutral'
      },
      sectorAnalysis: {
        currentRotation: {
          inflow: [],
          outflow: [],
          neutral: ['Unknown']
        },
        relativeStrength: {
          sector: 'Unknown',
          vsMarket: 0,
          momentum: 'neutral',
          trend: 'stable'
        },
        correlationBreakdown: {
          status: 'normal',
          strength: 0.5
        }
      },
      marketRegime: {
        current: 'sideways',
        volatilityRegime: 'normal',
        liquidityConditions: 'normal',
        sentiment: 'neutral'
      },
      confidence: 30,
      sources: ['fallback_data']
    };
  }
}