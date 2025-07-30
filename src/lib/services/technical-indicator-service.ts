import { 
  ITechnicalIndicatorService, 
  TechnicalDataSource, 
  ServiceHealth, 
  IRateLimitService, 
  ICacheService 
} from './types';

export class TechnicalIndicatorService implements ITechnicalIndicatorService {
  public readonly serviceName = 'TechnicalIndicatorService';
  
  private health: ServiceHealth = {
    isHealthy: true,
    lastCheck: Date.now(),
    successRate: 1.0,
    totalRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0
  };
  
  private readonly twelveDataKey: string;
  private readonly rateLimitService: IRateLimitService;
  private readonly cacheService: ICacheService;
  private readonly baseUrl = 'https://api.twelvedata.com';
  private readonly defaultTimeout = 30000;

  constructor(
    twelveDataKey: string,
    rateLimitService: IRateLimitService,
    cacheService: ICacheService
  ) {
    this.twelveDataKey = twelveDataKey;
    this.rateLimitService = rateLimitService;
    this.cacheService = cacheService;
  }

  async initialize(): Promise<void> {
    console.log(`🚀 Initializing ${this.serviceName}...`);
    
    if (!this.twelveDataKey) {
      console.warn(`⚠️ ${this.serviceName}: TwelveData API key not configured`);
      this.health.isHealthy = false;
      this.health.lastError = 'TwelveData API key not configured';
    } else {
      this.health.isHealthy = true;
    }
    
    this.health.lastCheck = Date.now();
    
    console.log(`✅ ${this.serviceName} initialized successfully`);
  }

  calculateRSI(prices: number[], period: number = 14): number {
    const startTime = Date.now();
    this.health.totalRequests++;

    try {
      if (prices.length < period + 1) {
        console.warn(`Insufficient data for RSI calculation. Need ${period + 1}, got ${prices.length}`);
        this.updateHealth(startTime, false, 'Insufficient data for RSI');
        return 50; // Neutral RSI fallback
      }

      // Calculate price changes
      const changes: number[] = [];
      for (let i = 1; i < prices.length; i++) {
        changes.push(prices[i] - prices[i - 1]);
      }

      // Separate gains and losses
      const gains = changes.map(change => change > 0 ? change : 0);
      const losses = changes.map(change => change < 0 ? Math.abs(change) : 0);

      // Initial average gain/loss (simple average for first period)
      let avgGain = gains.slice(0, period).reduce((sum, gain) => sum + gain, 0) / period;
      let avgLoss = losses.slice(0, period).reduce((sum, loss) => sum + loss, 0) / period;

      // Apply Wilder's smoothing for subsequent periods
      for (let i = period; i < changes.length; i++) {
        avgGain = ((avgGain * (period - 1)) + gains[i]) / period;
        avgLoss = ((avgLoss * (period - 1)) + losses[i]) / period;
      }

      // Calculate RSI
      if (avgLoss === 0) {
        this.updateHealth(startTime, true);
        return 100; // No losses = overbought
      }
      
      const rs = avgGain / avgLoss;
      const rsi = 100 - (100 / (1 + rs));

      this.updateHealth(startTime, true);
      return Math.round(rsi * 100) / 100; // Round to 2 decimal places

    } catch (error) {
      console.error(`❌ RSI calculation error:`, error);
      this.health.failedRequests++;
      this.updateHealth(startTime, false);
      return 50; // Neutral fallback
    }
  }

