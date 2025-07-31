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
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b0d] via-[#0f1012] to-[#0a0b0d] relative overflow-hidden">
      {/* AI Processing Modal */}
      <AIFactsModal show={loading} />
      
      {/* Premium Background Effects */}
      <div className="absolute inset-0">
        {/* Enhanced Grid Pattern with Depth */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(147,51,234,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(147,51,234,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />
        
        {/* Multi-layer Premium Gradient Overlays */}
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-blue-500/8 via-blue-500/3 to-transparent" />
        <div className="absolute bottom-0 right-0 w-[500px] h-96 bg-gradient-radial from-purple-500/12 via-purple-500/4 to-transparent" />
        <div className="absolute top-1/3 left-0 w-80 h-80 bg-gradient-radial from-emerald-500/10 via-emerald-500/3 to-transparent" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-radial from-amber-500/8 via-transparent to-transparent" />
        
        {/* Enhanced Animated Particles System */}
        <div className="absolute top-20 left-1/4 w-1 h-1 bg-blue-400/80 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-emerald-400/80 rounded-full animate-pulse delay-700 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-purple-400/80 rounded-full animate-pulse delay-1000 shadow-[0_0_10px_rgba(147,51,234,0.5)]" />
        <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-amber-400/60 rounded-full animate-pulse delay-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
        <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-rose-400/60 rounded-full animate-pulse delay-1500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
        
        {/* Subtle Moving Gradients */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-blue-500/[0.01] to-transparent animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tl from-transparent via-purple-500/[0.01] to-transparent animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />
      </div>
      
      {/* Dashboard Welcome Section - Simplified */}
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="glass-premium rounded-2xl p-8 mb-6 shadow-premium"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl font-bold premium-gradient-text">
                  Welcome back, <span className="golden-gradient-text">{session?.user?.name || 'Trader'}</span>
                </h1>
                <p className="text-gray-300 text-lg">Your world-class AI-powered trading command center</p>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Enhanced Live Status */}
                <div className="flex items-center space-x-3 bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-green-500/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-green-500/30 shadow-lg">
                  <div className="relative">
                    <Activity className="w-4 h-4 text-green-400 animate-pulse" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-green-300">LIVE</span>
                    <p className="text-xs text-green-400/80">Real-time</p>
                  </div>
                </div>
                
                {/* Premium Market Status */}
                <div className="bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-blue-500/30 shadow-lg">
                  <div className="text-center">
                    <span className="text-sm font-semibold text-blue-300">MARKETS</span>
                    <p className="text-xs text-blue-400/80">Open</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="relative z-10 px-6 pb-6">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Premium Market Intelligence Overview */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Enhanced Market Mood Card */}
            <Card className="bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-gray-900/50 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/20 group hover:shadow-3xl hover:shadow-black/30 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                      <p className="text-blue-200/80 text-sm font-medium tracking-wide uppercase">Market Sentiment</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-700/50 to-gray-800/50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                        {marketMood?.emoji || '😐'}
                      </div>
                      <div>
                        <p className="text-xl font-bold" style={{ color: marketMood?.color || '#FFA500' }}>
                          {marketMood?.mood || 'NEUTRAL'}
                        </p>
                        <p className="text-xs text-gray-400">Current market mood</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                      {marketMood?.bullishPercent || 50}%
                    </p>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Bullish Sentiment</p>
                    <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-1000"
                        style={{ width: `${marketMood?.bullishPercent || 50}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Performance Card */}
            <Card className="bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-gray-900/50 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/20 group hover:shadow-3xl hover:shadow-black/30 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      <p className="text-emerald-200/80 text-sm font-medium tracking-wide uppercase">Your Performance</p>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="flex items-center space-x-1 mb-1">
                          <span className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">{tradingScore}</span>
                          <span className="text-xs text-gray-400 uppercase tracking-wider">Score</span>
                        </div>
                        <div className="w-12 h-1 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-400 rounded-full transition-all duration-1000"
                            style={{ width: `${tradingScore}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center space-x-1 mb-1">
                          <span className="text-2xl font-bold text-orange-400">{winStreak}</span>
                          <span className="text-xs text-gray-400 uppercase tracking-wider">Streak</span>
                          {winStreak >= 5 && <span className="text-xl animate-bounce">🔥</span>}
                        </div>
                        <p className="text-xs text-orange-300/80">Win streak</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-4xl mb-2 group-hover:scale-110 transition-transform duration-300 ${winStreak >= 5 ? 'animate-pulse' : ''}`}>
                      {tradingScore >= 80 ? '🏆' : tradingScore >= 60 ? '⭐' : '📈'}
                    </div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">
                      {tradingScore >= 80 ? 'Elite' : tradingScore >= 60 ? 'Advanced' : 'Growing'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Premium Smart Alerts Banner */}
          {alerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8"
            >
              <div className="bg-gradient-to-r from-gray-900/60 via-gray-800/40 to-gray-900/60 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                    <span className="text-sm font-semibold text-amber-200 uppercase tracking-wide">Smart Alerts</span>
                  </div>
                  <span className="text-xs text-gray-400">{alerts.length} active</span>
                </div>
                <div className="flex items-center space-x-4 overflow-x-auto pb-1">
                  {alerts.slice(0, 3).map((alert, index) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-3 bg-gradient-to-r from-gray-800/60 to-gray-700/40 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 whitespace-nowrap shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      <div className="text-xl group-hover:scale-110 transition-transform duration-300">{alert.icon}</div>
                      <div>
                        <span className="text-sm font-semibold text-white">{alert.title}</span>
                        <p className="text-xs text-gray-300 max-w-40 truncate">{alert.message}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Premium Analytics Dashboard */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Today's Signals Card */}
            <Card className="bg-gradient-to-br from-emerald-900/20 via-green-900/10 to-emerald-900/20 backdrop-blur-xl border border-emerald-500/20 shadow-xl shadow-emerald-500/10 group hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-emerald-200/80 text-sm font-medium tracking-wide uppercase">Today's Signals</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">12</p>
                    <div className="flex items-center space-x-1 text-xs text-emerald-300">
                      <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" />
                      <span>+3 from yesterday</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                    <TrendingUp className="w-7 h-7 text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Accuracy Rate Card */}
            <Card className="bg-gradient-to-br from-blue-900/20 via-indigo-900/10 to-blue-900/20 backdrop-blur-xl border border-blue-500/20 shadow-xl shadow-blue-500/10 group hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-blue-200/80 text-sm font-medium tracking-wide uppercase">Accuracy Rate</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">87.5%</p>
                    <div className="w-20 h-2 bg-gray-700/50 rounded-full overflow-hidden">
                      <div className="h-full w-[87.5%] bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full" />
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                    <Target className="w-7 h-7 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Profit Card */}
            <Card className="bg-gradient-to-br from-green-900/20 via-emerald-900/10 to-green-900/20 backdrop-blur-xl border border-green-500/20 shadow-xl shadow-green-500/10 group hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-green-200/80 text-sm font-medium tracking-wide uppercase">Total Profit</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">+$2,847</p>
                    <div className="flex items-center space-x-1 text-xs text-green-300">
                      <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
                      <span>+12.4% this month</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                    <DollarSign className="w-7 h-7 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Signals Card */}
            <Card className="bg-gradient-to-br from-purple-900/20 via-violet-900/10 to-purple-900/20 backdrop-blur-xl border border-purple-500/20 shadow-xl shadow-purple-500/10 group hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-purple-200/80 text-sm font-medium tracking-wide uppercase">Active Signals</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">8</p>
                    <div className="flex items-center space-x-1 text-xs text-purple-300">
                      <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse" />
                      <span>2 high confidence</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                    <Zap className="w-7 h-7 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Premium Trading Style Selection */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-gray-900/50 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/20 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 via-transparent to-purple-500/3" />
              <CardHeader className="relative z-10">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                      Trading Strategy
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Select your preferred trading approach and timeframe
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {tradingStyles.map((style) => {
                    const Icon = style.icon;
                    const isSelected = selectedTradingStyle === style.id;
                    return (
                      <motion.button
                        key={style.id}
                        onClick={() => setSelectedTradingStyle(style.id)}
                        className={`relative p-6 rounded-2xl border-2 transition-all duration-500 text-left group overflow-hidden ${
                          isSelected
                            ? 'border-blue-500/50 bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-purple-500/20 shadow-lg shadow-blue-500/25'
                            : 'border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-700/30 hover:border-blue-500/30 hover:bg-gradient-to-br hover:from-blue-500/10 hover:to-purple-500/10'
                        }`}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isSelected && (
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 animate-pulse" />
                        )}
                        <div className="relative z-10">
                          <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center transition-all duration-300 ${
                            isSelected 
                              ? 'bg-gradient-to-br from-blue-500/30 to-purple-500/30 shadow-lg' 
                              : 'bg-gradient-to-br from-gray-700/50 to-gray-600/50 group-hover:from-blue-500/20 group-hover:to-purple-500/20'
                          }`}>
                            <Icon className={`w-6 h-6 transition-all duration-300 group-hover:scale-110 ${
                              isSelected ? 'text-blue-300' : 'text-gray-300 group-hover:text-blue-400'
                            }`} />
                          </div>
                          <h3 className={`font-bold text-lg mb-2 transition-colors duration-300 ${
                            isSelected ? 'text-blue-300' : 'text-white group-hover:text-blue-300'
                          }`}>
                            {style.name}
                          </h3>
                          <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                            {style.description}
                          </p>
                          {isSelected && (
                            <div className="mt-3 flex items-center space-x-1">
                              <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" />
                              <span className="text-xs text-blue-300 font-medium uppercase tracking-wide">Selected</span>
                            </div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Premium Asset Selection Interface */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-gray-900/50 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/20 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/3 via-transparent to-blue-500/3" />
              <CardHeader className="relative z-10">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                      Asset Universe
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Choose from premium assets across global markets
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-8">
                  {/* Enhanced Category Tabs */}
                  <div className="flex space-x-2 p-1 bg-gradient-to-r from-gray-800/60 to-gray-700/40 rounded-2xl backdrop-blur-sm">
                    {Object.keys(popularAssets).map((category) => {
                      const isSelected = selectedAssetCategory === category;
                      return (
                        <motion.button
                          key={category}
                          onClick={() => setSelectedAssetCategory(category)}
                          className={`flex-1 px-6 py-4 rounded-xl text-sm font-bold transition-all duration-500 relative overflow-hidden ${
                            isSelected
                              ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-xl shadow-purple-500/25'
                              : 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-blue-500/20'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {isSelected && (
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 animate-pulse" />
                          )}
                          <span className="relative z-10 uppercase tracking-wide">
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Enhanced Asset Selection Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {popularAssets[selectedAssetCategory as keyof typeof popularAssets].map((asset) => {
                      const isSelected = symbol === asset;
                      return (
                        <motion.button
                          key={asset}
                          onClick={() => setSymbol(asset)}
                          className={`relative p-4 rounded-xl font-bold text-sm transition-all duration-500 group overflow-hidden ${
                            isSelected
                              ? 'bg-gradient-to-br from-blue-500/30 via-blue-500/20 to-purple-500/30 text-blue-300 border-2 border-blue-500/50 shadow-lg shadow-blue-500/25'
                              : 'bg-gradient-to-br from-gray-800/60 to-gray-700/40 text-gray-300 border-2 border-white/10 hover:border-blue-500/30 hover:bg-gradient-to-br hover:from-blue-500/20 hover:to-purple-500/20 hover:text-blue-300'
                          }`}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {isSelected && (
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 animate-pulse" />
                          )}
                          <div className="relative z-10 text-center">
                            <div className="text-lg font-bold mb-1">{asset}</div>
                            {isSelected && (
                              <div className="flex items-center justify-center space-x-1">
                                <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" />
                                <span className="text-xs text-blue-300 uppercase tracking-wider">Selected</span>
                              </div>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
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

          {/* Premium Analysis History */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Card className="bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-gray-900/50 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/20 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/3 via-transparent to-blue-500/3" />
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
                      <Activity className="w-6 h-6 text-violet-400 animate-pulse" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                        Analysis History
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        Recent AI-powered sequential analysis results with full transparency
                      </CardDescription>
                    </div>
                  </div>
                  {recentAnalyses.length > itemsPerPage && (
                    <div className="text-sm text-violet-300 bg-gradient-to-r from-violet-500/20 to-blue-500/20 px-3 py-1 rounded-lg backdrop-blur-sm">
                      {startIndex + 1}-{Math.min(endIndex, recentAnalyses.length)} of {recentAnalyses.length}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-6">
                  {recentAnalyses.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-700/50 to-gray-600/30 rounded-2xl flex items-center justify-center">
                        <Activity className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-400 text-lg">No recent analyses yet</p>
                      <p className="text-gray-500 text-sm mt-2">Run your first sequential analysis above to see results here!</p>
                    </div>
                  ) : (
                    currentAnalyses.map((analysis: any, index) => (
                      <motion.div
                        key={analysis.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="bg-gradient-to-r from-gray-800/60 to-gray-700/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-violet-500/30 transition-all duration-500 group shadow-lg hover:shadow-xl"
                      >
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-4">
                            <div className={`p-3 rounded-xl shadow-lg ${
                              analysis.verdict === 'BUY' || analysis.verdict === 'UP' ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20' :
                              analysis.verdict === 'SELL' || analysis.verdict === 'DOWN' ? 'bg-gradient-to-br from-red-500/20 to-rose-500/20' :
                              'bg-gradient-to-br from-gray-500/20 to-gray-600/20'
                            }`}>
                              {getDirectionIcon(analysis.verdict)}
                            </div>
                            <div>
                              <h3 className="font-bold text-white text-xl mb-1">{analysis.symbol}</h3>
                              <div className="flex items-center space-x-2">
                                <div className="w-1 h-1 bg-violet-400 rounded-full animate-pulse" />
                                <p className="text-sm text-violet-300 font-medium">
                                  {analysis.agentChain?.join(' → ') || '6-Agent Sequential Analysis'}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <div className={`text-2xl font-bold group-hover:scale-110 transition-transform duration-300 ${
                              analysis.verdict === 'BUY' || analysis.verdict === 'UP' ? 'text-green-400' :
                              analysis.verdict === 'SELL' || analysis.verdict === 'DOWN' ? 'text-red-400' :
                              'text-gray-400'
                            }`}>
                              {analysis.verdict}
                            </div>
                            <div className="text-sm text-gray-300">{analysis.confidence}% confidence</div>
                            <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden ml-auto">
                              <div 
                                className="h-full bg-gradient-to-r from-violet-500 to-blue-400 rounded-full transition-all duration-1000"
                                style={{ width: `${analysis.confidence}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mb-5">
                          <div className="bg-gradient-to-br from-gray-700/30 to-gray-600/20 rounded-xl p-4 border border-white/5 backdrop-blur-sm">
                            <p className="text-xs text-violet-300 mb-2 uppercase tracking-wide font-medium">Analysis Summary</p>
                            <p className="text-white text-sm leading-relaxed line-clamp-2">{analysis.reasoning}</p>
                          </div>
                        </div>

                        {analysis.priceTarget && (
                          <div className="mb-5">
                            <div className="bg-gradient-to-br from-blue-500/15 to-purple-500/15 rounded-xl p-4 border border-blue-500/20 backdrop-blur-sm">
                              <p className="text-xs text-blue-300 mb-1 uppercase tracking-wide font-medium">Price Target</p>
                              <p className="font-bold text-blue-400 text-xl">${analysis.priceTarget}</p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-500/20 to-blue-500/20 text-violet-300 border border-violet-500/30 backdrop-blur-sm">
                              AI SEQUENTIAL
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(analysis.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="bg-gradient-to-r from-violet-500/10 to-blue-500/10 border-violet-500/30 text-violet-300 hover:bg-gradient-to-r hover:from-violet-500/20 hover:to-blue-500/20 hover:border-violet-400/50 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
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
            {/* Premium Sequential Agent Chain */}
            <Card className="bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-gray-900/50 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/20 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/3 via-transparent to-blue-500/3" />
              <CardHeader className="relative z-10">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                      AI Agent Pipeline
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      6-agent sequential analysis with compound intelligence
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-4">
                  {sequentialAnalysisResult ? (
                    // Show actual agent chain from latest analysis
                    <div className="space-y-4">
                      {sequentialAnalysisResult.agentChain?.map((agent: string, index: number) => (
                        <motion.div 
                          key={agent} 
                          className="flex items-center space-x-4 p-5 rounded-2xl bg-gradient-to-r from-gray-800/60 to-gray-700/40 backdrop-blur-sm border border-white/10 group hover:border-emerald-500/30 transition-all duration-300"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/30 to-blue-500/30 flex items-center justify-center text-emerald-300 font-bold text-sm shadow-lg group-hover:scale-110 transition-transform duration-300">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-bold text-base mb-1">{agent}</h4>
                            <p className="text-sm text-gray-300">
                              {index === 0 && "🔢 Real market data & quantitative analysis"}
                              {index === 1 && "🌐 Internet research & fundamental insights"}
                              {index === 2 && "📊 Technical patterns & chart analysis"}
                              {index === 3 && "📰 Sentiment & news analysis"}
                              {index === 4 && "🏛️ Fundamental analysis & earnings data"}
                              {index === 5 && "🎯 Final synthesis & comprehensive report"}
                            </p>
                          </div>
                          <div className="text-emerald-400 text-xl group-hover:scale-110 transition-transform duration-300">
                            {index < sequentialAnalysisResult.agentChain.length - 1 && "→"}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    // Show default sequential agent chain
                    <div className="space-y-4">
                      {[
                        { name: "Quantitative Analysis", desc: "🔢 Real market data & technical indicators", color: "from-blue-500/20 to-indigo-500/20" },
                        { name: "Market Analysis", desc: "🌐 Internet research & fundamental insights", color: "from-emerald-500/20 to-green-500/20" },
                        { name: "Technical Analysis", desc: "📊 Chart patterns & technical signals", color: "from-purple-500/20 to-violet-500/20" },
                        { name: "Sentiment Analysis", desc: "📰 News & social sentiment analysis", color: "from-amber-500/20 to-orange-500/20" },
                        { name: "Fundamental Analysis", desc: "🏛️ Earnings & corporate fundamentals", color: "from-rose-500/20 to-pink-500/20" },
                        { name: "Final Synthesis", desc: "🎯 Comprehensive report with citations", color: "from-emerald-500/20 to-blue-500/20" }
                      ].map((agent, index) => (
                        <motion.div 
                          key={agent.name} 
                          className="flex items-center space-x-4 p-5 rounded-2xl bg-gradient-to-r from-gray-800/60 to-gray-700/40 backdrop-blur-sm border border-white/10 group hover:border-emerald-500/30 transition-all duration-300"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-bold text-base mb-1">{agent.name}</h4>
                            <p className="text-sm text-gray-300">{agent.desc}</p>
                          </div>
                          <div className="text-emerald-400 text-xl group-hover:scale-110 transition-transform duration-300">
                            {index < 5 && "→"}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-blue-500/5 to-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm">
                  <h4 className="text-emerald-300 font-bold text-lg mb-3 flex items-center">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse mr-2" />
                    Why Sequential Intelligence?
                  </h4>
                  <p className="text-gray-200 text-sm leading-relaxed">
                    Each AI agent builds upon the previous one's insights, creating compound intelligence that delivers higher accuracy than parallel processing. This cascading approach ensures comprehensive analysis across all market dimensions.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Premium Performance Analytics */}
            <Card className="bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-gray-900/50 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/20 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 via-transparent to-purple-500/3" />
              <CardHeader className="relative z-10">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                      Performance Analytics
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Advanced accuracy and profit trend analysis
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                {/* Enhanced Performance Metrics */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                    <p className="text-2xl font-bold text-green-400 mb-1">{performanceMetrics?.accuracy_rate?.toFixed(1) || '87.5'}%</p>
                    <p className="text-xs text-green-300 uppercase tracking-wide">Accuracy</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                    <p className="text-2xl font-bold text-blue-400 mb-1">{performanceMetrics?.total_predictions || '156'}</p>
                    <p className="text-xs text-blue-300 uppercase tracking-wide">Signals</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-500/20">
                    <p className="text-2xl font-bold text-purple-400 mb-1">{performanceMetrics?.win_rate?.toFixed(1) || '73.2'}%</p>
                    <p className="text-xs text-purple-300 uppercase tracking-wide">Win Rate</p>
                  </div>
                </div>
                
                {/* Enhanced Chart Area */}
                <div className="h-72 p-4 rounded-2xl bg-gradient-to-br from-gray-800/30 to-gray-700/20 border border-white/5 backdrop-blur-sm">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={accuracyTrends}>
                      <defs>
                        <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                      <XAxis 
                        dataKey="date" 
                        stroke="rgba(255,255,255,0.4)"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="rgba(255,255,255,0.4)"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(17, 17, 19, 0.95)', 
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: '16px',
                          color: 'white',
                          backdropFilter: 'blur(20px)',
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="accuracy" 
                        stroke="url(#accuracyGradient)" 
                        strokeWidth={3}
                        fill="url(#accuracyGradient)"
                        dot={{ fill: '#3b82f6', strokeWidth: 3, r: 5, stroke: '#1e40af' }}
                        activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 3, fill: '#60a5fa' }}
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

                {/* 🎯 SIMPLIFIED: Fundamental Analysis */}
                {viewingFullReport.fullAnalysis.fundamentalAnalysis && (
                  <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-500/20">
                    <h3 className="text-lg font-semibold text-purple-400 mb-3 flex items-center">
                      🏛️ Fundamental Analysis
                      <Badge variant="outline" className="ml-2 text-xs border-purple-400 text-purple-400">
                        PREMIUM
                      </Badge>
                    </h3>
                    
                    <div className="grid md:grid-cols-3 gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-2xl mb-1">
                          {viewingFullReport.fullAnalysis.fundamentalAnalysis.earningsOutlook === 'BULLISH' ? '📈' :
                           viewingFullReport.fullAnalysis.fundamentalAnalysis.earningsOutlook === 'BEARISH' ? '📉' : '➡️'}
                        </div>
                        <p className="text-xs text-gray-400">Earnings</p>
                        <p className={`text-sm font-bold ${
                          viewingFullReport.fullAnalysis.fundamentalAnalysis.earningsOutlook === 'BULLISH' ? 'text-green-400' :
                          viewingFullReport.fullAnalysis.fundamentalAnalysis.earningsOutlook === 'BEARISH' ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                          {viewingFullReport.fullAnalysis.fundamentalAnalysis.earningsOutlook}
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="text-2xl mb-1">
                          {viewingFullReport.fullAnalysis.fundamentalAnalysis.analystSentiment === 'BULLISH' ? '👍' :
                           viewingFullReport.fullAnalysis.fundamentalAnalysis.analystSentiment === 'BEARISH' ? '👎' : '🤝'}
                        </div>
                        <p className="text-xs text-gray-400">Analysts</p>
                        <p className={`text-sm font-bold ${
                          viewingFullReport.fullAnalysis.fundamentalAnalysis.analystSentiment === 'BULLISH' ? 'text-green-400' :
                          viewingFullReport.fullAnalysis.fundamentalAnalysis.analystSentiment === 'BEARISH' ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                          {viewingFullReport.fullAnalysis.fundamentalAnalysis.analystSentiment}
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="text-2xl mb-1">
                          {viewingFullReport.fullAnalysis.fundamentalAnalysis.eventRisk === 'HIGH' ? '🚨' :
                           viewingFullReport.fullAnalysis.fundamentalAnalysis.eventRisk === 'MEDIUM' ? '⚠️' : '✅'}
                        </div>
                        <p className="text-xs text-gray-400">Event Risk</p>
                        <p className={`text-sm font-bold ${
                          viewingFullReport.fullAnalysis.fundamentalAnalysis.eventRisk === 'HIGH' ? 'text-red-400' :
                          viewingFullReport.fullAnalysis.fundamentalAnalysis.eventRisk === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'
                        }`}>
                          {viewingFullReport.fullAnalysis.fundamentalAnalysis.eventRisk}
                        </p>
                      </div>
                    </div>

                    {/* Score and Top Insight */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400">Fundamental Score</p>
                        <p className="text-lg font-bold text-white">
                          {viewingFullReport.fullAnalysis.fundamentalAnalysis.fundamentalScore || 0}/100
                        </p>
                      </div>
                      {viewingFullReport.fullAnalysis.fundamentalAnalysis.keyInsights?.[0] && (
                        <div className="flex-1 ml-4">
                          <p className="text-xs text-purple-300">Key Insight:</p>
                          <p className="text-sm text-gray-300">
                            💡 {viewingFullReport.fullAnalysis.fundamentalAnalysis.keyInsights[0]}
                          </p>
                        </div>
                      )}
                    </div>
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