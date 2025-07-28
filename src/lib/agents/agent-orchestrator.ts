import { BaseAgent } from './base-agent';
import { SonarResearchAgent } from './sonar-research-agent';
import { GeoSentienceAgent } from './geo-sentience-agent';
import { QuantEdgeAgent } from './quant-edge-agent';
import { SynthOracleAgent } from './synth-oracle-agent';
import { OnChainAgent } from './onchain-agent';
import { FlowAgent } from './flow-agent';
import { MicrostructureAgent } from './microstructure-agent';
import { MLAgent } from './ml-agent';
import { AgentInput, AgentOutput, MultiAgentOutput } from '../types/prediction-types';
import { SignalValidator } from './signal-validator';
import { logAgentResult, logLargeObject } from '../utils';

export class AgentOrchestrator {
  private agents: BaseAgent[];

  constructor() {
    this.agents = [
      new SonarResearchAgent(),
      new GeoSentienceAgent(),
      new QuantEdgeAgent(),
      new OnChainAgent(),
      new FlowAgent(),
      new MicrostructureAgent(),
      new MLAgent(),
      new SynthOracleAgent()
    ];
  }

  async runMultiAgentAnalysis(symbol: string): Promise<MultiAgentOutput> {
    const startTime = Date.now();
    const results: Record<string, AgentOutput> = {};

    try {
      console.log(`🧠 Starting multi-agent analysis for ${symbol}...`);

      // Run all analysis agents in parallel
      const agentPromises = [
        this.agents[0].process({ symbol }), // SonarResearch
        this.agents[1].process({ symbol }), // GeoSentience
        this.agents[2].process({ symbol }), // QuantEdge
        this.agents[3].process({ symbol }), // OnChain
        this.agents[4].process({ symbol }), // Flow
        this.agents[5].process({ symbol }), // Microstructure
        this.agents[6].process({ symbol })  // ML
      ];

      const agentResults = await Promise.all(agentPromises);
      
      // 🏆 GOLD STANDARD: Validate each agent result
      const validatedResults: Record<string, AgentOutput> = {};
      const agentNames = ['sonar', 'geo', 'quant', 'onchain', 'flow', 'microstructure', 'ml'];
      
      for (let i = 0; i < agentResults.length; i++) {
        const result = SignalValidator.validateAgentOutput(agentResults[i]);
        const agentName = agentNames[i];
        
        // Always include the agent result, but log if it has zero confidence
        if (result.confidence === 0) {
          console.log(`⚠️  ${agentName} has zero confidence - using fallback data`);
        }
        
        validatedResults[agentName] = result;
        results[agentName] = result;
      }

      // Log validation results
      console.log('🔍 Validation Results:');
      Object.entries(validatedResults).forEach(([agent, result]) => {
        console.log(`${agent}: Validation ${result.validation.passed ? '✅ PASSED' : '❌ FAILED'} (Score: ${result.validation.score}/100, Confidence: ${result.confidence})`);
        if (result.quality.warnings.length > 0) {
          console.log(`  ⚠️  Warnings: ${result.quality.warnings.join(', ')}`);
        }
      });

      // 🏆 GOLD STANDARD: Check if we have enough quality data
      const qualityThreshold = 60; // Minimum quality score
      const lowQualityAgents = Object.entries(validatedResults).filter(([_, result]) => 
        result.quality.overallQuality < qualityThreshold
      );

      if (lowQualityAgents.length > 3) {
        console.warn(`⚠️  Warning: ${lowQualityAgents.length} agents have low quality data (<${qualityThreshold})`);
        console.warn(`   Low quality agents: ${lowQualityAgents.map(([agent, result]) => 
          `${agent}(${result.quality.overallQuality})`).join(', ')}`);
      }

      // Log each agent's result for debugging (with better formatting)
      logAgentResult('SonarResearchAgent', validatedResults.sonar);
      logAgentResult('GeoSentienceAgent', validatedResults.geo);
      logAgentResult('QuantEdgeAgent', validatedResults.quant);
      logAgentResult('OnChainAgent', validatedResults.onchain);
      logAgentResult('FlowAgent', validatedResults.flow);
      logAgentResult('MicrostructureAgent', validatedResults.microstructure);
      logAgentResult('MLAgent', validatedResults.ml);

      console.log('✅ All analysis agents completed and validated');

      // Run synthesis agent with validated context
      console.log('🧩 Running synthesis agent with validated data...');
      
      // Prepare context for synthesis agent, filtering out zero-confidence data
      const synthesisContext: any = {};
      const contextKeys = ['sonarData', 'geoData', 'quantData', 'onchainData', 'flowData', 'microstructureData', 'mlData'];
      const agentKeys = ['sonar', 'geo', 'quant', 'onchain', 'flow', 'microstructure', 'ml'];
      
      for (let i = 0; i < contextKeys.length; i++) {
        const contextKey = contextKeys[i];
        const agentKey = agentKeys[i];
        const agentResult = validatedResults[agentKey];
        
        // Only include data from agents with reasonable confidence (>0)
        if (agentResult && agentResult.confidence > 0) {
          synthesisContext[contextKey] = agentResult.data;
        } else {
          console.log(`⚠️  Excluding ${agentKey} data from synthesis (confidence: ${agentResult?.confidence || 0})`);
          synthesisContext[contextKey] = null;
        }
      }
      
      const synthResult = await this.agents[7].process({
        symbol,
        context: synthesisContext
      });

      // 🏆 GOLD STANDARD: Validate synthesis result
      const validatedSynthResult = SignalValidator.validateAgentOutput(synthResult);
      results.synth = validatedSynthResult;

      // Log synthesis agent result
      logAgentResult('SynthOracleAgent', validatedSynthResult);
      console.log('✅ Synthesis agent completed and validated');

      const totalTime = Date.now() - startTime;
      console.log(`🎯 Multi-agent analysis completed in ${totalTime}ms`);

      // 🏆 GOLD STANDARD: Calculate overall quality and reliability metrics
      const overallQuality = this.calculateOverallQuality(validatedResults);
      const validationSummary = this.calculateValidationSummary(validatedResults);
      const reliabilityMetrics = this.calculateReliabilityMetrics(validatedResults);
      const transparency = this.buildTransparencyReport(validatedResults);

      // 🏆 GOLD STANDARD: Generate enhanced prediction with entry/exit points
      const enhancedPrediction = this.generateEnhancedPrediction(validatedSynthResult, validatedResults);

      return {
        symbol,
        timestamp: new Date().toISOString(),
        agents: results,
        totalProcessingTime: totalTime,
        finalPrediction: enhancedPrediction,
        confidence: this.calculateOverallConfidence(results),
        metadata: {
          agentConfidences: Object.fromEntries(
            Object.entries(results).map(([name, result]) => [name, result.confidence || 50])
          ),
          tags: validatedSynthResult.metadata?.tags || [],
          riskFactors: validatedSynthResult.metadata?.riskFactors || [],
          // 🆕 GOLD STANDARD ADDITIONS:
          overallQuality,
          validationSummary,
          reliabilityMetrics,
          transparency
        }
      };

    } catch (error) {
      console.error('❌ Multi-agent analysis failed:', error);
      throw error;
    }
  }

