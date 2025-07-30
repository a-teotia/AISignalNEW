"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, 
  ChevronUp, 
  Brain, 
  TrendingUp, 
  Globe, 
  Activity, 
  BarChart3, 
  Zap,
  Target,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

interface AgentResult {
  agent: string;
  confidence: number;
  data: any;
  sources: string[];
  quality: {
    overallQuality: number;
    warnings: string[];
  };
  validation: {
    passed: boolean;
    score: number;
  };
}

interface ModernAgentResultsProps {
  results: Record<string, AgentResult>;
  className?: string;
}

const agentConfig = {
  sonar: {
    name: "Sonar Research",
    icon: Globe,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    description: "News & sentiment analysis"
  },
  geo: {
    name: "Geo Sentience",
    icon: Globe,
    color: "text-green-400",
    bgColor: "bg-green-500/10", 
    borderColor: "border-green-500/20",
    description: "Geopolitical & macro factors"
  },
  quant: {
    name: "Quant Edge",
    icon: BarChart3,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    description: "Technical analysis"
  },
  onchain: {
    name: "OnChain",
    icon: Activity,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    description: "Blockchain metrics"
  },
  flow: {
    name: "Flow Agent",
    icon: TrendingUp,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20",
    description: "Institutional flows"
  },
  microstructure: {
    name: "Microstructure",
    icon: Target,
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/20",
    description: "Market microstructure"
  },
  ml: {
    name: "ML Agent",
    icon: Brain,
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/20",
    description: "Machine learning"
  },
  marketstructure: {
    name: "Market Structure",
    icon: Users,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20",
    description: "Market structure analysis"
  },
  synth: {
    name: "Synthesis Oracle",
    icon: Zap,
    color: "text-gradient-primary",
    bgColor: "bg-gradient-to-r from-blue-500/10 to-purple-500/10",
    borderColor: "border-gradient-to-r from-blue-500/20 to-purple-500/20",
    description: "Final synthesis"
  }
};

export function ModernAgentResults({ results, className = "" }: ModernAgentResultsProps) {
  const [expandedAgents, setExpandedAgents] = useState<Record<string, boolean>>({});

  const toggleAgent = (agentKey: string) => {
    setExpandedAgents(prev => ({
      ...prev,
      [agentKey]: !prev[agentKey]
    }));
  };

  const getValidationIcon = (validation: { passed: boolean; score: number }) => {
    if (validation.passed && validation.score >= 80) {
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    } else if (validation.passed) {
      return <AlertCircle className="w-4 h-4 text-yellow-400" />;
    } else {
      return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-400";
    if (confidence >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-xl font-semibold text-white mb-4">Agent Analysis Results</h3>
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="trading-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Agents</p>
                <p className="text-2xl font-bold text-white">{Object.keys(results).length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="trading-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Confidence</p>
                <p className="text-2xl font-bold text-white">
                  {Math.round(Object.values(results).reduce((sum, r) => sum + r.confidence, 0) / Object.keys(results).length)}%
                </p>
              </div>
              <Brain className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="trading-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Validated</p>
                <p className="text-2xl font-bold text-white">
                  {Object.values(results).filter(r => r.validation.passed).length}/{Object.keys(results).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Cards */}
      <div className="space-y-3">
        {Object.entries(results).map(([agentKey, result]) => {
          const config = agentConfig[agentKey as keyof typeof agentConfig];
          if (!config) return null;

          const Icon = config.icon;
          const isExpanded = expandedAgents[agentKey];

          return (
            <motion.div
              key={agentKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`trading-card border-0 ${config.bgColor} ${config.borderColor}`}>
                <CardHeader 
                  className="pb-3 cursor-pointer"
                  onClick={() => toggleAgent(agentKey)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${config.bgColor} ${config.borderColor} border`}>
                        <Icon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-white">{config.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{config.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {getValidationIcon(result.validation)}
                      <Badge className={`${getConfidenceColor(result.confidence)} bg-transparent border border-current`}>
                        {result.confidence}%
                      </Badge>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Quality:</span>
                      <Progress 
                        value={result.quality.overallQuality} 
                        className="w-20 h-2"
                      />
                      <span className="text-sm font-medium text-white">
                        {result.quality.overallQuality}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Sources:</span>
                      <span className="text-sm font-medium text-white">
                        {result.sources.length}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          {/* Validation Details */}
                          <div className="p-3 rounded-lg bg-muted/10 border border-muted/20">
                            <h4 className="text-sm font-semibold text-white mb-2">Validation Status</h4>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                Score: {result.validation.score}/100
                              </span>
                              <Badge variant={result.validation.passed ? "default" : "destructive"}>
                                {result.validation.passed ? "PASSED" : "FAILED"}
                              </Badge>
                            </div>
                          </div>

                          {/* Quality Warnings */}
                          {result.quality.warnings.length > 0 && (
                            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                              <h4 className="text-sm font-semibold text-yellow-400 mb-2">Quality Warnings</h4>
                              <ul className="text-sm space-y-1">
                                {result.quality.warnings.map((warning, index) => (
                                  <li key={index} className="text-yellow-300">
                                    • {warning}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Data Sources */}
                          <div className="p-3 rounded-lg bg-muted/10 border border-muted/20">
                            <h4 className="text-sm font-semibold text-white mb-2">Data Sources</h4>
                            <div className="flex flex-wrap gap-2">
                              {result.sources.map((source, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {source}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Raw Data Preview */}
                          <div className="p-3 rounded-lg bg-muted/10 border border-muted/20">
                            <h4 className="text-sm font-semibold text-white mb-2">Analysis Summary</h4>
                            <div className="text-sm text-muted-foreground font-mono bg-black/20 p-2 rounded max-h-32 overflow-y-auto">
                              {JSON.stringify(result.data, null, 2).substring(0, 300)}...
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}