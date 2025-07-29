export interface AgentInput {
  symbol: string;
  context?: any;
  metadata?: Record<string, any>;
}

// 🏆 GOLD STANDARD: Signal Quality Metrics
export interface SignalQuality {
  dataFreshness: number; // seconds since last data update
  sourceReliability: number; // 0-100, based on historical accuracy
  crossVerification: number; // 0-100, % agreement across sources
  anomalyScore: number; // 0-100, statistical outlier detection
  completeness: number; // 0-100, % of required fields present
  consistency: number; // 0-100, internal data consistency
  overallQuality: number; // weighted average of all metrics
  warnings: string[]; // quality warnings for users
  lastValidated: string; // ISO timestamp
}

// 🏆 GOLD STANDARD: Enhanced Agent Output with Quality
export interface AgentOutput {
  agent: string;
  symbol: string;
  timestamp: string;
  data: any;
  confidence: number;
  sources: string[];
  processingTime: number;
  metadata?: Record<string, any>;
  // 🆕 GOLD STANDARD ADDITIONS:
  quality: SignalQuality;
  validation: {
    passed: boolean;
    checks: ValidationCheck[];
    score: number; // 0-100 validation score
  };
  reliability: {
    historicalAccuracy: number; // 0-100, based on past performance
    dataSourceHealth: number; // 0-100, API reliability
    signalStrength: number; // 0-100, how strong the signal is
  };
}

// 🏆 GOLD STANDARD: Validation System
export interface ValidationCheck {
  name: string;
  passed: boolean;
  score: number; // 0-100
  details: string;
  critical: boolean; // if false, signal can still be used
}

export interface AgentConfig {
  name: string;
  description: string;
  model: string;
  temperature: number;
  maxTokens: number;
  timeout: number;
}

// 🏆 GOLD STANDARD: Enhanced Multi-Agent Output
export interface MultiAgentOutput {
  symbol: string;
  timestamp: string;
  agents: Record<string, AgentOutput>;
  totalProcessingTime: number;
  finalPrediction: {
    direction: 'UP' | 'DOWN' | 'SIDEWAYS';
    timeframes: {
      '1day': 'UP' | 'DOWN' | 'SIDEWAYS';
      '1week': 'UP' | 'DOWN' | 'SIDEWAYS';
      '1month': 'UP' | 'DOWN' | 'SIDEWAYS';
    };
    confidence: number;
    // 🆕 GOLD STANDARD ADDITIONS:
    entryPrice?: number;
    stopLoss?: number;
    takeProfit?: number;
    expirationTime?: string; // ISO timestamp
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    // 🔧 RISK MANAGEMENT ADDITIONS:
    riskRewardRatio?: number;
    tradeable?: boolean;
  };
  confidence: number;
  metadata: {
    agentConfidences: Record<string, number>;
    tags: string[];
    riskFactors: string[];
    // 🆕 GOLD STANDARD ADDITIONS:
    overallQuality: SignalQuality;
    validationSummary: {
      totalChecks: number;
      passedChecks: number;
      criticalFailures: number;
      overallScore: number;
    };
    reliabilityMetrics: {
      averageAgentAccuracy: number;
      dataSourceHealth: number;
      signalConsistency: number;
    };
    transparency: {
      dataSources: Array<{
        name: string;
        reliability: number;
        lastUpdated: string;
        contribution: number;
      }>;
      reasoning: {
        technical: string[];
        sentiment: string[];
        macro: string[];
        conflicts: string[];
        uncertainties: string[];
      };
    };
    crossValidation: {
      conflicts: Array<{
        type: string;
        agents: string[];
        description: string;
        severity: 'low' | 'medium' | 'high';
        impact: number;
      }>;
      consensus: Record<string, any>;
      outliers: string[];
      conflictScore: number;
      consensusStrength: number;
    };
  };
}

// 🏆 GOLD STANDARD: Signal Validation Rules
export interface ValidationRule {
  name: string;
  description: string;
  critical: boolean;
  validate: (data: any, agent: string) => ValidationCheck;
}

// 🏆 GOLD STANDARD: Performance Tracking
export interface AgentPerformance {
  agentId: string;
  symbol: string;
  accuracy: number; // 0-100, historical accuracy
  dataQualityCorrelation: number; // correlation between data quality and accuracy
  userFeedback: number; // 0-100, user rating
  lastUpdated: string;
  predictionsCount: number;
  successfulPredictions: number;
}

export interface SonarResearchData {
  background: string;
  filings: string[];
  news: string[];
  executives: string[];
  products: string[];
  sentiment?: {
    overall: 'bullish' | 'bearish' | 'neutral';
    newsSentiment: number;
    socialSentiment: number;
    analystRating: 'buy' | 'hold' | 'sell';
  };
  geopolitical?: {
    economicFactors: string[];
    politicalRisks: string[];
    socialTrends: string[];
    globalImpact: 'positive' | 'negative' | 'neutral';
    riskLevel: 'low' | 'medium' | 'high';
  };
  keyEvents?: Array<{
    date: string;
    event: string;
    impact: 'positive' | 'negative' | 'neutral';
  }>;
  confidence?: number;
  sources?: string[];
}

