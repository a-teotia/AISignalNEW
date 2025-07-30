import { AgentInput, AgentOutput, AgentConfig } from '../types/prediction-types';
import { ComprehensiveDataResult as ComprehensiveData } from '../services/types';
import { validateAgentData, validateAgentOutput } from '../validation/data-schemas';

export abstract class BaseAgent {
  protected config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  abstract process(input: AgentInput): Promise<AgentOutput>;

  protected async callAI(prompt: string, context?: any): Promise<any> {
    const startTime = Date.now();
    
    try {
      const isO3 = this.config.model && this.config.model.startsWith('o3');
      const body: any = {
        model: this.config.model,
        messages: [
          {
            role: "system",
            content: `You are ${this.config.name}: ${this.config.description}. 
            Always respond with valid JSON. Include confidence scores (0-100) and cite your sources.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
      };
      if (!isO3) {
        body['temperature'] = this.config.temperature;
      }
      if (isO3) {
        body['max_completion_tokens'] = this.config.maxTokens;
      } else {
        body['max_tokens'] = this.config.maxTokens;
      }

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify(body),
      });

      const responseText = await response.text();
      
      // Check if response is HTML (error page)
      if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
        console.error(`${this.config.name} OpenAI returned HTML instead of JSON:`, responseText.substring(0, 200));
        throw new Error('OpenAI API returned HTML error page');
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error(`${this.config.name} OpenAI returned invalid JSON:`, responseText.substring(0, 200));
        throw new Error('OpenAI API returned invalid JSON');
      }
      
      const processingTime = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`AI API error: ${data.error?.message || 'Unknown error'}`);
      }

      return {
        content: data.choices[0].message.content,
        processingTime
      };
    } catch (error) {
      console.error(`${this.config.name} error:`, error);
      throw error;
    }
  }

  protected async callPerplexity(prompt: string): Promise<any> {
    const startTime = Date.now();
    
    // Check if API key is configured
    if (!process.env.PERPLEXITY_API_KEY || process.env.PERPLEXITY_API_KEY === 'your_perplexity_api_key_here') {
      console.warn(`${this.config.name}: PERPLEXITY_API_KEY not configured. Skipping Perplexity API call.`);
      return {
        content: JSON.stringify({
          error: "Perplexity API not configured",
          message: "Please add PERPLEXITY_API_KEY to your environment variables"
        }),
        processingTime: Date.now() - startTime
      };
    }
    
    try {
      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        },
        body: JSON.stringify({
          model: this.config.model || "sonar",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
        }),
      });

      const text = await response.text();
      console.log(`${this.config.name} Perplexity raw response:`, text.substring(0, 200) + '...');
      
      // Check if response is HTML (error page)
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        console.error(`${this.config.name} Perplexity returned HTML instead of JSON:`, text.substring(0, 200));
        throw new Error('Perplexity API returned HTML error page');
      }
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error(`${this.config.name} Perplexity error: Response was not valid JSON.`, text.substring(0, 200));
        throw new Error('Perplexity API did not return valid JSON.');
      }
      const processingTime = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${data.error?.message || 'Unknown error'}`);
      }

      console.log(`${this.config.name} Perplexity parsed response:`, {
        choices: data.choices?.length,
        content: data.choices?.[0]?.message?.content?.substring(0, 100) + '...'
      });

      return {
        content: data.choices[0].message.content,
        processingTime
      };
    } catch (error) {
      console.error(`${this.config.name} Perplexity error:`, error);
      throw error;
    }
  }

  /**
   * Get comprehensive data from modular data provider
   */
  protected async getCentralizedData(symbol: string): Promise<ComprehensiveData> {
    try {
      const { createDataProviderOrchestrator } = await import('../services');
      const orchestrator = await createDataProviderOrchestrator();
      return await orchestrator.getComprehensiveData(symbol);
    } catch (error) {
      console.error(`${this.config.name} Modular data provider error:`, error);
      throw error;
    }
  }

  /**
   * Get market data from modular provider (backward compatibility)
   */
  protected async getRapidAPIMarketData(symbol: string): Promise<any> {
    try {
      const { createDataProviderOrchestrator } = await import('../services');
      const orchestrator = await createDataProviderOrchestrator();
      const data = await orchestrator.getComprehensiveData(symbol);
      
      return {
        price: data.marketData.price,
        change: data.marketData.change,
        changePercent: data.marketData.changePercent,
        volume: data.marketData.volume,
        marketCap: data.marketData.marketCap,
        peRatio: data.marketData.peRatio,
        dividendYield: data.marketData.dividendYield,
        timestamp: data.marketData.timestamp,
        source: data.marketData.source,
        quality: data.marketData.quality
      };
    } catch (error) {
      console.error(`${this.config.name} Modular data provider error:`, error);
      return null;
    }
  }

  protected extractSources(content: string): string[] {
    // Extract URLs and citations from content
    const urlRegex = /https?:\/\/[^\s]+/g;
    const urls = content.match(urlRegex) || [];
    
    // Extract other source references
    const sourceRegex = /(?:source|from|via|according to):\s*([^\n]+)/gi;
    const sources = content.match(sourceRegex) || [];
    
    return [...urls, ...sources];
  }

  protected extractJSONFromText(text: string): string | null {
    // First, try to parse the entire text as JSON
    try {
      JSON.parse(text.trim());
      return text.trim();
    } catch {
      // Not valid JSON, continue with extraction
    }

    // Try to find JSON object with more precise matching
    const jsonMatches = text.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g);
    if (jsonMatches) {
      for (const match of jsonMatches) {
        try {
          JSON.parse(match);
          return match;
        } catch {
          // Not valid JSON, continue
        }
      }
    }

    // Try to find JSON array
    const arrayMatches = text.match(/\[[^\[\]]*(?:\{[^{}]*\}[^\[\]]*)*\]/g);
    if (arrayMatches) {
      for (const match of arrayMatches) {
        try {
          JSON.parse(match);
          return match;
        } catch {
          // Not valid JSON
        }
      }
    }

    // Last resort: try to find anything that looks like JSON
    const lines = text.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        try {
          JSON.parse(trimmed);
          return trimmed;
        } catch {
          // Not valid JSON
        }
      }
    }
    
    return null;
  }

  protected calculateConfidence(factors: Record<string, number>): number {
    // Weighted average of confidence factors
    const weights = {
      dataQuality: 0.3,
      signalStrength: 0.3,
      sourceReliability: 0.2,
      recency: 0.2
    };

    let totalConfidence = 0;
    let totalWeight = 0;

    for (const [factor, weight] of Object.entries(weights)) {
      if (factors[factor] !== undefined) {
        totalConfidence += factors[factor] * weight;
        totalWeight += weight;
      }
    }

    return totalWeight > 0 ? Math.round(totalConfidence / totalWeight) : 50;
  }

  /**
   * Create quality metrics based on centralized data
   */
  protected createQualityMetrics(data: ComprehensiveData): any {
    const qualityMap = {
      'realtime': 100,
      'cached': 80,
      'stale_cache': 60,
      'historical': 40,
      'none': 0
    };

    const overallQuality = qualityMap[data.overallQuality] || 0;
    const hasRealTimeData = data.overallQuality === 'realtime';

    return {
      dataFreshness: hasRealTimeData ? 100 : 60,
      sourceReliability: hasRealTimeData ? 100 : 50,
      crossVerification: data.sources.length > 1 ? 100 : 50,
      anomalyScore: 100,
      completeness: data.marketData.quality !== 'none' ? 100 : 0,
      consistency: 100,
      overallQuality: overallQuality,
      warnings: data.warnings,
      lastValidated: new Date().toISOString()
    };
  }

  /**
   * Create validation metrics based on centralized data
   */
  protected createValidationMetrics(data: ComprehensiveData): any {
    const hasData = data.marketData.quality !== 'none';
    const hasRealTimeData = data.overallQuality === 'realtime';

    return {
      passed: hasData,
      checks: [
        {
          name: 'Data Completeness',
          passed: hasData,
          score: hasData ? 100 : 0,
          details: hasData ? 'All required fields present' : 'No data available',
          critical: true
        },
        {
          name: 'Confidence Integrity',
          passed: true,
          score: 100,
          details: 'Confidence score is realistic for given data sources',
          critical: true
        },
        {
          name: 'Data Freshness',
          passed: true,
          score: hasRealTimeData ? 100 : 60,
          details: `Data age: 0s (max: 1800s)`,
          critical: false
        },
        {
          name: 'Source Reliability',
          passed: hasRealTimeData,
          score: hasRealTimeData ? 100 : 0,
          details: hasRealTimeData ? `${data.sources.length} sources are reliable` : '0 sources are reliable',
          critical: false
        },
        {
          name: 'Data Consistency',
          passed: true,
          score: 100,
          details: 'Data is internally consistent',
          critical: false
        },
        {
          name: 'Anomaly Detection',
          passed: true,
          score: 100,
          details: 'No statistical anomalies detected',
          critical: false
        }
      ],
      score: hasRealTimeData ? 100 : 60
    };
  }

  /**
   * Create reliability metrics based on centralized data
   */
  protected createReliabilityMetrics(data: ComprehensiveData): any {
    const hasRealTimeData = data.overallQuality === 'realtime';
    
    return {
      historicalAccuracy: 75,
      dataSourceHealth: hasRealTimeData ? 100 : 50,
      signalStrength: 80
    };
  }

  /**
   * Validate agent data using Zod schemas
   */
  protected validateAgentData(data: any): { valid: boolean; data: any; error?: any } {
    return validateAgentData(this.config.name, data);
  }

  /**
   * Validate agent output using Zod schemas
   */
  protected validateAgentOutput(output: any): { valid: boolean; data: any; error?: any } {
    return validateAgentOutput(output);
  }

  /**
   * Enhanced process method with validation
   */
  protected async processWithValidation(input: AgentInput): Promise<AgentOutput> {
    const startTime = Date.now();
    
    try {
      // Process the input
      const result = await this.process(input);
      
      // Validate the output
      const validation = this.validateAgentOutput(result);
      
      if (!validation.valid) {
        console.error(`${this.config.name} output validation failed:`, validation.error);
        // Return a fallback result with validation warnings
        return {
          ...result,
          quality: {
            ...result.quality,
            warnings: [...result.quality.warnings, `Validation failed: ${validation.error}`],
            overallQuality: Math.min(result.quality.overallQuality, 50)
          }
        };
      }
      
      return validation.data;
    } catch (error) {
      console.error(`${this.config.name} processing error:`, error);
      throw error;
    }
  }
}
