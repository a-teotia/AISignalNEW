'use client';
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession, signIn } from "next-auth/react";
import { motion } from "framer-motion";

export default function DemoPage() {
  const { data: session } = useSession();
  const [symbol, setSymbol] = useState("");
  const [timeframe, setTimeframe] = useState("1day");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/multi-predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, timeframe }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Prediction failed");
      } else {
        setResult(data.result);
      }
    } catch (err) {
      setError("Prediction failed");
    }
    setLoading(false);
  };

  return (
    <section className="section flex flex-col items-center justify-center min-h-[80vh] text-center">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="w-full max-w-2xl mx-auto">
        <Card className="glass card-hover">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold gradient-text drop-shadow">Demo: Market Analysis</CardTitle>
            <CardDescription className="text-white/80 font-medium">
              Try AI-powered predictions for any symbol. No signup required for your first prediction!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAnalyze} className="flex flex-col gap-6">
              <Input
                placeholder="Enter stock symbol (e.g., AAPL, TSLA, CBA.AX)"
                value={symbol}
                onChange={e => setSymbol(e.target.value.toUpperCase())}
                required
                className="text-lg px-4 py-3 rounded-lg bg-white/10 border border-white/10"
              />
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-full bg-white/10 border border-white/10 text-lg rounded-lg">
                  <SelectValue placeholder="Select Timeframe" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 text-white border border-gray-700">
                  <SelectItem value="1day">1 Day</SelectItem>
                  <SelectItem value="1week">1 Week</SelectItem>
                  <SelectItem value="1month">1 Month</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" className="btn-primary text-lg py-3 rounded-lg" disabled={loading}>
                {loading ? "Analyzing..." : "Get AI Predictions"}
              </Button>
            </form>
            {error && <div className="mt-4 text-red-400 font-semibold">{error}</div>}
            {result && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mt-8 p-6 rounded-xl bg-white/5 border border-white/10 shadow-lg">
                <h3 className="text-xl font-bold gradient-text mb-2">Prediction Result</h3>
                <div className="text-white/90 mb-2">
                  <span className="font-semibold">Direction:</span> {result.finalPrediction?.direction || "-"}
                </div>
                <div className="text-white/90 mb-2">
                  <span className="font-semibold">Confidence:</span> {result.confidence ? `${result.confidence}%` : "-"}
                </div>
                <div className="text-white/80 text-sm mb-2">
                  <span className="font-semibold">Reasoning:</span> {result.agents?.synth?.data?.reasoning?.chainOfThought || "-"}
                </div>
                {!session && (
                  <div className="mt-6 p-4 bg-blue-900/30 rounded-lg border border-blue-400/20 text-blue-100 text-center">
                    <div className="font-bold mb-2">Want unlimited predictions and full features?</div>
                    <Button onClick={() => signIn()} className="btn-primary px-6 py-2 rounded-lg text-base font-semibold">Sign Up Free</Button>
                  </div>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
} 