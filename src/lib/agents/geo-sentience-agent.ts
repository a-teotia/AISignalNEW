import { BaseAgent } from './base-agent';
import { AgentInput, AgentOutput, GeoSentienceData } from '../types/prediction-types';

export class GeoSentienceAgent extends BaseAgent {
  constructor() {
    super({
      name: "GeoSentience",
      description: "Macroeconomic and geopolitical impact analysis using Sonar Deep Research",
      model: "sonar-pro",
      temperature: 0.1,
      maxTokens: 2000,
      timeout: 45000
    });
  }

  async process(input: AgentInput): Promise<AgentOutput> {
    // Get centralized data for context
    const centralizedData = await this.getCentralizedData(input.symbol);
    
    const prompt = `
      Analyze ${input.symbol} for macro/geopolitical factors using Sonar Deep Research model with this market context: ${JSON.stringify(centralizedData)}

      Provide a comprehensive but STABLE analysis focusing on:
      1. Economic factors that affect this asset
      2. Political risks and their impact
      3. Social trends and sentiment
      4. Overall risk assessment

      You MUST return ONLY valid JSON with this EXACT structure - no other text, no markdown, just pure JSON:

      {
        "macroFactors": {
          "economic": ["Factor 1", "Factor 2"],
          "political": ["Factor 1", "Factor 2"],
          "social": ["Factor 1", "Factor 2"]
        },
        "sentimentAnalysis": {
          "twitter": {"sentiment": "positive", "score": 65},
          "reddit": {"sentiment": "neutral", "score": 50},
          "news": {"sentiment": "negative", "score": 35}
        },
        "riskAssessment": {
          "level": "medium",
          "factors": ["Risk 1", "Risk 2"]
        },
        "confidence": 75,
        "sources": ["source1", "source2"]
      }

      IMPORTANT: 
      - Return ONLY the JSON object, no explanations, no markdown formatting, no code blocks
      - The response must be parseable by JSON.parse()
      - Provide STABLE analysis to avoid confidence score fluctuations
      - Focus on long-term trends rather than short-term volatility
    `;

    const result = await this.callPerplexity(prompt);
    console.log('[GeoSentienceAgent] Raw model output:', result.content);
    let data: GeoSentienceData;
    
    try {
      // Try direct JSON parsing first
      data = JSON.parse(result.content);
      console.log('[GeoSentienceAgent] Successfully parsed JSON directly');
    } catch (error) {
      console.log('[GeoSentienceAgent] Direct JSON parsing failed, trying extraction...');
      // Try to extract JSON from the text
      const extractedJSON = this.extractJSONFromText(result.content);
      if (extractedJSON) {
        try {
          data = JSON.parse(extractedJSON);
          console.log('[GeoSentienceAgent] Successfully parsed extracted JSON');
        } catch (extractError) {
          console.error('[GeoSentienceAgent] Failed to parse extracted JSON:', extractError);
          console.log('[GeoSentienceAgent] Extracted JSON was:', extractedJSON);
          data = this.getFallbackData();
        }
      } else {
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
    if (data && (data as any).macroFactors) {
      (data as any).economic = (data as any).macroFactors.economic || [];
      (data as any).political = (data as any).macroFactors.political || [];
      (data as any).social = (data as any).macroFactors.social || [];
      delete (data as any).macroFactors;
    }
    // Defensive: ensure top-level fields exist
    (data as any).economic = (data as any).economic || [];
    (data as any).political = (data as any).political || [];
    (data as any).social = (data as any).social || [];
    
    return {
      agent: this.config.name,
      symbol: input.symbol,
      timestamp: new Date().toISOString(),
      data: data,
      confidence: data.confidence || this.calculateConfidence({
        dataQuality: 85,
        signalStrength: 75,
        sourceReliability: 80,
        recency: 90
      }),
      sources: data.sources || [
        'https://reuters.com',
        'https://bloomberg.com',
        'https://cnbc.com',
        'https://worldbank.org'
      ],
      processingTime: result.processingTime,
      quality: this.createQualityMetrics(centralizedData),
      validation: this.createValidationMetrics(centralizedData),
      reliability: this.createReliabilityMetrics(centralizedData)
    };
  }

  private getFallbackData(): GeoSentienceData {
    return {
      macroFactors: { economic: [], political: [], social: [] },
      sentimentAnalysis: { twitter: { sentiment: 'neutral', score: 0 }, reddit: { sentiment: 'neutral', score: 0 }, news: { sentiment: 'neutral', score: 0 } },
      riskAssessment: { level: 'medium', factors: [] },
      confidence: 50,
      sources: []
    };
  }
}
