import 'dotenv/config';
import { CentralizedDataProvider } from './src/lib/centralized-data-provider';

async function testDataProvider() {
  console.log('🧪 Testing Centralized Data Provider\n');
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
      const data = await CentralizedDataProvider.getComprehensiveData(symbol);
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
  
  // Test API health
  console.log('\n\n🏥 API Health Report');
  console.log('='.repeat(60));
  
  const health = CentralizedDataProvider.getApiHealth();
  if (Object.keys(health).length === 0) {
    console.log('No API calls recorded yet. Run some tests first.');
  } else {
    Object.entries(health).forEach(([api, stats]) => {
      const status = stats.successRate > 80 ? '✅' : stats.successRate > 50 ? '🟡' : '❌';
      console.log(`${status} ${api}:`);
      console.log(`  Success Rate: ${stats.successRate.toFixed(1)}%`);
      console.log(`  Calls: ${stats.calls}`);
      console.log(`  Last Success: ${stats.lastSuccess ? new Date(stats.lastSuccess).toLocaleString() : 'Never'}`);
      console.log(`  Last Failure: ${stats.lastFailure ? new Date(stats.lastFailure).toLocaleString() : 'Never'}`);
      console.log('');
    });
  }
  
  // Test cache
  console.log('💾 Cache Statistics');
  console.log('='.repeat(60));
  
  const cacheStats = CentralizedDataProvider.getCacheStats();
  console.log(`Cache Size: ${cacheStats.size} entries`);
  if (cacheStats.entries.length > 0) {
    console.log(`Cached Symbols: ${cacheStats.entries.join(', ')}`);
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
    const data = await CentralizedDataProvider.getComprehensiveData(testSymbol);
    console.log(`✅ RapidAPI: ${data.marketData.source === 'rapidapi_yahoo' ? 'Working' : 'Not used'}`);
  } catch (error) {
    console.log('❌ RapidAPI: Failed');
  }
  
  // Test Alpha Vantage
  console.log('\n🔄 Testing Alpha Vantage...');
  try {
    const data = await CentralizedDataProvider.getComprehensiveData(testSymbol);
    console.log(`✅ Alpha Vantage: ${data.marketData.source === 'alpha_vantage' ? 'Working' : 'Not used'}`);
  } catch (error) {
    console.log('❌ Alpha Vantage: Failed');
  }
  
  // Test Twelve Data
  console.log('\n🔄 Testing Twelve Data...');
  try {
    const data = await CentralizedDataProvider.getComprehensiveData(testSymbol);
    console.log(`✅ Twelve Data: ${data.marketData.source === 'twelve_data' ? 'Working' : 'Not used'}`);
  } catch (error) {
    console.log('❌ Twelve Data: Failed');
  }
  
  // Test CoinGecko
  console.log('\n🔄 Testing CoinGecko...');
  try {
    const data = await CentralizedDataProvider.getComprehensiveData('BTC-USD');
    console.log(`✅ CoinGecko: ${data.marketData.source === 'coingecko' ? 'Working' : 'Not used'}`);
  } catch (error) {
    console.log('❌ CoinGecko: Failed');
  }
  
  // Test Scraper
  console.log('\n🔄 Testing Scraper...');
  try {
    const data = await CentralizedDataProvider.getComprehensiveData(testSymbol);
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