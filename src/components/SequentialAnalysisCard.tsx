'use client';

import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface SequentialAnalysisCardProps {
  symbol: string;
  tradingStrategy?: string; // 🎯 NEW: Strategy-aware analysis
  onAnalysisComplete?: (result: any) => void;
}

interface AnalysisResult {
  symbol: string;
  executiveSummary: string;
  finalVerdict: {
    direction: 'BUY' | 'SELL' | 'HOLD';
    confidence: number;
    priceTarget: number;
    timeHorizon: string;
    risk: 'LOW' | 'MEDIUM' | 'HIGH';
    reasoning: string;
  };
  quantAnalysis: any;
  marketAnalysis: any;
  technicalAnalysis: any;
  sentimentAnalysis: any;
  fundamentalAnalysis: any; // 🎯 NEW: Fundamental analysis results
  keyRisks: string[];
  catalysts: any[];
  citedSources: string[];
  agentChain: string[];
  totalProcessingTime: number;
}

const SequentialAnalysisCard: React.FC<SequentialAnalysisCardProps> = ({
  symbol,
  tradingStrategy = 'day', // Changed from 'swing' to 'day' to match dashboard default
  onAnalysisComplete
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string>('');
  const [currentAgent, setCurrentAgent] = useState<string>('');

  const runSequentialAnalysis = async () => {
    if (!symbol) return;

    setIsAnalyzing(true);
    setError('');
    setResult(null);
    setCurrentAgent('Initializing...');

    try {
      // Strategy-aware agent progression for UX
      const getAgentSteps = (strategy: string) => {
        if (strategy === 'day') {
          return [
            'Strategy Configuration: Day Trading Mode...',
            'Technical Analysis: Intraday Patterns...',
            'Market Structure: Key Levels & Liquidity...',
            'News Sentiment: Breaking News Impact...',
            'Final Synthesis: Quick Decision Signals...'
          ];
        } else if (strategy === 'longterm') {
          return [
            'Strategy Configuration: Long-term Mode...',
            'Fundamental Analysis: Deep Value Assessment...',
            'News Sentiment: Long-term Theme Analysis...',
            'Technical Analysis: Entry Timing...',
            'Final Synthesis: Investment Thesis...'
          ];
        } else { // swing
          return [
            'Strategy Configuration: Swing Trading Mode...',
            'Technical Analysis: Multi-day Patterns...',
            'Fundamental Analysis: Earnings & Events...',
            'News Sentiment: Trend Confirmation...',
            'Market Structure: Key Support/Resistance...',
            'Final Synthesis: Balanced Strategy Report...'
          ];
        }
      };

      const agentSteps = getAgentSteps(tradingStrategy);
      let stepIndex = 0;
      const progressInterval = setInterval(() => {
        if (stepIndex < agentSteps.length) {
          setCurrentAgent(`🎯 ${agentSteps[stepIndex]}`);
          stepIndex++;
        }
      }, 2500);

      // Use strategy-aware API endpoint
      const response = await fetch('/api/strategy-aware-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol,
          strategy: tradingStrategy,
          predictionDate: new Date().toISOString().split('T')[0]
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Analysis failed');
      }

      const data = await response.json();
      
      if (data.success && data.analysis) {
        setResult(data.analysis);
        onAnalysisComplete?.(data.analysis);
        setCurrentAgent('✅ Analysis Complete!');
      } else {
        throw new Error('Invalid response format');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setCurrentAgent('❌ Analysis Failed');
      console.error('Sequential analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getVerdictColor = (direction: string) => {
    switch (direction) {
      case 'BUY': return 'bg-green-500';
      case 'SELL': return 'bg-red-500';
      case 'HOLD': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-gray-900/50 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 via-transparent to-purple-500/3" />
      <div className="relative z-10 p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-blue-400">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor"/>
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Strategy-Aware AI Analysis
              </h2>
              <p className="text-gray-300 text-sm">
                {tradingStrategy === 'day' ? 'Day Trading Focus' : 
                 tradingStrategy === 'longterm' ? 'Long-term Investment Focus' : 
                 'Swing Trading Focus'} • 6-agent intelligence system
              </p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-blue-500/30 px-3 py-1 rounded-lg font-bold">
            {symbol}
          </Badge>
        </div>

        {/* Control Button */}
        <Button
          onClick={runSequentialAnalysis}
          disabled={isAnalyzing || !symbol}
          className="w-full elite-card hover-glow text-xl py-6 rounded-xl font-bold transition-all duration-300 hover:scale-105 animate-gradient disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isAnalyzing ? (
            <div className="flex items-center space-x-3">
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
              <span className="golden-gradient-text">
                {tradingStrategy === 'day' ? 'Day Trading Analysis...' :
                 tradingStrategy === 'longterm' ? 'Long-term Analysis...' :
                 'Swing Trading Analysis...'}
              </span>
            </div>
          ) : (
            <span className="golden-gradient-text">
              Run {tradingStrategy === 'day' ? 'Day Trading' :
                   tradingStrategy === 'longterm' ? 'Long-term' :
                   'Swing Trading'} Analysis
            </span>
          )}
        </Button>

        {/* Progress Indicator */}
        {isAnalyzing && (
          <div className="premium-card p-6 hover-lift animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="animate-spin w-6 h-6 border-3 border-blue-400 border-t-transparent rounded-full"></div>
              <div className="flex-1">
                <p className="text-blue-300 font-semibold text-lg">{currentAgent}</p>
                <div className="w-full h-2 bg-gray-700/50 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-purple-400 rounded-full animate-pulse" style={{ width: '60%' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-gradient-to-r from-red-500/20 to-rose-500/20 backdrop-blur-sm p-6 rounded-xl border border-red-500/30 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                <span className="text-red-400 text-xl">❌</span>
              </div>
              <p className="text-red-300 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div className="space-y-6">
            {/* Executive Summary */}
            <div className="elite-card p-6 hover-lift">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                <h3 className="text-xl font-bold golden-gradient-text">Executive Summary</h3>
              </div>
              <p className="text-gray-200 leading-relaxed text-lg">{result.executiveSummary}</p>
            </div>

            {/* Final Verdict */}
            <div className="premium-card p-6 hover-lift">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <h3 className="text-xl font-bold premium-gradient-text">Final Verdict</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div className="text-center p-4 glass-light rounded-xl border border-white/10">
                  <p className="text-gray-400 text-sm uppercase tracking-wide mb-2">Direction</p>
                  <Badge className={`${getVerdictColor(result.finalVerdict.direction)} text-white px-4 py-2 rounded-lg font-bold text-lg`}>
                    {result.finalVerdict.direction}
                  </Badge>
                </div>
                <div className="text-center p-4 glass-light rounded-xl border border-white/10">
                  <p className="text-gray-400 text-sm uppercase tracking-wide mb-2">Confidence</p>
                  <p className="text-2xl font-bold text-blue-400">{result.finalVerdict.confidence}%</p>
                  <div className="w-full h-1 bg-gray-700 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-400 rounded-full transition-all duration-1000"
                      style={{ width: `${result.finalVerdict.confidence}%` }}
                    />
                  </div>
                </div>
                <div className="text-center p-4 glass-light rounded-xl border border-white/10">
                  <p className="text-gray-400 text-sm uppercase tracking-wide mb-2">Price Target</p>
                  <p className="text-2xl font-bold golden-gradient-text">${result.finalVerdict.priceTarget}</p>
                </div>
                <div className="text-center p-4 glass-light rounded-xl border border-white/10">
                  <p className="text-gray-400 text-sm uppercase tracking-wide mb-2">Risk Level</p>
                  <Badge className={`${getRiskColor(result.finalVerdict.risk)} px-3 py-1 rounded-lg font-bold`}>
                    {result.finalVerdict.risk}
                  </Badge>
                </div>
              </div>
              <div className="glass-light rounded-xl p-4 border border-white/10">
                <p className="text-sm text-blue-300 uppercase tracking-wide mb-3 font-medium">AI Reasoning</p>
                <p className="text-gray-200 leading-relaxed">{result.finalVerdict.reasoning}</p>
              </div>
            </div>

            {/* Quantitative Analysis Summary */}
            {result.quantAnalysis && (
              <div className="premium-card p-6 hover-lift">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <h3 className="text-xl font-bold text-emerald-300">Quantitative Analysis</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {result.quantAnalysis.priceAnalysis && (
                    <>
                      <div className="text-center p-4 glass-light rounded-xl border border-white/10">
                        <p className="text-gray-400 text-sm uppercase tracking-wide mb-2">Current Price</p>
                        <p className="text-xl font-bold text-white">
                          ${result.quantAnalysis.priceAnalysis.currentPrice}
                        </p>
                      </div>
                      <div className="text-center p-4 glass-light rounded-xl border border-white/10">
                        <p className="text-gray-400 text-sm uppercase tracking-wide mb-2">Daily Volume</p>
                        <p className="text-xl font-bold text-white">
                          {result.quantAnalysis.priceAnalysis.dailyVolume?.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center p-4 glass-light rounded-xl border border-white/10">
                        <p className="text-gray-400 text-sm uppercase tracking-wide mb-2">Volatility</p>
                        <p className="text-xl font-bold text-white">
                          {(result.quantAnalysis.priceAnalysis.volatility?.daily * 100)?.toFixed(2)}%
                        </p>
                      </div>
                      <div className="text-center p-4 glass-light rounded-xl border border-white/10">
                        <p className="text-gray-400 text-sm uppercase tracking-wide mb-2">RSI</p>
                        <p className="text-xl font-bold text-white">
                          {result.quantAnalysis.technicalIndicators?.rsi}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Agent Chain & Citations */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="premium-card p-6 hover-lift">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                  <h3 className="text-xl font-bold text-purple-300">Agent Chain</h3>
                </div>
                <div className="space-y-3">
                  {result.agentChain.map((agent, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 glass-light rounded-lg border border-white/10">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center text-purple-300 font-bold text-sm">
                        {index + 1}
                      </div>
                      <span className="text-gray-200 font-medium">{agent}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 glass-light rounded-lg border border-white/10">
                  <p className="text-gray-400 text-sm">
                    <span className="text-purple-300 font-medium">Total Processing Time:</span> {result.totalProcessingTime}ms
                  </p>
                </div>
              </div>

              <div className="premium-card p-6 hover-lift">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  <h3 className="text-xl font-bold text-blue-300">
                    Citations ({result.citedSources.length})
                  </h3>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {result.citedSources.slice(0, 5).map((source, index) => (
                    <div key={index} className="p-2 glass-light rounded-lg border border-white/10">
                      <p className="text-blue-300 font-medium text-sm">
                        {index + 1}.
                      </p>
                      <p className="text-gray-300 text-sm truncate mt-1">{source}</p>
                    </div>
                  ))}
                  {result.citedSources.length > 5 && (
                    <p className="text-gray-400 text-sm text-center py-2">
                      + {result.citedSources.length - 5} more sources
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Key Risks & Catalysts */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-red-500/10 to-rose-500/10 backdrop-blur-sm p-6 rounded-xl border border-red-500/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                  <h3 className="text-xl font-bold text-red-300">Key Risks</h3>
                </div>
                <div className="space-y-3">
                  {result.keyRisks.slice(0, 3).map((risk, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 glass-light rounded-lg border border-red-500/20">
                      <div className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center mt-0.5">
                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                      </div>
                      <p className="text-gray-200 text-sm leading-relaxed">{risk}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm p-6 rounded-xl border border-green-500/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <h3 className="text-xl font-bold text-green-300">Catalysts</h3>
                </div>
                <div className="space-y-3">
                  {result.catalysts.slice(0, 3).map((catalyst: any, index: number) => (
                    <div key={index} className="p-3 glass-light rounded-lg border border-green-500/20">
                      <p className="text-gray-200 font-medium text-sm">{catalyst.event}</p>
                      <p className="text-green-300 text-xs mt-1 font-medium">
                        {catalyst.date} • {catalyst.impact} impact
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default SequentialAnalysisCard;