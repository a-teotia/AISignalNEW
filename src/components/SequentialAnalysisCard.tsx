'use client';

import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface SequentialAnalysisCardProps {
  symbol: string;
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
  keyRisks: string[];
  catalysts: any[];
  citedSources: string[];
  agentChain: string[];
  totalProcessingTime: number;
}

const SequentialAnalysisCard: React.FC<SequentialAnalysisCardProps> = ({
  symbol,
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
      // Simulate agent progression for UX
      const agentSteps = [
        'Quantitative Data Analysis...',
        'Market Fundamentals Analysis...',
        'Technical Analysis...',
        'Sentiment Analysis...',
        'Final Synthesis & Report...'
      ];

      let stepIndex = 0;
      const progressInterval = setInterval(() => {
        if (stepIndex < agentSteps.length) {
          setCurrentAgent(`📊 Agent ${stepIndex + 1}: ${agentSteps[stepIndex]}`);
          stepIndex++;
        }
      }, 3000);

      const response = await fetch('/api/sequential-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol,
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
    <Card className="p-6 trading-card border-0">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            Sequential AI Analysis
          </h2>
          <Badge variant="outline" className="text-primary border-primary">
            {symbol}
          </Badge>
        </div>

        {/* Control Button */}
        <Button
          onClick={runSequentialAnalysis}
          disabled={isAnalyzing || !symbol}
          className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-primary/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Analyzing...</span>
            </div>
          ) : (
            'Run Sequential Analysis'
          )}
        </Button>

        {/* Progress Indicator */}
        {isAnalyzing && (
          <div className="bg-gray-900/50 p-4 rounded-lg border border-primary/20">
            <div className="flex items-center space-x-3">
              <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
              <span className="text-primary font-medium">{currentAgent}</span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/50 p-4 rounded-lg border border-red-500/20">
            <p className="text-red-300">❌ {error}</p>
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div className="space-y-6">
            {/* Executive Summary */}
            <div className="bg-gray-900/50 p-4 rounded-lg border border-gold/20">
              <h3 className="text-lg font-semibold text-gold mb-2">Executive Summary</h3>
              <p className="text-gray-300">{result.executiveSummary}</p>
            </div>

            {/* Final Verdict */}
            <div className="bg-gray-900/50 p-4 rounded-lg border border-gold/20">
              <h3 className="text-lg font-semibold text-gold mb-4">Final Verdict</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Direction</p>
                  <Badge className={`${getVerdictColor(result.finalVerdict.direction)} text-white`}>
                    {result.finalVerdict.direction}
                  </Badge>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Confidence</p>
                  <p className="text-white font-semibold">{result.finalVerdict.confidence}%</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Price Target</p>
                  <p className="text-white font-semibold">${result.finalVerdict.priceTarget}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Risk Level</p>
                  <Badge className={getRiskColor(result.finalVerdict.risk)}>
                    {result.finalVerdict.risk}
                  </Badge>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-gray-400 text-sm mb-2">Reasoning</p>
                <p className="text-gray-300">{result.finalVerdict.reasoning}</p>
              </div>
            </div>

            {/* Quantitative Analysis Summary */}
            {result.quantAnalysis && (
              <div className="bg-gray-900/50 p-4 rounded-lg border border-gold/20">
                <h3 className="text-lg font-semibold text-gold mb-4">Quantitative Analysis</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {result.quantAnalysis.priceAnalysis && (
                    <>
                      <div>
                        <p className="text-gray-400 text-sm">Current Price</p>
                        <p className="text-white font-semibold">
                          ${result.quantAnalysis.priceAnalysis.currentPrice}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Daily Volume</p>
                        <p className="text-white font-semibold">
                          {result.quantAnalysis.priceAnalysis.dailyVolume?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Volatility</p>
                        <p className="text-white font-semibold">
                          {(result.quantAnalysis.priceAnalysis.volatility?.daily * 100)?.toFixed(2)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">RSI</p>
                        <p className="text-white font-semibold">
                          {result.quantAnalysis.technicalIndicators?.rsi}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Agent Chain & Citations */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-900/50 p-4 rounded-lg border border-gold/20">
                <h3 className="text-lg font-semibold text-gold mb-2">Agent Chain</h3>
                <div className="space-y-2">
                  {result.agentChain.map((agent, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-gold">•</span>
                      <span className="text-gray-300">{agent}</span>
                    </div>
                  ))}
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  Total Time: {result.totalProcessingTime}ms
                </p>
              </div>

              <div className="bg-gray-900/50 p-4 rounded-lg border border-gold/20">
                <h3 className="text-lg font-semibold text-gold mb-2">
                  Citations ({result.citedSources.length})
                </h3>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {result.citedSources.slice(0, 5).map((source, index) => (
                    <p key={index} className="text-gray-300 text-sm truncate">
                      {index + 1}. {source}
                    </p>
                  ))}
                  {result.citedSources.length > 5 && (
                    <p className="text-gray-400 text-sm">
                      + {result.citedSources.length - 5} more sources
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Key Risks & Catalysts */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-900/50 p-4 rounded-lg border border-gold/20">
                <h3 className="text-lg font-semibold text-gold mb-2">Key Risks</h3>
                <div className="space-y-1">
                  {result.keyRisks.slice(0, 3).map((risk, index) => (
                    <p key={index} className="text-gray-300 text-sm">
                      • {risk}
                    </p>
                  ))}
                </div>
              </div>

              <div className="bg-gray-900/50 p-4 rounded-lg border border-gold/20">
                <h3 className="text-lg font-semibold text-gold mb-2">Catalysts</h3>
                <div className="space-y-2">
                  {result.catalysts.slice(0, 3).map((catalyst: any, index: number) => (
                    <div key={index} className="text-sm">
                      <p className="text-gray-300">{catalyst.event}</p>
                      <p className="text-gray-400 text-xs">
                        {catalyst.date} - {catalyst.impact} impact
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