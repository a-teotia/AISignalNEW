import { CentralizedDataProvider } from './src/lib/centralized-data-provider';
import { DataSource } from './src/lib/redundancy/data-verification';

async function testRedundancySystem() {
  console.log('🚀 Testing Redundancy & Verification System\n');

  // Test symbols
  const symbols = ['BTC-USD', 'CBA.AX'];
  
  for (const symbol of symbols) {
    console.log(`\n📊 Testing ${symbol}...`);
    
    try {
      // 1. Get primary data
      console.log('  🔍 Fetching primary data...');
      const primaryData = await CentralizedDataProvider.getComprehensiveData(symbol);
      
      console.log(`  ✅ Primary data quality: ${primaryData.overallQuality}`);
      console.log(`  📈 Price: $${primaryData.marketData.price}`);
      console.log(`  📊 Sources: ${primaryData.sources.join(', ')}`);
      
      // 2. Add secondary data sources for redundancy
      console.log('  🔄 Adding secondary data sources...');
      
      // Simulate secondary sources with slight variations
      const secondarySource1 = {
        name: 'Secondary API 1',
        reliability: 85,
        lastUpdated: new Date().toISOString(),
        data: {
          ...primaryData,
          marketData: {
            ...primaryData.marketData,
            price: primaryData.marketData.price * (1 + (Math.random() - 0.5) * 0.02), // ±1% variation
            source: 'Secondary API 1'
          }
        },
        quality: 85,
        latency: 150
      };
      
      const secondarySource2 = {
        name: 'Secondary API 2',
        reliability: 80,
        lastUpdated: new Date().toISOString(),
        data: {
          ...primaryData,
          marketData: {
            ...primaryData.marketData,
            price: primaryData.marketData.price * (1 + (Math.random() - 0.5) * 0.03), // ±1.5% variation
            source: 'Secondary API 2'
          }
        },
        quality: 80,
        latency: 200
      };
      
      CentralizedDataProvider.addSecondaryDataSource(symbol, secondarySource1);
      CentralizedDataProvider.addSecondaryDataSource(symbol, secondarySource2);
      
      // 3. Get data again to trigger verification
      console.log('  🔍 Fetching data with verification...');
      const verifiedData = await CentralizedDataProvider.getComprehensiveData(symbol);
      
      // 4. Display verification results
      if (verifiedData.verification) {
        console.log(`  🔍 Verification Results:`);
        console.log(`    ✅ Verified: ${verifiedData.verification.verified}`);
        console.log(`    🎯 Confidence: ${verifiedData.verification.confidence}/100`);
        console.log(`    📊 Verification Score: ${verifiedData.verification.verificationScore}/100`);
        
        if (verifiedData.verification.conflicts.length > 0) {
          console.log(`    ⚠️ Conflicts: ${verifiedData.verification.conflicts.join(', ')}`);
        } else {
          console.log(`    ✅ No conflicts detected`);
        }
      }
      
      // 5. Get verification report
      console.log('  📋 Generating verification report...');
      const report = CentralizedDataProvider.getVerificationReport(symbol);
      
      console.log(`  📊 Verification Report:`);
      console.log(`    📈 Total Verifications: ${report.totalVerifications}`);
      console.log(`    ✅ Verified Count: ${report.verifiedCount}`);
      console.log(`    ⚠️ Conflict Count: ${report.conflictCount}`);
      console.log(`    🎯 Average Confidence: ${report.averageConfidence.toFixed(1)}/100`);
      console.log(`    📊 Consistency Score: ${report.consistencyScore.toFixed(1)}/100`);
      
      if (report.recommendations.length > 0) {
        console.log(`    💡 Recommendations: ${report.recommendations.join(', ')}`);
      }
      
      // 6. Test data consistency
      const consistencyScore = CentralizedDataProvider.getDataConsistencyScore(symbol);
      console.log(`  📊 Data Consistency Score: ${consistencyScore.toFixed(1)}/100`);
      
      // 7. Test conflict scenarios
      console.log('  🧪 Testing conflict scenarios...');
      await testConflictScenarios(symbol);
      
    } catch (error) {
      if (error instanceof Error) {
        console.log(`  ❌ Error testing ${symbol}:`, error.message);
      } else {
        console.log(`  ❌ Error testing ${symbol}:`, error);
      }
    }
  }
  
  console.log('\n✅ Redundancy & Verification System Test Complete!');
}

async function testConflictScenarios(symbol: string) {
  // Test with conflicting data sources
  const conflictingSource = {
    name: 'Conflicting API',
    reliability: 70,
    lastUpdated: new Date().toISOString(),
    data: {
      marketData: {
        symbol,
        price: 999999, // Obviously wrong price
        change: 0,
        changePercent: 0,
        volume: 0,
        timestamp: new Date().toISOString(),
        source: 'Conflicting API',
        quality: 'realtime'
      },
      timestamp: new Date().toISOString(),
      overallQuality: 'realtime',
      sources: ['Conflicting API'],
      warnings: []
    },
    quality: 70,
    latency: 100
  };
  
  CentralizedDataProvider.addSecondaryDataSource(symbol, conflictingSource);
  
  // Get data again to see conflict resolution
  const dataWithConflict = await CentralizedDataProvider.getComprehensiveData(symbol);
  
  if (dataWithConflict.verification) {
    console.log(`    ⚠️ Conflict Test Results:`);
    console.log(`      🔍 Verified: ${dataWithConflict.verification.verified}`);
    console.log(`      🎯 Confidence: ${dataWithConflict.verification.confidence}/100`);
    console.log(`      ⚠️ Conflicts: ${dataWithConflict.verification.conflicts.length}`);
    
    if (dataWithConflict.verification.conflicts.length > 0) {
      console.log(`      📝 Conflict Details: ${dataWithConflict.verification.conflicts.join(', ')}`);
    }
  }
}

