import { IDataQualityService, DataQuality, ServiceHealth } from './types';

interface QualityRule {
  name: string;
  check: (data: any, context?: any) => boolean;
  weight: number;
  critical: boolean;
  description: string;
}

interface ValidationSchema {
  name: string;
  rules: QualityRule[];
  requiredFields: string[];
  optionalFields: string[];
}

export class DataQualityService implements IDataQualityService {
  public readonly serviceName = 'DataQualityService';
  
  private health: ServiceHealth = {
    isHealthy: true,
    lastCheck: Date.now(),
    successRate: 1.0,
    totalRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0
  };

  private schemas = new Map<string, ValidationSchema>();
  private qualityRules: QualityRule[] = [];

  constructor() {
    this.initializeSchemas();
    this.initializeQualityRules();
  }

  async initialize(): Promise<void> {
    console.log(`🚀 Initializing ${this.serviceName}...`);
    
    this.health.isHealthy = true;
    this.health.lastCheck = Date.now();
    
    console.log(`✅ ${this.serviceName} initialized with ${this.schemas.size} schemas and ${this.qualityRules.length} quality rules`);
  }

  assessQuality(data: any, source: string): DataQuality {
    const startTime = Date.now();
    this.health.totalRequests++;

    try {
      if (!data) {
        this.updateHealth(startTime, false);
        return 'none';
      }

      // Calculate quality score based on multiple factors
      let score = 0;
      let totalWeight = 0;

      // 1. Data completeness (40% weight)
      const completenessScore = this.assessCompleteness(data);
      score += completenessScore * 0.4;
      totalWeight += 0.4;

      // 2. Data freshness (30% weight)
      const freshnessScore = this.assessFreshness(data, source);
      score += freshnessScore * 0.3;
      totalWeight += 0.3;

      // 3. Source reliability (20% weight)
      const reliabilityScore = this.assessSourceReliability(source);
      score += reliabilityScore * 0.2;
      totalWeight += 0.2;

      // 4. Data consistency (10% weight)
      const consistencyScore = this.assessConsistency(data);
      score += consistencyScore * 0.1;
      totalWeight += 0.1;

      const finalScore = totalWeight > 0 ? score / totalWeight : 0;
      const quality = this.scoreToQuality(finalScore);

      this.updateHealth(startTime, true);
      
      console.log(`📊 Quality assessment for ${source}: ${quality} (score: ${finalScore.toFixed(2)})`);
      return quality;

    } catch (error) {
      console.error(`❌ Quality assessment error for ${source}:`, error);
      this.health.failedRequests++;
      this.updateHealth(startTime, false);
      return 'none';
    }
  }

  validateData(data: any, schemaName: string): { valid: boolean; errors: string[] } {
    const startTime = Date.now();
    this.health.totalRequests++;

    try {
      const schema = this.schemas.get(schemaName);
      if (!schema) {
        const error = `Schema '${schemaName}' not found`;
        this.updateHealth(startTime, false, error);
        return { valid: false, errors: [error] };
      }

      const errors: string[] = [];

      // Check required fields
      for (const field of schema.requiredFields) {
        if (!this.hasNestedProperty(data, field)) {
          errors.push(`Missing required field: ${field}`);
        }
      }

      // Run quality rules
      for (const rule of schema.rules) {
        try {
          if (!rule.check(data)) {
            const message = `${rule.name}: ${rule.description}`;
            if (rule.critical) {
              errors.push(`CRITICAL - ${message}`);
            } else {
              errors.push(`WARNING - ${message}`);
            }
          }
        } catch (ruleError) {
          errors.push(`Rule '${rule.name}' failed to execute: ${ruleError}`);
        }
      }

      const valid = errors.length === 0 || !errors.some(error => error.startsWith('CRITICAL'));
      
      this.updateHealth(startTime, true);
      
      if (errors.length > 0) {
        console.log(`⚠️ Validation issues for ${schemaName}:`, errors);
      }

      return { valid, errors };

    } catch (error) {
      console.error(`❌ Validation error for schema ${schemaName}:`, error);
      this.health.failedRequests++;
      this.updateHealth(startTime, false);
      return { valid: false, errors: [`Validation failed: ${error}`] };
    }
  }

  combineQualities(qualities: DataQuality[]): DataQuality {
    if (qualities.length === 0) return 'none';

    const qualityScores = qualities.map(q => this.qualityToScore(q));
    const averageScore = qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length;
    
    return this.scoreToQuality(averageScore);
  }