  // 🏆 GOLD STANDARD: Calculate overall quality metrics
  private calculateOverallQuality(results: Record<string, AgentOutput>) {
    // Filter out zero-confidence agents from quality calculations
    const validResults = Object.values(results).filter(result => (result.confidence || 0) > 0);
    
    if (validResults.length === 0) {
      // If no agents have confidence, return minimum quality
      return {
        dataFreshness: 0,
        sourceReliability: 0,
        crossVerification: 0,
        anomalyScore: 0,
        completeness: 0,
        consistency: 0,
        overallQuality: 0,
        warnings: ["No agents with valid confidence scores"],
        lastValidated: new Date().toISOString()
      };
    }
    
    const qualities = validResults.map(result => result.quality);
    
    return {
      dataFreshness: Math.round(qualities.reduce((sum, q) => sum + q.dataFreshness, 0) / qualities.length),
      sourceReliability: Math.round(qualities.reduce((sum, q) => sum + q.sourceReliability, 0) / qualities.length),
      crossVerification: Math.round(qualities.reduce((sum, q) => sum + q.crossVerification, 0) / qualities.length),
      anomalyScore: Math.round(qualities.reduce((sum, q) => sum + q.anomalyScore, 0) / qualities.length),
      completeness: Math.round(qualities.reduce((sum, q) => sum + q.completeness, 0) / qualities.length),
      consistency: Math.round(qualities.reduce((sum, q) => sum + q.consistency, 0) / qualities.length),
      overallQuality: Math.round(qualities.reduce((sum, q) => sum + q.overallQuality, 0) / qualities.length),
      warnings: qualities.flatMap(q => q.warnings),
      lastValidated: new Date().toISOString()
    };
  }

