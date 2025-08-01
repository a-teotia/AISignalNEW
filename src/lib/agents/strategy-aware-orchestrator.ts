/**
 * 🎯 SIMPLE STRATEGY-AWARE SEQUENTIAL ORCHESTRATOR
 * Simple wrapper that calls the existing 6-agent sequential analysis with strategy-aware prompts
 */

import { 
  TradingStrategyType, 
  StrategyConfiguration, 
  StrategyOutput, 
  StrategySelectionRequest,
  STRATEGY_CONFIGS 
} from '../types/trading-strategy-types';

import { SequentialAgentOrchestrator } from './sequential-agent-orchestrator';

export interface StrategyAwareAnalysisInput {
  symbol: string;
  strategy: TradingStrategyType;
  previousAnalysis?: any;
  userId?: string;
}

export class StrategyAwareOrchestrator extends SequentialAgentOrchestrator {
  private currentStrategy!: StrategyConfiguration;

  constructor() {
    super();
  }

  /**
   * 🎯 MAIN ENTRY POINT: Run strategy-aware sequential analysis
   * Simple wrapper that calls the existing 6-agent sequential chain with strategy parameter
   */
  async runStrategyAwareAnalysis(input: StrategyAwareAnalysisInput): Promise<StrategyOutput> {
    const startTime = Date.now();
    console.log(`🎯 [STRATEGY ORCHESTRATOR] Starting ${input.strategy.toUpperCase()} analysis for ${input.symbol}...`);

    try {
      // 1. Set up strategy configuration
      this.currentStrategy = STRATEGY_CONFIGS[input.strategy];
      console.log(`📋 [STRATEGY] Configuration: ${this.currentStrategy.name} (${this.currentStrategy.timeHorizon})`);

      // 2. Run the existing 6-agent sequential analysis with strategy parameter
      console.log(`🔄 [STRATEGY] Running 6-agent sequential analysis with ${input.strategy} strategy awareness...`);
      const finalReport = await this.runSequentialAnalysis(input.symbol, input.strategy);

      // 3. Convert the final report to strategy output format
      const strategyOutput = this.convertToStrategyOutput(finalReport, input);

      const processingTime = Date.now() - startTime;
      console.log(`✅ [STRATEGY ORCHESTRATOR] ${input.strategy.toUpperCase()} analysis completed in ${processingTime}ms`);

      return strategyOutput;

    } catch (error) {
      console.error(`❌ [STRATEGY ORCHESTRATOR] Error in ${input.strategy} analysis:`, error);
      return this.createErrorStrategyOutput(input, error);
    }
  }

  /**
   * Convert FinalReport from sequential analysis to StrategyOutput format
   */
  private convertToStrategyOutput(finalReport: any, input: StrategyAwareAnalysisInput): StrategyOutput {
    // The finalReport structure: { symbol, timestamp, executiveSummary, quantAnalysis, marketAnalysis, technicalAnalysis, sentimentAnalysis, fundamentalAnalysis, finalVerdict, keyRisks, catalysts, allCitations, agentChain, totalProcessingTime }
    const verdict = finalReport.finalVerdict; // Direct access, not nested under .data
    
    return {
      symbol: input.symbol,
      strategy: input.strategy,
      prediction: verdict?.direction === 'BUY' ? 'BULLISH' : verdict?.direction === 'SELL' ? 'BEARISH' : 'NEUTRAL',
      confidence: verdict?.confidence || 50,
      timeHorizon: this.currentStrategy.timeHorizon,
      
      validityPeriod: this.currentStrategy.validityPeriod,
      analysisTimestamp: new Date().toISOString(),
      
      strategyMetrics: {
        expectedHoldPeriod: this.currentStrategy.timeHorizon,
        riskRewardRatio: `1:${verdict?.risk === 'LOW' ? '3' : verdict?.risk === 'MEDIUM' ? '2' : '1.5'}`,
        stopLoss: verdict?.priceTarget ? verdict.priceTarget * 0.95 : undefined,
        targetPrice: verdict?.priceTarget,
        keyLevels: {
          support: [],
          resistance: []
        }
      },
      
      reasoning: {
        primary: verdict?.reasoning || 'Analysis completed',
        supporting: finalReport.keyInsights || [],
        risks: finalReport.keyRisks || [],
        catalysts: finalReport.catalysts?.map((c: any) => c.event || c) || []
      },

      // 🎯 TPSL (Take Profit, Stop Loss) Data - Key requirement from user
      tpslRecommendations: finalReport.finalVerdict?.tpslRecommendations || null,
      
      // Pass through all sequential analysis data for complete UI display
      executiveSummary: finalReport.executiveSummary,
      quantAnalysis: finalReport.quantAnalysis,
      marketAnalysis: finalReport.marketAnalysis,
      technicalAnalysis: finalReport.technicalAnalysis,
      sentimentAnalysis: finalReport.sentimentAnalysis,
      fundamentalAnalysis: finalReport.fundamentalAnalysis,
      citedSources: finalReport.allCitations || [],
      agentChain: finalReport.agentChain || [],
      totalProcessingTime: finalReport.totalProcessingTime || 0,
      
      agentContributions: {
        technical: {
          signal: 'NEUTRAL', // Extracted from sequential analysis
          confidence: 50,
          strategyRelevance: 50,
          normalizedWeight: 25,
          decisionWeight: 25
        },
        fundamental: {
          signal: 'NEUTRAL',
          confidence: 50,
          strategyRelevance: 50,
          normalizedWeight: 25,
          decisionWeight: 25
        },
        newsSentiment: {
          signal: 'NEUTRAL',
          confidence: 50,
          strategyRelevance: 50,
          normalizedWeight: 25,
          decisionWeight: 25
        },
        marketStructure: {
          signal: 'NEUTRAL',
          confidence: 50,
          strategyRelevance: 50,
          normalizedWeight: 25,
          decisionWeight: 25
        }
      }
    };
  }

  /**
   * Create error strategy output when analysis fails
   */
  private createErrorStrategyOutput(input: StrategyAwareAnalysisInput, error: any): StrategyOutput {
    return {
      symbol: input.symbol,
      strategy: input.strategy,
      prediction: 'NEUTRAL',
      confidence: 0,
      timeHorizon: STRATEGY_CONFIGS[input.strategy].timeHorizon,
      
      validityPeriod: STRATEGY_CONFIGS[input.strategy].validityPeriod,
      analysisTimestamp: new Date().toISOString(),
      
      strategyMetrics: {
        expectedHoldPeriod: STRATEGY_CONFIGS[input.strategy].timeHorizon,
        riskRewardRatio: '1:1',
        keyLevels: { support: [], resistance: [] }
      },
      
      reasoning: {
        primary: `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
}