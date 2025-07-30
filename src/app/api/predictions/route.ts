import { NextResponse } from "next/server";
import { db } from "@/lib/database";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const symbol = searchParams.get('symbol');

    // Get user session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user_id = session.user.email;

    // Use paginated method
    const { predictions, total } = db.getPaginatedPredictions(user_id, page, pageSize, symbol || undefined);

    return NextResponse.json({
      predictions,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    console.error('Error fetching predictions:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch predictions', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

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
    const predictions = db.getPredictionsBySymbol(user_id, symbol, 1);
    const prediction = predictions.find(p => p.prediction_date === predictionDate);

    if (!prediction) {
      return NextResponse.json({ error: 'Prediction not found' }, { status: 404 });
    }

    // Calculate accuracy and profit/loss
    const predictedUp = prediction.verdict === 'UP';
    const actualUp = actualPrice > parseFloat(prediction.prediction_date); // Simplified logic
    const accuracy = predictedUp === actualUp;
    
    // Calculate profit/loss (simplified - you might want to add more sophisticated logic)
    const profitLoss = accuracy ? Math.abs(actualPrice - parseFloat(prediction.prediction_date)) : 
                       -Math.abs(actualPrice - parseFloat(prediction.prediction_date));

    // Update prediction with results
    const success = db.updatePredictionResults(
      user_id,
      symbol,
      predictionDate,
      actualPrice,
      actualDate,
      accuracy,
      profitLoss,
      `Actual price: ${actualPrice}, Prediction was ${accuracy ? 'correct' : 'incorrect'}`
    );

    if (!success) {
      return NextResponse.json({ error: 'Failed to update prediction results' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      accuracy, 
      profitLoss,
      message: `Prediction results updated successfully. Accuracy: ${accuracy ? 'Correct' : 'Incorrect'}`
    });
  } catch (error) {
    console.error('Error updating prediction results:', error);
    return NextResponse.json({ error: 'Failed to update prediction results' }, { status: 500 });
  }
} 