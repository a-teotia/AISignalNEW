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
import { AgentResults } from "@/components/AgentResults";
import { MultiAgentOutput } from "@/lib/types/prediction-types";
import { DynamicLoadingPrompt } from "@/components/DynamicLoadingPrompt";
import { useSession } from "next-auth/react";
import { X, TrendingUp, TrendingDown, Minus, Activity, Target, BarChart3, Clock, DollarSign, Shield, Zap, Users, Settings, Loader2 } from "lucide-react";

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
  
  // State for agent breakdown and recent signals
  const [agentBreakdown, setAgentBreakdown] = useState(defaultAgentBreakdown);
  // Live signal feed state
  const [recentSignals, setRecentSignals] = useState<any[]>([]);
  const [signalPage, setSignalPage] = useState(1);
  const [signalTotalPages, setSignalTotalPages] = useState(1);

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

  // Fetch live signals from backend (paginated)
  const fetchSignals = async (page = 1) => {
    try {
      const res = await fetch(`/api/predictions?page=${page}&pageSize=10`);
      const data = await res.json();
      if (data && data.predictions) {
        setRecentSignals(data.predictions.map((p: any) => ({
          id: `db-${p.id}`, // Prefix database IDs to avoid conflicts
          symbol: p.symbol,
          direction: p.verdict,
          confidence: p.confidence,
          entry: p.entry || 0,
          tp: p.tp || 0,
          sl: p.sl || 0,
          timeframe: p.timeframe || '1H',
          style: p.style || 'swing',
          agents: [], // Could parse from p.market_context if needed
          reasoning: p.reasoning,
          timestamp: p.created_at,
          status: 'active', // Could infer from DB fields
          predictionId: p.id // Keep original DB ID for reference
        })));
        setSignalPage(data.page);
        setSignalTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error('Failed to fetch signals:', err);
    }
  };

  // On mount, load first page of signals
  useEffect(() => {
    fetchSignals(1);
  }, []);

  const handleAnalyze = async () => {
    setLoading(true);
    console.log("Symbol:", symbol);
    console.log("Date:", selectedDate);
    console.log("Session:", session);

    // Check if user is authenticated
    if (!session || !session.user) {
      alert("Please sign in to generate signals.");
      setLoading(false);
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    if (selectedDate > today) {
      alert("Please select a date that is today or earlier.");
      setLoading(false);
      return;
    }

    try {
      console.log("🔄 Starting analysis for:", symbol);
      
      // Use the centralized data provider for comprehensive data
      const dataResponse = await fetch(`/api/market-data?symbol=${symbol}`);
      const marketData = await dataResponse.json();
      
      console.log("Market data response:", marketData);
      
      if (marketData.success) {
        console.log("Market data received:", marketData.data);
        
        // Generate AI prediction using the multi-agent system
        const predictionResponse = await fetch("/api/multi-predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            symbol, 
            predictionDate: selectedDate || new Date().toISOString().split('T')[0],
            tradingStyle: selectedTradingStyle
          }),
        });
        
        if (!predictionResponse.ok) {
          const errorText = await predictionResponse.text();
          console.error("❌ API Error:", predictionResponse.status, errorText);
          throw new Error(`API Error: ${predictionResponse.status} - ${errorText}`);
        }
        
        const predictionData = await predictionResponse.json();
        console.log("Prediction data:", predictionData);
        
        // Debug: Check if we have the expected structure
        if (predictionData.result) {
          console.log("✅ Multi-agent result structure:", {
            hasAgents: !!predictionData.result.agents,
            agentCount: predictionData.result.agents ? Object.keys(predictionData.result.agents).length : 0,
            finalPrediction: predictionData.result.finalPrediction,
            confidence: predictionData.result.confidence
          });
        }

        if (predictionData.success && predictionData.result) {
          const result = predictionData.result;
          const finalPrediction = result.finalPrediction;
          
          // Update state with real prediction data
          setConfidence(result.confidence || 50);
          setVerdict(finalPrediction.direction === 'UP' ? 'UP 📈' : 
                    finalPrediction.direction === 'DOWN' ? 'DOWN 📉' : 'NEUTRAL ➡️');
          setReason(finalPrediction.reasoning || 'Multi-agent AI analysis completed');
          setPredictionId(predictionData.predictionId);
          
          // Update agent breakdown with real data from all agents
          if (result.agents) {
            // Transform agent results for the pie chart
            const realAgentBreakdown = Object.entries(result.agents).map(([agentName, agentResult]: [string, any]) => ({
              name: agentName.charAt(0).toUpperCase() + agentName.slice(1) + ' Agent',
              value: agentResult.confidence || 50,
              color: getAgentColor(agentName)
            }));
            
            // Update the agent breakdown state with real data
            setAgentBreakdown(realAgentBreakdown);
          }
          
          // Add the new signal to the live feed
          const timestamp = new Date().toISOString();
          const newSignal = {
            id: `${symbol}-${timestamp}-${Math.random().toString(36).substr(2, 9)}`, // More unique ID
            symbol: symbol,
            direction: finalPrediction.direction,
            confidence: result.confidence || 50,
            entry: marketData.data?.price || 0,
            tp: calculateTakeProfit(marketData.data?.price || 0, finalPrediction.direction),
            sl: calculateStopLoss(marketData.data?.price || 0, finalPrediction.direction),
            timeframe: getTimeframeForStyle(selectedTradingStyle),
            style: selectedTradingStyle,
            agents: result.agents ? Object.keys(result.agents) : ['AI System'],
            reasoning: finalPrediction.reasoning || 'Multi-agent AI analysis completed',
            timestamp: timestamp,
            status: 'active',
            predictionId: predictionData.predictionId // Add database ID for tracking
          };
          
          // Add to the beginning of the signals array
          setRecentSignals(prev => [newSignal, ...prev]);
          
          console.log("✅ Signal generated successfully:", newSignal);
          
          // Show success notification
          // alert(`✅ Signal generated for ${symbol}!\nDirection: ${finalPrediction.direction}\nConfidence: ${result.confidence || 50}%\nTrading Style: ${selectedTradingStyle}`);
        } else {
          console.error("❌ Invalid response structure:", predictionData);
          throw new Error("Invalid response structure from multi-predict API");
        }
      } else {
        throw new Error("Failed to fetch market data");
      }
    } catch (error) {
      console.error("Error generating signal:", error);
      alert("Failed to generate signal. Please try again.");
    }

    setLoading(false);
    // Reload performance metrics after new prediction
    setTimeout(loadPerformanceMetrics, 1000);
    // After new analysis, re-fetch signals from backend
    fetchSignals(1);
  };

  // Add Deep Analysis handler
  const handleDeepAnalysis = async () => {
    setLoading(true);
    try {
      // Fetch real-time data for the selected symbol
      const dataResponse = await fetch(`/api/market-data?symbol=${symbol}`);
      const marketData = await dataResponse.json();
      if (!marketData.success) throw new Error('Failed to fetch market data');

      // Prepare realTimeData for VortexForge
      const realTimeData = {
        currentPrice: marketData.data?.price || 0,
        indicators: marketData.data?.indicators || {},
        support: marketData.data?.support || '',
        resistance: marketData.data?.resistance || '',
        style: selectedTradingStyle
      };
      const timeframe = getTimeframeForStyle(selectedTradingStyle);

      // Call VortexForge API
      const response = await fetch('/api/vortexforge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, timeframe, realTimeData })
      });
      if (!response.ok) throw new Error('VortexForge API error');
      const { result } = await response.json();

      // Add the new VortexForge signal to the top of the feed
      const timestamp = new Date().toISOString();
      const newSignal = {
        id: `${symbol}-${timestamp}-${Math.random().toString(36).substr(2, 9)}`, // More unique ID
        symbol,
        direction: result.data.direction,
        confidence: result.confidence,
        entry: result.data.entry,
        tp: result.data.takeProfit,
        sl: result.data.stopLoss,
        timeframe: result.data.timeframe || timeframe,
        style: selectedTradingStyle,
        agents: ['VortexForge'],
        reasoning: result.data.reasoning,
        timestamp: timestamp,
        status: 'active',
        agent: 'VortexForge',
        data: result.data // for modal details
      };
      setRecentSignals(prev => [newSignal, ...prev]);
    } catch (err) {
      // TODO: Show user-friendly error message
      alert('Failed to run Deep Analysis. Please try again.');
      console.error(err);
    }
    setLoading(false);
  };

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

          {/* Live Signal Feed */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Card className="trading-card border-0">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-xl">
                  <Activity className="w-6 h-6 mr-3 text-primary animate-pulse" />
                  Live Signal Feed
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Real-time AI-generated trading signals with full transparency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSignals.map((signal: any, index) => (
                    <motion.div
                      key={signal.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="glassmorphism rounded-xl p-6 hover:border-primary/30 transition-all duration-300 group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 rounded-lg bg-primary/10">
                            {getDirectionIcon(signal.direction)}
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-lg">{signal.symbol}</h3>
                            <p className="text-sm text-muted-foreground">{signal.timeframe} • {signal.style}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xl font-bold ${getDirectionColor(signal.direction)} group-hover:scale-110 transition-transform`}>
                            {signal.direction}
                          </div>
                          <div className="text-sm text-muted-foreground">{signal.confidence}% confidence</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-card/50 rounded-xl p-4 border border-border/50">
                          <p className="text-xs text-muted-foreground mb-1">Entry</p>
                          <p className="font-bold text-white text-lg">${signal.entry}</p>
                        </div>
                        <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                          <p className="text-xs text-green-400 mb-1">Take Profit</p>
                          <p className="font-bold text-green-400 text-lg">${signal.tp}</p>
                        </div>
                        <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
                          <p className="text-xs text-red-400 mb-1">Stop Loss</p>
                          <p className="font-bold text-red-400 text-lg">${signal.sl}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(signal.status)}`}>
                            {signal.status}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(signal.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <Button size="sm" variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 rounded-xl">
                          View Details
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                  {/* Pagination controls */}
                  <div className="flex justify-center mt-6 space-x-3">
                    <Button size="sm" variant="outline" className="border-primary/30 text-primary rounded-xl" disabled={signalPage === 1} onClick={() => fetchSignals(signalPage - 1)}>
                      Previous
                    </Button>
                    <span className="text-muted-foreground px-4 py-2">Page {signalPage} of {signalTotalPages}</span>
                    <Button size="sm" variant="outline" className="border-primary/30 text-primary rounded-xl" disabled={signalPage === signalTotalPages} onClick={() => fetchSignals(signalPage + 1)}>
                      Next
                    </Button>
                  </div>
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
            {/* Agent Breakdown */}
            <Card className="trading-card border-0">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-xl">
                  <Users className="w-6 h-6 mr-3 text-primary" />
                  Agent Breakdown
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  See which AI agents contributed to the latest signal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                         data={agentBreakdown}
                         cx="50%"
                         cy="50%"
                         innerRadius={60}
                         outerRadius={100}
                         paddingAngle={5}
                         dataKey="value"
                       >
                         {agentBreakdown.map((entry: any, index: number) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                         ))}
                       </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(17, 17, 19, 0.95)', 
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: '12px',
                          color: 'white',
                          backdropFilter: 'blur(20px)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-6">
                   {agentBreakdown.map((agent: any) => (
                     <div key={agent.name} className="flex items-center space-x-3 p-2 rounded-lg bg-card/30">
                       <div className="w-4 h-4 rounded-full" style={{ backgroundColor: agent.color }}></div>
                       <span className="text-sm text-white flex-1">{agent.name}</span>
                       <span className="text-sm font-bold text-primary">{agent.value}%</span>
                     </div>
                   ))}
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

          {/* Quick Analysis Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <Card className="trading-card border-0">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center">
                  <Zap className="w-6 h-6 mr-3 text-primary" />
                  Quick Analysis
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Generate a new AI prediction for any asset
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <Input
                    type="date"
                    value={selectedDate}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="flex-1 bg-card border-border text-white placeholder:text-muted-foreground focus:border-primary rounded-xl"
                    placeholder="Select Date"
                  />
                  <Button 
                    onClick={handleAnalyze} 
                    disabled={loading}
                    className="bg-primary text-white hover:bg-primary/90 font-semibold rounded-xl px-6 py-3 shadow-lg hover:shadow-primary/25 transition-all duration-300"
                  >
                    {loading ? "Analyzing..." : "Generate Signal"}
                  </Button>
                  <Button
                    onClick={handleDeepAnalysis}
                    disabled={loading}
                    className="bg-gradient-to-r from-primary to-blue-600 text-white hover:from-primary/90 hover:to-blue-600/90 font-semibold rounded-xl px-6 py-3 shadow-lg hover:shadow-primary/25 transition-all duration-300"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin w-5 h-5 mr-2" />
                    ) : (
                      <Zap className="w-5 h-5 mr-2" />
                    )}
                    Deep Analysis
                  </Button>
                  <Button 
                    onClick={async () => {
                      try {
                        console.debug("Sending to n8n webhook:", { symbol });
                        const response = await fetch("https://ateotia-dev.app.n8n.cloud/webhook-test/d80b79e2-9ad0-4966-8724-ef8d8bb263c1", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ symbol })
                        });
                        const data = await response.json();
                        console.log("n8n Analysis response:", data);
                      } catch (error) {
                        console.error("n8n Analysis error:", error);
                      }
                    }}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-500/90 hover:to-emerald-600/90 font-semibold rounded-xl px-6 py-3 shadow-lg hover:shadow-green-500/25 transition-all duration-300"
                  >
                    n8n Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 