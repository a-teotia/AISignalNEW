"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function PremiumModal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md' 
}: PremiumModalProps) {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Premium Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Premium Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className={`
                w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden
                glass-heavy elite-card
                shadow-premium
                animate-glow
              `}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Premium Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  <h2 className="text-2xl font-bold premium-gradient-text elite-glow-text">
                    {title}
                  </h2>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="
                    premium-card hover-glow border-white/20 text-white 
                    hover:bg-white/10 hover:border-white/30 rounded-xl
                    transition-all duration-300 hover:scale-105
                  "
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Premium Content */}
              <div className="p-6 overflow-y-auto premium-scrollbar">
                <div className="premium-card p-6 hover-lift">
                  {children}
                </div>
              </div>

              {/* Premium Footer Glow */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-blue-500/50 animate-gradient" />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// Usage Example:
export function ExampleUsage() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="elite-card hover-glow animate-gradient"
      >
        <span className="golden-gradient-text">Open Premium Modal</span>
      </Button>

      <PremiumModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Premium Modal Example"
        size="lg"
      >
        <div className="space-y-6">
          <p className="text-white text-lg">
            This modal uses the same premium design system as the dashboard!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="premium-card p-4 hover-lift">
              <h3 className="premium-gradient-text mb-2">Feature 1</h3>
              <p className="text-gray-300">Consistent styling everywhere</p>
            </div>
            
            <div className="premium-card p-4 hover-lift">
              <h3 className="premium-gradient-text mb-2">Feature 2</h3>
              <p className="text-gray-300">World-class design system</p>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button className="elite-card hover-glow">
              <span className="premium-gradient-text">Action 1</span>
            </Button>
            <Button className="glass-premium hover-lift">
              <span className="text-white">Action 2</span>
            </Button>
          </div>
        </div>
      </PremiumModal>
    </>
  );
}