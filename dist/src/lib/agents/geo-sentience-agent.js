"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.GeoSentienceAgent = void 0;
var base_agent_1 = require("./base-agent");
var GeoSentienceAgent = /** @class */ (function (_super) {
    __extends(GeoSentienceAgent, _super);
    function GeoSentienceAgent() {
        return _super.call(this, {
            name: "GeoSentience",
            description: "Macroeconomic and geopolitical impact analysis",
            model: "sonar",
            temperature: 0.2,
            maxTokens: 1500,
            timeout: 35000
        }) || this;
    }
    GeoSentienceAgent.prototype.process = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var prompt, result, data, extractedJSON;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        prompt = "\n      Analyze ".concat(input.symbol, " for macro/geopolitical factors. \n\n      You MUST return ONLY valid JSON with this EXACT structure - no other text, no markdown, just pure JSON:\n\n      {\n        \"macroFactors\": {\n          \"economic\": [\"Factor 1\", \"Factor 2\"],\n          \"political\": [\"Factor 1\", \"Factor 2\"],\n          \"social\": [\"Factor 1\", \"Factor 2\"]\n        },\n        \"sentimentAnalysis\": {\n          \"twitter\": {\"sentiment\": \"positive\", \"score\": 65},\n          \"reddit\": {\"sentiment\": \"neutral\", \"score\": 50},\n          \"news\": {\"sentiment\": \"negative\", \"score\": 35}\n        },\n        \"riskAssessment\": {\n          \"level\": \"medium\",\n          \"factors\": [\"Risk 1\", \"Risk 2\"]\n        },\n        \"confidence\": 75,\n        \"sources\": [\"source1\", \"source2\"]\n      }\n\n      IMPORTANT: Return ONLY the JSON object, no explanations, no markdown formatting, no code blocks. The response must be parseable by JSON.parse().\n    ");
                        return [4 /*yield*/, this.callPerplexity(prompt)];
                    case 1:
                        result = _a.sent();
                        console.log('[GeoSentienceAgent] Raw model output:', result.content);
                        try {
                            // Try direct JSON parsing first
                            data = JSON.parse(result.content);
                            console.log('[GeoSentienceAgent] Successfully parsed JSON directly');
                        }
                        catch (error) {
                            console.log('[GeoSentienceAgent] Direct JSON parsing failed, trying extraction...');
                            extractedJSON = this.extractJSONFromText(result.content);
                            if (extractedJSON) {
                                try {
                                    data = JSON.parse(extractedJSON);
                                    console.log('[GeoSentienceAgent] Successfully parsed extracted JSON');
                                }
                                catch (extractError) {
                                    console.error('[GeoSentienceAgent] Failed to parse extracted JSON:', extractError);
                                    console.log('[GeoSentienceAgent] Extracted JSON was:', extractedJSON);
                                    data = this.getFallbackData();
                                }
                            }
                            else {
                                console.error('[GeoSentienceAgent] No valid JSON found in response');
                                console.log('[GeoSentienceAgent] Raw response content:', result.content.substring(0, 500) + '...');
                                data = this.getFallbackData();
                            }
                        }
                        // Defensive: ensure data is a proper object, not a number or array
                        if (!data || typeof data !== 'object' || Array.isArray(data)) {
                            console.error('[GeoSentienceAgent] Invalid data format, using fallback');
                            data = this.getFallbackData();
                        }
                        // Flatten macroFactors if present
                        if (data && data.macroFactors) {
                            data.economic = data.macroFactors.economic || [];
                            data.political = data.macroFactors.political || [];
                            data.social = data.macroFactors.social || [];
                            delete data.macroFactors;
                        }
                        // Defensive: ensure top-level fields exist
                        data.economic = data.economic || [];
                        data.political = data.political || [];
                        data.social = data.social || [];
                        return [2 /*return*/, {
                                agent: this.config.name,
                                symbol: input.symbol,
                                timestamp: new Date().toISOString(),
                                data: data,
                                confidence: data.confidence || this.calculateConfidence({
                                    dataQuality: 70,
                                    signalStrength: 65,
                                    sourceReliability: 75,
                                    recency: 80
                                }),
                                sources: data.sources || [
                                    'https://reuters.com',
                                    'https://bloomberg.com',
                                    'https://cnbc.com',
                                    'https://worldbank.org'
                                ],
                                processingTime: result.processingTime
                            }];
                }
            });
        });
    };
    GeoSentienceAgent.prototype.getFallbackData = function () {
        return {
            macroFactors: { economic: [], political: [], social: [] },
            sentimentAnalysis: { twitter: { sentiment: 'neutral', score: 0 }, reddit: { sentiment: 'neutral', score: 0 }, news: { sentiment: 'neutral', score: 0 } },
            riskAssessment: { level: 'medium', factors: [] },
            confidence: 50,
            sources: []
        };
    };
    return GeoSentienceAgent;
}(base_agent_1.BaseAgent));
exports.GeoSentienceAgent = GeoSentienceAgent;
