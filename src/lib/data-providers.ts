import { CentralizedDataProvider } from './centralized-data-provider';

export async function getMarketData(symbol: string) {
  try {
    const comprehensiveData = await CentralizedDataProvider.getComprehensiveData(symbol);
    return comprehensiveData.marketData;
  } catch (error) {
    console.error('Error fetching market data:', error);
    return null;
  }
}

export async function getTechnicalData(symbol: string) {
  try {
    const comprehensiveData = await CentralizedDataProvider.getComprehensiveData(symbol);
    return comprehensiveData.technicalData || null;
  } catch (error) {
    console.error('Error fetching technical data:', error);
    return null;
  }
}

export async function getNewsData(symbol: string) {
  try {
    const comprehensiveData = await CentralizedDataProvider.getComprehensiveData(symbol);
    return comprehensiveData.newsData || null;
  } catch (error) {
    console.error('Error fetching news data:', error);
    return null;
  }
}

export async function getCryptoData(symbol: string) {
  try {
    const comprehensiveData = await CentralizedDataProvider.getComprehensiveData(symbol);
    return comprehensiveData.cryptoData || null;
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    return null;
  }
} 