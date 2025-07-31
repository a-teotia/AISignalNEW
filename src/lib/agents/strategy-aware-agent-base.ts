/**
 * 🎯 STRATEGY-AWARE AGENT BASE CLASS
 * All agents inherit from this to adapt behavior based on trading strategy
 */

import { StrategyConfiguration, TradingStrategyType, StrategyAnalysisContext } from '../types/trading-strategy-types';

export interface StrategyAwareAgentOutput {
  signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidence: number;
  strategyRelevance: number;  // 0-100: How relevant this analysis is for the selected strategy
  reasoning: string;
  keyFactors: string[];
  risks: string[];
  timeHorizon: string;
  strategySpecificInsights: Record<string, any>;
}

export abstract class StrategyAwareAgentBase {
  protected agentName: string;
  protected strategy!: StrategyConfiguration; // 🎯 FIX: Initialized in setStrategyContext
  protected context!: StrategyAnalysisContext; // 🎯 FIX: Initialized in setStrategyContext

  constructor(agentName: string) {
    this.agentName = agentName;
  }

  /**
   * Set the strategy context for this analysis
   */
  setStrategyContext(context: StrategyAnalysisContext): void {
    this.strategy = context.strategy;
    this.context = context;
  }

  /**
   * Abstract method that each agent must implement
   */
  abstract runStrategyAwareAnalysis(input: any): Promise<StrategyAwareAgentOutput>;

  /**
   * Calculate how relevant this agent's analysis is for the current strategy
   */
  protected calculateStrategyRelevance(): number {
    const weights = this.strategy.agentWeights;
    const agentTypeMap: Record<string, keyof typeof weights> = {
      'Technical Analysis': 'technical',
      'Fundamental Analysis': 'fundamental',
      'News Sentiment': 'newsSentiment',
      'Market Structure': 'marketStructure',
    };

    const agentType = agentTypeMap[this.agentName];
    return agentType ? weights[agentType] : 50; // Default to 50% if unknown
  }

  /**
   * Adjust analysis depth based on strategy
   */
  protected getAnalysisDepth(): 'fast' | 'balanced' | 'comprehensive' {
    return this.strategy.analysisDepth;
  }

  /**
   * Get strategy-specific time horizon for analysis
   */
  protected getAnalysisTimeHorizon(): string {
    return this.strategy.timeHorizon;
  }

  /**
   * Get focus indicators for this strategy
   */
  protected getFocusIndicators(): string[] {
    return this.strategy.parameters.focusIndicators;
  }

  /**
   * Get news timeframe relevance for this strategy
   */
  protected getNewsTimeframe(): string {
    return this.strategy.parameters.newsTimeframe;
  }

  /**
   * Get fundamental analysis depth for this strategy
   */
  protected getFundamentalDepth(): 'minimal' | 'standard' | 'deep' {
    return this.strategy.parameters.fundamentalDepth;
  }

  /**
   * Create strategy-specific prompt modifications
   */
  protected createStrategyPrompt(basePrompt: string): string {
    const strategyContext = `
TRADING STRATEGY CONTEXT: ${this.strategy.name.toUpperCase()}
Time Horizon: ${this.strategy.timeHorizon}
Analysis Depth: ${this.strategy.analysisDepth}
Agent Priority: ${this.calculateStrategyRelevance()}% weight in final decision

STRATEGY-SPECIFIC REQUIREMENTS:
${this.getStrategySpecificRequirements()}

Focus Areas: ${this.strategy.parameters.focusIndicators.join(', ')}
Risk Tolerance: ${this.strategy.parameters.riskTolerance}

IMPORTANT: Tailor your analysis specifically for ${this.strategy.name} traders who hold positions for ${this.strategy.timeHorizon}.
`;

    return strategyContext + '\n\n' + basePrompt;
  }

  /**
   * Get strategy-specific requirements for this agent
   */
  private getStrategySpecificRequirements(): string {
    switch (this.strategy.type) {
      case 'day':
        return this.getDayTradingRequirements();
      case 'swing':
        return this.getSwingTradingRequirements();
      case 'longterm':
        return this.getLongTermRequirements();
      default:
        return 'Standard analysis requirements';
    }
  }

  private getDayTradingRequirements(): string {
    return `
- Focus on intraday price action and volume patterns
- Emphasize immediate support/resistance levels  
- Prioritize breaking news from last 2-4 hours only
- Minimize fundamental analysis - focus on technical setups
- Provide clear entry/exit signals for same-day trades
- High urgency - positions typically held for hours
`;
  }

  private getSwingTradingRequirements(): string {
    return `
- Balance technical patterns with fundamental catalysts
- Consider earnings dates and major events in next 1-2 weeks
- Analyze multi-day chart patterns and trends
- Include risk management for 2-10 day holding periods  
- Factor in overnight and weekend risk exposure
- Moderate urgency - positions held for several days
`;
  }

  private getLongTermRequirements(): string {
    return `
- Deep fundamental analysis is primary focus
- Evaluate long-term business prospects and competitive position
- Consider macroeconomic factors and sector trends
- Technical analysis for optimal entry timing only
- News sentiment for trend confirmation, not short-term moves
- Low urgency - positions held for weeks to months
`;
  }

  /**
   * Calculate confidence decay based on strategy
   */
  protected calculateConfidenceDecay(daysElapsed: number): number {
    const degradeRate = this.strategy.validityPeriod.degradeRate;
    const decayFactor = Math.pow(0.9, daysElapsed * (degradeRate / 100));
    return Math.max(0.1, decayFactor); // Minimum 10% confidence retained
  }

  /**
   * Determine if analysis is still valid based on strategy timeframe
   */
  protected isAnalysisValid(analysisAge: number): {
    isValid: boolean;
    status: 'optimal' | 'acceptable' | 'stale';
    confidenceMultiplier: number;
  } {
    const hoursElapsed = analysisAge / (1000 * 60 * 60);
    const daysElapsed = hoursElapsed / 24;

    // Strategy-specific validity periods
    const validity = this.strategy.validityPeriod;
    
    let status: 'optimal' | 'acceptable' | 'stale';
    let confidenceMultiplier: number;

    if (this.strategy.type === 'day') {
      // Day trading: Very time-sensitive
      if (hoursElapsed <= 4) {
        status = 'optimal';
        confidenceMultiplier = 1.0;
      } else if (hoursElapsed <= 24) {
        status = 'acceptable';
        confidenceMultiplier = 0.7;
      } else {
        status = 'stale';
        confidenceMultiplier = 0.3;
      }
    } else if (this.strategy.type === 'swing') {
      // Swing trading: Moderate time sensitivity
      if (daysElapsed <= 3) {
        status = 'optimal';
        confidenceMultiplier = 1.0;
      } else if (daysElapsed <= 7) {
        status = 'acceptable';
        confidenceMultiplier = 0.8;
      } else {
        status = 'stale';
        confidenceMultiplier = 0.4;
      }
    } else { // longterm
      // Long-term: Less time sensitive
      if (daysElapsed <= 14) {
        status = 'optimal';
        confidenceMultiplier = 1.0;
      } else if (daysElapsed <= 90) {
        status = 'acceptable';
        confidenceMultiplier = 0.9;
      } else {
        status = 'stale';
        confidenceMultiplier = 0.6;
      }
    }

    return {
      isValid: status !== 'stale',
      status,
      confidenceMultiplier
    };
  }
}