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
          id: p.id,
          symbol: p.symbol,
          direction: p.verdict,
          confidence: p.confidence,
          entry: p.entry,
          tp: p.tp,
          sl: p.sl,
          timeframe: p.timeframe,
          style: p.style,
          agents: [], // Could parse from p.market_context if needed
          reasoning: p.reasoning,
          timestamp: p.created_at,
          status: 'active', // Could infer from DB fields
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
          const newSignal = {
            id: Date.now(),
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
            timestamp: new Date().toISOString(),
            status: 'active'
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
      const newSignal = {
        id: Date.now(),
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
        timestamp: new Date().toISOString(),
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
      return entryPrice * 1.03; // 3% profit target
    } else if (direction === 'DOWN') {
      return entryPrice * 0.97; // 3% profit target for short
    }
    return entryPrice;
  };

  const calculateStopLoss = (entryPrice: number, direction: string): number => {
    if (direction === 'UP') {
      return entryPrice * 0.98; // 2% stop loss
    } else if (direction === 'DOWN') {
      return entryPrice * 1.02; // 2% stop loss for short
    }
    return entryPrice;
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
    <div className="min-h-screen relative bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* AI Processing Modal */}
      <AIFactsModal show={loading} />
      {/* Premium Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_30%,rgba(255,215,0,0.05)_50%,transparent_70%)]"></div>
      
      {/* Header Section */}
      <div className="relative z-10 p-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-yellow-200 to-yellow-400 bg-clip-text text-transparent">
                Welcome back, {session?.user?.name || 'Trader'}
              </h1>
              <p className="text-white/60 mt-1">Your AI-powered trading dashboard</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10">
                <Activity className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium">Live</span>
              </div>
              <Button variant="outline" size="sm" className="border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-yellow-400/30 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Today's Signals</p>
                    <p className="text-2xl font-bold text-white">12</p>
                  </div>
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-yellow-400/30 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Accuracy Rate</p>
                    <p className="text-2xl font-bold text-white">87.5%</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-yellow-400/30 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Total Profit</p>
                    <p className="text-2xl font-bold text-green-400">+$2,847</p>
                  </div>
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-yellow-400/30 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Active Signals</p>
                    <p className="text-2xl font-bold text-white">8</p>
                  </div>
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trading Style Presets */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Target className="w-5 h-5 mr-2 text-yellow-400" />
                Trading Style
              </CardTitle>
              <CardDescription className="text-white/60">
                Select your preferred trading approach
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {tradingStyles.map((style) => {
                  const Icon = style.icon;
                  return (
                    <button
                      key={style.id}
                      onClick={() => setSelectedTradingStyle(style.id)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                        selectedTradingStyle === style.id
                          ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                          : 'border-white/10 bg-white/5 hover:border-yellow-400/30 hover:bg-yellow-400/5 text-white'
                      }`}
                    >
                      <Icon className="w-6 h-6 mb-2" />
                      <h3 className="font-semibold text-sm">{style.name}</h3>
                      <p className="text-xs text-white/60 mt-1">{style.description}</p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Asset Selection */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Asset Selection</CardTitle>
              <CardDescription className="text-white/60">
                Choose from popular assets across different markets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Category Tabs */}
                <div className="flex space-x-2">
                  {Object.keys(popularAssets).map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedAssetCategory(category)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedAssetCategory === category
                          ? 'bg-yellow-400 text-black'
                          : 'bg-white/5 text-white hover:bg-white/10'
                      }`}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Asset Tags */}
                <div className="flex flex-wrap gap-2">
                  {popularAssets[selectedAssetCategory as keyof typeof popularAssets].map((asset) => (
                    <button
                      key={asset}
                      onClick={() => setSymbol(asset)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        symbol === asset
                          ? 'bg-yellow-400 text-black'
                          : 'bg-white/5 text-white hover:bg-yellow-400/20 hover:text-yellow-400'
                      }`}
                    >
                      {asset}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Signal Feed */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="w-5 h-5 mr-2 text-yellow-400" />
                Live Signal Feed
              </CardTitle>
              <CardDescription className="text-white/60">
                Real-time AI-generated trading signals with full transparency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSignals.map((signal: any) => (
                  <motion.div
                    key={signal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-yellow-400/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getDirectionIcon(signal.direction)}
                        <div>
                          <h3 className="font-bold text-white">{signal.symbol}</h3>
                          <p className="text-sm text-white/60">{signal.timeframe} • {signal.style}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getDirectionColor(signal.direction)}`}>
                          {signal.direction}
                        </div>
                        <div className="text-sm text-white/60">{signal.confidence}% confidence</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-xs text-white/60">Entry</p>
                        <p className="font-bold text-white">${signal.entry}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-xs text-white/60">Take Profit</p>
                        <p className="font-bold text-green-400">${signal.tp}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-xs text-white/60">Stop Loss</p>
                        <p className="font-bold text-red-400">${signal.sl}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(signal.status)}`}>
                          {signal.status}
                        </span>
                        <span className="text-xs text-white/60">
                          {new Date(signal.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <Button size="sm" variant="outline" className="border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10">
                        View Details
                      </Button>
                    </div>
                  </motion.div>
                ))}
                {/* Pagination controls */}
                <div className="flex justify-center mt-4 space-x-2">
                  <Button size="sm" variant="outline" className="border-yellow-400/30 text-yellow-400" disabled={signalPage === 1} onClick={() => fetchSignals(signalPage - 1)}>
                    Previous
                  </Button>
                  <span className="text-white/70 px-2">Page {signalPage} of {signalTotalPages}</span>
                  <Button size="sm" variant="outline" className="border-yellow-400/30 text-yellow-400" disabled={signalPage === signalTotalPages} onClick={() => fetchSignals(signalPage + 1)}>
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agent Breakdown & Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Agent Breakdown */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="w-5 h-5 mr-2 text-yellow-400" />
                  Agent Breakdown
                </CardTitle>
                <CardDescription className="text-white/60">
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
                          backgroundColor: 'rgba(0,0,0,0.9)', 
                          border: '1px solid rgba(255,215,0,0.3)',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                                 <div className="grid grid-cols-2 gap-2 mt-4">
                   {agentBreakdown.map((agent: any) => (
                     <div key={agent.name} className="flex items-center space-x-2">
                       <div className="w-3 h-3 rounded-full" style={{ backgroundColor: agent.color }}></div>
                       <span className="text-sm text-white/80">{agent.name}</span>
                       <span className="text-sm font-bold text-white ml-auto">{agent.value}%</span>
                     </div>
                   ))}
                 </div>
              </CardContent>
            </Card>

            {/* Performance Chart */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-yellow-400" />
                  Performance Trend
                </CardTitle>
                <CardDescription className="text-white/60">
                  Your accuracy and profit trends over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={accuracyTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
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
                          backgroundColor: 'rgba(0,0,0,0.9)', 
                          border: '1px solid rgba(255,215,0,0.3)',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="accuracy" 
                        stroke="#FFD700" 
                        strokeWidth={3}
                        dot={{ fill: '#FFD700', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Analysis Section */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Quick Analysis</CardTitle>
              <CardDescription className="text-white/60">
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
                  className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-yellow-400"
                  placeholder="Select Date"
                />
                <Button 
                  onClick={handleAnalyze} 
                  disabled={loading}
                  className="bg-yellow-400 text-black hover:bg-yellow-300 font-semibold"
                >
                  {loading ? "Analyzing..." : "Generate Signal"}
                </Button>
                <Button
                  onClick={handleDeepAnalysis}
                  disabled={loading}
                  className="bg-yellow-400 text-black hover:bg-yellow-300 font-semibold"
                >
                  {loading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Zap className="w-5 h-5 mr-2 text-black" />}
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
                  className="bg-yellow-400 text-black hover:bg-yellow-300 font-semibold"
                >
                  n8n Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 