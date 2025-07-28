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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignalValidator = void 0;
// 🏆 GOLD STANDARD: Signal Validation System
var SignalValidator = /** @class */ (function () {
    function SignalValidator() {
    }
    // 🏆 GOLD STANDARD: Validate individual agent output
    SignalValidator.validateAgentOutput = function (output) {
        var checks = [];
        // Run all validation rules
        for (var _i = 0, _a = this.VALIDATION_RULES; _i < _a.length; _i++) {
            var rule = _a[_i];
            try {
                var check = rule.validate(output.data, output.agent);
                checks.push(check);
            }
            catch (error) {
                console.error("Validation rule ".concat(rule.name, " failed:"), error);
                checks.push({
                    name: rule.name,
                    passed: false,
                    score: 0,
                    details: "Validation error: ".concat(error instanceof Error ? error.message : 'Unknown error'),
                    critical: rule.critical
                });
            }
        }
        // Calculate validation score
        var passedChecks = checks.filter(function (c) { return c.passed; }).length;
        var totalChecks = checks.length;
        var validationScore = Math.round((passedChecks / totalChecks) * 100);
        // Check if validation passed (all critical checks must pass)
        var criticalFailures = checks.filter(function (c) { return c.critical && !c.passed; }).length;
        var validationPassed = criticalFailures === 0;
        // Calculate quality metrics
        var quality = this.calculateSignalQuality(output, checks);
        // Calculate reliability metrics
        var reliability = this.calculateReliability(output, quality);
        // Adjust confidence based on validation results
        var adjustedConfidence = this.adjustConfidence(output.confidence, quality, checks);
        return __assign(__assign({}, output), { confidence: adjustedConfidence, quality: quality, validation: {
                passed: validationPassed,
                checks: checks,
                score: validationScore
            }, reliability: reliability });
    };
    // 🏆 GOLD STANDARD: Calculate signal quality metrics
    SignalValidator.calculateSignalQuality = function (output, checks) {
        var _a, _b, _c, _d, _e;
        var dataFreshness = ((_a = checks.find(function (c) { return c.name === 'Data Freshness'; })) === null || _a === void 0 ? void 0 : _a.score) || 0;
        var sourceReliability = ((_b = checks.find(function (c) { return c.name === 'Source Reliability'; })) === null || _b === void 0 ? void 0 : _b.score) || 0;
        var completeness = ((_c = checks.find(function (c) { return c.name === 'Data Completeness'; })) === null || _c === void 0 ? void 0 : _c.score) || 0;
        var consistency = ((_d = checks.find(function (c) { return c.name === 'Data Consistency'; })) === null || _d === void 0 ? void 0 : _d.score) || 0;
        var anomalyScore = ((_e = checks.find(function (c) { return c.name === 'Anomaly Detection'; })) === null || _e === void 0 ? void 0 : _e.score) || 0;
        // Cross-verification (placeholder - would need multiple sources)
        var crossVerification = output.sources.length > 1 ? 75 : 50;
        // Calculate overall quality (weighted average)
        var overallQuality = Math.round((dataFreshness * 0.2 +
            sourceReliability * 0.25 +
            crossVerification * 0.15 +
            anomalyScore * 0.15 +
            completeness * 0.15 +
            consistency * 0.1));
        // Generate warnings
        var warnings = [];
        if (dataFreshness < 50)
            warnings.push('Data may be stale');
        if (sourceReliability < 60)
            warnings.push('Some data sources are unreliable');
        if (anomalyScore < 70)
            warnings.push('Statistical anomalies detected');
        if (completeness < 90)
            warnings.push('Some data fields are missing');
        return {
            dataFreshness: dataFreshness,
            sourceReliability: sourceReliability,
            crossVerification: crossVerification,
            anomalyScore: anomalyScore,
            completeness: completeness,
            consistency: consistency,
            overallQuality: overallQuality,
            warnings: warnings,
            lastValidated: new Date().toISOString()
        };
    };
    // 🏆 GOLD STANDARD: Calculate reliability metrics
    SignalValidator.calculateReliability = function (output, quality) {
        // Historical accuracy (placeholder - would need database)
        var historicalAccuracy = 75; // Default, should be fetched from DB
        // Data source health (based on recent API success rates)
        var dataSourceHealth = quality.sourceReliability;
        // Signal strength (based on confidence and quality)
        var signalStrength = Math.round((output.confidence + quality.overallQuality) / 2);
        return {
            historicalAccuracy: historicalAccuracy,
            dataSourceHealth: dataSourceHealth,
            signalStrength: signalStrength
        };
    };
    // 🏆 GOLD STANDARD: Adjust confidence based on quality
    SignalValidator.adjustConfidence = function (originalConfidence, quality, checks) {
        var adjustedConfidence = originalConfidence;
        // Reduce confidence for quality issues
        if (quality.overallQuality < 70) {
            adjustedConfidence *= 0.8;
        }
        // Reduce confidence for critical validation failures
        var criticalFailures = checks.filter(function (c) { return c.critical && !c.passed; }).length;
        if (criticalFailures > 0) {
            adjustedConfidence *= 0.5;
        }
        // Cap confidence based on data quality
        adjustedConfidence = Math.min(adjustedConfidence, quality.overallQuality);
        return Math.round(Math.max(0, Math.min(100, adjustedConfidence)));
    };
    // Helper methods
    SignalValidator.getRequiredFields = function (agent) {
        var fieldMap = {
            'SonarResearch': ['background', 'news', 'sentiment'],
            'GeoSentience': ['macroFactors', 'sentimentAnalysis'],
            'QuantEdge': ['indicators', 'trend'],
            'OnChain': ['institutionalMetrics', 'whaleActivity'],
            'Flow': ['institutionalFlows'],
            'Microstructure': ['orderBook', 'volumeProfile'],
            'ML': ['predictiveSignals']
        };
        return fieldMap[agent] || ['confidence', 'sources'];
    };
    SignalValidator.getMaxDataAge = function (agent) {
        var ageMap = {
            'SonarResearch': 3600000, // 1 hour
            'GeoSentience': 7200000, // 2 hours
            'QuantEdge': 300000, // 5 minutes
            'OnChain': 600000, // 10 minutes
            'Flow': 300000, // 5 minutes
            'Microstructure': 60000, // 1 minute
            'ML': 1800000 // 30 minutes
        };
        return ageMap[agent] || 300000; // Default 5 minutes
    };
    SignalValidator.getReliableSources = function (agent) {
        var sourceMap = {
            'SonarResearch': ['reuters.com', 'bloomberg.com', 'cnbc.com'],
            'GeoSentience': ['worldbank.org', 'imf.org', 'ecb.europa.eu'],
            'QuantEdge': ['tradingview.com', 'barchart.com', 'yahoo.com'],
            'OnChain': ['blockchain.info', 'etherscan.io', 'coingecko.com'],
            'Flow': ['coingecko.com', 'yahoo.com', 'etfdb.com'],
            'Microstructure': ['binance.com', 'coinbase.com', 'orderbook.com'],
            'ML': ['yahoo.com', 'alpha-vantage.co', 'rapidapi.com']
        };
        return sourceMap[agent] || ['yahoo.com', 'coingecko.com'];
    };
    SignalValidator.findInconsistencies = function (data, agent) {
        var _a, _b, _c, _d;
        var inconsistencies = [];
        // Check for impossible combinations
        if ((data === null || data === void 0 ? void 0 : data.confidence) > 90 && (!(data === null || data === void 0 ? void 0 : data.sources) || data.sources.length === 0)) {
            inconsistencies.push('High confidence with no sources');
        }
        if (((_a = data === null || data === void 0 ? void 0 : data.trend) === null || _a === void 0 ? void 0 : _a.direction) === 'UP' && ((_b = data === null || data === void 0 ? void 0 : data.sentiment) === null || _b === void 0 ? void 0 : _b.overall) === 'bearish') {
            inconsistencies.push('Bullish trend with bearish sentiment');
        }
        if (((_d = (_c = data === null || data === void 0 ? void 0 : data.institutionalFlows) === null || _c === void 0 ? void 0 : _c.etfFlows) === null || _d === void 0 ? void 0 : _d.netFlow) === 0 && (data === null || data === void 0 ? void 0 : data.confidence) > 70) {
            inconsistencies.push('High confidence with neutral ETF flows');
        }
        return inconsistencies;
    };
    SignalValidator.detectAnomalies = function (data, agent) {
        var _a, _b;
        var anomalies = [];
        // Check for statistical outliers
        if ((data === null || data === void 0 ? void 0 : data.confidence) > 95) {
            anomalies.push('Extremely high confidence (95%+)');
        }
        if (((_a = data === null || data === void 0 ? void 0 : data.trend) === null || _a === void 0 ? void 0 : _a.strength) > 90) {
            anomalies.push('Extremely strong trend signal');
        }
        if (((_b = data === null || data === void 0 ? void 0 : data.sentiment) === null || _b === void 0 ? void 0 : _b.newsSentiment) && Math.abs(data.sentiment.newsSentiment) > 0.9) {
            anomalies.push('Extreme sentiment reading');
        }
        return anomalies;
    };
    SignalValidator.VALIDATION_RULES = [
        // CRITICAL RULES - Must pass for signal to be valid
        {
            name: 'Data Completeness',
            description: 'Ensures all required data fields are present',
            critical: true,
            validate: function (data, agent) {
                var requiredFields = SignalValidator.getRequiredFields(agent);
                var missingFields = requiredFields.filter(function (field) {
                    return !data || data[field] === undefined || data[field] === null;
                });
                var completeness = ((requiredFields.length - missingFields.length) / requiredFields.length) * 100;
                return {
                    name: 'Data Completeness',
                    passed: missingFields.length === 0,
                    score: Math.round(completeness),
                    details: missingFields.length > 0
                        ? "Missing fields: ".concat(missingFields.join(', '))
                        : 'All required fields present',
                    critical: true
                };
            }
        },
        {
            name: 'Confidence Integrity',
            description: 'Validates confidence scores are realistic',
            critical: true,
            validate: function (data, agent) {
                var confidence = (data === null || data === void 0 ? void 0 : data.confidence) || 0;
                var sources = (data === null || data === void 0 ? void 0 : data.sources) || [];
                // High confidence with no sources is impossible
                if (confidence > 80 && sources.length === 0) {
                    return {
                        name: 'Confidence Integrity',
                        passed: false,
                        score: 0,
                        details: 'High confidence (80%+) with no data sources is impossible',
                        critical: true
                    };
                }
                // Low confidence with many sources might indicate data issues
                if (confidence < 30 && sources.length > 3) {
                    return {
                        name: 'Confidence Integrity',
                        passed: true,
                        score: 70,
                        details: 'Low confidence despite multiple sources - data may be conflicting',
                        critical: false
                    };
                }
                return {
                    name: 'Confidence Integrity',
                    passed: true,
                    score: 100,
                    details: 'Confidence score is realistic for given data sources',
                    critical: true
                };
            }
        },
        {
            name: 'Data Freshness',
            description: 'Ensures data is not stale',
            critical: false,
            validate: function (data, agent) {
                var timestamp = (data === null || data === void 0 ? void 0 : data.timestamp) || new Date().toISOString();
                var dataAge = Date.now() - new Date(timestamp).getTime();
                var maxAge = SignalValidator.getMaxDataAge(agent);
                var freshness = Math.max(0, 100 - (dataAge / maxAge) * 100);
                return {
                    name: 'Data Freshness',
                    passed: dataAge <= maxAge,
                    score: Math.round(freshness),
                    details: "Data age: ".concat(Math.round(dataAge / 1000), "s (max: ").concat(Math.round(maxAge / 1000), "s)"),
                    critical: false
                };
            }
        },
        {
            name: 'Source Reliability',
            description: 'Validates data sources are trustworthy',
            critical: false,
            validate: function (data, agent) {
                var sources = (data === null || data === void 0 ? void 0 : data.sources) || [];
                var reliableSources = SignalValidator.getReliableSources(agent);
                var reliableCount = sources.filter(function (source) {
                    return reliableSources.some(function (reliable) { return source.includes(reliable); });
                }).length;
                var reliability = sources.length > 0 ? (reliableCount / sources.length) * 100 : 0;
                return {
                    name: 'Source Reliability',
                    passed: reliability >= 50,
                    score: Math.round(reliability),
                    details: "".concat(reliableCount, "/").concat(sources.length, " sources are reliable"),
                    critical: false
                };
            }
        },
        {
            name: 'Data Consistency',
            description: 'Checks for internal data consistency',
            critical: false,
            validate: function (data, agent) {
                var inconsistencies = SignalValidator.findInconsistencies(data, agent);
                var consistency = inconsistencies.length === 0 ? 100 :
                    Math.max(0, 100 - (inconsistencies.length * 20));
                return {
                    name: 'Data Consistency',
                    passed: inconsistencies.length === 0,
                    score: consistency,
                    details: inconsistencies.length > 0
                        ? "Inconsistencies: ".concat(inconsistencies.join(', '))
                        : 'Data is internally consistent',
                    critical: false
                };
            }
        },
        {
            name: 'Anomaly Detection',
            description: 'Detects statistical anomalies in data',
            critical: false,
            validate: function (data, agent) {
                var anomalies = SignalValidator.detectAnomalies(data, agent);
                var anomalyScore = anomalies.length === 0 ? 100 :
                    Math.max(0, 100 - (anomalies.length * 15));
                return {
                    name: 'Anomaly Detection',
                    passed: anomalies.length === 0,
                    score: anomalyScore,
                    details: anomalies.length > 0
                        ? "Anomalies detected: ".concat(anomalies.join(', '))
                        : 'No statistical anomalies detected',
                    critical: false
                };
            }
        }
    ];
    return SignalValidator;
}());
exports.SignalValidator = SignalValidator;
