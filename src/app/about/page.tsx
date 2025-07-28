import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-[#181818] via-[#232323] to-[#111] flex flex-col items-center justify-center py-20 px-4">
      {/* Gold Wave Divider */}
      <div className="glass max-w-3xl w-full mx-auto rounded-2xl border-2 border-[#FFD700]/30 shadow-xl p-10 flex flex-col items-center text-center animate-fade-in-up card-hover" style={{boxShadow: '0 4px 32px #FFD70022, 0 1.5px 0 #FFD70044'}}>
        <h1 className="text-4xl md:text-5xl font-extrabold gradient-text mb-6 leading-tight drop-shadow-lg font-serif">About <span className="gold-accent">AI Signal Platform</span></h1>
        <div className="text-gray-200 text-lg md:text-xl mb-8 font-sans">
          AI Signal Platform is a next-generation <span className="text-[#FFD700] font-semibold">SaaS (Software as a Service)</span> solution for financial market intelligence. Delivered entirely via the cloud, our platform empowers traders, funds, and institutions to access advanced AI-driven analytics, real-time predictions, and actionable insights—anytime, anywhere.<br/><br/>
          With seamless scalability, robust security, and continuous updates, AI Signal Platform eliminates the need for complex infrastructure or manual data wrangling. Users benefit from:
        </div>
        <ul className="list-disc list-inside text-left mb-8 text-base md:text-lg text-white/90 max-w-xl mx-auto">
          <li>Instant access to multi-agent AI models for market prediction and risk analysis</li>
          <li>Real-time and historical data analytics, all in one dashboard</li>
          <li>Collaborative features for teams and institutions</li>
          <li>Cloud-based reliability, security, and zero maintenance overhead</li>
        </ul>
        <div className="text-gray-100 text-lg md:text-xl mb-10 font-sans">
          Whether you're a solo trader or a global fund, our SaaS platform adapts to your needs—helping you stay ahead of the curve in today's fast-moving markets.
        </div>
        <Button className="bg-[#FFD700] text-black px-8 py-3 rounded-xl font-bold shadow hover:bg-[#ffe066] transition text-lg">Get to Know Us</Button>
      </div>
    </div>
  );
} 