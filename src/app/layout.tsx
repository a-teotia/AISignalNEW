import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/auth-provider";
import UserNav from "@/components/user-nav";
import ThemeToggle from "../components/theme-toggle";
import { ThemeProvider } from "../components/theme-context";
import { Button } from "@/components/ui/button";

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
              {/* Navigation Header */}
              <header className="sticky top-0 z-50 w-full bg-background/95 border-b border-border shadow-lg transition-colors backdrop-blur supports-[backdrop-filter]:bg-background/80">
                <div className="max-w-screen-2xl mx-auto flex h-16 items-center justify-between px-4 md:px-8">
                  {/* Logo */}
                  <a href="/" className="font-extrabold text-2xl tracking-tight text-black dark:text-white select-none flex items-center h-full" style={{letterSpacing:'-0.03em'}}>
                    AI SIGNAL
                  </a>
                  {/* Navigation */}
                  <nav className="hidden md:flex gap-8 text-base font-medium text-black dark:text-white h-full items-center">
                    <a href="/about" className="hover:text-[color:var(--gold)] focus-visible:text-[color:var(--gold)] underline-offset-4 transition-colors px-2 py-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]">About</a>
                    <a href="#product" className="hover:text-[color:var(--gold)] focus-visible:text-[color:var(--gold)] underline-offset-4 transition-colors px-2 py-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]">Product</a>
                    <a href="#research" className="hover:text-[color:var(--gold)] focus-visible:text-[color:var(--gold)] underline-offset-4 transition-colors px-2 py-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]">Research</a>
                    <a href="#learn" className="hover:text-[color:var(--gold)] focus-visible:text-[color:var(--gold)] underline-offset-4 transition-colors px-2 py-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]">Learn</a>
                    <a href="#news" className="hover:text-[color:var(--gold)] focus-visible:text-[color:var(--gold)] underline-offset-4 transition-colors px-2 py-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]">News</a>
                  </nav>
                  {/* CTA + Theme/User */}
                  <div className="flex items-center gap-4 ml-2">
                    <Button
                      asChild
                      size="lg"
                      className="bg-black dark:bg-white text-white dark:text-black rounded-xl font-semibold shadow hover:bg-[color:var(--gold)] hover:text-black dark:hover:bg-[color:var(--gold)] dark:hover:text-black transition-colors text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)] px-6 py-2"
                    >
                      <a href="/auth/signin">
                        Try Demo
                      </a>
                    </Button>
                    <ThemeToggle />
                    <UserNav />
                  </div>
                </div>
              </header>

              {/* Main Content */}
              <main className="flex-1">
                {children}
              </main>

              {/* Footer */}
              <footer className="border-t-2 border-[#FFD700] bg-[#111] shadow-xl">
                <div className="container flex flex-col md:flex-row h-auto md:h-20 max-w-screen-2xl items-center justify-between px-4 py-4 md:py-0 gap-4 md:gap-0">
                  <div className="flex items-center gap-4 text-sm text-white/80">
                    <span className="tracking-wide">© 2024 <span className="gold-accent font-bold">AI Signal Platform</span>. All rights reserved.</span>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <a href="#" className="hover:text-[#FFD700] transition-colors font-semibold">Privacy</a>
                    <a href="#" className="hover:text-[#FFD700] transition-colors font-semibold">Terms</a>
                    <a href="#" className="hover:text-[#FFD700] transition-colors font-semibold">Support</a>
                    <span className="hidden md:inline-block w-px h-6 bg-[#FFD700]/30 mx-2" />
                    <a href="https://twitter.com/" target="_blank" rel="noopener" className="text-white hover:text-[#FFD700] transition-colors" aria-label="Twitter">
                      <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M22 5.924c-.793.352-1.645.59-2.54.697a4.48 4.48 0 0 0 1.965-2.475 8.94 8.94 0 0 1-2.828 1.08A4.48 4.48 0 0 0 12.03 9.03c0 .35.04.69.115 1.016-3.72-.187-7.02-1.97-9.23-4.68a4.48 4.48 0 0 0-.606 2.254c0 1.555.792 2.927 2.002 3.73-.735-.023-1.426-.225-2.03-.56v.057c0 2.173 1.545 3.987 3.594 4.4-.376.104-.773.16-1.182.16-.29 0-.567-.027-.84-.08.568 1.77 2.217 3.06 4.175 3.09A8.98 8.98 0 0 1 2 19.07a12.67 12.67 0 0 0 6.88 2.017c8.26 0 12.78-6.84 12.78-12.77 0-.195-.004-.39-.013-.583A9.1 9.1 0 0 0 24 4.59a8.98 8.98 0 0 1-2.6.71Z" fill="#FFD700"/></svg>
                    </a>
                    <a href="https://linkedin.com/" target="_blank" rel="noopener" className="text-white hover:text-[#FFD700] transition-colors" aria-label="LinkedIn">
                      <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" fill="#FFD700" fillOpacity="0.13"/><path d="M7.5 8.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm-1 2.25h2V18h-2v-7.25ZM10.75 11.25h1.92v.92h.03c.27-.5.93-1.03 1.91-1.03 2.04 0 2.42 1.34 2.42 3.08V18h-2v-3.25c0-.77-.01-1.76-1.08-1.76-1.08 0-1.25.84-1.25 1.7V18h-2v-6.75Z" fill="#FFD700"/></svg>
                    </a>
                    <a href="https://github.com/" target="_blank" rel="noopener" className="text-white hover:text-[#FFD700] transition-colors" aria-label="GitHub">
                      <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#FFD700" fillOpacity="0.13"/><path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.66-.22.66-.48 0-.24-.01-.87-.01-1.7-2.78.6-3.37-1.34-3.37-1.34-.45-1.15-1.1-1.46-1.1-1.46-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.8c.85.004 1.71.11 2.51.32 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.16.58.67.48A10.01 10.01 0 0 0 22 12c0-5.52-4.48-10-10-10Z" fill="#FFD700"/></svg>
                    </a>
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
