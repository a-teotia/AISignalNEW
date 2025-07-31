// Base service interfaces and types for the modular data provider architecture

export interface ServiceHealth {
  isHealthy: boolean;
  lastCheck: number;
  successRate: number;
  totalRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  lastError?: string;
}

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  quality: DataQuality;
  ttl: number;
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  queueLimit?: number;
}

export interface RateLimitStatus {
  remainingRequests: number;
  resetTime: number;
  queueLength: number;
  isLimited: boolean;
}

export type DataQuality = 'realtime' | 'cached' | 'stale_cache' | 'historical' | 'none' | 'premium';

export interface MarketDataSource {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  peRatio?: number;
  dividendYield?: number;
  timestamp: string;
  source: string;
  quality: DataQuality;
}

export interface TechnicalDataSource {
  symbol: string;
  rsi: number;
  macd: { value: number; signal: number; histogram: number };
  sma: { sma20: number; sma50: number; sma200: number };
  bollinger: { upper: number; middle: number; lower: number };
  timestamp: string;
  source: string;
  quality: DataQuality;
}

export interface NewsDataSource {
  symbol: string;
  articles: Array<{
    title: string;
    source: string;
    sentiment: 'bullish' | 'bearish' | 'neutral';
    impact: number;
    timestamp: string;
  }>;
  overallSentiment: 'bullish' | 'bearish' | 'neutral';
  sentimentScore: number;
  timestamp: string;
  source: string;
  quality: DataQuality;
}

export interface CryptoDataSource {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  networkMetrics?: {
    hashRate?: number;
    activeAddresses?: number;
    transactionCount?: number;
  };
  timestamp: string;
  source: string;
  quality: DataQuality;
}

export interface DataFetchResult<T> {
  data: T | null;
  success: boolean;
  source: string;
  quality: DataQuality;
  responseTime: number;
  error?: string;
}

export interface DataVerificationResult {
  verified: boolean;
  confidence: number;
  verificationScore: number;
  conflicts: string[];
  sources: string[];
}

export interface ComprehensiveDataResult {
  symbol: string;
  marketData: MarketDataSource;
  technicalData?: TechnicalDataSource;
  newsData?: NewsDataSource;
  cryptoData?: CryptoDataSource;
  timestamp: string;
  overallQuality: DataQuality;
  sources: string[];
  warnings: string[];
  verification?: DataVerificationResult;
}

// Service base interface
export interface BaseService {
  readonly serviceName: string;
  initialize(): Promise<void>;
  getHealth(): ServiceHealth;
  shutdown(): Promise<void>;
}

// Rate limiting service interface
export interface IRateLimitService extends BaseService {
  checkLimit(key: string, config?: RateLimitConfig): Promise<boolean>;
  executeWithLimit<T>(
    key: string,
    operation: () => Promise<T>,
    config?: RateLimitConfig
  ): Promise<T>;
  getStatus(key: string): RateLimitStatus;
  clearLimits(key?: string): void;
}

// Cache service interface
export interface ICacheService extends BaseService {
  get<T>(key: string): Promise<CacheEntry<T> | null>;
  set<T>(key: string, data: T, quality: DataQuality, ttlMs?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
  getStats(): Promise<{
    size: number;
    hitRate: number;
    missRate: number;
    totalRequests: number;
  }>;
}

// Data quality service interface
export interface IDataQualityService extends BaseService {
  assessQuality(data: any, source: string): DataQuality;
  validateData(data: any, schema: string): { valid: boolean; errors: string[] };
  combineQualities(qualities: DataQuality[]): DataQuality;
  createQualityReport(data: any): {
    score: number;
    issues: string[];
    recommendations: string[];
  };
}

// Yahoo Finance service interface
export interface IYahooFinanceService extends BaseService {
  getMarketData(symbol: string): Promise<DataFetchResult<MarketDataSource>>;
  getTechnicalData(symbol: string): Promise<DataFetchResult<TechnicalDataSource>>;
  getNewsData(symbol: string): Promise<DataFetchResult<NewsDataSource>>;
  getHistoricalData(symbol: string, range: string): Promise<DataFetchResult<any>>;
  getFundamentalData(symbol: string): Promise<DataFetchResult<any>>; // 🎯 NEW: Premium fundamental analysis
}

// Technical indicator service interface
export interface ITechnicalIndicatorService extends BaseService {
  calculateRSI(prices: number[], period?: number): number;
  calculateMACD(
    prices: number[],
    fastPeriod?: number,
    slowPeriod?: number,
    signalPeriod?: number
  ): { value: number; signal: number; histogram: number };
  calculateSMA(prices: number[], period: number): number;
  calculateEMA(prices: number[], period: number): number[];
  calculateBollingerBands(
    prices: number[],
    period?: number,
    standardDeviations?: number
  ): { upper: number; middle: number; lower: number };
  getTechnicalIndicators(
    symbol: string,
    historicalData: number[]
  ): Promise<TechnicalDataSource>;
}

// External API service base interface
export interface IExternalApiService extends BaseService {
  makeRequest<T>(
    url: string,
    options: RequestInit,
    timeout?: number
  ): Promise<DataFetchResult<T>>;
  getApiHealth(): ServiceHealth;
}

export interface ServiceRegistry {
  cacheService: ICacheService;
  rateLimitService: IRateLimitService;
  dataQualityService: IDataQualityService;
  yahooFinanceService: IYahooFinanceService;
  technicalIndicatorService: ITechnicalIndicatorService;
}

// Configuration interfaces
export interface ServiceConfig {
  cache: {
    defaultTtlMs: number;
    maxSize: number;
    cleanupIntervalMs: number;
  };
  rateLimit: {
    defaultConfig: RateLimitConfig;
    apiConfigs: Record<string, RateLimitConfig>;
  };
  apis: {
    rapidApiKey?: string;
    twelveDataKey?: string;
    timeouts: {
      default: number;
      yahooFinance: number;
      twelveData: number;
    };
  };
}

export const DEFAULT_SERVICE_CONFIG: ServiceConfig = {
  cache: {
    defaultTtlMs: 2 * 60 * 1000, // 2 minutes
    maxSize: 1000,
    cleanupIntervalMs: 5 * 60 * 1000 // 5 minutes
  },
  rateLimit: {
    defaultConfig: {
      maxRequests: 10,
      windowMs: 1000,
      queueLimit: 100
    },
    apiConfigs: {
      yahoo_finance: {
        maxRequests: 10,
        windowMs: 1000,
        queueLimit: 50
      },
      twelve_data: {
        maxRequests: 8,
        windowMs: 60 * 1000,
        queueLimit: 20
      }
    }
  },
  apis: {
    rapidApiKey: process.env.RAPIDAPI_KEY,
    twelveDataKey: process.env.TWELVEDATA_KEY || '3c7da267bcc24e8d8e2dfde0e257378b',
    timeouts: {
      default: 30000,
      yahooFinance: 15000,
      twelveData: 30000
    }
  }
};