  // 🏆 GOLD STANDARD: Calculate validation summary
  private calculateValidationSummary(results: Record<string, AgentOutput>) {
    const allChecks = Object.values(results).flatMap(result => result.validation.checks);
    const totalChecks = allChecks.length;
    const passedChecks = allChecks.filter(check => check.passed).length;
    const criticalFailures = allChecks.filter(check => check.critical && !check.passed).length;
    const overallScore = Math.round((passedChecks / totalChecks) * 100);

    return {
      totalChecks,
      passedChecks,
      criticalFailures,
      overallScore
    };
  }

  // 🏆 GOLD STANDARD: Calculate reliability metrics
  private calculateReliabilityMetrics(results: Record<string, AgentOutput>) {
    // Filter out zero-confidence agents from reliability calculations
    const validResults = Object.values(results).filter(result => (result.confidence || 0) > 0);
    
    if (validResults.length === 0) {
      // If no agents have confidence, return minimum reliability
      return {
        averageAgentAccuracy: 0,
        dataSourceHealth: 0,
        signalConsistency: 0
      };
    }
    
    const reliabilities = validResults.map(result => result.reliability);
    
    return {
      averageAgentAccuracy: Math.round(reliabilities.reduce((sum, r) => sum + r.historicalAccuracy, 0) / reliabilities.length),
      dataSourceHealth: Math.round(reliabilities.reduce((sum, r) => sum + r.dataSourceHealth, 0) / reliabilities.length),
      signalConsistency: Math.round(reliabilities.reduce((sum, r) => sum + r.signalStrength, 0) / reliabilities.length)
    };
  }

  // 🏆 GOLD STANDARD: Build transparency report
  private buildTransparencyReport(results: Record<string, AgentOutput>) {
    const dataSources: Array<{
      name: string;
      reliability: number;
      lastUpdated: string;
      contribution: number;
    }> = [];

    // Collect all unique sources with their reliability scores (excluding zero-confidence agents)
    const sourceMap = new Map<string, { reliability: number; lastUpdated: string; contribution: number }>();
    const excludedAgents: string[] = [];
    
    Object.entries(results).forEach(([agent, result]) => {
      // Skip zero-confidence agents in transparency report
      if ((result.confidence || 0) === 0) {
        excludedAgents.push(agent);
        return;
      }
      
      result.sources.forEach(source => {
        const existing = sourceMap.get(source);
        if (existing) {
          existing.reliability = Math.max(existing.reliability, result.reliability.dataSourceHealth);
          existing.contribution += result.reliability.signalStrength;
        } else {
          sourceMap.set(source, {
            reliability: result.reliability.dataSourceHealth,
            lastUpdated: result.timestamp,
            contribution: result.reliability.signalStrength
          });
        }
      });
    });

    sourceMap.forEach((data, source) => {
      dataSources.push({
        name: source,
        reliability: data.reliability,
        lastUpdated: data.lastUpdated,
        contribution: Math.round(data.contribution)
      });
    });

    // Build reasoning from synthesis agent
    const synthData = results.synth?.data;
    const reasoning = {
      technical: synthData?.reasoning?.technical || [],
      sentiment: synthData?.reasoning?.sentiment || [],
      macro: synthData?.reasoning?.macro || [],
      conflicts: synthData?.reasoning?.conflicts || [],
      uncertainties: [
        ...(synthData?.reasoning?.uncertainties || []),
        ...(excludedAgents.length > 0 ? [`Excluded agents with zero confidence: ${excludedAgents.join(', ')}`] : [])
      ]
    };

    return {
      dataSources: dataSources.sort((a, b) => b.contribution - a.contribution),
      reasoning
    };
  }

