const { logLargeObject, logAgentResult } = require('./src/lib/utils.ts');

// Test data
const testAgentResult = {
  agent: "TestAgent",
  symbol: "BTC-USD",
  timestamp: "2025-07-08T03:14:01.861Z",
  data: {
    direction: "UP",
    confidence: 75,
    prediction: {
      direction: "UP",
      confidence: 75,
      timeframes: {
        "1day": { dir: "UP", conf: 80 },
        "1week": { dir: "UP", conf: 70 },
        "1month": { dir: "NEUTRAL", conf: 60 }
      }
    }
  },
  confidence: 75,
  sources: ["https://test1.com", "https://test2.com"],
  processingTime: 1500,
  quality: {
    dataFreshness: 100,
    sourceReliability: 85,
    crossVerification: 90,
    anomalyScore: 95,
    completeness: 100,
    consistency: 100,
    overallQuality: 95,
    warnings: [],
    lastValidated: "2025-07-08T03:14:01.861Z"
  },
  validation: {
    passed: true,
    checks: [
      {
        name: "Data Completeness",
        passed: true,
        score: 100,
        details: "All required fields present",
        critical: true
      }
    ],
    score: 95
  },
  reliability: {
    historicalAccuracy: 85,
    dataSourceHealth: 90,
    signalStrength: 80
  }
};

console.log("🧪 Testing improved logging functions...\n");

// Test logAgentResult
console.log("1. Testing logAgentResult:");
logAgentResult("TestAgent", testAgentResult);

// Test logLargeObject
console.log("2. Testing logLargeObject:");
logLargeObject("Test Agent Result", testAgentResult);

console.log("✅ Logging tests completed!"); 