  createQualityReport(data: any): {
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    const startTime = Date.now();
    this.health.totalRequests++;

    try {
      const issues: string[] = [];
      const recommendations: string[] = [];
      let totalScore = 0;
      let ruleCount = 0;

      // Run all quality rules
      for (const rule of this.qualityRules) {
        try {
          if (!rule.check(data)) {
            issues.push(`${rule.name}: ${rule.description}`);
            if (rule.critical) {
              recommendations.push(`URGENT: Fix ${rule.name.toLowerCase()}`);
            }
          } else {
            totalScore += rule.weight;
          }
          ruleCount++;
        } catch (error) {
          issues.push(`Failed to check rule '${rule.name}': ${error}`);
          recommendations.push(`Review data format for ${rule.name.toLowerCase()}`);
        }
      }

      const score = ruleCount > 0 ? (totalScore / ruleCount) * 100 : 0;

      // Add general recommendations based on score
      if (score < 50) {
        recommendations.push('Consider using multiple data sources for verification');
        recommendations.push('Implement data validation at ingestion point');
      } else if (score < 80) {
        recommendations.push('Monitor data quality metrics regularly');
        recommendations.push('Set up alerts for data quality degradation');
      }

      this.updateHealth(startTime, true);

      return {
        score: Math.round(score * 100) / 100,
        issues,
        recommendations
      };

    } catch (error) {
      console.error(`❌ Quality report generation error:`, error);
      this.health.failedRequests++;
      this.updateHealth(startTime, false);
      
      return {
        score: 0,
        issues: [`Failed to generate quality report: ${error}`],
        recommendations: ['Review data structure and try again']
      };
    }
  }

  getHealth(): ServiceHealth {
    return { ...this.health };
  }

  async shutdown(): Promise<void> {
    console.log(`🛑 Shutting down ${this.serviceName}...`);
    
    this.schemas.clear();
    this.qualityRules = [];
    this.health.isHealthy = false;
    
    console.log(`✅ ${this.serviceName} shutdown complete`);
  }

  // Additional utility methods

  /**
   * Add a custom validation schema
   */
  addSchema(schema: ValidationSchema): void {
    this.schemas.set(schema.name, schema);
    console.log(`📝 Added validation schema: ${schema.name}`);
  }

  /**
   * Add a custom quality rule
   */
  addQualityRule(rule: QualityRule): void {
    this.qualityRules.push(rule);
    console.log(`📋 Added quality rule: ${rule.name}`);
  }

  /**
   * Get available schema names
   */
  getAvailableSchemas(): string[] {
    return Array.from(this.schemas.keys());
  }

  /**
   * Remove a schema
   */
  removeSchema(schemaName: string): boolean {
    const removed = this.schemas.delete(schemaName);
    if (removed) {
      console.log(`🗑️ Removed validation schema: ${schemaName}`);
    }
    return removed;
  }

  private initializeSchemas(): void {
    // Market data schema
    this.addSchema({
      name: 'marketData',
      requiredFields: ['symbol', 'price', 'timestamp', 'source'],
      optionalFields: ['change', 'changePercent', 'volume', 'marketCap'],
      rules: [
        {
          name: 'ValidPrice',
          check: (data) => typeof data.price === 'number' && data.price > 0,
          weight: 1.0,
          critical: true,
          description: 'Price must be a positive number'
        },
        {
          name: 'ValidSymbol',
          check: (data) => typeof data.symbol === 'string' && data.symbol.length > 0,
          weight: 1.0,
          critical: true,
          description: 'Symbol must be a non-empty string'
        },
        {
          name: 'RecentTimestamp',
          check: (data) => {
            const timestamp = new Date(data.timestamp);
            const now = new Date();
            const ageMs = now.getTime() - timestamp.getTime();
            return ageMs < 24 * 60 * 60 * 1000; // Less than 24 hours old
          },
          weight: 0.8,
          critical: false,
          description: 'Data should be less than 24 hours old'
        }
      ]
    });

    // Technical data schema
    this.addSchema({
      name: 'technicalData',
      requiredFields: ['symbol', 'rsi', 'macd', 'sma', 'bollinger', 'timestamp'],
      optionalFields: ['source', 'quality'],
      rules: [
        {
          name: 'ValidRSI',
          check: (data) => typeof data.rsi === 'number' && data.rsi >= 0 && data.rsi <= 100,
          weight: 1.0,
          critical: true,
          description: 'RSI must be between 0 and 100'
        },
        {
          name: 'ValidMACD',
          check: (data) => data.macd && typeof data.macd.value === 'number',
          weight: 0.9,
          critical: true,
          description: 'MACD must have a numeric value'
        },
        {
          name: 'ValidSMA',
          check: (data) => data.sma && typeof data.sma.sma20 === 'number',
          weight: 0.8,
          critical: false,
          description: 'SMA data should include SMA20'
        }
      ]
    });

    // News data schema
    this.addSchema({
      name: 'newsData',
      requiredFields: ['symbol', 'articles', 'overallSentiment', 'timestamp'],
      optionalFields: ['sentimentScore', 'source'],
      rules: [
        {
          name: 'HasArticles',
          check: (data) => Array.isArray(data.articles) && data.articles.length > 0,
          weight: 1.0,
          critical: true,
          description: 'Must have at least one article'
        },
        {
          name: 'ValidSentiment',
          check: (data) => ['bullish', 'bearish', 'neutral'].includes(data.overallSentiment),
          weight: 0.9,
          critical: false,
          description: 'Overall sentiment must be bullish, bearish, or neutral'
        }
      ]
    });
  }