export interface GeoSentienceData {
  macroFactors: {
    economic: string[];
    political: string[];
    social: string[];
  };
  sentimentAnalysis: {
    twitter: { sentiment: string; score: number };
    reddit: { sentiment: string; score: number };
    news: { sentiment: string; score: number };
  };
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
  };
  confidence?: number;
  sources?: string[];
}

export interface QuantEdgeData {
  indicators: {
    rsi: { value: number; signal: string };
    macd: { value: number; signal: string };
    bollinger: { position: string; signal: string };
    ema: { short: number; long: number; signal: string };
    ichimoku: { signal: string };
  };
  patterns: {
    detected: string[];
    confidence: number[];
  };
  levels: {
    support: number[];
    resistance: number[];
  };
  trend: {
    direction: string;
    strength: number;
    confidence: number;
  };
  consensus: {
    bullish: number;
    bearish: number;
    neutral: number;
  };
  confidence?: number;
  sources?: string[];
}

export interface SynthOracleData {
  prediction: {
    direction: 'UP' | 'DOWN' | 'SIDEWAYS';
    timeframes: {
      '1day': 'UP' | 'DOWN' | 'SIDEWAYS';
      '1week': 'UP' | 'DOWN' | 'SIDEWAYS';
      '1month': 'UP' | 'DOWN' | 'SIDEWAYS';
    };
    confidence: number;
  };
  reasoning: {
    chainOfThought: string;
    evidence: string[];
    conflicts: string[];
  };
  tags: string[];
  riskFactors: string[];
  synthesis: {
    summary: string;
    keyDrivers: string[];
    uncertainties: string[];
  };
  markdownTable?: string;
}

export interface OptionsData {
  symbol: string;
  putCallRatio: number;
  totalCallVolume: number;
  totalPutVolume: number;
  avgCallIV: number;
  avgPutIV: number;
  calls: Array<{
    strike: number;
    lastPrice: number;
    volume: number;
    openInterest: number;
    impliedVolatility: number;
  }>;
  puts: Array<{
    strike: number;
    lastPrice: number;
    volume: number;
    openInterest: number;
    impliedVolatility: number;
  }>;
  timestamp: string;
  source: string;
  quality: 'realtime' | 'historical';
}

export interface FuturesData {
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  openInterest: number;
  contractSize: number;
  expirationDate: string;
  timestamp: string;
  source: string;
  quality: 'realtime' | 'historical';
}

export interface InstitutionalData {
  symbol: string;
  majorHolders: Array<{
    name: string;
    shares: number;
    percentage: number;
    value: number;
  }>;
  insiderRoster: Array<{
    name: string;
    title: string;
    shares: number;
    percentage: number;
  }>;
  insiderTransactions: Array<{
    insider: string;
    title: string;
    transactionType: 'buy' | 'sell';
    shares: number;
    price: number;
    value: number;
    date: string;
  }>;
  topHoldings: Array<{
    name: string;
    shares: number;
    percentage: number;
    value: number;
  }>;
  institutionalOwnership: number;
  insiderOwnership: number;
  timestamp: string;
  source: string;
  quality: 'realtime' | 'historical';
}

export interface FundamentalData {
  symbol: string;
  earnings: {
    quarterly: Array<{
      period: string;
      revenue: number;
      earnings: number;
      eps: number;
      surprise: number;
      surprisePercent: number;
    }>;
    annual: Array<{
      year: string;
      revenue: number;
      earnings: number;
      eps: number;
    }>;
    estimates: {
      nextQuarter: {
        revenue: number;
        earnings: number;
        eps: number;
      };
      nextYear: {
        revenue: number;
        earnings: number;
        eps: number;
      };
    };
  };
  financials: {
    incomeStatement: {
      revenue: number;
      grossProfit: number;
      operatingIncome: number;
      netIncome: number;
      ebitda: number;
    };
    balanceSheet: {
      totalAssets: number;
      totalLiabilities: number;
      totalEquity: number;
      cash: number;
      debt: number;
    };
    cashFlow: {
      operatingCashFlow: number;
      investingCashFlow: number;
      financingCashFlow: number;
      freeCashFlow: number;
      capitalExpenditure: number;
    };
  };
  ratios: {
    peRatio: number;
    pbRatio: number;
    debtToEquity: number;
    currentRatio: number;
    quickRatio: number;
    roe: number;
    roa: number;
    profitMargin: number;
    operatingMargin: number;
  };
  timestamp: string;
  source: string;
  quality: 'realtime' | 'historical';
}

export interface ESGData {
  symbol: string;
  environmental: {
    carbonFootprint: number;
    renewableEnergy: number;
    wasteManagement: number;
    waterConservation: number;
    biodiversityImpact: number;
    overallScore: number;
  };
  social: {
    laborRights: number;
    humanRights: number;
    communityImpact: number;
    diversityInclusion: number;
    healthSafety: number;
    overallScore: number;
  };
  governance: {
    boardIndependence: number;
    executiveCompensation: number;
    shareholderRights: number;
    transparency: number;
    antiCorruption: number;
    overallScore: number;
  };
  esgScore: number;
  controversyLevel: 'low' | 'medium' | 'high';
  sustainabilityRating: 'A' | 'B' | 'C' | 'D' | 'F';
  timestamp: string;
  source: string;
  quality: 'realtime' | 'historical';
}
