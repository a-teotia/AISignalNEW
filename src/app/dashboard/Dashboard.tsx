"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
  
  // State for viewing full analysis reports
  const [viewingFullReport, setViewingFullReport] = useState<any>(null);
  
  // 🎯 NEW: Retail trader features state
  const [marketMood, setMarketMood] = useState<any>(null);
  const [tradingScore, setTradingScore] = useState(0);
  const [winStreak, setWinStreak] = useState(0);
  const [alerts, setAlerts] = useState<any[]>([]);

  // Load performance metrics on symbol change
  useEffect(() => {
    loadPerformanceMetrics();
  }, [symbol]);

  // 🎯 NEW: Load market mood when analyses change
  useEffect(() => {
    if (recentAnalyses.length > 0) {
      loadMarketMood();
    }
  }, [recentAnalyses]);

  const loadPerformanceMetrics = async () => {
    try {
      const response = await fetch(`/api/performance?symbol=${symbol}&timeframe=all`);
      const data = await response.json();
      
      if (data.metrics) {
        setPerformanceMetrics(data.metrics);
        // 🎯 Calculate trading score from performance
        calculateTradingScore(data.metrics);
      }
      if (data.trends) {
        setAccuracyTrends(data.trends);
      }
      if (data.recentPredictions) {
        setRecentPredictions(data.recentPredictions);
        // 🎯 Calculate win streak
        calculateWinStreak(data.recentPredictions);
      }
    } catch (error) {
      console.error('Error loading performance metrics:', error);
    }
  };

  // 🎯 NEW: Calculate trading score (0-100) based on performance
  const calculateTradingScore = (metrics: PerformanceMetrics) => {
    const accuracyScore = (metrics.accuracy_rate / 100) * 60; // 60% weight for accuracy
    const confidenceScore = (metrics.average_confidence / 100) * 20; // 20% weight for confidence
    const volumeScore = Math.min(metrics.total_predictions / 10, 1) * 20; // 20% weight for experience
    
    const totalScore = Math.round(accuracyScore + confidenceScore + volumeScore);
    setTradingScore(Math.min(totalScore, 100));
  };

  // 🎯 NEW: Calculate current win streak
  const calculateWinStreak = (predictions: PredictionVerdict[]) => {
    let streak = 0;
    for (const pred of predictions) {
      if (pred.accuracy) {
        streak++;
      } else {
        break;
      }
    }
    setWinStreak(streak);
  };

  // 🎯 NEW: Load market mood and generate alerts
  const loadMarketMood = async () => {
    try {
      // Create market mood based on recent analyses
      const recentBullish = recentAnalyses.filter(a => a.verdict === 'BUY').length;
      const recentBearish = recentAnalyses.filter(a => a.verdict === 'SELL').length;
      const totalRecent = recentAnalyses.length;
      
      const bullishPercent = totalRecent > 0 ? (recentBullish / totalRecent) * 100 : 50;
      
      let mood = 'NEUTRAL';
      let emoji = '😐';
      let color = '#FFA500';
      
      if (bullishPercent > 70) {
        mood = 'VERY BULLISH';
        emoji = '🚀';
        color = '#00FF00';
      } else if (bullishPercent > 55) {
        mood = 'BULLISH';
        emoji = '📈';
        color = '#90EE90';
      } else if (bullishPercent < 30) {
        mood = 'VERY BEARISH';
        emoji = '📉';
        color = '#FF0000';
      } else if (bullishPercent < 45) {
        mood = 'BEARISH';
        emoji = '⬇️';
        color = '#FFA07A';
      }
      
      setMarketMood({
        mood,
        emoji,
        color,
        bullishPercent: Math.round(bullishPercent),
        totalAnalyses: totalRecent
      });
      
      // Generate smart alerts
      generateAlerts();
      
    } catch (error) {
      console.error('Error loading market mood:', error);
    }
  };

  // 🎯 NEW: Generate intelligent alerts for retail traders
  const generateAlerts = () => {
    const newAlerts = [];
    
    // High confidence alerts
    const highConfidenceAnalyses = recentAnalyses.filter(a => a.confidence > 85);
    highConfidenceAnalyses.forEach(analysis => {
      newAlerts.push({
        id: `high_conf_${analysis.symbol}`,
        type: 'high_confidence',
        icon: '🎯',
        title: `High Confidence Signal!`,
        message: `${analysis.symbol}: ${analysis.verdict} with ${analysis.confidence}% confidence`,
        color: analysis.verdict === 'BUY' ? '#00FF00' : analysis.verdict === 'SELL' ? '#FF0000' : '#FFA500',
        timestamp: new Date().toISOString()
      });
    });
    
    // Earnings alerts
    recentAnalyses.forEach(analysis => {
      if (analysis.fullAnalysis?.fundamentalAnalysis?.earningsProximity?.isNearEarnings) {
        const daysUntil = analysis.fullAnalysis.fundamentalAnalysis.earningsProximity.daysUntilEarnings;
        newAlerts.push({
          id: `earnings_${analysis.symbol}`,
          type: 'earnings',
          icon: '📊',
          title: 'Earnings Alert!',
          message: `${analysis.symbol} reports earnings in ${daysUntil} days - Expect volatility`,
          color: '#FFD700',
          timestamp: new Date().toISOString()
        });
      }
    });
    
    // Streak alerts
    if (winStreak >= 5) {
      newAlerts.push({
        id: 'win_streak',
        type: 'streak',
        icon: '🔥',
        title: 'Hot Streak!',
        message: `You're on a ${winStreak}-trade winning streak! Keep it up!`,
        color: '#FF6B35',
        timestamp: new Date().toISOString()
      });
    }
    
    setAlerts(newAlerts.slice(0, 5)); // Keep last 5 alerts
  };

  // Fetch recent sequential analyses
  const fetchRecentAnalyses = async () => {
    try {
      const res = await fetch('/api/sequential-analysis');
      const data = await res.json();
      if (data.success && data.analysisHistory) {
        // Transform the data to match our expected format with full analysis details
        const transformedAnalyses = data.analysisHistory.map((analysis: any) => ({
          id: analysis.id,
          symbol: analysis.symbol,
          timestamp: analysis.timestamp,
          verdict: analysis.verdict,
          confidence: analysis.confidence,
          reasoning: analysis.reasoning,
          priceTarget: analysis.analysisDetails?.priceTarget,
          agentChain: analysis.analysisDetails?.agentChain || ['QuantitativeAnalysis', 'MarketAnalysis', 'TechnicalAnalysis', 'SentimentAnalysis', 'FinalSynthesis'],
          // Include full analysis details if available
          fullAnalysis: {
            executiveSummary: analysis.analysisDetails?.executiveSummary || analysis.reasoning,
            finalVerdict: {
              direction: analysis.verdict,
              confidence: analysis.confidence,
              priceTarget: analysis.analysisDetails?.priceTarget,
              reasoning: analysis.reasoning,
              risk: analysis.analysisDetails?.risk || 'UNKNOWN',
              timeHorizon: analysis.analysisDetails?.timeHorizon || 'Unknown'
            },
            keyRisks: analysis.analysisDetails?.keyRisks || [],
            catalysts: analysis.analysisDetails?.catalysts || [],
            citedSources: analysis.analysisDetails?.citedSources || [],
            totalProcessingTime: analysis.analysisDetails?.totalProcessingTime || 0
          }
        }));
        setRecentAnalyses(transformedAnalyses);
      }
    } catch (err) {
      console.error('Failed to fetch recent analyses:', err);
    }
  };

  // Handle sequential analysis completion
  const handleSequentialAnalysisComplete = (result: any) => {
    console.log('Sequential analysis completed:', result);
    console.log('Citations in result:', result.allCitations);
    console.log('Citations length:', result.allCitations?.length || 0);
    console.log('First 3 citations:', result.allCitations?.slice(0, 3));
    setSequentialAnalysisResult(result);
    
    // Update the recent analyses list with FULL analysis data preserved
    const newAnalysis = {
      id: Date.now(),
      symbol: result.symbol,
      timestamp: result.timestamp,
      verdict: result.finalVerdict?.direction || 'HOLD',
      confidence: result.finalVerdict?.confidence || 50,
      priceTarget: result.finalVerdict?.priceTarget,
      reasoning: result.finalVerdict?.reasoning,
      agentChain: result.agentChain,
      // Preserve ALL analysis details for full report display
      fullAnalysis: {
        executiveSummary: result.executiveSummary,
        finalVerdict: result.finalVerdict,
        quantAnalysis: result.quantAnalysis,
        marketAnalysis: result.marketAnalysis,
        technicalAnalysis: result.technicalAnalysis,
        sentimentAnalysis: result.sentimentAnalysis,
        fundamentalAnalysis: result.fundamentalAnalysis, // 🎯 NEW: Include fundamental analysis
        keyRisks: result.keyRisks,
        catalysts: result.catalysts,
        citedSources: result.allCitations || result.citedSources || [],
        totalProcessingTime: result.totalProcessingTime
      }
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
          
          {/* 🎯 NEW: Retail Trader Features */}
          {/* Market Mood & Trading Score */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Market Mood Card */}
            <Card className="trading-card border-0 group overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm mb-2">Market Mood</p>
                    <div className="flex items-center space-x-3">
                      <span className="text-4xl">{marketMood?.emoji || '😐'}</span>
                      <div>
                        <p className="text-xl font-bold" style={{ color: marketMood?.color || '#FFA500' }}>
                          {marketMood?.mood || 'NEUTRAL'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {marketMood?.bullishPercent || 50}% Bullish Signals
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${marketMood?.bullishPercent || 50}%`,
                      backgroundColor: marketMood?.color || '#FFA500'
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Trading Score Card */}
            <Card className="trading-card border-0 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Trading Score</p>
                    <div className="flex items-center space-x-3 mt-2">
                      <p className="text-3xl font-bold text-white">{tradingScore}</p>
                      <div className="text-2xl">
                        {tradingScore >= 80 ? '🏆' : 
                         tradingScore >= 60 ? '⭐' : 
                         tradingScore >= 40 ? '📈' : '📊'}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {tradingScore >= 80 ? 'Expert Trader' : 
                       tradingScore >= 60 ? 'Advanced' : 
                       tradingScore >= 40 ? 'Intermediate' : 'Beginner'}
                    </p>
                  </div>
                  <div className="w-16 h-16 relative">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="28" stroke="#374151" strokeWidth="4" fill="none" />
                      <circle 
                        cx="32" cy="32" r="28" 
                        stroke={tradingScore >= 70 ? '#10B981' : tradingScore >= 40 ? '#F59E0B' : '#EF4444'}
                        strokeWidth="4" 
                        fill="none"
                        strokeDasharray={`${(tradingScore / 100) * 175.929} 175.929`}
                        className="transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{tradingScore}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Win Streak Card */}
            <Card className="trading-card border-0 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Win Streak</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <p className="text-3xl font-bold text-white">{winStreak}</p>
                      <div className="text-2xl">
                        {winStreak >= 10 ? '🔥' : 
                         winStreak >= 5 ? '⚡' : 
                         winStreak >= 3 ? '✨' : '💪'}
                      </div>
                    </div>
                    <p className="text-xs text-orange-400">
                      {winStreak >= 10 ? 'ON FIRE!' : 
                       winStreak >= 5 ? 'Hot Streak!' : 
                       winStreak >= 3 ? 'Building Momentum' : 'Keep Going!'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6 text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 🎯 NEW: Smart Alerts */}
          {alerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="trading-card border-0">
                <CardHeader>
                  <CardTitle className="text-xl text-white flex items-center">
                    🚨 Smart Alerts
                    <Badge variant="secondary" className="ml-2">{alerts.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {alerts.slice(0, 3).map((alert, index) => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center p-3 rounded-lg bg-gray-800/50 border border-gray-700"
                      >
                        <div className="text-2xl mr-3">{alert.icon}</div>
                        <div className="flex-1">
                          <p className="font-medium text-white">{alert.title}</p>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          
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
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-primary/30 text-primary hover:bg-primary/10 rounded-xl"
                            onClick={() => {
                              console.log('Full analysis data:', analysis);
                              console.log('Full analysis object:', analysis.fullAnalysis);
                              setViewingFullReport(analysis);
                            }}
                          >
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

      {/* Full Report Modal */}
      {viewingFullReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-black via-gray-900 to-black border border-primary/30 rounded-2xl shadow-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-primary">
                Full Analysis Report - {viewingFullReport.symbol}
              </h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setViewingFullReport(null)}
                className="border-primary/30 text-primary hover:bg-primary/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Debug Info */}
            <div className="bg-red-900/50 p-4 rounded-lg border border-red-500/20 mb-4">
              <h3 className="text-lg font-semibold text-red-400 mb-2">Debug Info</h3>
              <p className="text-gray-300 text-xs">Has fullAnalysis: {viewingFullReport.fullAnalysis ? 'YES' : 'NO'}</p>
              <p className="text-gray-300 text-xs">Citations: {viewingFullReport.fullAnalysis?.citedSources?.length || 0}</p>
              <p className="text-gray-300 text-xs">Raw analysis keys: {Object.keys(viewingFullReport).join(', ')}</p>
              {viewingFullReport.fullAnalysis && (
                <p className="text-gray-300 text-xs">Full analysis keys: {Object.keys(viewingFullReport.fullAnalysis).join(', ')}</p>
              )}
            </div>

            {viewingFullReport.fullAnalysis ? (
              <div className="space-y-6">
                {/* Executive Summary */}
                {viewingFullReport.fullAnalysis.executiveSummary && (
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-primary/20">
                    <h3 className="text-lg font-semibold text-primary mb-2">Executive Summary</h3>
                    <p className="text-gray-300 text-sm">{viewingFullReport.fullAnalysis.executiveSummary}</p>
                  </div>
                )}

                {/* Final Verdict */}
                <div className="bg-gray-900/50 p-4 rounded-lg border border-primary/20">
                  <h3 className="text-lg font-semibold text-primary mb-3">Final Verdict</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Direction</p>
                      <p className={`text-xl font-bold ${getDirectionColor(viewingFullReport.verdict)}`}>
                        {viewingFullReport.verdict}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Confidence</p>
                      <p className="text-xl font-bold text-white">{viewingFullReport.confidence}%</p>
                    </div>
                    {viewingFullReport.priceTarget && (
                      <div>
                        <p className="text-sm text-gray-400">Price Target</p>
                        <p className="text-xl font-bold text-primary">${viewingFullReport.priceTarget}</p>
                      </div>
                    )}
                    {viewingFullReport.fullAnalysis.finalVerdict?.risk && (
                      <div>
                        <p className="text-sm text-gray-400">Risk Level</p>
                        <p className="text-xl font-bold text-white">{viewingFullReport.fullAnalysis.finalVerdict.risk}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Citations */}
                {viewingFullReport.fullAnalysis.citedSources?.length > 0 && (
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-primary/20">
                    <h3 className="text-lg font-semibold text-primary mb-2">
                      Citations ({viewingFullReport.fullAnalysis.citedSources.length})
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {viewingFullReport.fullAnalysis.citedSources.map((source: string, index: number) => (
                        <div key={index} className="flex items-start space-x-2">
                          <span className="text-primary font-medium text-sm min-w-[20px]">{index + 1}.</span>
                          <div className="flex-1">
                            {source.startsWith('http') ? (
                              <a 
                                href={source} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-400 hover:text-blue-300 hover:underline text-sm break-all"
                              >
                                {source}
                              </a>
                            ) : (
                              <p className="text-white text-sm leading-relaxed">{source}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {viewingFullReport.fullAnalysis.citedSources.length > 8 && (
                      <p className="text-gray-400 text-xs mt-2 text-center">
                        Scroll to see all {viewingFullReport.fullAnalysis.citedSources.length} citations
                      </p>
                    )}
                  </div>
                )}

                {/* 🎯 NEW: Fundamental Analysis Insights */}
                {viewingFullReport.fullAnalysis.fundamentalAnalysis && (
                  <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-6 rounded-lg border border-purple-500/20">
                    <h3 className="text-xl font-semibold text-purple-400 mb-4 flex items-center">
                      🏛️ Fundamental Analysis
                      <Badge variant="outline" className="ml-2 text-xs border-purple-400 text-purple-400">
                        PREMIUM
                      </Badge>
                    </h3>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Earnings Outlook */}
                      <div className="bg-black/30 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Earnings Outlook</h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">
                            {viewingFullReport.fullAnalysis.fundamentalAnalysis.earningsOutlook === 'BULLISH' ? '📈' :
                             viewingFullReport.fullAnalysis.fundamentalAnalysis.earningsOutlook === 'BEARISH' ? '📉' : '➡️'}
                          </span>
                          <span className={`font-bold ${
                            viewingFullReport.fullAnalysis.fundamentalAnalysis.earningsOutlook === 'BULLISH' ? 'text-green-400' :
                            viewingFullReport.fullAnalysis.fundamentalAnalysis.earningsOutlook === 'BEARISH' ? 'text-red-400' : 'text-yellow-400'
                          }`}>
                            {viewingFullReport.fullAnalysis.fundamentalAnalysis.earningsOutlook}
                          </span>
                        </div>
                      </div>

                      {/* Analyst Sentiment */}
                      <div className="bg-black/30 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Analyst Sentiment</h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">
                            {viewingFullReport.fullAnalysis.fundamentalAnalysis.analystSentiment === 'BULLISH' ? '👍' :
                             viewingFullReport.fullAnalysis.fundamentalAnalysis.analystSentiment === 'BEARISH' ? '👎' : '🤝'}
                          </span>
                          <span className={`font-bold ${
                            viewingFullReport.fullAnalysis.fundamentalAnalysis.analystSentiment === 'BULLISH' ? 'text-green-400' :
                            viewingFullReport.fullAnalysis.fundamentalAnalysis.analystSentiment === 'BEARISH' ? 'text-red-400' : 'text-yellow-400'
                          }`}>
                            {viewingFullReport.fullAnalysis.fundamentalAnalysis.analystSentiment}
                          </span>
                        </div>
                      </div>

                      {/* Event Risk */}
                      <div className="bg-black/30 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Event Risk</h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">
                            {viewingFullReport.fullAnalysis.fundamentalAnalysis.eventRisk === 'HIGH' ? '🚨' :
                             viewingFullReport.fullAnalysis.fundamentalAnalysis.eventRisk === 'MEDIUM' ? '⚠️' : '✅'}
                          </span>
                          <span className={`font-bold ${
                            viewingFullReport.fullAnalysis.fundamentalAnalysis.eventRisk === 'HIGH' ? 'text-red-400' :
                            viewingFullReport.fullAnalysis.fundamentalAnalysis.eventRisk === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'
                          }`}>
                            {viewingFullReport.fullAnalysis.fundamentalAnalysis.eventRisk}
                          </span>
                        </div>
                      </div>

                      {/* Fundamental Score */}
                      <div className="bg-black/30 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Fundamental Score</h4>
                        <div className="flex items-center space-x-2">
                          <div className="text-2xl font-bold text-white">
                            {viewingFullReport.fullAnalysis.fundamentalAnalysis.fundamentalScore || 0}
                          </div>
                          <div className="text-xs text-gray-400">/100</div>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${Math.abs(viewingFullReport.fullAnalysis.fundamentalAnalysis.fundamentalScore || 0)}%`,
                              backgroundColor: (viewingFullReport.fullAnalysis.fundamentalAnalysis.fundamentalScore || 0) > 0 ? '#10B981' : '#EF4444'
                            }}
                          />
                        </div>
                      </div>

                      {/* Confidence */}
                      <div className="bg-black/30 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Analysis Confidence</h4>
                        <div className="flex items-center space-x-2">
                          <div className="text-2xl font-bold text-white">
                            {viewingFullReport.fullAnalysis.fundamentalAnalysis.confidence || 0}%
                          </div>
                          <div className="text-xl">
                            {(viewingFullReport.fullAnalysis.fundamentalAnalysis.confidence || 0) >= 80 ? '🎯' :
                             (viewingFullReport.fullAnalysis.fundamentalAnalysis.confidence || 0) >= 60 ? '👌' : '🤔'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Key Insights */}
                    {viewingFullReport.fullAnalysis.fundamentalAnalysis.keyInsights?.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-purple-300 mb-2">Key Fundamental Insights</h4>
                        <div className="space-y-1">
                          {viewingFullReport.fullAnalysis.fundamentalAnalysis.keyInsights.slice(0, 3).map((insight: string, index: number) => (
                            <p key={index} className="text-gray-300 text-sm">💡 {insight}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Key Risks & Catalysts */}
                <div className="grid md:grid-cols-2 gap-4">
                  {viewingFullReport.fullAnalysis.keyRisks?.length > 0 && (
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-red-500/20">
                      <h3 className="text-lg font-semibold text-red-400 mb-2">Key Risks</h3>
                      <div className="space-y-1">
                        {viewingFullReport.fullAnalysis.keyRisks.map((risk: string, index: number) => (
                          <p key={index} className="text-gray-300 text-sm">• {risk}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {viewingFullReport.fullAnalysis.catalysts?.length > 0 && (
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-green-500/20">
                      <h3 className="text-lg font-semibold text-green-400 mb-2">Catalysts</h3>
                      <div className="space-y-2">
                        {viewingFullReport.fullAnalysis.catalysts.map((catalyst: any, index: number) => (
                          <div key={index} className="text-sm">
                            <p className="text-gray-300">{catalyst.event || catalyst}</p>
                            {catalyst.date && (
                              <p className="text-gray-400 text-xs">
                                {catalyst.date} - {catalyst.impact} impact
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Agent Chain */}
                <div className="bg-gray-900/50 p-4 rounded-lg border border-primary/20">
                  <h3 className="text-lg font-semibold text-primary mb-2">Analysis Chain</h3>
                  <p className="text-gray-300 text-sm">
                    {viewingFullReport.agentChain?.join(' → ') || '5-Agent Sequential Analysis'}
                  </p>
                  {viewingFullReport.fullAnalysis.totalProcessingTime && (
                    <p className="text-gray-400 text-xs mt-2">
                      Total Processing Time: {viewingFullReport.fullAnalysis.totalProcessingTime}ms
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-yellow-900/50 p-4 rounded-lg border border-yellow-500/20">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">Limited Data Available</h3>
                <p className="text-gray-300 text-sm">This analysis only has basic summary data. Full analysis details may not have been preserved.</p>
                <div className="mt-4 space-y-2">
                  <p className="text-gray-300 text-sm"><strong>Reasoning:</strong> {viewingFullReport.reasoning}</p>
                  {viewingFullReport.priceTarget && (
                    <p className="text-gray-300 text-sm"><strong>Price Target:</strong> ${viewingFullReport.priceTarget}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 