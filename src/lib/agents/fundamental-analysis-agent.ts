import { createDataProviderOrchestrator } from '../services';

interface FundamentalAgentInput {
  symbol: string;
  previousAnalysis?: any;
}

interface FundamentalAgentOutput {
  success: boolean;
  data: {
    symbol: string;
    fundamentalScore: number; // -100 to +100
    earningsOutlook: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    analystSentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    eventRisk: 'LOW' | 'MEDIUM' | 'HIGH';
    valuationAssessment: string;
    keyInsights: string[];
    riskFactors: string[];
    catalysts: string[];
    reasoning: string;
    confidence: number;
    timestamp: string;
  };
  citedSources: string[];
  nextAgentInput?: any;
}

export class FundamentalAnalysisAgent {
  private perplexityApiKey: string;
  private baseUrl = 'https://api.perplexity.ai/chat/completions';

  constructor() {
    this.perplexityApiKey = process.env.PERPLEXITY_API_KEY || '';
    if (!this.perplexityApiKey) {
      throw new Error('PERPLEXITY_API_KEY is required for Fundamental Analysis Agent');
    }
  }

  /**
   * 🎯 FUNDAMENTAL ANALYSIS AGENT
   * Analyzes earnings, analyst sentiment, SEC filings, corporate events
   */
  async runFundamentalAnalysis(input: FundamentalAgentInput): Promise<FundamentalAgentOutput> {
    const startTime = Date.now();
    console.log(`🏛️ [FUNDAMENTAL AGENT] Starting fundamental analysis for ${input.symbol}...`);

    try {
      // 1. Get premium fundamental data from Yahoo Finance (cached from market data calls)
      let fundamentalData = null;
      
      // First, check if we have cached fundamental data from the Yahoo Finance service
      const cachedData = (global as any).yahooFundamentalCache?.[input.symbol];
      if (cachedData) {
        fundamentalData = cachedData;
        console.log(`✅ [FUNDAMENTAL AGENT] Retrieved cached premium fundamental data for ${input.symbol}`);
      } else {
        // Fallback: Try to get fresh fundamental data
        try {
          const orchestrator = await createDataProviderOrchestrator();
          await orchestrator.initialize();
          const result = await orchestrator.yahooFinanceService.getFundamentalData(input.symbol);
          if (result.success && result.data) {
            fundamentalData = result.data;
            console.log(`✅ [FUNDAMENTAL AGENT] Retrieved fresh premium fundamental data`);
          }
        } catch (error) {
          console.warn(`⚠️ [FUNDAMENTAL AGENT] Could not retrieve fundamental data:`, error);
        }
      }

      // 2. Create comprehensive fundamental analysis prompt
      const prompt = this.createFundamentalPrompt(input.symbol, fundamentalData, input.previousAnalysis);

      // 3. Send to Perplexity Sonar for analysis
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.perplexityApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 4000,
          temperature: 0.1,
          stream: false
        }),
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const analysis = result.choices[0]?.message?.content || '';
      
      // 4. Extract citations
      const citations = this.extractCitations(result);

      // 5. Parse the structured analysis
      const parsedOutput = this.parseAnalysis(analysis, input.symbol);

      const processingTime = Date.now() - startTime;
      console.log(`✅ [FUNDAMENTAL AGENT] Completed analysis in ${processingTime}ms`);

