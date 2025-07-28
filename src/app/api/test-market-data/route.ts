import { NextRequest, NextResponse } from 'next/server';
import { getMarketData } from '@/lib/data-providers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || 'AAPL';

  try {
    console.log(`🧪 Test Market Data API: Testing with ${symbol}`);
    const startTime = Date.now();
    
    const data = await getMarketData(symbol);
    
    const processingTime = Date.now() - startTime;
    
    if (!data) {
      return NextResponse.json(
        { 
          error: 'No market data available for this symbol', 
          symbol 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      symbol,
      data,
      processingTime,
      timestamp: new Date().toISOString(),
      message: `Test market data retrieved for ${symbol} from ${data.source}`
    });
    
  } catch (error) {
    console.error('Error in test-market-data API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get test market data', 
        details: error instanceof Error ? error.message : 'Unknown error',
        symbol 
      },
      { status: 500 }
    );
  }
} 