// Test AAPL multi-agent prediction
const testAAPlPrediction = async () => {
  try {
    console.log('🧪 Testing AAPL multi-agent prediction...');
    
    const response = await fetch('http://localhost:3000/api/multi-predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        symbol: 'AAPL',
        predictionDate: '2025-07-29',
        tradingStyle: 'swing'
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', response.status, errorText);
      return;
    }
    
    const result = await response.json();
    console.log('✅ Multi-agent result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testAAPlPrediction();