"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import ThemeToggle from "./theme-toggle";
import UserNav from "./user-nav";

export default function PremiumNavigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-premium border-b border-white/10 shadow-premium transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/5 to-black/20" />
      <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          {/* Premium Logo - Responsive */}
          <a href="/" className="flex items-center space-x-2 sm:space-x-3 group hover:scale-105 transition-transform duration-300 flex-shrink-0">
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow duration-300">
              <svg width="16" height="16" className="sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="white"/>
              </svg>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-2xl font-bold premium-gradient-text tracking-tight select-none">
                AI SIGNAL
              </h1>
              <p className="text-xs text-blue-300 font-medium tracking-wide uppercase leading-none">Premium Platform</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-lg font-bold premium-gradient-text tracking-tight select-none">
                AI SIGNAL
              </h1>
            </div>
          </a>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <a href="/about" className="px-3 xl:px-4 py-2 text-sm xl:text-base text-white hover:text-blue-300 font-medium transition-all duration-300 rounded-lg hover:bg-white/10 border border-transparent hover:border-blue-500/30">
              About
            </a>
            <a href="/dashboard" className="px-3 xl:px-4 py-2 text-sm xl:text-base text-white hover:text-purple-300 font-medium transition-all duration-300 rounded-lg hover:bg-white/10 border border-transparent hover:border-purple-500/30">
              Dashboard
            </a>
          </nav>
          
          {/* Right Side Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Try Premium Button - Responsive */}
            <Button
              asChild
              size="sm"
              className="elite-card hover-glow px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-bold rounded-lg sm:rounded-xl shadow-lg transition-all duration-300 hover:scale-105 animate-gradient"
            >
              <a href="/auth/signin">
                <span className="golden-gradient-text hidden sm:inline">Try Premium</span>
                <span className="golden-gradient-text sm:hidden">Premium</span>
              </a>
            </Button>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={toggleMobileMenu}
              className="lg:hidden glass-light rounded-lg p-2 border border-white/10 hover:border-white/20 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              )}
            </button>
            
            {/* User Controls - Hidden on small screens */}
            <div className="hidden sm:flex items-center space-x-2">
              <div className="glass-light rounded-lg p-1 border border-white/10">
                <ThemeToggle />
              </div>
              <div className="glass-light rounded-lg border border-white/10">
                <UserNav />
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 glass-premium rounded-lg mt-2 border border-white/10 animate-slide-up">
              <a 
                href="/about" 
                className="block px-3 py-2 text-white hover:text-blue-300 font-medium transition-colors rounded-lg hover:bg-white/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </a>
              <a 
                href="/dashboard" 
                className="block px-3 py-2 text-white hover:text-purple-300 font-medium transition-colors rounded-lg hover:bg-white/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </a>
              <div className="border-t border-white/10 pt-3 mt-3">
                <div className="flex items-center justify-center space-x-3">
                  <div className="glass-light rounded-lg p-1 border border-white/10">
                    <ThemeToggle />
                  </div>
                  <div className="glass-light rounded-lg border border-white/10">
                    <UserNav />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}