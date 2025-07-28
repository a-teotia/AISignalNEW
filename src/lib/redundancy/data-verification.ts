import { ComprehensiveData } from '../centralized-data-provider';

export interface DataSource {
  name: string;
  reliability: number; // 0-100
  lastUpdated: string;
  data: any;
  quality: number; // 0-100
  latency: number; // milliseconds
}

export interface VerificationResult {
  verified: boolean;
  confidence: number; // 0-100
  conflicts: string[];
  consensus: any;
  sources: DataSource[];
  verificationScore: number; // 0-100
}

export interface ConflictResolution {
  resolved: boolean;
  strategy: 'consensus' | 'reliability' | 'freshness' | 'manual';
  selectedSource: string;
  confidence: number;
  reasoning: string;
}

export class DataVerificationSystem {
  private primarySources: Map<string, DataSource> = new Map();
  private secondarySources: Map<string, Map<string, DataSource>> = new Map();
  private verificationHistory: Map<string, VerificationResult[]> = new Map();

  /**
   * Add a primary data source
   */
  addPrimarySource(symbol: string, source: DataSource) {
    this.primarySources.set(symbol, source);
  }

  /**
   * Add a secondary data source for redundancy
   */
  addSecondarySource(symbol: string, source: DataSource) {
    if (!this.secondarySources.has(symbol)) {
      this.secondarySources.set(symbol, new Map<string, DataSource>());
    }
    const symbolSources = this.secondarySources.get(symbol) as Map<string, DataSource>;
    symbolSources.set(source.name, source);
  }

  /**
   * Verify data across multiple sources
   */
  async verifyData(symbol: string, primaryData: any): Promise<VerificationResult> {
    // Handle case where primaryData is undefined or doesn't have expected structure
    if (!primaryData || !primaryData.marketData) {
      return {
        verified: false,
        confidence: 0,
        conflicts: ['No primary data available'],
        consensus: null,
        sources: [],
        verificationScore: 0
      };
    }

    // Create primary source
    const primarySource: DataSource = {
      name: 'primary',
      reliability: 90,
      lastUpdated: new Date().toISOString(),
      data: primaryData,
      quality: primaryData.marketData.quality === 'realtime' ? 100 : 80,
      latency: 0
    };

    const secondaryData = this.secondarySources.get(symbol) || new Map<string, DataSource>();
    const allSources: DataSource[] = [primarySource];

    // Add secondary sources
    secondaryData.forEach((source: DataSource) => {
      allSources.push(source);
    });

    // Perform cross-source verification
    const verification = await this.performCrossSourceVerification(allSources);
    
    // Store verification history
    if (!this.verificationHistory.has(symbol)) {
      this.verificationHistory.set(symbol, []);
    }
    this.verificationHistory.get(symbol)!.push(verification);

    return verification;
  }

  /**
   * Perform cross-source verification
   */
  private async performCrossSourceVerification(sources: DataSource[]): Promise<VerificationResult> {
    if (sources.length < 2) {
      return {
        verified: true,
        confidence: 100,
        conflicts: [],
        consensus: sources[0]?.data || null,
        sources,
        verificationScore: 100
      };
    }

    const conflicts: string[] = [];
    const priceData: { source: string; price: number; timestamp: string }[] = [];
    const volumeData: { source: string; volume: number; timestamp: string }[] = [];

    // Extract price and volume data from all sources
    sources.forEach(source => {
      if (source.data?.marketData) {
        const marketData = source.data.marketData;
        if (marketData.price) {
          priceData.push({
            source: source.name,
            price: marketData.price,
            timestamp: marketData.timestamp
          });
        }
        if (marketData.volume) {
          volumeData.push({
            source: source.name,
            volume: marketData.volume,
            timestamp: marketData.timestamp
          });
        }
      }
    });

    // Check for price conflicts
    if (priceData.length > 1) {
      const prices = priceData.map(p => p.price);
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      const maxDeviation = Math.max(...prices.map(p => Math.abs(p - avgPrice) / avgPrice * 100));

      if (maxDeviation > 5) { // More than 5% deviation
        conflicts.push(`Price deviation detected: ${maxDeviation.toFixed(2)}% between sources`);
      }
    }

    // Check for volume conflicts
    if (volumeData.length > 1) {
      const volumes = volumeData.map(v => v.volume);
      const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
      const maxDeviation = Math.max(...volumes.map(v => Math.abs(v - avgVolume) / avgVolume * 100));

      if (maxDeviation > 20) { // More than 20% deviation for volume
        conflicts.push(`Volume deviation detected: ${maxDeviation.toFixed(2)}% between sources`);
      }
    }

    // Calculate verification score
    const verificationScore = this.calculateVerificationScore(sources, conflicts);
    const confidence = this.calculateConsensusConfidence(sources, conflicts);

    // Resolve conflicts and create consensus
    const consensus = await this.resolveConflicts(sources, conflicts);

    return {
      verified: conflicts.length === 0,
      confidence,
      conflicts,
      consensus,
      sources,
      verificationScore
    };
  }

  /**
   * Calculate verification score based on sources and conflicts
   */
  private calculateVerificationScore(sources: DataSource[], conflicts: string[]): number {
    const baseScore = sources.reduce((sum, source) => sum + source.reliability, 0) / sources.length;
    const conflictPenalty = conflicts.length * 10; // 10 points per conflict
    const sourceBonus = sources.length > 2 ? 10 : 0; // Bonus for multiple sources

    return Math.max(0, Math.min(100, baseScore - conflictPenalty + sourceBonus));
  }

