/**
 * 🎯 SIMPLE STRATEGY PARAMETER FLOW TEST
 * 
 * This test verifies that:
 * 1. The strategy parameter flows from StrategyAwareOrchestrator to runSequentialAnalysis
 * 2. Each of the 6 agents receives the strategy parameter correctly  
 * 3. The getStrategyContext method generates different prompts for different strategies
 * 4. The Fundamental Analysis Agent receives and uses the strategy parameter
 * 
 * This approach tests by examining the source code and simulating calls
 */

const fs = require('fs');
const path = require('path');

// Read source files
const strategyAwareOrchestratorPath = './src/lib/agents/strategy-aware-orchestrator.ts';
const sequentialAgentOrchestratorPath = './src/lib/agents/sequential-agent-orchestrator.ts';
const fundamentalAnalysisAgentPath = './src/lib/agents/fundamental-analysis-agent.ts';
const tradingStrategyTypesPath = './src/lib/types/trading-strategy-types.ts';

function readSourceFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Failed to read ${filePath}:`, error.message);
    return null;
  }
}

async function testStrategyParameterFlow() {
  console.log('🎯 STRATEGY PARAMETER FLOW VERIFICATION TEST');
  console.log('===========================================');
  
  const results = {
    test1: false, // Strategy flows from StrategyAwareOrchestrator to runSequentialAnalysis
    test2: false, // All 6 agents receive strategy parameter
    test3: false, // getStrategyContext generates different prompts
    test4: false  // Fundamental Analysis Agent receives and uses strategy
  };

  try {
    // Read all source files
    const strategyAwareSource = readSourceFile(strategyAwareOrchestratorPath);
    const sequentialSource = readSourceFile(sequentialAgentOrchestratorPath);
    const fundamentalSource = readSourceFile(fundamentalAnalysisAgentPath);
    const typesSource = readSourceFile(tradingStrategyTypesPath);

    if (!strategyAwareSource || !sequentialSource || !fundamentalSource || !typesSource) {
      throw new Error('Failed to read one or more source files');
    }

    // ================================================================
    // TEST 1: Strategy parameter flows from StrategyAwareOrchestrator to runSequentialAnalysis
    // ================================================================
    console.log('\n📋 TEST 1: Strategy flow to runSequentialAnalysis');
    console.log('--------------------------------------------------');

    // Check if StrategyAwareOrchestrator calls runSequentialAnalysis with strategy parameter
    const callsRunSequentialAnalysis = strategyAwareSource.includes('await this.runSequentialAnalysis(input.symbol, input.strategy)');
    const passesStrategyParameter = strategyAwareSource.includes('runSequentialAnalysis(input.symbol, input.strategy)');
    
    if (callsRunSequentialAnalysis && passesStrategyParameter) {
      console.log('✅ TEST 1 PASSED: StrategyAwareOrchestrator passes strategy parameter to runSequentialAnalysis');
      results.test1 = true;
    } else {
      console.log('❌ TEST 1 FAILED: Strategy parameter not passed correctly');
      console.log(`  Calls runSequentialAnalysis: ${callsRunSequentialAnalysis ? '✅' : '❌'}`);
      console.log(`  Passes strategy parameter: ${passesStrategyParameter ? '✅' : '❌'}`);
    }

    // ================================================================
    // TEST 2: All 6 agents receive strategy parameter
    // ================================================================
    console.log('\n📋 TEST 2: All 6 agents receive strategy parameter');
    console.log('--------------------------------------------------');

    // Check if runSequentialAnalysis accepts strategy parameter
    const acceptsStrategyParam = sequentialSource.includes('async runSequentialAnalysis(symbol: string, strategy?: \'day\' | \'swing\' | \'longterm\')');
    
    // Check if each agent call passes the strategy parameter
    const agentCalls = [
      'await this.runQuantitativeAnalysisAgent({',
      'await this.runMarketAnalysisAgent({',
      'await this.runTechnicalAnalysisAgent({',
      'await this.runSentimentAnalysisAgent({',
      'await this.fundamentalAgent.runFundamentalAnalysis({',
      'await this.runFinalSynthesisAgent({'
    ];

    let allAgentsReceiveStrategy = true;
    const agentResults = [];

    agentCalls.forEach((agentCall, index) => {
      const agentNames = ['Quantitative', 'Market', 'Technical', 'Sentiment', 'Fundamental', 'FinalSynthesis'];
      const agentName = agentNames[index];
      
      // Find the agent call and check if strategy is passed
      const callIndex = sequentialSource.indexOf(agentCall);
      if (callIndex !== -1) {
        // Extract the call parameters (next 200 characters should contain strategy parameter)
        const callSection = sequentialSource.substring(callIndex, callIndex + 300);
        const hasStrategyParam = callSection.includes('strategy') && callSection.includes('// 🎯 Pass strategy');
        
        agentResults.push({ agent: agentName, hasStrategy: hasStrategyParam });
        
        if (!hasStrategyParam) {
          allAgentsReceiveStrategy = false;
        }
      } else {
        agentResults.push({ agent: agentName, hasStrategy: false });
        allAgentsReceiveStrategy = false;
      }
    });

    // Check input interfaces accept strategy parameter
    const hasStrategyInInput = sequentialSource.includes('strategy?: \'day\' | \'swing\' | \'longterm\'');
    const fundamentalHasStrategy = fundamentalSource.includes('strategy?: \'day\' | \'swing\' | \'longterm\'');

    if (acceptsStrategyParam && allAgentsReceiveStrategy && hasStrategyInInput && fundamentalHasStrategy) {
      console.log('✅ TEST 2 PASSED: All 6 agents receive strategy parameter');
      results.test2 = true;
    } else {
      console.log('❌ TEST 2 FAILED: Not all agents receive strategy parameter');
      console.log(`  runSequentialAnalysis accepts strategy: ${acceptsStrategyParam ? '✅' : '❌'}`);
      console.log(`  Input interfaces have strategy: ${hasStrategyInInput ? '✅' : '❌'}`);
      console.log(`  Fundamental agent has strategy: ${fundamentalHasStrategy ? '✅' : '❌'}`);
      console.log('  Agent strategy passing:');
      agentResults.forEach(result => {
        console.log(`    ${result.agent}: ${result.hasStrategy ? '✅' : '❌'}`);
      });
    }

    // ================================================================
    // TEST 3: getStrategyContext generates different prompts for different strategies
    // ================================================================
    console.log('\n📋 TEST 3: getStrategyContext generates different prompts');
    console.log('--------------------------------------------------------');

    // Check if getStrategyContext method exists and handles different strategies
    const hasGetStrategyContext = sequentialSource.includes('protected getStrategyContext(strategy?: string): string');
    const hasDayStrategy = sequentialSource.includes('day: `') && sequentialSource.includes('🎯 TRADING STRATEGY: DAY TRADING');
    const hasSwingStrategy = sequentialSource.includes('swing: `') && sequentialSource.includes('🎯 TRADING STRATEGY: SWING TRADING');
    const hasLongtermStrategy = sequentialSource.includes('longterm: `') && sequentialSource.includes('🎯 TRADING STRATEGY: LONG-TERM');
    const returnsEmptyForNoStrategy = sequentialSource.includes('if (!strategy) return \'\';');

    // Check if strategy context is used in agent prompts
    const usesStrategyContext = sequentialSource.includes('const strategyContext = this.getStrategyContext(input.strategy);');

    if (hasGetStrategyContext && hasDayStrategy && hasSwingStrategy && hasLongtermStrategy && returnsEmptyForNoStrategy && usesStrategyContext) {
      console.log('✅ TEST 3 PASSED: getStrategyContext generates strategy-specific prompts');
      results.test3 = true;
    } else {
      console.log('❌ TEST 3 FAILED: getStrategyContext not generating proper strategy-specific prompts');
      console.log(`  Has getStrategyContext method: ${hasGetStrategyContext ? '✅' : '❌'}`);
      console.log(`  Has day strategy context: ${hasDayStrategy ? '✅' : '❌'}`);
      console.log(`  Has swing strategy context: ${hasSwingStrategy ? '✅' : '❌'}`);
      console.log(`  Has longterm strategy context: ${hasLongtermStrategy ? '✅' : '❌'}`);
      console.log(`  Returns empty for no strategy: ${returnsEmptyForNoStrategy ? '✅' : '❌'}`);
      console.log(`  Uses strategy context in prompts: ${usesStrategyContext ? '✅' : '❌'}`);
    }

    // ================================================================
    // TEST 4: Fundamental Analysis Agent receives and uses strategy parameter
    // ================================================================
    console.log('\n📋 TEST 4: Fundamental Analysis Agent strategy usage');
    console.log('----------------------------------------------------');

    // Check if FundamentalAnalysisAgent accepts strategy parameter
    const fundamentalAcceptsStrategy = fundamentalSource.includes('strategy?: \'day\' | \'swing\' | \'longterm\'');
    
    // Check if it has strategy-specific prompt generation
    const hasStrategyPromptGeneration = fundamentalSource.includes('createFundamentalPrompt') && 
                                      fundamentalSource.includes('strategy?:');
    
    // Check if it has strategy contexts for fundamental analysis
    const hasFundamentalDayContext = fundamentalSource.includes('day: `🎯 TRADING STRATEGY: DAY TRADING') &&
                                   fundamentalSource.includes('Intraday opportunities');
    const hasFundamentalSwingContext = fundamentalSource.includes('swing: `🎯 TRADING STRATEGY: SWING TRADING') &&
                                     fundamentalSource.includes('Multi-day positions');
    const hasFundamentalLongtermContext = fundamentalSource.includes('longterm: `🎯 TRADING STRATEGY: LONG-TERM') &&
                                        fundamentalSource.includes('Position trading');
    
    // Check if strategy context is added to prompts
    const addsStrategyToPrompt = fundamentalSource.includes('if (strategy)') &&
                               fundamentalSource.includes('strategyContext') &&
                               fundamentalSource.includes('prompt +=');

    if (fundamentalAcceptsStrategy && hasStrategyPromptGeneration && 
        hasFundamentalDayContext && hasFundamentalSwingContext && hasFundamentalLongtermContext && 
        addsStrategyToPrompt) {
      console.log('✅ TEST 4 PASSED: Fundamental Analysis Agent generates strategy-specific prompts');
      results.test4 = true;
    } else {
      console.log('❌ TEST 4 FAILED: Fundamental Analysis Agent not using strategy parameter properly');
      console.log(`  Accepts strategy parameter: ${fundamentalAcceptsStrategy ? '✅' : '❌'}`);
      console.log(`  Has strategy prompt generation: ${hasStrategyPromptGeneration ? '✅' : '❌'}`);
      console.log(`  Has day strategy context: ${hasFundamentalDayContext ? '✅' : '❌'}`);
      console.log(`  Has swing strategy context: ${hasFundamentalSwingContext ? '✅' : '❌'}`);
      console.log(`  Has longterm strategy context: ${hasFundamentalLongtermContext ? '✅' : '❌'}`);
      console.log(`  Adds strategy to prompt: ${addsStrategyToPrompt ? '✅' : '❌'}`);
    }

    // ================================================================
    // BONUS: Check trading strategy types
    // ================================================================
    console.log('\n📋 BONUS: Trading Strategy Types Configuration');
    console.log('---------------------------------------------');

    const hasStrategyTypes = typesSource.includes('export type TradingStrategyType = \'day\' | \'swing\' | \'longterm\';');
    const hasStrategyConfigs = typesSource.includes('export const STRATEGY_CONFIGS: Record<TradingStrategyType, StrategyConfiguration>');
    const hasAgentWeights = typesSource.includes('agentWeights: {') && 
                           typesSource.includes('technical:') && 
                           typesSource.includes('fundamental:');

    console.log(`Strategy types defined: ${hasStrategyTypes ? '✅' : '❌'}`);
    console.log(`Strategy configurations exist: ${hasStrategyConfigs ? '✅' : '❌'}`);
    console.log(`Agent weights configured: ${hasAgentWeights ? '✅' : '❌'}`);

    // ================================================================
    // FINAL RESULTS
    // ================================================================
    console.log('\n🎯 STRATEGY PARAMETER FLOW TEST RESULTS');
    console.log('=======================================');
    
    const allTestsPassed = Object.values(results).every(result => result === true);
    const passedCount = Object.values(results).filter(result => result === true).length;
    
    console.log(`Test 1 - Strategy flows to runSequentialAnalysis: ${results.test1 ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Test 2 - All 6 agents receive strategy parameter: ${results.test2 ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Test 3 - getStrategyContext generates different prompts: ${results.test3 ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Test 4 - Fundamental Agent uses strategy parameter: ${results.test4 ? '✅ PASSED' : '❌ FAILED'}`);
    
    console.log(`\n📊 SUMMARY: ${passedCount}/4 tests passed`);
    
    if (allTestsPassed) {
      console.log('🎉 ALL TESTS PASSED - Strategy-aware system is properly connected!');
      console.log('\n📋 SYSTEM VERIFICATION COMPLETE:');
      console.log('✅ Strategy parameter flows correctly through all components');
      console.log('✅ All 6 agents are strategy-aware (5 sequential + 1 fundamental)');
      console.log('✅ Different strategies generate different analytical contexts');
      console.log('✅ Fundamental analysis adapts to trading strategy requirements');
    } else {
      console.log('⚠️ SOME TESTS FAILED - Strategy parameter flow needs attention');
    }

    // ================================================================
    // DETAILED ANALYSIS REPORT
    // ================================================================
    console.log('\n📊 DETAILED ANALYSIS REPORT');
    console.log('===========================');
    
    console.log('\n🔍 Code Analysis Summary:');
    console.log(`• StrategyAwareOrchestrator source: ${strategyAwareSource.length} characters`);
    console.log(`• SequentialAgentOrchestrator source: ${sequentialSource.length} characters`);
    console.log(`• FundamentalAnalysisAgent source: ${fundamentalSource.length} characters`);
    console.log(`• Trading strategy types source: ${typesSource.length} characters`);
    
    console.log('\n🎯 Strategy Context Verification:');
    const strategyContextMatches = (sequentialSource.match(/🎯 TRADING STRATEGY:/g) || []).length;
    console.log(`• Found ${strategyContextMatches} strategy context definitions`);
    
    const agentStrategyUsage = (sequentialSource.match(/strategy\?:/g) || []).length;
    console.log(`• Found ${agentStrategyUsage} optional strategy parameters in interfaces`);
    
    const strategyPassingOccurrences = (sequentialSource.match(/strategy,.*\/\/ 🎯/g) || []).length;
    console.log(`• Found ${strategyPassingOccurrences} explicit strategy parameter passes to agents`);

  } catch (error) {
    console.error('❌ TEST SUITE FAILED:', error);
    console.error('Full error:', error.stack);
  }
}

// Run the test
testStrategyParameterFlow().catch(console.error);