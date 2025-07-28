"use strict";
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
exports.FinancialDataProvider = void 0;
var real_scraper_1 = require("./scrapers/real-scraper");
var FinancialDataProvider = /** @class */ (function () {
    function FinancialDataProvider() {
    }
    FinancialDataProvider.getMarketData = function (symbol) {
        return __awaiter(this, void 0, void 0, function () {
            var rapidApiData, error_1, alphaVantageData, error_2, scraperData, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getRapidAPIData(symbol)];
                    case 1:
                        rapidApiData = _a.sent();
                        if (rapidApiData)
                            return [2 /*return*/, rapidApiData];
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.log("RapidAPI failed for ".concat(symbol, ":"), error_1 instanceof Error ? error_1.message : 'Unknown error');
                        return [3 /*break*/, 3];
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.getAlphaVantageData(symbol)];
                    case 4:
                        alphaVantageData = _a.sent();
                        if (alphaVantageData)
                            return [2 /*return*/, alphaVantageData];
                        return [3 /*break*/, 6];
                    case 5:
                        error_2 = _a.sent();
                        console.log("Alpha Vantage failed for ".concat(symbol, ":"), error_2 instanceof Error ? error_2.message : 'Unknown error');
                        return [3 /*break*/, 6];
                    case 6:
                        _a.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, real_scraper_1.RealFinancialScraper.scrapeComprehensiveData(symbol)];
                    case 7:
                        scraperData = _a.sent();
                        return [2 /*return*/, {
                                symbol: symbol,
                                price: scraperData.priceData.current,
                                change: scraperData.priceData.change,
                                changePercent: scraperData.priceData.changePercent,
                                volume: scraperData.priceData.volume,
                                timestamp: scraperData.timestamp,
                                source: 'scraper'
                            }];
                    case 8:
                        error_3 = _a.sent();
                        console.log("Scraper failed for ".concat(symbol, ":"), error_3 instanceof Error ? error_3.message : 'Unknown error');
                        return [3 /*break*/, 9];
                    case 9: 
                    // Priority 4: Minimal fallback (only for system stability)
                    return [2 /*return*/, this.getMinimalFallback(symbol)];
                }
            });
        });
    };
    FinancialDataProvider.getRapidAPIData = function (symbol) {
        return __awaiter(this, void 0, void 0, function () {
            var response, responseText, data, quote, error_4;
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
                        if (!response.ok) {
                            console.log("RapidAPI response not ok: ".concat(response.status, " ").concat(response.statusText));
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, response.text()];
                    case 3:
                        responseText = _d.sent();
                        // Check if response is HTML (error page)
                        if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
                            console.error('RapidAPI returned HTML instead of JSON:', responseText.substring(0, 200));
                            return [2 /*return*/, null];
                        }
                        data = void 0;
                        try {
                            data = JSON.parse(responseText);
                        }
                        catch (parseError) {
                            console.error('RapidAPI returned invalid JSON:', responseText.substring(0, 200));
                            return [2 /*return*/, null];
                        }
                        quote = (_c = (_b = (_a = data === null || data === void 0 ? void 0 : data.optionChain) === null || _a === void 0 ? void 0 : _a.result) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.quote;
                        if (!quote || !quote.regularMarketPrice)
                            return [2 /*return*/, null];
                        return [2 /*return*/, {
                                symbol: symbol,
                                price: quote.regularMarketPrice,
                                change: quote.regularMarketChange,
                                changePercent: quote.regularMarketChangePercent,
                                volume: quote.regularMarketVolume,
                                timestamp: new Date().toISOString(),
                                source: 'rapidapi_yahoo'
                            }];
                    case 4:
                        error_4 = _d.sent();
                        console.error('RapidAPI error:', error_4);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    FinancialDataProvider.getAlphaVantageData = function (symbol) {
        return __awaiter(this, void 0, void 0, function () {
            var cleanSymbol, response, responseText, data, quote, error_5;
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
                        if (!response.ok) {
                            console.log("Alpha Vantage response not ok: ".concat(response.status, " ").concat(response.statusText));
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, response.text()];
                    case 3:
                        responseText = _a.sent();
                        // Check if response is HTML (error page)
                        if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
                            console.error('Alpha Vantage returned HTML instead of JSON:', responseText.substring(0, 200));
                            return [2 /*return*/, null];
                        }
                        data = void 0;
                        try {
                            data = JSON.parse(responseText);
                        }
                        catch (parseError) {
                            console.error('Alpha Vantage returned invalid JSON:', responseText.substring(0, 200));
                            return [2 /*return*/, null];
                        }
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
                                source: 'alpha_vantage'
                            }];
                    case 4:
                        error_5 = _a.sent();
                        console.error('Alpha Vantage error:', error_5);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    FinancialDataProvider.getMinimalFallback = function (symbol) {
        // Only use minimal fallback for system stability
        // This should rarely be used
        console.warn("Using minimal fallback for ".concat(symbol, " - predictions may be unreliable"));
        return {
            symbol: symbol,
            price: 0,
            change: 0,
            changePercent: 0,
            volume: 0,
            timestamp: new Date().toISOString(),
            source: 'fallback'
        };
    };
    FinancialDataProvider.ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
    FinancialDataProvider.RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '0136c92ffdmsh581cebdb6e939f0p1ac51cjsnecdd2de65819';
    return FinancialDataProvider;
}());
exports.FinancialDataProvider = FinancialDataProvider;
