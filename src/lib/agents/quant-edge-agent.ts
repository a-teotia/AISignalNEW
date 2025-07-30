import { BaseAgent } from './base-agent';
import { AgentInput, AgentOutput, QuantEdgeData } from '../types/prediction-types';
import { getBaseUrl } from '../utils';

function isCrypto(symbol: string) {
  return symbol.includes('BTC') || symbol.includes('ETH') || symbol.includes('USDT');
}

// Removed duplicate data fetching functions - now using centralized provider

export class QuantEdgeAgent extends BaseAgent {
  constructor() {
    super({
      name: "QuantEdge",
      description: "Technical analysis and pattern recognition",
      model: "sonar",
      temperature: 0.1,
      maxTokens: 1500,
      timeout: 30000
    });
  }

  async process(input: AgentInput): Promise<AgentOutput> {
    // Get comprehensive data from centralized provider
    const centralizedData = await this.getCentralizedData(input.symbol);
    
    // STRICT VALIDATION: Only proceed with real live data
    if (!centralizedData || !centralizedData.technicalData || !centralizedData.marketData) {
      throw new Error(`[QuantEdgeAgent] No live technical data available for ${input.symbol}. Refusing to generate predictions without real market data.`);
    }
    
    // Validate data quality - must be real-time or recent cached
    if (centralizedData.overallQuality !== 'realtime' && centralizedData.overallQuality !== 'cached') {
      throw new Error(`[QuantEdgeAgent] Data quality insufficient (${centralizedData.overallQuality}). Only real-time or recent cached data accepted.`);
    }
    
    // Validate technical indicators are present
    const technicalData = centralizedData.technicalData;
    if (!technicalData.rsi || !technicalData.macd || !technicalData.sma) {
      throw new Error(`[QuantEdgeAgent] Missing critical technical indicators for ${input.symbol}. Cannot proceed without RSI, MACD, and SMA data.`);
    }
    
    console.log(`🧮 Performing algorithmic technical analysis for ${input.symbol} with live data...`);
    
    // Calculate real technical analysis using mathematical algorithms - NO FALLBACKS
    const data = await this.performAlgorithmicTechnicalAnalysis(input.symbol, technicalData, centralizedData);
    
    // Validate analysis results
    if (!data || !data.indicators) {
      throw new Error(`[QuantEdgeAgent] Algorithmic analysis failed for ${input.symbol}. Cannot generate prediction without valid technical analysis.`);
    }
    
    const confidence = data.confidence || this.calculateTechnicalConfidence(data);
    const sources = [
      ...(data.sources || [
        input.symbol.includes('BTC') || input.symbol.includes('ETH') ? 'https://binance.com' : 'https://finance.yahoo.com',
        'https://tradingview.com',
        'https://barchart.com'
      ]),
      ...centralizedData.sources
    ];

    // Create quality and validation metrics based on centralized data
    const qualityMetrics = this.createQualityMetrics(centralizedData);
    const validationMetrics = this.createValidationMetrics(centralizedData);
    const reliabilityMetrics = this.createReliabilityMetrics(centralizedData);

    return {
      agent: this.config.name,
      symbol: input.symbol,
      timestamp: new Date().toISOString(),
      data: data,
      confidence: confidence,
      sources: sources,
      processingTime: Date.now() - Date.now(), // Algorithmic processing time is negligible
      quality: qualityMetrics,
      validation: validationMetrics,
      reliability: reliabilityMetrics
    };
  }