  private initializeQualityRules(): void {
    this.qualityRules = [
      {
        name: 'DataExists',
        check: (data) => data !== null && data !== undefined,
        weight: 1.0,
        critical: true,
        description: 'Data must exist and not be null/undefined'
      },
      {
        name: 'HasRequiredFields',
        check: (data) => typeof data === 'object' && Object.keys(data).length > 0,
        weight: 0.9,
        critical: true,
        description: 'Data must be an object with at least one field'
      },
      {
        name: 'ReasonableDataSize',
        check: (data) => {
          const jsonString = JSON.stringify(data);
          return jsonString.length > 10 && jsonString.length < 1000000; // Between 10 bytes and 1MB
        },
        weight: 0.7,
        critical: false,
        description: 'Data size should be reasonable (10 bytes to 1MB)'
      },
      {
        name: 'NoCircularReferences',
        check: (data) => {
          try {
            JSON.stringify(data);
            return true;
          } catch {
            return false;
          }
        },
        weight: 0.8,
        critical: true,
        description: 'Data must not contain circular references'
      }
    ];
  }

  private assessCompleteness(data: any): number {
    if (!data) return 0;
    
    let score = 0;
    const fields = Object.keys(data);
    
    // Basic completeness
    score += fields.length > 0 ? 0.3 : 0;
    
    // Required fields for common data types
    if (data.symbol) score += 0.2;
    if (data.price !== undefined) score += 0.2;
    if (data.timestamp) score += 0.2;
    
    // Additional fields bonus
    const bonusFields = ['change', 'volume', 'source'];
    bonusFields.forEach(field => {
      if (data[field] !== undefined) score += 0.1;
    });
    
    return Math.min(1, score);
  }

  private assessFreshness(data: any, source: string): number {
    if (!data.timestamp) return 0.5; // Neutral if no timestamp
    
    try {
      const timestamp = new Date(data.timestamp);
      const now = new Date();
      const ageMs = now.getTime() - timestamp.getTime();
      
      // Score based on age
      if (ageMs < 60000) return 1.0;        // < 1 minute: excellent
      if (ageMs < 300000) return 0.9;       // < 5 minutes: very good
      if (ageMs < 1800000) return 0.8;      // < 30 minutes: good
      if (ageMs < 3600000) return 0.6;      // < 1 hour: fair
      if (ageMs < 86400000) return 0.4;     // < 1 day: poor
      return 0.2;                           // > 1 day: very poor
    } catch {
      return 0.3; // Invalid timestamp
    }
  }

  private assessSourceReliability(source: string): number {
    const reliabilityMap: Record<string, number> = {
      'yahoo_summary': 0.95,
      'yahoo_chart': 0.90,
      'yahoo_statistics': 0.88,
      'twelvedata_professional': 0.92,
      'yahoo_finance': 0.85,
      'enhanced_calculation': 0.60,
      'manual_calculations': 0.70,
      'fallback': 0.30,
      'no_data_fallback': 0.10
    };
    
    return reliabilityMap[source] || 0.50; // Default reliability
  }

  private assessConsistency(data: any): number {
    if (!data) return 0;
    
    let consistencyScore = 1.0;
    
    // Check for obvious inconsistencies
    if (data.price !== undefined && data.price <= 0) consistencyScore -= 0.3;
    if (data.change !== undefined && data.changePercent !== undefined && data.price !== undefined) {
      const expectedChange = (data.changePercent / 100) * data.price;
      const actualChange = Math.abs(data.change);
      const tolerance = data.price * 0.01; // 1% tolerance
      if (Math.abs(expectedChange - actualChange) > tolerance) {
        consistencyScore -= 0.2;
      }
    }
    
    return Math.max(0, consistencyScore);
  }

  private qualityToScore(quality: DataQuality): number {
    const scoreMap: Record<DataQuality, number> = {
      'realtime': 1.0,
      'premium': 1.0,
      'cached': 0.8,
      'stale_cache': 0.6,
      'historical': 0.4,
      'none': 0.0
    };
    
    return scoreMap[quality];
  }

  private scoreToQuality(score: number): DataQuality {
    if (score >= 0.9) return 'realtime';
    if (score >= 0.7) return 'cached';
    if (score >= 0.5) return 'stale_cache';
    if (score >= 0.2) return 'historical';
    return 'none';
  }

  private hasNestedProperty(obj: any, path: string): boolean {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined;
    }, obj) !== undefined;
  }

  private updateHealth(startTime: number, success: boolean, error?: string): void {
    const responseTime = Date.now() - startTime;
    
    // Update average response time using exponential moving average
    this.health.averageResponseTime = this.health.averageResponseTime * 0.9 + responseTime * 0.1;
    
    if (!success) {
      this.health.failedRequests++;
      if (error) {
        this.health.lastError = error;
      }
    }
    
    // Update success rate
    if (this.health.totalRequests > 0) {
      this.health.successRate = (this.health.totalRequests - this.health.failedRequests) / this.health.totalRequests;
    }
    
    this.health.lastCheck = Date.now();
    this.health.isHealthy = this.health.successRate > 0.8; // Consider healthy if >80% success rate
  }
}