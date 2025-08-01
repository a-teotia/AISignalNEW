/**
 * 🎯 END-TO-END TEST: Strategy-Aware Sequential Analysis
 * Tests the complete strategy-aware system with real API calls
 */

async function testStrategyAwareSystem() {
  console.log('🎯 STARTING END-TO-END STRATEGY-AWARE TEST');
  console.log('===============================================');
  
  const testSymbol = 'AAPL';
  const testStrategy = 'day'; // Test day trading strategy
  
  try {
    // Test the strategy-aware API endpoint
    console.log(`\n📡 Testing strategy-aware API: ${testSymbol} with ${testStrategy} strategy`);
    
    const response = await fetch('http://localhost:3000/api/strategy-aware-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        symbol: testSymbol,
        strategy: testStrategy,
        predictionDate: new Date().toISOString().split('T')[0]
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    console.log('\n✅ API RESPONSE RECEIVED');
    console.log('=========================');
    
    // Verify strategy awareness
    console.log(`\n🎯 STRATEGY VERIFICATION:`);
    console.log(`- Selected Strategy: ${result.strategy || 'NOT FOUND!'}`);
    console.log(`- Should be: ${testStrategy}`);
    console.log(`- Match: ${result.strategy === testStrategy ? '✅ YES' : '❌ NO'}`);
    
    // Verify analysis structure
    console.log(`\n📊 ANALYSIS STRUCTURE:`);
    console.log(`- Has analysis: ${result.analysis ? '✅ YES' : '❌ NO'}`);
    console.log(`- Has final verdict: ${result.analysis?.finalVerdict ? '✅ YES' : '❌ NO'}`);
    console.log(`- Has agent contributions: ${result.analysis?.agentContributions ? '✅ YES' : '❌ NO'}`);
    
    // Verify agent contributions
    if (result.analysis?.agentContributions) {
      console.log(`\n🤖 AGENT CONTRIBUTIONS:`);
      const agents = ['technical', 'fundamental', 'newsSentiment', 'marketStructure'];
      
      agents.forEach(agent => {
        const contribution = result.analysis.agentContributions[agent];
        if (contribution) {
          console.log(`- ${agent}:`);
          console.log(`  Signal: ${contribution.signal || 'NOT FOUND'}`);
          console.log(`  Confidence: ${contribution.confidence || 'NOT FOUND'}%`);
          console.log(`  Strategy Relevance: ${contribution.strategyRelevance || 'NOT FOUND'}%`);
          console.log(`  Decision Weight: ${contribution.decisionWeight || 'NOT FOUND'}%`);
        } else {
          console.log(`- ${agent}: ❌ MISSING`);
        }
      });
    }
    
    // Verify final decision
    if (result.analysis?.finalVerdict) {
      console.log(`\n🎯 FINAL DECISION:`);
      console.log(`- Direction: ${result.analysis.finalVerdict.direction}`);
      console.log(`- Confidence: ${result.analysis.finalVerdict.confidence}%`);
      console.log(`- Price Target: $${result.analysis.finalVerdict.priceTarget || 'N/A'}`);
      console.log(`- Risk Level: ${result.analysis.finalVerdict.risk}`);
      console.log(`- Time Horizon: ${result.analysis.finalVerdict.timeHorizon}`);
    }
    
    // Check for strategy-specific reasoning
    console.log(`\n💡 STRATEGY-SPECIFIC REASONING:`);
    const reasoning = result.analysis?.finalVerdict?.reasoning || '';
    const hasStrategyKeywords = reasoning.toLowerCase().includes('day') || 
                               reasoning.toLowerCase().includes('intraday') ||
                               reasoning.toLowerCase().includes('trading');
    console.log(`- Contains strategy-specific language: ${hasStrategyKeywords ? '✅ YES' : '❌ NO'}`);
    console.log(`- Reasoning preview: "${reasoning.substring(0, 100)}..."`);
    
    // Verify processing time
    console.log(`\n⏱️ PERFORMANCE:`);
    console.log(`- Total Processing Time: ${result.analysis?.totalProcessingTime || 'N/A'}ms`);
    
    // Check for citations
    console.log(`\n📚 CITATIONS:`);
    console.log(`- Number of sources: ${result.analysis?.citedSources?.length || 0}`);
    console.log(`- Has real sources: ${(result.analysis?.citedSources?.length || 0) > 0 ? '✅ YES' : '❌ NO'}`);
    
    console.log('\n🎯 TEST SUMMARY');
    console.log('===============');
    
    const checks = [
      { name: 'Strategy Parameter Passed', passed: result.strategy === testStrategy },
      { name: 'Analysis Structure Complete', passed: result.analysis && result.analysis.finalVerdict },
      { name: 'Agent Contributions Present', passed: result.analysis?.agentContributions },
      { name: 'Strategy-Specific Reasoning', passed: hasStrategyKeywords },
      { name: 'Real Citations Found', passed: (result.analysis?.citedSources?.length || 0) > 0 }
    ];
    
    checks.forEach(check => {
      console.log(`${check.passed ? '✅' : '❌'} ${check.name}`);
    });
    
    const passedChecks = checks.filter(c => c.passed).length;
    console.log(`\n📊 OVERALL RESULT: ${passedChecks}/${checks.length} checks passed`);
    
    if (passedChecks === checks.length) {
      console.log('🎉 ALL TESTS PASSED - Strategy-aware system is working correctly!');
    } else {
      console.log('⚠️ Some tests failed - Strategy-aware system needs fixes');
    }
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    console.error('Full error:', error);
  }
}

// Check if we're running in Node.js environment
if (typeof fetch === 'undefined') {
  console.log('❌ This test requires a fetch implementation or a running server');
  console.log('💡 Please start the development server first: npm run dev');
} else {
  testStrategyAwareSystem();
}