"use client";
import { useContext } from "react";
import { ThemeContext } from "./theme-context";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="w-10 h-10 flex items-center justify-center rounded-full bg-transparent hover:bg-[#FFD700]/10 transition-colors"
      type="button"
    >
      {theme === "dark" ? (
        // Sun icon
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-300">
          <circle cx="13" cy="13" r="5" fill="#FFD700" />
          <g stroke="#FFD700" strokeWidth="2" strokeLinecap="round">
            <line x1="13" y1="2" x2="13" y2="5" />
            <line x1="13" y1="21" x2="13" y2="24" />
            <line x1="2" y1="13" x2="5" y2="13" />
            <line x1="21" y1="13" x2="24" y2="13" />
            <line x1="5.22" y1="5.22" x2="7.34" y2="7.34" />
            <line x1="18.66" y1="18.66" x2="20.78" y2="20.78" />
            <line x1="5.22" y1="20.78" x2="7.34" y2="18.66" />
            <line x1="18.66" y1="7.34" x2="20.78" y2="5.22" />
          </g>
        </svg>
      ) : (
        // Moon icon
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-300">
          <path d="M20.5 16.5A8 8 0 0 1 9.5 5.5a7.5 7.5 0 1 0 11 11Z" fill="#FFD700" />
        </svg>
      )}
    </button>
  );
} 