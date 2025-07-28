import 'dotenv/config';
import { AgentOrchestrator } from './src/lib/agents/agent-orchestrator';

async function testGoldStandard() {
  console.log('🧪 Testing Gold Standard Signal Validation System\n');
  
  const orchestrator = new AgentOrchestrator();
  
  // Test with different symbols
  const testSymbols = ['BHP.AX', 'BTC-USD', 'ETH-USD'];
  
  for (const symbol of testSymbols) {
    console.log(`\n📊 Testing ${symbol}...`);
    console.log('='.repeat(50));
    
    try {
      const startTime = Date.now();
      const result = await orchestrator.runMultiAgentAnalysis(symbol);
      const processingTime = Date.now() - startTime;
      
      // Final prediction
      const prediction = result.finalPrediction;
      console.log(`✅ Processing completed in ${processingTime}ms`);
      console.log(`🎯 Final Prediction: ${prediction.direction} (${prediction.confidence}% confidence)`);
      console.log(`📈 Timeframes:`, prediction.timeframes);
      
      // Quality metrics
      const quality = result.metadata.overallQuality;
      console.log('\n🔍 Quality Metrics:');
      console.log(`   Overall Quality: ${quality.overallQuality}/100`);
      console.log(`   Data Freshness: ${quality.dataFreshness}/100`);
      console.log(`   Source Reliability: ${quality.sourceReliability}/100`);
      console.log(`   Cross Verification: ${quality.crossVerification}/100`);
      if (quality.warnings.length > 0) {
        console.log(`   ⚠️  Warnings: ${quality.warnings.join(', ')}`);
      }
      
      // Validation results
      const validation = result.metadata.validationSummary;
      console.log('\n✅ Validation Results:');
      console.log(`   Passed: ${validation.passedChecks}/${validation.totalChecks} checks`);
      console.log(`   Overall Score: ${validation.overallScore}/100`);
      if (validation.criticalFailures > 0) {
        console.log('   ❌ Validation failed - critical failures present.');
      }
      
      // Reliability metrics
      const reliability = result.metadata.reliabilityMetrics;
      console.log('\n🛡️  Reliability Metrics:');
      console.log(`   Historical Accuracy: ${reliability.averageAgentAccuracy}%`);
      console.log(`   Data Source Health: ${reliability.dataSourceHealth}%`);
      console.log(`   Signal Strength: ${reliability.signalConsistency}%`);
      
      // Data sources
      const transparency = result.metadata.transparency;
      console.log('\n📡 Data Sources:');
      transparency.dataSources.forEach((source: any) => {
        console.log(`   • ${source.name} (Reliability: ${source.reliability}, Contribution: ${source.contribution})`);
      });
      
      // Agent results summary
      console.log('\n🤖 Agent Results Summary:');
      Object.entries(result.agents).forEach(([agentName, agentResult]: [string, any]) => {
        const status = agentResult.confidence > 0 ? '✅' : '❌';
        const confidence = agentResult.confidence || 0;
        const hasRapidAPI = agentResult.sources?.includes('rapidapi_yahoo') ? ' (RapidAPI)' : '';
        console.log(`   ${status} ${agentName}: ${confidence}% confidence${hasRapidAPI}`);
      });
      
    } catch (error: any) {
      console.error(`❌ Error testing ${symbol}:`, error.message);
    }
  }
  
  console.log('\n🎉 Gold Standard Test Complete!');
}

testGoldStandard().catch(console.error); 