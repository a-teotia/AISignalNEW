import { 
  IYahooFinanceService, 
  MarketDataSource, 
  TechnicalDataSource, 
  NewsDataSource, 
  DataFetchResult, 
  ServiceHealth,
  IRateLimitService,
  ICacheService
} from './types';

export class YahooFinanceService implements IYahooFinanceService {
  public readonly serviceName = 'YahooFinanceService';
  
  private health: ServiceHealth = {
    isHealthy: true,
    lastCheck: Date.now(),
    successRate: 1.0,
    totalRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0
  };
  
  private readonly rapidApiKey: string;
  private readonly rateLimitService: IRateLimitService;
  private readonly cacheService: ICacheService;
  private readonly baseUrl = 'https://yahoo-finance-real-time1.p.rapidapi.com';
  private readonly defaultTimeout = 15000;

  constructor(
    rapidApiKey: string,
    rateLimitService: IRateLimitService,
    cacheService: ICacheService
  ) {
    this.rapidApiKey = rapidApiKey;
    this.rateLimitService = rateLimitService;
    this.cacheService = cacheService;
  }

  async initialize(): Promise<void> {
    console.log(`🚀 Initializing ${this.serviceName}...`);
    
    if (!this.rapidApiKey) {
      console.warn(`⚠️ ${this.serviceName}: RapidAPI key not configured`);
      this.health.isHealthy = false;
      this.health.lastError = 'RapidAPI key not configured';
    } else {
      this.health.isHealthy = true;
    }
    
    this.health.lastCheck = Date.now();
    
    console.log(`✅ ${this.serviceName} initialized successfully`);
  }

