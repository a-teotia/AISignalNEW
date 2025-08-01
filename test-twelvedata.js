const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

const TWELVEDATA_KEY = process.env.TWELVEDATA_KEY || '3c7da267bcc24e8d8e2dfde0e257378b';

console.log('🔍 Testing TwelveData API...\n');

async function testTwelveDataAPI() {
  console.log('📡 TwelveData Configuration:');
  console.log(`   Key from env: ${process.env.TWELVEDATA_KEY ? '✅ SET' : '❌ NOT SET'}`);
  
  if (!TWELVEDATA_KEY) {
    console.log('   ❌ TWELVEDATA_KEY is required but not set in environment variables');
    return;
  }
  
  console.log(`   Using key: ${TWELVEDATA_KEY.substring(0, 10)}...`);
  console.log(`   Key length: ${TWELVEDATA_KEY.length} characters\n`);

  // Test different TwelveData endpoints
  const testCases = [
    {
      name: 'Basic Quote',
      url: `https://api.twelvedata.com/quote?symbol=AAPL&apikey=${TWELVEDATA_KEY}`
    },
    {
      name: 'RSI Indicator',
      url: `https://api.twelvedata.com/rsi?symbol=AAPL&interval=1day&time_period=14&apikey=${TWELVEDATA_KEY}`
    },
    {
      name: 'MACD Indicator',
      url: `https://api.twelvedata.com/macd?symbol=AAPL&interval=1day&fast_period=12&slow_period=26&signal_period=9&apikey=${TWELVEDATA_KEY}`
    },
    {
      name: 'Time Series',
      url: `https://api.twelvedata.com/time_series?symbol=AAPL&interval=1day&outputsize=5&apikey=${TWELVEDATA_KEY}`
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`🧪 Testing ${testCase.name}:`);
    
    try {
      const response = await fetch(testCase.url);
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        console.log(`   ❌ Failed: ${response.status} ${response.statusText}`);
        continue;
      }
      
      const data = await response.json();
      
      // Check for API errors
      if (data.status === 'error') {
        console.log(`   ❌ API Error: ${data.message}`);
        if (data.code) {
          console.log(`   Error Code: ${data.code}`);
        }
        continue;
      }
      
      if (data.code === 400 || data.code === 401 || data.code === 403) {
        console.log(`   ❌ Authentication/Permission Error: ${data.message}`);
        continue;
      }
      
      console.log(`   ✅ SUCCESS!`);
      
      // Log relevant data based on endpoint
      if (testCase.name === 'Basic Quote' && data.symbol) {
        console.log(`   Symbol: ${data.symbol}`);
        console.log(`   Price: $${data.close}`);
        console.log(`   Change: ${data.percent_change}%`);
      } else if (testCase.name === 'RSI Indicator' && data.values) {
        console.log(`   RSI Values: ${data.values.length} entries`);
        if (data.values[0]) {
          console.log(`   Latest RSI: ${data.values[0].rsi}`);
        }
      } else if (testCase.name === 'MACD Indicator' && data.values) {
        console.log(`   MACD Values: ${data.values.length} entries`);
        if (data.values[0]) {
          console.log(`   Latest MACD: ${data.values[0].macd}`);
        }
      } else if (testCase.name === 'Time Series' && data.values) {
        console.log(`   Time Series: ${data.values.length} entries`);
        if (data.values[0]) {
          console.log(`   Latest Close: $${data.values[0].close}`);
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Network Error: ${error.message}`);
    }
    
    console.log('');
  }
  
  // Test API limits
  console.log('📊 Testing API Rate Limits...');
  console.log('   Making 3 rapid requests to check rate limiting:');
  
  for (let i = 1; i <= 3; i++) {
    try {
      const start = Date.now();
      const response = await fetch(`https://api.twelvedata.com/quote?symbol=MSFT&apikey=${TWELVEDATA_KEY}`);
      const end = Date.now();
      
      console.log(`   Request ${i}: ${response.status} (${end - start}ms)`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.log(`   Error: ${errorData.message}`);
      }
    } catch (error) {
      console.log(`   Request ${i}: Network error - ${error.message}`);
    }
  }
}

testTwelveDataAPI().catch(console.error);