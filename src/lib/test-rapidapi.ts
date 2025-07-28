import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '0136c92ffdmsh581cebdb6e939f0p1ac51cjsnecdd2de65819';

console.log('🔍 Testing RapidAPI Yahoo Finance...\n');

async function testRapidAPI() {
  console.log('📡 RapidAPI Configuration:');
  console.log(`   Key from env: ${process.env.RAPIDAPI_KEY ? '✅ SET' : '❌ NOT SET'}`);
  console.log(`   Using key: ${RAPIDAPI_KEY.substring(0, 10)}...`);
  console.log(`   Key length: ${RAPIDAPI_KEY.length} characters\n`);

  // Test with different symbols
  const testSymbols = ['AAPL', 'BTC-USD', 'TSLA', 'MSFT'];
  
  for (const symbol of testSymbols) {
    console.log(`🧪 Testing symbol: ${symbol}`);
    
    try {
      const response = await fetch(
        `https://yahoo-finance-real-time1.p.rapidapi.com/stock/get-options?symbol=${symbol}&lang=en-US&region=US`,
        {
          headers: {
            'x-rapidapi-host': 'yahoo-finance-real-time1.p.rapidapi.com',
            'x-rapidapi-key': RAPIDAPI_KEY
          }
        }
      );
      
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        console.log(`   ❌ Failed: ${response.status} ${response.statusText}`);
        continue;
      }
      
      const responseText = await response.text();
      
      // Check if response is HTML (error page)
      if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
        console.log(`   ❌ Returned HTML error page`);
        console.log(`   Response preview: ${responseText.substring(0, 100)}...`);
        continue;
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.log(`   ❌ Invalid JSON response`);
        console.log(`   Response preview: ${responseText.substring(0, 100)}...`);
        continue;
      }
      
      const quote = data?.optionChain?.result?.[0]?.quote;
      
      if (!quote || !quote.regularMarketPrice) {
        console.log(`   ❌ No quote data found`);
        console.log(`   Response structure: ${JSON.stringify(data, null, 2).substring(0, 200)}...`);
        continue;
      }

      console.log(`   ✅ SUCCESS!`);
      console.log(`   Price: $${quote.regularMarketPrice}`);
      console.log(`   Change: $${quote.regularMarketChange}`);
      console.log(`   Change %: ${quote.regularMarketChangePercent}%`);
      console.log(`   Volume: ${quote.regularMarketVolume}`);
      
    } catch (error) {
      console.log(`   ❌ Error: ${error}`);
    }
    
    console.log('');
  }
  
  // Test the data provider class
  console.log('🔧 Testing getMarketData function...');
  
  try {
    const { getMarketData } = await import('./data-providers');
    const data = await getMarketData('AAPL');
    
    if (data) {
      console.log(`   ✅ getMarketData result for AAPL:`);
      console.log(`   Price: $${data.price}`);
      console.log(`   Source: ${data.source}`);
      console.log(`   Change: $${data.change} (${data.changePercent}%)`);
    } else {
      console.log(`   ❌ No data returned for AAPL`);
    }
  } catch (error) {
    console.log(`   ❌ getMarketData error: ${error}`);
  }
}

testRapidAPI().catch(console.error); 