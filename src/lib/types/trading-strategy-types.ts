/**
 * 🎯 TRADING STRATEGY SYSTEM
 * Strategy-aware sequential analysis with dynamic agent behavior
 */

export type TradingStrategyType = 'day' | 'swing' | 'longterm';

export interface AgentWeights {
  technical: number;
  fundamental: number;
  newsSentiment: number;
  marketStructure: number;
}

export interface StrategyValidityPeriod {
  optimal: string;      // Peak reliability period
  acceptable: string;   // Still useful period
  stale: string;        // Should reassess period
  degradeRate: number;  // Confidence loss % per day
}

export interface StrategyConfiguration {
  type: TradingStrategyType;
  name: string;
  description: string;
  timeHorizon: string;
  
  // System behavior
  cacheTimeout: number;         // API cache duration (ms)
  dataRefreshRate: 'aggressive' | 'standard' | 'relaxed';
  analysisDepth: 'fast' | 'balanced' | 'comprehensive';
  
  // Agent priorities (must sum to 100)
  agentWeights: AgentWeights;
  
  // Signal validity and decay
  validityPeriod: StrategyValidityPeriod;
  
  // Strategy-specific parameters
  parameters: {
    focusIndicators: string[];      // Primary technical indicators
    newsTimeframe: string;          // How far back to look for news
    fundamentalDepth: 'minimal' | 'standard' | 'deep';
    riskTolerance: 'low' | 'medium' | 'high';
  };
}

export interface StrategyOutput {
  symbol: string; // 🎯 FIX: Added missing symbol property
  strategy: TradingStrategyType;
  prediction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidence: number;
  timeHorizon: string;
  
  // Decay and validity tracking
  validityPeriod: StrategyValidityPeriod;
  analysisTimestamp: string;
  
  // Strategy-specific metrics
  strategyMetrics: {
    expectedHoldPeriod: string;
    riskRewardRatio: string;
    stopLoss?: number;
    targetPrice?: number;
    keyLevels: {
      support: number[];
      resistance: number[];
    };
  };
  
  // Enhanced reasoning
  reasoning: {
    primary: string;        // Main thesis
    supporting: string[];   // Supporting factors
    risks: string[];        // Key risks to watch
    catalysts: string[];    // Potential triggers
  };

  // 🎯 TPSL (Take Profit, Stop Loss) Recommendations - Key user requirement
  tpslRecommendations?: {
    takeProfit1: number;
    takeProfit2?: number;
    stopLoss: number;
    entryPrice: number;
    riskRewardRatio: string;
    positionSize?: string;
    reasoning: string;
  };

  // Sequential analysis pass-through data for complete UI display
  executiveSummary?: string;
  quantAnalysis?: any;
  marketAnalysis?: any;
  technicalAnalysis?: any;
  sentimentAnalysis?: any;
  fundamentalAnalysis?: any;
  citedSources?: string[];
  agentChain?: string[];
  totalProcessingTime?: number;
  
  // Agent contributions with strategy context
  agentContributions: {
    technical: {
      signal: string;
      confidence: number;
      strategyRelevance: number; // How relevant for this strategy (0-100)
      normalizedWeight: number;  // Weight after normalization (0-100)
      decisionWeight: number;    // Final weight used in decision logic
    };
    fundamental: {
      signal: string;
      confidence: number;
      strategyRelevance: number;
      normalizedWeight: number;
      decisionWeight: number;
    };
    newsSentiment: {
      signal: string;
      confidence: number;
      strategyRelevance: number;
      normalizedWeight: number;
      decisionWeight: number;
    };
    marketStructure: {
      signal: string;
      confidence: number;
      strategyRelevance: number;
      normalizedWeight: number;
      decisionWeight: number;
    };
  };
}

// Pre-configured strategy profiles
export const STRATEGY_CONFIGS: Record<TradingStrategyType, StrategyConfiguration> = {
  day: {
    type: 'day',
    name: 'Day Trading',
    description: 'Intraday opportunities with quick entries and exits',
    timeHorizon: 'Hours to 1 day',
    
    cacheTimeout: 30000,              // 30 seconds
    dataRefreshRate: 'aggressive',
    analysisDepth: 'fast',
    
    agentWeights: {
      technical: 40,        // High - intraday patterns crucial
      marketStructure: 30,  // High - key levels for day trading
      newsSentiment: 20,    // Medium - breaking news matters
      fundamental: 10,      // Low - less relevant intraday
    },
    
    validityPeriod: {
      optimal: 'Next 2-4 hours',
      acceptable: 'Same trading day',
      stale: 'After market close',
      degradeRate: 25,      // 25% confidence loss per day
    },
    
    parameters: {
      focusIndicators: ['RSI_15min', 'VWAP', 'Volume', 'Support_Resistance'],
      newsTimeframe: '2 hours',
      fundamentalDepth: 'minimal',
      riskTolerance: 'high',
    },
  },
  
  swing: {
    type: 'swing',
    name: 'Swing Trading',
    description: 'Multi-day positions capturing intermediate moves',
    timeHorizon: '2-10 days',
    
    cacheTimeout: 120000,             // 2 minutes (current system)
    dataRefreshRate: 'standard',
    analysisDepth: 'balanced',
    
    agentWeights: {
      technical: 25,        // Balanced - trend analysis
      fundamental: 25,      // Balanced - earnings/events matter
      newsSentiment: 25,    // Balanced - sentiment shifts
      marketStructure: 25,  // Balanced - key levels important
    },
    
    validityPeriod: {
      optimal: 'Next 1-3 days',
      acceptable: 'Up to 7 days',
      stale: 'After 10 days',
      degradeRate: 15,      // 15% confidence loss per day
    },
    
    parameters: {
      focusIndicators: ['RSI_Daily', 'MACD', 'Bollinger_Bands', 'SMA_20_50'],
      newsTimeframe: '3 days',
      fundamentalDepth: 'standard',
      riskTolerance: 'medium',
    },
  },
  
  longterm: {
    type: 'longterm',
    name: 'Long Term',
    description: 'Position trading based on fundamental value',
    timeHorizon: '2 weeks to 6 months',
    
    cacheTimeout: 600000,             // 10 minutes
    dataRefreshRate: 'relaxed',
    analysisDepth: 'comprehensive',
    
    agentWeights: {
      fundamental: 50,      // Primary - value, earnings, growth
      newsSentiment: 20,    // Medium - trend confirmation
      technical: 20,        // Medium - entry timing
      marketStructure: 10,  // Low - less relevant long-term
    },
    
    validityPeriod: {
      optimal: 'Next 2-4 weeks',
      acceptable: 'Up to 3 months',
      stale: 'After 6 months',
      degradeRate: 5,       // 5% confidence loss per day
    },
    
    parameters: {
      focusIndicators: ['SMA_200', 'Weekly_MACD', 'Monthly_Trends', 'Value_Metrics'],
      newsTimeframe: '2 weeks',
      fundamentalDepth: 'deep',
      riskTolerance: 'low',
    },
  },
};

export interface StrategySelectionRequest {
  symbol: string;
  strategy: TradingStrategyType;
  userId?: string;
  timestamp: string;
}

export interface StrategyAnalysisContext {
  strategy: StrategyConfiguration;
  symbol: string;
  marketData: any;
  timestamp: string;
}