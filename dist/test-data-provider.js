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
require("dotenv/config");
var centralized_data_provider_1 = require("./src/lib/centralized-data-provider");
function testDataProvider() {
    return __awaiter(this, void 0, void 0, function () {
        var testSymbols, _i, testSymbols_1, symbol, startTime, data, processingTime, error_1, health, cacheStats;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🧪 Testing Centralized Data Provider\n');
                    console.log('='.repeat(60));
                    testSymbols = [
                        'BHP.AX', // ASX Stock
                        'AAPL', // US Stock
                        'BTC-USD', // Crypto
                        'ETH-USD' // Crypto
                    ];
                    console.log('📊 Testing Symbols:', testSymbols.join(', '));
                    console.log('');
                    _i = 0, testSymbols_1 = testSymbols;
                    _a.label = 1;
                case 1:
                    if (!(_i < testSymbols_1.length)) return [3 /*break*/, 6];
                    symbol = testSymbols_1[_i];
                    console.log("\n\uD83D\uDD0D Testing ".concat(symbol, "..."));
                    console.log('-'.repeat(40));
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    startTime = Date.now();
                    return [4 /*yield*/, centralized_data_provider_1.CentralizedDataProvider.getComprehensiveData(symbol)];
                case 3:
                    data = _a.sent();
                    processingTime = Date.now() - startTime;
                    console.log("\u2705 Data fetched in ".concat(processingTime, "ms"));
                    console.log("\uD83D\uDCC8 Quality: ".concat(data.overallQuality));
                    console.log("\uD83D\uDCB0 Price: $".concat(data.marketData.price));
                    console.log("\uD83D\uDCCA Change: ".concat(data.marketData.changePercent, "%"));
                    console.log("\uD83D\uDCF0 Sources: ".concat(data.sources.join(', ')));
                    if (data.warnings.length > 0) {
                        console.log("\u26A0\uFE0F  Warnings: ".concat(data.warnings.join(', ')));
                    }
                    // Show detailed breakdown
                    console.log('\n📋 Data Breakdown:');
                    console.log("  Market Data: ".concat(data.marketData.source, " (").concat(data.marketData.quality, ")"));
                    if (data.technicalData) {
                        console.log("  Technical Data: ".concat(data.technicalData.source, " (").concat(data.technicalData.quality, ")"));
                        console.log("    RSI: ".concat(data.technicalData.rsi.toFixed(2)));
                        console.log("    MACD: ".concat(data.technicalData.macd.value.toFixed(4)));
                    }
                    if (data.newsData) {
                        console.log("  News Data: ".concat(data.newsData.source, " (").concat(data.newsData.quality, ")"));
                        console.log("    Articles: ".concat(data.newsData.articles.length));
                        console.log("    Sentiment: ".concat(data.newsData.overallSentiment, " (").concat((data.newsData.sentimentScore * 100).toFixed(1), "%)"));
                    }
                    if (data.cryptoData) {
                        console.log("  Crypto Data: ".concat(data.cryptoData.source, " (").concat(data.cryptoData.quality, ")"));
                        console.log("    Market Cap: $".concat((data.cryptoData.marketCap / 1e9).toFixed(2), "B"));
                        if (data.cryptoData.networkMetrics) {
                            console.log("    Network Metrics: Available");
                        }
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error("\u274C Error testing ".concat(symbol, ":"), error_1 instanceof Error ? error_1.message : 'Unknown error');
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6:
                    // Test API health
                    console.log('\n\n🏥 API Health Report');
                    console.log('='.repeat(60));
                    health = centralized_data_provider_1.CentralizedDataProvider.getApiHealth();
                    if (Object.keys(health).length === 0) {
                        console.log('No API calls recorded yet. Run some tests first.');
                    }
                    else {
                        Object.entries(health).forEach(function (_a) {
                            var api = _a[0], stats = _a[1];
                            var status = stats.successRate > 80 ? '✅' : stats.successRate > 50 ? '🟡' : '❌';
                            console.log("".concat(status, " ").concat(api, ":"));
                            console.log("  Success Rate: ".concat(stats.successRate.toFixed(1), "%"));
                            console.log("  Calls: ".concat(stats.calls));
                            console.log("  Last Success: ".concat(stats.lastSuccess ? new Date(stats.lastSuccess).toLocaleString() : 'Never'));
                            console.log("  Last Failure: ".concat(stats.lastFailure ? new Date(stats.lastFailure).toLocaleString() : 'Never'));
                            console.log('');
                        });
                    }
                    // Test cache
                    console.log('💾 Cache Statistics');
                    console.log('='.repeat(60));
                    cacheStats = centralized_data_provider_1.CentralizedDataProvider.getCacheStats();
                    console.log("Cache Size: ".concat(cacheStats.size, " entries"));
                    if (cacheStats.entries.length > 0) {
                        console.log("Cached Symbols: ".concat(cacheStats.entries.join(', ')));
                    }
                    console.log('\n🎉 Data Provider Test Complete!');
                    return [2 /*return*/];
            }
        });
    });
}
// Test individual APIs
function testIndividualAPIs() {
    return __awaiter(this, void 0, void 0, function () {
        var testSymbol, data, error_2, data, error_3, data, error_4, data, error_5, data, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('\n\n🔧 Testing Individual APIs');
                    console.log('='.repeat(60));
                    testSymbol = 'BHP.AX';
                    // Test RapidAPI
                    console.log('\n🔄 Testing RapidAPI Yahoo Finance...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, centralized_data_provider_1.CentralizedDataProvider.getComprehensiveData(testSymbol)];
                case 2:
                    data = _a.sent();
                    console.log("\u2705 RapidAPI: ".concat(data.marketData.source === 'rapidapi_yahoo' ? 'Working' : 'Not used'));
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.log('❌ RapidAPI: Failed');
                    return [3 /*break*/, 4];
                case 4:
                    // Test Alpha Vantage
                    console.log('\n🔄 Testing Alpha Vantage...');
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, centralized_data_provider_1.CentralizedDataProvider.getComprehensiveData(testSymbol)];
                case 6:
                    data = _a.sent();
                    console.log("\u2705 Alpha Vantage: ".concat(data.marketData.source === 'alpha_vantage' ? 'Working' : 'Not used'));
                    return [3 /*break*/, 8];
                case 7:
                    error_3 = _a.sent();
                    console.log('❌ Alpha Vantage: Failed');
                    return [3 /*break*/, 8];
                case 8:
                    // Test Twelve Data
                    console.log('\n🔄 Testing Twelve Data...');
                    _a.label = 9;
                case 9:
                    _a.trys.push([9, 11, , 12]);
                    return [4 /*yield*/, centralized_data_provider_1.CentralizedDataProvider.getComprehensiveData(testSymbol)];
                case 10:
                    data = _a.sent();
                    console.log("\u2705 Twelve Data: ".concat(data.marketData.source === 'twelve_data' ? 'Working' : 'Not used'));
                    return [3 /*break*/, 12];
                case 11:
                    error_4 = _a.sent();
                    console.log('❌ Twelve Data: Failed');
                    return [3 /*break*/, 12];
                case 12:
                    // Test CoinGecko
                    console.log('\n🔄 Testing CoinGecko...');
                    _a.label = 13;
                case 13:
                    _a.trys.push([13, 15, , 16]);
                    return [4 /*yield*/, centralized_data_provider_1.CentralizedDataProvider.getComprehensiveData('BTC-USD')];
                case 14:
                    data = _a.sent();
                    console.log("\u2705 CoinGecko: ".concat(data.marketData.source === 'coingecko' ? 'Working' : 'Not used'));
                    return [3 /*break*/, 16];
                case 15:
                    error_5 = _a.sent();
                    console.log('❌ CoinGecko: Failed');
                    return [3 /*break*/, 16];
                case 16:
                    // Test Scraper
                    console.log('\n🔄 Testing Scraper...');
                    _a.label = 17;
                case 17:
                    _a.trys.push([17, 19, , 20]);
                    return [4 /*yield*/, centralized_data_provider_1.CentralizedDataProvider.getComprehensiveData(testSymbol)];
                case 18:
                    data = _a.sent();
                    console.log("\u2705 Scraper: ".concat(data.marketData.source === 'scraper' ? 'Working' : 'Not used'));
                    return [3 /*break*/, 20];
                case 19:
                    error_6 = _a.sent();
                    console.log('❌ Scraper: Failed');
                    return [3 /*break*/, 20];
                case 20: return [2 /*return*/];
            }
        });
    });
}
// Run tests
function runAllTests() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, testDataProvider()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, testIndividualAPIs()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
runAllTests().catch(console.error);
