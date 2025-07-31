import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/auth-provider";
import { ThemeProvider } from "../components/theme-context";
import PremiumNavigation from "@/components/PremiumNavigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Signal Platform - Advanced Multi-Agent Financial Analysis",
  description: "Cutting-edge AI-powered trading signals using multi-agent analysis for stocks, crypto, and forex markets.",
  keywords: "AI trading, financial analysis, stock predictions, crypto signals, forex analysis, multi-agent AI",
  authors: [{ name: "AI Signal Platform" }],
  openGraph: {
    title: "AI Signal Platform",
    description: "Advanced multi-agent financial analysis powered by cutting-edge AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider>
          <AuthProvider>
            <div className="relative min-h-screen">
              {/* Premium Responsive Navigation */}
              <PremiumNavigation />

              {/* Main Content */}
              <main className="flex-1">
                {children}
              </main>

              {/* Premium Footer */}
              <footer className="glass-premium border-t border-white/10 shadow-premium">
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/5 to-black/20" />
                <div className="relative max-w-screen-2xl mx-auto px-6 py-12">
                  {/* Main Footer Content */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand Section */}
                    <div className="md:col-span-2">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor"/>
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold premium-gradient-text">AI Signal Platform</h3>
                          <p className="text-xs text-blue-300 font-medium tracking-wide uppercase">Premium Trading Intelligence</p>
                        </div>
                      </div>
                      <p className="text-gray-300 text-base leading-relaxed max-w-md">
                        World-class AI-powered trading intelligence with 6-agent sequential analysis. 
                        Experience institutional-grade insights with full transparency.
                      </p>
                    </div>
                    
                    {/* Product Links */}
                    <div>
                      <h4 className="text-white font-bold text-lg mb-4">Product</h4>
                      <div className="space-y-3">
                        <a href="/dashboard" className="block text-gray-300 hover:text-blue-300 transition-colors duration-200">Dashboard</a>
                        <a href="/demo" className="block text-gray-300 hover:text-blue-300 transition-colors duration-200">Live Demo</a>
                        <a href="#research" className="block text-gray-300 hover:text-blue-300 transition-colors duration-200">Research</a>
                        <a href="#api" className="block text-gray-300 hover:text-blue-300 transition-colors duration-200">API Access</a>
                      </div>
                    </div>
                    
                    {/* Company Links */}
                    <div>
                      <h4 className="text-white font-bold text-lg mb-4">Company</h4>
                      <div className="space-y-3">
                        <a href="/about" className="block text-gray-300 hover:text-blue-300 transition-colors duration-200">About</a>
                        <a href="#careers" className="block text-gray-300 hover:text-blue-300 transition-colors duration-200">Careers</a>
                        <a href="#contact" className="block text-gray-300 hover:text-blue-300 transition-colors duration-200">Contact</a>
                        <a href="#blog" className="block text-gray-300 hover:text-blue-300 transition-colors duration-200">Blog</a>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom Section */}
                  <div className="pt-8 border-t border-white/10">
                    <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                      {/* Copyright */}
                      <div className="flex items-center space-x-4">
                        <span className="text-gray-400 text-sm">
                          © 2024 <span className="golden-gradient-text font-bold">AI Signal Platform</span>. All rights reserved.
                        </span>
                      </div>
                      
                      {/* Legal Links */}
                      <div className="flex items-center space-x-6 text-sm">
                        <a href="#privacy" className="text-gray-400 hover:text-blue-300 transition-colors duration-200 font-medium">Privacy Policy</a>
                        <a href="#terms" className="text-gray-400 hover:text-blue-300 transition-colors duration-200 font-medium">Terms of Service</a>
                        <a href="#support" className="text-gray-400 hover:text-blue-300 transition-colors duration-200 font-medium">Support</a>
                      </div>
                      
                      {/* Social Links */}
                      <div className="flex items-center space-x-4">
                        <a href="https://twitter.com/" target="_blank" rel="noopener" className="w-10 h-10 rounded-lg glass-light border border-white/10 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:border-blue-500/30 transition-all duration-300 group" aria-label="Twitter">
                          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" className="group-hover:scale-110 transition-transform">
                            <path d="M22 5.924c-.793.352-1.645.59-2.54.697a4.48 4.48 0 0 0 1.965-2.475 8.94 8.94 0 0 1-2.828 1.08A4.48 4.48 0 0 0 12.03 9.03c0 .35.04.69.115 1.016-3.72-.187-7.02-1.97-9.23-4.68a4.48 4.48 0 0 0-.606 2.254c0 1.555.792 2.927 2.002 3.73-.735-.023-1.426-.225-2.03-.56v.057c0 2.173 1.545 3.987 3.594 4.4-.376.104-.773.16-1.182.16-.29 0-.567-.027-.84-.08.568 1.77 2.217 3.06 4.175 3.09A8.98 8.98 0 0 1 2 19.07a12.67 12.67 0 0 0 6.88 2.017c8.26 0 12.78-6.84 12.78-12.77 0-.195-.004-.39-.013-.583A9.1 9.1 0 0 0 24 4.59a8.98 8.98 0 0 1-2.6.71Z"/>
                          </svg>
                        </a>
                        <a href="https://linkedin.com/" target="_blank" rel="noopener" className="w-10 h-10 rounded-lg glass-light border border-white/10 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:border-blue-500/30 transition-all duration-300 group" aria-label="LinkedIn">
                          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" className="group-hover:scale-110 transition-transform">
                            <path d="M7.5 8.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm-1 2.25h2V18h-2v-7.25ZM10.75 11.25h1.92v.92h.03c.27-.5.93-1.03 1.91-1.03 2.04 0 2.42 1.34 2.42 3.08V18h-2v-3.25c0-.77-.01-1.76-1.08-1.76-1.08 0-1.25.84-1.25 1.7V18h-2v-6.75Z"/>
                          </svg>
                        </a>
                        <a href="https://github.com/" target="_blank" rel="noopener" className="w-10 h-10 rounded-lg glass-light border border-white/10 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:border-blue-500/30 transition-all duration-300 group" aria-label="GitHub">
                          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" className="group-hover:scale-110 transition-transform">
                            <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.66-.22.66-.48 0-.24-.01-.87-.01-1.7-2.78.6-3.37-1.34-3.37-1.34-.45-1.15-1.1-1.46-1.1-1.46-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.8c.85.004 1.71.11 2.51.32 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.16.58.67.48A10.01 10.01 0 0 0 22 12c0-5.52-4.48-10-10-10Z"/>
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </footer>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