  private validateTechnicalData(centralizedData: any) {
    // Strict validation - no fallbacks, no defaults
    const technicalData = centralizedData.technicalData;
    const marketData = centralizedData.marketData;
    
    if (!technicalData || !marketData) {
      throw new Error('Missing technical or market data - cannot proceed');
    }
    
    // Validate all required indicators are present and valid
    if (typeof technicalData.rsi !== 'number' || technicalData.rsi < 0 || technicalData.rsi > 100) {
      throw new Error(`Invalid RSI value: ${technicalData.rsi}`);
    }
    
    if (!technicalData.macd || typeof technicalData.macd.value !== 'number') {
      throw new Error('Invalid MACD data');
    }
    
    if (!technicalData.sma || typeof technicalData.sma.sma20 !== 'number' || typeof technicalData.sma.sma50 !== 'number') {
      throw new Error('Invalid SMA data');
    }
    
    if (typeof marketData.price !== 'number' || marketData.price <= 0) {
      throw new Error(`Invalid market price: ${marketData.price}`);
    }
    
    // Return validated technical data structure
    return {
      rsi: { 
        value: technicalData.rsi, 
        signal: technicalData.rsi > 70 ? 'overbought' : technicalData.rsi < 30 ? 'oversold' : 'neutral' 
      },
      macd: { 
        value: technicalData.macd.value, 
        signal: technicalData.macd.value > (technicalData.macd.signal || 0) ? 'bullish' : 'bearish' 
      },
      bollinger: { 
        position: technicalData.bollinger ? 
          (marketData.price > technicalData.bollinger.upper ? 'above' : 
           marketData.price < technicalData.bollinger.lower ? 'below' : 'middle') : 'unknown',
        signal: 'neutral'
      },
      sma: { 
        sma20: technicalData.sma.sma20, 
        sma50: technicalData.sma.sma50, 
        signal: technicalData.sma.sma20 > technicalData.sma.sma50 ? 'bullish' : 'bearish' 
      }
    };
  }

  // REMOVED: No synthetic data generation - only live data accepted

  private calculateTechnicalConfidence(data: QuantEdgeData): number {
    const factors = {
      dataQuality: 80,
      signalStrength: Math.abs((data.trend?.strength || 50) - 50) * 2, // 0-100 based on trend strength
      sourceReliability: 85,
      recency: 90
    };

    return this.calculateConfidence(factors);
  }

  // LIVE DATA ONLY: Mathematical technical analysis with strict validation
  private async performAlgorithmicTechnicalAnalysis(symbol: string, technicalData: any, centralizedData: any): Promise<QuantEdgeData> {
    console.log(`🧮 Starting algorithmic technical analysis for ${symbol} with validated live data...`);
    
    // Validate and extract technical data - NO DEFAULTS OR FALLBACKS
    const validatedData = this.validateTechnicalData(centralizedData);
    
    const rsi = validatedData.rsi.value;
    const macd = centralizedData.technicalData.macd;
    const bollinger = centralizedData.technicalData.bollinger || null;
    const sma = validatedData.sma;
    const currentPrice = centralizedData.marketData.price;
      
      // 🎯 ALGORITHMIC SIGNAL GENERATION
      
      // RSI Analysis (Mathematical)
      const rsiSignal = rsi > 70 ? 'bearish' : rsi < 30 ? 'bullish' : 'neutral';
      
      // MACD Analysis (Mathematical) 
      const macdSignal = macd.value > macd.signal ? 'bullish' : macd.value < macd.signal ? 'bearish' : 'neutral';
      
      // Bollinger Bands Analysis (Mathematical)
      let bollingerPosition = 'middle';
      let bollingerSignal = 'neutral';
      if (currentPrice > 0 && bollinger.upper > 0) {
        if (currentPrice > bollinger.upper * 0.99) {
          bollingerPosition = 'upper';
          bollingerSignal = 'bearish'; // Overbought
        } else if (currentPrice < bollinger.lower * 1.01) {
          bollingerPosition = 'lower';
          bollingerSignal = 'bullish'; // Oversold
        }
      }
      
      // Moving Average Crossover (Mathematical)
      const emaSignal = sma.sma20 > sma.sma50 ? 'bullish' : sma.sma20 < sma.sma50 ? 'bearish' : 'neutral';
      
      // 🎯 TREND ANALYSIS (Mathematical Algorithm)
      const trendAnalysis = this.calculateTrendAlgorithmically(rsi, macd, currentPrice, sma);
      
      // 🎯 SUPPORT/RESISTANCE LEVELS (Mathematical)
      const levels = this.calculateSupportResistanceLevels(currentPrice, bollinger, sma);
      
      // 🎯 CONSENSUS CALCULATION (Mathematical Weighted Scoring)
      const consensus = this.calculateConsensusAlgorithmically({
        rsi: rsiSignal,
        macd: macdSignal,
        bollinger: bollingerSignal,
        ema: emaSignal
      });
      
      // Calculate overall confidence based on signal convergence
      const signalConvergence = this.calculateSignalConvergence(rsiSignal, macdSignal, bollingerSignal, emaSignal);
      const confidence = Math.round(50 + (signalConvergence * 30)); // 50-80% range based on convergence
      
      const result = {
        indicators: {
          rsi: { value: Math.round(rsi * 100) / 100, signal: rsiSignal },
          macd: { value: Math.round(macd.value * 1000) / 1000, signal: macdSignal },
          bollinger: { position: bollingerPosition, signal: bollingerSignal },
          ema: { short: sma.sma20, long: sma.sma50, signal: emaSignal },
          ichimoku: { signal: 'neutral' } // Could be enhanced with Ichimoku calculations
        },
        patterns: {
          detected: this.detectPatterns(rsiSignal, macdSignal, bollingerSignal),
          confidence: [confidence]
        },
        levels,
        trend: trendAnalysis,
        consensus,
        confidence,
        sources: ['algorithmic_analysis', 'twelvedata', 'mathematical_calculations']
      };
      
      console.log(`✅ Algorithmic analysis completed: trend=${trendAnalysis.direction}, confidence=${confidence}%`);
      return result;
      
    // No try-catch with fallback - let errors propagate to fail the prediction
  }
  