      return {
        success: true,
        data: {
          ...parsedOutput,
          fundamentalScore: this.calculateFundamentalScore(fundamentalData, parsedOutput),
          timestamp: new Date().toISOString(),
        },
        citedSources: citations,
        nextAgentInput: {
          fundamentalInsights: parsedOutput,
          fundamentalData: fundamentalData,
          processingTime
        }
      };

    } catch (error) {
      console.error(`❌ [FUNDAMENTAL AGENT] Error:`, error);
      
      return {
        success: false,
        data: {
          symbol: input.symbol,
          fundamentalScore: 0,
          earningsOutlook: 'NEUTRAL',
          analystSentiment: 'NEUTRAL',
          eventRisk: 'MEDIUM',
          valuationAssessment: 'Unable to assess due to analysis error',
          keyInsights: [],
          riskFactors: ['Analysis unavailable due to technical error'],
          catalysts: [],
          reasoning: `Fundamental analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          confidence: 0,
          timestamp: new Date().toISOString(),
        },
        citedSources: [],
        nextAgentInput: { error: true }
      };
    }
  }

  private createFundamentalPrompt(symbol: string, fundamentalData: any, previousAnalysis: any): string {
    let prompt = `You are a FUNDAMENTAL ANALYSIS EXPERT specializing in earnings analysis, analyst sentiment, and corporate events. You have access to real-time internet data and financial databases.

Your expertise includes:
- Earnings analysis and beat/miss probability
- Analyst upgrade/downgrade interpretation  
- SEC filing significance assessment
- Corporate event impact analysis
- Valuation and consensus analysis

Always provide specific, actionable insights with confidence scores.

FUNDAMENTAL ANALYSIS REQUEST for ${symbol}

TASK: Perform comprehensive fundamental analysis for ${symbol} focusing on:
1. EARNINGS ANALYSIS - Growth trends, beat/miss probability, guidance
2. ANALYST SENTIMENT - Recent upgrades/downgrades, consensus changes
3. EVENT RISK ASSESSMENT - Earnings proximity, SEC filings, corporate events
4. VALUATION CONTEXT - Revenue expectations, growth outlook

`;

    // Add premium fundamental data if available
    if (fundamentalData) {
      prompt += `🎯 PREMIUM FUNDAMENTAL DATA AVAILABLE:

EARNINGS METRICS:
- Current Quarter Estimate: ${fundamentalData.currentQuarterEstimate || 'N/A'}
- Earnings Growth: ${fundamentalData.earningsGrowth || 'N/A'}%
- Consensus Range: $${fundamentalData.earningsConsensus?.low || 'N/A'} - $${fundamentalData.earningsConsensus?.high || 'N/A'} (Avg: $${fundamentalData.earningsConsensus?.average || 'N/A'})
- Consensus Spread: $${fundamentalData.earningsConsensus?.spread || 'N/A'}

REVENUE METRICS:
- Revenue Consensus: $${fundamentalData.revenueConsensus?.average || 'N/A'}
- Revenue Range: $${fundamentalData.revenueConsensus?.low || 'N/A'} - $${fundamentalData.revenueConsensus?.high || 'N/A'}

ANALYST SENTIMENT:
- Overall Sentiment: ${fundamentalData.analystSentiment?.sentiment || 'N/A'}
- Recent Changes: ${fundamentalData.analystSentiment?.recentChanges || 'N/A'}
- Upgrades: ${fundamentalData.analystSentiment?.upgrades || 'N/A'}
- Downgrades: ${fundamentalData.analystSentiment?.downgrades || 'N/A'}

EARNINGS CALENDAR:
- Days Until Earnings: ${fundamentalData.earningsProximity?.daysUntilEarnings || 'N/A'}
- Near Earnings: ${fundamentalData.earningsProximity?.isNearEarnings ? 'YES' : 'NO'}
- Volatility Risk: ${fundamentalData.earningsProximity?.volatilityRisk || 'N/A'}

SEC FILINGS:
- Recent Activity: ${fundamentalData.recentFilingsActivity?.recentActivity || 'N/A'} filings
- Significance: ${fundamentalData.recentFilingsActivity?.significance || 'N/A'}

`;
    }

    // Add previous analysis context
    if (previousAnalysis) {
      prompt += `PREVIOUS ANALYSIS CONTEXT:
${JSON.stringify(previousAnalysis, null, 2)}

`;
    }

    prompt += `SEARCH REQUIREMENTS:
1. Search for latest earnings reports, guidance, and analyst commentary for ${symbol}
2. Find recent SEC filings (10-K, 10-Q, 8-K) and their significance
3. Look for analyst upgrades/downgrades in the last 30 days
4. Check for upcoming earnings date and any guidance updates
5. Research any corporate events, acquisitions, or strategic announcements

RESPONSE FORMAT:
Provide your analysis in the following JSON structure:

{
  "earningsOutlook": "BULLISH|BEARISH|NEUTRAL",
  "analystSentiment": "BULLISH|BEARISH|NEUTRAL", 
  "eventRisk": "LOW|MEDIUM|HIGH",
  "valuationAssessment": "Detailed valuation assessment",
  "keyInsights": ["insight1", "insight2", "insight3"],
  "riskFactors": ["risk1", "risk2", "risk3"],
  "catalysts": ["catalyst1", "catalyst2", "catalyst3"],
  "reasoning": "Comprehensive reasoning for the fundamental outlook",
  "confidence": 85
}

Focus on actionable insights that impact stock price in the next 1-30 days.`;

    return prompt;
  }

  private parseAnalysis(analysis: string, symbol: string): any {
    try {
      // Try to extract JSON from the response
      const jsonMatch = analysis.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          symbol,
          earningsOutlook: parsed.earningsOutlook || 'NEUTRAL',
          analystSentiment: parsed.analystSentiment || 'NEUTRAL',
          eventRisk: parsed.eventRisk || 'MEDIUM',
          valuationAssessment: parsed.valuationAssessment || 'Assessment unavailable',
          keyInsights: parsed.keyInsights || [],
          riskFactors: parsed.riskFactors || [],
          catalysts: parsed.catalysts || [],
          reasoning: parsed.reasoning || analysis.substring(0, 500),
          confidence: parsed.confidence || 50
        };
      }
    } catch (error) {
      console.warn(`[FUNDAMENTAL AGENT] Could not parse JSON, using fallback parsing`);
    }

    // Fallback parsing
    return {
      symbol,
      earningsOutlook: this.extractSentiment(analysis, ['earnings', 'eps', 'revenue']),
      analystSentiment: this.extractSentiment(analysis, ['analyst', 'upgrade', 'downgrade']),
      eventRisk: this.extractRiskLevel(analysis),
      valuationAssessment: this.extractSection(analysis, 'valuation') || 'Assessment based on available data',
      keyInsights: this.extractBulletPoints(analysis, 'insights') || this.extractBulletPoints(analysis, 'key'),
      riskFactors: this.extractBulletPoints(analysis, 'risk') || [],
      catalysts: this.extractBulletPoints(analysis, 'catalyst') || [],
      reasoning: analysis.substring(0, 1000),
      confidence: this.extractConfidence(analysis)
    };
  }

  private calculateFundamentalScore(fundamentalData: any, analysisOutput: any): number {
    let score = 0;

    // Base score from analysis sentiment
    if (analysisOutput.earningsOutlook === 'BULLISH') score += 30;
    else if (analysisOutput.earningsOutlook === 'BEARISH') score -= 30;

    if (analysisOutput.analystSentiment === 'BULLISH') score += 25;
    else if (analysisOutput.analystSentiment === 'BEARISH') score -= 25;

    // Adjust for event risk
    if (analysisOutput.eventRisk === 'HIGH') score -= 10;
    else if (analysisOutput.eventRisk === 'LOW') score += 5;

    // Add premium data insights if available
    if (fundamentalData) {
      // Earnings growth bonus
      if (fundamentalData.earningsGrowth > 10) score += 15;
      else if (fundamentalData.earningsGrowth < -10) score -= 15;

      // Analyst momentum
      const analystData = fundamentalData.analystSentiment;
      if (analystData && analystData.upgrades > analystData.downgrades) {
        score += (analystData.upgrades - analystData.downgrades) * 5;
      }

      // Earnings proximity penalty (higher volatility)
      if (fundamentalData.earningsProximity?.volatilityRisk === 'HIGH') {
        score -= 10;
      }
    }

    // Confidence weighting
    const confidenceWeight = (analysisOutput.confidence || 50) / 100;
    score *= confidenceWeight;

    return Math.max(-100, Math.min(100, Math.round(score)));
  }

  private extractCitations(result: any): string[] {
    const citations: string[] = [];
    
    try {
      if (result.citations && Array.isArray(result.citations)) {
        result.citations.forEach((citation: any) => {
          if (citation.url) {
            citations.push(citation.url);
          }
        });
      }
    } catch (error) {
      console.warn('[FUNDAMENTAL AGENT] Could not extract citations:', error);
    }

    return citations;
  }

  private extractSentiment(text: string, keywords: string[]): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
    const lowerText = text.toLowerCase();
    let bullishScore = 0;
    let bearishScore = 0;

    const bullishTerms = ['bullish', 'positive', 'strong', 'beat', 'exceed', 'outperform', 'upgrade', 'buy', 'optimistic'];
    const bearishTerms = ['bearish', 'negative', 'weak', 'miss', 'underperform', 'downgrade', 'sell', 'pessimistic'];

    keywords.forEach(keyword => {
      const keywordIndex = lowerText.indexOf(keyword);
      if (keywordIndex !== -1) {
        const surrounding = lowerText.substring(Math.max(0, keywordIndex - 50), keywordIndex + 50);
        
        bullishTerms.forEach(term => {
          if (surrounding.includes(term)) bullishScore++;
        });
        
        bearishTerms.forEach(term => {
          if (surrounding.includes(term)) bearishScore++;
        });
      }
    });

    if (bullishScore > bearishScore) return 'BULLISH';
    if (bearishScore > bullishScore) return 'BEARISH';
    return 'NEUTRAL';
  }

  private extractRiskLevel(text: string): 'LOW' | 'MEDIUM' | 'HIGH' {
    const lowerText = text.toLowerCase();
    const highRiskTerms = ['high risk', 'volatile', 'uncertain', 'earnings miss', 'guidance cut'];
    const lowRiskTerms = ['low risk', 'stable', 'predictable', 'consistent', 'reliable'];

    let riskScore = 0;
    highRiskTerms.forEach(term => {
      if (lowerText.includes(term)) riskScore++;
    });
    lowRiskTerms.forEach(term => {
      if (lowerText.includes(term)) riskScore--;
    });

    if (riskScore > 1) return 'HIGH';
    if (riskScore < -1) return 'LOW';
    return 'MEDIUM';
  }

  private extractSection(text: string, sectionKeyword: string): string | null {
    const lines = text.split('\n');
    let capturing = false;
    let section = '';

    for (const line of lines) {
      if (line.toLowerCase().includes(sectionKeyword)) {
        capturing = true;
        section += line + '\n';
      } else if (capturing && line.trim() === '') {
        break;
      } else if (capturing) {
        section += line + '\n';
      }
    }

    return section.trim() || null;
  }

  private extractBulletPoints(text: string, keyword: string): string[] {
    const lines = text.split('\n');
    const bulletPoints: string[] = [];
    let capturing = false;

    for (const line of lines) {
      if (line.toLowerCase().includes(keyword)) {
        capturing = true;
      } else if (capturing && (line.startsWith('-') || line.startsWith('•') || line.match(/^\d+\./))) {
        bulletPoints.push(line.replace(/^[-•\d.]\s*/, '').trim());
      } else if (capturing && line.trim() === '') {
        break;
      }
    }

    return bulletPoints.slice(0, 5); // Limit to 5 points
  }

  private extractConfidence(text: string): number {
    const confidenceMatch = text.match(/confidence[:\s]*(\d+)/i);
    if (confidenceMatch) {
      return parseInt(confidenceMatch[1]);
    }

    // Fallback confidence based on content quality
    const qualityIndicators = ['specific', 'data', 'analysis', 'report', 'consensus'];
    let qualityScore = 0;
    qualityIndicators.forEach(indicator => {
      if (text.toLowerCase().includes(indicator)) qualityScore += 10;
    });

    return Math.min(90, Math.max(30, qualityScore + 40));
  }
}