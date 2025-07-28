const { MicrostructureAgent } = require('./src/lib/agents/microstructure-agent.ts');

async function testMicrostructureAgent() {
  console.log('🧪 Testing MicrostructureAgent fixes...\n');
  
  const agent = new MicrostructureAgent();
  
  try {
    console.log('1. Testing with BTC-USD...');
    const result = await agent.process({ symbol: 'BTC-USD' });
    
    console.log('✅ Agent completed successfully');
    console.log(`   Confidence: ${result.confidence}%`);
    console.log(`   Quality: ${result.quality.overallQuality}/100`);
    console.log(`   Validation: ${result.validation.passed ? 'PASSED' : 'FAILED'} (${result.validation.score}/100)`);
    
    // Check order book data
    const orderBook = result.data.orderBook;
    console.log('\n📊 Order Book Data:');
    console.log(`   Bid Depth: ${orderBook.bidDepth.length} entries`);
    console.log(`   Ask Depth: ${orderBook.askDepth.length} entries`);
    console.log(`   Spread: ${orderBook.spread}`);
    console.log(`   Mid Price: ${orderBook.midPrice}`);
    
    if (orderBook.bidDepth.length > 0 && orderBook.askDepth.length > 0) {
      console.log('✅ Order book data is valid!');
    } else {
      console.log('❌ Order book data is still empty');
    }
    
    // Check liquidity metrics
    const liquidity = result.data.liquidityMetrics;
    console.log('\n💧 Liquidity Metrics:');
    console.log(`   Market Depth: ${liquidity.marketDepth}`);
    console.log(`   Net Flow: ${liquidity.orderFlow.netFlow}`);
    console.log(`   Large Orders: ${liquidity.orderFlow.largeOrders}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testMicrostructureAgent(); 