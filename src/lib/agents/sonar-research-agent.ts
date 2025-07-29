import { BaseAgent } from './base-agent';
import { CentralizedDataProvider } from '../centralized-data-provider';
import { AgentInput, AgentOutput, SonarResearchData } from '../types/prediction-types';
import { getBaseUrl } from '../utils';

export class SonarResearchAgent extends BaseAgent {
  constructor() {
    super({
      name: "SonarDeepResearch",
      description: "Deep research AI for company/project analysis",
      model: "sonar",
      temperature: 0.1,
      maxTokens: 2000,
      timeout: 45000
    });
  }

  async process(input: AgentInput): Promise<AgentOutput> {
    // Get comprehensive data from centralized provider
    const centralizedData = await this.getCentralizedData(input.symbol);
    
    // Transform centralized data into research format - no duplicate API calls
    const researchData = this.transformCentralizedDataToResearchData(centralizedData);
    
    // 🏆 GOLD STANDARD: Enhanced financial domain expertise
    const marketContext = this.getMarketContext(input.symbol, centralizedData);
    
    const prompt = `
      As a professional equity research analyst and portfolio manager, conduct comprehensive fundamental and sentiment analysis for ${input.symbol}.
      
      MARKET CONTEXT: ${marketContext}
      RESEARCH DATA: ${JSON.stringify(researchData)}
      
      CRITICAL ANALYSIS REQUIREMENTS:
      • Sector rotation impact and relative strength vs sector peers
      • Earnings calendar proximity and guidance revisions  
      • Economic sensitivity (interest rates, inflation, GDP)
      • Institutional flow patterns and insider activity
      • Risk-adjusted momentum and mean reversion signals
      • Catalyst identification and probability weighting
      
      You MUST return ONLY valid JSON with this EXACT structure - no other text, no markdown, just pure JSON:

      {
        "background": "Company background with competitive positioning and market share analysis",
        "filings": ["Recent SEC filings with key financial metrics changes"],
        "news": ["Material news events with quantified market impact"],
        "executives": ["Leadership changes affecting strategic direction"],
        "products": ["Product pipeline updates with revenue implications"],
        "sentiment": {
          "overall": "bullish|bearish|neutral",
          "newsSentiment": 0.65,
          "socialSentiment": 0.72,
          "analystRating": "buy|hold|sell",
          "institutionalFlow": "net_buying|net_selling|neutral",
          "earningsRevisions": "upgrades|downgrades|stable"
        },
        "marketStructure": {
          "sectorRotation": "inflow|outflow|neutral",
          "relativeStrength": 0.75,
          "correlationBreakdown": "decoupling|coupling|normal",
          "liquidityConditions": "good|poor|normal",
          "volatilityRegime": "low_vol|high_vol|normal"
        },
        "catalysts": [
          {
            "event": "Q4 Earnings Report",
            "date": "2024-02-15",
            "probability": 0.95,
            "impact": "high",
            "direction": "positive|negative|neutral"
          }
        ],
        "riskFactors": {
          "systematic": ["Interest rate sensitivity", "Economic cycle exposure"],
          "idiosyncratic": ["Regulatory risks", "Competitive threats"],
          "tail_risks": ["Black swan events", "Liquidity crises"],
          "risk_adjusted_return": 0.85
        },
        "geopolitical": {
          "economicFactors": ["GDP growth impact", "Inflation sensitivity"],
          "politicalRisks": ["Regulatory changes", "Policy shifts"],
          "socialTrends": ["ESG factors", "Consumer behavior"],
          "globalImpact": "positive|negative|neutral",
          "riskLevel": "low|medium|high"
        },
        "keyEvents": [
          {"date": "2024-01-15", "event": "Earnings beat", "impact": "positive", "price_impact": 0.05}
        ],
        "confidence": 75,
        "sources": ["professional financial data sources"]
      }

      IMPORTANT: Return ONLY the JSON object, no explanations, no markdown formatting, no code blocks. The response must be parseable by JSON.parse().
    `;

    const result = await this.callPerplexity(prompt);
    console.log('[SonarResearchAgent] Raw model output:', result.content);
    let data: SonarResearchData;
    
    try {
      // Try direct JSON parsing first
      data = JSON.parse(result.content);
      console.log('[SonarResearchAgent] Successfully parsed JSON directly');
    } catch (error) {
      console.log('[SonarResearchAgent] Direct JSON parsing failed, trying extraction...');
      // Try to extract JSON from the text
      const extractedJSON = this.extractJSONFromText(result.content);
      if (extractedJSON) {
        try {
          data = JSON.parse(extractedJSON);
          console.log('[SonarResearchAgent] Successfully parsed extracted JSON');
        } catch (extractError) {
          console.error('[SonarResearchAgent] Failed to parse extracted JSON:', extractError);
          console.log('[SonarResearchAgent] Extracted JSON was:', extractedJSON);
          data = this.getFallbackData();
        }
      } else {
        console.error('[SonarResearchAgent] No valid JSON found in response');
        console.log('[SonarResearchAgent] Raw response content:', result.content.substring(0, 500) + '...');
        data = this.getFallbackData();
      }
    }
    
    // Defensive: ensure data is a proper object, not a number or array
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      console.error('[SonarResearchAgent] Invalid data format, using fallback');
      data = this.getFallbackData();
    }
    
