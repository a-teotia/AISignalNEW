// Direct test of agent orchestrator without auth
const { AgentOrchestrator } = require('./src/lib/agents/agent-orchestrator.ts');

const testDirectAgents = async () => {
  try {
    console.log('🧪 Testing agent orchestrator directly for AAPL...');
    
    const orchestrator = new AgentOrchestrator();
    console.log('✅ AgentOrchestrator created');
    
    const result = await orchestrator.runMultiAgentAnalysis('AAPL');
    console.log('✅ Multi-agent analysis completed');
    console.log('📊 Result structure:', {
      symbol: result.symbol,
      confidence: result.confidence,
      finalPrediction: result.finalPrediction,
      agentCount: Object.keys(result.agents).length,
      agents: Object.keys(result.agents)
    });
    
    console.log('🎯 Final Prediction:', result.finalPrediction);
    console.log('📈 Overall Confidence:', result.confidence + '%');
    console.log('🔍 Agent Results:');
    Object.entries(result.agents).forEach(([name, agent]) => {
      console.log(`  ${name}: ${agent.confidence}% confidence`);
    });
    
  } catch (error) {
    console.error('❌ Direct test failed:', error.message);
    console.error('Stack:', error.stack?.substring(0, 500));
  }
};

testDirectAgents();