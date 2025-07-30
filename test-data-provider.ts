import 'dotenv/config';
import { createDataProviderOrchestrator } from './src/lib/services';

async function testDataProvider() {
  console.log('🧪 Testing Modular Data Provider\n');
  console.log('='.repeat(60));
  
  // Test symbols for different asset types
  const testSymbols = [
    'BHP.AX',    // ASX Stock
    'AAPL',      // US Stock
    'BTC-USD',   // Crypto
    'ETH-USD'    // Crypto
  ];
  
  console.log('📊 Testing Symbols:', testSymbols.join(', '));
  console.log('');
  
  for (const symbol of testSymbols) {
    console.log(`\n🔍 Testing ${symbol}...`);
    console.log('-'.repeat(40));
    
    try {
      const startTime = Date.now();
      const orchestrator = await createDataProviderOrchestrator();
      const data = await orchestrator.getComprehensiveData(symbol);
      const processingTime = Date.now() - startTime;
      
      console.log(`✅ Data fetched in ${processingTime}ms`);
      console.log(`📈 Quality: ${data.overallQuality}`);
      console.log(`💰 Price: $${data.marketData.price}`);
      console.log(`📊 Change: ${data.marketData.changePercent}%`);
      console.log(`📰 Sources: ${data.sources.join(', ')}`);
      
      if (data.warnings.length > 0) {
        console.log(`⚠️  Warnings: ${data.warnings.join(', ')}`);
      }
      
      // Show detailed breakdown
      console.log('\n📋 Data Breakdown:');
      console.log(`  Market Data: ${data.marketData.source} (${data.marketData.quality})`);
      if (data.technicalData) {
        console.log(`  Technical Data: ${data.technicalData.source} (${data.technicalData.quality})`);
        console.log(`    RSI: ${data.technicalData.rsi.toFixed(2)}`);
        console.log(`    MACD: ${data.technicalData.macd.value.toFixed(4)}`);
      }
      if (data.newsData) {
        console.log(`  News Data: ${data.newsData.source} (${data.newsData.quality})`);
        console.log(`    Articles: ${data.newsData.articles.length}`);
        console.log(`    Sentiment: ${data.newsData.overallSentiment} (${(data.newsData.sentimentScore * 100).toFixed(1)}%)`);
      }
      if (data.cryptoData) {
        console.log(`  Crypto Data: ${data.cryptoData.source} (${data.cryptoData.quality})`);
        console.log(`    Market Cap: $${(data.cryptoData.marketCap / 1e9).toFixed(2)}B`);
        if (data.cryptoData.networkMetrics) {
          console.log(`    Network Metrics: Available`);
        }
      }
      
    } catch (error) {
      console.error(`❌ Error testing ${symbol}:`, error instanceof Error ? error.message : 'Unknown error');
    }
  }
  
  // Test Service Health
  console.log('\n\n🏥 Service Health Report');
  console.log('='.repeat(60));
  
  try {
    const orchestrator = await createDataProviderOrchestrator();
    const health = orchestrator.getServiceHealth();
    
    Object.entries(health).forEach(([service, stats]) => {
      const status = stats.isHealthy ? '✅' : '❌';
      console.log(`${status} ${service}:`);
      console.log(`  Health: ${stats.isHealthy ? 'Healthy' : 'Unhealthy'}`);
      console.log(`  Success Rate: ${(stats.successRate * 100).toFixed(1)}%`);
      console.log(`  Total Requests: ${stats.totalRequests}`);
      console.log(`  Failed Requests: ${stats.failedRequests}`);
      console.log(`  Average Response Time: ${stats.averageResponseTime.toFixed(2)}ms`);
      if (stats.lastError) {
        console.log(`  Last Error: ${stats.lastError}`);
      }
      console.log('');
    });
    
    // Test cache statistics
    console.log('\n📊 Cache Statistics');
    console.log('-'.repeat(30));
    const cacheStats = await orchestrator.getCacheStats();
    console.log(`Cache Size: ${cacheStats.size} entries`);
    console.log(`Hit Rate: ${(cacheStats.hitRate * 100).toFixed(1)}%`);
    console.log(`Miss Rate: ${(cacheStats.missRate * 100).toFixed(1)}%`);
    console.log(`Total Requests: ${cacheStats.totalRequests}`);
    
    // Test rate limiting statistics
    console.log('\n⏱️ Rate Limiting Statistics');
    console.log('-'.repeat(30));
    const rateLimitStats = orchestrator.getRateLimitStatus();
    console.log(`Total Rate Limiters: ${rateLimitStats.totalLimiters}`);
    console.log(`Total Queued Requests: ${rateLimitStats.totalQueuedRequests}`);
    console.log(`Average Queue Length: ${rateLimitStats.averageQueueLength.toFixed(2)}`);
    console.log(`Limiters At Capacity: ${rateLimitStats.limitersAtCapacity}`);
    
  } catch (error) {
    console.error('❌ Failed to get service health:', error instanceof Error ? error.message : 'Unknown error');
  }
  
  console.log('\n🎉 Data Provider Test Complete!');
}