  calculateMACD(
    prices: number[], 
    fastPeriod: number = 12, 
    slowPeriod: number = 26, 
    signalPeriod: number = 9
  ): { value: number; signal: number; histogram: number } {
    const startTime = Date.now();
    this.health.totalRequests++;

    try {
      if (prices.length < slowPeriod) {
        console.warn(`Insufficient data for MACD calculation. Need ${slowPeriod}, got ${prices.length}`);
        this.updateHealth(startTime, false, 'Insufficient data for MACD');
        return { value: 0, signal: 0, histogram: 0 };
      }

      // Calculate EMAs
      const fastEMA = this.calculateEMA(prices, fastPeriod);
      const slowEMA = this.calculateEMA(prices, slowPeriod);

      // Calculate MACD line (difference between EMAs)
      const macdLine: number[] = [];
      const minLength = Math.min(fastEMA.length, slowEMA.length);
      for (let i = 0; i < minLength; i++) {
        macdLine.push(fastEMA[i] - slowEMA[i]);
      }

      // Calculate signal line (EMA of MACD line)
      const signalLine = this.calculateEMA(macdLine, signalPeriod);

      // Get the latest values
      const latestMACD = macdLine[macdLine.length - 1] || 0;
      const latestSignal = signalLine[signalLine.length - 1] || 0;
      const histogram = latestMACD - latestSignal;

      this.updateHealth(startTime, true);

      return {
        value: Math.round(latestMACD * 1000) / 1000,
        signal: Math.round(latestSignal * 1000) / 1000,
        histogram: Math.round(histogram * 1000) / 1000
      };

    } catch (error) {
      console.error(`❌ MACD calculation error:`, error);
      this.health.failedRequests++;
      this.updateHealth(startTime, false);
      return { value: 0, signal: 0, histogram: 0 };
    }
  }

  calculateSMA(prices: number[], period: number): number {
    const startTime = Date.now();
    this.health.totalRequests++;

    try {
      if (prices.length < period) {
        console.warn(`Insufficient data for SMA${period} calculation. Need ${period}, got ${prices.length}`);
        this.updateHealth(startTime, false, `Insufficient data for SMA${period}`);
        return prices.length > 0 ? prices[prices.length - 1] : 0; // Return latest price as fallback
      }

      const relevantPrices = prices.slice(-period);
      const sum = relevantPrices.reduce((acc, price) => acc + price, 0);
      const sma = sum / period;

      this.updateHealth(startTime, true);
      return Math.round(sma * 100) / 100;

    } catch (error) {
      console.error(`❌ SMA calculation error:`, error);
      this.health.failedRequests++;
      this.updateHealth(startTime, false);
      return 0;
    }
  }

  calculateEMA(prices: number[], period: number): number[] {
    const startTime = Date.now();
    this.health.totalRequests++;

    try {
      if (prices.length < period) {
        this.updateHealth(startTime, false, `Insufficient data for EMA${period}`);
        return [];
      }

      const ema: number[] = [];
      const multiplier = 2 / (period + 1);

      // First EMA value is the SMA
      const firstSMA = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;
      ema.push(firstSMA);

      // Calculate subsequent EMA values
      for (let i = period; i < prices.length; i++) {
        const currentEMA = (prices[i] * multiplier) + (ema[ema.length - 1] * (1 - multiplier));
        ema.push(currentEMA);
      }

      this.updateHealth(startTime, true);
      return ema;

    } catch (error) {
      console.error(`❌ EMA calculation error:`, error);
      this.health.failedRequests++;
      this.updateHealth(startTime, false);
      return [];
    }
  }

  calculateBollingerBands(
    prices: number[], 
    period: number = 20, 
    standardDeviations: number = 2
  ): { upper: number; middle: number; lower: number } {
    const startTime = Date.now();
    this.health.totalRequests++;

    try {
      if (prices.length < period) {
        console.warn(`Insufficient data for Bollinger Bands calculation. Need ${period}, got ${prices.length}`);
        const latestPrice = prices.length > 0 ? prices[prices.length - 1] : 0;
        this.updateHealth(startTime, false, 'Insufficient data for Bollinger Bands');
        return { upper: latestPrice, middle: latestPrice, lower: latestPrice };
      }

      // Calculate the middle line (SMA)
      const middle = this.calculateSMA(prices, period);

      // Calculate standard deviation
      const relevantPrices = prices.slice(-period);
      const variance = relevantPrices.reduce((acc, price) => acc + Math.pow(price - middle, 2), 0) / period;
      const stdDev = Math.sqrt(variance);

      // Calculate upper and lower bands
      const upper = middle + (stdDev * standardDeviations);
      const lower = middle - (stdDev * standardDeviations);

      this.updateHealth(startTime, true);

      return {
        upper: Math.round(upper * 100) / 100,
        middle: Math.round(middle * 100) / 100,
        lower: Math.round(lower * 100) / 100
      };

    } catch (error) {
      console.error(`❌ Bollinger Bands calculation error:`, error);
      this.health.failedRequests++;
      this.updateHealth(startTime, false);
      return { upper: 0, middle: 0, lower: 0 };
    }
  }

