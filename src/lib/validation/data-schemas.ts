import { z } from 'zod';

// Base schemas for common data types
export const BasePriceSchema = z.object({
  open: z.number().positive(),
  high: z.number().positive(),
  low: z.number().positive(),
  close: z.number().positive(),
  volume: z.number().nonnegative(),
  timestamp: z.string().datetime()
});

export const BaseConfidenceSchema = z.object({
  confidence: z.number().min(0).max(100),
  dataQuality: z.number().min(0).max(100),
  signalStrength: z.number().min(0).max(100),
  sourceReliability: z.number().min(0).max(100),
  recency: z.number().min(0).max(100)
});

// Agent-specific data schemas
export const SonarResearchDataSchema = z.object({
  background: z.string().min(1),
  filings: z.array(z.string()),
  news: z.array(z.string()),
  executives: z.array(z.string()),
  products: z.array(z.string()),
  sentiment: z.object({
    overall: z.enum(['bullish', 'bearish', 'neutral']),
    newsSentiment: z.number().min(0).max(1),
    socialSentiment: z.number().min(0).max(1),
    analystRating: z.enum(['buy', 'hold', 'sell'])
  }).optional(),
  geopolitical: z.object({
    economicFactors: z.array(z.string()),
    politicalRisks: z.array(z.string()),
    socialTrends: z.array(z.string()),
    globalImpact: z.enum(['positive', 'negative', 'neutral']),
    riskLevel: z.enum(['low', 'medium', 'high'])
  }).optional(),
  keyEvents: z.array(z.object({
    date: z.string().datetime(),
    event: z.string(),
    impact: z.enum(['positive', 'negative', 'neutral'])
  })).optional(),
  confidence: z.number().min(0).max(100).optional(),
  sources: z.array(z.string()).optional()
});

export const GeoSentienceDataSchema = z.object({
  macroFactors: z.object({
    economic: z.array(z.string()),
    political: z.array(z.string()),
    social: z.array(z.string())
  }),
  sentimentAnalysis: z.object({
    twitter: z.object({
      sentiment: z.string(),
      score: z.number().min(0).max(100)
    }),
    reddit: z.object({
      sentiment: z.string(),
      score: z.number().min(0).max(100)
    }),
    news: z.object({
      sentiment: z.string(),
      score: z.number().min(0).max(100)
    })
  }),
  riskAssessment: z.object({
    level: z.enum(['low', 'medium', 'high']),
    factors: z.array(z.string())
  }),
  confidence: z.number().min(0).max(100).optional(),
  sources: z.array(z.string()).optional()
});

export const QuantEdgeDataSchema = z.object({
  indicators: z.object({
    rsi: z.object({
      value: z.number().min(0).max(100),
      signal: z.string()
    }),
    macd: z.object({
      value: z.number(),
      signal: z.string()
    }),
    bollinger: z.object({
      position: z.string(),
      signal: z.string()
    }),
    ema: z.object({
      short: z.number().positive(),
      long: z.number().positive(),
      signal: z.string()
    }),
    ichimoku: z.object({
      signal: z.string()
    })
  }),
  patterns: z.object({
    detected: z.array(z.string()),
    confidence: z.array(z.number().min(0).max(100))
  }),
  levels: z.object({
    support: z.array(z.number().positive()),
    resistance: z.array(z.number().positive())
  }),
  trend: z.object({
    direction: z.string(),
    strength: z.number().min(0).max(100),
    confidence: z.number().min(0).max(100)
  }),
  consensus: z.object({
    bullish: z.number().min(0).max(100),
    bearish: z.number().min(0).max(100),
    neutral: z.number().min(0).max(100)
  }),
  confidence: z.number().min(0).max(100).optional(),
  sources: z.array(z.string()).optional()
});

// Quality and validation schemas
export const SignalQualitySchema = z.object({
  dataFreshness: z.number().min(0),
  sourceReliability: z.number().min(0).max(100),
  crossVerification: z.number().min(0).max(100),
  anomalyScore: z.number().min(0).max(100),
  completeness: z.number().min(0).max(100),
  consistency: z.number().min(0).max(100),
  overallQuality: z.number().min(0).max(100),
  warnings: z.array(z.string()),
  lastValidated: z.string().datetime()
});

export const ValidationCheckSchema = z.object({
  name: z.string(),
  passed: z.boolean(),
  score: z.number().min(0).max(100),
  details: z.string(),
  critical: z.boolean()
});

