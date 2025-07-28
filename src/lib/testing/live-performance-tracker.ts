import { AgentOrchestrator } from '../agents/agent-orchestrator';
import { MultiAgentOutput } from '../types/prediction-types';

export interface PredictionRecord {
  id: string;
  symbol: string;
  timestamp: string;
  prediction: MultiAgentOutput;
  actualOutcome?: {
    price1Day: number;
    price1Week: number;
    price1Month: number;
    direction1Day: 'UP' | 'DOWN' | 'SIDEWAYS';
    direction1Week: 'UP' | 'DOWN' | 'SIDEWAYS';
    direction1Month: 'UP' | 'DOWN' | 'SIDEWAYS';
    accuracy: boolean;
  };
  performance: {
    confidenceAccuracy: number; // How well confidence scores predicted accuracy
    agentAccuracy: Record<string, boolean>;
    overallAccuracy: boolean;
    profitLoss?: number; // If we had traded on this signal
  };
}

export interface PerformanceMetrics {
  totalPredictions: number;
  accuratePredictions: number;
  accuracyRate: number;
  averageConfidence: number;
  confidenceAccuracyCorrelation: number;
  agentPerformance: Record<string, {
    total: number;
    accurate: number;
    accuracy: number;
    averageConfidence: number;
  }>;
  timeframes: {
    '1day': { total: number; accurate: number; accuracy: number };
    '1week': { total: number; accurate: number; accuracy: number };
    '1month': { total: number; accurate: number; accuracy: number };
  };
  riskMetrics: {
    maxDrawdown: number;
    sharpeRatio: number;
    winRate: number;
    averageWin: number;
    averageLoss: number;
  };
}

export class LivePerformanceTracker {
  private predictions: PredictionRecord[] = [];
  private orchestrator: AgentOrchestrator;
  private isTracking: boolean = false;

  constructor() {
    this.orchestrator = new AgentOrchestrator();
  }

  async startTracking(symbols: string[], intervalMinutes: number = 60) {
    if (this.isTracking) {
      console.log('Performance tracking already active');
      return;
    }

    this.isTracking = true;
    console.log(`🚀 Starting live performance tracking for ${symbols.length} symbols every ${intervalMinutes} minutes`);

    // Initial predictions
    await this.makePredictions(symbols);

    // Set up interval for ongoing tracking
    setInterval(async () => {
      if (this.isTracking) {
        await this.makePredictions(symbols);
        await this.validatePastPredictions(symbols);
        this.generatePerformanceReport();
      }
    }, intervalMinutes * 60 * 1000);
  }

  async stopTracking() {
    this.isTracking = false;
    console.log('🛑 Performance tracking stopped');
  }

  private async makePredictions(symbols: string[]) {
    console.log(`📊 Making predictions for ${symbols.length} symbols...`);
    
    for (const symbol of symbols) {
      try {
        const startTime = Date.now();
        const prediction = await this.orchestrator.runMultiAgentAnalysis(symbol);
        const processingTime = Date.now() - startTime;

        const record: PredictionRecord = {
          id: `${symbol}-${Date.now()}`,
          symbol,
          timestamp: new Date().toISOString(),
          prediction,
          performance: {
            confidenceAccuracy: 0,
            agentAccuracy: {},
            overallAccuracy: false
          }
        };

        this.predictions.push(record);
        console.log(`✅ Prediction recorded for ${symbol} (${processingTime}ms)`);
        console.log(`   Confidence: ${prediction.finalPrediction.confidence}`);
        console.log(`   Direction: ${prediction.finalPrediction.direction}`);
        console.log(`   Risk Level: ${prediction.finalPrediction.riskLevel}`);

      } catch (error) {
        console.error(`❌ Error making prediction for ${symbol}:`, (error as Error).message);
      }
    }
  }

