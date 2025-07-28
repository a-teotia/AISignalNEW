import { ValidationRule, ValidationCheck, SignalQuality, AgentOutput } from '../types/prediction-types';

// 🏆 GOLD STANDARD: Signal Validation System
export class SignalValidator {
  private static readonly VALIDATION_RULES: ValidationRule[] = [
    // CRITICAL RULES - Must pass for signal to be valid
    {
      name: 'Data Completeness',
      description: 'Ensures all required data fields are present',
      critical: true,
      validate: (data: any, agent: string): ValidationCheck => {
        const requiredFields = SignalValidator.getRequiredFields(agent);
        const missingFields = requiredFields.filter(field => 
          !data || data[field] === undefined || data[field] === null
        );
        
        const completeness = ((requiredFields.length - missingFields.length) / requiredFields.length) * 100;
        
        return {
          name: 'Data Completeness',
          passed: missingFields.length === 0,
          score: Math.round(completeness),
          details: missingFields.length > 0 
            ? `Missing fields: ${missingFields.join(', ')}`
            : 'All required fields present',
          critical: true
        };
      }
    },
    
    {
      name: 'Confidence Integrity',
      description: 'Validates confidence scores are realistic',
      critical: true,
      validate: (data: any, agent: string): ValidationCheck => {
        const confidence = data?.confidence || 0;
        const sources = data?.sources || [];
        
        // High confidence with no sources is impossible
        if (confidence > 80 && sources.length === 0) {
          return {
            name: 'Confidence Integrity',
            passed: false,
            score: 0,
            details: 'High confidence (80%+) with no data sources is impossible',
            critical: true
          };
        }
        
        // Low confidence with many sources might indicate data issues
        if (confidence < 30 && sources.length > 3) {
          return {
            name: 'Confidence Integrity',
            passed: true,
            score: 70,
            details: 'Low confidence despite multiple sources - data may be conflicting',
            critical: false
          };
        }
        
        return {
          name: 'Confidence Integrity',
          passed: true,
          score: 100,
          details: 'Confidence score is realistic for given data sources',
          critical: true
        };
      }
    },
    
    {
      name: 'Data Freshness',
      description: 'Ensures data is not stale',
      critical: false,
      validate: (data: any, agent: string): ValidationCheck => {
        const timestamp = data?.timestamp || new Date().toISOString();
        const dataAge = Date.now() - new Date(timestamp).getTime();
        const maxAge = SignalValidator.getMaxDataAge(agent);
        
        const freshness = Math.max(0, 100 - (dataAge / maxAge) * 100);
        
        return {
          name: 'Data Freshness',
          passed: dataAge <= maxAge,
          score: Math.round(freshness),
          details: `Data age: ${Math.round(dataAge / 1000)}s (max: ${Math.round(maxAge / 1000)}s)`,
          critical: false
        };
      }
    },
    
    {
      name: 'Source Reliability',
      description: 'Validates data sources are trustworthy',
      critical: false,
      validate: (data: any, agent: string): ValidationCheck => {
        const sources = data?.sources || [];
        const reliableSources = SignalValidator.getReliableSources(agent);
        
        const reliableCount = sources.filter((source: string) => 
          reliableSources.some(reliable => source.includes(reliable))
        ).length;
        
        const reliability = sources.length > 0 ? (reliableCount / sources.length) * 100 : 0;
        
        return {
          name: 'Source Reliability',
          passed: reliability >= 50,
          score: Math.round(reliability),
          details: `${reliableCount}/${sources.length} sources are reliable`,
          critical: false
        };
      }
    },
    
    {
      name: 'Data Consistency',
      description: 'Checks for internal data consistency',
      critical: false,
      validate: (data: any, agent: string): ValidationCheck => {
        const inconsistencies = SignalValidator.findInconsistencies(data, agent);
        
        const consistency = inconsistencies.length === 0 ? 100 : 
          Math.max(0, 100 - (inconsistencies.length * 20));
        
        return {
          name: 'Data Consistency',
          passed: inconsistencies.length === 0,
          score: consistency,
          details: inconsistencies.length > 0 
            ? `Inconsistencies: ${inconsistencies.join(', ')}`
            : 'Data is internally consistent',
          critical: false
        };
      }
    },
    
    {
      name: 'Anomaly Detection',
      description: 'Detects statistical anomalies in data',
      critical: false,
      validate: (data: any, agent: string): ValidationCheck => {
        const anomalies = SignalValidator.detectAnomalies(data, agent);
        
        const anomalyScore = anomalies.length === 0 ? 100 : 
          Math.max(0, 100 - (anomalies.length * 15));
        
        return {
          name: 'Anomaly Detection',
          passed: anomalies.length === 0,
          score: anomalyScore,
          details: anomalies.length > 0 
            ? `Anomalies detected: ${anomalies.join(', ')}`
            : 'No statistical anomalies detected',
          critical: false
        };
      }
    }
  ];