    // Defensive: filter sources to valid URLs or domain names
    if (data && data.sources) {
      data.sources = data.sources.filter((src: string) => 
        /^https?:\/\//.test(src) || /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(src)
      );
    }
    
    const confidence = data.confidence || this.calculateConfidence({
      dataQuality: 85,
      signalStrength: 80,
      sourceReliability: 90,
      recency: 95
    });

    // Create quality and validation metrics based on centralized data
    const qualityMetrics = this.createQualityMetrics(centralizedData);
    const validationMetrics = this.createValidationMetrics(centralizedData);
    const reliabilityMetrics = this.createReliabilityMetrics(centralizedData);

    return {
      agent: this.config.name,
      symbol: input.symbol,
      timestamp: new Date().toISOString(),
      data: data,
      confidence: confidence,
      sources: data.sources || [],
      processingTime: result.processingTime,
      metadata: { 
        lastUpdated: new Date().toISOString()
      },
      quality: qualityMetrics,
      validation: validationMetrics,
      reliability: reliabilityMetrics
    };
  }


  private transformCentralizedDataToResearchData(centralizedData: any) {
    // Transform comprehensive data from CentralizedDataProvider into research format
    const sentiment = this.analyzeSentiment(centralizedData);
    const marketData = centralizedData.marketData;
    const newsData = centralizedData.newsData;
    
    // Use real market data from Yahoo Finance API
    const priceChange = marketData?.changePercent || 0;
    const volume = marketData?.volume || 0;
    
    return {
      background: `${marketData?.symbol || 'Unknown'} - Current Price: $${marketData?.price?.toFixed(2) || 'N/A'}, ${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}% (Volume: ${volume.toLocaleString()})`,
      filings: [],
      news: newsData?.articles?.map((n: any) => n.title) || [],
      executives: [],
      products: [],
      sentiment: {
        overall: sentiment,
        newsSentiment: newsData?.sentimentScore || this.calculateNewsSentiment(newsData?.articles || []),
        socialSentiment: 0.5, // No social media data in current structure
        analystRating: this.deriveAnalystRating(priceChange, newsData?.overallSentiment)
      },
      geopolitical: {
        economicFactors: this.extractEconomicFactors(centralizedData),
        politicalRisks: ['Market volatility risk', 'Regulatory changes'],
        socialTrends: ['Digital transformation', 'ESG investing trends'],
        globalImpact: priceChange > 5 ? 'positive' : priceChange < -5 ? 'negative' : 'neutral',
        riskLevel: Math.abs(priceChange) > 10 ? 'high' : Math.abs(priceChange) > 5 ? 'medium' : 'low'
      },
      keyEvents: this.extractKeyEvents(centralizedData),
      confidence: centralizedData.overallQuality === 'realtime' ? 85 : centralizedData.overallQuality === 'cached' ? 75 : 60,
      sources: centralizedData.sources || ['Yahoo Finance']
    };
  }

  private analyzeSentiment(data: any): string {
    // Use centralized data sentiment analysis
    if (!data) return 'neutral';
    
    // First check if newsData has overall sentiment from Yahoo Finance
    if (data.newsData?.overallSentiment) {
      return data.newsData.overallSentiment;
    }
    
    // Fallback to price movement analysis
    const priceChange = data.marketData?.changePercent || 0;
    if (priceChange > 2) return 'bullish';
    if (priceChange < -2) return 'bearish';
    return 'neutral';
  }

  private calculateNewsSentiment(news: any[]): number {
    if (!news || !news.length) return 0.5;
    const sentimentScores = news.map(n => {
      if (n.sentiment === 'bullish') return n.impact || 0.7;
      if (n.sentiment === 'bearish') return 1 - (n.impact || 0.7);
      return 0.5;
    });
    return sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length;
  }

  private deriveAnalystRating(priceChange: number, sentiment?: string): string {
    if (sentiment === 'bullish' || priceChange > 5) return 'buy';
    if (sentiment === 'bearish' || priceChange < -5) return 'sell';
    return 'hold';
  }

  private extractEconomicFactors(data: any): string[] {
    const factors = ['Market conditions'];
    const marketData = data.marketData;
    
    if (marketData?.volume && marketData.volume > 1000000) {
      factors.push('High trading volume indicates strong interest');
    }
    
    if (Math.abs(marketData?.changePercent || 0) > 5) {
      factors.push('Significant price movement detected');
    }
    
    return factors;
  }

  private extractKeyEvents(data: any): Array<{date: string; event: string; impact: string}> {
    const events = [];
    const today = new Date().toISOString().split('T')[0];
    const marketData = data.marketData;
    
    if (marketData?.changePercent) {
      const impact = marketData.changePercent > 0 ? 'positive' : 'negative';
      events.push({
        date: today,
        event: `Price moved ${marketData.changePercent > 0 ? '+' : ''}${marketData.changePercent.toFixed(2)}%`,
        impact
      });
    }
    
    // Add news events
    if (data.newsData?.articles) {
      data.newsData.articles.slice(0, 2).forEach((article: any) => {
        events.push({
          date: article.timestamp ? article.timestamp.split('T')[0] : today,
          event: article.title,
          impact: article.sentiment === 'bullish' ? 'positive' : article.sentiment === 'bearish' ? 'negative' : 'neutral'
        });
      });
    }
    
    return events;
  }

  private calculateSocialSentiment(socialMedia: any[]): number {
    if (!socialMedia || !socialMedia.length) return 0.5;
    const sentimentScores = socialMedia.map(s => {
      if (s.sentiment === 'bullish') return 0.7;
      if (s.sentiment === 'bearish') return 0.3;
      return 0.5;
    });
    return sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length;
  }

  // 🏆 GOLD STANDARD: Generate professional market context
  private getMarketContext(symbol: string, centralizedData: any): string {
    try {
      const marketData = centralizedData?.marketData;
      const technicalData = centralizedData?.technicalData;
      
      if (!marketData) {
        return "LIMITED DATA - Basic analysis only";
      }
      
      const price = marketData.price || 0;
      const change = marketData.changePercent || 0;
      const volume = marketData.volume || 0;
      
      // Market regime analysis
      let marketRegime = "NEUTRAL";
      if (change > 5) marketRegime = "STRONG BULL";
      else if (change > 2) marketRegime = "BULL";
      else if (change < -5) marketRegime = "STRONG BEAR";  
      else if (change < -2) marketRegime = "BEAR";
      
      // Volume analysis
      let volumeContext = "NORMAL";
      if (volume > 2000000) volumeContext = "HIGH";
      else if (volume < 100000) volumeContext = "LOW";
      
      // Technical context
      let technicalContext = "NO TECHNICAL DATA";
      if (technicalData) {
        const rsi = technicalData.rsi || 50;
        const macd = technicalData.macd?.value || 0;
        
        if (rsi > 70) technicalContext = "OVERBOUGHT (RSI>70)";
        else if (rsi < 30) technicalContext = "OVERSOLD (RSI<30)";
        else if (macd > 0) technicalContext = "BULLISH MOMENTUM (MACD+)";
        else if (macd < 0) technicalContext = "BEARISH MOMENTUM (MACD-)";
        else technicalContext = "NEUTRAL MOMENTUM";
      }
      
      // Sector analysis (basic inference from symbol)
      let sectorContext = "GENERAL MARKET";
      if (symbol.includes('AAPL') || symbol.includes('MSFT') || symbol.includes('GOOGL')) {
        sectorContext = "MEGA-CAP TECH - Rate sensitive, earnings driven";
      } else if (symbol.includes('JPM') || symbol.includes('BAC') || symbol.includes('WFC')) {
        sectorContext = "FINANCIALS - Rate sensitive, economic cycle dependent";
      } else if (symbol.includes('XOM') || symbol.includes('CVX')) {
        sectorContext = "ENERGY - Commodity driven, geopolitical sensitive";
      } else if (symbol.includes('BTC') || symbol.includes('ETH')) {
        sectorContext = "CRYPTO - High volatility, sentiment driven, regulatory sensitive";
      }
      
      return `MARKET REGIME: ${marketRegime} | VOLUME: ${volumeContext} | TECHNICAL: ${technicalContext} | SECTOR: ${sectorContext} | PRICE: $${price.toFixed(2)} (${change > 0 ? '+' : ''}${change.toFixed(2)}%)`;
      
    } catch (error) {
      console.error('Error generating market context:', error);
      return "MARKET CONTEXT UNAVAILABLE - Proceeding with basic analysis";
    }
  }

  private getFallbackData(): SonarResearchData {
    return {
      background: '',
      filings: [],
      news: [],
      executives: [],
      products: [],
      sentiment: {
        overall: 'neutral',
        newsSentiment: 0.5,
        socialSentiment: 0.5,
        analystRating: 'hold'
      },
      geopolitical: {
        economicFactors: ['Stable economic conditions'],
        politicalRisks: ['Low political risk'],
        socialTrends: ['Neutral social sentiment'],
        globalImpact: 'neutral',
        riskLevel: 'low'
      },
      keyEvents: [],
      confidence: 50,
      sources: []
    };
  }
}
