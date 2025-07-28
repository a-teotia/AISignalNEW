"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataVerificationSystem = void 0;
class DataVerificationSystem {
    constructor() {
        this.primarySources = new Map();
        this.secondarySources = new Map();
        this.verificationHistory = new Map();
    }
    /**
     * Add a primary data source
     */
    addPrimarySource(symbol, source) {
        this.primarySources.set(symbol, source);
    }
    /**
     * Add a secondary data source for redundancy
     */
    addSecondarySource(symbol, source) {
        if (!this.secondarySources.has(symbol)) {
            this.secondarySources.set(symbol, new Map());
        }
        const symbolSources = this.secondarySources.get(symbol);
        symbolSources.set(source.name, source);
    }
    /**
     * Verify data across multiple sources
     */
    async verifyData(symbol, primaryData) {
        const secondaryData = this.secondarySources.get(symbol) || new Map();
        const allSources = [
            {
                name: 'Primary',
                reliability: 90,
                lastUpdated: new Date().toISOString(),
                data: primaryData,
                quality: primaryData.marketData.quality === 'realtime' ? 100 : 80,
                latency: 0
            }
        ];
        // Add secondary sources
        secondaryData.forEach((source) => {
            allSources.push(source);
        });
        // Perform cross-source verification
        const verification = await this.performCrossSourceVerification(allSources);
        // Store verification history
        if (!this.verificationHistory.has(symbol)) {
            this.verificationHistory.set(symbol, []);
        }
        this.verificationHistory.get(symbol).push(verification);
        return verification;
    }
    /**
     * Perform cross-source verification
     */
    async performCrossSourceVerification(sources) {
        if (sources.length < 2) {
            return {
                verified: true,
                confidence: 100,
                conflicts: [],
                consensus: sources[0]?.data || null,
                sources,
                verificationScore: 100
            };
        }
        const conflicts = [];
        const priceData = [];
        const volumeData = [];
        // Extract price and volume data from all sources
        sources.forEach(source => {
            if (source.data?.marketData) {
                const marketData = source.data.marketData;
                if (marketData.price) {
                    priceData.push({
                        source: source.name,
                        price: marketData.price,
                        timestamp: marketData.timestamp
                    });
                }
                if (marketData.volume) {
                    volumeData.push({
                        source: source.name,
                        volume: marketData.volume,
                        timestamp: marketData.timestamp
                    });
                }
            }
        });
        // Check for price conflicts
        if (priceData.length > 1) {
            const prices = priceData.map(p => p.price);
            const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
            const maxDeviation = Math.max(...prices.map(p => Math.abs(p - avgPrice) / avgPrice * 100));
            if (maxDeviation > 5) { // More than 5% deviation
                conflicts.push(`Price deviation detected: ${maxDeviation.toFixed(2)}% between sources`);
            }
        }
        // Check for volume conflicts
        if (volumeData.length > 1) {
            const volumes = volumeData.map(v => v.volume);
            const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
            const maxDeviation = Math.max(...volumes.map(v => Math.abs(v - avgVolume) / avgVolume * 100));
            if (maxDeviation > 20) { // More than 20% deviation for volume
                conflicts.push(`Volume deviation detected: ${maxDeviation.toFixed(2)}% between sources`);
            }
        }
        // Calculate verification score
        const verificationScore = this.calculateVerificationScore(sources, conflicts);
        const confidence = this.calculateConsensusConfidence(sources, conflicts);
        // Resolve conflicts and create consensus
        const consensus = await this.resolveConflicts(sources, conflicts);
        return {
            verified: conflicts.length === 0,
            confidence,
            conflicts,
            consensus,
            sources,
            verificationScore
        };
    }
    /**
     * Calculate verification score based on sources and conflicts
     */
    calculateVerificationScore(sources, conflicts) {
        const baseScore = sources.reduce((sum, source) => sum + source.reliability, 0) / sources.length;
        const conflictPenalty = conflicts.length * 10; // 10 points per conflict
        const sourceBonus = sources.length > 2 ? 10 : 0; // Bonus for multiple sources
        return Math.max(0, Math.min(100, baseScore - conflictPenalty + sourceBonus));
    }
    /**
     * Calculate consensus confidence
     */
    calculateConsensusConfidence(sources, conflicts) {
        const avgReliability = sources.reduce((sum, source) => sum + source.reliability, 0) / sources.length;
        const conflictPenalty = conflicts.length * 15; // 15 points per conflict
        const sourceAgreement = sources.length > 1 ? 10 : 0; // Bonus for multiple sources
        return Math.max(0, Math.min(100, avgReliability - conflictPenalty + sourceAgreement));
    }
    /**
     * Resolve conflicts between data sources
     */
    async resolveConflicts(sources, conflicts) {
        if (conflicts.length === 0) {
            // No conflicts, use weighted average
            return this.createWeightedConsensus(sources);
        }
        // Apply conflict resolution strategies
        const resolution = await this.applyConflictResolutionStrategies(sources, conflicts);
        if (resolution.resolved) {
            return resolution.selectedSource;
        }
        // Fallback to most reliable source
        const mostReliable = sources.reduce((best, current) => current.reliability > best.reliability ? current : best);
        return mostReliable.data;
    }
    /**
     * Apply conflict resolution strategies
     */
    async applyConflictResolutionStrategies(sources, conflicts) {
        // Strategy 1: Check for consensus (majority agreement)
        const consensus = this.checkConsensus(sources);
        if (consensus) {
            return {
                resolved: true,
                strategy: 'consensus',
                selectedSource: consensus,
                confidence: 85,
                reasoning: 'Majority of sources agree'
            };
        }
        // Strategy 2: Use most reliable source
        const mostReliable = sources.reduce((best, current) => current.reliability > best.reliability ? current : best);
        return {
            resolved: true,
            strategy: 'reliability',
            selectedSource: mostReliable.name,
            confidence: mostReliable.reliability,
            reasoning: `Selected most reliable source: ${mostReliable.name} (${mostReliable.reliability}%)`
        };
    }
    /**
     * Check for consensus among sources
     */
    checkConsensus(sources) {
        if (sources.length < 3)
            return null;
        // Group sources by similar data
        const groups = new Map();
        sources.forEach(source => {
            const key = this.createDataKey(source.data);
            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key).push(source);
        });
        // Find majority group
        const majorityThreshold = Math.ceil(sources.length / 2);
        for (const [key, group] of groups) {
            if (group.length >= majorityThreshold) {
                return group[0].name; // Return first source from majority group
            }
        }
        return null;
    }
    /**
     * Create a key for grouping similar data
     */
    createDataKey(data) {
        if (!data?.marketData)
            return 'no-data';
        const marketData = data.marketData;
        return `${marketData.price?.toFixed(2) || 'no-price'}-${marketData.volume?.toFixed(0) || 'no-volume'}`;
    }
    /**
     * Create weighted consensus from multiple sources
     */
    createWeightedConsensus(sources) {
        if (sources.length === 1)
            return sources[0].data;
        // Weight by reliability
        const totalWeight = sources.reduce((sum, source) => sum + source.reliability, 0);
        const consensus = {
            marketData: {
                price: 0,
                volume: 0,
                change: 0,
                changePercent: 0,
                timestamp: new Date().toISOString(),
                source: 'consensus',
                quality: 'realtime'
            },
            sources: sources.map(s => s.name),
            warnings: []
        };
        // Calculate weighted averages
        sources.forEach(source => {
            const weight = source.reliability / totalWeight;
            const marketData = source.data?.marketData;
            if (marketData) {
                consensus.marketData.price += (marketData.price || 0) * weight;
                consensus.marketData.volume += (marketData.volume || 0) * weight;
                consensus.marketData.change += (marketData.change || 0) * weight;
                consensus.marketData.changePercent += (marketData.changePercent || 0) * weight;
            }
        });
        return consensus;
    }
    /**
     * Get verification history for a symbol
     */
    getVerificationHistory(symbol) {
        return this.verificationHistory.get(symbol) || [];
    }
    /**
     * Get data consistency score
     */
    getDataConsistencyScore(symbol) {
        const history = this.getVerificationHistory(symbol);
        if (history.length === 0)
            return 100;
        const recentHistory = history.slice(-10); // Last 10 verifications
        const verifiedCount = recentHistory.filter(v => v.verified).length;
        return (verifiedCount / recentHistory.length) * 100;
    }
    /**
     * Generate verification report
     */
    generateVerificationReport(symbol) {
        const history = this.getVerificationHistory(symbol);
        const consistencyScore = this.getDataConsistencyScore(symbol);
        return {
            symbol,
            totalVerifications: history.length,
            verifiedCount: history.filter(v => v.verified).length,
            conflictCount: history.reduce((sum, v) => sum + v.conflicts.length, 0),
            averageConfidence: history.length > 0 ?
                history.reduce((sum, v) => sum + v.confidence, 0) / history.length : 100,
            consistencyScore,
            lastVerified: history.length > 0 ? new Date().toISOString() : null,
            recommendations: this.generateRecommendations(history, consistencyScore)
        };
    }
    /**
     * Generate recommendations based on verification history
     */
    generateRecommendations(history, consistencyScore) {
        const recommendations = [];
        if (consistencyScore < 80) {
            recommendations.push('Consider adding more data sources for better verification');
        }
        if (history.length > 0) {
            const recentConflicts = history.slice(-5).reduce((sum, v) => sum + v.conflicts.length, 0);
            if (recentConflicts > 2) {
                recommendations.push('High conflict rate detected - review data source reliability');
            }
        }
        if (history.length < 10) {
            recommendations.push('Insufficient verification history - continue monitoring');
        }
        return recommendations;
    }
}
exports.DataVerificationSystem = DataVerificationSystem;