  // 🏆 GOLD STANDARD: Validate individual agent output
  static validateAgentOutput(output: AgentOutput): AgentOutput {
    const checks: ValidationCheck[] = [];
    
    // Run all validation rules
    for (const rule of this.VALIDATION_RULES) {
      try {
        const check = rule.validate(output.data, output.agent);
        checks.push(check);
      } catch (error) {
        console.error(`Validation rule ${rule.name} failed:`, error);
        checks.push({
          name: rule.name,
          passed: false,
          score: 0,
          details: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          critical: rule.critical
        });
      }
    }
    
    // Calculate validation score
    const passedChecks = checks.filter(c => c.passed).length;
    const totalChecks = checks.length;
    const validationScore = Math.round((passedChecks / totalChecks) * 100);
    
    // Check if validation passed (all critical checks must pass)
    const criticalFailures = checks.filter(c => c.critical && !c.passed).length;
    const validationPassed = criticalFailures === 0;
    
    // Calculate quality metrics
    const quality = this.calculateSignalQuality(output, checks);
    
    // Calculate reliability metrics
    const reliability = this.calculateReliability(output, quality);
    
    // Adjust confidence based on validation results
    const adjustedConfidence = this.adjustConfidence(output.confidence, quality, checks);
    
    return {
      ...output,
      confidence: adjustedConfidence,
      quality,
      validation: {
        passed: validationPassed,
        checks,
        score: validationScore
      },
      reliability
    };
  }

  // 🏆 GOLD STANDARD: Calculate signal quality metrics
  private static calculateSignalQuality(output: AgentOutput, checks: ValidationCheck[]): SignalQuality {
    const dataFreshness = checks.find(c => c.name === 'Data Freshness')?.score || 0;
    const sourceReliability = checks.find(c => c.name === 'Source Reliability')?.score || 0;
    const completeness = checks.find(c => c.name === 'Data Completeness')?.score || 0;
    const consistency = checks.find(c => c.name === 'Data Consistency')?.score || 0;
    const anomalyScore = checks.find(c => c.name === 'Anomaly Detection')?.score || 0;
    
    // Cross-verification (placeholder - would need multiple sources)
    const crossVerification = output.sources.length > 1 ? 75 : 50;
    
    // Calculate overall quality (weighted average)
    const overallQuality = Math.round(
      (dataFreshness * 0.2 + 
       sourceReliability * 0.25 + 
       crossVerification * 0.15 + 
       anomalyScore * 0.15 + 
       completeness * 0.15 + 
       consistency * 0.1)
    );
    
    // Generate warnings
    const warnings: string[] = [];
    if (dataFreshness < 50) warnings.push('Data may be stale');
    if (sourceReliability < 60) warnings.push('Some data sources are unreliable');
    if (anomalyScore < 70) warnings.push('Statistical anomalies detected');
    if (completeness < 90) warnings.push('Some data fields are missing');
    
    return {
      dataFreshness,
      sourceReliability,
      crossVerification,
      anomalyScore,
      completeness,
      consistency,
      overallQuality,
      warnings,
      lastValidated: new Date().toISOString()
    };
  }

  // 🏆 GOLD STANDARD: Calculate reliability metrics
  private static calculateReliability(output: AgentOutput, quality: SignalQuality) {
    // Historical accuracy (placeholder - would need database)
    const historicalAccuracy = 75; // Default, should be fetched from DB
    
    // Data source health (based on recent API success rates)
    const dataSourceHealth = quality.sourceReliability;
    
    // Signal strength (based on confidence and quality)
    const signalStrength = Math.round((output.confidence + quality.overallQuality) / 2);
    
    return {
      historicalAccuracy,
      dataSourceHealth,
      signalStrength
    };
  }

