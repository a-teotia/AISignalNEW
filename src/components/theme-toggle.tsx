"use client";
import { useContext } from "react";
import { ThemeContext } from "./theme-context";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="w-10 h-10 flex items-center justify-center rounded-lg glass-light border border-white/20 hover:border-amber-500/50 hover:bg-amber-500/10 transition-all duration-300 hover:scale-105 group"
      type="button"
    >
      {theme === "dark" ? (
        // Sun icon
        <svg width="18" height="18" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-300 group-hover:rotate-45">
          <circle cx="13" cy="13" r="4" fill="url(#sunGradient)" />
          <g stroke="url(#sunGradient)" strokeWidth="2" strokeLinecap="round">
            <line x1="13" y1="3" x2="13" y2="5" />
            <line x1="13" y1="21" x2="13" y2="23" />
            <line x1="3" y1="13" x2="5" y2="13" />
            <line x1="21" y1="13" x2="23" y2="13" />
            <line x1="6.34" y1="6.34" x2="7.76" y2="7.76" />
            <line x1="18.24" y1="18.24" x2="19.66" y2="19.66" />
            <line x1="6.34" y1="19.66" x2="7.76" y2="18.24" />
            <line x1="18.24" y1="7.76" x2="19.66" y2="6.34" />
          </g>
          <defs>
            <linearGradient id="sunGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffd700" />
              <stop offset="100%" stopColor="#ffb347" />
            </linearGradient>
          </defs>
        </svg>
      ) : (
        // Moon icon
        <svg width="18" height="18" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-300 group-hover:-rotate-12">
          <path d="M20.5 16.5A8 8 0 0 1 9.5 5.5a7.5 7.5 0 1 0 11 11Z" fill="url(#moonGradient)" />
          <defs>
            <linearGradient id="moonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
      )}
    </button>
  );
} 