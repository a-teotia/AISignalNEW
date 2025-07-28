import { BaseAgent } from './base-agent';
import { AgentInput, AgentOutput, SynthOracleData } from '../types/prediction-types';

// Helper: map direction to numeric value
const dirToNum = (dir: string) => dir === 'UP' ? 1 : dir === 'DOWN' ? -1 : 0;
const numToDir = (num: number) => num > 0.1 ? 'UP' : num < -0.1 ? 'DOWN' : 'SIDEWAYS';

export class SynthOracleAgent extends BaseAgent {
  constructor() {
    super({
      name: "SynthOracle",
      description: "Final reasoning and prediction synthesis using Sonar Pro",
      model: "gpt-4o",
      temperature: 0.1,
      maxTokens: 2000,
      timeout: 35000
    });
  }

  // Hybrid: programmatic synthesis for prediction, LLM for explanation
  async process(input: AgentInput): Promise<AgentOutput> {
    // Get comprehensive data from centralized provider
    const centralizedData = await this.getCentralizedData(input.symbol);
    
    const { sonarData, geoData, quantData, onchainData, flowData, microstructureData, mlData } = input.context || {};
    
    // Note: Real-time market data available from centralized provider
    const hasRealTimeData = centralizedData.overallQuality === 'realtime';
    
    // Check if we have sufficient agent data for synthesis
    const availableAgents = [
      { name: 'sonar', data: sonarData },
      { name: 'geo', data: geoData },
      { name: 'quant', data: quantData },
      { name: 'onchain', data: onchainData },
      { name: 'flow', data: flowData },
      { name: 'microstructure', data: microstructureData },
      { name: 'ml', data: mlData }
    ].filter(agent => agent.data !== null && agent.data !== undefined);
    
    if (availableAgents.length < 3) {
      console.warn(`⚠️  Insufficient agent data for synthesis. Available: ${availableAgents.map(a => a.name).join(', ')}`);
      // Create quality and validation metrics based on centralized data
      const qualityMetrics = this.createQualityMetrics(centralizedData);
      const validationMetrics = this.createValidationMetrics(centralizedData);
      const reliabilityMetrics = this.createReliabilityMetrics(centralizedData);

      return {
        agent: this.config.name,
        symbol: input.symbol,
        timestamp: new Date().toISOString(),
        data: this.getFallbackData(),
        confidence: 30, // Lower confidence when insufficient data
        sources: centralizedData.sources,
        processingTime: 0,
        quality: qualityMetrics,
        validation: validationMetrics,
        reliability: reliabilityMetrics,
        metadata: { 
          tags: [], 
          riskFactors: [`Insufficient data: Only ${availableAgents.length}/7 agents available.`] 
        }
      };
    }
    
    console.log(`✅ Proceeding with synthesis using ${availableAgents.length} agents: ${availableAgents.map(a => a.name).join(', ')}`);

    // 1. Extract signals for each agent and timeframe
    const agentSignals = [
      // MLAgent
      {
        name: 'ML',
        short: mlData?.predictiveSignals?.shortTerm?.direction?.toUpperCase() || 'SIDEWAYS',
        shortConf: mlData?.predictiveSignals?.shortTerm?.confidence || 50,
        med: mlData?.predictiveSignals?.mediumTerm?.direction?.toUpperCase() || 'SIDEWAYS',
        medConf: mlData?.predictiveSignals?.mediumTerm?.confidence || 50,
        long: mlData?.predictiveSignals?.longTerm?.direction?.toUpperCase() || 'SIDEWAYS',
        longConf: mlData?.predictiveSignals?.longTerm?.confidence || 50
      },
      // QuantEdge
      {
        name: 'Quant',
        short: quantData?.trend?.direction?.toUpperCase() || 'SIDEWAYS',
        shortConf: quantData?.trend?.confidence || 50,
        med: quantData?.trend?.direction?.toUpperCase() || 'SIDEWAYS',
        medConf: quantData?.trend?.confidence || 50,
        long: quantData?.trend?.direction?.toUpperCase() || 'SIDEWAYS',
        longConf: quantData?.trend?.confidence || 50
      },
      // Flow - enhanced to use ETF flows and options data
      {
        name: 'Flow',
        short: (() => {
          // Check ETF flows first (for crypto), then price change
          if (flowData?.etfFlows?.netFlow !== undefined) {
            return flowData.etfFlows.netFlow > 0 ? 'UP' : flowData.etfFlows.netFlow < 0 ? 'DOWN' : 'SIDEWAYS';
          }
          return flowData?.volumeAnalysis?.priceChange > 0 ? 'UP' : flowData?.volumeAnalysis?.priceChange < 0 ? 'DOWN' : 'SIDEWAYS';
        })(),
        shortConf: (() => {
          if (flowData?.etfFlows?.netFlow !== undefined) {
            return Math.min(100, Math.round(Math.abs(flowData.etfFlows.netFlow) / 1000000));
          }
          return Math.min(100, Math.round(Math.abs(flowData?.volumeAnalysis?.priceChange || 0) * 100)) || 50;
        })(),
        med: (() => {
          // Check institutional activity or options flow
          if (flowData?.institutionalActivity) {
            return flowData.institutionalActivity === 'buying' ? 'UP' : flowData.institutionalActivity === 'selling' ? 'DOWN' : 'SIDEWAYS';
          }
          if (flowData?.optionsFlow?.putCallRatio !== undefined) {
            return flowData.optionsFlow.putCallRatio > 1 ? 'DOWN' : flowData.optionsFlow.putCallRatio < 1 ? 'UP' : 'SIDEWAYS';
          }
          return flowData?.volumeAnalysis?.institutionalActivity === 'high' ? 'UP' : flowData?.volumeAnalysis?.institutionalActivity === 'low' ? 'DOWN' : 'SIDEWAYS';
        })(),
        medConf: 50,
        long: 'SIDEWAYS',
        longConf: 50
      },
      // SonarResearch
      {
        name: 'Sonar',
        short: sonarData?.sentiment?.overall === 'bullish' ? 'UP' : sonarData?.sentiment?.overall === 'bearish' ? 'DOWN' : 'SIDEWAYS',
        shortConf: Math.round((sonarData?.sentiment?.newsSentiment || 0.5) * 100),
        med: sonarData?.sentiment?.overall === 'bullish' ? 'UP' : sonarData?.sentiment?.overall === 'bearish' ? 'DOWN' : 'SIDEWAYS',
        medConf: Math.round((sonarData?.sentiment?.newsSentiment || 0.5) * 100),
        long: sonarData?.sentiment?.analystRating === 'buy' ? 'UP' : sonarData?.sentiment?.analystRating === 'sell' ? 'DOWN' : 'SIDEWAYS',
        longConf: 50
      },
      // OnChain - enhanced to handle both crypto and stock data
      {
        name: 'OnChain',
        short: (() => {
          // For crypto, check price change from network metrics
          if (onchainData?.networkMetrics?.priceChange24h !== undefined) {
            return onchainData.networkMetrics.priceChange24h > 0 ? 'UP' : onchainData.networkMetrics.priceChange24h < 0 ? 'DOWN' : 'SIDEWAYS';
          }
          // For stocks, check market activity
          return onchainData?.marketActivity === 'increasing' ? 'UP' : onchainData?.marketActivity === 'decreasing' ? 'DOWN' : 'SIDEWAYS';
        })(),
        shortConf: (() => {
          if (onchainData?.networkMetrics?.priceChange24h !== undefined) {
            return Math.min(100, Math.round(Math.abs(onchainData.networkMetrics.priceChange24h) * 100));
          }
          return 50;
        })(),
        med: (() => {
          // For crypto, check transaction count trend
          if (onchainData?.networkMetrics?.transactionCount !== undefined) {
            // Assume higher transaction count is bullish (more activity)
            return onchainData.networkMetrics.transactionCount > 300000 ? 'UP' : onchainData.networkMetrics.transactionCount < 200000 ? 'DOWN' : 'SIDEWAYS';
          }
          // For stocks, check institutional flow
          return onchainData?.institutionalFlow === 'high' ? 'UP' : onchainData?.institutionalFlow === 'low' ? 'DOWN' : 'SIDEWAYS';
        })(),
        medConf: 50,
        long: 'SIDEWAYS',
        longConf: 50
      },
      // Microstructure - enhanced to use actual order book data
      {
        name: 'Microstructure',
        short: (() => {
          // Handle both array and string formats for microstructure data
          if (Array.isArray(microstructureData?.bidDepth) && Array.isArray(microstructureData?.askDepth)) {
            // Calculate bid-ask imbalance for array format
            const totalBidSize = microstructureData.bidDepth.reduce((sum: number, level: any) => sum + level.size, 0);
            const totalAskSize = microstructureData.askDepth.reduce((sum: number, level: any) => sum + level.size, 0);
            const imbalance = (totalBidSize - totalAskSize) / (totalBidSize + totalAskSize);
            return imbalance > 0.1 ? 'UP' : imbalance < -0.1 ? 'DOWN' : 'SIDEWAYS';
          } else if (microstructureData?.bidDepth && microstructureData?.askDepth) {
            // Handle string format - extract numbers if possible
            const bidMatch = microstructureData.bidDepth.match(/(\d+(?:\.\d+)?)/);
            const askMatch = microstructureData.askDepth.match(/(\d+(?:\.\d+)?)/);
            if (bidMatch && askMatch) {
              const bidSize = parseFloat(bidMatch[1]);
              const askSize = parseFloat(askMatch[1]);
              const imbalance = (bidSize - askSize) / (bidSize + askSize);
              return imbalance > 0.1 ? 'UP' : imbalance < -0.1 ? 'DOWN' : 'SIDEWAYS';
            }
          }
          return 'SIDEWAYS';
        })(),
        shortConf: 50,
        med: 'SIDEWAYS',
        medConf: 50,
        long: 'SIDEWAYS',
        longConf: 50
      }
    ];

    // 2. Weighted vote for each timeframe
    const timeframes = ['short', 'med', 'long'] as const;
    type Timeframe = typeof timeframes[number];
    const tfLabels = { short: '1day', med: '1week', long: '1month' };
    const tfResults: Record<string, { dir: string, conf: number }> = {};
    for (const tf of timeframes) {
      let sum = 0;
      let totalWeight = 0;
      let confSum = 0;
      for (const agent of agentSignals) {
        const dir = agent[tf];
        const conf = agent[`${tf}Conf`];
        const weight = 1; // Equal weights for now
        sum += dirToNum(dir) * weight * (conf / 100);
        totalWeight += weight;
        confSum += conf;
      }
      const avg = sum / totalWeight;
      tfResults[tfLabels[tf]] = {
        dir: numToDir(avg),
        conf: Math.round(confSum / agentSignals.length)
      };
    }

    // 3. Final direction: weighted average across all timeframes
    const timeframeWeights = { '1day': 0.4, '1week': 0.35, '1month': 0.25 };
    let finalSum = 0;
    let finalWeightSum = 0;
    let finalConfSum = 0;
    
    for (const [tf, weight] of Object.entries(timeframeWeights)) {
      const tfResult = tfResults[tf];
      finalSum += dirToNum(tfResult.dir) * weight * (tfResult.conf / 100);
      finalWeightSum += weight;
      finalConfSum += tfResult.conf * weight;
    }
    
    const finalAvg = finalSum / finalWeightSum;
    const finalDir = numToDir(finalAvg);
    const finalConf = Math.round(finalConfSum / finalWeightSum);

    // 4. LLM for explanation
    const llmPrompt = `Analyze this trading prediction and explain the reasoning.

Key signals:
- ML: ${mlData?.predictiveSignals?.shortTerm?.direction || 'neutral'} (short), ${mlData?.predictiveSignals?.mediumTerm?.direction || 'neutral'} (medium), ${mlData?.predictiveSignals?.longTerm?.direction || 'neutral'} (long)
- Quant: ${quantData?.trend?.direction || 'neutral'} trend
- Flow: ${flowData?.volumeAnalysis?.priceChange > 0 ? 'positive' : 'negative'} price change
- Sonar: ${sonarData?.sentiment?.overall || 'neutral'} sentiment
- OnChain: ${onchainData?.marketActivity || 'normal'} activity

Prediction: ${finalDir} (${finalConf}% confidence)
Timeframes: 1day=${tfResults['1day'].dir}, 1week=${tfResults['1week'].dir}, 1month=${tfResults['1month'].dir}

You MUST return ONLY valid JSON with this EXACT structure - no other text, no markdown, just pure JSON:

{"reasoning":{"chainOfThought":"Brief analysis","evidence":["Key evidence"],"conflicts":["Any conflicts"]}}

IMPORTANT: Return ONLY the JSON object, no explanations, no markdown formatting, no code blocks. The response must be parseable by JSON.parse().`;

    const result = await this.callAI(llmPrompt);
    let reasoning: any = { chainOfThought: '', evidence: [], conflicts: [] };
    
    try {
      const parsed = JSON.parse(result.content);
      if (parsed.reasoning) {
        reasoning = parsed.reasoning;
      } else {
        reasoning = { 
          chainOfThought: 'Analysis completed programmatically. LLM explanation format error.', 
          evidence: ['Programmatic synthesis used'], 
          conflicts: [] 
        };
      }
    } catch (e) {
      // Try to extract JSON from code block or text
      const match = result.content.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          const extracted = JSON.parse(match[0]);
          if (extracted.reasoning) {
            reasoning = extracted.reasoning;
          } else {
            reasoning = { 
              chainOfThought: 'Analysis completed programmatically. LLM explanation format error.', 
              evidence: ['Programmatic synthesis used'], 
              conflicts: [] 
            };
          }
        } catch (extractErr) {
          reasoning = { 
            chainOfThought: 'Analysis completed programmatically. LLM explanation unavailable.', 
            evidence: ['Programmatic synthesis used'], 
            conflicts: [] 
          };
        }
      } else {
        reasoning = { 
          chainOfThought: 'Analysis completed programmatically. LLM explanation unavailable.', 
          evidence: ['Programmatic synthesis used'], 
          conflicts: [] 
        };
      }
    }
    
    // Defensive: ensure reasoning is a proper object
    if (!reasoning || typeof reasoning !== 'object' || Array.isArray(reasoning)) {
      console.error('[SynthOracleAgent] Invalid reasoning format, using fallback');
      reasoning = { 
        chainOfThought: 'Analysis completed programmatically. LLM explanation unavailable.', 
        evidence: ['Programmatic synthesis used'], 
        conflicts: [] 
      };
    }

    // 5. Return hybrid result
    const startTime = Date.now();
    const sources = [
      'https://ai-signal-platform.com',
      'https://multi-agent-synthesis.ai',
      'https://trading-signals.com',
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
      data: {
        direction: finalDir,
        timeframes: tfResults,
        confidence: finalConf,
        prediction: {
          direction: finalDir,
          timeframes: tfResults,
          confidence: finalConf
        },
        reasoning,
        sources: sources // Add the missing sources field
      },
      confidence: finalConf,
      sources: sources,
      processingTime: Date.now() - startTime,
      quality: qualityMetrics,
      validation: validationMetrics,
      reliability: reliabilityMetrics,
      metadata: {}
    };
  }

  private getFallbackData(): SynthOracleData {
    return {
      prediction: {
        direction: 'SIDEWAYS',
        timeframes: {
          '1day': 'SIDEWAYS',
          '1week': 'SIDEWAYS',
          '1month': 'SIDEWAYS'
        },
        confidence: 50
      },
      reasoning: {
        chainOfThought: 'Analysis pending - insufficient data from other agents',
        evidence: [],
        conflicts: []
      },
      tags: [],
      riskFactors: ['Insufficient data'],
      synthesis: {
        summary: 'Analysis pending',
        keyDrivers: [],
        uncertainties: ['Data availability']
      },
      markdownTable: ''
    };
  }
}