  async getTechnicalIndicators(
    symbol: string, 
    historicalData: number[]
  ): Promise<TechnicalDataSource> {
    const startTime = Date.now();
    this.health.totalRequests++;

    try {
      // Check cache first
      const cacheKey = `technical_indicators_${symbol}`;
      const cached = await this.cacheService.get<TechnicalDataSource>(cacheKey);
      
      if (cached) {
        this.updateHealth(startTime, true);
        return cached.data;
      }

      // Try TwelveData API first
      let technicalData: TechnicalDataSource | null = null;
      
      if (this.twelveDataKey) {
        try {
          technicalData = await this.getTwelveDataTechnicalIndicators(symbol);
        } catch (error) {
          console.warn(`TwelveData API failed for ${symbol}, falling back to manual calculations:`, error);
        }
      }

      // Fall back to manual calculations if API failed or no API key
      if (!technicalData) {
        if (historicalData.length < 50) {
          console.warn(`Insufficient historical data for manual technical calculations: ${historicalData.length} points`);
          throw new Error('Insufficient historical data for technical analysis');
        }

        technicalData = {
          symbol,
          rsi: this.calculateRSI(historicalData, 14),
          macd: this.calculateMACD(historicalData, 12, 26, 9),
          sma: {
            sma20: this.calculateSMA(historicalData, 20),
            sma50: this.calculateSMA(historicalData, 50),
            sma200: this.calculateSMA(historicalData, 200)
          },
          bollinger: this.calculateBollingerBands(historicalData, 20, 2),
          timestamp: new Date().toISOString(),
          source: 'manual_calculations',
          quality: 'historical'
        };

        console.log(`🔧 Manual technical calculations completed for ${symbol}: RSI=${technicalData.rsi.toFixed(2)}, MACD=${technicalData.macd.value.toFixed(3)}`);
      }

      // Cache the result
      await this.cacheService.set(cacheKey, technicalData, technicalData.quality);

      this.updateHealth(startTime, true);
      return technicalData;

    } catch (error) {
      console.error(`❌ ${this.serviceName} technical indicators error for ${symbol}:`, error);
      this.health.failedRequests++;
      this.updateHealth(startTime, false);
      throw error;
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

  // Additional utility methods

  /**
   * Calculate Stochastic Oscillator
   */
  calculateStochastic(
    highs: number[], 
    lows: number[], 
    closes: number[], 
    kPeriod: number = 14, 
    dPeriod: number = 3
  ): { k: number; d: number } {
    const startTime = Date.now();
    this.health.totalRequests++;

    try {
      if (highs.length < kPeriod || lows.length < kPeriod || closes.length < kPeriod) {
        this.updateHealth(startTime, false, 'Insufficient data for Stochastic');
        return { k: 50, d: 50 };
      }

      const recentHighs = highs.slice(-kPeriod);
      const recentLows = lows.slice(-kPeriod);
      const currentClose = closes[closes.length - 1];

      const highestHigh = Math.max(...recentHighs);
      const lowestLow = Math.min(...recentLows);

      const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;

      // Calculate %D (simple moving average of %K)
      const kValues = [];
      for (let i = Math.max(0, closes.length - dPeriod); i < closes.length; i++) {
        const periodHighs = highs.slice(Math.max(0, i - kPeriod + 1), i + 1);
        const periodLows = lows.slice(Math.max(0, i - kPeriod + 1), i + 1);
        const periodClose = closes[i];
        
        const periodHighest = Math.max(...periodHighs);
        const periodLowest = Math.min(...periodLows);
        
        kValues.push(((periodClose - periodLowest) / (periodHighest - periodLowest)) * 100);
      }

      const d = kValues.reduce((sum, val) => sum + val, 0) / kValues.length;

      this.updateHealth(startTime, true);
      return { 
        k: Math.round(k * 100) / 100, 
        d: Math.round(d * 100) / 100 
      };

    } catch (error) {
      console.error(`❌ Stochastic calculation error:`, error);
      this.health.failedRequests++;
      this.updateHealth(startTime, false);
      return { k: 50, d: 50 };
    }
  }

  /**
   * Calculate Williams %R
   */
  calculateWilliamsR(
    highs: number[], 
    lows: number[], 
    closes: number[], 
    period: number = 14
  ): number {
    const startTime = Date.now();
    this.health.totalRequests++;

    try {
      if (highs.length < period || lows.length < period || closes.length < period) {
        this.updateHealth(startTime, false, 'Insufficient data for Williams %R');
        return -50; // Neutral value
      }

      const recentHighs = highs.slice(-period);
      const recentLows = lows.slice(-period);
      const currentClose = closes[closes.length - 1];

      const highestHigh = Math.max(...recentHighs);
      const lowestLow = Math.min(...recentLows);

      const williamsR = ((highestHigh - currentClose) / (highestHigh - lowestLow)) * -100;

      this.updateHealth(startTime, true);
      return Math.round(williamsR * 100) / 100;

    } catch (error) {
      console.error(`❌ Williams %R calculation error:`, error);
      this.health.failedRequests++;
      this.updateHealth(startTime, false);
      return -50;
    }
  }

  /**
   * Calculate Average True Range (ATR)
   */
  calculateATR(
    highs: number[], 
    lows: number[], 
    closes: number[], 
    period: number = 14
  ): number {
    const startTime = Date.now();
    this.health.totalRequests++;

    try {
      if (highs.length < period + 1 || lows.length < period + 1 || closes.length < period + 1) {
        this.updateHealth(startTime, false, 'Insufficient data for ATR');
        return 0;
      }

      const trueRanges: number[] = [];

      for (let i = 1; i < highs.length; i++) {
        const high = highs[i];
        const low = lows[i];
        const prevClose = closes[i - 1];

        const tr1 = high - low;
        const tr2 = Math.abs(high - prevClose);
        const tr3 = Math.abs(low - prevClose);

        trueRanges.push(Math.max(tr1, tr2, tr3));
      }

      // Calculate ATR using simple moving average
      const atr = trueRanges.slice(-period).reduce((sum, tr) => sum + tr, 0) / period;

      this.updateHealth(startTime, true);
      return Math.round(atr * 1000) / 1000;

    } catch (error) {
      console.error(`❌ ATR calculation error:`, error);
      this.health.failedRequests++;
      this.updateHealth(startTime, false);
      return 0;
    }
  }

  // Private methods

  private async getTwelveDataTechnicalIndicators(symbol: string): Promise<TechnicalDataSource | null> {
    if (!this.twelveDataKey) {
      return null;
    }

    try {
      console.log(`📊 Fetching professional technical indicators from TwelveData for ${symbol}...`);

      // Fetch all technical indicators in parallel (with rate limiting)
      const [rsiData, macdData, bbandsData, sma20Data, sma50Data] = await Promise.all([
        this.fetchTwelveDataRSI(symbol),
        this.fetchTwelveDataMACD(symbol),
        this.fetchTwelveDataBBands(symbol),
        this.fetchTwelveDataSMA(symbol, 20),
        this.fetchTwelveDataSMA(symbol, 50)
      ]);

      // Extract the latest values with validation
      const rsi = parseFloat(rsiData?.values?.[0]?.rsi) || 50;
      const macd = {
        value: parseFloat(macdData?.values?.[0]?.macd) || 0,
        signal: parseFloat(macdData?.values?.[0]?.macd_signal) || 0,
        histogram: parseFloat(macdData?.values?.[0]?.macd_hist) || 0
      };
      const sma = {
        sma20: parseFloat(sma20Data?.values?.[0]?.sma) || 0,
        sma50: parseFloat(sma50Data?.values?.[0]?.sma) || 0,
        sma200: 0 // Would need additional API call
      };
      const bollinger = {
        upper: parseFloat(bbandsData?.values?.[0]?.upper_band) || 0,
        middle: parseFloat(bbandsData?.values?.[0]?.middle_band) || 0,
        lower: parseFloat(bbandsData?.values?.[0]?.lower_band) || 0
      };

      // Check if we got valid data from TwelveData
      const hasValidData = rsi > 0 && (macd.value !== 0 || macd.signal !== 0) && sma.sma20 > 0;
      
      if (!hasValidData) {
        console.warn(`⚠️ TwelveData returned invalid data for ${symbol}`);
        return null;
      }

      console.log(`✅ TwelveData technical indicators: RSI=${rsi}, MACD=${macd.value ? macd.value.toFixed(3) : 'N/A'}, BB_upper=${bollinger.upper ? bollinger.upper.toFixed(2) : 'N/A'}`);

      return {
        symbol,
        rsi: parseFloat(rsi.toString()),
        macd,
        sma,
        bollinger,
        timestamp: new Date().toISOString(),
        source: 'twelvedata_professional',
        quality: 'realtime'
      };

    } catch (error) {
      console.error('Error fetching TwelveData technical indicators:', error);
      return null;
    }
  }

  private async fetchTwelveDataRSI(symbol: string): Promise<any> {
    try {
      const result = await this.rateLimitService.executeWithLimit(
        'twelve_data',
        async () => {
          const response = await fetch(`${this.baseUrl}/rsi?symbol=${symbol}&interval=1day&time_period=14&apikey=${this.twelveDataKey}`, {
            signal: AbortSignal.timeout(this.defaultTimeout)
          });
          
          if (!response.ok) {
            throw new Error(`TwelveData RSI API error: ${response.status} ${response.statusText}`);
          }
          
          const data = await response.json();
          if (data.status === 'error') {
            throw new Error(`TwelveData RSI error: ${data.message}`);
          }
          
          return data;
        }
      );
      
      return result;
    } catch (error) {
      console.error('TwelveData RSI fetch error:', error);
      return null;
    }
  }

  private async fetchTwelveDataMACD(symbol: string): Promise<any> {
    return this.rateLimitService.executeWithLimit('twelve_data', async () => {
      const response = await fetch(
        `${this.baseUrl}/macd?symbol=${symbol}&interval=1day&fast_period=12&slow_period=26&signal_period=9&apikey=${this.twelveDataKey}`,
        { signal: AbortSignal.timeout(this.defaultTimeout) }
      );
      return response.json();
    });
  }

  private async fetchTwelveDataBBands(symbol: string): Promise<any> {
    return this.rateLimitService.executeWithLimit('twelve_data', async () => {
      const response = await fetch(
        `${this.baseUrl}/bbands?symbol=${symbol}&interval=1day&time_period=20&sd=2&apikey=${this.twelveDataKey}`,
        { signal: AbortSignal.timeout(this.defaultTimeout) }
      );
      return response.json();
    });
  }

  private async fetchTwelveDataSMA(symbol: string, period: number): Promise<any> {
    return this.rateLimitService.executeWithLimit('twelve_data', async () => {
      const response = await fetch(
        `${this.baseUrl}/sma?symbol=${symbol}&interval=1day&time_period=${period}&apikey=${this.twelveDataKey}`,
        { signal: AbortSignal.timeout(this.defaultTimeout) }
      );
      return response.json();
    });
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
    this.health.isHealthy = this.health.successRate > 0.8; // Consider healthy if >80% success rate
  }
}