import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const curatedFacts = [
  "AI can analyze millions of data points in seconds—humans can't.",
  "AI models spot hidden patterns in markets missed by experts.",
  "Backtesting shows AI predictions outperform human traders by up to 20% in volatile markets.",
  "AI never sleeps—analyzing global news 24/7.",
  "AI can instantly process news, social sentiment, and technical signals for holistic decisions.",
  "Studies show AI-driven funds have higher Sharpe ratios than traditional funds.",
  "AI adapts to new data in real time, while human bias can slow decision-making.",
  "AI can backtest thousands of strategies in minutes, optimizing for risk and reward."
];

interface DynamicLoadingPromptProps {
  visible: boolean;
  facts?: string[];
}

export const DynamicLoadingPrompt: React.FC<DynamicLoadingPromptProps> = ({ visible, facts }) => {
  const [factIndex, setFactIndex] = useState(0);
  const factList = facts && facts.length > 0 ? facts : curatedFacts;

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % factList.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [visible, factList.length]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur-sm">
      <div className="relative glass rounded-2xl shadow-2xl max-w-md w-full p-10 flex flex-col items-center animate-fade-in-up border-2 border-[color:var(--gold)]">
        {/* Neural network loader animation */}
        <div className="mb-8">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="36" stroke="#38bdf8" strokeWidth="4" opacity="0.2" />
            <circle cx="40" cy="40" r="28" stroke="#0ea5e9" strokeWidth="2" opacity="0.3" />
            <g>
              <circle className="animate-pulse" cx="40" cy="20" r="6" fill="#38bdf8" />
              <circle className="animate-pulse delay-200" cx="60" cy="40" r="6" fill="#0ea5e9" />
              <circle className="animate-pulse delay-400" cx="40" cy="60" r="6" fill="#38bdf8" />
              <circle className="animate-pulse delay-600" cx="20" cy="40" r="6" fill="#0ea5e9" />
              <circle className="animate-pulse delay-800" cx="40" cy="40" r="4" fill="#f0f9ff" />
            </g>
            <polyline points="40,20 60,40 40,60 20,40 40,20" stroke="#38bdf8" strokeWidth="2" fill="none" opacity="0.5" />
            <polyline points="40,20 40,40 60,40" stroke="#0ea5e9" strokeWidth="2" fill="none" opacity="0.5" />
            <polyline points="40,40 40,60 20,40" stroke="#0ea5e9" strokeWidth="2" fill="none" opacity="0.5" />
          </svg>
        </div>
        <div className="text-xl font-bold text-white text-center mb-3 animate-fade-in-slow">
          AI is analyzing the markets…
        </div>
        <div className="text-base text-blue-50 text-center min-h-[60px] transition-all duration-500 mb-2 px-2" style={{ minHeight: 60 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={factList[factIndex]}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              {factList[factIndex]}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="absolute bottom-2 right-4 text-xs text-blue-200/60">AI Signal Platform</div>
      </div>
    </div>
  );
}; 