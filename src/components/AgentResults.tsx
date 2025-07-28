"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AgentOutput } from "@/lib/types/prediction-types";
import { Tooltip } from "@/components/ui/tooltip";
import ReactMarkdown from "react-markdown";

interface AgentCardProps {
  title: string;
  agent: AgentOutput;
  color: string;
}

const agentAvatars: Record<string, string> = {
  blue: "🧠",
  green: "🌍",
  purple: "📊",
  orange: "🧩",
  cyan: "⛓️",
  indigo: "💧",
  pink: "📊",
  yellow: "🤖",
};

const agentDescriptions: Record<string, string> = {
  sonar: "Deep research & sentiment analysis from news, social media, and filings",
  geo: "Macroeconomic, political, and social factors affecting global markets",
  quant: "Technical indicators, patterns, and price action analysis",
  onchain: "Blockchain metrics, institutional flows, and network activity",
  flow: "ETF flows, options activity, and institutional money movement",
  microstructure: "Order book depth, liquidity analysis, and market structure",
  ml: "Machine learning predictions using historical patterns and seasonality",
  synth: "Final synthesis combining all agent signals for prediction",
};

const colorRing: Record<string, string> = {
  blue: "stroke-blue-400",
  green: "stroke-green-400",
  purple: "stroke-purple-400",
  orange: "stroke-orange-400",
  cyan: "stroke-cyan-400",
  indigo: "stroke-indigo-400",
  pink: "stroke-pink-400",
  yellow: "stroke-yellow-400",
};

function formatMetadataValue(value: any): string {
  if (Array.isArray(value)) {
    return value.join(", ");
  } else if (typeof value === "object" && value !== null) {
    return Object.entries(value)
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
      .join("; ");
  } else {
    return String(value);
  }
}

