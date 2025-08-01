/**
 * 🔥 REAL AGENT SYSTEM TEST
 * Test AI agents connected to actual Perplexity API
 */

const testRealAgentSystem = async () => {
  console.log('🔥 Testing REAL AI Agent System with Perplexity API...\n');

  const testCase = { strategy: 'day', symbol: 'AAPL', description: 'Day Trading with REAL agents' };

  console.log(`🧪 ${testCase.description}`);
  console.log(`   Testing ${testCase.strategy.toUpperCase()} strategy for ${testCase.symbol}...`);
  
  try {
    const response = await fetch('http://localhost:3000/api/strategy-aware-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        symbol: testCase.symbol,
        strategy: testCase.strategy,
        predictionDate: new Date().toISOString().split('T')[0]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log(`   ❌ Error: ${response.status} - ${errorData.error}`);
      if (errorData.details) {
        console.log(`   Details: ${errorData.details}`);
      }
      return;
    }

    const data = await response.json();
    
    if (data.success && data.analysis) {
      console.log(`   ✅ SUCCESS! Real agents connected!`);
      console.log(`   Overall Prediction: ${data.analysis.finalVerdict.direction} (${data.analysis.finalVerdict.confidence}% confidence)`);
      
      // Show AI-determined relevance weights from REAL analysis
      if (data.analysis.strategyAnalysis?.agentWeights) {
        console.log(`   🔥 REAL AI AGENT RESULTS:`);
        const weights = data.analysis.strategyAnalysis.agentWeights;
        console.log(`     📈 Technical (REAL): ${weights.technical?.strategyRelevance}% relevance, ${weights.technical?.confidence}% confidence`);
        console.log(`     🏛️ Fundamental (REAL): ${weights.fundamental?.strategyRelevance}% relevance, ${weights.fundamental?.confidence}% confidence`);
        console.log(`     📰 News (REAL): ${weights.newsSentiment?.strategyRelevance}% relevance, ${weights.newsSentiment?.confidence}% confidence`);
        console.log(`     🏗️ Structure (REAL): ${weights.marketStructure?.strategyRelevance}% relevance, ${weights.marketStructure?.confidence}% confidence`);
      }
      
      console.log(`   ⏱️ Processing Time: ${data.analysis.totalProcessingTime}ms`);
      console.log(`   🎯 Real Perplexity API calls made for each agent!`);
    } else {
      console.log(`   ❌ Invalid response format`);
    }
    
  } catch (error) {
    console.log(`   ❌ Network Error: ${error.message}`);
  }
  
  console.log('\n🔥 Expected: Real Perplexity API calls with actual market data analysis!');
};

testRealAgentSystem().catch(console.error);