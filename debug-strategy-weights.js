/**
 * DEBUG: Check strategy weight configurations
 */

// Import strategy configs
const { STRATEGY_CONFIGS } = require('./src/lib/types/trading-strategy-types.ts');

console.log('🎯 STRATEGY WEIGHT CONFIGURATIONS:\n');

Object.entries(STRATEGY_CONFIGS).forEach(([strategyType, config]) => {
  console.log(`📊 ${config.name.toUpperCase()} (${strategyType}):`);
  console.log(`   Technical: ${config.agentWeights.technical}%`);
  console.log(`   Fundamental: ${config.agentWeights.fundamental}%`);
  console.log(`   News Sentiment: ${config.agentWeights.newsSentiment}%`);
  console.log(`   Market Structure: ${config.agentWeights.marketStructure}%`);
  
  const total = Object.values(config.agentWeights).reduce((a, b) => a + b, 0);
  console.log(`   Total: ${total}% ${total === 100 ? '✅' : '❌'}\n`);
});