  // 🏆 GOLD STANDARD: Generate enhanced prediction with entry/exit points
  private generateEnhancedPrediction(synthResult: AgentOutput, allResults: Record<string, AgentOutput>) {
    const basePrediction = synthResult.data.prediction || { 
      direction: 'NEUTRAL', 
      timeframes: { '1day': 'NEUTRAL', '1week': 'NEUTRAL', '1month': 'NEUTRAL' }, 
      confidence: 50 
    };

    // Calculate risk level based on quality and confidence
    const riskLevel = this.calculateRiskLevel(synthResult, allResults);

    // Generate entry/exit points (placeholder - would need price data)
    const entryPrice = this.calculateEntryPrice(basePrediction, allResults);
    const stopLoss = this.calculateStopLoss(entryPrice, basePrediction, riskLevel);
    const takeProfit = this.calculateTakeProfit(entryPrice, basePrediction, riskLevel);

    // Calculate expiration time based on prediction type
    const expirationTime = this.calculateExpirationTime(basePrediction);

    console.log(`🎯 Enhanced Prediction Details:`);
    console.log(`   Direction: ${basePrediction.direction}`);
    console.log(`   Risk Level: ${riskLevel}`);
    console.log(`   Entry Price: $${entryPrice}`);
    console.log(`   Stop Loss: $${stopLoss}`);
    console.log(`   Take Profit: $${takeProfit}`);
    console.log(`   Expiration: ${expirationTime}`);

    return {
      ...basePrediction,
      entryPrice,
      stopLoss,
      takeProfit,
      expirationTime,
      riskLevel
    };
  }

  private calculateRiskLevel(synthResult: AgentOutput, allResults: Record<string, AgentOutput>): 'LOW' | 'MEDIUM' | 'HIGH' {
    const quality = synthResult.quality.overallQuality;
    const confidence = synthResult.confidence;
    const validationScore = synthResult.validation.score;

    const riskScore = (quality + confidence + validationScore) / 3;

    if (riskScore >= 80) return 'LOW';
    if (riskScore >= 60) return 'MEDIUM';
    return 'HIGH';
  }

  private calculateEntryPrice(prediction: any, allResults: Record<string, AgentOutput>): number {
    // Try to get the best available price from agents, fallback to 0
    // Priority: microstructure.midPrice, quant.price, flow.marketData.currentPrice, onchain.currentPrice
    let price: number | undefined = undefined;

    // MicrostructureAgent (midPrice) - check both possible structures
    const micro = allResults.microstructure?.data;
    if (micro) {
      // Check if midPrice is directly in orderBook
      if (micro.orderBook && typeof micro.orderBook.midPrice === 'number' && micro.orderBook.midPrice > 0) {
        price = micro.orderBook.midPrice;
        console.log(`💰 Using MicrostructureAgent midPrice: ${price}`);
      }
      // Check if midPrice is in a nested structure
      else if (micro.orderBook && micro.orderBook.orderBook && typeof micro.orderBook.orderBook.midPrice === 'number' && micro.orderBook.orderBook.midPrice > 0) {
        price = micro.orderBook.orderBook.midPrice;
        console.log(`💰 Using MicrostructureAgent nested midPrice: ${price}`);
      }
    }

    // QuantEdgeAgent (price)
    if (!price && allResults.quant?.data && allResults.quant.data.price && typeof allResults.quant.data.price.price === 'number' && allResults.quant.data.price.price > 0) {
      price = allResults.quant.data.price.price;
      console.log(`💰 Using QuantEdgeAgent price: ${price}`);
    }

    // FlowAgent (marketData.currentPrice)
    if (!price && allResults.flow?.data && allResults.flow.data.marketData && typeof allResults.flow.data.marketData.currentPrice === 'number' && allResults.flow.data.marketData.currentPrice > 0) {
      price = allResults.flow.data.marketData.currentPrice;
      console.log(`💰 Using FlowAgent currentPrice: ${price}`);
    }

    // OnChainAgent (networkMetrics.currentPrice or currentPrice)
    if (!price && allResults.onchain?.data) {
      const onchainData = allResults.onchain.data;
      if (onchainData.networkMetrics && typeof onchainData.networkMetrics.currentPrice === 'number' && onchainData.networkMetrics.currentPrice > 0) {
        price = onchainData.networkMetrics.currentPrice;
        console.log(`💰 Using OnChainAgent networkMetrics.currentPrice: ${price}`);
      } else if (typeof onchainData.currentPrice === 'number' && onchainData.currentPrice > 0) {
        price = onchainData.currentPrice;
        console.log(`💰 Using OnChainAgent currentPrice: ${price}`);
      }
    }

    // Fallback to 0 if no price found
    if (!price || isNaN(price)) {
      price = 0;
      console.log(`⚠️  No valid price found, using fallback: ${price}`);
    }
    return price;
  }

