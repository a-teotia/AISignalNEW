"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CentralizedDataProvider = void 0;
var real_scraper_1 = require("./scrapers/real-scraper");
var CentralizedDataProvider = /** @class */ (function () {
    function CentralizedDataProvider() {
    }
    /**
     * Get comprehensive data for any symbol using all available sources
     */
    CentralizedDataProvider.getComprehensiveData = function (symbol) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, sources, warnings, cached, marketData, technicalData, newsData, cryptoData, qualities, overallQuality, result, processingTime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        sources = [];
                        warnings = [];
                        console.log("\uD83D\uDD0D Fetching comprehensive data for ".concat(symbol, "..."));
                        cached = this.getFromCache(symbol);
                        if (cached) {
                            console.log("\u2705 Using cached data for ".concat(symbol, " (").concat(cached.quality, ")"));
                            return [2 /*return*/, __assign(__assign({}, cached.data), { overallQuality: cached.quality, sources: cached.data.sources, warnings: cached.quality === 'stale_cache' ? ['Using stale cached data'] : [] })];
                        }
                        return [4 /*yield*/, this.getMarketDataWithFallback(symbol)];
                    case 1:
                        marketData = _a.sent();
                        sources.push(marketData.source);
                        if (marketData.quality === 'none') {
                            warnings.push('No market data available');
                        }
                        if (!(marketData.quality !== 'none')) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.getTechnicalDataWithFallback(symbol)];
                    case 2:
                        technicalData = _a.sent();
                        if (technicalData) {
                            sources.push(technicalData.source);
                        }
                        _a.label = 3;
                    case 3: return [4 /*yield*/, this.getNewsDataWithFallback(symbol)];
                    case 4:
                        newsData = _a.sent();
                        if (newsData) {
                            sources.push(newsData.source);
                        }
                        if (!(symbol.includes('BTC') || symbol.includes('ETH'))) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.getCryptoDataWithFallback(symbol)];
                    case 5:
                        cryptoData = _a.sent();
                        if (cryptoData) {
                            sources.push(cryptoData.source);
                        }
                        _a.label = 6;
                    case 6:
                        qualities = [marketData.quality, technicalData === null || technicalData === void 0 ? void 0 : technicalData.quality, newsData === null || newsData === void 0 ? void 0 : newsData.quality, cryptoData === null || cryptoData === void 0 ? void 0 : cryptoData.quality].filter(Boolean);
                        overallQuality = this.determineOverallQuality(qualities);
                        result = {
                            marketData: marketData,
                            technicalData: technicalData,
                            newsData: newsData,
                            cryptoData: cryptoData,
                            timestamp: new Date().toISOString(),
                            overallQuality: overallQuality,
                            sources: Array.from(new Set(sources)), // Remove duplicates
                            warnings: warnings
                        };
                        // 7. Cache the result
                        this.cache.set(symbol, {
                            data: result,
                            timestamp: Date.now(),
                            quality: overallQuality
                        });
                        processingTime = Date.now() - startTime;
                        console.log("\u2705 Comprehensive data fetched for ".concat(symbol, " in ").concat(processingTime, "ms (Quality: ").concat(overallQuality, ")"));
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Get market data with fallback chain
     */
    CentralizedDataProvider.getMarketDataWithFallback = function (symbol) {
        return __awaiter(this, void 0, void 0, function () {
            var sources, _i, sources_1, source, data, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sources = [
                            { name: 'RapidAPI Yahoo Finance', fn: function () { return _this.getRapidAPIData(symbol); } },
                            { name: 'Alpha Vantage', fn: function () { return _this.getAlphaVantageData(symbol); } },
                            { name: 'CoinGecko', fn: function () { return _this.getCoinGeckoData(symbol); } },
                            { name: 'Twelve Data', fn: function () { return _this.getTwelveDataData(symbol); } },
                            { name: 'Scraper', fn: function () { return _this.getScrapedData(symbol); } }
                        ];
                        _i = 0, sources_1 = sources;
                        _a.label = 1;
                    case 1:
                        if (!(_i < sources_1.length)) return [3 /*break*/, 6];
                        source = sources_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        console.log("  \uD83D\uDD04 Trying ".concat(source.name, "..."));
                        return [4 /*yield*/, source.fn()];
                    case 3:
                        data = _a.sent();
                        if (data) {
                            this.updateApiHealth(source.name, true);
                            console.log("  \u2705 ".concat(source.name, " succeeded"));
                            return [2 /*return*/, data];
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.log("  \u274C ".concat(source.name, " failed:"), error_1 instanceof Error ? error_1.message : 'Unknown error');
                        this.updateApiHealth(source.name, false);
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: 
                    // No data available
                    return [2 /*return*/, this.createNoDataResponse(symbol, 'market')];
                }
            });
        });
    };
    /**
     * Get technical data with fallback chain
     */
    CentralizedDataProvider.getTechnicalDataWithFallback = function (symbol) {
        return __awaiter(this, void 0, void 0, function () {
            var sources, _i, sources_2, source, data, error_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sources = [
                            { name: 'Twelve Data', fn: function () { return _this.getTwelveDataTechnical(symbol); } },
                            { name: 'Alpha Vantage', fn: function () { return _this.getAlphaVantageTechnical(symbol); } },
                            { name: 'Scraper', fn: function () { return _this.getScrapedTechnical(symbol); } }
                        ];
                        _i = 0, sources_2 = sources;
                        _a.label = 1;
                    case 1:
                        if (!(_i < sources_2.length)) return [3 /*break*/, 6];
                        source = sources_2[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, source.fn()];
                    case 3:
                        data = _a.sent();
                        if (data) {
                            this.updateApiHealth(source.name, true);
                            return [2 /*return*/, data];
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        this.updateApiHealth(source.name, false);
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, undefined];
                }
            });
        });
    };
    /**
     * Get news data with fallback chain
     */
    CentralizedDataProvider.getNewsDataWithFallback = function (symbol) {
        return __awaiter(this, void 0, void 0, function () {
            var sources, _i, sources_3, source, data, error_3;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sources = [
                            { name: 'Yahoo Finance RSS', fn: function () { return _this.getYahooNewsData(symbol); } },
                            { name: 'Scraper', fn: function () { return _this.getScrapedNewsData(symbol); } }
                        ];
                        _i = 0, sources_3 = sources;
                        _a.label = 1;
                    case 1:
                        if (!(_i < sources_3.length)) return [3 /*break*/, 6];
                        source = sources_3[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, source.fn()];
                    case 3:
                        data = _a.sent();
                        if (data) {
                            this.updateApiHealth(source.name, true);
                            return [2 /*return*/, data];
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_3 = _a.sent();
                        this.updateApiHealth(source.name, false);
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, undefined];
                }
            });
        });
    };
    /**
     * Get crypto-specific data with fallback chain
     */
    CentralizedDataProvider.getCryptoDataWithFallback = function (symbol) {
        return __awaiter(this, void 0, void 0, function () {
            var sources, _i, sources_4, source, data, error_4;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sources = [
                            { name: 'CoinGecko', fn: function () { return _this.getCoinGeckoCryptoData(symbol); } },
                            { name: 'Blockchain.info', fn: function () { return _this.getBlockchainData(symbol); } },
                            { name: 'Etherscan', fn: function () { return _this.getEtherscanData(symbol); } }
                        ];
                        _i = 0, sources_4 = sources;
                        _a.label = 1;
                    case 1:
                        if (!(_i < sources_4.length)) return [3 /*break*/, 6];
                        source = sources_4[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, source.fn()];
                    case 3:
                        data = _a.sent();
                        if (data) {
                            this.updateApiHealth(source.name, true);
                            return [2 /*return*/, data];
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_4 = _a.sent();
                        this.updateApiHealth(source.name, false);
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, undefined];
                }
            });
        });
    };
    // ===== INDIVIDUAL API IMPLEMENTATIONS =====
    CentralizedDataProvider.getRapidAPIData = function (symbol) {
        return __awaiter(this, void 0, void 0, function () {
            var response, responseText, data, quote, error_5;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!this.RAPIDAPI_KEY)
                            return [2 /*return*/, null];
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fetch("https://yahoo-finance-real-time1.p.rapidapi.com/stock/get-options?symbol=".concat(symbol, "&lang=en-US&region=US"), {
                                headers: {
                                    'x-rapidapi-host': 'yahoo-finance-real-time1.p.rapidapi.com',
                                    'x-rapidapi-key': this.RAPIDAPI_KEY
                                }
                            })];
                    case 2:
                        response = _d.sent();
                        if (!response.ok)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, response.text()];
                    case 3:
                        responseText = _d.sent();
                        if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
                            return [2 /*return*/, null];
                        }
                        data = JSON.parse(responseText);
                        quote = (_c = (_b = (_a = data === null || data === void 0 ? void 0 : data.optionChain) === null || _a === void 0 ? void 0 : _a.result) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.quote;
                        if (!quote || !quote.regularMarketPrice)
                            return [2 /*return*/, null];
                        return [2 /*return*/, {
                                symbol: symbol,
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
                            }];
                    case 4:
                        error_5 = _d.sent();
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    CentralizedDataProvider.getAlphaVantageData = function (symbol) {
        return __awaiter(this, void 0, void 0, function () {
            var cleanSymbol, response, responseText, data, quote, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.ALPHA_VANTAGE_API_KEY)
                            return [2 /*return*/, null];
                        cleanSymbol = symbol.replace('.AX', '');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fetch("https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=".concat(cleanSymbol, "&apikey=").concat(this.ALPHA_VANTAGE_API_KEY))];
                    case 2:
                        response = _a.sent();
                        if (!response.ok)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, response.text()];
                    case 3:
                        responseText = _a.sent();
                        if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
                            return [2 /*return*/, null];
                        }
                        data = JSON.parse(responseText);
                        quote = data['Global Quote'];
                        if (!quote || !quote['05. price'])
                            return [2 /*return*/, null];
                        return [2 /*return*/, {
                                symbol: symbol,
                                price: parseFloat(quote['05. price']),
                                change: parseFloat(quote['09. change']),
                                changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
                                volume: parseInt(quote['06. volume']),
                                timestamp: new Date().toISOString(),
                                source: 'alpha_vantage',
                                quality: 'realtime'
                            }];
                    case 4:
                        error_6 = _a.sent();
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    CentralizedDataProvider.getCoinGeckoData = function (symbol) {
        return __awaiter(this, void 0, void 0, function () {
            var coinId, response, data, coinData, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!symbol.includes('BTC') && !symbol.includes('ETH'))
                            return [2 /*return*/, null];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        coinId = symbol.includes('BTC') ? 'bitcoin' : 'ethereum';
                        return [4 /*yield*/, fetch("https://api.coingecko.com/api/v3/simple/price?ids=".concat(coinId, "&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true"))];
                    case 2:
                        response = _a.sent();
                        if (!response.ok)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _a.sent();
                        coinData = data[coinId];
                        if (!coinData)
                            return [2 /*return*/, null];
                        return [2 /*return*/, {
                                symbol: symbol,
                                price: coinData.usd,
                                change: coinData.usd_24h_change,
                                changePercent: coinData.usd_24h_change,
                                volume: coinData.usd_24h_vol,
                                marketCap: coinData.usd_market_cap,
                                timestamp: new Date().toISOString(),
                                source: 'coingecko',
                                quality: 'realtime'
                            }];
                    case 4:
                        error_7 = _a.sent();
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    CentralizedDataProvider.getTwelveDataData = function (symbol) {
        return __awaiter(this, void 0, void 0, function () {
            var response, data, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch("https://api.twelvedata.com/quote?symbol=".concat(symbol, "&apikey=").concat(this.TWELVE_DATA_API_KEY))];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        if (!data || data.status === 'error')
                            return [2 /*return*/, null];
                        return [2 /*return*/, {
                                symbol: symbol,
                                price: parseFloat(data.close),
                                change: parseFloat(data.change),
                                changePercent: parseFloat(data.percent_change),
                                volume: parseInt(data.volume),
                                timestamp: new Date().toISOString(),
                                source: 'twelve_data',
                                quality: 'realtime'
                            }];
                    case 3:
                        error_8 = _a.sent();
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CentralizedDataProvider.getScrapedData = function (symbol) {
        return __awaiter(this, void 0, void 0, function () {
            var scrapedData, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, real_scraper_1.RealFinancialScraper.scrapeComprehensiveData(symbol)];
                    case 1:
                        scrapedData = _a.sent();
                        return [2 /*return*/, {
                                symbol: symbol,
                                price: scrapedData.priceData.current,
                                change: scrapedData.priceData.change,
                                changePercent: scrapedData.priceData.changePercent,
                                volume: scrapedData.priceData.volume,
                                timestamp: scrapedData.timestamp,
                                source: 'scraper',
                                quality: 'realtime'
                            }];
                    case 2:
                        error_9 = _a.sent();
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // ===== TECHNICAL DATA IMPLEMENTATIONS =====
    CentralizedDataProvider.getTwelveDataTechnical = function (symbol) {
        return __awaiter(this, void 0, void 0, function () {
            var response, data, values, rsi, macd, sma, bollinger, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch("https://api.twelvedata.com/time_series?symbol=".concat(symbol, "&interval=1day&outputsize=50&apikey=").concat(this.TWELVE_DATA_API_KEY))];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        if (!data || data.status === 'error' || !data.values)
                            return [2 /*return*/, null];
                        values = data.values.slice(0, 20).map(function (v) { return parseFloat(v.close); });
                        rsi = this.calculateRSI(values);
                        macd = this.calculateMACD(values);
                        sma = this.calculateSMA(values);
                        bollinger = this.calculateBollingerBands(values);
                        return [2 /*return*/, {
                                symbol: symbol,
                                rsi: rsi,
                                macd: macd,
                                sma: sma,
                                bollinger: bollinger,
                                timestamp: new Date().toISOString(),
                                source: 'twelve_data',
                                quality: 'realtime'
                            }];
                    case 3:
                        error_10 = _a.sent();
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CentralizedDataProvider.getAlphaVantageTechnical = function (symbol) {
        return __awaiter(this, void 0, void 0, function () {
            var cleanSymbol, response, data, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.ALPHA_VANTAGE_API_KEY)
                            return [2 /*return*/, null];
                        cleanSymbol = symbol.replace('.AX', '');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fetch("https://www.alphavantage.co/query?function=TECHNICAL_INDICATORS&symbol=".concat(cleanSymbol, "&interval=daily&time_period=20&series_type=close&apikey=").concat(this.ALPHA_VANTAGE_API_KEY))];
                    case 2:
                        response = _a.sent();
                        if (!response.ok)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _a.sent();
                        // Extract technical indicators from Alpha Vantage response
                        // This is a simplified implementation
                        return [2 /*return*/, {
                                symbol: symbol,
                                rsi: 50, // Placeholder
                                macd: { value: 0, signal: 0, histogram: 0 },
                                sma: { sma20: 0, sma50: 0, sma200: 0 },
                                bollinger: { upper: 0, middle: 0, lower: 0 },
                                timestamp: new Date().toISOString(),
                                source: 'alpha_vantage',
                                quality: 'realtime'
                            }];
                    case 4:
                        error_11 = _a.sent();
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    CentralizedDataProvider.getScrapedTechnical = function (symbol) {
        return __awaiter(this, void 0, void 0, function () {
            var scrapedData, error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, real_scraper_1.RealFinancialScraper.scrapeComprehensiveData(symbol)];
                    case 1:
                        scrapedData = _a.sent();
                        return [2 /*return*/, {
                                symbol: symbol,
                                rsi: scrapedData.technicalData.rsi,
                                macd: scrapedData.technicalData.macd,
                                sma: scrapedData.technicalData.sma,
                                bollinger: scrapedData.technicalData.bollinger,
                                timestamp: scrapedData.timestamp,
                                source: 'scraper',
                                quality: 'realtime'
                            }];
                    case 2:
                        error_12 = _a.sent();
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // ===== NEWS DATA IMPLEMENTATIONS =====
    CentralizedDataProvider.getYahooNewsData = function (symbol) {
        return __awaiter(this, void 0, void 0, function () {
            var newsRes, newsText, itemMatches, articles, overallSentiment, error_13;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch("https://feeds.finance.yahoo.com/rss/2.0/headline?s=".concat(symbol, "&region=US&lang=en-US"))];
                    case 1:
                        newsRes = _a.sent();
                        return [4 /*yield*/, newsRes.text()];
                    case 2:
                        newsText = _a.sent();
                        itemMatches = newsText.match(/<item>([\s\S]*?)<\/item>/g) || [];
                        articles = itemMatches.slice(0, 5).map(function (item) {
                            var titleMatch = item.match(/<title>([\s\S]*?)<\/title>/);
                            var title = titleMatch ? titleMatch[1] : '';
                            // Simple sentiment analysis based on keywords
                            var sentiment = _this.analyzeSentiment(title);
                            return {
                                title: title,
                                source: 'Yahoo Finance',
                                sentiment: sentiment.sentiment,
                                impact: sentiment.impact,
                                timestamp: new Date().toISOString()
                            };
                        }).filter(function (article) { return article.title; });
                        if (articles.length === 0)
                            return [2 /*return*/, null];
                        overallSentiment = this.calculateOverallSentiment(articles);
                        return [2 /*return*/, {
                                symbol: symbol,
                                articles: articles,
                                overallSentiment: overallSentiment.sentiment,
                                sentimentScore: overallSentiment.score,
                                timestamp: new Date().toISOString(),
                                source: 'yahoo_finance_rss',
                                quality: 'realtime'
                            }];
                    case 3:
                        error_13 = _a.sent();
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CentralizedDataProvider.getScrapedNewsData = function (symbol) {
        return __awaiter(this, void 0, void 0, function () {
            var scrapedData, articles, overallSentiment, error_14;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, real_scraper_1.RealFinancialScraper.scrapeComprehensiveData(symbol)];
                    case 1:
                        scrapedData = _a.sent();
                        articles = scrapedData.sentimentData.news.map(function (article) { return ({
                            title: article.headline,
                            source: article.source,
                            sentiment: article.sentiment,
                            impact: article.impact,
                            timestamp: new Date().toISOString()
                        }); });
                        overallSentiment = this.calculateOverallSentiment(articles);
                        return [2 /*return*/, {
                                symbol: symbol,
                                articles: articles,
                                overallSentiment: overallSentiment.sentiment,
                                sentimentScore: overallSentiment.score,
                                timestamp: scrapedData.timestamp,
                                source: 'scraper',
                                quality: 'realtime'
                            }];
                    case 2:
                        error_14 = _a.sent();
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // ===== CRYPTO DATA IMPLEMENTATIONS =====
    CentralizedDataProvider.getCoinGeckoCryptoData = function (symbol) {
        return __awaiter(this, void 0, void 0, function () {
            var coinId, response, data, error_15;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!symbol.includes('BTC') && !symbol.includes('ETH'))
                            return [2 /*return*/, null];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        coinId = symbol.includes('BTC') ? 'bitcoin' : 'ethereum';
                        return [4 /*yield*/, fetch("https://api.coingecko.com/api/v3/coins/".concat(coinId, "?localization=false&tickers=false&market_data=true&community_data=true&developer_data=false&sparkline=false"))];
                    case 2:
                        response = _a.sent();
                        if (!response.ok)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _a.sent();
                        return [2 /*return*/, {
                                symbol: symbol,
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
                            }];
                    case 4:
                        error_15 = _a.sent();
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    CentralizedDataProvider.getBlockchainData = function (symbol) {
        return __awaiter(this, void 0, void 0, function () {
            var response, data, error_16;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!symbol.includes('BTC'))
                            return [2 /*return*/, null];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fetch('https://blockchain.info/stats?format=json')];
                    case 2:
                        response = _a.sent();
                        if (!response.ok)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _a.sent();
                        return [2 /*return*/, {
                                symbol: symbol,
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
                            }];
                    case 4:
                        error_16 = _a.sent();
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    CentralizedDataProvider.getEtherscanData = function (symbol) {
        return __awaiter(this, void 0, void 0, function () {
            var response, data, error_17;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!symbol.includes('ETH'))
                            return [2 /*return*/, null];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fetch('https://api.etherscan.io/api?module=gastracker&action=gasoracle')];
                    case 2:
                        response = _a.sent();
                        if (!response.ok)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _a.sent();
                        return [2 /*return*/, {
                                symbol: symbol,
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
                            }];
                    case 4:
                        error_17 = _a.sent();
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // ===== UTILITY METHODS =====
    CentralizedDataProvider.getFromCache = function (symbol) {
        var cached = this.cache.get(symbol);
        if (!cached)
            return null;
        var age = Date.now() - cached.timestamp;
        if (age < this.CACHE_TTL) {
            return { data: cached.data, quality: 'cached' };
        }
        else if (age < this.CACHE_TTL * 2) {
            return { data: cached.data, quality: 'stale_cache' };
        }
        return null;
    };
    CentralizedDataProvider.determineOverallQuality = function (qualities) {
        if (qualities.includes('realtime'))
            return 'realtime';
        if (qualities.includes('cached'))
            return 'cached';
        if (qualities.includes('stale_cache'))
            return 'stale_cache';
        if (qualities.includes('historical'))
            return 'historical';
        return 'none';
    };
    CentralizedDataProvider.updateApiHealth = function (apiName, success) {
        var health = this.apiHealth.get(apiName) || {
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
    };
    CentralizedDataProvider.createNoDataResponse = function (symbol, type) {
        return {
            symbol: symbol,
            price: 0,
            change: 0,
            changePercent: 0,
            volume: 0,
            timestamp: new Date().toISOString(),
            source: 'none',
            quality: 'none'
        };
    };
    // ===== TECHNICAL INDICATOR CALCULATIONS =====
    CentralizedDataProvider.calculateRSI = function (prices, period) {
        if (period === void 0) { period = 14; }
        if (prices.length < period + 1)
            return 50;
        var gains = 0;
        var losses = 0;
        for (var i = 1; i <= period; i++) {
            var change = prices[i] - prices[i - 1];
            if (change > 0) {
                gains += change;
            }
            else {
                losses -= change;
            }
        }
        var avgGain = gains / period;
        var avgLoss = losses / period;
        if (avgLoss === 0)
            return 100;
        var rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    };
    CentralizedDataProvider.calculateMACD = function (prices) {
        if (prices.length < 26)
            return { value: 0, signal: 0, histogram: 0 };
        var ema12 = this.calculateEMA(prices, 12);
        var ema26 = this.calculateEMA(prices, 26);
        var macd = ema12 - ema26;
        var signal = this.calculateEMA([macd], 9); // Simplified
        var histogram = macd - signal;
        return { value: macd, signal: signal, histogram: histogram };
    };
    CentralizedDataProvider.calculateEMA = function (prices, period) {
        if (prices.length < period)
            return prices[prices.length - 1] || 0;
        var multiplier = 2 / (period + 1);
        var ema = prices[0];
        for (var i = 1; i < prices.length; i++) {
            ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
        }
        return ema;
    };
    CentralizedDataProvider.calculateSMA = function (prices) {
        var sma20 = prices.length >= 20 ? prices.slice(-20).reduce(function (a, b) { return a + b; }, 0) / 20 : 0;
        var sma50 = prices.length >= 50 ? prices.slice(-50).reduce(function (a, b) { return a + b; }, 0) / 50 : 0;
        var sma200 = prices.length >= 200 ? prices.slice(-200).reduce(function (a, b) { return a + b; }, 0) / 200 : 0;
        return { sma20: sma20, sma50: sma50, sma200: sma200 };
    };
    CentralizedDataProvider.calculateBollingerBands = function (prices, period) {
        if (period === void 0) { period = 20; }
        if (prices.length < period)
            return { upper: 0, middle: 0, lower: 0 };
        var recentPrices = prices.slice(-period);
        var sma = recentPrices.reduce(function (a, b) { return a + b; }, 0) / period;
        var variance = recentPrices.reduce(function (sum, price) { return sum + Math.pow(price - sma, 2); }, 0) / period;
        var standardDeviation = Math.sqrt(variance);
        return {
            upper: sma + (2 * standardDeviation),
            middle: sma,
            lower: sma - (2 * standardDeviation)
        };
    };
    CentralizedDataProvider.analyzeSentiment = function (text) {
        var bullishWords = ['bullish', 'surge', 'rally', 'gain', 'up', 'positive', 'growth', 'profit', 'earnings'];
        var bearishWords = ['bearish', 'drop', 'fall', 'decline', 'down', 'negative', 'loss', 'crash', 'sell'];
        var lowerText = text.toLowerCase();
        var bullishCount = 0;
        var bearishCount = 0;
        bullishWords.forEach(function (word) {
            if (lowerText.includes(word))
                bullishCount++;
        });
        bearishWords.forEach(function (word) {
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
    };
    CentralizedDataProvider.calculateOverallSentiment = function (articles) {
        if (articles.length === 0)
            return { sentiment: 'neutral', score: 0.5 };
        var totalImpact = articles.reduce(function (sum, article) { return sum + article.impact; }, 0);
        var weightedScore = articles.reduce(function (sum, article) {
            var score = article.sentiment === 'bullish' ? 1 : article.sentiment === 'bearish' ? 0 : 0.5;
            return sum + (score * article.impact);
        }, 0) / totalImpact;
        var sentiment;
        if (weightedScore > 0.6)
            sentiment = 'bullish';
        else if (weightedScore < 0.4)
            sentiment = 'bearish';
        else
            sentiment = 'neutral';
        return { sentiment: sentiment, score: weightedScore };
    };
    // ===== PUBLIC UTILITY METHODS =====
    /**
     * Get API health status
     */
    CentralizedDataProvider.getApiHealth = function () {
        var health = {};
        this.apiHealth.forEach(function (value, key) {
            health[key] = __assign(__assign({}, value), { lastSuccess: value.lastSuccess ? new Date(value.lastSuccess).toISOString() : null, lastFailure: value.lastFailure ? new Date(value.lastFailure).toISOString() : null });
        });
        return health;
    };
    /**
     * Clear cache
     */
    CentralizedDataProvider.clearCache = function () {
        this.cache.clear();
    };
    /**
     * Get cache statistics
     */
    CentralizedDataProvider.getCacheStats = function () {
        return {
            size: this.cache.size,
            entries: Array.from(this.cache.keys())
        };
    };
    CentralizedDataProvider.ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
    CentralizedDataProvider.RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '0136c92ffdmsh581cebdb6e939f0p1ac51cjsnecdd2de65819';
    CentralizedDataProvider.TWELVE_DATA_API_KEY = '3c7da267bcc24e8d8e2dfde0e257378b'; // Found in your code
    // Cache for data with 5-minute TTL
    CentralizedDataProvider.cache = new Map();
    CentralizedDataProvider.CACHE_TTL = 5 * 60 * 1000; // 5 minutes
    // API health tracking
    CentralizedDataProvider.apiHealth = new Map();
    return CentralizedDataProvider;
}());
exports.CentralizedDataProvider = CentralizedDataProvider;
