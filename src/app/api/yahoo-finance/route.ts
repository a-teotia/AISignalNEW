import { NextRequest, NextResponse } from 'next/server';
import { getMarketData } from '@/lib/data-providers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || 'AAPL';

  try {
    console.log(`📊 Yahoo Finance API: Getting data for ${symbol}`);
    const startTime = Date.now();
    
    // Use our getMarketData function to get real market data
    const marketData = await getMarketData(symbol);
    
    const processingTime = Date.now() - startTime;
    
    if (!marketData) {
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
      data: marketData,
      processingTime,
      timestamp: new Date().toISOString(),
      message: `Yahoo Finance data retrieved for ${symbol} from ${marketData.source}`
    });
    
  } catch (error) {
    console.error('Error in yahoo-finance API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get Yahoo Finance data', 
        details: error instanceof Error ? error.message : 'Unknown error',
        symbol 
      },
      { status: 500 }
    );
  }
} 