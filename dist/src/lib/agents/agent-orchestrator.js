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
exports.AgentOrchestrator = void 0;
var sonar_research_agent_1 = require("./sonar-research-agent");
var geo_sentience_agent_1 = require("./geo-sentience-agent");
var quant_edge_agent_1 = require("./quant-edge-agent");
var synth_oracle_agent_1 = require("./synth-oracle-agent");
var onchain_agent_1 = require("./onchain-agent");
var flow_agent_1 = require("./flow-agent");
var microstructure_agent_1 = require("./microstructure-agent");
var ml_agent_1 = require("./ml-agent");
var signal_validator_1 = require("./signal-validator");
var AgentOrchestrator = /** @class */ (function () {
    function AgentOrchestrator() {
        this.agents = [
            new sonar_research_agent_1.SonarResearchAgent(),
            new geo_sentience_agent_1.GeoSentienceAgent(),
            new quant_edge_agent_1.QuantEdgeAgent(),
            new onchain_agent_1.OnChainAgent(),
            new flow_agent_1.FlowAgent(),
            new microstructure_agent_1.MicrostructureAgent(),
            new ml_agent_1.MLAgent(),
            new synth_oracle_agent_1.SynthOracleAgent()
        ];
    }
    AgentOrchestrator.prototype.runMultiAgentAnalysis = function (symbol) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, results, _a, sonarResult, geoResult, quantResult, onchainResult, flowResult, microstructureResult, mlResult, validatedResults, qualityThreshold_1, lowQualityAgents, synthResult, validatedSynthResult, totalTime, overallQuality, validationSummary, reliabilityMetrics, transparency, enhancedPrediction, error_1;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        startTime = Date.now();
                        results = {};
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 4, , 5]);
                        console.log("\uD83E\uDDE0 Starting multi-agent analysis for ".concat(symbol, "..."));
                        // Run Agents 1-7 in parallel (all except synthesis)
                        console.log('📊 Running all analysis agents...');
                        return [4 /*yield*/, Promise.all([
                                this.agents[0].process({ symbol: symbol }),
                                this.agents[1].process({ symbol: symbol }),
                                this.agents[2].process({ symbol: symbol }),
                                this.agents[3].process({ symbol: symbol }),
                                this.agents[4].process({ symbol: symbol }),
                                this.agents[5].process({ symbol: symbol }),
                                this.agents[6].process({ symbol: symbol })
                            ])];
                    case 2:
                        _a = _d.sent(), sonarResult = _a[0], geoResult = _a[1], quantResult = _a[2], onchainResult = _a[3], flowResult = _a[4], microstructureResult = _a[5], mlResult = _a[6];
                        // 🏆 GOLD STANDARD: Validate each agent output
                        console.log('🔍 Validating agent outputs...');
                        validatedResults = {
                            sonar: signal_validator_1.SignalValidator.validateAgentOutput(sonarResult),
                            geo: signal_validator_1.SignalValidator.validateAgentOutput(geoResult),
                            quant: signal_validator_1.SignalValidator.validateAgentOutput(quantResult),
                            onchain: signal_validator_1.SignalValidator.validateAgentOutput(onchainResult),
                            flow: signal_validator_1.SignalValidator.validateAgentOutput(flowResult),
                            microstructure: signal_validator_1.SignalValidator.validateAgentOutput(microstructureResult),
                            ml: signal_validator_1.SignalValidator.validateAgentOutput(mlResult)
                        };
                        results.sonar = validatedResults.sonar;
                        results.geo = validatedResults.geo;
                        results.quant = validatedResults.quant;
                        results.onchain = validatedResults.onchain;
                        results.flow = validatedResults.flow;
                        results.microstructure = validatedResults.microstructure;
                        results.ml = validatedResults.ml;
                        // Log validation results
                        console.log('🔍 Validation Results:');
                        Object.entries(validatedResults).forEach(function (_a) {
                            var agent = _a[0], result = _a[1];
                            console.log("".concat(agent, ": Validation ").concat(result.validation.passed ? '✅ PASSED' : '❌ FAILED', " (Score: ").concat(result.validation.score, "/100)"));
                            if (result.quality.warnings.length > 0) {
                                console.log("  \u26A0\uFE0F  Warnings: ".concat(result.quality.warnings.join(', ')));
                            }
                        });
                        qualityThreshold_1 = 60;
                        lowQualityAgents = Object.entries(validatedResults).filter(function (_a) {
                            var _ = _a[0], result = _a[1];
                            return result.quality.overallQuality < qualityThreshold_1;
                        });
                        if (lowQualityAgents.length > 3) {
                            console.warn("\u26A0\uFE0F  Warning: ".concat(lowQualityAgents.length, " agents have low quality data (<").concat(qualityThreshold_1, ")"));
                            console.warn("   Low quality agents: ".concat(lowQualityAgents.map(function (_a) {
                                var agent = _a[0], result = _a[1];
                                return "".concat(agent, "(").concat(result.quality.overallQuality, ")");
                            }).join(', ')));
                        }
                        // Log each agent's result for debugging
                        console.log('🔬 SonarResearchAgent result:', JSON.stringify(validatedResults.sonar, null, 2));
                        console.log('🌍 GeoSentienceAgent result:', JSON.stringify(validatedResults.geo, null, 2));
                        console.log('📈 QuantEdgeAgent result:', JSON.stringify(validatedResults.quant, null, 2));
                        console.log('⛓️ OnChainAgent result:', JSON.stringify(validatedResults.onchain, null, 2));
                        console.log('💧 FlowAgent result:', JSON.stringify(validatedResults.flow, null, 2));
                        console.log('📊 MicrostructureAgent result:', JSON.stringify(validatedResults.microstructure, null, 2));
                        console.log('🤖 MLAgent result:', JSON.stringify(validatedResults.ml, null, 2));
                        console.log('✅ All analysis agents completed and validated');
                        // Run synthesis agent with validated context
                        console.log('🧩 Running synthesis agent with validated data...');
                        return [4 /*yield*/, this.agents[7].process({
                                symbol: symbol,
                                context: {
                                    sonarData: validatedResults.sonar.data,
                                    geoData: validatedResults.geo.data,
                                    quantData: validatedResults.quant.data,
                                    onchainData: validatedResults.onchain.data,
                                    flowData: validatedResults.flow.data,
                                    microstructureData: validatedResults.microstructure.data,
                                    mlData: validatedResults.ml.data
                                }
                            })];
                    case 3:
                        synthResult = _d.sent();
                        validatedSynthResult = signal_validator_1.SignalValidator.validateAgentOutput(synthResult);
                        results.synth = validatedSynthResult;
                        // Log synthesis agent result
                        console.log('🧠 SynthOracleAgent result:', JSON.stringify(validatedSynthResult, null, 2));
                        console.log('✅ Synthesis agent completed and validated');
                        totalTime = Date.now() - startTime;
                        console.log("\uD83C\uDFAF Multi-agent analysis completed in ".concat(totalTime, "ms"));
                        overallQuality = this.calculateOverallQuality(validatedResults);
                        validationSummary = this.calculateValidationSummary(validatedResults);
                        reliabilityMetrics = this.calculateReliabilityMetrics(validatedResults);
                        transparency = this.buildTransparencyReport(validatedResults);
                        enhancedPrediction = this.generateEnhancedPrediction(validatedSynthResult, validatedResults);
                        return [2 /*return*/, {
                                symbol: symbol,
                                timestamp: new Date().toISOString(),
                                agents: results,
                                totalProcessingTime: totalTime,
                                finalPrediction: enhancedPrediction,
                                confidence: this.calculateOverallConfidence(results),
                                metadata: {
                                    agentConfidences: Object.fromEntries(Object.entries(results).map(function (_a) {
                                        var name = _a[0], result = _a[1];
                                        return [name, result.confidence || 50];
                                    })),
                                    tags: ((_b = validatedSynthResult.metadata) === null || _b === void 0 ? void 0 : _b.tags) || [],
                                    riskFactors: ((_c = validatedSynthResult.metadata) === null || _c === void 0 ? void 0 : _c.riskFactors) || [],
                                    // 🆕 GOLD STANDARD ADDITIONS:
                                    overallQuality: overallQuality,
                                    validationSummary: validationSummary,
                                    reliabilityMetrics: reliabilityMetrics,
                                    transparency: transparency
                                }
                            }];
                    case 4:
                        error_1 = _d.sent();
                        console.error('❌ Multi-agent analysis failed:', error_1);
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // 🏆 GOLD STANDARD: Calculate overall quality metrics
    AgentOrchestrator.prototype.calculateOverallQuality = function (results) {
        var qualities = Object.values(results).map(function (result) { return result.quality; });
        return {
            dataFreshness: Math.round(qualities.reduce(function (sum, q) { return sum + q.dataFreshness; }, 0) / qualities.length),
            sourceReliability: Math.round(qualities.reduce(function (sum, q) { return sum + q.sourceReliability; }, 0) / qualities.length),
            crossVerification: Math.round(qualities.reduce(function (sum, q) { return sum + q.crossVerification; }, 0) / qualities.length),
            anomalyScore: Math.round(qualities.reduce(function (sum, q) { return sum + q.anomalyScore; }, 0) / qualities.length),
            completeness: Math.round(qualities.reduce(function (sum, q) { return sum + q.completeness; }, 0) / qualities.length),
            consistency: Math.round(qualities.reduce(function (sum, q) { return sum + q.consistency; }, 0) / qualities.length),
            overallQuality: Math.round(qualities.reduce(function (sum, q) { return sum + q.overallQuality; }, 0) / qualities.length),
            warnings: qualities.flatMap(function (q) { return q.warnings; }),
            lastValidated: new Date().toISOString()
        };
    };
    // 🏆 GOLD STANDARD: Calculate validation summary
    AgentOrchestrator.prototype.calculateValidationSummary = function (results) {
        var allChecks = Object.values(results).flatMap(function (result) { return result.validation.checks; });
        var totalChecks = allChecks.length;
        var passedChecks = allChecks.filter(function (check) { return check.passed; }).length;
        var criticalFailures = allChecks.filter(function (check) { return check.critical && !check.passed; }).length;
        var overallScore = Math.round((passedChecks / totalChecks) * 100);
        return {
            totalChecks: totalChecks,
            passedChecks: passedChecks,
            criticalFailures: criticalFailures,
            overallScore: overallScore
        };
    };
    // 🏆 GOLD STANDARD: Calculate reliability metrics
    AgentOrchestrator.prototype.calculateReliabilityMetrics = function (results) {
        var reliabilities = Object.values(results).map(function (result) { return result.reliability; });
        return {
            averageAgentAccuracy: Math.round(reliabilities.reduce(function (sum, r) { return sum + r.historicalAccuracy; }, 0) / reliabilities.length),
            dataSourceHealth: Math.round(reliabilities.reduce(function (sum, r) { return sum + r.dataSourceHealth; }, 0) / reliabilities.length),
            signalConsistency: Math.round(reliabilities.reduce(function (sum, r) { return sum + r.signalStrength; }, 0) / reliabilities.length)
        };
    };
    // 🏆 GOLD STANDARD: Build transparency report
    AgentOrchestrator.prototype.buildTransparencyReport = function (results) {
        var _a, _b, _c, _d, _e, _f;
        var dataSources = [];
        // Collect all unique sources with their reliability scores
        var sourceMap = new Map();
        Object.entries(results).forEach(function (_a) {
            var agent = _a[0], result = _a[1];
            result.sources.forEach(function (source) {
                var existing = sourceMap.get(source);
                if (existing) {
                    existing.reliability = Math.max(existing.reliability, result.reliability.dataSourceHealth);
                    existing.contribution += result.reliability.signalStrength;
                }
                else {
                    sourceMap.set(source, {
                        reliability: result.reliability.dataSourceHealth,
                        lastUpdated: result.timestamp,
                        contribution: result.reliability.signalStrength
                    });
                }
            });
        });
        sourceMap.forEach(function (data, source) {
            dataSources.push({
                name: source,
                reliability: data.reliability,
                lastUpdated: data.lastUpdated,
                contribution: Math.round(data.contribution)
            });
        });
        // Build reasoning from synthesis agent
        var synthData = (_a = results.synth) === null || _a === void 0 ? void 0 : _a.data;
        var reasoning = {
            technical: ((_b = synthData === null || synthData === void 0 ? void 0 : synthData.reasoning) === null || _b === void 0 ? void 0 : _b.technical) || [],
            sentiment: ((_c = synthData === null || synthData === void 0 ? void 0 : synthData.reasoning) === null || _c === void 0 ? void 0 : _c.sentiment) || [],
            macro: ((_d = synthData === null || synthData === void 0 ? void 0 : synthData.reasoning) === null || _d === void 0 ? void 0 : _d.macro) || [],
            conflicts: ((_e = synthData === null || synthData === void 0 ? void 0 : synthData.reasoning) === null || _e === void 0 ? void 0 : _e.conflicts) || [],
            uncertainties: ((_f = synthData === null || synthData === void 0 ? void 0 : synthData.reasoning) === null || _f === void 0 ? void 0 : _f.uncertainties) || []
        };
        return {
            dataSources: dataSources.sort(function (a, b) { return b.contribution - a.contribution; }),
            reasoning: reasoning
        };
    };
    // 🏆 GOLD STANDARD: Generate enhanced prediction with entry/exit points
    AgentOrchestrator.prototype.generateEnhancedPrediction = function (synthResult, allResults) {
        var basePrediction = synthResult.data.prediction || {
            direction: 'NEUTRAL',
            timeframes: { '1day': 'NEUTRAL', '1week': 'NEUTRAL', '1month': 'NEUTRAL' },
            confidence: 50
        };
        // Calculate risk level based on quality and confidence
        var riskLevel = this.calculateRiskLevel(synthResult, allResults);
        // Generate entry/exit points (placeholder - would need price data)
        var entryPrice = this.calculateEntryPrice(basePrediction, allResults);
        var stopLoss = this.calculateStopLoss(entryPrice, basePrediction, riskLevel);
        var takeProfit = this.calculateTakeProfit(entryPrice, basePrediction, riskLevel);
        // Calculate expiration time based on prediction type
        var expirationTime = this.calculateExpirationTime(basePrediction);
        return __assign(__assign({}, basePrediction), { entryPrice: entryPrice, stopLoss: stopLoss, takeProfit: takeProfit, expirationTime: expirationTime, riskLevel: riskLevel });
    };
    AgentOrchestrator.prototype.calculateRiskLevel = function (synthResult, allResults) {
        var quality = synthResult.quality.overallQuality;
        var confidence = synthResult.confidence;
        var validationScore = synthResult.validation.score;
        var riskScore = (quality + confidence + validationScore) / 3;
        if (riskScore >= 80)
            return 'LOW';
        if (riskScore >= 60)
            return 'MEDIUM';
        return 'HIGH';
    };
    AgentOrchestrator.prototype.calculateEntryPrice = function (prediction, allResults) {
        // Placeholder - would need current price data
        // For now, return undefined to indicate no entry price available
        return undefined;
    };
    AgentOrchestrator.prototype.calculateStopLoss = function (entryPrice, prediction, riskLevel) {
        if (!entryPrice)
            return undefined;
        var stopLossPercentages = { LOW: 0.02, MEDIUM: 0.03, HIGH: 0.05 };
        var percentage = stopLossPercentages[riskLevel] || 0.03;
        return prediction.direction === 'UP'
            ? entryPrice * (1 - percentage)
            : entryPrice * (1 + percentage);
    };
    AgentOrchestrator.prototype.calculateTakeProfit = function (entryPrice, prediction, riskLevel) {
        if (!entryPrice)
            return undefined;
        var takeProfitPercentages = { LOW: 0.04, MEDIUM: 0.06, HIGH: 0.10 };
        var percentage = takeProfitPercentages[riskLevel] || 0.06;
        return prediction.direction === 'UP'
            ? entryPrice * (1 + percentage)
            : entryPrice * (1 - percentage);
    };
    AgentOrchestrator.prototype.calculateExpirationTime = function (prediction) {
        // Set expiration based on primary timeframe
        var timeframes = prediction.timeframes;
        var hours = 24; // Default 1 day
        if (timeframes['1week'] !== 'NEUTRAL')
            hours = 168; // 1 week
        if (timeframes['1month'] !== 'NEUTRAL')
            hours = 720; // 1 month
        var expiration = new Date();
        expiration.setHours(expiration.getHours() + hours);
        return expiration.toISOString();
    };
    AgentOrchestrator.prototype.calculateOverallConfidence = function (results) {
        var weights = {
            sonar: 0.15,
            geo: 0.15,
            quant: 0.15,
            onchain: 0.15,
            flow: 0.15,
            microstructure: 0.10,
            ml: 0.10,
            synth: 0.05
        };
        var totalConfidence = 0;
        for (var _i = 0, _a = Object.entries(results); _i < _a.length; _i++) {
            var _b = _a[_i], agent = _b[0], result = _b[1];
            var confidence = result.confidence || 50; // Default to 50 if undefined
            totalConfidence += confidence * (weights[agent] || 0.05);
        }
        return Math.round(totalConfidence);
    };
    // Method to get individual agent results for debugging
    AgentOrchestrator.prototype.runSingleAgent = function (agentIndex, symbol) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (agentIndex < 0 || agentIndex >= this.agents.length) {
                            throw new Error('Invalid agent index');
                        }
                        return [4 /*yield*/, this.agents[agentIndex].process({ symbol: symbol })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, signal_validator_1.SignalValidator.validateAgentOutput(result)];
                }
            });
        });
    };
    // Method to get agent status
    AgentOrchestrator.prototype.getAgentStatus = function () {
        return this.agents.map(function (agent) { return ({
            name: agent.constructor.name,
            description: agent['config'].description
        }); });
    };
    return AgentOrchestrator;
}());
exports.AgentOrchestrator = AgentOrchestrator;
