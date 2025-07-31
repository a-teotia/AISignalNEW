'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TradingStrategyType, STRATEGY_CONFIGS } from '@/lib/types/trading-strategy-types';
import { Clock, TrendingUp, Calendar, Zap, BarChart3, Target, AlertTriangle } from 'lucide-react';

interface TradingStrategySelectorProps {
  selectedStrategy: TradingStrategyType;
  onStrategyChange: (strategy: TradingStrategyType) => void;
  onAnalyze: () => void;
  isAnalyzing?: boolean;
  symbol?: string;
}

export function TradingStrategySelector({
  selectedStrategy,
  onStrategyChange,
  onAnalyze,
  isAnalyzing = false,
  symbol = 'SYMBOL'
}: TradingStrategySelectorProps) {
  const [hoveredStrategy, setHoveredStrategy] = useState<TradingStrategyType | null>(null);

  const getStrategyIcon = (strategy: TradingStrategyType) => {
    switch (strategy) {
      case 'day':
        return <Zap className="w-5 h-5" />;
      case 'swing':
        return <TrendingUp className="w-5 h-5" />;
      case 'longterm':
        return <BarChart3 className="w-5 h-5" />;
      default:
        return <Target className="w-5 h-5" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStrategyColor = (strategy: TradingStrategyType, isSelected: boolean) => {
    if (isSelected) {
      return 'border-amber-500/50 bg-gradient-to-br from-amber-500/10 to-orange-500/5';
    }
    return 'border-white/10 hover:border-amber-500/30 hover:bg-amber-500/5';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
          Select Trading Strategy
        </h2>
        <p className="text-gray-400">
          Choose your trading approach for <span className="text-white font-semibold">{symbol}</span> analysis
        </p>
      </div>

      {/* Strategy Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.keys(STRATEGY_CONFIGS) as TradingStrategyType[]).map((strategyKey) => {
          const config = STRATEGY_CONFIGS[strategyKey];
          const isSelected = selectedStrategy === strategyKey;
          const isHovered = hoveredStrategy === strategyKey;

          return (
            <Card
              key={strategyKey}
              className={`p-6 cursor-pointer transition-all duration-300 ${getStrategyColor(
                strategyKey,
                isSelected
              )} backdrop-blur-xl`}
              onClick={() => onStrategyChange(strategyKey)}
              onMouseEnter={() => setHoveredStrategy(strategyKey)}
              onMouseLeave={() => setHoveredStrategy(null)}
            >
              {/* Strategy Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    isSelected ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-gray-400'
                  }`}>
                    {getStrategyIcon(strategyKey)}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${
                      isSelected ? 'text-white' : 'text-gray-300'
                    }`}>
                      {config.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {config.timeHorizon}
                    </p>
                  </div>
                </div>
                {isSelected && (
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                    Selected
                  </Badge>
                )}
              </div>

              {/* Strategy Description */}
              <p className="text-sm text-gray-400 mb-4">
                {config.description}
              </p>

              {/* Strategy Metrics */}
              <div className="space-y-3">
                {/* Time Horizon */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>Hold Period</span>
                  </div>
                  <span className="text-white font-medium">{config.timeHorizon}</span>
                </div>

                {/* Analysis Depth */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <BarChart3 className="w-4 h-4" />
                    <span>Analysis</span>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">
                    {config.analysisDepth}
                  </Badge>
                </div>

                {/* Risk Level */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Risk Level</span>
                  </div>
                  <Badge className={`text-xs capitalize ${getRiskColor(config.parameters.riskTolerance)}`}>
                    {config.parameters.riskTolerance}
                  </Badge>
                </div>
              </div>

              {/* Agent Weights Preview (on hover or select) */}
              {(isHovered || isSelected) && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-gray-500 mb-2">Analysis Weights:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Technical:</span>
                      <span className="text-white">{config.agentWeights.technical}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Fundamental:</span>
                      <span className="text-white">{config.agentWeights.fundamental}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">News:</span>
                      <span className="text-white">{config.agentWeights.newsSentiment}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Structure:</span>
                      <span className="text-white">{config.agentWeights.marketStructure}%</span>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Strategy Comparison Table */}
      <Card className="p-6 bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-gray-900/50 backdrop-blur-xl border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Target className="w-5 h-5 text-amber-400" />
          <span>Strategy Comparison</span>
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 text-gray-400">Aspect</th>
                <th className="text-center py-2 text-amber-400">Day Trading</th>
                <th className="text-center py-2 text-blue-400">Swing Trading</th>
                <th className="text-center py-2 text-green-400">Long Term</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-white/5">
                <td className="py-2 text-gray-400">Time Commitment</td>
                <td className="text-center py-2">High (Active)</td>
                <td className="text-center py-2">Medium</td>
                <td className="text-center py-2">Low (Passive)</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2 text-gray-400">Analysis Focus</td>
                <td className="text-center py-2">Technical</td>
                <td className="text-center py-2">Balanced</td>
                <td className="text-center py-2">Fundamental</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2 text-gray-400">Signal Validity</td>
                <td className="text-center py-2">2-4 hours</td>
                <td className="text-center py-2">1-7 days</td>
                <td className="text-center py-2">2 weeks - 3 months</td>
              </tr>
              <tr>
                <td className="py-2 text-gray-400">Best For</td>
                <td className="text-center py-2">Quick profits</td>
                <td className="text-center py-2">Trend following</td>
                <td className="text-center py-2">Wealth building</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Action Button */}
      <div className="flex justify-center">
        <Button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing with {STRATEGY_CONFIGS[selectedStrategy].name}...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Run {STRATEGY_CONFIGS[selectedStrategy].name} Analysis</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}