  private async validatePastPredictions(symbols: string[]) {
    console.log('🔍 Validating past predictions...');
    
    const predictionsToValidate = this.predictions.filter(p => 
      !p.actualOutcome && 
      this.isTimeToValidate(p.timestamp)
    );

    for (const prediction of predictionsToValidate) {
      try {
        const actualOutcome = await this.getActualOutcome(prediction.symbol, prediction.timestamp);
        prediction.actualOutcome = actualOutcome;
        
        // Calculate performance metrics
        prediction.performance = this.calculatePredictionPerformance(prediction);
        
        console.log(`✅ Validated ${prediction.symbol}:`);
        console.log(`   Predicted: ${prediction.prediction.finalPrediction.direction}`);
        console.log(`   Actual: ${actualOutcome.direction1Day}`);
        console.log(`   Accuracy: ${prediction.performance.overallAccuracy ? '✅' : '❌'}`);
        console.log(`   Confidence Accuracy: ${prediction.performance.confidenceAccuracy.toFixed(1)}%`);

      } catch (error) {
        console.error(`❌ Error validating ${prediction.symbol}:`, (error as Error).message);
      }
    }
  }

  private isTimeToValidate(timestamp: string): boolean {
    const predictionTime = new Date(timestamp);
    const now = new Date();
    const hoursSincePrediction = (now.getTime() - predictionTime.getTime()) / (1000 * 60 * 60);
    
    // Validate after 24 hours for 1-day predictions
    return hoursSincePrediction >= 24;
  }

  private async getActualOutcome(symbol: string, predictionTime: string): Promise<any> {
    // This would integrate with your data provider to get actual price movements
    // For now, using mock data - replace with real implementation
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    try {
      const response = await fetch(`${baseUrl}/api/market-data?symbol=${symbol}&interval=1d&range=30d`);
      const data = await response.json();
      
      // Calculate actual price movements from prediction time
      const predictionDate = new Date(predictionTime);
      const prices = data.prices || [];
      
      // Find prices for 1 day, 1 week, 1 month after prediction
      const price1Day = this.getPriceAtDate(prices, predictionDate, 1);
      const price1Week = this.getPriceAtDate(prices, predictionDate, 7);
      const price1Month = this.getPriceAtDate(prices, predictionDate, 30);
      
      const startPrice = this.getPriceAtDate(prices, predictionDate, 0);
      
      return {
        price1Day,
        price1Week,
        price1Month,
        direction1Day: this.getDirection(startPrice, price1Day),
        direction1Week: this.getDirection(startPrice, price1Week),
        direction1Month: this.getDirection(startPrice, price1Month),
        accuracy: true // Placeholder
      };
    } catch (error) {
      console.error('Error getting actual outcome:', error);
      return {
        price1Day: 0,
        price1Week: 0,
        price1Month: 0,
        direction1Day: 'SIDEWAYS' as const,
        direction1Week: 'SIDEWAYS' as const,
        direction1Month: 'SIDEWAYS' as const,
        accuracy: false
      };
    }
  }

  private getPriceAtDate(prices: any[], date: Date, daysOffset: number): number {
    const targetDate = new Date(date);
    targetDate.setDate(targetDate.getDate() + daysOffset);
    
    // Find closest price to target date
    const closestPrice = prices.find(p => {
      const priceDate = new Date(p.timestamp);
      return Math.abs(priceDate.getTime() - targetDate.getTime()) < 24 * 60 * 60 * 1000; // Within 24 hours
    });
    
    return closestPrice?.close || 0;
  }

  private getDirection(startPrice: number, endPrice: number): 'UP' | 'DOWN' | 'SIDEWAYS' {
    if (!startPrice || !endPrice) return 'SIDEWAYS';
    
    const change = ((endPrice - startPrice) / startPrice) * 100;
    
    if (change > 2) return 'UP';
    if (change < -2) return 'DOWN';
    return 'SIDEWAYS';
  }

  private calculatePredictionPerformance(prediction: PredictionRecord): any {
    if (!prediction.actualOutcome) return prediction.performance;

    const predicted = prediction.prediction.finalPrediction;
    const actual = prediction.actualOutcome;
    
    // Calculate accuracy for each timeframe
    const accuracy1Day = predicted.timeframes['1day'] === actual.direction1Day;
    const accuracy1Week = predicted.timeframes['1week'] === actual.direction1Week;
    const accuracy1Month = predicted.timeframes['1month'] === actual.direction1Month;
    
    // Overall accuracy (weighted by confidence)
    const overallAccuracy = ((accuracy1Day ? 1 : 0) + (accuracy1Week ? 1 : 0) + (accuracy1Month ? 1 : 0)) / 3;
    
    // Confidence accuracy correlation
    const confidenceAccuracy = prediction.prediction.finalPrediction.confidence;
    
    // Agent accuracy
    const agentAccuracy: Record<string, boolean> = {};
    Object.entries(prediction.prediction.agents).forEach(([agentName, agentOutput]) => {
      // This would need more sophisticated logic based on agent-specific predictions
      agentAccuracy[agentName] = Math.random() > 0.5; // Placeholder
    });

    return {
      confidenceAccuracy,
      agentAccuracy,
      overallAccuracy: overallAccuracy > 0.5
    };
  }

