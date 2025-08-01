/**
 * 🔍 TEST IMPROVED SIGNAL EXTRACTION
 * Test the new intelligent signal extraction from real Perplexity responses
 */

const testSignalExtraction = async () => {
  console.log('🔍 Testing Improved Signal Extraction...\n');

  try {
    const response = await fetch('http://localhost:3000/api/strategy-aware-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        symbol: 'AAPL',
        strategy: 'day',
        predictionDate: new Date().toISOString().split('T')[0]
      }),
    });

    const data = await response.json();
    
    if (data.success && data.analysis) {
      console.log('🎯 IMPROVED SIGNAL EXTRACTION TEST:');
      
      const weights = data.analysis.strategyAnalysis?.agentWeights;
      if (weights) {
        console.log('\n📊 Agent Signals (should now show real signals):');
        console.log(`   📈 Technical: ${weights.technical?.signal} (${weights.technical?.confidence}% confidence, ${weights.technical?.strategyRelevance}% relevance)`);
        console.log(`   🏛️ Fundamental: ${weights.fundamental?.signal} (${weights.fundamental?.confidence}% confidence, ${weights.fundamental?.strategyRelevance}% relevance)`);
        console.log(`   📰 News: ${weights.newsSentiment?.signal} (${weights.newsSentiment?.confidence}% confidence, ${weights.newsSentiment?.strategyRelevance}% relevance)`);
        console.log(`   🏗️ Structure: ${weights.marketStructure?.signal} (${weights.marketStructure?.confidence}% confidence, ${weights.marketStructure?.strategyRelevance}% relevance)`);
      }
      
      console.log('\n🎯 Final Synthesis:');
      console.log(`   Direction: ${data.analysis.finalVerdict.direction}`);
      console.log(`   Confidence: ${data.analysis.finalVerdict.confidence}%`);
      console.log(`   Processing Time: ${data.analysis.totalProcessingTime}ms`);
      
      // Count non-neutral signals
      const signals = [
        weights?.technical?.signal,
        weights?.fundamental?.signal,
        weights?.newsSentiment?.signal,
        weights?.marketStructure?.signal
      ];
      const nonNeutralCount = signals.filter(s => s && s !== 'NEUTRAL').length;
      
      console.log(`\n✅ Success Metrics:`);
      console.log(`   Non-NEUTRAL signals: ${nonNeutralCount}/4 agents`);
      console.log(`   Expected: At least 1-2 agents should have BULLISH/BEARISH signals`);
      
      if (nonNeutralCount === 0) {
        console.log(`\n❌ ISSUE: All agents still returning NEUTRAL`);
        console.log(`   Check server logs for signal extraction debug info`);
      } else {
        console.log(`\n🎉 SUCCESS: Agents now returning real signals!`);
      }
      
    } else {
      console.log('❌ Failed to get analysis data');
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
};

testSignalExtraction().catch(console.error);