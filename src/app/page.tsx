"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import React from "react";
import { 
  ArrowRight, 
  Brain, 
  TrendingUp, 
  Shield, 
  Zap, 
  Users, 
  BarChart3,
  Globe,
  Activity,
  Target,
  CheckCircle,
  Sparkles
} from "lucide-react";

const agents = [
  { 
    name: "Quantitative Analysis", 
    label: "Agent 1", 
    icon: BarChart3, 
    desc: "Real market data, technical indicators, volume analysis, and risk metrics with Yahoo Finance integration.",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10"
  },
  { 
    name: "Market Analysis", 
    label: "Agent 2", 
    icon: Globe, 
    desc: "Internet research on company fundamentals, earnings, competitive position using Perplexity Sonar.",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10"
  },
  { 
    name: "Technical Analysis", 
    label: "Agent 3", 
    icon: TrendingUp, 
    desc: "Chart patterns, support/resistance levels building on quantitative and fundamental insights.",
    color: "text-green-400",
    bgColor: "bg-green-500/10"
  },
  { 
    name: "Sentiment Analysis", 
    label: "Agent 4", 
    icon: Activity, 
    desc: "News sentiment, analyst ratings, social media trends integrating all previous analysis.",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10"
  },
  { 
    name: "Final Synthesis", 
    label: "Agent 5", 
    icon: Zap, 
    desc: "Comprehensive report with price targets, citations, and final investment recommendation.",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10"
  }
];

