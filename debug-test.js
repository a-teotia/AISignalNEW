/**
 * DEBUG: Detailed strategy API test to understand the response structure
 */

const testStrategyAPIDetailed = async () => {
  console.log('🔍 DETAILED STRATEGY API TEST\n');

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
      console.log('📊 STRATEGY ANALYSIS BREAKDOWN:');
      console.log('   Strategy Type:', data.analysis.strategyAnalysis?.strategy);
      console.log('');
      
      console.log('🎯 AGENT WEIGHTS (from API response):');
      const weights = data.analysis.strategyAnalysis?.agentWeights;
      if (weights) {
        console.log('   Technical:', weights.technical);
        console.log('   Fundamental:', weights.fundamental);
        console.log('   News Sentiment:', weights.newsSentiment);
        console.log('   Market Structure:', weights.marketStructure);
      }
      
      console.log('\n📈 FULL STRATEGY OUTPUT STRUCTURE:');
      console.log('   strategyOutput:', !!data.analysis.strategyOutput);
      
      if (data.analysis.strategyOutput) {
        console.log('   agentContributions:', data.analysis.strategyOutput.agentContributions);
      }
      
    } else {
      console.log('❌ Failed:', data);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
};

testStrategyAPIDetailed();