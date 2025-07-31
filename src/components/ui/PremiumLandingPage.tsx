"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Target, BarChart3, Zap, TrendingUp, Users, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PremiumLandingPage() {
  const features = [
    {
      icon: Activity,
      title: "Real-Time Analysis",
      description: "Live market data processed by 6 AI agents",
      gradient: "from-blue-500/20 to-indigo-500/20"
    },
    {
      icon: Target,
      title: "Precision Trading",
      description: "87.5% accuracy with transparent reasoning",
      gradient: "from-emerald-500/20 to-green-500/20"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Deep market insights and trend analysis",
      gradient: "from-purple-500/20 to-violet-500/20"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade security and data protection",
      gradient: "from-amber-500/20 to-orange-500/20"
    }
  ];

  const stats = [
    { label: "Active Traders", value: "10,000+", icon: Users },
    { label: "Accuracy Rate", value: "87.5%", icon: Target },
    { label: "Signals Daily", value: "500+", icon: TrendingUp },
    { label: "Response Time", value: "<2s", icon: Clock }
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
        
        <div className="absolute top-20 left-1/4 w-1 h-1 bg-blue-400/80 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-emerald-400/80 rounded-full animate-pulse delay-700 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-purple-400/80 rounded-full animate-pulse delay-1000 shadow-[0_0_10px_rgba(147,51,234,0.5)]" />
      </div>

      {/* Premium Navigation */}
      <nav className="relative z-10 glass-premium border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold premium-gradient-text">AI Signal Platform</h1>
                <p className="text-xs text-blue-300 font-medium tracking-wide uppercase">Premium Trading Intelligence</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="glass-light border-white/20 text-white hover:bg-white/10">
                Login
              </Button>
              <Button className="elite-card hover-glow">
                <span className="golden-gradient-text">Get Started</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h1 className="text-6xl md:text-8xl font-bold premium-gradient-text elite-glow-text animate-float">
              AI Signal Platform
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              World-class AI-powered trading intelligence with 6-agent sequential analysis
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Button size="lg" className="elite-card hover-glow px-8 py-4 text-lg animate-gradient">
                <span className="golden-gradient-text font-bold">Start Trading</span>
              </Button>
              <Button size="lg" variant="outline" className="glass-premium border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg">
                Watch Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="premium-card p-6 text-center hover-lift"
                >
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-3xl font-bold premium-gradient-text mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold premium-gradient-text mb-6">
              Premium Features
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Experience world-class trading intelligence with our advanced AI system
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className={`elite-card p-8 hover-lift bg-gradient-to-br ${feature.gradient}`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-700/50 to-gray-600/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                      <p className="text-gray-300 text-lg leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="glass-heavy elite-card p-12 animate-glow">
            <h2 className="text-4xl font-bold premium-gradient-text mb-6">
              Ready to Start Trading?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of traders using AI-powered intelligence
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Button size="lg" className="elite-card hover-glow px-12 py-4 text-lg animate-gradient">
                <span className="golden-gradient-text font-bold">Get Started Free</span>
              </Button>
              <Button size="lg" variant="outline" className="glass-premium border-white/30 text-white hover:bg-white/10 px-12 py-4 text-lg">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 glass-premium border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold premium-gradient-text">AI Signal Platform</span>
          </div>
          <p className="text-gray-400">
            © 2024 AI Signal Platform. All rights reserved. Premium trading intelligence.
          </p>
        </div>
      </footer>
    </div>
  );
}