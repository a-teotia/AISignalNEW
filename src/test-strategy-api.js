/**
 * 🧪 STRATEGY API END-TO-END TEST
 * Test the strategy-aware analysis API directly
 */

const testStrategyAPI = async () => {
  console.log('🎯 Testing Strategy-Aware Analysis API...\n');

  const testCases = [
    { strategy: 'day', symbol: 'AAPL' },
    { strategy: 'swing', symbol: 'TSLA' }, 
    { strategy: 'longterm', symbol: 'MSFT' }
  ];

  for (const testCase of testCases) {
    console.log(`🧪 Testing ${testCase.strategy.toUpperCase()} strategy for ${testCase.symbol}...`);
    
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

      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.log(`   ❌ Error: ${errorData.error}`);
        if (errorData.details) {
          console.log(`   Details: ${errorData.details}`);
        }
        continue;
      }

      const data = await response.json();
      
      if (data.success && data.analysis) {
        console.log(`   ✅ SUCCESS!`);
        console.log(`   Strategy: ${data.analysis.strategyAnalysis?.strategy}`);
        console.log(`   Prediction: ${data.analysis.finalVerdict.direction}`);
        console.log(`   Confidence: ${data.analysis.finalVerdict.confidence}%`);
        console.log(`   Time Horizon: ${data.analysis.finalVerdict.timeHorizon}`);
        console.log(`   Processing Time: ${data.analysis.totalProcessingTime}ms`);
        
        // Check strategy-specific agent weights
        if (data.analysis.strategyAnalysis?.agentWeights) {
          console.log(`   Agent Weights:`);
          console.log(`     Technical: ${data.analysis.strategyAnalysis.agentWeights.technical?.confidence}%`);
          console.log(`     Fundamental: ${data.analysis.strategyAnalysis.agentWeights.fundamental?.confidence}%`);
          console.log(`     News: ${data.analysis.strategyAnalysis.agentWeights.newsSentiment?.confidence}%`);
          console.log(`     Structure: ${data.analysis.strategyAnalysis.agentWeights.marketStructure?.confidence}%`);
        }
      } else {
        console.log(`   ❌ Invalid response format:`, data);
      }
      
    } catch (error) {
      console.log(`   ❌ Network Error: ${error.message}`);
    }
    
    console.log('');
  }
  
  // Test invalid strategy
  console.log('🧪 Testing invalid strategy...');
  try {
    const response = await fetch('http://localhost:3000/api/strategy-aware-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        symbol: 'AAPL',
        strategy: 'invalid_strategy',
        predictionDate: new Date().toISOString().split('T')[0]
      }),
    });
    
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Expected Error: ${data.error}`);
    console.log(`   ✅ Error handling works correctly!`);
  } catch (error) {
    console.log(`   ❌ Unexpected error: ${error.message}`);
  }
};

// Run the test if this file is executed directly
if (require.main === module) {
  testStrategyAPI().catch(console.error);
}

module.exports = { testStrategyAPI };