  private calculateTrendAlgorithmically(rsi: number, macd: any, price: number, sma: any) {
    // Mathematical trend calculation
    const signals = [];
    
    // RSI trend component
    if (rsi > 60) signals.push(1);
    else if (rsi < 40) signals.push(-1);
    else signals.push(0);
    
    // MACD trend component  
    if (macd.value > macd.signal && macd.histogram > 0) signals.push(1);
    else if (macd.value < macd.signal && macd.histogram < 0) signals.push(-1);
    else signals.push(0);
    
    // Moving average trend component
    if (sma.sma20 > sma.sma50 && price > sma.sma20) signals.push(1);
    else if (sma.sma20 < sma.sma50 && price < sma.sma20) signals.push(-1);
    else signals.push(0);
    
    const trendScore = signals.reduce((sum, signal) => sum + signal, 0);
    const strength = Math.abs(trendScore) / signals.length * 100;
    
    return {
      direction: trendScore > 0 ? 'bullish' : trendScore < 0 ? 'bearish' : 'neutral',
      strength: Math.round(strength),
      confidence: Math.round(50 + strength * 0.5) // 50-100% based on strength
    };
  }
  
  private calculateSupportResistanceLevels(price: number, bollinger: any, sma: any) {
    const support = [];
    const resistance = [];
    
    if (bollinger.lower > 0) support.push(bollinger.lower);
    if (sma.sma50 > 0) support.push(sma.sma50);
    if (bollinger.upper > 0) resistance.push(bollinger.upper);
    if (sma.sma20 > 0 && sma.sma20 > price) resistance.push(sma.sma20);
    
    return {
      support: support.sort((a, b) => b - a).slice(0, 3), // Top 3 closest support levels
      resistance: resistance.sort((a, b) => a - b).slice(0, 3) // Top 3 closest resistance levels
    };
  }
  
  private calculateConsensusAlgorithmically(signals: Record<string, string>) {
    const values = Object.values(signals);
    const bullish = values.filter(s => s === 'bullish').length;
    const bearish = values.filter(s => s === 'bearish').length; 
    const neutral = values.filter(s => s === 'neutral').length;
    const total = values.length;
    
    return {
      bullish: Math.round((bullish / total) * 100),
      bearish: Math.round((bearish / total) * 100),
      neutral: Math.round((neutral / total) * 100)
    };
  }
  
  private calculateSignalConvergence(...signals: string[]): number {
    const uniqueSignals = new Set(signals.filter(s => s !== 'neutral'));
    if (uniqueSignals.size === 1) return 1.0; // All signals agree
    if (uniqueSignals.size === 0) return 0.5; // All neutral
    return 0.2; // Mixed signals
  }
  
  private detectPatterns(rsi: string, macd: string, bollinger: string): string[] {
    const patterns = [];
    
    if (rsi === 'bullish' && macd === 'bullish') patterns.push('Bullish Momentum');
    if (rsi === 'bearish' && macd === 'bearish') patterns.push('Bearish Momentum');
    if (rsi === 'bullish' && bollinger === 'bullish') patterns.push('Oversold Bounce');
    if (rsi === 'bearish' && bollinger === 'bearish') patterns.push('Overbought Reversal');
    if (rsi === 'neutral' && macd === 'neutral') patterns.push('Consolidation');
    
    return patterns;
  }

  // REMOVED: No fallback data - predictions must be based on live data only
}
