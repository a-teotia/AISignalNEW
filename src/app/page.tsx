"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

const agents = [
  { name: "Quant Edge Agent", label: "Quant", icon: (<svg width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="20" fill="#FFD700" opacity="0.15"/><path d="M12 28L28 12M12 12L28 28" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round"/></svg>), desc: "Advanced quantitative models for market prediction and risk analysis." },
  { name: "Sonar Research Agent", label: "Sentiment", icon: (<svg width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="20" fill="#FFD700" opacity="0.15"/><path d="M20 10v20M10 20h20" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round"/></svg>), desc: "Real-time news, sentiment, and deep web research for actionable insights." },
  { name: "Geo Sentience Agent", label: "Geo", icon: (<svg width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="20" fill="#FFD700" opacity="0.15"/><path d="M20 12a8 8 0 100 16 8 8 0 000-16z" stroke="#FFD700" strokeWidth="2.5"/></svg>), desc: "Geospatial and macroeconomic data for global market context." },
  { name: "Microstructure Agent", label: "Microstructure", icon: (<svg width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="20" fill="#FFD700" opacity="0.15"/><rect x="13" y="13" width="14" height="14" rx="3" stroke="#FFD700" strokeWidth="2.5"/></svg>), desc: "Order flow, liquidity, and market microstructure analytics." },
  { name: "ML Agent", label: "ML", icon: (<svg width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="20" fill="#FFD700" opacity="0.15"/><path d="M12 28L20 12L28 28" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round"/></svg>), desc: "Machine learning models for adaptive, data-driven predictions." },
  { name: "Synth Oracle Agent", label: "Synthesis", icon: (<svg width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="20" fill="#FFD700" opacity="0.15"/><path d="M20 10a10 10 0 100 20 10 10 0 000-20z" stroke="#FFD700" strokeWidth="2.5"/></svg>), desc: "Synthesizes signals from all agents for a unified market verdict." }
];

const poweredBy = [
  {
    name: "Deepseek",
    logo: (
      <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="19" cy="19" r="19" fill="#18181B" />
        <path d="M19 8L28 30H10L19 8Z" fill="#FFD700" />
        <circle cx="19" cy="19" r="7" fill="#fff" fillOpacity="0.12" />
      </svg>
    ),
  },
  {
    name: "ChatGPT",
    logo: (
      <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="19" cy="19" r="19" fill="#18181B" />
        <path d="M19 11c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M19 27c-4.418 0-8-3.582-8-8s3.582-8 8-8" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="19" cy="19" r="6" fill="#22C55E" fillOpacity="0.12" />
      </svg>
    ),
  },
  {
    name: "Perplexity",
    logo: (
      <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="19" cy="19" r="19" fill="#18181B" />
        <path d="M15 26V12h5.5a4 4 0 1 1 0 8H15" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="19" cy="19" r="6" fill="#60A5FA" fillOpacity="0.12" />
      </svg>
    ),
  },
  {
    name: "SignalAI",
    logo: (
      <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="19" cy="19" r="19" fill="#18181B" />
        <path d="M19 11v16M11 19h16" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="19" cy="19" r="6" stroke="#FFD700" strokeWidth="2" />
        <circle cx="19" cy="19" r="2" fill="#FFD700" />
      </svg>
    ),
  },
];

const testimonials = [
  { quote: "AI Signal's platform gave us an edge in the market we've never had before.", name: "Jane Doe", title: "Portfolio Manager, Alpha Capital" },
  { quote: "The multi-agent system is like having a team of quant analysts working 24/7.", name: "John Smith", title: "Lead Quant, FinTech Innovations" },
  { quote: "Incredible insights, actionable signals, and beautiful UI.", name: "Emily Chen", title: "Retail Trader" },
];

const articles = [
  { title: "How AI Agents Are Changing Finance", date: "May 2024", summary: "Explore the impact of multi-agent AI on modern trading strategies.", link: "#" },
  { title: "The Power of Real-Time Sentiment Analysis", date: "April 2024", summary: "Why real-time news and sentiment matter for market prediction.", link: "#" },
  { title: "Geospatial Data: The Next Frontier", date: "March 2024", summary: "How location-based data is giving traders a new edge.", link: "#" },
];

export default function LandingPage() {
  const { status } = useSession();
  const router = useRouter();
  const heroBgRef = useRef<HTMLDivElement>(null);
  const waveRefs = useRef<(SVGSVGElement | null)[]>([]);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const visibleCount = isMobile ? 1 : 3;
  const handlePrev = () => setTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  const handleNext = () => setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
  const visibleTestimonials = testimonials.slice(testimonialIndex, testimonialIndex + visibleCount).concat(
    testimonialIndex + visibleCount > testimonials.length
      ? testimonials.slice(0, (testimonialIndex + visibleCount) % testimonials.length)
      : []
  );

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  useEffect(() => {
    // Parallax for hero animated background
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          if (heroBgRef.current) {
            heroBgRef.current.style.transform = `translateY(${scrollY * 0.10}px)`;
          }
          waveRefs.current.forEach((el, i) => {
            if (el) {
              (el as SVGSVGElement).style.transform = `translateX(${Math.sin(scrollY / 220 + i) * 10}px)`;
            }
          });
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

    return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#181818] via-[#232323] to-[#111111] flex flex-col relative">
      <div className="noise-bg" />
      {/* Hero Section */}
      <section className="relative w-full min-h-[90vh] flex flex-col justify-center items-center bg-gradient-to-br from-[#181818] via-[#232323] to-[#111111] overflow-hidden">
        {/* Animated Gold SVG Mesh/Wave Background */}
        <div className="hero-animate-bg" ref={heroBgRef} style={{ willChange: 'transform' }} />
        {/* Subtle Circuit Pattern Overlay */}
        <svg className="absolute inset-0 w-full h-full z-0 opacity-15 pointer-events-none" viewBox="0 0 1440 700" fill="none" preserveAspectRatio="none">
          <g stroke="#FFD700" strokeWidth="1.2" opacity="0.13">
            <rect x="120" y="180" width="320" height="180" rx="18" />
            <rect x="900" y="320" width="220" height="120" rx="16" />
            <rect x="600" y="100" width="320" height="180" rx="18" />
            <path d="M440 250h40v-60h80" />
            <path d="M1000 400h60v-80h80" />
            <circle cx="300" cy="300" r="12" />
            <circle cx="1100" cy="400" r="10" />
            <circle cx="800" cy="200" r="8" />
            <path d="M200 500v60h200" />
            <path d="M1200 600v60h-200" />
          </g>
        </svg>
        {/* Radial Gradient Vignette */}
        <div className="absolute inset-0 z-0 pointer-events-none" style={{background: 'radial-gradient(ellipse at 50% 40%, rgba(24,24,24,0) 60%, #111 100%)'}} />
        <svg
          className="absolute top-0 left-0 w-full min-w-full max-w-none h-full z-0 animate-hero-wave"
          viewBox="0 0 1440 700"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ pointerEvents: 'none', left: 0, right: 0, width: '100vw', minWidth: '100%' }}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="gold-mesh" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFD700" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#bfa100" stopOpacity="0.08" />
            </linearGradient>
          </defs>
          <path d="M0 350 Q400 200 800 350 T1600 350 V700 H0V350Z" fill="url(#gold-mesh)"/>
          <path d="M0 400 Q600 300 1200 400 T2400 400 V700 H0V400Z" fill="#FFD700" opacity="0.07"/>
          <path d="M0 500 Q720 350 1440 500 T2880 500 V700 H0V500Z" fill="#FFD700" opacity="0.04"/>
          <g className="animate-hero-mesh-lines">
            <path d="M0 350 Q400 200 800 350 T1600 350" stroke="#FFD700" strokeWidth="2" opacity="0.12" />
            <path d="M0 400 Q600 300 1200 400 T2400 400" stroke="#FFD700" strokeWidth="2" opacity="0.08" />
          </g>
        </svg>
        <div className="relative z-10 flex flex-col items-center justify-center pt-32 pb-16 w-full max-w-3xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-extrabold gradient-text text-center mb-6 leading-tight drop-shadow-lg" style={{textShadow:'0 4px 32px #FFD70055, 0 1px 0 #fff'}}>Unlocking Financial Edge with <span className="gold-accent">AI-Powered Agents</span></h1>
          <p className="text-2xl md:text-3xl text-gray-200 text-center mb-10 max-w-2xl font-medium" style={{textShadow:'0 2px 12px #000'}}>Multi-agent AI platform for real-time market insights, predictive analytics, and actionable signals for traders and institutions.</p>
          <div className="flex flex-col md:flex-row gap-6 w-full justify-center mb-8">
            <Button size="lg" className="bg-[color:var(--gold)] text-black rounded-xl font-semibold shadow px-6 py-2 hover:bg-white hover:text-black transition-colors text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]" onClick={() => router.push("/auth/signup")}>Sign Up Free</Button>
          </div>
        </div>
      </section>

      {/* Double Gold Pulse Divider (bi-directional pulse) */}
        <div className="gold-pulse-divider animate-pulse-slow" style={{ animationDirection: 'reverse', animationDelay: '0.5s', marginTop: '-32px' }} />
      

      {/* Platforms/Agents Section */}
      <section className="relative w-full py-24 px-4 bg-[#111] border-t border-[#FFD700]/20 overflow-hidden">
        {/* Subtle Animated Gold Mesh/Wave Background - Full Width */}
        <svg className="absolute inset-0 w-full h-full z-0 opacity-60 animate-fade-in-up" viewBox="0 0 1440 420" fill="none" style={{pointerEvents:'none'}} preserveAspectRatio="none">
          <defs>
            <linearGradient id="agents-gold-mesh" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFD700" stopOpacity="0.13" />
              <stop offset="100%" stopColor="#bfa100" stopOpacity="0.07" />
            </linearGradient>
          </defs>
          <ellipse cx="720" cy="210" rx="650" ry="120" fill="url(#agents-gold-mesh)" />
          <path d="M0 210 Q360 80 720 210 T1440 210" stroke="#FFD700" strokeWidth="2" opacity="0.10" />
          <path d="M0 260 Q360 130 720 260 T1440 260" stroke="#FFD700" strokeWidth="2" opacity="0.07" />
        </svg>
        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold gradient-text tracking-wider mb-12 text-center font-serif">Our <span className="gold-accent">Agents</span></h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {agents.map((agent, i) => (
              <div
                key={agent.name}
                className="group glass border-2 border-[#FFD700]/50 rounded-3xl shadow-2xl p-10 flex flex-col items-center text-center transition-transform duration-300 card-hover animate-fade-in-up bg-black/60 hover:shadow-gold-glow hover:scale-[1.035]"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  boxShadow: '0 8px 40px #FFD70022, 0 2px 0 #FFD70044',
                  backdropFilter: 'blur(18px)',
                }}
                onMouseMove={e => {
                  const card = e.currentTarget;
                  const rect = card.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const centerX = rect.width / 2;
                  const centerY = rect.height / 2;
                  const rotateX = ((y - centerY) / centerY) * 6;
                  const rotateY = ((x - centerX) / centerX) * 6;
                  card.style.transform = `perspective(800px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg) scale(1.06)`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)';
                }}
              >
                <div className="mb-5">
                  {/* Custom gold line icons for each agent */}
                  <div className="drop-shadow-gold-glow animate-pulse-slow">
                  {(() => {
                    switch (agent.label) {
                      case "Quant":
                        return (
                          <svg width="60" height="60" viewBox="0 0 48 48" fill="none"><rect x="8" y="8" width="32" height="32" rx="10" stroke="#FFD700" strokeWidth="3.5"/><path d="M16 32L32 16" stroke="#FFD700" strokeWidth="3.5" strokeLinecap="round"/><path d="M16 16L32 32" stroke="#FFD700" strokeWidth="3.5" strokeLinecap="round"/></svg>
                        );
                      case "Sentiment":
                        return (
                          <svg width="60" height="60" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="16" stroke="#FFD700" strokeWidth="3.5"/><path d="M16 24h16" stroke="#FFD700" strokeWidth="3.5" strokeLinecap="round"/><path d="M24 16v16" stroke="#FFD700" strokeWidth="3.5" strokeLinecap="round"/></svg>
                        );
                      case "Geo":
                        return (
                          <svg width="60" height="60" viewBox="0 0 48 48" fill="none"><ellipse cx="24" cy="28" rx="12" ry="8" stroke="#FFD700" strokeWidth="3.5"/><circle cx="24" cy="20" r="8" stroke="#FFD700" strokeWidth="3.5"/></svg>
                        );
                      case "Microstructure":
                        return (
                          <svg width="60" height="60" viewBox="0 0 48 48" fill="none"><rect x="14" y="14" width="20" height="20" rx="6" stroke="#FFD700" strokeWidth="3.5"/><path d="M14 24h20" stroke="#FFD700" strokeWidth="3.5"/><path d="M24 14v20" stroke="#FFD700" strokeWidth="3.5"/></svg>
                        );
                      case "ML":
                        return (
                          <svg width="60" height="60" viewBox="0 0 48 48" fill="none"><path d="M12 36L24 12L36 36" stroke="#FFD700" strokeWidth="3.5" strokeLinecap="round"/><circle cx="24" cy="12" r="3" fill="#FFD700"/><circle cx="12" cy="36" r="3" fill="#FFD700"/><circle cx="36" cy="36" r="3" fill="#FFD700"/></svg>
                        );
                      case "Synthesis":
                        return (
                          <svg width="60" height="60" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="16" stroke="#FFD700" strokeWidth="3.5"/><circle cx="24" cy="24" r="8" stroke="#FFD700" strokeWidth="3.5"/><path d="M24 8v32" stroke="#FFD700" strokeWidth="3.5" strokeLinecap="round"/><path d="M8 24h32" stroke="#FFD700" strokeWidth="3.5" strokeLinecap="round"/></svg>
                        );
                      default:
                        return agent.icon;
                    }
                  })()}
                  </div>
                </div>
                <div className="mb-3"><span className="inline-block px-3 py-1 rounded-full bg-[#FFD700]/10 text-xs font-bold text-[#FFD700] border border-[#FFD700]/40">{agent.label}</span></div>
                <h3 className="text-2xl md:text-3xl font-extrabold gradient-text tracking-wide mb-2 font-serif">{agent.name}</h3>
                <p className="text-gray-200 text-base md:text-lg mb-2 font-sans">{agent.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gold Wave Divider */}
      

      {/* Testimonials Section */}
      <section className="relative w-full py-20 px-4 bg-black border-t border-[#FFD700]/20">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#FFD700] tracking-wider mb-8 text-center font-serif">What Our <span className="text-white">Users Say</span></h2>
        <div className="flex justify-center items-center gap-4 mb-8">
          <button onClick={handlePrev} className="rounded-full bg-[#FFD700]/20 hover:bg-[#FFD700]/40 p-2 transition"><svg width="28" height="28" fill="none"><path d="M18 6l-8 8 8 8" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round"/></svg></button>
          <div className="flex gap-8 w-full max-w-5xl overflow-x-auto scrollbar-hide">
            {visibleTestimonials.map((t, i) => (
              <div key={i} className="glass border-2 border-[#FFD700]/30 rounded-2xl shadow-lg p-8 flex flex-col items-center text-center animate-fade-in-up card-hover transition-transform duration-300 hover:shadow-gold-glow bg-[#181818] min-w-[320px] max-w-[400px] mx-auto">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-full bg-[#FFD700]/20 border-2 border-[#FFD700] flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-[#FFD700]">{t.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <svg width="32" height="32" fill="none" className="mb-2"><circle cx="16" cy="16" r="16" fill="#FFD700" opacity="0.10"/><path d="M8 16h16" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/></svg>
                <p className="text-white text-xl md:text-2xl mb-4 italic font-serif">“{t.quote}”</p>
                <div className="text-[#FFD700] font-bold text-lg">{t.name}</div>
                <div className="text-gray-400 text-sm">{t.title}</div>
              </div>
            ))}
          </div>
          <button onClick={handleNext} className="rounded-full bg-[#FFD700]/20 hover:bg-[#FFD700]/40 p-2 transition"><svg width="28" height="28" fill="none"><path d="M10 6l8 8-8 8" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round"/></svg></button>
        </div>
      </section>

      {/* Gold Wave Divider */}
      
      {/* Insights Section */}
      <section className="relative w-full py-20 px-4 bg-[#181818] border-t border-[#FFD700]/20 overflow-hidden">
        {/* Subtle Circuit Pattern Background */}
        <svg className="absolute inset-0 w-full h-full z-0 opacity-30 pointer-events-none" viewBox="0 0 1440 420" fill="none" preserveAspectRatio="none">
          <g stroke="#FFD700" strokeWidth="1.2" opacity="0.13">
            <rect x="60" y="60" width="320" height="180" rx="18" />
            <rect x="400" y="120" width="220" height="120" rx="16" />
            <rect x="700" y="80" width="320" height="180" rx="18" />
            <rect x="1100" y="160" width="220" height="120" rx="16" />
            <path d="M380 150h20v-40h60" />
            <path d="M620 180h80v-60h60" />
            <path d="M1020 220h80v-80h60" />
            <circle cx="180" cy="150" r="8" />
            <circle cx="900" cy="180" r="8" />
            <circle cx="1300" cy="220" r="8" />
            <circle cx="500" cy="200" r="6" />
            <circle cx="1200" cy="260" r="6" />
            <path d="M200 240v40h100" />
            <path d="M800 320v40h100" />
            <path d="M1400 320v40h-100" />
          </g>
        </svg>
        <h2 className="text-3xl md:text-4xl font-extrabold gradient-text tracking-wider mb-8 text-center font-serif">Latest <span className="gold-accent">Insights</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Featured (first) article */}
          <a href={articles[0].link} className="group glass border-2 border-[#FFD700] rounded-3xl shadow-2xl p-8 flex flex-col hover:shadow-gold-glow transition-colors animate-fade-in-up card-hover col-span-1 md:col-span-2 row-span-2 bg-black/70 relative min-h-[260px] md:min-h-[320px]">
            <div className="flex items-center gap-2 mb-2">
              <svg width="28" height="28" fill="none"><circle cx="14" cy="14" r="14" fill="#FFD700" opacity="0.18"/><path d="M7 14h14" stroke="#FFD700" strokeWidth="2"/></svg>
              <div className="text-[#FFD700] font-bold text-lg">{articles[0].date}</div>
              <span className="ml-3 px-3 py-1 rounded-full bg-[#FFD700]/20 text-xs font-bold text-[#FFD700] border border-[#FFD700]/40">Featured</span>
            </div>
            <div className="text-white text-2xl md:text-3xl font-extrabold mb-2 gradient-text font-serif">{articles[0].title}</div>
            <div className="text-gray-200 text-lg mb-4 font-sans">{articles[0].summary}</div>
            <span className="text-[#FFD700] font-bold group-hover:underline text-lg mt-auto">Read More →</span>
          </a>
          {/* Remaining articles */}
          {articles.slice(1).map((a, i) => (
            <a key={i} href={a.link} className="group glass border-2 border-[#FFD700]/30 rounded-2xl shadow-lg p-6 flex flex-col hover:shadow-gold-glow transition-colors animate-fade-in-up card-hover bg-black/60 min-h-[220px]">
              <div className="flex items-center gap-2 mb-2">
                <svg width="20" height="20" fill="none"><circle cx="10" cy="10" r="10" fill="#FFD700" opacity="0.13"/><path d="M5 10h10" stroke="#FFD700" strokeWidth="1.5"/></svg>
                <div className="text-[#FFD700] font-bold">{a.date}</div>
              </div>
              <div className="text-white text-lg font-semibold mb-2 gradient-text font-serif">{a.title}</div>
              <div className="text-gray-200 text-base mb-4 font-sans">{a.summary}</div>
              <span className="text-[#FFD700] font-bold group-hover:underline">Read More →</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
