"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type PredictionVerdict = {
  id: number;
  symbol: string;
  prediction_date: string;
  verdict: 'UP' | 'DOWN' | 'NEUTRAL';
  confidence: number;
  reasoning: string;
  market_context: string;
  created_at: string;
  actual_price?: number;
  actual_date?: string;
  accuracy?: boolean;
  profit_loss?: number;
  performance_notes?: string;
};

type BacktestResult = {
  totalPredictions: number;
  correctPredictions: number;
  accuracyRate: number;
  totalProfitLoss: number;
  winRate: number;
  averageConfidence: number;
  bestStreak: number;
  worstStreak: number;
  sharpeRatio: number;
  maxDrawdown: number;
};

type PerformanceMetrics = {
  total_predictions: number;
  correct_predictions: number;
  accuracy_rate: number;
  average_confidence: number;
  total_profit_loss: number;
  win_rate: number;
  symbol: string;
  timeframe: string;
};

export default function BacktestPage() {
  const [symbol, setSymbol] = useState("BHP.AX");
  const [predictions, setPredictions] = useState<PredictionVerdict[]>([]);
  const [backtestResults, setBacktestResults] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d");
  const [accuracyData, setAccuracyData] = useState<Array<{date: string, accuracy: number}>>([]);
  const [profitLossData, setProfitLossData] = useState<Array<{date: string, cumulative: number}>>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth/signin");
      return;
    }
  }, [session, status, router]);

  const loadPredictions = async () => {
    if (!symbol.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/predictions?symbol=${encodeURIComponent(symbol)}`);
      if (res.status === 401) {
        router.push("/auth/signin");
        return;
      }
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      
      if (data.predictions) {
        // Filter by timeframe
        const filteredPredictions = filterByTimeframe(data.predictions, selectedTimeframe);
        setPredictions(filteredPredictions);
        
        // Calculate backtest results
        const results = calculateBacktestResults(filteredPredictions);
        setBacktestResults(results);
        
        // Prepare chart data
        prepareChartData(filteredPredictions);
      }
    } catch (e) {
      console.error("Error fetching predictions:", e);
      setError("Failed to load predictions");
      setPredictions([]);
    }
    setLoading(false);
  };

  const fetchPerformanceMetrics = async () => {
    if (!symbol.trim()) return;

    try {
      const res = await fetch(`/api/performance?symbol=${encodeURIComponent(symbol)}&timeframe=${selectedTimeframe}`);
      if (res.status === 401) {
        router.push("/auth/signin");
        return;
      }
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setPerformanceMetrics(data.metrics);
    } catch (e) {
      console.error("Error fetching performance metrics:", e);
      setPerformanceMetrics(null);
    }
  };

  useEffect(() => {
    if (symbol && session) {
      loadPredictions();
      fetchPerformanceMetrics();
    }
  }, [symbol, selectedTimeframe, session]);

  const filterByTimeframe = (predictions: PredictionVerdict[], timeframe: string): PredictionVerdict[] => {
    const now = new Date();
    let cutoffDate: Date;
    
    switch (timeframe) {
      case '7d':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        return predictions;
    }
    
    return predictions.filter(pred => new Date(pred.created_at) >= cutoffDate);
  };

  const calculateBacktestResults = (predictions: PredictionVerdict[]): BacktestResult => {
    if (predictions.length === 0) {
      return {
        totalPredictions: 0,
        correctPredictions: 0,
        accuracyRate: 0,
        totalProfitLoss: 0,
        winRate: 0,
        averageConfidence: 0,
        bestStreak: 0,
        worstStreak: 0,
        sharpeRatio: 0,
        maxDrawdown: 0
      };
    }

    const completedPredictions = predictions.filter(p => p.accuracy !== undefined);
    const correctPredictions = completedPredictions.filter(p => p.accuracy).length;
    const totalProfitLoss = completedPredictions.reduce((sum, p) => sum + (p.profit_loss || 0), 0);
    const averageConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
    
    // Calculate streaks
    let currentStreak = 0;
    let bestStreak = 0;
    let worstStreak = 0;
    let currentWorstStreak = 0;
    
    completedPredictions.forEach(pred => {
      if (pred.accuracy) {
        currentStreak++;
        currentWorstStreak = 0;
        bestStreak = Math.max(bestStreak, currentStreak);
      } else {
        currentStreak = 0;
        currentWorstStreak++;
        worstStreak = Math.max(worstStreak, currentWorstStreak);
      }
    });

    // Calculate Sharpe ratio (simplified)
    const returns = completedPredictions.map(p => p.profit_loss || 0);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const sharpeRatio = variance > 0 ? avgReturn / Math.sqrt(variance) : 0;

    // Calculate max drawdown
    let maxDrawdown = 0;
    let peak = 0;
    let cumulative = 0;
    
    completedPredictions.forEach(p => {
      cumulative += p.profit_loss || 0;
      if (cumulative > peak) {
        peak = cumulative;
      }
      const drawdown = peak - cumulative;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    });

    return {
      totalPredictions: completedPredictions.length,
      correctPredictions,
      accuracyRate: (correctPredictions / completedPredictions.length) * 100,
      totalProfitLoss,
      winRate: (completedPredictions.filter(p => (p.profit_loss || 0) > 0).length / completedPredictions.length) * 100,
      averageConfidence,
      bestStreak,
      worstStreak,
      sharpeRatio,
      maxDrawdown
    };
  };

  const prepareChartData = (predictions: PredictionVerdict[]) => {
    // Prepare accuracy data
    const accuracyByDate = predictions
      .filter(p => p.accuracy !== undefined)
      .reduce((acc, pred) => {
        const date = pred.prediction_date;
        if (!acc[date]) {
          acc[date] = { correct: 0, total: 0 };
        }
        acc[date].total++;
        if (pred.accuracy) acc[date].correct++;
        return acc;
      }, {} as Record<string, { correct: number; total: number }>);

    const accuracyData = Object.entries(accuracyByDate).map(([date, data]) => ({
      date,
      accuracy: (data.correct / data.total) * 100
    }));

    setAccuracyData(accuracyData);

    // Prepare cumulative profit/loss data
    let cumulative = 0;
    const profitLossData = predictions
      .filter(p => p.profit_loss !== undefined)
      .map(p => {
        cumulative += p.profit_loss || 0;
        return {
          date: p.prediction_date,
          cumulative
        };
      });

    setProfitLossData(profitLossData);
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'UP': return '#10b981';
      case 'DOWN': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const COLORS = ['#10b981', '#ef4444', '#6b7280'];

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to signin
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow mb-2">
            Backtesting & Performance Analysis
          </h1>
          <p className="text-lg text-gray-400">
            Evaluate historical prediction performance and analyze trading strategy effectiveness
          </p>
          
        </div>

        {/* Controls */}
        <Card className="bg-gray-850 hover:shadow-xl hover:shadow-blue-500/20 transition duration-300">
          <CardContent className="flex flex-col md:flex-row gap-4 p-4">
            <Select value={symbol} onValueChange={setSymbol}>
              <SelectTrigger className="w-full md:w-1/3 bg-gray-800 text-white border border-gray-600">
                <SelectValue placeholder="Select Symbol" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 text-white border border-gray-700">
                <SelectItem value="BHP.AX">BHP.AX</SelectItem>
                <SelectItem value="CBA.AX">CBA.AX</SelectItem>
                <SelectItem value="BTC/USD">BTC/USD</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-full md:w-1/3 bg-gray-800 text-white border border-gray-600">
                <SelectValue placeholder="Select Timeframe" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 text-white border border-gray-700">
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              onClick={loadPredictions} 
              disabled={loading}
              className="w-full md:w-1/3 bg-blue-600 hover:bg-blue-500 text-white font-semibold"
            >
              {loading ? "Loading..." : "Run Backtest"}
            </Button>
          </CardContent>
        </Card>

        {/* Backtest Results */}
        {backtestResults && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gray-850 hover:shadow-lg hover:shadow-green-400/20 transition duration-300">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-400">{backtestResults.accuracyRate.toFixed(1)}%</p>
                <p className="text-sm text-gray-400">Accuracy Rate</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-850 hover:shadow-lg hover:shadow-blue-400/20 transition duration-300">
              <CardContent className="p-4 text-center">
                <p className={`text-2xl font-bold ${backtestResults.totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {backtestResults.totalProfitLoss >= 0 ? '+' : ''}{backtestResults.totalProfitLoss.toFixed(2)}
                </p>
                <p className="text-sm text-gray-400">Total P&L</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-850 hover:shadow-lg hover:shadow-purple-400/20 transition duration-300">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-purple-400">{backtestResults.winRate.toFixed(1)}%</p>
                <p className="text-sm text-gray-400">Win Rate</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-850 hover:shadow-lg hover:shadow-yellow-400/20 transition duration-300">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-yellow-400">{backtestResults.averageConfidence.toFixed(1)}%</p>
                <p className="text-sm text-gray-400">Avg Confidence</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Advanced Metrics */}
        {backtestResults && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-850 hover:shadow-lg hover:shadow-indigo-400/20 transition duration-300">
              <CardContent className="p-4">
                <h3 className="text-lg font-bold text-white mb-4">Advanced Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sharpe Ratio:</span>
                    <span className="text-white font-semibold">{backtestResults.sharpeRatio.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Max Drawdown:</span>
                    <span className="text-red-400 font-semibold">{backtestResults.maxDrawdown.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Best Streak:</span>
                    <span className="text-green-400 font-semibold">{backtestResults.bestStreak}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Worst Streak:</span>
                    <span className="text-red-400 font-semibold">{backtestResults.worstStreak}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-850 hover:shadow-lg hover:shadow-pink-400/20 transition duration-300">
              <CardContent className="p-4">
                <h3 className="text-lg font-bold text-white mb-4">Prediction Distribution</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'UP', value: predictions.filter(p => p.verdict === 'UP').length },
                        { name: 'DOWN', value: predictions.filter(p => p.verdict === 'DOWN').length },
                        { name: 'NEUTRAL', value: predictions.filter(p => p.verdict === 'NEUTRAL').length }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#888' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {accuracyData.length > 0 && (
            <Card className="bg-gray-850 hover:shadow-lg hover:shadow-green-400/20 transition duration-300">
              <CardContent className="p-4">
                <h3 className="text-lg font-bold text-white mb-4">Accuracy Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={accuracyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2f2f2f" />
                    <XAxis dataKey="date" stroke="#aaa" />
                    <YAxis domain={[0, 100]} stroke="#aaa" />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#888' }} labelStyle={{ color: '#fff' }} />
                    <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {profitLossData.length > 0 && (
            <Card className="bg-gray-850 hover:shadow-lg hover:shadow-blue-400/20 transition duration-300">
              <CardContent className="p-4">
                <h3 className="text-lg font-bold text-white mb-4">Cumulative Profit/Loss</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={profitLossData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2f2f2f" />
                    <XAxis dataKey="date" stroke="#aaa" />
                    <YAxis stroke="#aaa" />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#888' }} labelStyle={{ color: '#fff' }} />
                    <Line type="monotone" dataKey="cumulative" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Predictions Table */}
        {predictions.length > 0 && (
          <Card className="bg-gray-850 hover:shadow-lg hover:shadow-orange-400/20 transition duration-300">
            <CardContent className="p-4">
              <h3 className="text-lg font-bold text-white mb-4">Historical Predictions</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left p-2 text-gray-400">Date</th>
                      <th className="text-left p-2 text-gray-400">Verdict</th>
                      <th className="text-left p-2 text-gray-400">Confidence</th>
                      <th className="text-left p-2 text-gray-400">Accuracy</th>
                      <th className="text-left p-2 text-gray-400">P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictions.slice(0, 20).map((prediction) => (
                      <tr key={prediction.id} className="border-b border-gray-800">
                        <td className="p-2 text-gray-300">{prediction.prediction_date}</td>
                        <td className="p-2">
                          <span 
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{ 
                              backgroundColor: getVerdictColor(prediction.verdict) + '20',
                              color: getVerdictColor(prediction.verdict)
                            }}
                          >
                            {prediction.verdict}
                          </span>
                        </td>
                        <td className="p-2 text-gray-300">{prediction.confidence}%</td>
                        <td className="p-2">
                          {prediction.accuracy !== undefined ? (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              prediction.accuracy 
                                ? 'bg-green-700 text-green-200' 
                                : 'bg-red-700 text-red-200'
                            }`}>
                              {prediction.accuracy ? '✓' : '✗'}
                            </span>
                          ) : (
                            <span className="text-gray-500">Pending</span>
                          )}
                        </td>
                        <td className="p-2">
                          {prediction.profit_loss !== undefined ? (
                            <span className={`font-medium ${
                              prediction.profit_loss >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {prediction.profit_loss >= 0 ? '+' : ''}{prediction.profit_loss.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 