  private calculateStopLoss(entryPrice: number, prediction: any, riskLevel: string): number {
    if (!entryPrice || entryPrice === 0) return 0;
    const stopLossPercentages = { LOW: 0.02, MEDIUM: 0.03, HIGH: 0.05 };
    const percentage = stopLossPercentages[riskLevel as keyof typeof stopLossPercentages] || 0.03;
    return prediction.direction === 'UP' 
      ? entryPrice * (1 - percentage)
      : entryPrice * (1 + percentage);
  }

  private calculateTakeProfit(entryPrice: number, prediction: any, riskLevel: string): number {
    if (!entryPrice || entryPrice === 0) return 0;
    const takeProfitPercentages = { LOW: 0.04, MEDIUM: 0.06, HIGH: 0.10 };
    const percentage = takeProfitPercentages[riskLevel as keyof typeof takeProfitPercentages] || 0.06;
    return prediction.direction === 'UP' 
      ? entryPrice * (1 + percentage)
      : entryPrice * (1 - percentage);
  }

  private calculateExpirationTime(prediction: any): string {
    // Set expiration based on primary timeframe
    const timeframes = prediction.timeframes;
    let hours = 24; // Default 1 day

    if (timeframes['1week'] !== 'NEUTRAL') hours = 168; // 1 week
    if (timeframes['1month'] !== 'NEUTRAL') hours = 720; // 1 month

    const expiration = new Date();
    expiration.setHours(expiration.getHours() + hours);
    
    return expiration.toISOString();
  }

  private calculateOverallConfidence(results: Record<string, AgentOutput>): number {
    // Use SynthOracle's confidence as the primary confidence since it's the synthesis agent
    const synthConfidence = results.synth?.confidence || 50;
    
    // If SynthOracle has a reasonable confidence, use it
    if (synthConfidence > 0) {
      return synthConfidence;
    }
    
    // Fallback to weighted average of other agents (excluding synth and zero-confidence agents)
    const weights = { 
      sonar: 0.20, 
      geo: 0.20, 
      quant: 0.20, 
      onchain: 0.15, 
      flow: 0.15, 
      ml: 0.10
      // Exclude microstructure if it has zero confidence
    };
    
    let totalConfidence = 0;
    let totalWeight = 0;

    for (const [agent, result] of Object.entries(results)) {
      // Skip synth (already handled) and agents with zero confidence
      if (agent === 'synth' || (result.confidence || 0) === 0) {
        continue;
      }
      
      const confidence = result.confidence || 50;
      const weight = weights[agent as keyof typeof weights] || 0;
      
      totalConfidence += confidence * weight;
      totalWeight += weight;
    }

    // If we have valid agents, return weighted average, otherwise return synth confidence
    return totalWeight > 0 ? Math.round(totalConfidence / totalWeight) : synthConfidence;
  }

  // Method to get individual agent results for debugging
  async runSingleAgent(agentIndex: number, symbol: string): Promise<AgentOutput> {
    if (agentIndex < 0 || agentIndex >= this.agents.length) {
      throw new Error('Invalid agent index');
    }
    
    const result = await this.agents[agentIndex].process({ symbol });
    return SignalValidator.validateAgentOutput(result);
  }

  // Method to get agent status
  getAgentStatus(): Array<{ name: string; description: string }> {
    return this.agents.map(agent => ({
      name: agent.constructor.name,
      description: agent['config'].description
    }));
  }
}