const poweredBy = [
  {
    name: "Deepseek",
    logo: (
      <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="19" cy="19" r="19" fill="#18181B" />
        <path d="M19 8L28 30H10L19 8Z" fill="#FFD700" />
        <circle cx="19" cy="19" r="7" fill="#fff" fillOpacity="0.12" />
      </svg>
    ),
  },
  {
    name: "ChatGPT",
    logo: (
      <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="19" cy="19" r="19" fill="#18181B" />
        <path d="M19 11c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M19 27c-4.418 0-8-3.582-8-8s3.582-8 8-8" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="19" cy="19" r="6" fill="#22C55E" fillOpacity="0.12" />
      </svg>
    ),
  },
  {
    name: "Perplexity",
    logo: (
      <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="19" cy="19" r="19" fill="#18181B" />
        <path d="M15 26V12h5.5a4 4 0 1 1 0 8H15" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="19" cy="19" r="6" fill="#60A5FA" fillOpacity="0.12" />
      </svg>
    ),
  },
  {
    name: "SignalAI",
    logo: (
      <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="19" cy="19" r="19" fill="#18181B" />
        <path d="M12 26L26 12M12 12L26 26" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="19" cy="19" r="6" fill="#F59E0B" fillOpacity="0.12" />
      </svg>
    ),
  }
];

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();
  const [currentAgentIndex, setCurrentAgentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentAgentIndex((prevIndex) => (prevIndex + 1) % agents.length);
    }, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleGetStarted = () => {
    if (session) {
      router.push("/dashboard");
    } else {
      router.push("/auth/signin");
    }
  };

  const features = [
    {
      icon: Brain,
      title: "Sequential AI System",
      description: "5 agents in sequence with compound intelligence and citations",
      color: "text-blue-400"
    },
    {
      icon: TrendingUp,
      title: "Real-Time Predictions",
      description: "Live market data with 6-24 hour prediction windows",
      color: "text-green-400"
    },
    {
      icon: Shield,
      title: "Risk Management",
      description: "Automated stop-loss and take-profit calculations",
      color: "text-purple-400"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Analysis in seconds, not hours of manual research",
      color: "text-yellow-400"
    }
  ];

  const stats = [
    { label: "Sequential Agents", value: "5", icon: Users },
    { label: "Internet Research", value: "Real-time", icon: Globe },
    { label: "Processing Time", value: "2-5min", icon: Zap },
    { label: "Market Coverage", value: "24/7", icon: Activity }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b0d] via-[#0f1012] to-[#0a0b0d] relative overflow-hidden">
      {/* Premium Background Effects - Same as Dashboard */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(147,51,234,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(147,51,234,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />
        
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-blue-500/8 via-blue-500/3 to-transparent" />
        <div className="absolute bottom-0 right-0 w-[500px] h-96 bg-gradient-radial from-purple-500/12 via-purple-500/4 to-transparent" />
        <div className="absolute top-1/3 left-0 w-80 h-80 bg-gradient-radial from-emerald-500/10 via-emerald-500/3 to-transparent" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-radial from-amber-500/8 via-transparent to-transparent" />
        
        <div className="absolute top-20 left-1/4 w-1 h-1 bg-blue-400/80 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-emerald-400/80 rounded-full animate-pulse delay-700 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-purple-400/80 rounded-full animate-pulse delay-1000 shadow-[0_0_10px_rgba(147,51,234,0.5)]" />
        <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-amber-400/60 rounded-full animate-pulse delay-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
        <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-rose-400/60 rounded-full animate-pulse delay-1500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Hero Section */}
        <motion.div 
          className="text-center max-w-4xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass-premium border border-primary/30 mb-8 shadow-lg"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <span className="text-sm premium-gradient-text font-bold tracking-wide uppercase">Powered by Multi-Agent AI</span>
          </motion.div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-8 premium-gradient-text elite-glow-text animate-float">
            AI Signal Trading
            <br />
            <span className="golden-gradient-text">Platform</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Revolutionary <span className="premium-gradient-text font-semibold">6-agent sequential AI system</span> with compound intelligence and internet research. 
            Each agent builds on previous insights with <span className="text-blue-400 font-semibold">full citations and transparency</span>.
          </p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button 
              size="lg" 
              className="elite-card hover-glow px-10 py-6 text-xl font-bold rounded-2xl animate-gradient shadow-premium transition-all duration-500 hover:scale-105 group"
              onClick={handleGetStarted}
            >
              <span className="golden-gradient-text">
                {session ? 'Go to Dashboard' : 'Start Trading'}
              </span>
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="glass-premium border-white/30 text-white hover:bg-white/10 hover:border-white/50 px-10 py-6 text-xl rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              onClick={() => router.push('/demo')}
            >
              <span className="premium-glow-text">View Demo</span>
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="premium-card text-center hover-lift group">
                <div className="p-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-blue-400 group-hover:text-blue-300 transition-colors" />
                  </div>
                  <div className="text-4xl font-bold premium-gradient-text mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-300 uppercase tracking-wide font-medium">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Agent Showcase */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold premium-gradient-text mb-6">Sequential AI Agent System</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              <span className="text-blue-400 font-semibold">6 specialized agents</span> working in sequence - each building on the previous agent's analysis for <span className="premium-gradient-text font-semibold">compound intelligence</span>
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <motion.div 
              className="elite-card p-10 mb-10 hover-glow"
              key={currentAgentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-6">
                <div className={`p-6 rounded-2xl ${agents[currentAgentIndex].bgColor} border border-current/30 shadow-lg hover:scale-110 transition-transform duration-300`}>
                  {React.createElement(agents[currentAgentIndex].icon, { 
                    className: `w-14 h-14 ${agents[currentAgentIndex].color}` 
                  })}
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold premium-gradient-text mb-3">
                    {agents[currentAgentIndex].name}
                  </h3>
                  <Badge className={`${agents[currentAgentIndex].color} glass-premium border border-current/50 px-4 py-1 text-sm font-bold mb-4`}>
                    {agents[currentAgentIndex].label}
                  </Badge>
                  <p className="text-gray-300 text-xl leading-relaxed">
                    {agents[currentAgentIndex].desc}
                  </p>
                </div>
              </div>
            </motion.div>
            
            <div className="flex justify-center gap-2">
              {agents.map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
                    index === currentAgentIndex ? 'bg-primary w-8' : 'bg-muted-foreground/30'
                  }`}
                  whileHover={{ scale: 1.2 }}
                  onClick={() => setCurrentAgentIndex(index)}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold premium-gradient-text mb-6">Why Choose Our Platform?</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Built for retail traders who want <span className="text-blue-400 font-semibold">institutional-grade analysis</span> without the complexity
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                >
                  <div className="premium-card h-full hover-lift group">
                    <div className="p-8">
                      <div className="w-16 h-16 mb-6 bg-gradient-to-br from-gray-700/50 to-gray-600/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className={`w-8 h-8 ${feature.color} group-hover:scale-110 transition-transform duration-300`} />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-gray-300 text-base leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Powered By Section */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <p className="text-gray-400 mb-8 text-lg font-medium tracking-wide uppercase">Powered By</p>
          <div className="flex justify-center items-center gap-8 flex-wrap">
            {poweredBy.map((provider, index) => (
              <motion.div 
                key={index} 
                className="flex items-center gap-4 opacity-70 hover:opacity-100 transition-all duration-300 glass-light rounded-xl p-4 hover:scale-105 hover:shadow-lg"
                whileHover={{ scale: 1.05 }}
              >
                {provider.logo}
                <span className="text-base text-gray-300 font-semibold">
                  {provider.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}