export const AgentOutputSchema = z.object({
  agent: z.string(),
  symbol: z.string(),
  timestamp: z.string().datetime(),
  data: z.any(), // Will be validated by specific agent schemas
  confidence: z.number().min(0).max(100),
  sources: z.array(z.string()),
  processingTime: z.number().positive(),
  metadata: z.record(z.any()).optional(),
  quality: SignalQualitySchema,
  validation: z.object({
    passed: z.boolean(),
    checks: z.array(ValidationCheckSchema),
    score: z.number().min(0).max(100)
  }),
  reliability: z.object({
    historicalAccuracy: z.number().min(0).max(100),
    dataSourceHealth: z.number().min(0).max(100),
    signalStrength: z.number().min(0).max(100)
  })
});

// Multi-agent output schema
export const MultiAgentOutputSchema = z.object({
  symbol: z.string(),
  timestamp: z.string().datetime(),
  agents: z.record(z.string(), AgentOutputSchema),
  totalProcessingTime: z.number().positive(),
  finalPrediction: z.object({
    direction: z.enum(['UP', 'DOWN', 'SIDEWAYS']),
    timeframes: z.object({
      '1day': z.enum(['UP', 'DOWN', 'SIDEWAYS']),
      '1week': z.enum(['UP', 'DOWN', 'SIDEWAYS']),
      '1month': z.enum(['UP', 'DOWN', 'SIDEWAYS'])
    }),
    confidence: z.number().min(0).max(100),
    entryPrice: z.number().positive().optional(),
    stopLoss: z.number().positive().optional(),
    takeProfit: z.number().positive().optional(),
    expirationTime: z.string().datetime().optional(),
    riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH'])
  }),
  confidence: z.number().min(0).max(100),
  metadata: z.object({
    agentConfidences: z.record(z.string(), z.number().min(0).max(100)),
    tags: z.array(z.string()),
    riskFactors: z.array(z.string()),
    overallQuality: SignalQualitySchema,
    validationSummary: z.object({
      totalChecks: z.number().nonnegative(),
      passedChecks: z.number().nonnegative(),
      criticalFailures: z.number().nonnegative(),
      overallScore: z.number().min(0).max(100)
    }),
    reliabilityMetrics: z.object({
      averageAgentAccuracy: z.number().min(0).max(100),
      dataSourceHealth: z.number().min(0).max(100),
      signalConsistency: z.number().min(0).max(100)
    }),
    transparency: z.object({
      dataSources: z.array(z.object({
        name: z.string(),
        reliability: z.number().min(0).max(100),
        lastUpdated: z.string().datetime(),
        contribution: z.number().min(0).max(100)
      })),
      reasoning: z.object({
        technical: z.array(z.string()),
        sentiment: z.array(z.string()),
        macro: z.array(z.string()),
        conflicts: z.array(z.string()),
        uncertainties: z.array(z.string())
      })
    })
  })
});

// Data provider schemas
export const MarketDataSchema = z.object({
  symbol: z.string(),
  prices: z.array(BasePriceSchema),
  indicators: z.record(z.string(), z.any()).optional(),
  metadata: z.object({
    lastUpdated: z.string().datetime(),
    source: z.string(),
    quality: z.number().min(0).max(100)
  })
});

// Validation functions
export const validateAgentData = (agentName: string, data: any) => {
  const schemas: Record<string, z.ZodSchema> = {
    'SonarResearchAgent': SonarResearchDataSchema,
    'GeoSentienceAgent': GeoSentienceDataSchema,
    'QuantEdgeAgent': QuantEdgeDataSchema
  };

  const schema = schemas[agentName];
  if (!schema) {
    console.warn(`No schema found for agent: ${agentName}`);
    return { valid: true, data }; // Allow unknown agents
  }

  try {
    const validatedData = schema.parse(data);
    return { valid: true, data: validatedData };
  } catch (error) {
    console.error(`Validation failed for ${agentName}:`, error);
    return { valid: false, error, data };
  }
};

export const validateAgentOutput = (output: any) => {
  try {
    const validatedOutput = AgentOutputSchema.parse(output);
    return { valid: true, data: validatedOutput };
  } catch (error) {
    console.error('Agent output validation failed:', error);
    return { valid: false, error, data: output };
  }
};

export const validateMultiAgentOutput = (output: any) => {
  try {
    const validatedOutput = MultiAgentOutputSchema.parse(output);
    return { valid: true, data: validatedOutput };
  } catch (error) {
    console.error('Multi-agent output validation failed:', error);
    return { valid: false, error, data: output };
  }
};

export const validateMarketData = (data: any) => {
  try {
    const validatedData = MarketDataSchema.parse(data);
    return { valid: true, data: validatedData };
  } catch (error) {
    console.error('Market data validation failed:', error);
    return { valid: false, error, data };
  }
}; 