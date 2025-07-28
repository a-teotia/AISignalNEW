import { AgentOrchestrator } from './agents/agent-orchestrator';
import { SignalValidator } from './agents/signal-validator';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// 🏆 GOLD STANDARD: Data Quality Analysis Report
export async function generateDataQualityReport() {
  console.log('🔍 Generating Comprehensive Data Quality Report...\n');

  try {
    const orchestrator = new AgentOrchestrator();
    const result = await orchestrator.runMultiAgentAnalysis('BTC');
    
    console.log('📊 DATA QUALITY ANALYSIS REPORT');
    console.log('================================\n');

    // 1. Overall System Health
    console.log('🏥 SYSTEM HEALTH OVERVIEW:');
    console.log(`   Overall Quality Score: ${result.metadata.overallQuality.overallQuality}/100`);
    console.log(`   Validation Pass Rate: ${result.metadata.validationSummary.passedChecks}/${result.metadata.validationSummary.totalChecks} (${result.metadata.validationSummary.overallScore}%)`);
    console.log(`   Critical Failures: ${result.metadata.validationSummary.criticalFailures}`);
    console.log(`   Risk Level: ${result.finalPrediction.riskLevel}`);
    console.log('');

    // 2. Agent-by-Agent Analysis
    console.log('🤖 AGENT-BY-AGENT DATA QUALITY:');
    console.log('================================');
    
    Object.entries(result.agents).forEach(([agentName, agentResult]) => {
      console.log(`\n📋 ${agentName.toUpperCase()} AGENT:`);
      console.log(`   Quality Score: ${agentResult.quality.overallQuality}/100`);
      console.log(`   Validation: ${agentResult.validation.passed ? '✅ PASSED' : '❌ FAILED'} (${agentResult.validation.score}/100)`);
      console.log(`   Confidence: ${agentResult.confidence}%`);
      
      // Show missing data fields
      const missingFields = agentResult.validation.checks
        .filter(check => check.name === 'Data Completeness' && !check.passed)
        .map(check => check.details.replace('Missing fields: ', '').split(', '))
        .flat();
      
      if (missingFields.length > 0) {
        console.log(`   ❌ MISSING FIELDS: ${missingFields.join(', ')}`);
      }
      
      // Show warnings
      if (agentResult.quality.warnings.length > 0) {
        console.log(`   ⚠️  WARNINGS: ${agentResult.quality.warnings.join(', ')}`);
      }
      
      // Show data sources
      console.log(`   📡 DATA SOURCES: ${agentResult.sources.length > 0 ? agentResult.sources.join(', ') : 'None'}`);
    });

    // 3. Detailed Missing Data Analysis
    console.log('\n🔍 DETAILED MISSING DATA ANALYSIS:');
    console.log('===================================');
    
    const missingDataAnalysis = analyzeMissingData(result.agents);
    
    Object.entries(missingDataAnalysis).forEach(([agentName, analysis]) => {
      console.log(`\n📋 ${agentName.toUpperCase()}:`);
      console.log(`   Missing Fields: ${analysis.missingFields.join(', ') || 'None'}`);
      console.log(`   Root Cause: ${analysis.rootCause}`);
      console.log(`   Impact: ${analysis.impact}`);
      console.log(`   Solution: ${analysis.solution}`);
    });

    // 4. Data Source Reliability
    console.log('\n📡 DATA SOURCE RELIABILITY:');
    console.log('===========================');
    
    const sourceAnalysis = analyzeDataSources(result.agents);
    
    Object.entries(sourceAnalysis).forEach(([source, stats]) => {
      console.log(`\n🔗 ${source}:`);
      console.log(`   Usage Count: ${stats.usageCount}`);
      console.log(`   Reliability Score: ${stats.reliabilityScore}/100`);
      console.log(`   Status: ${stats.status}`);
      console.log(`   Issues: ${stats.issues.join(', ') || 'None'}`);
    });

    // 5. Recommendations
    console.log('\n💡 RECOMMENDATIONS TO IMPROVE DATA QUALITY:');
    console.log('===========================================');
    
    const recommendations = generateRecommendations(result);
    recommendations.forEach((rec, index) => {
      console.log(`\n${index + 1}. ${rec.priority} PRIORITY: ${rec.title}`);
      console.log(`   Issue: ${rec.issue}`);
      console.log(`   Solution: ${rec.solution}`);
      console.log(`   Expected Impact: ${rec.expectedImpact}`);
    });

    // 6. Quality Metrics Breakdown
    console.log('\n📈 QUALITY METRICS BREAKDOWN:');
    console.log('=============================');
    
    const qualityMetrics = result.metadata.overallQuality;
    console.log(`   Data Freshness: ${qualityMetrics.dataFreshness}/100`);
    console.log(`   Source Reliability: ${qualityMetrics.sourceReliability}/100`);
    console.log(`   Cross Verification: ${qualityMetrics.crossVerification}/100`);
    console.log(`   Anomaly Score: ${qualityMetrics.anomalyScore}/100`);
    console.log(`   Completeness: ${qualityMetrics.completeness}/100`);
    console.log(`   Consistency: ${qualityMetrics.consistency}/100`);

    console.log('\n✅ Data Quality Report Complete!');

  } catch (error) {
    console.error('❌ Error generating data quality report:', error);
  }
}