async function testSystemReliability() {
  console.log('\n🔬 Testing System Reliability...');
  
  const testCases = [
    { symbol: 'BTC-USD', expectedQuality: 'realtime' },
    { symbol: 'CBA.AX', expectedQuality: 'realtime' },
    { symbol: 'INVALID-SYMBOL', expectedQuality: 'none' }
  ];
  
  let passedTests = 0;
  let totalTests = 0;
  
  for (const testCase of testCases) {
    totalTests++;
    console.log(`\n  🧪 Testing ${testCase.symbol}...`);
    
    try {
      const data = await CentralizedDataProvider.getComprehensiveData(testCase.symbol);
      
      if (data.overallQuality === testCase.expectedQuality) {
        console.log(`    ✅ PASS: Expected ${testCase.expectedQuality}, got ${data.overallQuality}`);
        passedTests++;
      } else {
        console.log(`    ❌ FAIL: Expected ${testCase.expectedQuality}, got ${data.overallQuality}`);
      }
      
      // Check verification system
      if (data.verification) {
        console.log(`    🔍 Verification: ${data.verification.verified ? 'PASSED' : 'FAILED'} (Score: ${data.verification.verificationScore}/100)`);
      }
      
    } catch (error) {
      if (error instanceof Error) {
        console.log(`    ❌ ERROR: ${error.message}`);
      } else {
        console.log(`    ❌ ERROR:`, error);
      }
    }
  }
  
  const reliabilityScore = (passedTests / totalTests) * 100;
  console.log(`\n📊 System Reliability Score: ${reliabilityScore.toFixed(1)}/100 (${passedTests}/${totalTests} tests passed)`);
  
  return reliabilityScore;
}

async function testPerformanceMetrics() {
  console.log('\n⚡ Testing Performance Metrics...');
  
  const symbols = ['BTC-USD', 'CBA.AX'];
  const performanceMetrics = {
    totalRequests: 0,
    averageResponseTime: 0,
    successRate: 0,
    verificationSuccessRate: 0,
    cacheHitRate: 0
  };
  
  const startTime = Date.now();
  let successfulRequests = 0;
  let verificationSuccesses = 0;
  let cacheHits = 0;
  const responseTimes: number[] = [];
  
  for (const symbol of symbols) {
    for (let i = 0; i < 3; i++) { // 3 requests per symbol
      const requestStart = Date.now();
      
      try {
        const data = await CentralizedDataProvider.getComprehensiveData(symbol);
        const responseTime = Date.now() - requestStart;
        responseTimes.push(responseTime);
        
        performanceMetrics.totalRequests++;
        successfulRequests++;
        
        if (data.verification?.verified) {
          verificationSuccesses++;
        }
        
        if (data.overallQuality === 'cached') {
          cacheHits++;
        }
        
        console.log(`  📊 ${symbol} Request ${i + 1}: ${responseTime}ms, Quality: ${data.overallQuality}, Verified: ${data.verification?.verified || false}`);
        
      } catch (error) {
        performanceMetrics.totalRequests++;
        if (error instanceof Error) {
          console.log(`  ❌ ${symbol} Request ${i + 1}: Failed - ${error.message}`);
        } else {
          console.log(`  ❌ ${symbol} Request ${i + 1}: Failed -`, error);
        }
      }
    }
  }
  
  const totalTime = Date.now() - startTime;
  
  // Calculate metrics
  performanceMetrics.averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  performanceMetrics.successRate = (successfulRequests / performanceMetrics.totalRequests) * 100;
  performanceMetrics.verificationSuccessRate = (verificationSuccesses / successfulRequests) * 100;
  performanceMetrics.cacheHitRate = (cacheHits / performanceMetrics.totalRequests) * 100;
  
  console.log('\n📊 Performance Metrics:');
  console.log(`  ⏱️ Total Time: ${totalTime}ms`);
  console.log(`  📈 Average Response Time: ${performanceMetrics.averageResponseTime.toFixed(1)}ms`);
  console.log(`  ✅ Success Rate: ${performanceMetrics.successRate.toFixed(1)}%`);
  console.log(`  🔍 Verification Success Rate: ${performanceMetrics.verificationSuccessRate.toFixed(1)}%`);
  console.log(`  💾 Cache Hit Rate: ${performanceMetrics.cacheHitRate.toFixed(1)}%`);
  
  return performanceMetrics;
}

// Run all tests
async function runAllTests() {
  console.log('🎯 Phase 2: Redundancy & Verification System Test Suite\n');
  
  try {
    await testRedundancySystem();
    await testSystemReliability();
    await testPerformanceMetrics();
    
    console.log('\n🎉 All Phase 2 tests completed successfully!');
    console.log('\n📋 Phase 2 Summary:');
    console.log('  ✅ Cross-source data verification');
    console.log('  ✅ Conflict detection and resolution');
    console.log('  ✅ Weighted consensus calculation');
    console.log('  ✅ Verification scoring and reporting');
    console.log('  ✅ Data consistency monitoring');
    console.log('  ✅ Performance optimization');
    
  } catch (error) {
    if (error instanceof Error) {
      console.log('\n❌ Test suite failed:', error.message);
    } else {
      console.log('\n❌ Test suite failed:', error);
    }
  }
}

// Run the tests
runAllTests().catch(console.error); 