"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Prediction type
interface Prediction {
  id: number;
  symbol: string;
  prediction_date: string;
  verdict: "UP" | "DOWN" | "NEUTRAL";
  confidence: number;
  reasoning: string;
}

export default function HistoryPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    const fetchPredictions = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/predictions?all=true");
        if (res.status === 401) {
          router.push("/auth/signin");
          return;
        }
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setPredictions(data.predictions || []);
      } catch (e) {
        console.error("Error fetching predictions:", e);
        setError("Failed to load predictions");
        setPredictions([]);
      }
      setLoading(false);
    };
    fetchPredictions();
  }, [session, status, router]);

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case "UP":
        return "#10b981";
      case "DOWN":
        return "#ef4444";
      default:
        return "#a3a3a3";
    }
  };

  if (status === "loading") {
    return (
      <div className="max-w-5xl mx-auto py-10 px-4">
        <div className="text-center text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to signin
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-white mb-8">Prediction History</h1>
      <Card className="bg-gray-850 animate-fade-in hover:shadow-lg hover:shadow-orange-400/20 transition duration-300">
        <CardContent className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-700 rounded text-red-300">
              {error}
            </div>
          )}
          <div className="overflow-x-auto max-h-[70vh]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-2 text-gray-400">Symbol</th>
                  <th className="text-left p-2 text-gray-400">Date</th>
                  <th className="text-left p-2 text-gray-400">Report</th>
                  <th className="text-left p-2 text-gray-400">Confidence</th>
                  <th className="text-left p-2 text-gray-400">Verdict</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="p-4 text-center text-gray-400">Loading...</td></tr>
                ) : predictions.length === 0 ? (
                  <tr><td colSpan={5} className="p-4 text-center text-gray-400">No predictions found.</td></tr>
                ) : (
                  predictions.map(prediction => (
                    <tr key={prediction.id} className="border-b border-gray-800">
                      <td className="p-2 text-gray-300 font-bold">{prediction.symbol}</td>
                      <td className="p-2 text-gray-300">{prediction.prediction_date}</td>
                      <td className="p-2 text-gray-300 max-w-xs truncate" title={prediction.reasoning}>{prediction.reasoning}</td>
                      <td className="p-2 text-gray-300">{prediction.confidence}%</td>
                      <td className="p-2">
                        <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: getVerdictColor(prediction.verdict) + '20', color: getVerdictColor(prediction.verdict) }}>{prediction.verdict}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 