function analyzeMissingData(agents: Record<string, any>) {
  const analysis: Record<string, any> = {};
  
  Object.entries(agents).forEach(([agentName, agentResult]) => {
    const missingFields = agentResult.validation.checks
      .filter((check: any) => check.name === 'Data Completeness' && !check.passed)
      .map((check: any) => check.details.replace('Missing fields: ', '').split(', '))
      .flat();
    
    if (missingFields.length > 0) {
      analysis[agentName] = {
        missingFields,
        rootCause: determineRootCause(agentName, missingFields),
        impact: determineImpact(agentName, missingFields),
        solution: determineSolution(agentName, missingFields)
      };
    }
  });
  
  return analysis;
}

function determineRootCause(agentName: string, missingFields: string[]): string {
  const rootCauses: Record<string, string> = {
    'sonar': 'Perplexity API not configured or rate limited',
    'geo': 'Perplexity API not configured or rate limited',
    'onchain': 'Perplexity API not configured or rate limited',
    'flow': 'Perplexity API not configured or rate limited',
    'microstructure': 'Perplexity API not configured or rate limited',
    'synth': 'Missing required fields in synthesis data structure'
  };
  
  return rootCauses[agentName] || 'Unknown API configuration issue';
}

function determineImpact(agentName: string, missingFields: string[]): string {
  const impacts: Record<string, string> = {
    'sonar': 'Reduced sentiment analysis accuracy and confidence',
    'geo': 'Limited geopolitical and macroeconomic insights',
    'onchain': 'Missing institutional flow and whale activity data',
    'flow': 'Incomplete ETF and options flow analysis',
    'microstructure': 'Limited order book and liquidity analysis',
    'synth': 'Synthesis agent cannot generate complete predictions'
  };
  
  return impacts[agentName] || 'Reduced prediction accuracy and confidence';
}

function determineSolution(agentName: string, missingFields: string[]): string {
  const solutions: Record<string, string> = {
    'sonar': 'Configure Perplexity API key and implement fallback data sources',
    'geo': 'Configure Perplexity API key and add alternative news APIs',
    'onchain': 'Configure Perplexity API key and integrate blockchain APIs directly',
    'flow': 'Configure Perplexity API key and add ETF/options data providers',
    'microstructure': 'Configure Perplexity API key and integrate exchange APIs directly',
    'synth': 'Fix data structure validation and ensure all required fields are present'
  };
  
  return solutions[agentName] || 'Review API configuration and data validation';
}

function analyzeDataSources(agents: Record<string, any>) {
  const sourceStats: Record<string, any> = {};
  
  Object.values(agents).forEach((agentResult: any) => {
    agentResult.sources.forEach((source: string) => {
      if (!sourceStats[source]) {
        sourceStats[source] = {
          usageCount: 0,
          reliabilityScore: 0,
          status: 'Unknown',
          issues: []
        };
      }
      
      sourceStats[source].usageCount++;
      
      // Determine reliability based on agent quality
      if (agentResult.quality.sourceReliability > 0) {
        sourceStats[source].reliabilityScore = Math.max(
          sourceStats[source].reliabilityScore,
          agentResult.quality.sourceReliability
        );
      }
    });
  });
  
  // Analyze source status
  Object.entries(sourceStats).forEach(([source, stats]) => {
    if (stats.reliabilityScore === 0) {
      stats.status = '❌ Unreliable';
      stats.issues.push('API not responding or rate limited');
    } else if (stats.reliabilityScore < 50) {
      stats.status = '⚠️  Poor';
      stats.issues.push('Low reliability score');
    } else if (stats.reliabilityScore < 80) {
      stats.status = '🟡 Fair';
      stats.issues.push('Moderate reliability');
    } else {
      stats.status = '✅ Good';
    }
  });
  
  return sourceStats;
}

function generateRecommendations(result: any) {
  const recommendations = [];
  
  // Check for API configuration issues
  if (result.metadata.overallQuality.sourceReliability < 50) {
    recommendations.push({
      priority: 'HIGH',
      title: 'Fix API Configuration',
      issue: 'Multiple data sources are unreliable due to API configuration issues',
      solution: 'Configure Perplexity API key and add fallback data sources',
      expectedImpact: 'Improve source reliability from 0% to 80%+'
    });
  }
  
  // Check for missing data fields
  if (result.metadata.overallQuality.completeness < 90) {
    recommendations.push({
      priority: 'HIGH',
      title: 'Fix Missing Data Fields',
      issue: 'Critical data fields are missing from agent outputs',
      solution: 'Update agent data structures and validation rules',
      expectedImpact: 'Improve data completeness from 50% to 95%+'
    });
  }
  
  // Check for validation failures
  if (result.metadata.validationSummary.criticalFailures > 0) {
    recommendations.push({
      priority: 'CRITICAL',
      title: 'Fix Critical Validation Failures',
      issue: `${result.metadata.validationSummary.criticalFailures} critical validation checks are failing`,
      solution: 'Address data completeness and integrity issues immediately',
      expectedImpact: 'Ensure all predictions meet minimum quality standards'
    });
  }
  
  // Check for low confidence
  if (result.confidence < 60) {
    recommendations.push({
      priority: 'MEDIUM',
      title: 'Improve Signal Confidence',
      issue: 'Overall confidence is low due to data quality issues',
      solution: 'Improve data quality and add more reliable sources',
      expectedImpact: 'Increase confidence scores and user trust'
    });
  }
  
  return recommendations;
}

// Run the report if this file is executed directly
if (require.main === module) {
  generateDataQualityReport().catch(console.error);
} 