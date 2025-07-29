import { BaseAgent } from './base-agent';
import { SonarResearchAgent } from './sonar-research-agent';
import { GeoSentienceAgent } from './geo-sentience-agent';
import { QuantEdgeAgent } from './quant-edge-agent';
import { SynthOracleAgent } from './synth-oracle-agent';
import { OnChainAgent } from './onchain-agent';
import { FlowAgent } from './flow-agent';
import { MicrostructureAgent } from './microstructure-agent';
import { MLAgent } from './ml-agent';
import { MarketStructureAgent } from './market-structure-agent';
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
      new MarketStructureAgent(),
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
        this.agents[6].process({ symbol }), // ML
        this.agents[7].process({ symbol })  // MarketStructure
      ];

      const agentResults = await Promise.all(agentPromises);
      
      // 🏆 GOLD STANDARD: Validate each agent result
      const validatedResults: Record<string, AgentOutput> = {};
      const agentNames = ['sonar', 'geo', 'quant', 'onchain', 'flow', 'microstructure', 'ml', 'marketstructure'];
      
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
        
        // Log data sources to help debug
        console.warn(`🔍 Data source analysis for ${symbol}:`);
        Object.entries(validatedResults).forEach(([agent, result]) => {
          console.warn(`   ${agent}: sources=${result.sources.join(', ')}, quality=${result.quality.overallQuality}`);
        });
      }

      // Log each agent's result for debugging (with better formatting)
      logAgentResult('SonarResearchAgent', validatedResults.sonar);
      logAgentResult('GeoSentienceAgent', validatedResults.geo);
      logAgentResult('QuantEdgeAgent', validatedResults.quant);
      logAgentResult('OnChainAgent', validatedResults.onchain);
      logAgentResult('FlowAgent', validatedResults.flow);
      logAgentResult('MicrostructureAgent', validatedResults.microstructure);
      logAgentResult('MLAgent', validatedResults.ml);
      logAgentResult('MarketStructureAgent', validatedResults.marketstructure);

      console.log('✅ All analysis agents completed and validated');

      // Run synthesis agent with validated context
      console.log('🧩 Running synthesis agent with validated data...');
      
      // Prepare context for synthesis agent, filtering out zero-confidence data
      const synthesisContext: any = {};
      const contextKeys = ['sonarData', 'geoData', 'quantData', 'onchainData', 'flowData', 'microstructureData', 'mlData', 'marketStructureData'];
      const agentKeys = ['sonar', 'geo', 'quant', 'onchain', 'flow', 'microstructure', 'ml', 'marketstructure'];
      
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
      
      const synthResult = await this.agents[8].process({
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

      // 🏆 GOLD STANDARD: Cross-agent validation and conflict detection
      const crossValidation = this.performCrossAgentValidation(validatedResults);
      
      // Calculate overall quality and reliability metrics
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
          transparency,
          crossValidation
        }
      };

    } catch (error) {
      console.error(`❌ Multi-agent analysis failed for ${symbol}:`, error);
      
      // Enhanced error logging for debugging
      if (error instanceof Error) {
        console.error(`   Error message: ${error.message}`);
        console.error(`   Error stack: ${error.stack?.substring(0, 500)}`);
      }
      
      // Log API health status from centralized data provider
      try {
        const { CentralizedDataProvider } = await import('../centralized-data-provider');
        const healthStatus = (CentralizedDataProvider as any).getApiHealth?.();
        if (healthStatus) {
          console.error('🏥 API Health Status:');
          Object.entries(healthStatus).forEach(([api, health]) => {
            console.error(`   ${api}: success rate ${((health as any).successRate * 100).toFixed(1)}%`);
          });
        }
      } catch (healthError) {
        console.error('Unable to retrieve API health status:', healthError);
      }
      
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

    // 🔧 PROFESSIONAL RISK MANAGEMENT: Check confidence threshold
    const overallConfidence = this.calculateOverallConfidence(allResults);
    const minConfidenceThreshold = 70; // Professional threshold
    
    // If confidence is too low, force NEUTRAL direction
    if (overallConfidence < minConfidenceThreshold) {
      console.log(`⚠️  Low confidence (${overallConfidence}%) - forcing NEUTRAL direction for risk management`);
      basePrediction.direction = 'NEUTRAL';
    }

    // Calculate risk level based on quality and confidence
    const riskLevel = this.calculateRiskLevel(synthResult, allResults);

    // Generate entry/exit points
    const entryPrice = this.calculateEntryPrice(basePrediction, allResults);
    const stopLoss = this.calculateStopLoss(entryPrice, basePrediction, riskLevel);
    const takeProfit = this.calculateTakeProfit(entryPrice, basePrediction, riskLevel);

    // Calculate expiration time based on prediction type
    const expirationTime = this.calculateExpirationTime(basePrediction);

    // 🔧 RISK MANAGEMENT VALIDATION
    const riskRewardRatio = Math.abs((takeProfit - entryPrice) / (stopLoss - entryPrice));
    
    console.log(`🎯 Enhanced Prediction Details:`);
    console.log(`   Direction: ${basePrediction.direction}`);
    console.log(`   Overall Confidence: ${overallConfidence}% (min: ${minConfidenceThreshold}%)`);
    console.log(`   Risk Level: ${riskLevel}`);
    console.log(`   Entry Price: $${entryPrice.toFixed(2)}`);
    console.log(`   Stop Loss: $${stopLoss.toFixed(2)}`);
    console.log(`   Take Profit: $${takeProfit.toFixed(2)}`);
    console.log(`   Risk/Reward Ratio: 1:${riskRewardRatio.toFixed(2)}`);
    console.log(`   Expiration: ${expirationTime}`);

    return {
      ...basePrediction,
      entryPrice,
      stopLoss,
      takeProfit,
      expirationTime,
      riskLevel,
      riskRewardRatio,
      tradeable: overallConfidence >= minConfidenceThreshold && basePrediction.direction !== 'NEUTRAL'
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
    
    // 🔧 FIX: Handle SIDEWAYS/NEUTRAL direction
    if (prediction.direction === 'UP') {
      return entryPrice * (1 - percentage); // Stop loss BELOW entry for longs
    } else if (prediction.direction === 'DOWN') {
      return entryPrice * (1 + percentage); // Stop loss ABOVE entry for shorts
    } else {
      // SIDEWAYS/NEUTRAL: No position recommended, return tight stop loss
      return entryPrice * (1 - 0.01); // Very tight 1% stop loss as warning
    }
  }

  private calculateTakeProfit(entryPrice: number, prediction: any, riskLevel: string): number {
    if (!entryPrice || entryPrice === 0) return 0;
    const takeProfitPercentages = { LOW: 0.04, MEDIUM: 0.06, HIGH: 0.10 };
    const percentage = takeProfitPercentages[riskLevel as keyof typeof takeProfitPercentages] || 0.06;
    
    // 🔧 FIX: Handle SIDEWAYS/NEUTRAL direction
    if (prediction.direction === 'UP') {
      return entryPrice * (1 + percentage); // Take profit ABOVE entry for longs
    } else if (prediction.direction === 'DOWN') {
      return entryPrice * (1 - percentage); // Take profit BELOW entry for shorts
    } else {
      // SIDEWAYS/NEUTRAL: No position recommended, return minimal profit target
      return entryPrice * (1 + 0.01); // Very tight 1% profit target as warning
    }
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
    // 🏆 GOLD STANDARD: Dynamic confidence-based weighting system
    console.log('🎯 Calculating overall confidence with dynamic weighting...');
    
    // Use SynthOracle's confidence if it's high quality (>60%)
    const synthConfidence = results.synth?.confidence || 50;
    const synthQuality = results.synth?.quality?.overallQuality || 0;
    
    if (synthConfidence > 60 && synthQuality > 70) {
      console.log(`✅ Using high-quality SynthOracle confidence: ${synthConfidence}% (quality: ${synthQuality}%)`);
      return synthConfidence;
    }
    
    // 🆕 DYNAMIC WEIGHTING: Base weights adjusted by confidence and quality
    const baseWeights = { 
      sonar: 0.18,         // News & sentiment analysis
      geo: 0.16,           // Macro factors & geopolitical
      quant: 0.22,         // Technical analysis
      onchain: 0.13,       // Blockchain metrics
      flow: 0.13,          // Institutional flows
      ml: 0.06,            // Machine learning predictions
      marketstructure: 0.12 // 🆕 Market structure analysis
    };
    
    let totalWeightedConfidence = 0;
    let totalDynamicWeight = 0;
    const agentWeights: Record<string, number> = {};

    for (const [agent, result] of Object.entries(results)) {
      // Skip synth (handled above) and agents with zero confidence
      if (agent === 'synth' || (result.confidence || 0) === 0) {
        continue;
      }
      
      const confidence = result.confidence || 0;
      const quality = result.quality?.overallQuality || 50;
      const validationScore = result.validation?.score || 50;
      const baseWeight = baseWeights[agent as keyof typeof baseWeights] || 0;
      
      // 🎯 DYNAMIC WEIGHT CALCULATION
      // Higher confidence & quality = higher weight
      const confidenceMultiplier = Math.max(0.1, confidence / 100); // 0.1 to 1.0
      const qualityMultiplier = Math.max(0.5, quality / 100);       // 0.5 to 1.0  
      const validationMultiplier = Math.max(0.5, validationScore / 100); // 0.5 to 1.0
      
      const dynamicWeight = baseWeight * confidenceMultiplier * qualityMultiplier * validationMultiplier;
      
      agentWeights[agent] = dynamicWeight;
      totalWeightedConfidence += confidence * dynamicWeight;
      totalDynamicWeight += dynamicWeight;
      
      console.log(`📊 ${agent}: confidence=${confidence}%, quality=${quality}%, validation=${validationScore}%, weight=${dynamicWeight.toFixed(3)}`);
    }

    // Calculate final confidence
    const finalConfidence = totalDynamicWeight > 0 ? 
      Math.round(totalWeightedConfidence / totalDynamicWeight) : synthConfidence;
    
    console.log(`🎯 Final weighted confidence: ${finalConfidence}% (total dynamic weight: ${totalDynamicWeight.toFixed(3)})`);
    console.log(`📈 Agent weight distribution:`, Object.entries(agentWeights)
      .map(([agent, weight]) => `${agent}: ${(weight/totalDynamicWeight*100).toFixed(1)}%`)
      .join(', '));
    
    return finalConfidence;
  }

  // 🏆 GOLD STANDARD: Cross-agent validation and conflict detection
  private performCrossAgentValidation(results: Record<string, AgentOutput>) {
    console.log('🔍 Performing cross-agent validation and conflict detection...');
    
    const conflicts: Array<{
      type: string;
      agents: string[];
      description: string;
      severity: 'low' | 'medium' | 'high';
      impact: number;
    }> = [];
    
    const consensus: Record<string, any> = {};
    const outliers: string[] = [];
    
    try {
      // Extract signals from each agent (excluding zero-confidence agents)
      const validAgents = Object.entries(results).filter(([_, result]) => (result.confidence || 0) > 0);
      
      if (validAgents.length < 2) {
        return {
          conflicts,
          consensus: { insufficient_data: true },
          outliers,
          conflictScore: 0,
          consensusStrength: 0
        };
      }
      
      // 1. DIRECTIONAL CONFLICTS
      const directions = validAgents.map(([agent, result]) => {
        let direction = 'neutral';
        
        // Extract directional signals from different agent types
        if (result.data?.trend?.direction) {
          direction = result.data.trend.direction;
        } else if (result.data?.prediction?.direction) {
          direction = result.data.prediction.direction;
        } else if (result.data?.sentiment?.overall) {
          direction = result.data.sentiment.overall === 'bullish' ? 'bullish' : 
                    result.data.sentiment.overall === 'bearish' ? 'bearish' : 'neutral';
        } else if (result.data?.consensus?.bullish > result.data?.consensus?.bearish) {
          direction = 'bullish';
        } else if (result.data?.consensus?.bearish > result.data?.consensus?.bullish) {
          direction = 'bearish';
        }
        
        return { agent, direction, confidence: result.confidence };
      });
      
      // Detect directional conflicts
      const bullish = directions.filter(d => d.direction === 'bullish').length;
      const bearish = directions.filter(d => d.direction === 'bearish').length;
      const neutral = directions.filter(d => d.direction === 'neutral').length;
      
      if (bullish > 0 && bearish > 0) {
        const conflictSeverity = Math.abs(bullish - bearish) <= 1 ? 'high' : 'medium';
        conflicts.push({
          type: 'directional_conflict',
          agents: directions.filter(d => d.direction !== 'neutral').map(d => d.agent),
          description: `${bullish} agents bullish vs ${bearish} agents bearish`,
          severity: conflictSeverity,
          impact: Math.min(bullish, bearish) / validAgents.length
        });
      }
      
      // 2. CONFIDENCE OUTLIERS
      const confidences = validAgents.map(([agent, result]) => ({
        agent,
        confidence: result.confidence || 0
      }));
      
      const avgConfidence = confidences.reduce((sum, c) => sum + c.confidence, 0) / confidences.length;
      const confidenceStdDev = Math.sqrt(
        confidences.reduce((sum, c) => sum + Math.pow(c.confidence - avgConfidence, 2), 0) / confidences.length
      );
      
      confidences.forEach(({ agent, confidence }) => {
        if (Math.abs(confidence - avgConfidence) > confidenceStdDev * 2) {
          outliers.push(agent);
          conflicts.push({
            type: 'confidence_outlier',
            agents: [agent],
            description: `${agent} confidence (${confidence}%) deviates significantly from average (${avgConfidence.toFixed(1)}%)`,
            severity: 'medium',
            impact: 0.1
          });
        }
      });
      
      // 3. FLOW vs TECHNICAL CONFLICTS
      const flowAgent = results.flow;
      const quantAgent = results.quant;
      
      if (flowAgent && quantAgent && flowAgent.confidence > 0 && quantAgent.confidence > 0) {
        const flowBullish = flowAgent.data?.institutionalFlows?.etfFlows?.netFlow > 0 ||
                           flowAgent.data?.consensus?.bullish > flowAgent.data?.consensus?.bearish;
        const quantBullish = quantAgent.data?.trend?.direction === 'bullish' ||
                            quantAgent.data?.consensus?.bullish > quantAgent.data?.consensus?.bearish;
        
        if (flowBullish !== quantBullish) {
          conflicts.push({
            type: 'flow_technical_conflict',
            agents: ['flow', 'quant'],
            description: `Flow analysis ${flowBullish ? 'bullish' : 'bearish'} vs Technical analysis ${quantBullish ? 'bullish' : 'bearish'}`,
            severity: 'high',
            impact: 0.2
          });
        }
      }
      
      // 4. CALCULATE CONSENSUS
      consensus.directional = {
        bullish: bullish / validAgents.length,
        bearish: bearish / validAgents.length,
        neutral: neutral / validAgents.length,
        dominant: bullish > bearish ? 'bullish' : bearish > bullish ? 'bearish' : 'neutral'
      };
      
      consensus.confidence = {
        average: avgConfidence,
        stdDev: confidenceStdDev,
        range: {
          min: Math.min(...confidences.map(c => c.confidence)),
          max: Math.max(...confidences.map(c => c.confidence))
        }
      };
      
      // 5. CALCULATE CONFLICT METRICS
      const conflictScore = conflicts.reduce((sum, conflict) => {
        const severityWeight = conflict.severity === 'high' ? 1.0 : conflict.severity === 'medium' ? 0.6 : 0.3;
        return sum + (conflict.impact * severityWeight);
      }, 0);
      
      const consensusStrength = 1 - Math.min(1, conflictScore);
      
      console.log(`🔍 Cross-validation complete: ${conflicts.length} conflicts detected, consensus strength: ${(consensusStrength * 100).toFixed(1)}%`);
      
      if (conflicts.length > 0) {
        console.log('⚠️  Major conflicts detected:');
        conflicts.forEach(conflict => {
          if (conflict.severity === 'high') {
            console.log(`   🚨 ${conflict.type}: ${conflict.description}`);
          }
        });
      }
      
      return {
        conflicts,
        consensus,
        outliers,
        conflictScore: Math.round(conflictScore * 100) / 100,
        consensusStrength: Math.round(consensusStrength * 100) / 100
      };
      
    } catch (error) {
      console.error('Error in cross-agent validation:', error);
      return {
        conflicts: [{ type: 'validation_error', agents: [], description: 'Cross-validation failed', severity: 'medium' as const, impact: 0.1 }],
        consensus: { error: true },
        outliers: [],
        conflictScore: 0.5,
        consensusStrength: 0.5
      };
    }
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
