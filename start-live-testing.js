import dotenv from 'dotenv/config';

async function startLiveTesting() {
  console.log('🚀 Starting Live Performance Testing\n');

  const testSymbols = [
    'BTC-USD', // Crypto - high volatility, good for testing
    'CBA.AX'   // Australian banking - stable, good for testing
  ];

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  try {
    // Start live tracking
    console.log('📊 Starting live tracking...');
    const startResponse = await fetch(`${baseUrl}/api/live-tracking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'start',
        symbols: testSymbols,
        intervalMinutes: 60 // Check every hour
      })
    });

    const startResult = await startResponse.json();
    
    if (startResult.success) {
      console.log('✅ Live tracking started successfully!');
      console.log(`📈 Tracking ${testSymbols.length} symbols: ${testSymbols.join(', ')}`);
      console.log(`⏰ Interval: ${startResult.intervalMinutes} minutes`);
      
      console.log('\n📊 Live tracking will now:');
      console.log('   - Make predictions every hour');
      console.log('   - Validate predictions after 24 hours');
      console.log('   - Generate performance reports');
      console.log('   - Track accuracy and confidence correlation');
      
      console.log('\n🎯 To monitor progress:');
      console.log(`   GET ${baseUrl}/api/live-tracking`);
      console.log('   This will show current status and metrics');
      
      console.log('\n🛑 To stop tracking:');
      console.log(`   POST ${baseUrl}/api/live-tracking with {"action": "stop"}`);
      
      console.log('\n📈 Expected timeline:');
      console.log('   - First predictions: Immediate');
      console.log('   - First validations: 24 hours');
      console.log('   - Meaningful data: 1 week');
      console.log('   - Statistical significance: 1 month');
      
      console.log('\n💡 Next steps:');
      console.log('   1. Let the system run for 24-48 hours');
      console.log('   2. Check metrics via API endpoint');
      console.log('   3. Analyze confidence vs accuracy correlation');
      console.log('   4. Identify best performing agents');
      console.log('   5. Adjust model parameters based on results');
      
    } else {
      console.error('❌ Failed to start live tracking:', startResult.message);
    }

  } catch (error) {
    console.error('❌ Error starting live testing:', error.message);
    console.log('\n💡 Make sure your Next.js server is running:');
    console.log('   npm run dev');
  }
}

startLiveTesting().catch(console.error); 