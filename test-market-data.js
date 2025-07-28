// Test script for market data provider
const { FinancialDataProvider } = require('./src/lib/data-providers.ts');

async function testMarketData() {
  console.log('🧪 Testing Real Market Data Provider...\n');
  
  const symbols = ['BHP.AX', 'AAPL', 'BTCUSD'];
  
  for (const symbol of symbols) {
    try {
      console.log(`📊 Testing ${symbol}...`);
      const data = await FinancialDataProvider.getMarketData(symbol);
      
      console.log(`✅ ${symbol}:`);
      console.log(`   Price: $${data.price}`);
      console.log(`   Change: ${data.change} (${data.changePercent}%)`);
      console.log(`   Volume: ${data.volume.toLocaleString()}`);
      console.log(`   Source: ${data.source}`);
      console.log(`   Timestamp: ${data.timestamp}\n`);
      
    } catch (error) {
      console.log(`❌ Error with ${symbol}:`, error.message);
    }
  }
}

testMarketData(); 