function getSourceLabel(src: string): string {
  if (src.includes('yahoo') || src.includes('asx.com')) return 'Yahoo Finance';
  if (src.includes('coingecko')) return 'CoinGecko';
  if (src.includes('binance')) return 'Binance';
  if (src.includes('bloomberg')) return 'Bloomberg';
  if (src.includes('reuters')) return 'Reuters';
  if (src.includes('cnbc')) return 'CNBC';
  if (src.includes('ml-analysis')) return 'ML Analysis';
  if (src.includes('orderbook')) return 'Orderbook';
  if (src.includes('tradingview')) return 'TradingView';
  if (src.includes('barchart')) return 'Barchart';
  if (src.includes('blockchain.info')) return 'Blockchain.info';
  if (src.includes('whale-alert')) return 'Whale Alert';
  if (src.includes('etfdb')) return 'ETFdb';
  if (src.includes('coinbase')) return 'Coinbase';
  if (src.includes('worldbank')) return 'World Bank';
  if (src.includes('financemagnates')) return 'Finance Magnates';
  if (src.includes('beincrypto')) return 'BeInCrypto';
  if (src.includes('companiesmarketcap')) return 'CompaniesMarketCap';
  if (src.includes('stockstotrade')) return 'StocksToTrade';
  return src.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

function dedupeSources(sources: string[]): string[] {
  const seen = new Set<string>();
  return sources.filter(src => {
    const label = getSourceLabel(src);
    if (seen.has(label)) return false;
    seen.add(label);
    return true;
  });
}

function AgentCard({ title, agent, color }: AgentCardProps) {
  const [showAllSources, setShowAllSources] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const confidence = Math.max(0, Math.min(100, agent.confidence || 0));
  const agentKey = title.toLowerCase() as keyof typeof agentDescriptions;
  const isVortexForge = agent.agent === 'VortexForge';

  // Parse citations for VortexForge
  let citations: string[] = [];
  if (isVortexForge) {
    if (agent.data?.citations && Array.isArray(agent.data.citations)) {
      citations = agent.data.citations;
    } else if (agent.data?.market_context) {
      try {
        const ctx = typeof agent.data.market_context === 'string' ? JSON.parse(agent.data.market_context) : agent.data.market_context;
        if (ctx?.citations && Array.isArray(ctx.citations)) citations = ctx.citations;
      } catch {}
    }
  } else {
    citations = agent.sources || [];
  }

  return (
    <>
      <Card className={`glass card-hover group relative overflow-hidden transition-all duration-300 animate-fade-in-up ${isVortexForge ? 'border-2 border-amber-400/60' : ''}`}>  
        <CardContent className="p-6 flex flex-col gap-3">
          {/* Agent avatar and title */}
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-r from-${color}-500/20 to-${color}-600/20 border border-${color}-400/30 flex items-center justify-center text-2xl shadow-lg`}>
              {agentAvatars[color] || '🌀'}
            </div>
            <h3 className="text-xl font-bold gradient-text tracking-tight flex-1">{title}</h3>
            {isVortexForge && (
              <span className="ml-2 px-2 py-0.5 rounded bg-amber-400/20 text-amber-500 text-xs font-semibold border border-amber-400/40">Deep Analysis</span>
            )}
            {/* Animated circular confidence bar with tooltip */}
            <Tooltip content="Model confidence in this analysis" side="left">
              <div className="relative w-12 h-12 cursor-help">
                <svg className="absolute top-0 left-0" width="48" height="48">
                  <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="none" />
                  <circle
                    cx="24" cy="24" r="20"
                    strokeDasharray={2 * Math.PI * 20}
                    strokeDashoffset={2 * Math.PI * 20 * (1 - confidence / 100)}
                    strokeWidth="4"
                    fill="none"
                    className={`transition-all duration-700 ${colorRing[color]}`}
                    style={{ strokeLinecap: 'round' }}
                  />
                </svg>
                <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${colorRing[color]?.replace('stroke-', 'text-') || 'text-amber-400'}`}>{confidence}%</span>
              </div>
            </Tooltip>
          </div>

          {/* Agent description */}
          <div className="text-sm text-muted-foreground mb-3 leading-relaxed">
            {isVortexForge ? 'LLM-powered deep analysis with real-time data context.' : agentDescriptions[agentKey]}
          </div>

          {/* Processing time */}
          <div className="text-xs text-muted-foreground/80 mb-2">
            <span className="font-semibold">Processing:</span> {agent.processingTime}ms
          </div>

          {/* Metadata as tags, improved formatting */}
          {agent.metadata && Object.keys(agent.metadata).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {Object.entries(agent.metadata).map(([key, value]) => (
                <span key={key} className="px-2 py-0.5 rounded bg-primary/10 text-xs text-primary border border-primary/20">
                  {key}: {formatMetadataValue(value)}
                </span>
              ))}
            </div>
          )}

          {/* View Details button */}
          <button
            className="mt-auto btn-secondary text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            onClick={() => setShowModal(true)}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            View Details
          </button>
        </CardContent>
        {/* Accent gradient border on hover */}
        <div className={`pointer-events-none absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-${color}-400/60 transition-all duration-300`}></div>
      </Card>
      {/* Modal Popup */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur-sm">
          <div className="glass rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative animate-fade-in-up mx-4 border-2 border-[color:var(--gold)]">
            <button
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-2xl font-bold transition-colors"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold gradient-text mb-4">{title} - Details</h3>
            <div className="space-y-4">
              {/* Reasoning and summary for VortexForge */}
              {isVortexForge && (
                <div className="mb-4">
                  <div className="font-semibold text-lg mb-2">Reasoning</div>
                  <div className="bg-black/10 rounded p-3 text-base text-foreground/90 border border-amber-400/30">
                    {agent.data?.reasoning || 'No reasoning provided.'}
                  </div>
                  <div className="flex gap-4 mt-4">
                    <div>
                      <div className="font-semibold">Support</div>
                      <div className="text-green-400">{agent.data?.supportLevel || '-'}</div>
                    </div>
                    <div>
                      <div className="font-semibold">Resistance</div>
                      <div className="text-red-400">{agent.data?.resistanceLevel || '-'}</div>
                    </div>
                  </div>
                </div>
              )}
              {/* Citations section */}
              <div>
                <div className="font-semibold mb-2">Citations / Sources</div>
                {citations.length > 0 ? (
                  <div className="space-y-2">
                    {citations.map((src, idx) => (
                      <a
                        key={idx}
                        href={src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-3 py-2 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20"
                      >
                        {src}
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground italic">No sources provided—please verify independently.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface AgentResultsProps {
  agents: Record<string, AgentOutput>;
}

export function AgentResults({ agents }: AgentResultsProps) {
  const agentConfigs = [
    { key: "sonar", title: "Sonar Research", color: "blue" },
    { key: "geo", title: "GeoSentience", color: "green" },
    { key: "quant", title: "QuantEdge", color: "purple" },
    { key: "onchain", title: "OnChain", color: "cyan" },
    { key: "flow", title: "Flow Analysis", color: "indigo" },
    { key: "microstructure", title: "Microstructure", color: "orange" },
    { key: "ml", title: "ML Agent", color: "yellow" },
    { key: "synth", title: "SynthOracle", color: "pink" },
    { key: "vortexforge", title: "VortexForge Deep Analysis", color: "amber" }, // new
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold gradient-text mb-4">AI Agent Analysis Results</h2>
        <p className="text-muted-foreground">Comprehensive market analysis from our specialized AI agents</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {agentConfigs.map((config) => {
          const agent = agents[config.key];
          if (!agent) return null;
          
          return (
            <AgentCard
              key={config.key}
              title={config.title}
              agent={agent}
              color={config.color}
            />
          );
        })}
      </div>
    </div>
  );
}
