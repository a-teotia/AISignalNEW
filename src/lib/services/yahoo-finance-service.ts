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

      let fundamentalData = null; // Store fundamental data if extracted
      
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
          
          // Check if this error contains fundamental data extraction message
          if (error instanceof Error && error.message.includes('Premium fundamental data extracted')) {
            console.log(`🎯 Captured fundamental data for ${symbol}`);
            // Store this for later use - the fundamental data is already logged
          }
          
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

  // 🎯 NEW: Get premium fundamental data from Yahoo Finance
  async getFundamentalData(symbol: string): Promise<DataFetchResult<any>> {
    const startTime = Date.now();
    this.health.totalRequests++;

    try {
      // Check cache first
      const cacheKey = `yahoo_fundamental_${symbol}`;
      const cached = await this.cacheService.get<any>(cacheKey);
      
      if (cached) {
        this.updateHealth(startTime, true);
        return {
          data: cached.data,
          success: true,
          source: 'yahoo_fundamental_cached',
          quality: cached.quality,
          responseTime: Date.now() - startTime
        };
      }

      // Call the summary endpoint specifically for fundamental data
      const endpoint = `/stock/get-summary`;
      const params = new URLSearchParams({
        symbol,
        lang: 'en-US',
        region: 'US'
      });

      const response = await this.rateLimitService.executeWithLimit(
        'yahoo_finance',
        () => this.makeApiRequest(`${endpoint}?${params}`)
      );

      if (!response.ok) {
        throw new Error(`Yahoo Fundamental API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.earnings || data.calendarEvents) {
        // Extract comprehensive fundamental analysis
        const fundamentalInsights = this.extractFundamentalInsights(data);
        
        // Cache the fundamental data
        await this.cacheService.set(cacheKey, fundamentalInsights, 'premium');
        this.updateHealth(startTime, true);
        
        return {
          data: fundamentalInsights,
          success: true,
          source: 'yahoo_fundamental',
          quality: 'premium',
          responseTime: Date.now() - startTime
        };
      } else {
        throw new Error('No fundamental data available');
      }

    } catch (error) {
      console.error(`❌ ${this.serviceName} fundamental data error for ${symbol}:`, error);
      this.health.failedRequests++;
      this.updateHealth(startTime, false);
      
      return {
        data: null,
        success: false,
        source: 'yahoo_fundamental',
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
    
    console.log(`🔍 Yahoo Finance Summary API Response for ${symbol}:`, Object.keys(data));
    
    // Handle different possible response structures from Yahoo Finance API
    let marketData = null;
    
    // Try to extract market data from various possible locations
    if (data.regularMarketPrice) {
      // Standard format
      marketData = {
        price: data.regularMarketPrice,
        change: data.regularMarketChange || 0,
        changePercent: data.regularMarketChangePercent || 0,
        volume: data.regularMarketVolume || 0,
        marketCap: data.marketCap,
        peRatio: data.trailingPE,
        dividendYield: data.dividendYield
      };
    } else if (data.price) {
      // Alternative format
      marketData = {
        price: data.price.regularMarketPrice || data.price,
        change: data.price.regularMarketChange || 0,
        changePercent: data.price.regularMarketChangePercent || 0,
        volume: data.volume || 0,
        marketCap: data.marketCap,
        peRatio: data.trailingPE,
        dividendYield: data.dividendYield
      };
    } else if (data.earnings || data.calendarEvents) {
      // 🎯 PREMIUM: Yahoo Finance returned comprehensive fundamental data - EXTRACT ALL VALUE!
      console.log(`✅ Yahoo Finance Premium: Comprehensive fundamental data received for ${symbol}`);
      
      // Extract earnings data
      const earningsData = data.earnings?.earningsChart || {};
      const calendarData = data.calendarEvents?.earnings || {};
      const upgradeData = data.upgradeDowngradeHistory?.history || [];
      const filings = data.secFilings?.filings || [];
      
      // Calculate fundamental analysis metrics
      const fundamentalInsights = {
        // Earnings metrics
        currentQuarterEstimate: earningsData.currentQuarterEstimate,
        earningsGrowth: this.calculateEarningsGrowth(earningsData.quarterly || []),
        earningsConsensus: {
          average: calendarData.earningsAverage,
          low: calendarData.earningsLow,
          high: calendarData.earningsHigh,
          spread: calendarData.earningsHigh ? (calendarData.earningsHigh - calendarData.earningsLow) : 0
        },
        
        // Revenue metrics
        revenueConsensus: {
          average: calendarData.revenueAverage,
          low: calendarData.revenueLow,
          high: calendarData.revenueHigh,
          spread: calendarData.revenueHigh ? (calendarData.revenueHigh - calendarData.revenueLow) : 0
        },
        
        // Analyst sentiment from upgrades/downgrades
        analystSentiment: this.analyzeUpgradeDowngradeHistory(upgradeData.slice(0, 20)), // Last 20 for performance
        
        // Recent SEC filings activity
        recentFilingsActivity: this.analyzeSecFilings(filings.slice(0, 10)), // Last 10 for performance
        
        // Earnings date proximity (critical for volatility prediction)
        earningsProximity: this.calculateEarningsProximity(calendarData.earningsDate),
        
        // Dividend information
        dividendInfo: {
          exDividendDate: data.calendarEvents?.exDividendDate,
          dividendDate: data.calendarEvents?.dividendDate
        }
      };
      
      console.log(`📈 Extracted fundamental insights:`, JSON.stringify(fundamentalInsights, null, 2));
      
      // Store fundamental insights globally for the Fundamental Agent to use
      (global as any).yahooFundamentalCache = (global as any).yahooFundamentalCache || {};
      (global as any).yahooFundamentalCache[symbol] = fundamentalInsights;
      
      console.log(`🎯 Premium fundamental data cached for Fundamental Agent: ${symbol}`);
      
      // Continue to chart endpoint for price data
      throw new Error(`Premium fundamental data extracted for ${symbol} - continuing to price endpoints`);
    } else {
      // API returned different structure
      console.warn(`⚠️ Yahoo Finance returned unexpected structure for ${symbol}:`, Object.keys(data));
      throw new Error(`Yahoo Finance API returned unknown data structure for ${symbol}`);
    }

    if (!marketData || !marketData.price) {
      throw new Error('No valid market price data found in Yahoo Finance response');
    }

    return {
      data: {
        symbol,
        price: marketData.price,
        change: marketData.change,
        changePercent: marketData.changePercent,
        volume: marketData.volume,
        marketCap: marketData.marketCap,
        peRatio: marketData.peRatio,
        dividendYield: marketData.dividendYield,
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
        console.log(`📰 Yahoo Finance news: Alternative data structure detected for ${symbol} - using fallback parsing`);
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

  // 🎯 PREMIUM FUNDAMENTAL ANALYSIS METHODS
  
  private calculateEarningsGrowth(quarterlyData: any[]): number {
    if (!quarterlyData || quarterlyData.length < 2) return 0;
    
    try {
      const latest = quarterlyData[quarterlyData.length - 1]?.actual || 0;
      const previous = quarterlyData[quarterlyData.length - 2]?.actual || 0;
      
      if (previous === 0) return 0;
      return ((latest - previous) / previous) * 100;
    } catch {
      return 0;
    }
  }

  private analyzeUpgradeDowngradeHistory(history: any[]): any {
    if (!history || history.length === 0) {
      return { sentiment: 'neutral', score: 0, recentChanges: 0 };
    }

    try {
      const recent = history.slice(0, 10); // Last 10 changes
      let upgradeCount = 0;
      let downgradeCount = 0;
      
      recent.forEach(item => {
        const action = item.toGrade?.toLowerCase() || '';
        const fromAction = item.fromGrade?.toLowerCase() || '';
        
        if (action.includes('buy') || action.includes('strong buy') || action.includes('outperform')) {
          upgradeCount++;
        } else if (action.includes('sell') || action.includes('underperform')) {
          downgradeCount++;
        }
      });

      const netSentiment = upgradeCount - downgradeCount;
      const sentiment = netSentiment > 0 ? 'bullish' : netSentiment < 0 ? 'bearish' : 'neutral';
      
      return {
        sentiment,
        score: netSentiment / recent.length,
        recentChanges: recent.length,
        upgrades: upgradeCount,
        downgrades: downgradeCount
      };
    } catch {
      return { sentiment: 'neutral', score: 0, recentChanges: 0 };
    }
  }

  private analyzeSecFilings(filings: any[]): any {
    if (!filings || filings.length === 0) {
      return { recentActivity: 0, types: [], significance: 'low' };
    }

    try {
      const recentFilings = filings.slice(0, 5);
      const types = recentFilings.map(f => f.type).filter(Boolean);
      
      // Check for significant filing types
      const significantTypes = ['10-K', '10-Q', '8-K', 'DEF 14A'];
      const hasSignificant = types.some(type => significantTypes.includes(type));
      
      return {
        recentActivity: recentFilings.length,
        types: [...new Set(types)],
        significance: hasSignificant ? 'high' : 'medium'
      };
    } catch {
      return { recentActivity: 0, types: [], significance: 'low' };
    }
  }

  private calculateEarningsProximity(earningsDate: any): any {
    if (!earningsDate || !Array.isArray(earningsDate) || earningsDate.length === 0) {
      return { daysUntilEarnings: null, isNearEarnings: false, volatilityRisk: 'low' };
    }

    try {
      const nextEarningsTimestamp = earningsDate[0];
      const nextEarningsDate = new Date(nextEarningsTimestamp * 1000);
      const today = new Date();
      const daysUntilEarnings = Math.ceil((nextEarningsDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      const isNearEarnings = daysUntilEarnings <= 7 && daysUntilEarnings >= -1;
      const volatilityRisk = daysUntilEarnings <= 3 && daysUntilEarnings >= -1 ? 'high' : 
                            daysUntilEarnings <= 7 && daysUntilEarnings >= -3 ? 'medium' : 'low';
      
      return {
        daysUntilEarnings,
        isNearEarnings,
        volatilityRisk,
        earningsDate: nextEarningsDate.toISOString()
      };
    } catch {
      return { daysUntilEarnings: null, isNearEarnings: false, volatilityRisk: 'low' };
    }
  }

  private extractFundamentalInsights(data: any): any {
    const earningsData = data.earnings?.earningsChart || {};
    const calendarData = data.calendarEvents?.earnings || {};
    const upgradeData = data.upgradeDowngradeHistory?.history || [];
    const filings = data.secFilings?.filings || [];
    
    return {
      // Earnings metrics
      currentQuarterEstimate: earningsData.currentQuarterEstimate,
      earningsGrowth: this.calculateEarningsGrowth(earningsData.quarterly || []),
      earningsConsensus: {
        average: calendarData.earningsAverage,
        low: calendarData.earningsLow,
        high: calendarData.earningsHigh,
        spread: calendarData.earningsHigh ? (calendarData.earningsHigh - calendarData.earningsLow) : 0
      },
      
      // Revenue metrics
      revenueConsensus: {
        average: calendarData.revenueAverage,
        low: calendarData.revenueLow,
        high: calendarData.revenueHigh,
        spread: calendarData.revenueHigh ? (calendarData.revenueHigh - calendarData.revenueLow) : 0
      },
      
      // Analyst sentiment from upgrades/downgrades
      analystSentiment: this.analyzeUpgradeDowngradeHistory(upgradeData.slice(0, 20)),
      
      // Recent SEC filings activity
      recentFilingsActivity: this.analyzeSecFilings(filings.slice(0, 10)),
      
      // Earnings date proximity (critical for volatility prediction)
      earningsProximity: this.calculateEarningsProximity(calendarData.earningsDate),
      
      // Dividend information
      dividendInfo: {
        exDividendDate: data.calendarEvents?.exDividendDate,
        dividendDate: data.calendarEvents?.dividendDate
      },
      
      // Metadata
      dataQuality: 'premium',
      extractedAt: new Date().toISOString(),
      dataSource: 'yahoo_finance_fundamental'
    };
  }
}