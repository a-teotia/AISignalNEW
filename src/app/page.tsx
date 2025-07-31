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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Hero Section */}
        <motion.div 
          className="text-center max-w-4xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">Powered by Multi-Agent AI</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
            AI Signal Trading
            <br />
            <span className="text-primary glow-text">Platform</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Revolutionary 5-agent sequential AI system with compound intelligence and internet research. 
            Each agent builds on previous insights with full citations and transparency.
          </p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-primary/25 transition-all duration-300 group"
              onClick={handleGetStarted}
            >
              {session ? 'Go to Dashboard' : 'Start Trading'}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-muted-foreground/20 hover:border-primary/50 px-8 py-6 text-lg rounded-xl"
              onClick={() => router.push('/demo')}
            >
              View Demo
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
              <Card key={index} className="trading-card text-center border-0">
                <CardContent className="p-6">
                  <Icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
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
            <h2 className="text-3xl font-bold text-white mb-4">Sequential AI Agent System</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              5 specialized agents working in sequence - each building on the previous agent's analysis for compound intelligence
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <motion.div 
              className="glassmorphism rounded-2xl p-8 mb-8"
              key={currentAgentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-6">
                <div className={`p-4 rounded-xl ${agents[currentAgentIndex].bgColor} border border-current/20`}>
                  {React.createElement(agents[currentAgentIndex].icon, { 
                    className: `w-12 h-12 ${agents[currentAgentIndex].color}` 
                  })}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {agents[currentAgentIndex].name}
                  </h3>
                  <Badge className={`${agents[currentAgentIndex].color} bg-transparent border border-current mb-3`}>
                    {agents[currentAgentIndex].label}
                  </Badge>
                  <p className="text-muted-foreground text-lg">
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
            <h2 className="text-3xl font-bold text-white mb-4">Why Choose Our Platform?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built for retail traders who want institutional-grade analysis without the complexity
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
                  <Card className="trading-card border-0 h-full">
                    <CardContent className="p-6">
                      <Icon className={`w-10 h-10 ${feature.color} mb-4`} />
                      <h3 className="text-lg font-semibold text-white mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
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
          <p className="text-muted-foreground mb-6">Powered By</p>
          <div className="flex justify-center items-center gap-8 flex-wrap">
            {poweredBy.map((provider, index) => (
              <motion.div 
                key={index} 
                className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity"
                whileHover={{ scale: 1.05 }}
              >
                {provider.logo}
                <span className="text-sm text-muted-foreground font-medium">
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