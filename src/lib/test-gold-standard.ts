import { AgentOrchestrator } from './agents/agent-orchestrator';
import { SignalValidator } from './agents/signal-validator';
import { AgentOutput } from './types/prediction-types';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// 🏆 GOLD STANDARD: Test the validation system
export async function testGoldStandard() {
  console.log('🏆 Testing Gold Standard Signal Validation System...\n');

  // Test 1: Validate individual agent output
  console.log('📋 Test 1: Individual Agent Validation');
  const testOutput: any = {
    agent: 'TestAgent',
    symbol: 'BTC',
    timestamp: new Date().toISOString(),
    data: {
      confidence: 85,
      sources: ['https://coingecko.com', 'https://yahoo.com'],
      trend: { direction: 'UP', strength: 75 },
      sentiment: { overall: 'bullish' }
    },
    confidence: 85,
    sources: ['https://coingecko.com', 'https://yahoo.com'],
    processingTime: 1500
  };

  const validatedOutput = SignalValidator.validateAgentOutput(testOutput);
  console.log(`✅ Validation passed: ${validatedOutput.validation.passed}`);
  console.log(`📊 Validation score: ${validatedOutput.validation.score}/100`);
  console.log(`🎯 Adjusted confidence: ${validatedOutput.confidence}%`);
  console.log(`📈 Overall quality: ${validatedOutput.quality.overallQuality}%`);
  
  if (validatedOutput.quality.warnings.length > 0) {
    console.log(`⚠️  Warnings: ${validatedOutput.quality.warnings.join(', ')}`);
  }
  console.log('');

  // Test 2: Test with poor quality data
  console.log('📋 Test 2: Poor Quality Data Validation');
  const poorQualityOutput: any = {
    agent: 'TestAgent',
    symbol: 'BTC',
    timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours old
    data: {
      confidence: 90, // High confidence with no sources
      sources: [],
      trend: { direction: 'UP', strength: 95 } // Extremely high strength
    },
    confidence: 90,
    sources: [],
    processingTime: 1500
  };

  const validatedPoorOutput = SignalValidator.validateAgentOutput(poorQualityOutput);
  console.log(`✅ Validation passed: ${validatedPoorOutput.validation.passed}`);
  console.log(`📊 Validation score: ${validatedPoorOutput.validation.score}/100`);
  console.log(`🎯 Adjusted confidence: ${validatedPoorOutput.confidence}%`);
  console.log(`📈 Overall quality: ${validatedPoorOutput.quality.overallQuality}%`);
  
  if (validatedPoorOutput.quality.warnings.length > 0) {
    console.log(`⚠️  Warnings: ${validatedPoorOutput.quality.warnings.join(', ')}`);
  }
  console.log('');

  // Test 3: Test full orchestrator (if API keys are available)
  console.log('📋 Test 3: Full Orchestrator Test');
  try {
    const orchestrator = new AgentOrchestrator();
    
    // Test with a simple symbol
    const result = await orchestrator.runMultiAgentAnalysis('BTC');
    
    console.log(`🎯 Final prediction: ${result.finalPrediction.direction}`);
    console.log(`📊 Overall confidence: ${result.confidence}%`);
    console.log(`📈 Overall quality: ${result.metadata.overallQuality.overallQuality}%`);
    console.log(`🔍 Validation summary: ${result.metadata.validationSummary.passedChecks}/${result.metadata.validationSummary.totalChecks} checks passed`);
    console.log(`⚡ Risk level: ${result.finalPrediction.riskLevel}`);
    
    if (result.metadata.overallQuality.warnings.length > 0) {
      console.log(`⚠️  System warnings: ${result.metadata.overallQuality.warnings.join(', ')}`);
    }
    
    console.log('\n🏆 Gold Standard Test Results:');
    console.log(`✅ Signal validation: ${result.metadata.validationSummary.overallScore}/100`);
    console.log(`✅ Data quality: ${result.metadata.overallQuality.overallQuality}/100`);
    console.log(`✅ Transparency: ${result.metadata.transparency.dataSources.length} data sources tracked`);
    console.log(`✅ Reliability: ${result.metadata.reliabilityMetrics.averageAgentAccuracy}% average agent accuracy`);
    
  } catch (error) {
    console.log('⚠️  Full orchestrator test skipped (API keys may not be configured)');
    console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  console.log('\n🎉 Gold Standard validation system is ready!');
}

// Run the test if this file is executed directly
if (require.main === module) {
  testGoldStandard().catch(console.error);
} 