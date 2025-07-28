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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAgent = void 0;
var BaseAgent = /** @class */ (function () {
    function BaseAgent(config) {
        this.config = config;
    }
    BaseAgent.prototype.callAI = function (prompt, context) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, isO3, body, response, responseText, data, processingTime, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        startTime = Date.now();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        isO3 = this.config.model && this.config.model.startsWith('o3');
                        body = {
                            model: this.config.model,
                            messages: [
                                {
                                    role: "system",
                                    content: "You are ".concat(this.config.name, ": ").concat(this.config.description, ". \n            Always respond with valid JSON. Include confidence scores (0-100) and cite your sources.")
                                },
                                {
                                    role: "user",
                                    content: prompt
                                }
                            ],
                        };
                        if (!isO3) {
                            body['temperature'] = this.config.temperature;
                        }
                        if (isO3) {
                            body['max_completion_tokens'] = this.config.maxTokens;
                        }
                        else {
                            body['max_tokens'] = this.config.maxTokens;
                        }
                        return [4 /*yield*/, fetch("https://api.openai.com/v1/chat/completions", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: "Bearer ".concat(process.env.OPENAI_API_KEY),
                                },
                                body: JSON.stringify(body),
                            })];
                    case 2:
                        response = _b.sent();
                        return [4 /*yield*/, response.text()];
                    case 3:
                        responseText = _b.sent();
                        // Check if response is HTML (error page)
                        if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
                            console.error("".concat(this.config.name, " OpenAI returned HTML instead of JSON:"), responseText.substring(0, 200));
                            throw new Error('OpenAI API returned HTML error page');
                        }
                        data = void 0;
                        try {
                            data = JSON.parse(responseText);
                        }
                        catch (parseError) {
                            console.error("".concat(this.config.name, " OpenAI returned invalid JSON:"), responseText.substring(0, 200));
                            throw new Error('OpenAI API returned invalid JSON');
                        }
                        processingTime = Date.now() - startTime;
                        if (!response.ok) {
                            throw new Error("AI API error: ".concat(((_a = data.error) === null || _a === void 0 ? void 0 : _a.message) || 'Unknown error'));
                        }
                        return [2 /*return*/, {
                                content: data.choices[0].message.content,
                                processingTime: processingTime
                            }];
                    case 4:
                        error_1 = _b.sent();
                        console.error("".concat(this.config.name, " error:"), error_1);
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    BaseAgent.prototype.callPerplexity = function (prompt) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, response, text, data, processingTime, error_2;
            var _a, _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        startTime = Date.now();
                        // Check if API key is configured
                        if (!process.env.PERPLEXITY_API_KEY || process.env.PERPLEXITY_API_KEY === 'your_perplexity_api_key_here') {
                            console.warn("".concat(this.config.name, ": PERPLEXITY_API_KEY not configured. Skipping Perplexity API call."));
                            return [2 /*return*/, {
                                    content: JSON.stringify({
                                        error: "Perplexity API not configured",
                                        message: "Please add PERPLEXITY_API_KEY to your environment variables"
                                    }),
                                    processingTime: Date.now() - startTime
                                }];
                        }
                        _g.label = 1;
                    case 1:
                        _g.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fetch("https://api.perplexity.ai/chat/completions", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: "Bearer ".concat(process.env.PERPLEXITY_API_KEY),
                                },
                                body: JSON.stringify({
                                    model: this.config.model || "sonar",
                                    messages: [
                                        {
                                            role: "user",
                                            content: prompt
                                        }
                                    ],
                                }),
                            })];
                    case 2:
                        response = _g.sent();
                        return [4 /*yield*/, response.text()];
                    case 3:
                        text = _g.sent();
                        console.log("".concat(this.config.name, " Perplexity raw response:"), text.substring(0, 200) + '...');
                        // Check if response is HTML (error page)
                        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
                            console.error("".concat(this.config.name, " Perplexity returned HTML instead of JSON:"), text.substring(0, 200));
                            throw new Error('Perplexity API returned HTML error page');
                        }
                        data = void 0;
                        try {
                            data = JSON.parse(text);
                        }
                        catch (err) {
                            console.error("".concat(this.config.name, " Perplexity error: Response was not valid JSON."), text.substring(0, 200));
                            throw new Error('Perplexity API did not return valid JSON.');
                        }
                        processingTime = Date.now() - startTime;
                        if (!response.ok) {
                            throw new Error("Perplexity API error: ".concat(((_a = data.error) === null || _a === void 0 ? void 0 : _a.message) || 'Unknown error'));
                        }
                        console.log("".concat(this.config.name, " Perplexity parsed response:"), {
                            choices: (_b = data.choices) === null || _b === void 0 ? void 0 : _b.length,
                            content: ((_f = (_e = (_d = (_c = data.choices) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.message) === null || _e === void 0 ? void 0 : _e.content) === null || _f === void 0 ? void 0 : _f.substring(0, 100)) + '...'
                        });
                        return [2 /*return*/, {
                                content: data.choices[0].message.content,
                                processingTime: processingTime
                            }];
                    case 4:
                        error_2 = _g.sent();
                        console.error("".concat(this.config.name, " Perplexity error:"), error_2);
                        throw error_2;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    BaseAgent.prototype.getRapidAPIMarketData = function (symbol) {
        return __awaiter(this, void 0, void 0, function () {
            var RAPIDAPI_KEY, response, responseText, data, quote, error_3;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '0136c92ffdmsh581cebdb6e939f0p1ac51cjsnecdd2de65819';
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fetch("https://yahoo-finance-real-time1.p.rapidapi.com/stock/get-options?symbol=".concat(symbol, "&lang=en-US&region=US"), {
                                headers: {
                                    'x-rapidapi-host': 'yahoo-finance-real-time1.p.rapidapi.com',
                                    'x-rapidapi-key': RAPIDAPI_KEY
                                }
                            })];
                    case 2:
                        response = _d.sent();
                        if (!response.ok) {
                            console.log("".concat(this.config.name, " RapidAPI response not ok: ").concat(response.status, " ").concat(response.statusText));
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, response.text()];
                    case 3:
                        responseText = _d.sent();
                        // Check if response is HTML (error page)
                        if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
                            console.error("".concat(this.config.name, " RapidAPI returned HTML instead of JSON:"), responseText.substring(0, 200));
                            return [2 /*return*/, null];
                        }
                        data = void 0;
                        try {
                            data = JSON.parse(responseText);
                        }
                        catch (parseError) {
                            console.error("".concat(this.config.name, " RapidAPI returned invalid JSON:"), responseText.substring(0, 200));
                            return [2 /*return*/, null];
                        }
                        quote = (_c = (_b = (_a = data === null || data === void 0 ? void 0 : data.optionChain) === null || _a === void 0 ? void 0 : _a.result) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.quote;
                        if (!quote || !quote.regularMarketPrice)
                            return [2 /*return*/, null];
                        return [2 /*return*/, {
                                price: quote.regularMarketPrice,
                                change: quote.regularMarketChange,
                                changePercent: quote.regularMarketChangePercent,
                                volume: quote.regularMarketVolume,
                                marketCap: quote.marketCap,
                                peRatio: quote.trailingPE,
                                dividendYield: quote.trailingAnnualDividendYield,
                                timestamp: new Date().toISOString(),
                                source: 'rapidapi_yahoo'
                            }];
                    case 4:
                        error_3 = _d.sent();
                        console.error("".concat(this.config.name, " RapidAPI error:"), error_3);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    BaseAgent.prototype.extractSources = function (content) {
        // Extract URLs and citations from content
        var urlRegex = /https?:\/\/[^\s]+/g;
        var urls = content.match(urlRegex) || [];
        // Extract other source references
        var sourceRegex = /(?:source|from|via|according to):\s*([^\n]+)/gi;
        var sources = content.match(sourceRegex) || [];
        return __spreadArray(__spreadArray([], urls, true), sources, true);
    };
    BaseAgent.prototype.extractJSONFromText = function (text) {
        // First, try to parse the entire text as JSON
        try {
            JSON.parse(text.trim());
            return text.trim();
        }
        catch (_a) {
            // Not valid JSON, continue with extraction
        }
        // Try to find JSON object with more precise matching
        var jsonMatches = text.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g);
        if (jsonMatches) {
            for (var _i = 0, jsonMatches_1 = jsonMatches; _i < jsonMatches_1.length; _i++) {
                var match = jsonMatches_1[_i];
                try {
                    JSON.parse(match);
                    return match;
                }
                catch (_b) {
                    // Not valid JSON, continue
                }
            }
        }
        // Try to find JSON array
        var arrayMatches = text.match(/\[[^\[\]]*(?:\{[^{}]*\}[^\[\]]*)*\]/g);
        if (arrayMatches) {
            for (var _c = 0, arrayMatches_1 = arrayMatches; _c < arrayMatches_1.length; _c++) {
                var match = arrayMatches_1[_c];
                try {
                    JSON.parse(match);
                    return match;
                }
                catch (_d) {
                    // Not valid JSON
                }
            }
        }
        // Last resort: try to find anything that looks like JSON
        var lines = text.split('\n');
        for (var _e = 0, lines_1 = lines; _e < lines_1.length; _e++) {
            var line = lines_1[_e];
            var trimmed = line.trim();
            if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
                try {
                    JSON.parse(trimmed);
                    return trimmed;
                }
                catch (_f) {
                    // Not valid JSON
                }
            }
        }
        return null;
    };
    BaseAgent.prototype.calculateConfidence = function (factors) {
        // Weighted average of confidence factors
        var weights = {
            dataQuality: 0.3,
            signalStrength: 0.3,
            sourceReliability: 0.2,
            recency: 0.2
        };
        var totalConfidence = 0;
        var totalWeight = 0;
        for (var _i = 0, _a = Object.entries(weights); _i < _a.length; _i++) {
            var _b = _a[_i], factor = _b[0], weight = _b[1];
            if (factors[factor] !== undefined) {
                totalConfidence += factors[factor] * weight;
                totalWeight += weight;
            }
        }
        return totalWeight > 0 ? Math.round(totalConfidence / totalWeight) : 50;
    };
    return BaseAgent;
}());
exports.BaseAgent = BaseAgent;
