'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { StrategyOutput, TradingStrategyType } from '@/lib/types/trading-strategy-types';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Clock, 
  Target, 
  AlertTriangle, 
  Lightbulb,
  Timer,
  BarChart3,
  CheckCircle,
  XCircle,
  MinusCircle,
  Zap,
  Calendar,
  DollarSign
} from 'lucide-react';

interface StrategyAnalysisResultProps {
  result: StrategyOutput;
  symbol: string;
}

export function StrategyAnalysisResult({ result, symbol }: StrategyAnalysisResultProps) {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [currentConfidence, setCurrentConfidence] = useState(result.confidence);

  // Calculate time elapsed and confidence decay
  useEffect(() => {
    const analysisTime = new Date(result.analysisTimestamp).getTime();
    
    const updateTimer = () => {
      const now = Date.now();
      const elapsed = now - analysisTime;
      const hoursElapsed = elapsed / (1000 * 60 * 60);
      const daysElapsed = hoursElapsed / 24;
      
      setTimeElapsed(elapsed);
      
      // Calculate confidence decay
      const degradeRate = result.validityPeriod.degradeRate;
      const decayFactor = Math.pow(0.9, daysElapsed * (degradeRate / 100));
      const adjustedConfidence = Math.max(10, Math.round(result.confidence * decayFactor));
      
      setCurrentConfidence(adjustedConfidence);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [result.analysisTimestamp, result.confidence, result.validityPeriod.degradeRate]);

  const getPredictionIcon = (prediction: string) => {
    switch (prediction) {
      case 'BULLISH':
        return <TrendingUp className="w-6 h-6 text-green-400" />;
      case 'BEARISH':
        return <TrendingDown className="w-6 h-6 text-red-400" />;
      default:
        return <Minus className="w-6 h-6 text-gray-400" />;
    }
  };

  const getPredictionColor = (prediction: string) => {
    switch (prediction) {
      case 'BULLISH':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'BEARISH':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getStrategyIcon = (strategy: TradingStrategyType) => {
    switch (strategy) {
      case 'day':
        return <Zap className="w-5 h-5" />;
      case 'swing':
        return <TrendingUp className="w-5 h-5" />;
      case 'longterm':
        return <BarChart3 className="w-5 h-5" />;
    }
  };

  const getAgentIcon = (agentType: string) => {
    const icons = {
      technical: <BarChart3 className="w-4 h-4" />,
      fundamental: <DollarSign className="w-4 h-4" />,
      newsSentiment: <Lightbulb className="w-4 h-4" />,
      marketStructure: <Target className="w-4 h-4" />
    };
    return icons[agentType as keyof typeof icons] || <MinusCircle className="w-4 h-4" />;
  };

  const getAgentSignalIcon = (signal: string) => {
    switch (signal) {
      case 'BULLISH':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'BEARISH':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <MinusCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatTimeElapsed = (elapsed: number): string => {
    const minutes = Math.floor(elapsed / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
  };

  const getValidityStatus = (): { status: string; color: string; message: string } => {
    const hoursElapsed = timeElapsed / (1000 * 60 * 60);
    const daysElapsed = hoursElapsed / 24;

    if (result.strategy === 'day') {
      if (hoursElapsed <= 4) {
        return { status: 'Optimal', color: 'text-green-400 bg-green-500/20', message: 'Peak reliability period' };
      } else if (hoursElapsed <= 24) {
        return { status: 'Acceptable', color: 'text-yellow-400 bg-yellow-500/20', message: 'Still useful but declining' };
      } else {
        return { status: 'Stale', color: 'text-red-400 bg-red-500/20', message: 'Should reassess' };
      }
    } else if (result.strategy === 'swing') {
      if (daysElapsed <= 3) {
        return { status: 'Optimal', color: 'text-green-400 bg-green-500/20', message: 'Peak reliability period' };
      } else if (daysElapsed <= 7) {
        return { status: 'Acceptable', color: 'text-yellow-400 bg-yellow-500/20', message: 'Still useful but declining' };
      } else {
        return { status: 'Stale', color: 'text-red-400 bg-red-500/20', message: 'Should reassess' };
      }
    } else { // longterm
      if (daysElapsed <= 14) {
        return { status: 'Optimal', color: 'text-green-400 bg-green-500/20', message: 'Peak reliability period' };
      } else if (daysElapsed <= 90) {
        return { status: 'Acceptable', color: 'text-yellow-400 bg-yellow-500/20', message: 'Still useful but declining' };
      } else {
        return { status: 'Stale', color: 'text-red-400 bg-red-500/20', message: 'Should reassess' };
      }
    }
  };

  const validityStatus = getValidityStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-gray-900/50 backdrop-blur-xl border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {getStrategyIcon(result.strategy)}
              <h2 className="text-2xl font-bold text-white capitalize">
                {result.strategy} Trading Analysis
              </h2>
            </div>
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
              {symbol}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Generated {formatTimeElapsed(timeElapsed)}</p>
            <Badge className={`${validityStatus.color} border px-2 py-1`}>
              {validityStatus.status}
            </Badge>
          </div>
        </div>

        {/* Main Prediction */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {getPredictionIcon(result.prediction)}
            <div>
              <Badge className={`text-lg px-4 py-2 ${getPredictionColor(result.prediction)}`}>
                {result.prediction}
              </Badge>
              <p className="text-sm text-gray-400 mt-1">
                Confidence: {currentConfidence}% {currentConfidence < result.confidence && (
                  <span className="text-orange-400">(decaying)</span>
                )}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-white">{result.timeHorizon}</p>
            <p className="text-sm text-gray-400">Expected Hold Period</p>
          </div>
        </div>

        {/* Confidence Progress */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Current Confidence</span>
            <span className="text-sm text-white">{currentConfidence}%</span>
          </div>
          <Progress 
            value={currentConfidence} 
            className="h-2 bg-gray-700"
          />
        </div>
      </Card>

      {/* Strategy Metrics */}
      <Card className="p-6 bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-gray-900/50 backdrop-blur-xl border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Target className="w-5 h-5 text-amber-400" />
          <span>Strategy Metrics</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{result.strategyMetrics.expectedHoldPeriod}</p>
            <p className="text-sm text-gray-400">Hold Period</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">{result.strategyMetrics.riskRewardRatio}</p>
            <p className="text-sm text-gray-400">Risk/Reward</p>
          </div>
          {result.strategyMetrics.stopLoss && (
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">${result.strategyMetrics.stopLoss}</p>
              <p className="text-sm text-gray-400">Stop Loss</p>
            </div>
          )}
          {result.strategyMetrics.targetPrice && (
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">${result.strategyMetrics.targetPrice}</p>
              <p className="text-sm text-gray-400">Target Price</p>
            </div>
          )}
        </div>
      </Card>

      {/* Agent Contributions */}
      <Card className="p-6 bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-gray-900/50 backdrop-blur-xl border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-amber-400" />
          <span>Agent Analysis Breakdown</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(result.agentContributions).map(([agentType, contribution]) => (
            <div key={agentType} className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getAgentIcon(agentType)}
                  <span className="font-medium text-white capitalize">
                    {agentType.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {getAgentSignalIcon(contribution.signal)}
                  <Badge variant="outline" className="text-xs">
                    {contribution.signal}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Confidence:</span>
                  <span className="text-sm text-white">{contribution.confidence}%</span>
                </div>
                <Progress value={contribution.confidence} className="h-1 bg-gray-700" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Strategy Weight:</span>
                  <span className="text-sm text-amber-400">{contribution.strategyRelevance}%</span>
                </div>
                <Progress value={contribution.strategyRelevance} className="h-1 bg-gray-700" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Reasoning and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Primary Reasoning */}
        <Card className="p-6 bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-gray-900/50 backdrop-blur-xl border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <span>Analysis Summary</span>
          </h3>
          <p className="text-gray-300 leading-relaxed">{result.reasoning.primary}</p>
          
          {/* Supporting Factors */}
          {result.reasoning.supporting.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-white mb-2">Supporting Factors:</h4>
              <ul className="space-y-1">
                {result.reasoning.supporting.map((factor, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        {/* Risks and Catalysts */}
        <Card className="p-6 bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-gray-900/50 backdrop-blur-xl border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>Risks & Catalysts</span>
          </h3>
          
          {/* Risks */}
          {result.reasoning.risks.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-red-400 mb-2">Key Risks:</h4>
              <ul className="space-y-1">
                {result.reasoning.risks.map((risk, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-gray-300">
                    <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Catalysts */}
          {result.reasoning.catalysts.length > 0 && (
            <div>
              <h4 className="font-medium text-green-400 mb-2">Potential Catalysts:</h4>
              <ul className="space-y-1">
                {result.reasoning.catalysts.map((catalyst, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-gray-300">
                    <Zap className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span>{catalyst}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>

      {/* Validity and Decay Information */}
      <Card className="p-6 bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-gray-900/50 backdrop-blur-xl border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Timer className="w-5 h-5 text-amber-400" />
          <span>Signal Validity & Decay</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mb-2">
              Optimal Period
            </Badge>
            <p className="text-sm text-gray-300">{result.validityPeriod.optimal}</p>
          </div>
          <div className="text-center">
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 mb-2">
              Acceptable Period
            </Badge>
            <p className="text-sm text-gray-300">{result.validityPeriod.acceptable}</p>
          </div>
          <div className="text-center">
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 mb-2">
              Stale After
            </Badge>
            <p className="text-sm text-gray-300">{result.validityPeriod.stale}</p>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-sm text-gray-300">
            <strong className="text-white">Decay Rate:</strong> {result.validityPeriod.degradeRate}% confidence loss per day
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {validityStatus.message}
          </p>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button
          variant="outline"
          className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Set Reminder
        </Button>
        <Button
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Run New Analysis
        </Button>
      </div>
    </div>
  );
}