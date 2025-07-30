# Modular Data Provider Services

This directory contains the refactored, modular data provider architecture that replaces the monolithic `CentralizedDataProvider`. The new architecture follows the Single Responsibility Principle and provides better separation of concerns, testability, and maintainability.

## Architecture Overview

```
DataProviderOrchestrator
├── CacheService           # Intelligent caching with TTL and quality tracking
├── RateLimitService       # Advanced rate limiting with queuing
├── DataQualityService     # Data validation and quality assessment
├── YahooFinanceService    # Yahoo Finance API integration
└── TechnicalIndicatorService # Technical analysis calculations
```

## Key Features

### 🚀 **Performance Improvements**
- **Intelligent Caching**: Quality-aware caching with automatic degradation
- **Advanced Rate Limiting**: Per-service rate limiting with request queuing
- **Parallel Processing**: Concurrent data fetching from multiple sources
- **Memory Management**: Bounded caches with automatic cleanup

### 🔧 **Reliability Enhancements**
- **Service Health Monitoring**: Real-time health tracking for all services
- **Graceful Degradation**: Fallback strategies when services fail
- **Data Quality Assessment**: Comprehensive data validation and scoring
- **Error Recovery**: Automatic retry and fallback mechanisms

### 📊 **Observability**
- **Service Metrics**: Request counts, success rates, response times
- **Cache Analytics**: Hit rates, memory usage, cleanup statistics
- **Rate Limit Monitoring**: Queue lengths, wait times, throttling stats
- **Data Quality Reports**: Validation results, quality scores, recommendations

## Services Description

### CacheService
```typescript
// Intelligent caching with quality tracking
const cache = new CacheService(maxSize: 1000, defaultTtl: 120000);
await cache.set('key', data, 'realtime', customTtl);
const cached = await cache.get('key'); // Returns null if expired
```

**Features:**
- Quality-based TTL adjustment
- LRU eviction policy
- Automatic cleanup
- Hit/miss rate tracking
- Memory usage monitoring

### RateLimitService
```typescript
// Advanced rate limiting with queuing
const rateLimiter = new RateLimitService({
  maxRequests: 10,
  windowMs: 1000,
  queueLimit: 100
});

await rateLimiter.executeWithLimit('api_key', async () => {
  return await makeApiCall();
});
```

**Features:**
- Per-service rate limiting
- Request queuing with timeout
- Burst handling
- Queue monitoring
- Adaptive throttling

### DataQualityService
```typescript
// Comprehensive data validation
const qualityService = new DataQualityService();
const quality = qualityService.assessQuality(data, 'yahoo_finance');
const validation = qualityService.validateData(data, 'marketData');
```

**Features:**
- Multi-factor quality scoring
- Schema validation
- Data completeness checks
- Anomaly detection
- Quality reporting

### YahooFinanceService
```typescript
// Yahoo Finance API integration
const yahooService = new YahooFinanceService(apiKey, rateLimiter, cache);
const marketData = await yahooService.getMarketData('AAPL');
const technicalData = await yahooService.getTechnicalData('AAPL');
```

**Features:**
- Multiple endpoint fallbacks
- Automatic caching
- Rate limit compliance
- Error handling
- Data transformation

### TechnicalIndicatorService
```typescript
// Technical analysis calculations
const techService = new TechnicalIndicatorService(apiKey, rateLimiter, cache);
const rsi = techService.calculateRSI(prices, 14);
const macd = techService.calculateMACD(prices, 12, 26, 9);
const indicators = await techService.getTechnicalIndicators('AAPL', historicalPrices);
```

**Features:**
- Professional API integration (TwelveData)
- Manual calculation fallbacks
- Multiple technical indicators
- Historical data processing
- Validation and error handling

## Usage

### Basic Usage
```typescript
import { createDataProviderOrchestrator } from '@/lib/services';

// Initialize the orchestrator (singleton pattern)
const orchestrator = await createDataProviderOrchestrator({
  cache: {
    maxSize: 1000,
    defaultTtlMs: 120000
  },
  apis: {
    rapidApiKey: process.env.RAPIDAPI_KEY,
    twelveDataKey: process.env.TWELVEDATA_KEY
  }
});

// Get comprehensive data
const data = await orchestrator.getComprehensiveData('AAPL');
console.log(`Market data quality: ${data.overallQuality}`);
console.log(`Data sources: ${data.sources.join(', ')}`);
```

### Legacy Compatibility
```typescript
// The existing data-providers.ts functions still work
import { getMarketData, getTechnicalData } from '@/lib/data-providers';

const marketData = await getMarketData('AAPL');
const technicalData = await getTechnicalData('AAPL');
```

