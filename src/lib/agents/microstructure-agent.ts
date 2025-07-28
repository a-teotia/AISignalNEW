import { BaseAgent } from './base-agent';
import { AgentInput, AgentOutput } from '../types/prediction-types';
import { getBaseUrl } from '../utils';

export interface MicrostructureData {
  orderBook: {
    bidDepth: Array<{
      price: number;
      size: number;
      cumulative: number;
    }>;
    askDepth: Array<{
      price: number;
      size: number;
      cumulative: number;
    }>;
    spread: number;
    midPrice: number;
  };
  liquidityMetrics: {
    marketDepth: number;
    slippage: {
      buySlippage: number;
      sellSlippage: number;
      averageSlippage: number;
    };
    volumeProfile: {
      highVolumeNodes: number[];
      lowVolumeNodes: number[];
      poc: number; // Point of Control
    };
    orderFlow: {
      buyVolume: number;
      sellVolume: number;
      netFlow: number;
      largeOrders: number;
    };
  };
  marketEfficiency: {
    priceImpact: number;
    resilience: number;
    efficiency: number;
    volatility: number;
  };
  confidence: number;
  sources: string[];
}

function isCrypto(symbol: string) {
  return symbol.includes('BTC') || symbol.includes('ETH') || symbol.includes('USDT');
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

async function fetchLiveData(symbol: string) {
  if (isCrypto(symbol)) {
    try {
      // Try multiple crypto exchanges for redundancy
      const exchanges = [
        {
          name: 'Binance',
          url: `https://api.binance.com/api/v3/depth?symbol=${symbol.replace('/', '').replace('USD', 'USDT')}&limit=50`,
          transform: (data: any) => {
            const bidDepth = data.bids.slice(0, 10).map((bid: [string, string], index: number) => {
              const price = parseFloat(bid[0]);
              const size = parseFloat(bid[1]);
              const cumulative = data.bids.slice(0, index + 1).reduce((sum: number, b: [string, string]) => sum + parseFloat(b[1]), 0);
              return { price, size, cumulative };
            });
            
            const askDepth = data.asks.slice(0, 10).map((ask: [string, string], index: number) => {
              const price = parseFloat(ask[0]);
              const size = parseFloat(ask[1]);
              const cumulative = data.asks.slice(0, index + 1).reduce((sum: number, a: [string, string]) => sum + parseFloat(a[1]), 0);
              return { price, size, cumulative };
            });
            
            const spread = askDepth[0]?.price - bidDepth[0]?.price || 0;
            const midPrice = (askDepth[0]?.price + bidDepth[0]?.price) / 2 || 0;
            
            return { bidDepth, askDepth, spread, midPrice };
          }
        },
        {
          name: 'Coinbase',
          url: `https://api.exchange.coinbase.com/products/${symbol.replace('/', '-')}/book?level=2`,
          transform: (data: any) => {
            const bidDepth = data.bids.slice(0, 10).map((bid: [string, string, string], index: number) => {
              const price = parseFloat(bid[0]);
              const size = parseFloat(bid[1]);
              const cumulative = data.bids.slice(0, index + 1).reduce((sum: number, b: [string, string, string]) => sum + parseFloat(b[1]), 0);
              return { price, size, cumulative };
            });
            
            const askDepth = data.asks.slice(0, 10).map((ask: [string, string, string], index: number) => {
              const price = parseFloat(ask[0]);
              const size = parseFloat(ask[1]);
              const cumulative = data.asks.slice(0, index + 1).reduce((sum: number, a: [string, string, string]) => sum + parseFloat(a[1]), 0);
              return { price, size, cumulative };
            });
            
            const spread = askDepth[0]?.price - bidDepth[0]?.price || 0;
            const midPrice = (askDepth[0]?.price + bidDepth[0]?.price) / 2 || 0;
            
            return { bidDepth, askDepth, spread, midPrice };
          }
        }
      ];
      
      // Try each exchange until one works
      for (const exchange of exchanges) {
        try {
          console.log(`[MicrostructureAgent] Trying ${exchange.name} for ${symbol}...`);
          const response = await fetch(exchange.url, { 
            headers: { 'User-Agent': 'AI-Signal-Platform/1.0' }
          });
          
          if (response.ok) {
            const data = await response.json();
            const orderBook = exchange.transform(data);
            
            if (orderBook.bidDepth.length > 0 && orderBook.askDepth.length > 0) {
              console.log(`[MicrostructureAgent] Successfully fetched data from ${exchange.name}`);
              return {
                price: { price: orderBook.midPrice, symbol },
                orderBook,
                source: exchange.name
              };
            }
          }
        } catch (error) {
          console.log(`[MicrostructureAgent] ${exchange.name} failed:`, error instanceof Error ? error.message : 'Unknown error');
          continue;
        }
      }
      
      console.log('[MicrostructureAgent] All crypto exchanges failed');
      return null;
      
    } catch (error) {
      console.error('[MicrostructureAgent] Error fetching crypto data:', error);
      return null;
    }
  } else {
    // For stocks, we'll skip microstructure analysis as it requires specialized data
    console.log('[MicrostructureAgent] Skipping microstructure for non-crypto symbol:', symbol);
    return null;
  }
}

export class MicrostructureAgent extends BaseAgent {
  constructor() {
    super({
      name: "Microstructure",
      description: "Order book and liquidity analysis",
      model: "sonar",
      temperature: 0.1,
      maxTokens: 2000,
      timeout: 30000
    });
  }

  async process(input: AgentInput): Promise<AgentOutput> {
    // 🔍 DEBUG: Log what data the MicrostructureAgent is receiving
    console.log('\n🔍 [MicrostructureAgent] INPUT DATA RECEIVED:');
    console.log('Symbol:', input.symbol);
    console.log('Full input object:', JSON.stringify(input, null, 2));
    console.log('Input type:', typeof input);
    console.log('Input keys:', Object.keys(input));
    
    // Get comprehensive data from centralized provider
    const centralizedData = await this.getCentralizedData(input.symbol);
    
    console.log('\n🔍 [MicrostructureAgent] CENTRALIZED DATA:');
    console.log('Centralized data keys:', Object.keys(centralizedData));
    console.log('Centralized data quality:', centralizedData.overallQuality);
    console.log('Centralized data sources:', centralizedData.sources);
    
    let liveData: any = null;
    try {
      console.log('\n🔍 [MicrostructureAgent] FETCHING LIVE DATA...');
      liveData = await fetchLiveData(input.symbol);
      console.log('[MicrostructureAgent] Live data fetched successfully:', liveData ? 'Yes' : 'No');
      if (liveData) {
        console.log('Live data structure:', JSON.stringify(liveData, null, 2));
      }
    } catch (e) {
      console.error('[MicrostructureAgent] Live data fetch failed, falling back to getMicrostructureData:', e);
    }
    
    // Use live data if available, otherwise indicate no data
    let microstructureData: any;
    if (liveData && liveData.orderBook && liveData.orderBook.bidDepth.length > 0) {
      microstructureData = liveData;
      console.log('[MicrostructureAgent] Using live order book data from', liveData.source);
    } else {
      console.log('[MicrostructureAgent] No real order book data available - skipping analysis');
      // Return early with zero confidence to indicate no real data
      return {
        agent: this.config.name,
        symbol: input.symbol,
        timestamp: new Date().toISOString(),
        data: this.getFallbackData(),
        confidence: 0, // Zero confidence indicates no real data
        sources: ["no_real_data_available"],
        processingTime: 0,
        quality: {
          dataFreshness: 0,
          sourceReliability: 0,
          crossVerification: 0,
          anomalyScore: 0,
          completeness: 0,
          consistency: 0,
          overallQuality: 0,
          warnings: ["No real order book data available"],
          lastValidated: new Date().toISOString()
        },
        validation: {
          passed: false,
          checks: [
            {
              name: "Data Availability",
              passed: false,
              score: 0,
              details: "No real order book data available",
              critical: true
            }
          ],
          score: 0
        },
        reliability: {
          historicalAccuracy: 0,
          dataSourceHealth: 0,
          signalStrength: 0
        }
      };
    }
    
    // Note: Real-time market data available from centralized provider
    const hasRealTimeData = centralizedData.overallQuality === 'realtime';
    
    const prompt = `
      Analyze ${input.symbol} market microstructure using this data: ${JSON.stringify(microstructureData)}

      If the input data already contains valid orderBook data with bidDepth and askDepth arrays, use that data directly.
      If not, generate realistic microstructure analysis based on the available data.

      You MUST return ONLY valid JSON with this EXACT structure - no other text, no markdown, just pure JSON:

      {
        "orderBook": {
          "bidDepth": [
            {"price": 108500, "size": 25.5, "cumulative": 25.5},
            {"price": 108000, "size": 45.2, "cumulative": 70.7}
          ],
          "askDepth": [
            {"price": 109000, "size": 30.1, "cumulative": 30.1},
            {"price": 109500, "size": 40.8, "cumulative": 70.9}
          ],
          "spread": 500,
          "midPrice": 108750
        },
        "liquidityMetrics": {
          "marketDepth": 50000000,
          "slippage": {
            "buySlippage": 0.08,
            "sellSlippage": 0.06,
            "averageSlippage": 0.07
          },
          "volumeProfile": {
            "highVolumeNodes": [108000, 109000, 110000],
            "lowVolumeNodes": [107500, 108500, 109500],
            "poc": 109000
          },
          "orderFlow": {
            "buyVolume": 8500000000,
            "sellVolume": 7200000000,
            "netFlow": 1300000000,
            "largeOrders": 45
          }
        },
        "marketEfficiency": {
          "priceImpact": 0.12,
          "resilience": 0.85,
          "efficiency": 0.78,
          "volatility": 0.045
        },
        "confidence": 75,
        "sources": ["source1", "source2"]
      }

      IMPORTANT: 
      - Return ONLY the JSON object, no explanations, no markdown formatting, no code blocks
      - The response must be parseable by JSON.parse()
      - If input data has orderBook, use it directly; otherwise generate realistic data
      - Ensure bidDepth and askDepth are arrays with at least 5 entries each
    `;

    const result = await this.callPerplexity(prompt);
    let data: MicrostructureData;
    
    try {
      // Try direct JSON parsing first
      data = JSON.parse(result.content);
      console.log('[MicrostructureAgent] Successfully parsed JSON directly');
    } catch (error) {
      console.log('[MicrostructureAgent] Direct JSON parsing failed, trying extraction...');
      // Try to extract JSON from the text
      const extractedJSON = this.extractJSONFromText(result.content);
      if (extractedJSON) {
        try {
          data = JSON.parse(extractedJSON);
          console.log('[MicrostructureAgent] Successfully parsed extracted JSON');
        } catch (extractError) {
          console.error('[MicrostructureAgent] Failed to parse extracted JSON:', extractError);
          console.log('[MicrostructureAgent] Extracted JSON was:', extractedJSON);
          data = this.getFallbackData();
        }
      } else {
        console.error('[MicrostructureAgent] No valid JSON found in response');
        console.log('[MicrostructureAgent] Raw response content:', result.content.substring(0, 500) + '...');
        data = this.getFallbackData();
      }
    }
    
    // Defensive: ensure data is a proper object, not a number or array
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      console.error('[MicrostructureAgent] Invalid data format, using fallback');
      data = this.getFallbackData();
    }
    
    // Ensure order book data is valid
    if (!data.orderBook || !Array.isArray(data.orderBook.bidDepth) || !Array.isArray(data.orderBook.askDepth) || 
        data.orderBook.bidDepth.length === 0 || data.orderBook.askDepth.length === 0) {
      console.error('[MicrostructureAgent] Invalid order book data, using fallback');
      data = this.getFallbackData();
    }
    
    const confidence = data.confidence || this.calculateMicrostructureConfidence(data);
    const sources = [
      ...(data.sources || [
        input.symbol.includes('BTC') || input.symbol.includes('ETH') ? 'https://binance.com' : 'https://finance.yahoo.com',
        input.symbol.includes('BTC') || input.symbol.includes('ETH') ? 'https://coinbase.com' : 'https://asx.com.au',
        'https://orderbook.com'
      ]),
      ...centralizedData.sources
    ];

    // Create quality and validation metrics based on centralized data
    const qualityMetrics = this.createQualityMetrics(centralizedData);
    const validationMetrics = this.createValidationMetrics(centralizedData);
    const reliabilityMetrics = this.createReliabilityMetrics(centralizedData);

    const finalResult = {
      agent: this.config.name,
      symbol: input.symbol,
      timestamp: new Date().toISOString(),
      data: data,
      confidence: confidence,
      sources: sources,
      processingTime: result.processingTime,
      quality: qualityMetrics,
      validation: validationMetrics,
      reliability: reliabilityMetrics
    };

    // 🔍 DEBUG: Log the final result being returned
    console.log('\n🔍 [MicrostructureAgent] FINAL RESULT:');
    console.log('Agent name:', finalResult.agent);
    console.log('Symbol:', finalResult.symbol);
    console.log('Confidence:', finalResult.confidence);
    console.log('Data structure:', JSON.stringify(finalResult.data, null, 2));
    console.log('Quality score:', finalResult.quality?.overallQuality);
    console.log('Validation passed:', finalResult.validation?.passed);
    console.log('Result type:', typeof finalResult);
    console.log('Result keys:', Object.keys(finalResult));

    return finalResult;
  }

  private async getMicrostructureData(symbol: string) {
    try {
      // This would typically come from exchange APIs (Binance, Coinbase, etc.)
      // For now, return mock data structure
      return {
        orderBook: {
          spread: 500,
          midPrice: 108750,
          depth: 50000000
        },
        liquidity: {
          slippage: 0.07,
          volume: 8500000000
        }
      };
    } catch (error) {
      console.error('Error fetching microstructure data:', error);
      return {};
    }
  }

  private calculateMicrostructureConfidence(data: MicrostructureData): number {
    // If no real data, return zero confidence
    if (!data.orderBook || data.orderBook.bidDepth.length === 0 || data.orderBook.askDepth.length === 0) {
      return 0;
    }
    
    const factors = {
      dataQuality: 90,
      signalStrength: this.calculateMicrostructureSignalStrength(data),
      sourceReliability: 95,
      recency: 98
    };

    return this.calculateConfidence(factors);
  }

  private calculateMicrostructureSignalStrength(data: MicrostructureData): number {
    let strength = 50;
    
    // Liquidity impact
    if (data.liquidityMetrics?.marketDepth) {
      const depth = data.liquidityMetrics.marketDepth;
      strength += depth > 100000000 ? 20 : depth > 50000000 ? 15 : 5;
    }
    
    // Order flow impact
    if (data.liquidityMetrics?.orderFlow?.netFlow) {
      const netFlow = Math.abs(data.liquidityMetrics.orderFlow.netFlow);
      strength += netFlow > 1000000000 ? 20 : netFlow > 500000000 ? 15 : 5;
    }
    
    return Math.min(100, strength);
  }

  private getFallbackData(): MicrostructureData {
    // Return minimal valid structure with zero confidence to indicate no real data
    return {
      orderBook: {
        bidDepth: [],
        askDepth: [],
        spread: 0,
        midPrice: 0
      },
      liquidityMetrics: {
        marketDepth: 0,
        slippage: {
          buySlippage: 0,
          sellSlippage: 0,
          averageSlippage: 0
        },
        volumeProfile: {
          highVolumeNodes: [],
          lowVolumeNodes: [],
          poc: 0
        },
        orderFlow: {
          buyVolume: 0,
          sellVolume: 0,
          netFlow: 0,
          largeOrders: 0
        }
      },
      marketEfficiency: {
        priceImpact: 0,
        resilience: 0,
        efficiency: 0,
        volatility: 0
      },
      confidence: 0, // Zero confidence indicates no real data
      sources: ["no_data_available"]
    };
  }
} 