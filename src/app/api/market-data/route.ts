import { NextRequest, NextResponse } from 'next/server';
import { getMarketData } from '../../../lib/data-providers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol parameter is required' }, { status: 400 });
  }

  try {
    console.log(`📊 API: Getting real market data for ${symbol}`);
    const startTime = Date.now();
    
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
      message: `Real market data retrieved for ${symbol} from ${marketData.source}`
    });
    
  } catch (error) {
    console.error('Error in market-data API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get market data', 
        details: error instanceof Error ? error.message : 'Unknown error',
        symbol 
      },
      { status: 500 }
    );
  }
} 