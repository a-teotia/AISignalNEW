"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Target, Shield, Clock, DollarSign, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

interface PredictionCardProps {
  symbol: string;
  prediction: {
    direction: 'UP' | 'DOWN' | 'NEUTRAL';
    confidence: number;
    entryPrice: number;
    stopLoss: number;
    takeProfit: number;
    riskRewardRatio: number;
    timeframe: string;
    expirationTime: string;
  };
  className?: string;
}

export function ModernPredictionCard({ symbol, prediction, className = "" }: PredictionCardProps) {
  const {
    direction,
    confidence,
    entryPrice,
    stopLoss,
    takeProfit,
    riskRewardRatio,
    timeframe,
    expirationTime
  } = prediction;

  const getDirectionColor = () => {
    switch (direction) {
      case 'UP':
        return 'text-green-400';
      case 'DOWN':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  const getDirectionIcon = () => {
    switch (direction) {
      case 'UP':
        return <TrendingUp className="w-5 h-5" />;
      case 'DOWN':
        return <TrendingDown className="w-5 h-5" />;
      default:
        return <Minus className="w-5 h-5" />;
    }
  };

  const getDirectionBg = () => {
    switch (direction) {
      case 'UP':
        return 'prediction-bullish';
      case 'DOWN':
        return 'prediction-bearish';
      default:
        return 'prediction-neutral';
    }
  };

  const getConfidenceColor = () => {
    if (confidence >= 80) return 'text-green-400';
    if (confidence >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card className={`trading-card ${getDirectionBg()} border-0 overflow-hidden`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-white">
              {symbol}
            </CardTitle>
            <div className={`flex items-center gap-2 ${getDirectionColor()}`}>
              {getDirectionIcon()}
              <span className="text-lg font-semibold">{direction}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <Badge 
              variant="secondary" 
              className={`${getConfidenceColor()} bg-transparent border border-current`}
            >
              {confidence}% Confidence
            </Badge>
            <Badge variant="outline" className="text-muted-foreground">
              {timeframe}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Price Levels */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="w-4 h-4" />
                Entry Price
              </div>
              <div className="text-lg font-mono font-semibold text-white">
                {formatPrice(entryPrice)}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BarChart3 className="w-4 h-4" />
                Risk/Reward
              </div>
              <div className="text-lg font-mono font-semibold text-green-400">
                1:{riskRewardRatio.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Stop Loss & Take Profit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-2 text-sm text-red-400 mb-1">
                <Shield className="w-4 h-4" />
                Stop Loss
              </div>
              <div className="text-base font-mono font-semibold text-red-400">
                {formatPrice(stopLoss)}
              </div>
            </div>
            
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 text-sm text-green-400 mb-1">
                <DollarSign className="w-4 h-4" />
                Take Profit
              </div>
              <div className="text-base font-mono font-semibold text-green-400">
                {formatPrice(takeProfit)}
              </div>
            </div>
          </div>

          {/* Expiration */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/10 border border-muted/20">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              Expires
            </div>
            <div className="text-sm font-medium text-muted-foreground">
              {formatTime(expirationTime)}
            </div>
          </div>

          {/* Confidence Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Confidence Level</span>
              <span className={`font-semibold ${getConfidenceColor()}`}>
                {confidence}%
              </span>
            </div>
            <div className="w-full bg-muted/20 rounded-full h-2 overflow-hidden">
              <motion.div 
                className={`h-full ${
                  confidence >= 80 ? 'bg-green-400' : 
                  confidence >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${confidence}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}