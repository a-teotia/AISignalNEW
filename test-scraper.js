// Test script for comprehensive data scraping
const { SimpleFinancialScraper } = require('./src/lib/scrapers/simple-scraper.ts');

async function testScraper() {
  console.log('🧪 Testing Comprehensive Data Scraper...\n');
  
  try {
    const scrapedData = await SimpleFinancialScraper.scrapeComprehensiveData('BHP.AX');
    
    console.log('✅ Scraping successful!');
    console.log(`Symbol: ${scrapedData.symbol}`);
    console.log(`Price: $${scrapedData.priceData.current.toFixed(2)}`);
    console.log(`Volume: ${scrapedData.priceData.volume.toLocaleString()}`);
    console.log(`RSI: ${scrapedData.technicalData.rsi.toFixed(1)}`);
    console.log(`News Sentiment: ${scrapedData.sentimentData.news[0].sentiment}`);
    console.log(`Geopolitical Event: ${scrapedData.geopoliticalData.events[0].event}`);
    console.log(`Macro Indicator: ${scrapedData.macroeconomicData.indicators[0].name}`);
    console.log(`Institutional Flow: ${scrapedData.institutionalData.flows[0].type}`);
    
    console.log('\n🎯 All data dimensions captured successfully!');
    
  } catch (error) {
    console.error('❌ Scraping failed:', error);
  }
}

testScraper(); 