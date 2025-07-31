"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import SequentialAnalysisCard from "@/components/SequentialAnalysisCard";
import { useSession } from "next-auth/react";
import { X, TrendingUp, TrendingDown, Minus, Activity, Target, BarChart3, Clock, DollarSign, Shield, Zap, Users, Settings, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

// Trading style presets
const tradingStyles = [
  { id: 'swing', name: 'Swing Trading', icon: Clock, description: 'Medium-term positions (days to weeks)' },
  { id: 'day', name: 'Day Trading', icon: Activity, description: 'Intraday positions (hours)' },
  { id: 'long', name: 'Long-term', icon: Target, description: 'Long-term positions (months to years)' },
  { id: 'scalper', name: 'Scalping', icon: Zap, description: 'Quick positions (minutes to hours)' }
];

// Popular assets with categories
const popularAssets = {
  stocks: ["AAPL", "TSLA", "CBA.AX", "BHP.AX", "QQQ", "SPY"],
  crypto: ["BTC-USD", "ETH-USD", "ADA-USD", "DOT-USD"],
  forex: ["EURUSD", "GBPUSD", "USDJPY", "XAUUSD"]
};

// Default agent breakdown data
const defaultAgentBreakdown = [
  { name: 'ML Agent', value: 35, color: '#FFD700' },
  { name: 'Sentiment Agent', value: 25, color: '#FFA500' },
  { name: 'Technical Agent', value: 20, color: '#FF6B35' },
  { name: 'News Agent', value: 15, color: '#FF4500' },
  { name: 'Macro Agent', value: 5, color: '#FF0000' }
];

type ChartPoint = {
  date: string;
  prediction: number;
  actual: number;
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

// Add AIFactsModal component
const aiFacts = [
  "Multi-agent system: Combines ML, sentiment, on-chain, and microstructure for robust signals.",
  "Gold standard validation: Every signal is cross-checked and quality scored for transparency.",
  "Real-time data: Live order book, news, and macro data for up-to-the-minute accuracy.",
  "Redundancy & fallback: Never skips, always returns a result—even in volatile markets.",
  "Premium transparency: Every prediction comes with confidence, reasoning, and agent breakdown."
];

function AIFactsModal({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-black via-gray-900 to-black border border-yellow-400/30 rounded-2xl shadow-xl p-8 max-w-md w-full flex flex-col items-center">
        <Loader2 className="animate-spin text-yellow-400 w-12 h-12 mb-4" />
        <h2 className="text-2xl font-bold text-yellow-300 mb-2 text-center">AI is analyzing your signal...</h2>
        <p className="text-white/80 text-center mb-4">Sit tight while our multi-agent system delivers a premium, validated prediction.</p>
        <div className="mt-6 text-xs text-white/40 text-center">Why choose AI Signal Platform? <br />
          <span className="text-yellow-400">Gold standard. Real-time. Transparent. Premium.</span>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [symbol, setSymbol] = useState("BTC-USD");
  const [selectedDate, setSelectedDate] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [verdict, setVerdict] = useState("?");
  const [reason, setReason] = useState("");
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [showFullReason, setShowFullReason] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [recentPredictions, setRecentPredictions] = useState<PredictionVerdict[]>([]);
  const [accuracyTrends, setAccuracyTrends] = useState<Array<{date: string, accuracy: number}>>([]);
  const [predictionId, setPredictionId] = useState<number | null>(null);
  const [selectedTradingStyle, setSelectedTradingStyle] = useState('swing');
  const [selectedAssetCategory, setSelectedAssetCategory] = useState('crypto');
  
  // Sequential analysis state
  const [sequentialAnalysisResult, setSequentialAnalysisResult] = useState<any>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);
  
  // Pagination state for recent analyses
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3); // Show 3 analyses per page

  // Load performance metrics on symbol change
  useEffect(() => {
    loadPerformanceMetrics();
  }, [symbol]);

  const loadPerformanceMetrics = async () => {
    try {
      const response = await fetch(`/api/performance?symbol=${symbol}&timeframe=all`);
      const data = await response.json();
      
      if (data.metrics) {
        setPerformanceMetrics(data.metrics);
      }
      if (data.trends) {
        setAccuracyTrends(data.trends);
      }
      if (data.recentPredictions) {
        setRecentPredictions(data.recentPredictions);
      }
    } catch (error) {
      console.error('Error loading performance metrics:', error);
    }
  };

  // Fetch recent sequential analyses
  const fetchRecentAnalyses = async () => {
    try {
      const res = await fetch('/api/sequential-analysis');
      const data = await res.json();
      if (data.success && data.analysisHistory) {
        setRecentAnalyses(data.analysisHistory);
      }
    } catch (err) {
      console.error('Failed to fetch recent analyses:', err);
    }
  };

  // Handle sequential analysis completion
  const handleSequentialAnalysisComplete = (result: any) => {
    console.log('Sequential analysis completed:', result);
    setSequentialAnalysisResult(result);
    
    // Update the recent analyses list
    const newAnalysis = {
      id: Date.now(),
      symbol: result.symbol,
      timestamp: result.timestamp,
      verdict: result.finalVerdict.direction,
      confidence: result.finalVerdict.confidence,
      priceTarget: result.finalVerdict.priceTarget,
      reasoning: result.finalVerdict.reasoning,
      agentChain: result.agentChain
    };
    
    setRecentAnalyses(prev => [newAnalysis, ...prev.slice(0, 9)]); // Keep last 10
    setCurrentPage(1); // Reset to first page to show latest analysis
    
    // Reload performance metrics
    setTimeout(loadPerformanceMetrics, 1000);
  };

  // On mount, load recent analyses
  useEffect(() => {
    fetchRecentAnalyses();
  }, []);

  // All analysis functions are now handled by SequentialAnalysisCard component

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'UP': return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'DOWN': return <TrendingDown className="w-5 h-5 text-red-400" />;
      default: return <Minus className="w-5 h-5 text-gray-400" />;
    }
  };

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case 'UP': return 'text-green-400';
      case 'DOWN': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  // Calculate pagination for recent analyses
  const totalPages = Math.ceil(recentAnalyses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAnalyses = recentAnalyses.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'expired': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  // Helper functions for signal generation
  const getAgentColor = (agentName: string): string => {
    const colors = {
      'ML Agent': '#FFD700',
      'Sentiment Agent': '#FFA500', 
      'Technical Agent': '#FF6B35',
      'News Agent': '#FF4500',
      'Macro Agent': '#FF0000',
      'GeoSentience Agent': '#FF8C00',
      'Microstructure Agent': '#FF1493',
      'OnChain Agent': '#00CED1',
      'Quant Edge Agent': '#32CD32',
      'Sonar Research Agent': '#9370DB',
      'Flow Agent': '#20B2AA',
      'Synth Oracle Agent': '#FF69B4'
    };
    return colors[agentName as keyof typeof colors] || '#FFD700';
  };

  const calculateTakeProfit = (entryPrice: number, direction: string): number => {
    if (direction === 'UP') {
      return entryPrice * 1.03; // 3% profit target ABOVE entry for longs
    } else if (direction === 'DOWN') {
      return entryPrice * 0.97; // 3% profit target BELOW entry for shorts
    } else {
      // SIDEWAYS/NEUTRAL: Very tight profit target as warning
      return entryPrice * 1.01; // 1% minimal profit target
    }
  };

  const calculateStopLoss = (entryPrice: number, direction: string): number => {
    if (direction === 'UP') {
      return entryPrice * 0.98; // 2% stop loss BELOW entry for longs
    } else if (direction === 'DOWN') {
      return entryPrice * 1.02; // 2% stop loss ABOVE entry for shorts
    } else {
      // SIDEWAYS/NEUTRAL: Very tight stop loss as warning
      return entryPrice * 0.99; // 1% minimal stop loss
    }
  };

  const getTimeframeForStyle = (style: string): string => {
    const timeframes = {
      'swing': '4H',
      'day': '1H', 
      'long': '1D',
      'scalper': '15M'
    };
    return timeframes[style as keyof typeof timeframes] || '1H';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 relative overflow-hidden">
      {/* AI Processing Modal */}
      <AIFactsModal show={loading} />
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      
      {/* Header Section */}
      <div className="relative z-10 p-6 border-b border-border/50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
                Welcome back, <span className="text-primary glow-text">{session?.user?.name || 'Trader'}</span>
              </h1>
              <p className="text-muted-foreground text-lg">Your AI-powered trading dashboard</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 glassmorphism rounded-xl px-4 py-2">
                <Activity className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-sm font-medium text-white">Live</span>
              </div>
              <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10 rounded-xl">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Quick Stats Row */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="trading-card border-0 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Today's Signals</p>
                    <p className="text-3xl font-bold text-white mt-2">12</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="trading-card border-0 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Accuracy Rate</p>
                    <p className="text-3xl font-bold text-white mt-2">87.5%</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Target className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="trading-card border-0 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Profit</p>
                    <p className="text-3xl font-bold text-green-400 mt-2">+$2,847</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <DollarSign className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="trading-card border-0 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Active Signals</p>
                    <p className="text-3xl font-bold text-white mt-2">8</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Trading Style Presets */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Card className="trading-card border-0">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-xl">
                  <Target className="w-6 h-6 mr-3 text-primary" />
                  Trading Style
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Select your preferred trading approach
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {tradingStyles.map((style) => {
                    const Icon = style.icon;
                    return (
                      <motion.button
                        key={style.id}
                        onClick={() => setSelectedTradingStyle(style.id)}
                        className={`p-6 rounded-xl border-2 transition-all duration-300 text-left group ${
                          selectedTradingStyle === style.id
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-card hover:border-primary/30 hover:bg-primary/5 text-white'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Icon className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                        <h3 className="font-semibold text-base mb-1">{style.name}</h3>
                        <p className="text-xs text-muted-foreground">{style.description}</p>
                      </motion.button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Asset Selection */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Card className="trading-card border-0">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center">
                  <BarChart3 className="w-6 h-6 mr-3 text-primary" />
                  Asset Selection
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Choose from popular assets across different markets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Category Tabs */}
                  <div className="flex space-x-2">
                    {Object.keys(popularAssets).map((category) => (
                      <motion.button
                        key={category}
                        onClick={() => setSelectedAssetCategory(category)}
                        className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                          selectedAssetCategory === category
                            ? 'bg-primary text-white shadow-lg'
                            : 'bg-card text-muted-foreground hover:bg-primary/10 hover:text-primary'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </motion.button>
                    ))}
                  </div>

                  {/* Asset Tags */}
                  <div className="flex flex-wrap gap-3">
                    {popularAssets[selectedAssetCategory as keyof typeof popularAssets].map((asset) => (
                      <motion.button
                        key={asset}
                        onClick={() => setSymbol(asset)}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                          symbol === asset
                            ? 'bg-primary text-white shadow-lg'
                            : 'bg-card text-white hover:bg-primary/20 hover:text-primary border border-border'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {asset}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sequential Analysis Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <SequentialAnalysisCard 
              symbol={symbol} 
              onAnalysisComplete={handleSequentialAnalysisComplete}
            />
          </motion.div>

          {/* Recent Sequential Analyses */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Card className="trading-card border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center text-xl">
                      <Activity className="w-6 h-6 mr-3 text-primary animate-pulse" />
                      Recent Sequential Analyses
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Your recent 5-agent sequential analysis results with citations
                    </CardDescription>
                  </div>
                  {recentAnalyses.length > itemsPerPage && (
                    <div className="text-sm text-muted-foreground">
                      {startIndex + 1}-{Math.min(endIndex, recentAnalyses.length)} of {recentAnalyses.length}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAnalyses.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No recent analyses yet. Run your first sequential analysis above!</p>
                    </div>
                  ) : (
                    currentAnalyses.map((analysis: any, index) => (
                      <motion.div
                        key={analysis.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="glassmorphism rounded-xl p-6 hover:border-primary/30 transition-all duration-300 group"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 rounded-lg bg-primary/10">
                              {getDirectionIcon(analysis.verdict)}
                            </div>
                            <div>
                              <h3 className="font-bold text-white text-lg">{analysis.symbol}</h3>
                              <p className="text-sm text-muted-foreground">
                                {analysis.agentChain?.join(' → ') || '5-Agent Analysis'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-xl font-bold ${getDirectionColor(analysis.verdict)} group-hover:scale-110 transition-transform`}>
                              {analysis.verdict}
                            </div>
                            <div className="text-sm text-muted-foreground">{analysis.confidence}% confidence</div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="bg-card/50 rounded-xl p-4 border border-border/50">
                            <p className="text-xs text-muted-foreground mb-2">Analysis Summary</p>
                            <p className="text-white text-sm line-clamp-2">{analysis.reasoning}</p>
                          </div>
                        </div>

                        {analysis.priceTarget && (
                          <div className="mb-4">
                            <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                              <p className="text-xs text-primary mb-1">Price Target</p>
                              <p className="font-bold text-primary text-lg">${analysis.priceTarget}</p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border-green-500/30">
                              Sequential Analysis
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(analysis.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <Button size="sm" variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 rounded-xl">
                            View Full Report
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                  
                  {/* Pagination Controls */}
                  {recentAnalyses.length > itemsPerPage && (
                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 mt-6 pt-4 border-t border-border/50">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPrevPage}
                        disabled={currentPage === 1}
                        className="border-primary/30 text-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </Button>
                      
                      <div className="flex items-center space-x-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={page === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => goToPage(page)}
                            className={`w-10 h-10 ${
                              page === currentPage 
                                ? 'bg-primary text-white' 
                                : 'border-primary/30 text-primary hover:bg-primary/10'
                            }`}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className="border-primary/30 text-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Agent Breakdown & Performance */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {/* Sequential Agent Chain */}
            <Card className="trading-card border-0">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-xl">
                  <Users className="w-6 h-6 mr-3 text-primary" />
                  Sequential Agent Chain
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  5-agent sequential analysis with compound intelligence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sequentialAnalysisResult ? (
                    // Show actual agent chain from latest analysis
                    <div className="space-y-3">
                      {sequentialAnalysisResult.agentChain?.map((agent: string, index: number) => (
                        <div key={agent} className="flex items-center space-x-4 p-4 rounded-xl bg-card/30 border border-border/50">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-semibold">{agent}</h4>
                            <p className="text-xs text-muted-foreground">
                              {index === 0 && "Real market data analysis"}
                              {index === 1 && "Internet research & fundamentals"}
                              {index === 2 && "Technical analysis integration"}
                              {index === 3 && "Sentiment & news analysis"}
                              {index === 4 && "Final synthesis & report"}
                            </p>
                          </div>
                          <div className="text-primary">
                            {index < sequentialAnalysisResult.agentChain.length - 1 && "→"}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Show default sequential agent chain
                    <div className="space-y-3">
                      {[
                        { name: "Quantitative Analysis", desc: "Real market data & technical indicators" },
                        { name: "Market Analysis", desc: "Internet research & fundamentals" },
                        { name: "Technical Analysis", desc: "Chart patterns & signals" },
                        { name: "Sentiment Analysis", desc: "News & social sentiment" },
                        { name: "Final Synthesis", desc: "Comprehensive report with citations" }
                      ].map((agent, index) => (
                        <div key={agent.name} className="flex items-center space-x-4 p-4 rounded-xl bg-card/30 border border-border/50">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-semibold">{agent.name}</h4>
                            <p className="text-xs text-muted-foreground">{agent.desc}</p>
                          </div>
                          <div className="text-primary">
                            {index < 4 && "→"}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <h4 className="text-primary font-semibold mb-2">Why Sequential Analysis?</h4>
                  <p className="text-sm text-white">Each agent builds on the previous one's insights, creating compound intelligence and higher accuracy than parallel processing.</p>
                </div>
              </CardContent>
            </Card>

            {/* Performance Chart */}
            <Card className="trading-card border-0">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-xl">
                  <BarChart3 className="w-6 h-6 mr-3 text-primary" />
                  Performance Trend
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Your accuracy and profit trends over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={accuracyTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.1)" />
                      <XAxis 
                        dataKey="date" 
                        stroke="rgba(255,255,255,0.6)"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="rgba(255,255,255,0.6)"
                        fontSize={12}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(17, 17, 19, 0.95)', 
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: '12px',
                          color: 'white',
                          backdropFilter: 'blur(20px)'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="accuracy" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sequential Analysis is now handled above in the SequentialAnalysisCard */}
        </div>
      </div>
    </div>
  );
} 