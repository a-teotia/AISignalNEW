import { NextResponse } from "next/server";
import { db } from "@/lib/database";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const { symbol, predictionDate, useSequential } = await req.json();

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
  }

  // Get user session
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user_id = session.user.email;

  // If sequential analysis is requested, redirect to the new system
  if (useSequential) {
    try {
      const { SequentialAgentOrchestrator } = await import("@/lib/agents/sequential-agent-orchestrator");
      const orchestrator = new SequentialAgentOrchestrator();
      const result = await orchestrator.runSequentialAnalysis(symbol);
      
      // Save to database
      const predictionId = db.savePredictionVerdict({
        user_id,
        symbol,
        prediction_date: predictionDate || new Date().toISOString().split('T')[0],
        verdict: result.finalVerdict.direction === 'BUY' ? 'UP' : result.finalVerdict.direction === 'SELL' ? 'DOWN' : 'NEUTRAL',
        confidence: result.finalVerdict.confidence,
        reasoning: result.finalVerdict.reasoning,
        market_context: JSON.stringify({
          type: 'sequential_analysis',
          executiveSummary: result.executiveSummary,
          allCitations: result.allCitations,
          agentChain: result.agentChain,
          processingTime: result.totalProcessingTime
        })
      });

      return NextResponse.json({
        summary: result.executiveSummary,
        prediction: {
          id: predictionId,
          verdict: result.finalVerdict.direction === 'BUY' ? 'UP' : result.finalVerdict.direction === 'SELL' ? 'DOWN' : 'NEUTRAL',
          confidence: result.finalVerdict.confidence,
          reasoning: result.finalVerdict.reasoning
        },
        sequentialAnalysis: {
          priceTarget: result.finalVerdict.priceTarget,
          timeHorizon: result.finalVerdict.timeHorizon,
          risk: result.finalVerdict.risk,
          keyRisks: result.keyRisks,
          catalysts: result.catalysts,
          citedSources: result.allCitations,
          agentChain: result.agentChain,
          processingTime: result.totalProcessingTime
        }
      });
    } catch (error) {
      console.error("Sequential analysis error:", error);
      // Fall back to legacy system
    }
  }

  try {
    // Step 1: Fetch market context from Perplexity
    const perplexityRes = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "user",
            content: `Give me a short market news overview for ${symbol}. Focus on trading sentiment.`,
          },
        ],
      }),
    });

    const text = await perplexityRes.text();
    console.log("🔍 Perplexity raw text:", text);

    let perplexityJson;
    try {
      perplexityJson = JSON.parse(text);
    } catch {
      console.error("❌ Failed to parse Perplexity response as JSON.");
      return NextResponse.json({ summary: "Perplexity returned invalid response." });
    }

    const rawContext = perplexityJson?.choices?.[0]?.message?.content || "No info found.";

    // Step 2: Ask OpenAI to summarize that info
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content: "You are a helpful trading assistant for beginners.",
          },
          {
            role: "user",
            content: `Summarize this for a trader: ${rawContext}`,
          },
        ],
      }),
    });

    const openaiJson = await openaiRes.json();
    const summary = openaiJson?.choices?.[0]?.message?.content || "Sentiment unavailable.";

    // Step 3: Generate prediction verdict based on sentiment analysis
    const verdict = await generateVerdict(summary, symbol);
    
    // Step 4: Save prediction to database
    const predictionId = db.savePredictionVerdict({
      user_id,
      symbol,
      prediction_date: predictionDate || new Date().toISOString().split('T')[0],
      verdict: verdict.verdict,
      confidence: verdict.confidence,
      reasoning: verdict.reasoning,
      market_context: rawContext
    });

    return NextResponse.json({ 
      summary,
      prediction: {
        id: predictionId,
        verdict: verdict.verdict,
        confidence: verdict.confidence,
        reasoning: verdict.reasoning
      }
    });
  } catch (err) {
    console.error("Sentiment agent error:", err);
    return NextResponse.json({ summary: "Sentiment analysis failed." });
  }
}

// Helper function to generate verdict based on sentiment
async function generateVerdict(summary: string, symbol: string): Promise<{
  verdict: 'UP' | 'DOWN' | 'NEUTRAL';
  confidence: number;
  reasoning: string;
}> {
  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: `You are a trading analyst. Based on the market sentiment provided, generate a trading prediction for ${symbol}. 
            Respond with a JSON object containing:
            - "verdict": "UP", "DOWN", or "NEUTRAL"
            - "confidence": a number between 50-95 representing your confidence level
            - "reasoning": a brief explanation of your prediction (2-3 sentences)`,
          },
          {
            role: "user",
            content: `Market sentiment: ${summary}`,
          },
        ],
      }),
    });

    const openaiJson = await openaiRes.json();
    const response = openaiJson?.choices?.[0]?.message?.content || "{}";
    
    try {
      const parsed = JSON.parse(response);
      return {
        verdict: parsed.verdict || 'NEUTRAL',
        confidence: Math.min(95, Math.max(50, parsed.confidence || 70)),
        reasoning: parsed.reasoning || 'Insufficient data for confident prediction.'
      };
    } catch {
      // Fallback to simple sentiment analysis
      const lowerSummary = summary.toLowerCase();
      let verdict: 'UP' | 'DOWN' | 'NEUTRAL' = 'NEUTRAL';
      let confidence = 60;
      
      if (lowerSummary.includes('bullish') || lowerSummary.includes('positive') || 
          lowerSummary.includes('up') || lowerSummary.includes('gain') || 
          lowerSummary.includes('rise') || lowerSummary.includes('strong')) {
        verdict = 'UP';
        confidence = 75;
      } else if (lowerSummary.includes('bearish') || lowerSummary.includes('negative') || 
                 lowerSummary.includes('down') || lowerSummary.includes('loss') || 
                 lowerSummary.includes('fall') || lowerSummary.includes('weak')) {
        verdict = 'DOWN';
        confidence = 75;
      }
      
      return {
        verdict,
        confidence,
        reasoning: `Based on sentiment analysis: ${summary.substring(0, 200)}...`
      };
    }
  } catch (error) {
    console.error("Error generating verdict:", error);
    return {
      verdict: 'NEUTRAL',
      confidence: 50,
      reasoning: 'Unable to generate prediction due to technical issues.'
    };
  }
}
