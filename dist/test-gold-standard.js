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
var agent_orchestrator_1 = require("./src/lib/agents/agent-orchestrator");
function testGoldStandard() {
    return __awaiter(this, void 0, void 0, function () {
        var orchestrator, testSymbols, _i, testSymbols_1, symbol, startTime, result, processingTime, prediction, quality, validation, reliability, transparency, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🧪 Testing Gold Standard Signal Validation System\n');
                    orchestrator = new agent_orchestrator_1.AgentOrchestrator();
                    testSymbols = ['BHP.AX', 'BTC-USD', 'ETH-USD'];
                    _i = 0, testSymbols_1 = testSymbols;
                    _a.label = 1;
                case 1:
                    if (!(_i < testSymbols_1.length)) return [3 /*break*/, 6];
                    symbol = testSymbols_1[_i];
                    console.log("\n\uD83D\uDCCA Testing ".concat(symbol, "..."));
                    console.log('='.repeat(50));
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    startTime = Date.now();
                    return [4 /*yield*/, orchestrator.runMultiAgentAnalysis(symbol)];
                case 3:
                    result = _a.sent();
                    processingTime = Date.now() - startTime;
                    prediction = result.finalPrediction;
                    console.log("\u2705 Processing completed in ".concat(processingTime, "ms"));
                    console.log("\uD83C\uDFAF Final Prediction: ".concat(prediction.direction, " (").concat(prediction.confidence, "% confidence)"));
                    console.log("\uD83D\uDCC8 Timeframes:", prediction.timeframes);
                    quality = result.metadata.overallQuality;
                    console.log('\n🔍 Quality Metrics:');
                    console.log("   Overall Quality: ".concat(quality.overallQuality, "/100"));
                    console.log("   Data Freshness: ".concat(quality.dataFreshness, "/100"));
                    console.log("   Source Reliability: ".concat(quality.sourceReliability, "/100"));
                    console.log("   Cross Verification: ".concat(quality.crossVerification, "/100"));
                    if (quality.warnings.length > 0) {
                        console.log("   \u26A0\uFE0F  Warnings: ".concat(quality.warnings.join(', ')));
                    }
                    validation = result.metadata.validationSummary;
                    console.log('\n✅ Validation Results:');
                    console.log("   Passed: ".concat(validation.passedChecks, "/").concat(validation.totalChecks, " checks"));
                    console.log("   Overall Score: ".concat(validation.overallScore, "/100"));
                    if (validation.criticalFailures > 0) {
                        console.log('   ❌ Validation failed - critical failures present.');
                    }
                    reliability = result.metadata.reliabilityMetrics;
                    console.log('\n🛡️  Reliability Metrics:');
                    console.log("   Historical Accuracy: ".concat(reliability.averageAgentAccuracy, "%"));
                    console.log("   Data Source Health: ".concat(reliability.dataSourceHealth, "%"));
                    console.log("   Signal Strength: ".concat(reliability.signalConsistency, "%"));
                    transparency = result.metadata.transparency;
                    console.log('\n📡 Data Sources:');
                    transparency.dataSources.forEach(function (source) {
                        console.log("   \u2022 ".concat(source.name, " (Reliability: ").concat(source.reliability, ", Contribution: ").concat(source.contribution, ")"));
                    });
                    // Agent results summary
                    console.log('\n🤖 Agent Results Summary:');
                    Object.entries(result.agents).forEach(function (_a) {
                        var _b;
                        var agentName = _a[0], agentResult = _a[1];
                        var status = agentResult.confidence > 0 ? '✅' : '❌';
                        var confidence = agentResult.confidence || 0;
                        var hasRapidAPI = ((_b = agentResult.sources) === null || _b === void 0 ? void 0 : _b.includes('rapidapi_yahoo')) ? ' (RapidAPI)' : '';
                        console.log("   ".concat(status, " ").concat(agentName, ": ").concat(confidence, "% confidence").concat(hasRapidAPI));
                    });
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error("\u274C Error testing ".concat(symbol, ":"), error_1.message);
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6:
                    console.log('\n🎉 Gold Standard Test Complete!');
                    return [2 /*return*/];
            }
        });
    });
}
testGoldStandard().catch(console.error);
