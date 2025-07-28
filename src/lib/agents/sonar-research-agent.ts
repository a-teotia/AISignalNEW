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
    
    // Use comprehensive scraped data for more accurate analysis
    const scrapedData = await CentralizedDataProvider.getComprehensiveData(input.symbol);
    const researchData = this.transformScrapedDataToResearchData(scrapedData);
    
    // Enhance research data with centralized data sources
    researchData.sources.push(...centralizedData.sources);
    
    const prompt = `
      Analyze ${input.symbol} for trading using this research data: ${JSON.stringify(researchData)}

      You MUST return ONLY valid JSON with this EXACT structure - no other text, no markdown, just pure JSON:

      {
        "background": "Brief company/project background and current market position",
        "filings": ["Recent filing 1", "Recent filing 2"],
        "news": ["Major news 1", "Major news 2"],
        "executives": ["Executive change 1", "Executive change 2"],
        "products": ["Product update 1", "Product update 2"],
        "sentiment": {
          "overall": "bullish|bearish|neutral",
          "newsSentiment": 0.65,
          "socialSentiment": 0.72,
          "analystRating": "buy|hold|sell"
        },
        "geopolitical": {
          "economicFactors": ["Factor 1", "Factor 2"],
          "politicalRisks": ["Risk 1", "Risk 2"],
          "socialTrends": ["Trend 1", "Trend 2"],
          "globalImpact": "positive|negative|neutral",
          "riskLevel": "low|medium|high"
        },
        "keyEvents": [
          {"date": "2024-01-15", "event": "Earnings beat expectations", "impact": "positive"},
          {"date": "2024-01-10", "event": "New product launch", "impact": "positive"}
        ],
        "confidence": 75,
        "sources": ["source1", "source2"]
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

  private async getResearchData(symbol: string) {
    try {
      const researchData: any = {
        news: [],
        sentiment: { overall: 'neutral', newsSentiment: 0.5, socialSentiment: 0.5, analystRating: 'hold' },
        keyEvents: [],
        sources: []
      };

      // For crypto, get crypto-specific news and sentiment
      if (symbol.includes('BTC') || symbol.includes('ETH')) {
        const [newsRes, sentimentRes] = await Promise.all([
          fetch(`https://api.coingecko.com/api/v3/coins/${symbol.includes('BTC') ? 'bitcoin' : 'ethereum'}/status_updates`),
          fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol.includes('BTC') ? 'bitcoin' : 'ethereum'}&vs_currencies=usd&include_24hr_change=true`)
        ]);
        
        const newsData = await newsRes.json();
        const priceData = await sentimentRes.json();
        
        if (newsData.status_updates) {
          researchData.news = newsData.status_updates.slice(0, 5).map((update: any) => update.description);
        }
        
        // Calculate sentiment based on price action
        const priceChange = priceData[symbol.includes('BTC') ? 'bitcoin' : 'ethereum']?.usd_24h_change || 0;
        researchData.sentiment.newsSentiment = priceChange > 0 ? 0.7 : priceChange < 0 ? 0.3 : 0.5;
        researchData.sentiment.overall = priceChange > 2 ? 'bullish' : priceChange < -2 ? 'bearish' : 'neutral';
        
        researchData.sources.push('https://coingecko.com');
      }
      
      // For ASX stocks, get stock-specific news and data
      if (symbol.includes('.AX')) {
        try {
          // Use Yahoo Finance for news
          const newsRes = await fetch(`https://feeds.finance.yahoo.com/rss/2.0/headline?s=${symbol.replace('.AX', '.AX')}&region=AU&lang=en-AU`);
          const newsText = await newsRes.text();
          
          // Parse RSS feed for news headlines using regex (Node.js compatible)
          const itemMatches = newsText.match(/<item>([\s\S]*?)<\/item>/g) || [];
          const items = itemMatches.slice(0, 5).map(item => {
            const titleMatch = item.match(/<title>([\s\S]*?)<\/title>/);
            return titleMatch ? titleMatch[1] : '';
          }).filter(Boolean);
          
          researchData.news = items;
          
          // Get price data for sentiment
          const baseUrl = getBaseUrl();
        const priceRes = await fetch(`${baseUrl}/api/yahoo-finance?symbol=${encodeURIComponent(symbol)}&interval=1d&range=5d`);
          const priceData = await priceRes.json();
          
          if (priceData && priceData.chart && priceData.chart.result && priceData.chart.result[0]) {
            const result = priceData.chart.result[0];
            const quotes = result.indicators.quote[0];
            const closes = quotes.close;
            
            if (closes && closes.length > 1) {
              const latestPrice = closes[closes.length - 1];
              const prevPrice = closes[closes.length - 2];
              const priceChange = ((latestPrice - prevPrice) / prevPrice) * 100;
              
              researchData.sentiment.newsSentiment = priceChange > 0 ? 0.7 : priceChange < 0 ? 0.3 : 0.5;
              researchData.sentiment.overall = priceChange > 1 ? 'bullish' : priceChange < -1 ? 'bearish' : 'neutral';
            }
          }
          
          researchData.sources.push('https://finance.yahoo.com', 'https://asx.com.au');
        } catch (error) {
          console.error('Error fetching ASX news:', error);
        }
      }
      
      // Add key events based on recent activity
      const today = new Date();
      researchData.keyEvents = [
        {
          date: today.toISOString().split('T')[0],
          event: `Analysis of ${symbol} market position`,
          impact: researchData.sentiment.overall === 'bullish' ? 'positive' : researchData.sentiment.overall === 'bearish' ? 'negative' : 'neutral'
        }
      ];
      
      return researchData;
    } catch (error) {
      console.error('Error fetching research data:', error);
      return {
        news: [],
        sentiment: { overall: 'neutral', newsSentiment: 0.5, socialSentiment: 0.5, analystRating: 'hold' },
        keyEvents: [],
        sources: []
      };
    }
  }

  private transformScrapedDataToResearchData(scrapedData: any) {
    // Transform comprehensive scraped data into research format
    const sentiment = this.analyzeSentiment(scrapedData.sentimentData);
    
    return {
      background: `${scrapedData.symbol} analysis based on comprehensive market data`,
      filings: [],
      news: scrapedData.sentimentData.news.map((n: any) => n.headline),
      executives: [],
      products: [],
      sentiment: {
        overall: sentiment,
        newsSentiment: this.calculateNewsSentiment(scrapedData.sentimentData.news),
        socialSentiment: this.calculateSocialSentiment(scrapedData.sentimentData.socialMedia),
        analystRating: "hold"
      },
      geopolitical: {
        economicFactors: scrapedData.geopoliticalData.economicFactors || ['Stable economic conditions'],
        politicalRisks: scrapedData.geopoliticalData.politicalRisks || ['Low political risk'],
        socialTrends: scrapedData.geopoliticalData.socialTrends || ['Neutral social sentiment'],
        globalImpact: scrapedData.geopoliticalData.globalImpact || 'neutral',
        riskLevel: scrapedData.geopoliticalData.riskLevel || 'low'
      },
      keyEvents: scrapedData.geopoliticalData.events.map((e: any) => ({
        date: e.date,
        event: e.event,
        impact: e.impact
      })),
      confidence: 75,
      sources: ['Reuters', 'Bloomberg', 'CNBC', 'Social Media Analysis']
    };
  }

  private analyzeSentiment(sentimentData: any): string {
    const newsSentiment = this.calculateNewsSentiment(sentimentData.news);
    const socialSentiment = this.calculateSocialSentiment(sentimentData.socialMedia);
    const avgSentiment = (newsSentiment + socialSentiment) / 2;
    
    if (avgSentiment > 0.6) return 'bullish';
    if (avgSentiment < 0.4) return 'bearish';
    return 'neutral';
  }

  private calculateNewsSentiment(news: any[]): number {
    if (!news.length) return 0.5;
    const sentimentScores = news.map(n => {
      if (n.sentiment === 'bullish') return n.impact;
      if (n.sentiment === 'bearish') return 1 - n.impact;
      return 0.5;
    });
    return sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length;
  }

  private calculateSocialSentiment(socialMedia: any[]): number {
    if (!socialMedia.length) return 0.5;
    const sentimentScores = socialMedia.map(s => {
      if (s.sentiment === 'bullish') return 0.7;
      if (s.sentiment === 'bearish') return 0.3;
      return 0.5;
    });
    return sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length;
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