  // 🏆 GOLD STANDARD: Adjust confidence based on quality
  private static adjustConfidence(originalConfidence: number, quality: SignalQuality, checks: ValidationCheck[]): number {
    let adjustedConfidence = originalConfidence;
    
    // Reduce confidence for quality issues
    if (quality.overallQuality < 70) {
      adjustedConfidence *= 0.8;
    }
    
    // Reduce confidence for critical validation failures
    const criticalFailures = checks.filter(c => c.critical && !c.passed).length;
    if (criticalFailures > 0) {
      adjustedConfidence *= 0.5;
    }
    
    // Cap confidence based on data quality
    adjustedConfidence = Math.min(adjustedConfidence, quality.overallQuality);
    
    return Math.round(Math.max(0, Math.min(100, adjustedConfidence)));
  }

  // Helper methods
  private static getRequiredFields(agent: string): string[] {
    const fieldMap: Record<string, string[]> = {
      'SonarResearch': ['background', 'news', 'sentiment'],
      'GeoSentience': ['macroFactors', 'sentimentAnalysis'],
      'QuantEdge': ['indicators', 'trend'],
      'OnChain': ['whaleActivity', 'networkMetrics'],
      'Flow': ['institutionalFlows'],
      'Microstructure': ['orderBook'],
      'ML': ['predictiveSignals']
    };
    
    return fieldMap[agent] || ['confidence', 'sources'];
  }

  private static getMaxDataAge(agent: string): number {
    const ageMap: Record<string, number> = {
      'SonarResearch': 3600000, // 1 hour
      'GeoSentience': 7200000,  // 2 hours
      'QuantEdge': 300000,      // 5 minutes
      'OnChain': 600000,        // 10 minutes
      'Flow': 300000,           // 5 minutes
      'Microstructure': 60000,  // 1 minute
      'ML': 1800000             // 30 minutes
    };
    
    return ageMap[agent] || 300000; // Default 5 minutes
  }

  private static getReliableSources(agent: string): string[] {
    const sourceMap: Record<string, string[]> = {
      'SonarResearch': ['reuters.com', 'bloomberg.com', 'cnbc.com', 'rapidapi_yahoo', 'yahoo_finance_rss'],
      'GeoSentience': ['worldbank.org', 'imf.org', 'ecb.europa.eu', 'rapidapi_yahoo'],
      'QuantEdge': ['tradingview.com', 'barchart.com', 'yahoo.com', 'rapidapi_yahoo', 'alpha_vantage'],
      'OnChain': ['blockchain.info', 'etherscan.io', 'coingecko.com', 'blockchain_info'],
      'Flow': ['coingecko.com', 'yahoo.com', 'etfdb.com', 'rapidapi_yahoo', 'alpha_vantage'],
      'Microstructure': ['binance.com', 'coinbase.com', 'orderbook.com', 'Coinbase'],
      'ML': ['yahoo.com', 'alpha-vantage.co', 'rapidapi.com', 'rapidapi_yahoo', 'alpha_vantage', 'coingecko']
    };
    
    return sourceMap[agent] || ['yahoo.com', 'coingecko.com', 'rapidapi_yahoo', 'alpha_vantage'];
  }

  private static findInconsistencies(data: any, agent: string): string[] {
    const inconsistencies: string[] = [];
    
    // Check for impossible combinations
    if (data?.confidence > 90 && (!data?.sources || data.sources.length === 0)) {
      inconsistencies.push('High confidence with no sources');
    }
    
    if (data?.trend?.direction === 'UP' && data?.sentiment?.overall === 'bearish') {
      inconsistencies.push('Bullish trend with bearish sentiment');
    }
    
    if (data?.institutionalFlows?.etfFlows?.netFlow === 0 && data?.confidence > 70) {
      inconsistencies.push('High confidence with neutral ETF flows');
    }
    
    return inconsistencies;
  }

  private static detectAnomalies(data: any, agent: string): string[] {
    const anomalies: string[] = [];
    
    // Check for statistical outliers
    if (data?.confidence > 95) {
      anomalies.push('Extremely high confidence (95%+)');
    }
    
    if (data?.trend?.strength > 90) {
      anomalies.push('Extremely strong trend signal');
    }
    
    if (data?.sentiment?.newsSentiment && Math.abs(data.sentiment.newsSentiment) > 0.9) {
      anomalies.push('Extreme sentiment reading');
    }
    
    return anomalies;
  }
} 