  async getMarketData(symbol: string): Promise<DataFetchResult<MarketDataSource>> {
    const startTime = Date.now();
    this.health.totalRequests++;

    try {
      // Check cache first
      const cacheKey = `yahoo_market_${symbol}`;
      const cached = await this.cacheService.get<MarketDataSource>(cacheKey);
      
      if (cached) {
        this.updateHealth(startTime, true);
        return {
          data: cached.data,
          success: true,
          source: 'yahoo_finance_cached',
          quality: cached.quality,
          responseTime: Date.now() - startTime
        };
      }

      // Try multiple Yahoo Finance endpoints in priority order
      const methods = [
        () => this.getSummaryData(symbol),
        () => this.getChartData(symbol),
        () => this.getTimeSeriesData(symbol)
      ];

      for (const method of methods) {
        try {
          const result = await method();
          if (result.success && result.data) {
            // Cache the successful result
            await this.cacheService.set(cacheKey, result.data, result.quality);
            this.updateHealth(startTime, true);
            return result;
          }
        } catch (error) {
          console.warn(`Yahoo Finance method failed for ${symbol}:`, error);
          continue;
        }
      }

      // All methods failed
      this.health.failedRequests++;
      this.updateHealth(startTime, false, 'All Yahoo Finance methods failed');
      
      return {
        data: null,
        success: false,
        source: 'yahoo_finance',
        quality: 'none',
        responseTime: Date.now() - startTime,
        error: 'All Yahoo Finance endpoints failed'
      };

    } catch (error) {
      console.error(`❌ ${this.serviceName} market data error for ${symbol}:`, error);
      this.health.failedRequests++;
      this.updateHealth(startTime, false);
      
      return {
        data: null,
        success: false,
        source: 'yahoo_finance',
        quality: 'none',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getTechnicalData(symbol: string): Promise<DataFetchResult<TechnicalDataSource>> {
    const startTime = Date.now();
    this.health.totalRequests++;

    try {
      // Check cache first
      const cacheKey = `yahoo_technical_${symbol}`;
      const cached = await this.cacheService.get<TechnicalDataSource>(cacheKey);
      
      if (cached) {
        this.updateHealth(startTime, true);
        return {
          data: cached.data,
          success: true,
          source: 'yahoo_finance_cached',
          quality: cached.quality,
          responseTime: Date.now() - startTime
        };
      }

      // Try multiple Yahoo Finance technical endpoints
      const methods = [
        () => this.getStatisticsData(symbol),
        () => this.getAnalysisData(symbol),
        () => this.getInsightsData(symbol)
      ];

      for (const method of methods) {
        try {
          const result = await method();
          if (result.success && result.data) {
            // Cache the successful result
            await this.cacheService.set(cacheKey, result.data, result.quality);
            this.updateHealth(startTime, true);
            return result;
          }
        } catch (error) {
          console.warn(`Yahoo Finance technical method failed for ${symbol}:`, error);
          continue;
        }
      }

      // All methods failed
      this.health.failedRequests++;
      this.updateHealth(startTime, false, 'All Yahoo Finance technical methods failed');
      
      return {
        data: null,
        success: false,
        source: 'yahoo_finance',
        quality: 'none',
        responseTime: Date.now() - startTime,
        error: 'All Yahoo Finance technical endpoints failed'
      };

    } catch (error) {
      console.error(`❌ ${this.serviceName} technical data error for ${symbol}:`, error);
      this.health.failedRequests++;
      this.updateHealth(startTime, false);
      
      return {
        data: null,
        success: false,
        source: 'yahoo_finance',
        quality: 'none',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getNewsData(symbol: string): Promise<DataFetchResult<NewsDataSource>> {
    const startTime = Date.now();
    this.health.totalRequests++;

    try {
      // Check cache first
      const cacheKey = `yahoo_news_${symbol}`;
      const cached = await this.cacheService.get<NewsDataSource>(cacheKey);
      
      if (cached) {
        this.updateHealth(startTime, true);
        return {
          data: cached.data,
          success: true,
          source: 'yahoo_finance_cached',
          quality: cached.quality,
          responseTime: Date.now() - startTime
        };
      }

      // Try multiple Yahoo Finance news endpoints
      const methods = [
        () => this.getRecentUpdatesData(symbol),
        () => this.getRecommendationsData(symbol),
        () => this.getRecommendationTrendsData(symbol)
      ];

      for (const method of methods) {
        try {
          const result = await method();
          if (result.success && result.data) {
            // Cache the successful result
            await this.cacheService.set(cacheKey, result.data, result.quality);
            this.updateHealth(startTime, true);
            return result;
          }
        } catch (error) {
          console.warn(`Yahoo Finance news method failed for ${symbol}:`, error);
          continue;
        }
      }

      // All methods failed
      this.health.failedRequests++;
      this.updateHealth(startTime, false, 'All Yahoo Finance news methods failed');
      
      return {
        data: null,
        success: false,
        source: 'yahoo_finance',
        quality: 'none',
        responseTime: Date.now() - startTime,
        error: 'All Yahoo Finance news endpoints failed'
      };

    } catch (error) {
      console.error(`❌ ${this.serviceName} news data error for ${symbol}:`, error);
      this.health.failedRequests++;
      this.updateHealth(startTime, false);
      
      return {
        data: null,
        success: false,
        source: 'yahoo_finance',
        quality: 'none',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getHistoricalData(symbol: string, range: string): Promise<DataFetchResult<any>> {
    const startTime = Date.now();
    this.health.totalRequests++;

    try {
      const endpoint = `/stock/get-chart`;
      const params = new URLSearchParams({
        symbol,
        region: 'US',
        lang: 'en-US',
        range,
        interval: '1d'
      });

      const result = await this.rateLimitService.executeWithLimit(
        'yahoo_finance',
        () => this.makeApiRequest(`${endpoint}?${params}`)
      );

      if (!result.ok) {
        throw new Error(`Yahoo Finance API error: ${result.status} ${result.statusText}`);
      }

      const data = await result.json();
      
      if (!data?.chart?.result?.[0]) {
        throw new Error('Invalid historical data response');
      }

      const chartResult = data.chart.result[0];
      const quote = chartResult.indicators.quote[0];
      
      this.updateHealth(startTime, true);
      
      return {
        data: {
          symbol,
          timestamps: chartResult.timestamp,
          prices: {
            open: quote.open,
            high: quote.high,
            low: quote.low,
            close: quote.close
          },
          volumes: quote.volume,
          source: 'yahoo_chart'
        },
        success: true,
        source: 'yahoo_chart',
        quality: 'realtime',
        responseTime: Date.now() - startTime
      };

    } catch (error) {
      console.error(`❌ ${this.serviceName} historical data error for ${symbol}:`, error);
      this.health.failedRequests++;
      this.updateHealth(startTime, false);
      
      return {
        data: null,
        success: false,
        source: 'yahoo_finance',
        quality: 'none',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  getHealth(): ServiceHealth {
    return { ...this.health };
  }

  async shutdown(): Promise<void> {
    console.log(`🛑 Shutting down ${this.serviceName}...`);
    
    this.health.isHealthy = false;
    
    console.log(`✅ ${this.serviceName} shutdown complete`);
  }

  // Private methods for different Yahoo Finance endpoints

  private async getSummaryData(symbol: string): Promise<DataFetchResult<MarketDataSource>> {
    const endpoint = `/stock/get-summary`;
    const params = new URLSearchParams({
      lang: 'en-US',
      symbol,
      region: 'US'
    });

    const response = await this.rateLimitService.executeWithLimit(
      'yahoo_finance',
      () => this.makeApiRequest(`${endpoint}?${params}`)
    );

    if (!response.ok) {
      throw new Error(`Yahoo Summary API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !data.regularMarketPrice) {
      throw new Error('Invalid summary data response');
    }

    return {
      data: {
        symbol,
        price: data.regularMarketPrice,
        change: data.regularMarketChange || 0,
        changePercent: data.regularMarketChangePercent || 0,
        volume: data.regularMarketVolume || 0,
        marketCap: data.marketCap,
        peRatio: data.trailingPE,
        dividendYield: data.dividendYield,
        timestamp: new Date().toISOString(),
        source: 'yahoo_summary',
        quality: 'realtime'
      },
      success: true,
      source: 'yahoo_summary',
      quality: 'realtime',
      responseTime: 0
    };
  }

  private async getChartData(symbol: string): Promise<DataFetchResult<MarketDataSource>> {
    const endpoint = `/stock/get-chart`;
    const params = new URLSearchParams({
      symbol,
      region: 'US',
      lang: 'en-US',
      useYfid: 'true',
      includeAdjustedClose: 'true',
      events: 'div,split,earn',
      range: '1d',
      interval: '1m',
      includePrePost: 'false'
    });

    const response = await this.rateLimitService.executeWithLimit(
      'yahoo_finance',
      () => this.makeApiRequest(`${endpoint}?${params}`)
    );

    if (!response.ok) {
      throw new Error(`Yahoo Chart API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data?.chart?.result?.[0]) {
      throw new Error('Invalid chart data response');
    }

    const result = data.chart.result[0];
    const quote = result.indicators.quote[0];
    const timestamps = result.timestamp;
    const latestIndex = timestamps.length - 1;

    return {
      data: {
        symbol,
        price: quote.close[latestIndex] || 0,
        change: (quote.close[latestIndex] || 0) - (quote.open[0] || 0),
        changePercent: ((quote.close[latestIndex] || 0) - (quote.open[0] || 0)) / (quote.open[0] || 1) * 100,
        volume: quote.volume[latestIndex] || 0,
        timestamp: new Date().toISOString(),
        source: 'yahoo_chart',
        quality: 'realtime'
      },
      success: true,
      source: 'yahoo_chart',
      quality: 'realtime',
      responseTime: 0
    };
  }

  private async getTimeSeriesData(symbol: string): Promise<DataFetchResult<MarketDataSource>> {
    const endpoint = `/stock/get-timeseries`;
    const params = new URLSearchParams({ symbol });

    const response = await this.rateLimitService.executeWithLimit(
      'yahoo_finance',
      () => this.makeApiRequest(`${endpoint}?${params}`)
    );

    if (!response.ok) {
      throw new Error(`Yahoo TimeSeries API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !data.timestamp || !data.close) {
      throw new Error('Invalid time series data response');
    }

    const latestIndex = data.close.length - 1;

    return {
      data: {
        symbol,
        price: data.close[latestIndex] || 0,
        change: (data.close[latestIndex] || 0) - (data.close[0] || 0),
        changePercent: ((data.close[latestIndex] || 0) - (data.close[0] || 0)) / (data.close[0] || 1) * 100,
        volume: data.volume[latestIndex] || 0,
        timestamp: new Date().toISOString(),
        source: 'yahoo_timeseries',
        quality: 'realtime'
      },
      success: true,
      source: 'yahoo_timeseries',
      quality: 'realtime',
      responseTime: 0
    };
  }

  private async getStatisticsData(symbol: string): Promise<DataFetchResult<TechnicalDataSource>> {
    // This would need to be combined with historical data for real technical calculations
    // For now, returning a basic structure
    return {
      data: null,
      success: false,
      source: 'yahoo_statistics',
      quality: 'none',
      responseTime: 0,
      error: 'Statistics endpoint requires historical data integration'
    };
  }

  private async getAnalysisData(symbol: string): Promise<DataFetchResult<TechnicalDataSource>> {
    const endpoint = `/stock/get-analysis`;
    const params = new URLSearchParams({
      region: 'US',
      symbol,
      lang: 'en-US'
    });

    try {
      const response = await this.rateLimitService.executeWithLimit(
        'yahoo_finance',
        () => this.makeApiRequest(`${endpoint}?${params}`)
      );

      if (!response.ok) {
        throw new Error(`Yahoo Analysis API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || !data.analysis) {
        throw new Error('Invalid analysis data response');
      }

      // Extract technical analysis data if available
      return {
        data: {
          symbol,
          rsi: data.analysis.rsi || 50,
          macd: {
            value: data.analysis.macd?.value || 0,
            signal: data.analysis.macd?.signal || 0,
            histogram: data.analysis.macd?.histogram || 0
          },
          sma: {
            sma20: data.analysis.sma?.sma20 || 0,
            sma50: data.analysis.sma?.sma50 || 0,
            sma200: data.analysis.sma?.sma200 || 0
          },
          bollinger: {
            upper: data.analysis.bollinger?.upper || 0,
            middle: data.analysis.bollinger?.middle || 0,
            lower: data.analysis.bollinger?.lower || 0
          },
          timestamp: new Date().toISOString(),
          source: 'yahoo_analysis',
          quality: 'realtime'
        },
        success: true,
        source: 'yahoo_analysis',
        quality: 'realtime',
        responseTime: 0
      };
    } catch (error) {
      throw error;
    }
  }

  private async getInsightsData(symbol: string): Promise<DataFetchResult<TechnicalDataSource>> {
    return {
      data: null,
      success: false,
      source: 'yahoo_insights',
      quality: 'none',
      responseTime: 0,
      error: 'Insights endpoint not implemented'
    };
  }

  private async getRecentUpdatesData(symbol: string): Promise<DataFetchResult<NewsDataSource>> {
    const endpoint = `/stock/get-recent-updates`;
    const params = new URLSearchParams({
      lang: 'en-US',
      region: 'US',
      symbol
    });

    try {
      const response = await this.rateLimitService.executeWithLimit(
        'yahoo_finance',
        () => this.makeApiRequest(`${endpoint}?${params}`)
      );

      if (!response.ok) {
        throw new Error(`Yahoo Recent Updates API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle various possible data structures
      let updates = [];
      if (data && data.updates && Array.isArray(data.updates)) {
        updates = data.updates;
      } else if (data && Array.isArray(data)) {
        updates = data;
      } else if (data && data.news && Array.isArray(data.news)) {
        updates = data.news;
      } else if (data && data.items && Array.isArray(data.items)) {
        updates = data.items;
      } else {
        console.warn(`⚠️ Yahoo Finance news: Unexpected data structure for ${symbol}:`, data);
        updates = []; // Use empty array as fallback
      }

      const articles = updates.slice(0, 10).map((update: any) => ({
        title: update.title || update.headline || update.summary || 'Recent Update',
        source: update.source || update.publisher || 'Yahoo Finance',
        sentiment: this.analyzeSentiment(update.title || update.headline || '').sentiment,
        impact: this.analyzeSentiment(update.title || update.headline || '').impact,
        timestamp: update.timestamp || update.publishedAt || new Date().toISOString()
      }));

      const overallSentiment = this.calculateOverallSentiment(articles);

      return {
        data: {
          symbol,
          articles,
          overallSentiment: overallSentiment.sentiment,
          sentimentScore: overallSentiment.score,
          timestamp: new Date().toISOString(),
          source: 'yahoo_recent_updates',
          quality: 'realtime'
        },
        success: true,
        source: 'yahoo_recent_updates',
        quality: 'realtime',
        responseTime: 0
      };
    } catch (error) {
      console.warn(`⚠️ Yahoo Finance news failed for ${symbol}, using enhanced fallback`);
      
      // Return enhanced fallback data instead of throwing
      return {
        data: {
          symbol,
          articles: [
            {
              title: `${symbol} Market Analysis - Data Unavailable`,
              source: 'Yahoo Finance Fallback',
              sentiment: 'neutral' as 'bullish' | 'bearish' | 'neutral',
              impact: 0.5,
              timestamp: new Date().toISOString()
            }
          ],
          overallSentiment: 'neutral',
          sentimentScore: 0.5,
          timestamp: new Date().toISOString(),
          source: 'yahoo_recent_updates_fallback',
          quality: 'none'
        },
        success: false,
        source: 'yahoo_recent_updates_fallback',
        quality: 'none',
        responseTime: 0,
        error: error instanceof Error ? error.message : 'Yahoo Finance news service unavailable'
      };
    }
  }

  private async getRecommendationsData(symbol: string): Promise<DataFetchResult<NewsDataSource>> {
    return {
      data: null,
      success: false,
      source: 'yahoo_recommendations',
      quality: 'none',
      responseTime: 0,
      error: 'Recommendations endpoint not fully implemented'
    };
  }

  private async getRecommendationTrendsData(symbol: string): Promise<DataFetchResult<NewsDataSource>> {
    return {
      data: null,
      success: false,
      source: 'yahoo_recommendation_trends',
      quality: 'none',
      responseTime: 0,
      error: 'Recommendation trends endpoint not fully implemented'
    };
  }

  private async makeApiRequest(path: string): Promise<Response> {
    if (!this.rapidApiKey) {
      throw new Error('RapidAPI key not configured');
    }

    const url = `${this.baseUrl}${path}`;
    
    return fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': this.rapidApiKey,
        'X-RapidAPI-Host': 'yahoo-finance-real-time1.p.rapidapi.com'
      },
      signal: AbortSignal.timeout(this.defaultTimeout)
    });
  }

  private analyzeSentiment(text: string): { sentiment: 'bullish' | 'bearish' | 'neutral'; impact: number } {
    const lowerText = text.toLowerCase();
    const bullishWords = ['bull', 'bullish', 'buy', 'strong', 'positive', 'up', 'rise', 'gain'];
    const bearishWords = ['bear', 'bearish', 'sell', 'weak', 'negative', 'down', 'fall', 'loss'];

    let bullishScore = 0;
    let bearishScore = 0;

    bullishWords.forEach(word => {
      if (lowerText.includes(word)) bullishScore++;
    });

    bearishWords.forEach(word => {
      if (lowerText.includes(word)) bearishScore++;
    });

    if (bullishScore > bearishScore) {
      return { sentiment: 'bullish', impact: Math.min(bullishScore * 0.3, 1) };
    } else if (bearishScore > bullishScore) {
      return { sentiment: 'bearish', impact: Math.min(bearishScore * 0.3, 1) };
    } else {
      return { sentiment: 'neutral', impact: 0.5 };
    }
  }

  private calculateOverallSentiment(articles: any[]): { sentiment: 'bullish' | 'bearish' | 'neutral'; score: number } {
    if (articles.length === 0) {
      return { sentiment: 'neutral', score: 0 };
    }

    let bullishCount = 0;
    let bearishCount = 0;
    let totalImpact = 0;

    articles.forEach(article => {
      if (article.sentiment === 'bullish') {
        bullishCount++;
        totalImpact += article.impact;
      } else if (article.sentiment === 'bearish') {
        bearishCount++;
        totalImpact -= article.impact;
      }
    });

    const avgImpact = totalImpact / articles.length;
    const score = Math.max(-1, Math.min(1, avgImpact));

    if (bullishCount > bearishCount) {
      return { sentiment: 'bullish', score };
    } else if (bearishCount > bullishCount) {
      return { sentiment: 'bearish', score };
    } else {
      return { sentiment: 'neutral', score };
    }
  }

  private updateHealth(startTime: number, success: boolean, error?: string): void {
    const responseTime = Date.now() - startTime;
    
    // Update average response time using exponential moving average
    this.health.averageResponseTime = this.health.averageResponseTime * 0.9 + responseTime * 0.1;
    
    if (!success) {
      this.health.failedRequests++;
      if (error) {
        this.health.lastError = error;
      }
    }
    
    // Update success rate
    if (this.health.totalRequests > 0) {
      this.health.successRate = (this.health.totalRequests - this.health.failedRequests) / this.health.totalRequests;
    }
    
    this.health.lastCheck = Date.now();
    this.health.isHealthy = this.health.successRate > 0.6; // Yahoo Finance can be unreliable
  }
}