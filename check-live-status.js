import dotenv from 'dotenv/config';

async function checkLiveStatus() {
  console.log('📊 Checking Live Performance Tracking Status\n');

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  try {
    const response = await fetch(`${baseUrl}/api/live-tracking`);
    const data = await response.json();

    if (data.success) {
      console.log('📈 Live Tracking Status:');
      console.log('='.repeat(50));
      console.log(`Active: ${data.isActive ? '✅ Yes' : '❌ No'}`);
      console.log(`Total Predictions: ${data.totalPredictions}`);
      
      if (data.metrics) {
        const metrics = data.metrics;
        console.log('\n📊 Performance Metrics:');
        console.log('-'.repeat(30));
        console.log(`Accuracy Rate: ${metrics.accuracyRate.toFixed(1)}%`);
        console.log(`Total Predictions: ${metrics.totalPredictions}`);
        console.log(`Accurate Predictions: ${metrics.accuratePredictions}`);
        console.log(`Average Confidence: ${metrics.averageConfidence.toFixed(1)}`);
        
        if (Object.keys(metrics.agentPerformance).length > 0) {
          console.log('\n🤖 Agent Performance:');
          console.log('-'.repeat(30));
          Object.entries(metrics.agentPerformance).forEach(([agent, perf]) => {
            console.log(`${agent}: ${perf.accuracy.toFixed(1)}% (${perf.accurate}/${perf.total})`);
          });
        }
      }

      if (data.recentPredictions && data.recentPredictions.length > 0) {
        console.log('\n🕒 Recent Predictions:');
        console.log('-'.repeat(30));
        data.recentPredictions.slice(-5).forEach(pred => {
          const date = new Date(pred.timestamp).toLocaleString();
          const confidence = pred.prediction.finalPrediction.confidence;
          const direction = pred.prediction.finalPrediction.direction;
          const riskLevel = pred.prediction.finalPrediction.riskLevel;
          
          console.log(`${date} | ${pred.symbol} | ${direction} | ${confidence}% | ${riskLevel}`);
        });
      }

      if (!data.isActive) {
        console.log('\n💡 To start live tracking:');
        console.log(`POST ${baseUrl}/api/live-tracking`);
        console.log('Body: {"action": "start", "symbols": ["AAPL", "BTC-USD"], "intervalMinutes": 60}');
      }

    } else {
      console.error('❌ Failed to get status:', data.message);
    }

  } catch (error) {
    console.error('❌ Error checking status:', error.message);
    console.log('\n💡 Make sure your Next.js server is running:');
    console.log('   npm run dev');
  }
}

checkLiveStatus().catch(console.error); 