  /**
   * Calculate consensus confidence
   */
  private calculateConsensusConfidence(sources: DataSource[], conflicts: string[]): number {
    const avgReliability = sources.reduce((sum, source) => sum + source.reliability, 0) / sources.length;
    const conflictPenalty = conflicts.length * 15; // 15 points per conflict
    const sourceAgreement = sources.length > 1 ? 10 : 0; // Bonus for multiple sources

    return Math.max(0, Math.min(100, avgReliability - conflictPenalty + sourceAgreement));
  }

  /**
   * Resolve conflicts between data sources
   */
  private async resolveConflicts(sources: DataSource[], conflicts: string[]): Promise<any> {
    if (conflicts.length === 0) {
      // No conflicts, use weighted average
      return this.createWeightedConsensus(sources);
    }

    // Apply conflict resolution strategies
    const resolution = await this.applyConflictResolutionStrategies(sources, conflicts);
    
    if (resolution.resolved) {
      return resolution.selectedSource;
    }

    // Fallback to most reliable source
    const mostReliable = sources.reduce((best, current) => 
      current.reliability > best.reliability ? current : best
    );

    return mostReliable.data;
  }

  /**
   * Apply conflict resolution strategies
   */
  private async applyConflictResolutionStrategies(sources: DataSource[], conflicts: string[]): Promise<ConflictResolution> {
    // Strategy 1: Check for consensus (majority agreement)
    const consensus = this.checkConsensus(sources);
    if (consensus) {
      return {
        resolved: true,
        strategy: 'consensus',
        selectedSource: consensus,
        confidence: 85,
        reasoning: 'Majority of sources agree'
      };
    }

    // Strategy 2: Use most reliable source
    const mostReliable = sources.reduce((best, current) => 
      current.reliability > best.reliability ? current : best
    );

    return {
      resolved: true,
      strategy: 'reliability',
      selectedSource: mostReliable.name,
      confidence: mostReliable.reliability,
      reasoning: `Selected most reliable source: ${mostReliable.name} (${mostReliable.reliability}%)`
    };
  }

  /**
   * Check for consensus among sources
   */
  private checkConsensus(sources: DataSource[]): string | null {
    if (sources.length < 3) return null;

    // Group sources by similar data
    const groups = new Map<string, DataSource[]>();
    
    sources.forEach(source => {
      const key = this.createDataKey(source.data);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(source);
    });

    // Find majority group
    const majorityThreshold = Math.ceil(sources.length / 2);
    for (const [key, group] of groups) {
      if (group.length >= majorityThreshold) {
        return group[0].name; // Return first source from majority group
      }
    }

    return null;
  }

  /**
   * Create a key for grouping similar data
   */
  private createDataKey(data: any): string {
    if (!data?.marketData) return 'no-data';
    
    const marketData = data.marketData;
    return `${marketData.price?.toFixed(2) || 'no-price'}-${marketData.volume?.toFixed(0) || 'no-volume'}`;
  }

  /**
   * Create weighted consensus from multiple sources
   */
  private createWeightedConsensus(sources: DataSource[]): any {
    if (sources.length === 1) return sources[0].data;

    // Weight by reliability
    const totalWeight = sources.reduce((sum, source) => sum + source.reliability, 0);
    
    const consensus: any = {
      marketData: {
        price: 0,
        volume: 0,
        change: 0,
        changePercent: 0,
        timestamp: new Date().toISOString(),
        source: 'consensus',
        quality: 'realtime'
      },
      sources: sources.map(s => s.name),
      warnings: []
    };

    // Calculate weighted averages
    sources.forEach(source => {
      const weight = source.reliability / totalWeight;
      const marketData = source.data?.marketData;
      
      if (marketData) {
        consensus.marketData.price += (marketData.price || 0) * weight;
        consensus.marketData.volume += (marketData.volume || 0) * weight;
        consensus.marketData.change += (marketData.change || 0) * weight;
        consensus.marketData.changePercent += (marketData.changePercent || 0) * weight;
      }
    });

    return consensus;
  }

  /**
   * Get verification history for a symbol
   */
  getVerificationHistory(symbol: string): VerificationResult[] {
    return this.verificationHistory.get(symbol) || [];
  }

  /**
   * Get data consistency score
   */
  getDataConsistencyScore(symbol: string): number {
    const history = this.getVerificationHistory(symbol);
    if (history.length === 0) return 100;

    const recentHistory = history.slice(-10); // Last 10 verifications
    const verifiedCount = recentHistory.filter(v => v.verified).length;
    
    return (verifiedCount / recentHistory.length) * 100;
  }

  /**
   * Generate verification report
   */
  generateVerificationReport(symbol: string): any {
    const history = this.getVerificationHistory(symbol);
    const consistencyScore = this.getDataConsistencyScore(symbol);
    
    return {
      symbol,
      totalVerifications: history.length,
      verifiedCount: history.filter(v => v.verified).length,
      conflictCount: history.reduce((sum, v) => sum + v.conflicts.length, 0),
      averageConfidence: history.length > 0 ? 
        history.reduce((sum, v) => sum + v.confidence, 0) / history.length : 100,
      consistencyScore,
      lastVerified: history.length > 0 ? new Date().toISOString() : null,
      recommendations: this.generateRecommendations(history, consistencyScore)
    };
  }

  /**
   * Generate recommendations based on verification history
   */
  private generateRecommendations(history: VerificationResult[], consistencyScore: number): string[] {
    const recommendations: string[] = [];

    if (consistencyScore < 80) {
      recommendations.push('Consider adding more data sources for better verification');
    }

    if (history.length > 0) {
      const recentConflicts = history.slice(-5).reduce((sum, v) => sum + v.conflicts.length, 0);
      if (recentConflicts > 2) {
        recommendations.push('High conflict rate detected - review data source reliability');
      }
    }

    if (history.length < 10) {
      recommendations.push('Insufficient verification history - continue monitoring');
    }

    return recommendations;
  }
} 