### Health Monitoring
```typescript
// Monitor service health
const health = orchestrator.getServiceHealth();
Object.entries(health).forEach(([service, status]) => {
  console.log(`${service}: ${status.isHealthy ? '✅' : '❌'} (${status.successRate * 100}%)`);
});

// Get cache statistics
const cacheStats = await orchestrator.getCacheStats();
console.log(`Cache hit rate: ${cacheStats.hitRate * 100}%`);

// Get rate limiting status
const rateLimitStats = orchestrator.getRateLimitStatus();
console.log(`Active rate limiters: ${rateLimitStats.totalLimiters}`);
```

## Configuration

### Environment Variables
```bash
# Required
RAPIDAPI_KEY=your_rapid_api_key_here
TWELVEDATA_KEY=your_twelve_data_key_here

# Optional - Services will work with fallbacks if not provided
PERPLEXITY_API_KEY=your_perplexity_key_here
OPENAI_API_KEY=your_openai_key_here
```

### Service Configuration
```typescript
const config = {
  cache: {
    defaultTtlMs: 2 * 60 * 1000,    // 2 minutes
    maxSize: 1000,                   // Max cache entries
    cleanupIntervalMs: 5 * 60 * 1000 // 5 minutes
  },
  rateLimit: {
    defaultConfig: {
      maxRequests: 10,
      windowMs: 1000,
      queueLimit: 100
    },
    apiConfigs: {
      yahoo_finance: { maxRequests: 10, windowMs: 1000 },
      twelve_data: { maxRequests: 8, windowMs: 60000 }
    }
  },
  apis: {
    timeouts: {
      default: 30000,
      yahooFinance: 15000,
      twelveData: 30000
    }
  }
};
```

## Benefits Over Previous Architecture

### 🎯 **Separation of Concerns**
- Each service has a single responsibility
- Clear interfaces and dependencies
- Easier to test and maintain
- Better error isolation

### 📈 **Performance**
- Reduced memory usage through intelligent caching
- Better rate limit handling with queuing
- Parallel processing where possible
- Optimized for high-throughput scenarios

### 🔧 **Reliability**
- Service-level health monitoring
- Graceful degradation strategies
- Better error handling and recovery
- Data quality assessment

### 🧪 **Testability**
- Mock individual services easily
- Test each service in isolation
- Better test coverage
- Easier debugging

### 📊 **Observability**
- Comprehensive metrics collection
- Service health dashboards
- Performance monitoring
- Quality reporting

## Migration Guide

### For Existing Code
The refactored architecture maintains backward compatibility. Existing code using `data-providers.ts` functions will continue to work without changes.

### For New Development
Use the orchestrator directly for better performance and observability:

```typescript
// Old way
import { CentralizedDataProvider } from '@/lib/centralized-data-provider';
const data = await CentralizedDataProvider.getComprehensiveData(symbol);

// New way
import { createDataProviderOrchestrator } from '@/lib/services';
const orchestrator = await createDataProviderOrchestrator();
const data = await orchestrator.getComprehensiveData(symbol);
```

## Testing

### Unit Testing
Each service can be tested in isolation:

```typescript
import { CacheService } from '@/lib/services';

describe('CacheService', () => {
  let cache: CacheService;
  
  beforeEach(() => {
    cache = new CacheService();
    await cache.initialize();
  });
  
  it('should cache data with TTL', async () => {
    await cache.set('test', { value: 42 }, 'realtime', 1000);
    const cached = await cache.get('test');
    expect(cached?.data.value).toBe(42);
  });
});
```

### Integration Testing
Test service orchestration:

```typescript
import { createDataProviderOrchestrator } from '@/lib/services';

describe('DataProviderOrchestrator', () => {
  it('should fetch comprehensive data', async () => {
    const orchestrator = await createDataProviderOrchestrator();
    const data = await orchestrator.getComprehensiveData('AAPL');
    
    expect(data.symbol).toBe('AAPL');
    expect(data.marketData).toBeDefined();
    expect(data.overallQuality).toMatch(/realtime|cached|historical/);
  });
});
```

## Maintenance

### Regular Tasks
1. **Monitor Service Health**: Set up alerts for service degradation
2. **Cache Cleanup**: Monitor cache hit rates and adjust TTL if needed
3. **Rate Limit Tuning**: Adjust rate limits based on API provider changes
4. **Quality Metrics**: Review data quality reports regularly

### Troubleshooting
- Check service health endpoints for status
- Review cache statistics for performance issues
- Monitor rate limiting queues for bottlenecks
- Analyze data quality reports for validation issues

## Future Enhancements

### Planned Features
- **Metrics Export**: Prometheus/OpenTelemetry integration
- **Circuit Breakers**: Automatic service isolation on failure
- **Data Streaming**: Real-time data updates via WebSockets
- **ML Quality Scoring**: AI-powered data quality assessment
- **Service Discovery**: Dynamic service registration and discovery

### API Extensions
- Additional data providers (Alpha Vantage, IEX Cloud)
- Cryptocurrency-specific services
- Real-time options and futures data
- Social sentiment analysis integration

This modular architecture provides a solid foundation for scaling the trading signals platform while maintaining reliability, performance, and code quality.