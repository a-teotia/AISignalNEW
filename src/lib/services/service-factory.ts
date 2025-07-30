import { DataProviderOrchestrator } from './data-provider-orchestrator';
import { ServiceConfig, DEFAULT_SERVICE_CONFIG } from './types';

// Singleton instance
let orchestratorInstance: DataProviderOrchestrator | null = null;

/**
 * Factory function to create and initialize the DataProviderOrchestrator
 * Uses singleton pattern to ensure only one instance exists
 */
export async function createDataProviderOrchestrator(
  config?: Partial<ServiceConfig>
): Promise<DataProviderOrchestrator> {
  
  // Return existing instance if already created
  if (orchestratorInstance) {
    console.log('🔄 Returning existing DataProviderOrchestrator instance');
    return orchestratorInstance;
  }

  console.log('🏗️ Creating new DataProviderOrchestrator instance...');

  // Merge config with defaults
  const finalConfig = { ...DEFAULT_SERVICE_CONFIG, ...config };

  // Create and initialize the orchestrator
  orchestratorInstance = new DataProviderOrchestrator(finalConfig);
  await orchestratorInstance.initialize();

  // Set up cleanup on process exit
  const cleanup = async () => {
    if (orchestratorInstance) {
      console.log('🧹 Cleaning up DataProviderOrchestrator on process exit...');
      await orchestratorInstance.shutdown();
      orchestratorInstance = null;
    }
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('exit', cleanup);

  console.log('✅ DataProviderOrchestrator instance created and initialized');
  
  return orchestratorInstance;
}

/**
 * Get the current orchestrator instance (if it exists)
 */
export function getDataProviderOrchestrator(): DataProviderOrchestrator | null {
  return orchestratorInstance;
}

/**
 * Force reset the singleton instance (useful for testing)
 */
export async function resetDataProviderOrchestrator(): Promise<void> {
  if (orchestratorInstance) {
    await orchestratorInstance.shutdown();
    orchestratorInstance = null;
  }
}

/**
 * Check if the orchestrator is initialized and healthy
 */
export function isDataProviderHealthy(): boolean {
  if (!orchestratorInstance) return false;
  
  const health = orchestratorInstance.getServiceHealth();
  return Object.values(health).every(serviceHealth => serviceHealth.isHealthy);
}