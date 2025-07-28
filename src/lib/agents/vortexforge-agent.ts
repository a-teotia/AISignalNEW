import { BaseAgent } from './base-agent';
import { AgentInput, AgentOutput } from '../types/prediction-types';

export class VortexForgeAgent extends BaseAgent {
  constructor() {
    super({
      name: 'VortexForge',
      description: 'LLM-powered deep analysis agent with real-time data context.',
      model: 'sonar-pro', // or your LLM model name
      temperature: 0.2,
      maxTokens: 512,
      timeout: 30000
    });
  }

  async process(input: AgentInput & { timeframe: string; realTimeData: any }): Promise<AgentOutput> {
    const { symbol, timeframe, realTimeData } = input;

    // Format prompt for LLM
    const prompt = this.buildPrompt(symbol, timeframe, realTimeData);

    // Call Perplexity LLM API
    const llmResponse = await this.callLLM(prompt);
    console.log('[VortexForge] Raw LLM response:', llmResponse);

    // Extract and parse the LLM's answer
    let parsedContent = {};
    try {
      const content = llmResponse.choices?.[0]?.message?.content;
      try {
        parsedContent = content ? JSON.parse(content) : {};
      } catch (e) {
        // Fallback: try to extract JSON block from content
        console.error('Failed to parse LLM content as JSON, trying fallback:', e);
        if (content) {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedContent = JSON.parse(jsonMatch[0]);
          } else {
            console.error('No JSON block found in LLM content:', content);
          }
        }
      }
    } catch (e) {
      console.error('Failed to parse LLM content as JSON (outer catch):', e);
    }

    const parsed = this.parseLLMResponse(parsedContent);

    // Return structured AgentOutput
    return {
      agent: 'VortexForge',
      symbol,
      timestamp: new Date().toISOString(),
      data: parsed,
      confidence: parsed.confidence || 50,
      sources: parsed.citations || [],
      processingTime: 0, // TODO: measure
      quality: {
        dataFreshness: 100,
        sourceReliability: 100,
        crossVerification: 100,
        anomalyScore: 100,
        completeness: 100,
        consistency: 100,
        overallQuality: 100,
        warnings: [],
        lastValidated: new Date().toISOString()
      },
      validation: {
        passed: true,
        checks: [],
        score: 100
      },
      reliability: {
        historicalAccuracy: 0,
        dataSourceHealth: 100,
        signalStrength: 100
      },
      metadata: {}
    };
  }

  buildPrompt(symbol: string, timeframe: string, realTimeData: any): string {
    // Strictly require JSON output, no markdown or commentary
    return `You are VortexForge, an expert trading signal AI.\nSymbol: ${symbol}\nTimeframe: ${timeframe}\nCurrent Price: ${realTimeData.currentPrice}\nTechnical Indicators: ${JSON.stringify(realTimeData.indicators)}\nSupport: ${realTimeData.support}\nResistance: ${realTimeData.resistance}\n\nRespond ONLY with a valid JSON object in the following format (no explanation, no markdown):\n{\n  \"currentPrice\": ...,\n  \"technicalSignal\": \"...\",\n  \"supportLevel\": \"...\",\n  \"resistanceLevel\": \"...\",\n  \"verdict\": \"...\",\n  \"reasoning\": \"...\",\n  \"takeProfit\": ...,\n  \"stopLoss\": ...,\n  \"citations\": [...]\n}\nDo not include any commentary, markdown, or formatting outside the JSON.`;
  }

  async callLLM(prompt: string): Promise<any> {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) throw new Error('Perplexity API key not set in environment variables');
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 2000
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
    }
    return response.json();
  }

  parseLLMResponse(response: any): any {
    // Normalize verdict/direction to allowed values
    const rawVerdict = (response.verdict || '').toString().trim().toUpperCase();
    let direction: 'UP' | 'DOWN' | 'NEUTRAL';
    switch (rawVerdict) {
      case 'UP':
      case 'LONG':
      case 'BULLISH':
      case 'BUY':
        direction = 'UP';
        break;
      case 'DOWN':
      case 'SHORT':
      case 'BEARISH':
      case 'SELL':
        direction = 'DOWN';
        break;
      case 'NEUTRAL':
      case 'SIDEWAYS':
        direction = 'NEUTRAL';
        break;
      default:
        direction = 'NEUTRAL';
        if (rawVerdict && rawVerdict !== 'NEUTRAL') {
          console.warn(`[VortexForge] Unrecognized verdict/direction: '${rawVerdict}', defaulting to 'NEUTRAL'`);
        }
    }
    return {
      entry: response.currentPrice || 0,
      takeProfit: response.takeProfit || 0,
      stopLoss: response.stopLoss || 0,
      direction,
      confidence: response.confidence || 50,
      timeframe: response.timeframe || '',
      reasoning: response.reasoning || '',
      supportLevel: response.supportLevel || '',
      resistanceLevel: response.resistanceLevel || '',
      citations: response.citations || []
    };
  }
} 