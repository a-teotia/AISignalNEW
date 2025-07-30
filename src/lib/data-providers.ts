import { createDataProviderOrchestrator } from './services';

// Legacy data provider interface - updated to use new modular architecture
export async function getMarketData(symbol: string) {
  try {
    const orchestrator = await createDataProviderOrchestrator();
    return await orchestrator.getMarketData(symbol);
  } catch (error) {
    console.error('Error fetching market data:', error);
    return null;
  }
}

export async function getTechnicalData(symbol: string) {
  try {
    const orchestrator = await createDataProviderOrchestrator();
    return await orchestrator.getTechnicalData(symbol);
  } catch (error) {
    console.error('Error fetching technical data:', error);
    return null;
  }
}

export async function getNewsData(symbol: string) {
  try {
    const orchestrator = await createDataProviderOrchestrator();
    return await orchestrator.getNewsData(symbol);
  } catch (error) {
    console.error('Error fetching news data:', error);
    return null;
  }
}

export async function getCryptoData(symbol: string) {
  try {
    const orchestrator = await createDataProviderOrchestrator();
    return await orchestrator.getCryptoData(symbol);
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    return null;
  }
}

// New comprehensive data function using the modular architecture
export async function getComprehensiveData(symbol: string) {
  try {
    const orchestrator = await createDataProviderOrchestrator();
    return await orchestrator.getComprehensiveData(symbol);
  } catch (error) {
    console.error('Error fetching comprehensive data:', error);
    throw error;
  }
} 