import { NextResponse } from "next/server";
import { db } from "@/lib/database";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { symbol, predictionDate, actualPrice, actualDate } = await req.json();

    if (!symbol || !predictionDate || !actualPrice || !actualDate) {
      return NextResponse.json({ 
        error: 'Missing required fields: symbol, predictionDate, actualPrice, actualDate' 
      }, { status: 400 });
    }

    // Get user session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user_id = session.user.email;

    // Get the original prediction
    const predictions = db.getPredictionsBySymbol(user_id, symbol, 100);
    const prediction = predictions.find(p => p.prediction_date === predictionDate);

    if (!prediction) {
      return NextResponse.json({ error: 'Prediction not found' }, { status: 404 });
    }

    // Calculate accuracy based on prediction vs actual movement
    // This is a simplified calculation - you might want to implement more sophisticated logic
    const predictedUp = prediction.verdict === 'UP';
    const predictedDown = prediction.verdict === 'DOWN';
    
    // For simplicity, we'll assume we're comparing against a baseline price
    // In a real implementation, you'd want to get the actual price at prediction time
    const baselinePrice = parseFloat(predictionDate) || 100; // Fallback value
    const actualUp = actualPrice > baselinePrice;
    const actualDown = actualPrice < baselinePrice;
    
    let accuracy = false;
    if (predictedUp && actualUp) accuracy = true;
    if (predictedDown && actualDown) accuracy = true;
    if (prediction.verdict === 'NEUTRAL') accuracy = actualPrice === baselinePrice;

    // Calculate profit/loss (simplified)
    const priceChange = actualPrice - baselinePrice;
    const profitLoss = accuracy ? Math.abs(priceChange) : -Math.abs(priceChange);

    // Update prediction with results
    const success = db.updatePredictionResults(
      user_id,
      symbol,
      predictionDate,
      actualPrice,
      actualDate,
      accuracy,
      profitLoss,
      `Actual price: ${actualPrice}, Baseline: ${baselinePrice}, Prediction was ${accuracy ? 'correct' : 'incorrect'}`
    );

    if (!success) {
      return NextResponse.json({ error: 'Failed to update prediction results' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      accuracy, 
      profitLoss,
      prediction: {
        verdict: prediction.verdict,
        confidence: prediction.confidence,
        reasoning: prediction.reasoning
      },
      actual: {
        price: actualPrice,
        date: actualDate,
        movement: actualUp ? 'UP' : actualDown ? 'DOWN' : 'NEUTRAL'
      },
      message: `Prediction results updated successfully. Accuracy: ${accuracy ? 'Correct' : 'Incorrect'}`
    });
  } catch (error) {
    console.error('Error updating prediction results:', error);
    return NextResponse.json({ error: 'Failed to update prediction results' }, { status: 500 });
  }
} 