import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Target, Shield, Zap, Users, Activity, TrendingUp } from "lucide-react";

export default function AboutPage() {
  const features = [
    {
      icon: Activity,
      title: "6-Agent AI System",
      description: "Sequential analysis with compound intelligence for superior accuracy"
    },
    {
      icon: TrendingUp,
      title: "Real-Time Analytics",
      description: "Live market data and instant predictions across all major assets"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade security with transparent, citation-backed analysis"
    },
    {
      icon: Users,
      title: "Collaborative Platform",
      description: "Built for solo traders and institutional teams alike"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b0d] via-[#0f1012] to-[#0a0b0d] relative overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-blue-500/8 via-blue-500/3 to-transparent" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-radial from-purple-500/12 via-purple-500/4 to-transparent" />
        <div className="absolute top-1/3 left-0 w-80 h-80 bg-gradient-radial from-emerald-500/10 via-emerald-500/3 to-transparent" />
      </div>

      <div className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-7xl font-bold premium-gradient-text mb-6">
              About <span className="golden-gradient-text">AI Signal Platform</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Next-generation <span className="text-blue-400 font-semibold">SaaS platform</span> delivering world-class 
              financial market intelligence powered by advanced AI
            </p>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16"
          >
            {/* Description */}
            <div className="space-y-8">
              <div className="elite-card p-8 hover-lift">
                <h2 className="text-3xl font-bold premium-gradient-text mb-6">Our Mission</h2>
                <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
                  <p>
                    AI Signal Platform revolutionizes financial market intelligence through our 
                    <span className="text-blue-400 font-semibold"> cloud-native SaaS solution</span>. 
                    We empower traders, funds, and institutions with advanced AI-driven analytics, 
                    real-time predictions, and actionable insights—accessible anywhere, anytime.
                  </p>
                  <p>
                    With seamless scalability, <span className="text-emerald-400 font-semibold">enterprise-grade security</span>, 
                    and continuous updates, our platform eliminates complex infrastructure needs while delivering 
                    institutional-quality analysis to every user.
                  </p>
                </div>
              </div>

              <div className="premium-card p-8 hover-lift">
                <h3 className="text-2xl font-bold text-white mb-4">Why Choose Us?</h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Whether you're a <span className="text-purple-400 font-semibold">solo trader</span> or a 
                  <span className="text-amber-400 font-semibold"> global fund</span>, our platform adapts 
                  to your needs—helping you stay ahead in today's fast-moving markets with transparency and precision.
                </p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="space-y-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className="premium-card p-6 hover-lift group"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                          {feature.title}
                        </h4>
                        <p className="text-gray-300 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Key Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-16"
          >
            <div className="elite-card p-8 text-center">
              <h3 className="text-3xl font-bold premium-gradient-text mb-8">Platform Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  "6-Agent Sequential AI",
                  "Real-Time Market Data",
                  "Citation-Backed Analysis", 
                  "Zero Infrastructure Needed"
                ].map((benefit, index) => (
                  <div key={benefit} className="glass-light rounded-xl p-4 border border-white/10 hover:border-blue-500/30 transition-colors">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mx-auto mb-3 animate-pulse" />
                    <p className="text-white font-semibold">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center"
          >
            <div className="elite-card p-12 animate-glow">
              <h3 className="text-3xl font-bold premium-gradient-text mb-6">
                Ready to Experience Premium AI Trading?
              </h3>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of traders already using our world-class platform
              </p>
              <Button className="elite-card hover-glow px-12 py-4 text-xl font-bold rounded-xl transition-all duration-300 hover:scale-105 animate-gradient">
                <span className="golden-gradient-text">Start Your Journey</span>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 