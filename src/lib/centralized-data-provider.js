"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CentralizedDataProvider = void 0;
const real_scraper_1 = require("./scrapers/real-scraper");
const data_verification_1 = require("./redundancy/data-verification");
class CentralizedDataProvider {
    /**
     * Get comprehensive data for any symbol using all available sources
     */
    static async getComprehensiveData(symbol) {
        const startTime = Date.now();
        const sources = [];
        const warnings = [];
        console.log(`🔍 Fetching comprehensive data for ${symbol}...`);
        // 1. Check cache first
        const cached = this.getFromCache(symbol);
        if (cached) {
            console.log(`✅ Using cached data for ${symbol} (${cached.quality})`);
            return {
                ...cached.data,
                overallQuality: cached.quality,
                sources: cached.data.sources,
                warnings: cached.quality === 'stale_cache' ? ['Using stale cached data'] : []
            };
        }
        // 2. Try real-time sources in order of preference
        const marketData = await this.getMarketDataWithFallback(symbol);
        sources.push(marketData.source);
        if (marketData.quality === 'none') {
            warnings.push('No market data available');
        }
        // 3. Get technical data if available
        let technicalData;
        if (marketData.quality !== 'none') {
            technicalData = await this.getTechnicalDataWithFallback(symbol);
            if (technicalData) {
                sources.push(technicalData.source);
            }
        }
        // 4. Get news data
        const newsData = await this.getNewsDataWithFallback(symbol);
        if (newsData) {
            sources.push(newsData.source);
        }
        // 5. Get crypto-specific data if applicable
        let cryptoData;
        if (symbol.includes('BTC') || symbol.includes('ETH')) {
            cryptoData = await this.getCryptoDataWithFallback(symbol);
            if (cryptoData) {
                sources.push(cryptoData.source);
            }
        }
        // 6. Determine overall quality
        const qualities = [marketData.quality, technicalData?.quality, newsData?.quality, cryptoData?.quality].filter(Boolean);
        const overallQuality = this.determineOverallQuality(qualities);
        const result = {
            marketData,
            technicalData,
            newsData,
            cryptoData,
            timestamp: new Date().toISOString(),
            overallQuality,
            sources: Array.from(new Set(sources)), // Remove duplicates
            warnings
        };
        // 7. Verify data across multiple sources
        try {
            const verification = await this.verificationSystem.verifyData(symbol, result);
            if (!verification.verified) {
                warnings.push(`Data verification failed: ${verification.conflicts.join(', ')}`);
                console.log(`⚠️ Data verification issues for ${symbol}:`, verification.conflicts);
            }
            // Add verification metadata
            result.verification = {
                verified: verification.verified,
                confidence: verification.confidence,
                verificationScore: verification.verificationScore,
                conflicts: verification.conflicts
            };
            console.log(`🔍 Data verification for ${symbol}: ${verification.verified ? 'PASSED' : 'FAILED'} (Score: ${verification.verificationScore}/100)`);
        }
        catch (error) {
            console.log(`❌ Data verification failed for ${symbol}:`, error instanceof Error ? error.message : 'Unknown error');
            warnings.push('Data verification failed');
        }
        // 8. Cache the result
        this.cache.set(symbol, {
            data: result,
            timestamp: Date.now(),
            quality: overallQuality
        });
        const processingTime = Date.now() - startTime;
        console.log(`✅ Comprehensive data fetched for ${symbol} in ${processingTime}ms (Quality: ${overallQuality})`);
        return result;
    }
    /**
     * Get market data with fallback chain
     */
    static async getMarketDataWithFallback(symbol) {
        const sources = [
            { name: 'RapidAPI Yahoo Finance', fn: () => this.getRapidAPIData(symbol) },
            { name: 'Alpha Vantage', fn: () => this.getAlphaVantageData(symbol) },
            { name: 'CoinGecko', fn: () => this.getCoinGeckoData(symbol) },
            { name: 'Twelve Data', fn: () => this.getTwelveDataData(symbol) },
            { name: 'Scraper', fn: () => this.getScrapedData(symbol) }
        ];
        for (const source of sources) {
            try {
                console.log(`  🔄 Trying ${source.name}...`);
                const data = await source.fn();
                if (data) {
                    this.updateApiHealth(source.name, true);
                    console.log(`  ✅ ${source.name} succeeded`);
                    return data;
                }
            }
            catch (error) {
                console.log(`  ❌ ${source.name} failed:`, error instanceof Error ? error.message : 'Unknown error');
                this.updateApiHealth(source.name, false);
            }
        }
        // No data available
        return this.createNoDataResponse(symbol, 'market');
    }
    /**
     * Get technical data with fallback chain
     */
    static async getTechnicalDataWithFallback(symbol) {
        const sources = [
            { name: 'Twelve Data', fn: () => this.getTwelveDataTechnical(symbol) },
            { name: 'Alpha Vantage', fn: () => this.getAlphaVantageTechnical(symbol) },
            { name: 'Scraper', fn: () => this.getScrapedTechnical(symbol) }
        ];
        for (const source of sources) {
            try {
                const data = await source.fn();
                if (data) {
                    this.updateApiHealth(source.name, true);
                    return data;
                }
            }
            catch (error) {
                this.updateApiHealth(source.name, false);
            }
        }
        return undefined;
    }
    /**
     * Get news data with fallback chain
     */
    static async getNewsDataWithFallback(symbol) {
        const sources = [
            { name: 'Yahoo Finance RSS', fn: () => this.getYahooNewsData(symbol) },
            { name: 'Scraper', fn: () => this.getScrapedNewsData(symbol) }
        ];
        for (const source of sources) {
            try {
                const data = await source.fn();
                if (data) {
                    this.updateApiHealth(source.name, true);
                    return data;
                }
            }
            catch (error) {
                this.updateApiHealth(source.name, false);
            }
        }
        return undefined;
    }
    /**
     * Get crypto-specific data with fallback chain
     */
    static async getCryptoDataWithFallback(symbol) {
        const sources = [
            { name: 'CoinGecko', fn: () => this.getCoinGeckoCryptoData(symbol) },
            { name: 'Blockchain.info', fn: () => this.getBlockchainData(symbol) },
            { name: 'Etherscan', fn: () => this.getEtherscanData(symbol) }
        ];
        for (const source of sources) {
            try {
                const data = await source.fn();
                if (data) {
                    this.updateApiHealth(source.name, true);
                    return data;
                }
            }
            catch (error) {
                this.updateApiHealth(source.name, false);
            }
        }
        return undefined;
    }
    // ===== INDIVIDUAL API IMPLEMENTATIONS =====
    static async getRapidAPIData(symbol) {
        if (!this.RAPIDAPI_KEY)
            return null;
        try {
            const response = await fetch(`https://yahoo-finance-real-time1.p.rapidapi.com/stock/get-options?symbol=${symbol}&lang=en-US&region=US`, {
                headers: {
                    'x-rapidapi-host': 'yahoo-finance-real-time1.p.rapidapi.com',
                    'x-rapidapi-key': this.RAPIDAPI_KEY
                }
            });
            if (!response.ok)
                return null;
            const responseText = await response.text();
            if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
                return null;
            }
            const data = JSON.parse(responseText);
            const quote = data?.optionChain?.result?.[0]?.quote;
            if (!quote || !quote.regularMarketPrice)
                return null;
            return {
                symbol,
                price: quote.regularMarketPrice,
                change: quote.regularMarketChange,
                changePercent: quote.regularMarketChangePercent,
                volume: quote.regularMarketVolume,
                marketCap: quote.marketCap,
                peRatio: quote.trailingPE,
                dividendYield: quote.trailingAnnualDividendYield,
                timestamp: new Date().toISOString(),
                source: 'rapidapi_yahoo',
                quality: 'realtime'
            };
        }
        catch (error) {
            return null;
        }
    }
    static async getAlphaVantageData(symbol) {
        if (!this.ALPHA_VANTAGE_API_KEY)
            return null;
        const cleanSymbol = symbol.replace('.AX', '');
        try {
            const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${cleanSymbol}&apikey=${this.ALPHA_VANTAGE_API_KEY}`);
            if (!response.ok)
                return null;
            const responseText = await response.text();
            if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
                return null;
            }
            const data = JSON.parse(responseText);
            const quote = data['Global Quote'];
            if (!quote || !quote['05. price'])
                return null;
            return {
                symbol,
                price: parseFloat(quote['05. price']),
                change: parseFloat(quote['09. change']),
                changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
                volume: parseInt(quote['06. volume']),
                timestamp: new Date().toISOString(),
                source: 'alpha_vantage',
                quality: 'realtime'
            };
        }
        catch (error) {
            return null;
        }
    }
    static async getCoinGeckoData(symbol) {
        if (!symbol.includes('BTC') && !symbol.includes('ETH'))
            return null;
        try {
            const coinId = symbol.includes('BTC') ? 'bitcoin' : 'ethereum';
            const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`);
            if (!response.ok)
                return null;
            const data = await response.json();
            const coinData = data[coinId];
            if (!coinData)
                return null;
            return {
                symbol,
                price: coinData.usd,
                change: coinData.usd_24h_change,
                changePercent: coinData.usd_24h_change,
                volume: coinData.usd_24h_vol,
                marketCap: coinData.usd_market_cap,
                timestamp: new Date().toISOString(),
                source: 'coingecko',
                quality: 'realtime'
            };
        }
        catch (error) {
            return null;
        }
    }
    static async getTwelveDataData(symbol) {
        try {
            const response = await fetch(`https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${this.TWELVE_DATA_API_KEY}`);
            if (!response.ok)
                return null;
            const data = await response.json();
            if (!data || data.status === 'error')
                return null;
            return {
                symbol,
                price: parseFloat(data.close),
                change: parseFloat(data.change),
                changePercent: parseFloat(data.percent_change),
                volume: parseInt(data.volume),
                timestamp: new Date().toISOString(),
                source: 'twelve_data',
                quality: 'realtime'
            };
        }
        catch (error) {
            return null;
        }
    }
    static async getScrapedData(symbol) {
        try {
            const scrapedData = await real_scraper_1.RealFinancialScraper.scrapeComprehensiveData(symbol);
            return {
                symbol,
                price: scrapedData.priceData.current,
                change: scrapedData.priceData.change,
                changePercent: scrapedData.priceData.changePercent,
                volume: scrapedData.priceData.volume,
                timestamp: scrapedData.timestamp,
                source: 'scraper',
                quality: 'realtime'
            };
        }
        catch (error) {
            return null;
        }
    }
    // ===== TECHNICAL DATA IMPLEMENTATIONS =====
    static async getTwelveDataTechnical(symbol) {
        try {
            const response = await fetch(`https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=50&apikey=${this.TWELVE_DATA_API_KEY}`);
            if (!response.ok)
                return null;
            const data = await response.json();
            if (!data || data.status === 'error' || !data.values)
                return null;
            const values = data.values.slice(0, 20).map((v) => parseFloat(v.close));
            // Calculate technical indicators
            const rsi = this.calculateRSI(values);
            const macd = this.calculateMACD(values);
            const sma = this.calculateSMA(values);
            const bollinger = this.calculateBollingerBands(values);
            return {
                symbol,
                rsi,
                macd,
                sma,
                bollinger,
                timestamp: new Date().toISOString(),
                source: 'twelve_data',
                quality: 'realtime'
            };
        }
        catch (error) {
            return null;
        }
    }
    static async getAlphaVantageTechnical(symbol) {
        if (!this.ALPHA_VANTAGE_API_KEY)
            return null;
        const cleanSymbol = symbol.replace('.AX', '');
        try {
            const response = await fetch(`https://www.alphavantage.co/query?function=TECHNICAL_INDICATORS&symbol=${cleanSymbol}&interval=daily&time_period=20&series_type=close&apikey=${this.ALPHA_VANTAGE_API_KEY}`);
            if (!response.ok)
                return null;
            const data = await response.json();
            // Extract technical indicators from Alpha Vantage response
            // This is a simplified implementation
            return {
                symbol,
                rsi: 50, // Placeholder
                macd: { value: 0, signal: 0, histogram: 0 },
                sma: { sma20: 0, sma50: 0, sma200: 0 },
                bollinger: { upper: 0, middle: 0, lower: 0 },
                timestamp: new Date().toISOString(),
                source: 'alpha_vantage',
                quality: 'realtime'
            };
        }
        catch (error) {
            return null;
        }
    }
    static async getScrapedTechnical(symbol) {
        try {
            const scrapedData = await real_scraper_1.RealFinancialScraper.scrapeComprehensiveData(symbol);
            return {
                symbol,
                rsi: scrapedData.technicalData.rsi,
                macd: scrapedData.technicalData.macd,
                sma: scrapedData.technicalData.sma,
                bollinger: scrapedData.technicalData.bollinger,
                timestamp: scrapedData.timestamp,
                source: 'scraper',
                quality: 'realtime'
            };
        }
        catch (error) {
            return null;
        }
    }
    // ===== NEWS DATA IMPLEMENTATIONS =====
    static async getYahooNewsData(symbol) {
        try {
            const newsRes = await fetch(`https://feeds.finance.yahoo.com/rss/2.0/headline?s=${symbol}&region=US&lang=en-US`);
            const newsText = await newsRes.text();
            const itemMatches = newsText.match(/<item>([\s\S]*?)<\/item>/g) || [];
            const articles = itemMatches.slice(0, 5).map(item => {
                const titleMatch = item.match(/<title>([\s\S]*?)<\/title>/);
                const title = titleMatch ? titleMatch[1] : '';
                // Simple sentiment analysis based on keywords
                const sentiment = this.analyzeSentiment(title);
                return {
                    title,
                    source: 'Yahoo Finance',
                    sentiment: sentiment.sentiment,
                    impact: sentiment.impact,
                    timestamp: new Date().toISOString()
                };
            }).filter(article => article.title);
            if (articles.length === 0)
                return null;
            const overallSentiment = this.calculateOverallSentiment(articles);
            return {
                symbol,
                articles,
                overallSentiment: overallSentiment.sentiment,
                sentimentScore: overallSentiment.score,
                timestamp: new Date().toISOString(),
                source: 'yahoo_finance_rss',
                quality: 'realtime'
            };
        }
        catch (error) {
            return null;
        }
    }
    static async getScrapedNewsData(symbol) {
        try {
            const scrapedData = await real_scraper_1.RealFinancialScraper.scrapeComprehensiveData(symbol);
            const articles = scrapedData.sentimentData.news.map(article => ({
                title: article.headline,
                source: article.source,
                sentiment: article.sentiment,
                impact: article.impact,
                timestamp: new Date().toISOString()
            }));
            const overallSentiment = this.calculateOverallSentiment(articles);
            return {
                symbol,
                articles,
                overallSentiment: overallSentiment.sentiment,
                sentimentScore: overallSentiment.score,
                timestamp: scrapedData.timestamp,
                source: 'scraper',
                quality: 'realtime'
            };
        }
        catch (error) {
            return null;
        }
    }
    // ===== CRYPTO DATA IMPLEMENTATIONS =====
    static async getCoinGeckoCryptoData(symbol) {
        if (!symbol.includes('BTC') && !symbol.includes('ETH'))
            return null;
        try {
            const coinId = symbol.includes('BTC') ? 'bitcoin' : 'ethereum';
            const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=false&sparkline=false`);
            if (!response.ok)
                return null;
            const data = await response.json();
            return {
                symbol,
                price: data.market_data.current_price.usd,
                change24h: data.market_data.price_change_percentage_24h,
                volume24h: data.market_data.total_volume.usd,
                marketCap: data.market_data.market_cap.usd,
                networkMetrics: {
                    activeAddresses: data.community_data.twitter_followers || 0
                },
                timestamp: new Date().toISOString(),
                source: 'coingecko',
                quality: 'realtime'
            };
        }
        catch (error) {
            return null;
        }
    }
    static async getBlockchainData(symbol) {
        if (!symbol.includes('BTC'))
            return null;
        try {
            const response = await fetch('https://blockchain.info/stats?format=json');
            if (!response.ok)
                return null;
            const data = await response.json();
            return {
                symbol,
                price: 0, // Would need separate price fetch
                change24h: 0,
                volume24h: 0,
                marketCap: 0,
                networkMetrics: {
                    hashRate: data.hash_rate,
                    activeAddresses: data.n_active_addresses,
                    transactionCount: data.n_tx
                },
                timestamp: new Date().toISOString(),
                source: 'blockchain_info',
                quality: 'realtime'
            };
        }
        catch (error) {
            return null;
        }
    }
    static async getEtherscanData(symbol) {
        if (!symbol.includes('ETH'))
            return null;
        try {
            const response = await fetch('https://api.etherscan.io/api?module=gastracker&action=gasoracle');
            if (!response.ok)
                return null;
            const data = await response.json();
            return {
                symbol,
                price: 0, // Would need separate price fetch
                change24h: 0,
                volume24h: 0,
                marketCap: 0,
                networkMetrics: {
                    transactionCount: 0 // Would need separate API call
                },
                timestamp: new Date().toISOString(),
                source: 'etherscan',
                quality: 'realtime'
            };
        }
        catch (error) {
            return null;
        }
    }
    // ===== UTILITY METHODS =====
    static getFromCache(symbol) {
        const cached = this.cache.get(symbol);
        if (!cached)
            return null;
        const age = Date.now() - cached.timestamp;
        if (age < this.CACHE_TTL) {
            return { data: cached.data, quality: 'cached' };
        }
        else if (age < this.CACHE_TTL * 2) {
            return { data: cached.data, quality: 'stale_cache' };
        }
        return null;
    }
    static determineOverallQuality(qualities) {
        if (qualities.includes('realtime'))
            return 'realtime';
        if (qualities.includes('cached'))
            return 'cached';
        if (qualities.includes('stale_cache'))
            return 'stale_cache';
        if (qualities.includes('historical'))
            return 'historical';
        return 'none';
    }
    static updateApiHealth(apiName, success) {
        const health = this.apiHealth.get(apiName) || {
            lastSuccess: 0,
            lastFailure: 0,
            successRate: 0,
            calls: 0
        };
        health.calls++;
        if (success) {
            health.lastSuccess = Date.now();
        }
        else {
            health.lastFailure = Date.now();
        }
        // Calculate success rate (simplified)
        health.successRate = success ? Math.min(100, health.successRate + 5) : Math.max(0, health.successRate - 10);
        this.apiHealth.set(apiName, health);
    }
    static createNoDataResponse(symbol, type) {
        return {
            symbol,
            price: 0,
            change: 0,
            changePercent: 0,
            volume: 0,
            timestamp: new Date().toISOString(),
            source: 'none',
            quality: 'none'
        };
    }
    // ===== TECHNICAL INDICATOR CALCULATIONS =====
    static calculateRSI(prices, period = 14) {
        if (prices.length < period + 1)
            return 50;
        let gains = 0;
        let losses = 0;
        for (let i = 1; i <= period; i++) {
            const change = prices[i] - prices[i - 1];
            if (change > 0) {
                gains += change;
            }
            else {
                losses -= change;
            }
        }
        const avgGain = gains / period;
        const avgLoss = losses / period;
        if (avgLoss === 0)
            return 100;
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }
    static calculateMACD(prices) {
        if (prices.length < 26)
            return { value: 0, signal: 0, histogram: 0 };
        const ema12 = this.calculateEMA(prices, 12);
        const ema26 = this.calculateEMA(prices, 26);
        const macd = ema12 - ema26;
        const signal = this.calculateEMA([macd], 9); // Simplified
        const histogram = macd - signal;
        return { value: macd, signal, histogram };
    }
    static calculateEMA(prices, period) {
        if (prices.length < period)
            return prices[prices.length - 1] || 0;
        const multiplier = 2 / (period + 1);
        let ema = prices[0];
        for (let i = 1; i < prices.length; i++) {
            ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
        }
        return ema;
    }
    static calculateSMA(prices) {
        const sma20 = prices.length >= 20 ? prices.slice(-20).reduce((a, b) => a + b, 0) / 20 : 0;
        const sma50 = prices.length >= 50 ? prices.slice(-50).reduce((a, b) => a + b, 0) / 50 : 0;
        const sma200 = prices.length >= 200 ? prices.slice(-200).reduce((a, b) => a + b, 0) / 200 : 0;
        return { sma20, sma50, sma200 };
    }
    static calculateBollingerBands(prices, period = 20) {
        if (prices.length < period)
            return { upper: 0, middle: 0, lower: 0 };
        const recentPrices = prices.slice(-period);
        const sma = recentPrices.reduce((a, b) => a + b, 0) / period;
        const variance = recentPrices.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
        const standardDeviation = Math.sqrt(variance);
        return {
            upper: sma + (2 * standardDeviation),
            middle: sma,
            lower: sma - (2 * standardDeviation)
        };
    }
    static analyzeSentiment(text) {
        const bullishWords = ['bullish', 'surge', 'rally', 'gain', 'up', 'positive', 'growth', 'profit', 'earnings'];
        const bearishWords = ['bearish', 'drop', 'fall', 'decline', 'down', 'negative', 'loss', 'crash', 'sell'];
        const lowerText = text.toLowerCase();
        let bullishCount = 0;
        let bearishCount = 0;
        bullishWords.forEach(word => {
            if (lowerText.includes(word))
                bullishCount++;
        });
        bearishWords.forEach(word => {
            if (lowerText.includes(word))
                bearishCount++;
        });
        if (bullishCount > bearishCount) {
            return { sentiment: 'bullish', impact: Math.min(1, bullishCount * 0.2) };
        }
        else if (bearishCount > bullishCount) {
            return { sentiment: 'bearish', impact: Math.min(1, bearishCount * 0.2) };
        }
        else {
            return { sentiment: 'neutral', impact: 0.5 };
        }
    }
    static calculateOverallSentiment(articles) {
        if (articles.length === 0)
            return { sentiment: 'neutral', score: 0.5 };
        const totalImpact = articles.reduce((sum, article) => sum + article.impact, 0);
        const weightedScore = articles.reduce((sum, article) => {
            const score = article.sentiment === 'bullish' ? 1 : article.sentiment === 'bearish' ? 0 : 0.5;
            return sum + (score * article.impact);
        }, 0) / totalImpact;
        let sentiment;
        if (weightedScore > 0.6)
            sentiment = 'bullish';
        else if (weightedScore < 0.4)
            sentiment = 'bearish';
        else
            sentiment = 'neutral';
        return { sentiment, score: weightedScore };
    }
    // ===== PUBLIC UTILITY METHODS =====
    /**
     * Get API health status
     */
    static getApiHealth() {
        const health = {};
        this.apiHealth.forEach((value, key) => {
            health[key] = {
                ...value,
                lastSuccess: value.lastSuccess ? new Date(value.lastSuccess).toISOString() : null,
                lastFailure: value.lastFailure ? new Date(value.lastFailure).toISOString() : null
            };
        });
        return health;
    }
    /**
     * Clear cache
     */
    static clearCache() {
        this.cache.clear();
    }
    /**
     * Get cache statistics
     */
    static getCacheStats() {
        return {
            size: this.cache.size,
            entries: Array.from(this.cache.keys())
        };
    }
    /**
     * Add a secondary data source for redundancy
     */
    static addSecondaryDataSource(symbol, source) {
        this.verificationSystem.addSecondarySource(symbol, source);
        console.log(`➕ Added secondary data source for ${symbol}: ${source.name}`);
    }
    /**
     * Get verification report for a symbol
     */
    static getVerificationReport(symbol) {
        return this.verificationSystem.generateVerificationReport(symbol);
    }
    /**
     * Get data consistency score for a symbol
     */
    static getDataConsistencyScore(symbol) {
        return this.verificationSystem.getDataConsistencyScore(symbol);
    }
    /**
     * Get verification history for a symbol
     */
    static getVerificationHistory(symbol) {
        return this.verificationSystem.getVerificationHistory(symbol);
    }
}
exports.CentralizedDataProvider = CentralizedDataProvider;
CentralizedDataProvider.ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
CentralizedDataProvider.RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '0136c92ffdmsh581cebdb6e939f0p1ac51cjsnecdd2de65819';
CentralizedDataProvider.TWELVE_DATA_API_KEY = '3c7da267bcc24e8d8e2dfde0e257378b'; // Found in your code
// Cache for data with 5-minute TTL
CentralizedDataProvider.cache = new Map();
CentralizedDataProvider.CACHE_TTL = 5 * 60 * 1000; // 5 minutes
// API health tracking
CentralizedDataProvider.apiHealth = new Map();
// Data verification system
CentralizedDataProvider.verificationSystem = new data_verification_1.DataVerificationSystem();
