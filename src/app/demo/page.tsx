'use client';
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession, signIn } from "next-auth/react";
import { motion } from "framer-motion";

export default function DemoPage() {
  const { data: session } = useSession();
  const [symbol, setSymbol] = useState("");
  const [timeframe, setTimeframe] = useState("1day");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/multi-predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, timeframe }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Prediction failed");
      } else {
        setResult(data.result);
      }
    } catch (err) {
      setError("Prediction failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b0d] via-[#0f1012] to-[#0a0b0d] relative overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-blue-500/8 via-blue-500/3 to-transparent" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-radial from-purple-500/12 via-purple-500/4 to-transparent" />
      </div>
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] p-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.7 }} 
          className="w-full max-w-3xl mx-auto"
        >
          {/* Demo Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold premium-gradient-text mb-4">
              AI Trading Demo
            </h1>
            <p className="text-xl text-gray-300 mb-2">
              Experience world-class AI-powered market analysis
            </p>
            <p className="text-gray-400">
              No signup required for your first prediction!
            </p>
          </div>
          
          <div className="elite-card p-8 hover-glow">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Live Market Analysis</h2>
              <p className="text-gray-300">
                Try our 6-agent sequential AI system on any symbol
              </p>
            </div>
            <form onSubmit={handleAnalyze} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 uppercase tracking-wide">Stock Symbol</label>
                <Input
                  placeholder="Enter symbol (e.g., AAPL, TSLA, CBA.AX)"
                  value={symbol}
                  onChange={e => setSymbol(e.target.value.toUpperCase())}
                  required
                  className="text-lg px-6 py-4 rounded-xl glass-light border border-white/20 text-white placeholder:text-gray-400 focus:border-blue-500/50 transition-all duration-300"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 uppercase tracking-wide">Analysis Timeframe</label>
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger className="w-full glass-light border border-white/20 text-lg rounded-xl px-6 py-4 text-white">
                    <SelectValue placeholder="Select Timeframe" />
                  </SelectTrigger>
                  <SelectContent className="glass-heavy border border-white/20 text-white">
                    <SelectItem value="1day" className="text-white hover:bg-white/10">1 Day Prediction</SelectItem>
                    <SelectItem value="1week" className="text-white hover:bg-white/10">1 Week Prediction</SelectItem>
                    <SelectItem value="1month" className="text-white hover:bg-white/10">1 Month Prediction</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                type="submit" 
                className="w-full elite-card hover-glow text-xl py-6 rounded-xl font-bold transition-all duration-300 hover:scale-105 animate-gradient" 
                disabled={loading}
              >
                <span className="golden-gradient-text">
                  {loading ? "AI Analyzing..." : "Get AI Predictions"}
                </span>
              </Button>
            </form>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="mt-6 p-4 rounded-xl bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-500/30 text-red-300"
              >
                <div className="font-semibold text-center">{error}</div>
              </motion.div>
            )}
            
            {result && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5 }} 
                className="mt-8 space-y-6"
              >
                <div className="premium-card p-6 hover-lift">
                  <h3 className="text-2xl font-bold premium-gradient-text mb-6 text-center">AI Prediction Result</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="text-center p-4 glass-light rounded-xl border border-white/10">
                      <p className="text-sm text-gray-400 uppercase tracking-wide mb-2">Direction</p>
                      <p className={`text-2xl font-bold ${
                        result.finalPrediction?.direction === 'UP' ? 'text-green-400' :
                        result.finalPrediction?.direction === 'DOWN' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {result.finalPrediction?.direction || "ANALYZING"}
                      </p>
                    </div>
                    
                    <div className="text-center p-4 glass-light rounded-xl border border-white/10">
                      <p className="text-sm text-gray-400 uppercase tracking-wide mb-2">Confidence</p>
                      <p className="text-2xl font-bold text-blue-400">
                        {result.confidence ? `${result.confidence}%` : "--"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="glass-light rounded-xl p-6 border border-white/10">
                    <p className="text-sm text-gray-400 uppercase tracking-wide mb-3">AI Reasoning</p>
                    <p className="text-gray-300 leading-relaxed">
                      {result.agents?.synth?.data?.reasoning?.chainOfThought || "Analysis reasoning will appear here..."}
                    </p>
                  </div>
                </div>
                
                {!session && (
                  <div className="elite-card p-6 text-center animate-glow">
                    <div className="mb-4">
                      <h4 className="text-xl font-bold golden-gradient-text mb-2">Unlock Full AI Power</h4>
                      <p className="text-gray-300">Get unlimited predictions, full analysis reports, and premium features</p>
                    </div>
                    <Button 
                      onClick={() => signIn()} 
                      className="elite-card hover-glow px-8 py-3 text-lg font-bold rounded-xl transition-all duration-300 hover:scale-105"
                    >
                      <span className="golden-gradient-text">Sign Up Free</span>
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 