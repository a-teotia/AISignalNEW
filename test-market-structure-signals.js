/**
 * 🧪 TEST: Market Structure Agent Signal Extraction
 * 
 * This test verifies that the Market Structure agent properly extracts
 * BULLISH/BEARISH signals from real market analysis data instead of
 * always returning NEUTRAL.
 */

const { StrategyAwareOrchestrator } = require('./src/lib/agents/strategy-aware-orchestrator');

async function testMarketStructureSignals() {
  console.log('🧪 Testing Market Structure Agent Signal Extraction...\n');
  
  const orchestrator = new StrategyAwareOrchestrator();
  
  // Test with AAPL for day trading strategy
  const symbol = 'AAPL';
  const strategy = 'day';
  
  try {
    console.log(`📊 Testing ${symbol} with ${strategy} trading strategy...`);
    console.log('=' .repeat(60));
    
    // Run the full analysis to see real signal extraction
    const result = await orchestrator.runAnalysis(symbol, strategy);
    
    console.log('\n🎯 FINAL RESULTS:');
    console.log('================');
    console.log(`Symbol: ${result.symbol}`);
    console.log(`Strategy: ${result.strategy}`);
    console.log(`Final Prediction: ${result.prediction}`);
    console.log(`Final Confidence: ${result.confidence}%`);
    console.log(`Time Horizon: ${result.timeHorizon}`);
    
    console.log('\n📈 AGENT BREAKDOWN:');
    console.log('===================');
    
    if (result.agentResults) {
      result.agentResults.forEach((agent, index) => {
        console.log(`${index + 1}. ${agent.agent}:`);
        console.log(`   Signal: ${agent.signal}`);
        console.log(`   Confidence: ${agent.confidence}%`);
        console.log(`   Relevance: ${agent.relevance}%`);
        console.log(`   Weight: ${agent.weight.toFixed(1)}`);
        console.log('');
      });
    }
    
    // Specific check for Market Structure agent
    const marketStructureResult = result.agentResults?.find(
      agent => agent.agent === 'Market Structure Analysis'
    );
    
    if (marketStructureResult) {
      console.log('🏗️ MARKET STRUCTURE AGENT CHECK:');
      console.log('=================================');
      console.log(`Signal: ${marketStructureResult.signal}`);
      console.log(`Is returning NEUTRAL? ${marketStructureResult.signal === 'NEUTRAL' ? '❌ YES (PROBLEM)' : '✅ NO (GOOD)'}`);
      
      if (marketStructureResult.signal === 'NEUTRAL') {
        console.log('\n⚠️ ISSUE: Market Structure agent still returning NEUTRAL');
        console.log('This will dominate the final decision due to high weight.');
      } else {
        console.log('\n✅ SUCCESS: Market Structure agent returning real signal');
      }
    }
    
    // Check if final decision makes sense
    console.log('\n🔍 DECISION LOGIC CHECK:');
    console.log('========================');
    
    const nonNeutralAgents = result.agentResults?.filter(
      agent => agent.signal !== 'NEUTRAL'
    ) || [];
    
    console.log(`Agents with non-NEUTRAL signals: ${nonNeutralAgents.length}/${result.agentResults?.length || 0}`);
    
    if (nonNeutralAgents.length > 0 && result.prediction === 'NEUTRAL') {
      console.log('⚠️ POTENTIAL ISSUE: Multiple agents have signals but final decision is NEUTRAL');
      console.log('This suggests the weighting logic might be dominated by a high-weight NEUTRAL agent.');
    }
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testMarketStructureSignals().then(() => {
  console.log('\n🏁 Test completed');
}).catch(console.error);