  public generatePerformanceReport(): PerformanceMetrics {
    const validatedPredictions = this.predictions.filter(p => p.actualOutcome);
    
    if (validatedPredictions.length === 0) {
      console.log('📊 No validated predictions yet for performance report');
      return this.getEmptyMetrics();
    }

    const totalPredictions = validatedPredictions.length;
    const accuratePredictions = validatedPredictions.filter(p => p.performance.overallAccuracy).length;
    const accuracyRate = (accuratePredictions / totalPredictions) * 100;
    
    const averageConfidence = validatedPredictions.reduce((sum, p) => 
      sum + p.prediction.finalPrediction.confidence, 0) / totalPredictions;

    // Calculate agent performance
    const agentPerformance: Record<string, any> = {};
    const agentNames = Object.keys(validatedPredictions[0].prediction.agents);
    
    agentNames.forEach(agentName => {
      const agentPredictions = validatedPredictions.filter(p => 
        p.performance.agentAccuracy[agentName] !== undefined
      );
      
      if (agentPredictions.length > 0) {
        const accurate = agentPredictions.filter(p => p.performance.agentAccuracy[agentName]).length;
        agentPerformance[agentName] = {
          total: agentPredictions.length,
          accurate,
          accuracy: (accurate / agentPredictions.length) * 100,
          averageConfidence: agentPredictions.reduce((sum, p) => 
            sum + p.prediction.agents[agentName].confidence, 0) / agentPredictions.length
        };
      }
    });

    console.log('\n📊 PERFORMANCE REPORT');
    console.log('='.repeat(50));
    console.log(`Total Predictions: ${totalPredictions}`);
    console.log(`Accuracy Rate: ${accuracyRate.toFixed(1)}%`);
    console.log(`Average Confidence: ${averageConfidence.toFixed(1)}`);
    console.log(`\nAgent Performance:`);
    
    Object.entries(agentPerformance).forEach(([agent, perf]) => {
      console.log(`  ${agent}: ${perf.accuracy.toFixed(1)}% (${perf.accurate}/${perf.total})`);
    });

    return {
      totalPredictions,
      accuratePredictions,
      accuracyRate,
      averageConfidence,
      confidenceAccuracyCorrelation: 0, // Would need more sophisticated calculation
      agentPerformance,
      timeframes: {
        '1day': { total: 0, accurate: 0, accuracy: 0 },
        '1week': { total: 0, accurate: 0, accuracy: 0 },
        '1month': { total: 0, accurate: 0, accuracy: 0 }
      },
      riskMetrics: {
        maxDrawdown: 0,
        sharpeRatio: 0,
        winRate: 0,
        averageWin: 0,
        averageLoss: 0
      }
    };
  }

  private getEmptyMetrics(): PerformanceMetrics {
    return {
      totalPredictions: 0,
      accuratePredictions: 0,
      accuracyRate: 0,
      averageConfidence: 0,
      confidenceAccuracyCorrelation: 0,
      agentPerformance: {},
      timeframes: {
        '1day': { total: 0, accurate: 0, accuracy: 0 },
        '1week': { total: 0, accurate: 0, accuracy: 0 },
        '1month': { total: 0, accurate: 0, accuracy: 0 }
      },
      riskMetrics: {
        maxDrawdown: 0,
        sharpeRatio: 0,
        winRate: 0,
        averageWin: 0,
        averageLoss: 0
      }
    };
  }

  public getPredictions(): PredictionRecord[] {
    return this.predictions;
  }

  public getMetrics(): PerformanceMetrics {
    return this.generatePerformanceReport();
  }
} 