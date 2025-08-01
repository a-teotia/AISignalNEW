/**
 * 🧠 INTELLIGENT AGENT SYSTEM TEST
 * Test AI agents making their own relevance decisions
 */

const testIntelligentAgents = async () => {
  console.log('🧠 Testing INTELLIGENT AI Agent System...\n');

  const testCases = [
    { strategy: 'day', symbol: 'AAPL', description: 'Day Trading - AI should favor Technical & Structure' },
    { strategy: 'swing', symbol: 'TSLA', description: 'Swing Trading - AI should balance all agents' }, 
    { strategy: 'longterm', symbol: 'MSFT', description: 'Long-term - AI should favor Fundamental' }
  ];

  for (const testCase of testCases) {
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
        console.log(`   ❌ Error: ${response.status}`);
        continue;
      }

      const data = await response.json();
      
      if (data.success && data.analysis) {
        console.log(`   ✅ SUCCESS!`);
        console.log(`   Overall Prediction: ${data.analysis.finalVerdict.direction} (${data.analysis.finalVerdict.confidence}% confidence)`);
        
        // Show AI-determined relevance weights
        if (data.analysis.strategyAnalysis?.agentWeights) {
          console.log(`   🧠 AI-DETERMINED AGENT RELEVANCE:`);
          const weights = data.analysis.strategyAnalysis.agentWeights;
          console.log(`     📈 Technical: ${weights.technical?.strategyRelevance}% (confidence: ${weights.technical?.confidence}%)`);
          console.log(`     🏛️ Fundamental: ${weights.fundamental?.strategyRelevance}% (confidence: ${weights.fundamental?.confidence}%)`);
          console.log(`     📰 News: ${weights.newsSentiment?.strategyRelevance}% (confidence: ${weights.newsSentiment?.confidence}%)`);
          console.log(`     🏗️ Structure: ${weights.marketStructure?.strategyRelevance}% (confidence: ${weights.marketStructure?.confidence}%)`);
          
          // Calculate total relevance to show normalization
          const totalRelevance = 
            weights.technical?.strategyRelevance + 
            weights.fundamental?.strategyRelevance + 
            weights.newsSentiment?.strategyRelevance + 
            weights.marketStructure?.strategyRelevance;
          console.log(`   🎯 Total AI Relevance: ${totalRelevance}% (normalized to 100% in final decision)`);
        }
        
        console.log(`   ⏱️ Processing Time: ${data.analysis.totalProcessingTime}ms`);
      } else {
        console.log(`   ❌ Invalid response`);
      }
      
    } catch (error) {
      console.log(`   ❌ Network Error: ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log('🎯 EXPECTED INTELLIGENT BEHAVIOR:');
  console.log('   Day Trading: Technical & Structure should have highest relevance');
  console.log('   Swing Trading: All agents should have moderate, balanced relevance');
  console.log('   Long-term: Fundamental should dominate with highest relevance');
  console.log('   📊 Agents now decide their own relevance based on market conditions!');
};

testIntelligentAgents().catch(console.error);