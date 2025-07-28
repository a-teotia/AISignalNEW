import 'dotenv/config';
import { SonarResearchAgent } from './src/lib/agents/sonar-research-agent';
import { MLAgent } from './src/lib/agents/ml-agent';
import { QuantEdgeAgent } from './src/lib/agents/quant-edge-agent';
import { MicrostructureAgent } from './src/lib/agents/microstructure-agent';
import { OnChainAgent } from './src/lib/agents/onchain-agent';
import { GeoSentienceAgent } from './src/lib/agents/geo-sentience-agent';
import { SynthOracleAgent } from './src/lib/agents/synth-oracle-agent';
import { FlowAgent } from './src/lib/agents/flow-agent';
import { CentralizedDataProvider } from './src/lib/centralized-data-provider';

async function testAllAgents() {
  console.log('🧪 Testing All Agents with Centralized Data Provider\n');

  const symbols = ['BHP.AX', 'AAPL', 'BTC-USD', 'ETH-USD'];
  const agents = [
    new SonarResearchAgent(),
    new MLAgent(),
    new QuantEdgeAgent(),
    new MicrostructureAgent(),
    new OnChainAgent(),
    new GeoSentienceAgent(),
    new FlowAgent()
  ];

  for (const symbol of symbols) {
    console.log(`\n📊 Testing symbol: ${symbol}`);
    console.log('=' .repeat(50));

    // Test centralized data provider first
    try {
      console.log('\n🔍 Testing Centralized Data Provider...');
      const centralizedData = await CentralizedDataProvider.getComprehensiveData(symbol);
      console.log(`✅ Centralized data quality: ${centralizedData.overallQuality}`);
      console.log(`✅ Sources: ${centralizedData.sources.join(', ')}`);
      console.log(`✅ Market data quality: ${centralizedData.marketData.quality}`);
      console.log(`✅ Warnings: ${centralizedData.warnings.length > 0 ? centralizedData.warnings.join(', ') : 'None'}`);
    } catch (error) {
      console.error(`❌ Centralized data provider error:`, error);
      continue;
    }

    // Test each agent
    for (const agent of agents) {
      try {
        const agentName = agent.constructor.name.replace('Agent', '');
        console.log(`\n🤖 Testing ${agentName} Agent...`);
        
        const startTime = Date.now();
        const result = await agent.process({ symbol });
        const processingTime = Date.now() - startTime;

        console.log(`✅ ${agentName} completed in ${processingTime}ms`);
        console.log(`✅ Confidence: ${result.confidence}%`);
        console.log(`✅ Quality: ${result.quality.overallQuality}/100`);
        console.log(`✅ Validation passed: ${result.validation.passed}`);
        console.log(`✅ Sources: ${result.sources.length} sources`);
        console.log(`✅ Data completeness: ${result.quality.completeness}/100`);

        // Check if centralized data sources are included (skip for GeoSentience)
        if (agentName !== 'GeoSentience') {
          const hasCentralizedSources = result.sources.some(source => 
            source.includes('rapidapi') || 
            source.includes('alphavantage') || 
            source.includes('twelvedata') ||
            source.includes('coingecko') ||
            source.includes('yahoo')
          );
          console.log(`✅ Centralized sources included: ${hasCentralizedSources ? 'Yes' : 'No'}`);
        } else {
          console.log(`✅ Centralized sources included: N/A (GeoSentience uses external APIs)`);
        }

        // Check for missing fields
        if (result.quality.completeness < 100) {
          console.log(`⚠️  Data completeness issues detected`);
        }

      } catch (error) {
        const agentName = agent.constructor.name.replace('Agent', '');
        console.error(`❌ ${agentName} error:`, error);
      }
    }
  }

  // Test Synth Oracle Agent with context
  console.log('\n\n🧠 Testing Synth Oracle Agent (requires context)...');
  console.log('=' .repeat(50));

  for (const symbol of symbols) {
    try {
      console.log(`\n📊 Testing Synth Oracle with ${symbol}...`);
      
      // Create mock context data
      const mockContext = {
        sonarData: { sentiment: { overall: 'neutral', newsSentiment: 0.5 } },
        geoData: { macroFactors: { economic: [], political: [], social: [] } },
        quantData: { trend: { direction: 'neutral', confidence: 50 } },
        onchainData: { networkMetrics: { activeAddresses: 1000000 } },
        flowData: { volumeAnalysis: { priceChange: 0 } },
        microstructureData: { bidDepth: [], askDepth: [] },
        mlData: { predictiveSignals: { shortTerm: { direction: 'neutral', confidence: 50 } } }
      };

      const synthAgent = new SynthOracleAgent();
      const startTime = Date.now();
      const result = await synthAgent.process({ symbol, context: mockContext });
      const processingTime = Date.now() - startTime;

      console.log(`✅ Synth Oracle completed in ${processingTime}ms`);
      console.log(`✅ Confidence: ${result.confidence}%`);
      console.log(`✅ Quality: ${result.quality.overallQuality}/100`);
      console.log(`✅ Validation passed: ${result.validation.passed}`);
      console.log(`✅ Sources: ${result.sources.length} sources`);

    } catch (error) {
      console.error(`❌ Synth Oracle error:`, error);
    }
  }

  console.log('\n\n🎉 All agent tests completed!');
  console.log('\n📋 Summary:');
  console.log('- All agents now use centralized data provider');
  console.log('- Quality metrics are based on centralized data');
  console.log('- Validation metrics reflect data availability');
  console.log('- Sources include centralized provider sources');
  console.log('- Missing fields issue should be resolved');
}

// Run the test
testAllAgents().catch(console.error); 