// Test individual APIs
async function testIndividualAPIs() {
  console.log('\n\n🔧 Testing Individual APIs');
  console.log('='.repeat(60));
  
  const testSymbol = 'BHP.AX';
  
  // Test RapidAPI
  console.log('\n🔄 Testing RapidAPI Yahoo Finance...');
  try {
    const { createDataProviderOrchestrator } = await import('./src/lib/services');
    const orchestrator = await createDataProviderOrchestrator();
    const data = await orchestrator.getComprehensiveData(testSymbol);
    console.log(`✅ RapidAPI: ${data.marketData.source === 'rapidapi_yahoo' ? 'Working' : 'Not used'}`);
  } catch (error) {
    console.log('❌ RapidAPI: Failed');
  }
  
  // Test Alpha Vantage
  console.log('\n🔄 Testing Alpha Vantage...');
  try {
    const { createDataProviderOrchestrator } = await import('./src/lib/services');
    const orchestrator = await createDataProviderOrchestrator();
    const data = await orchestrator.getComprehensiveData(testSymbol);
    console.log(`✅ Alpha Vantage: ${data.marketData.source === 'alpha_vantage' ? 'Working' : 'Not used'}`);
  } catch (error) {
    console.log('❌ Alpha Vantage: Failed');
  }
  
  // Test Twelve Data
  console.log('\n🔄 Testing Twelve Data...');
  try {
    const { createDataProviderOrchestrator } = await import('./src/lib/services');
    const orchestrator = await createDataProviderOrchestrator();
    const data = await orchestrator.getComprehensiveData(testSymbol);
    console.log(`✅ Twelve Data: ${data.marketData.source === 'twelve_data' ? 'Working' : 'Not used'}`);
  } catch (error) {
    console.log('❌ Twelve Data: Failed');
  }
  
  // Test CoinGecko
  console.log('\n🔄 Testing CoinGecko...');
  try {
    const { createDataProviderOrchestrator } = await import('./src/lib/services');
    const orchestrator = await createDataProviderOrchestrator();
    const data = await orchestrator.getComprehensiveData('BTC-USD');
    console.log(`✅ CoinGecko: ${data.marketData.source === 'coingecko' ? 'Working' : 'Not used'}`);
  } catch (error) {
    console.log('❌ CoinGecko: Failed');
  }
  
  // Test Scraper
  console.log('\n🔄 Testing Scraper...');
  try {
    const { createDataProviderOrchestrator } = await import('./src/lib/services');
    const orchestrator = await createDataProviderOrchestrator();
    const data = await orchestrator.getComprehensiveData(testSymbol);
    console.log(`✅ Scraper: ${data.marketData.source === 'scraper' ? 'Working' : 'Not used'}`);
  } catch (error) {
    console.log('❌ Scraper: Failed');
  }
}

// Run tests
async function runAllTests() {
  await testDataProvider();
  await testIndividualAPIs();
}

runAllTests().catch(console.error); 