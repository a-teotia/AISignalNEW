/**
 * 🎯 DIRECT TEST: Strategy-Aware Orchestrator
 * Tests the orchestrator directly without HTTP server
 */

const { StrategyAwareOrchestrator } = require('./dist/lib/agents/strategy-aware-orchestrator');

async function testStrategyDirectly() {
  console.log('🎯 TESTING STRATEGY-AWARE ORCHESTRATOR DIRECTLY');
  console.log('================================================');
  
  try {
    // Test if we can import the orchestrator
    console.log('📦 Importing StrategyAwareOrchestrator...');
    if (!StrategyAwareOrchestrator) {
      throw new Error('StrategyAwareOrchestrator not found - compilation issue?');
    }
    console.log('✅ StrategyAwareOrchestrator imported successfully');
    
    // Initialize orchestrator
    console.log('\n🚀 Initializing orchestrator...');
    const orchestrator = new StrategyAwareOrchestrator();
    console.log('✅ Orchestrator initialized');
    
    // Test strategy-aware analysis
    console.log('\n🎯 Testing runStrategyAwareAnalysis...');
    const testInput = {
      symbol: 'AAPL',
      strategy: 'day',
      userId: 'test-user'
    };
    
    console.log(`Testing with: ${JSON.stringify(testInput)}`);
    
    // This will likely fail due to API keys, but we can see if the structure works
    const result = await orchestrator.runStrategyAwareAnalysis(testInput);
    
    console.log('\n✅ ANALYSIS COMPLETED');
    console.log('===================');
    console.log(`Strategy: ${result.strategy}`);
    console.log(`Prediction: ${result.prediction}`);
    console.log(`Confidence: ${result.confidence}%`);
    console.log(`Time Horizon: ${result.timeHorizon}`);
    
    // Check agent contributions
    if (result.agentContributions) {
      console.log('\n🤖 AGENT CONTRIBUTIONS:');
      Object.keys(result.agentContributions).forEach(agent => {
        const contrib = result.agentContributions[agent];
        console.log(`- ${agent}: ${contrib.signal} (${contrib.confidence}% confidence, ${contrib.strategyRelevance}% relevance)`);
      });
    }
    
    console.log('\n🎉 DIRECT TEST PASSED - Strategy-aware system is working!');
    
  } catch (error) {
    console.error('\n❌ DIRECT TEST FAILED:', error.message);
    
    if (error.message.includes('PERPLEXITY_API_KEY')) {
      console.log('\n💡 This is expected - we need API keys for full testing');
      console.log('🎯 But the structure and imports are working correctly');
    } else if (error.message.includes('not found')) {
      console.log('\n💡 Build the project first: npm run build');
    } else {
      console.error('Full error:', error);
    }
  }
}

testStrategyDirectly();