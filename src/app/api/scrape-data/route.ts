import { NextRequest, NextResponse } from 'next/server';
import { CentralizedDataProvider } from '../../../lib/centralized-data-provider';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol parameter is required' }, { status: 400 });
  }

  try {
    console.log(`🕷️ API: Starting comprehensive data scraping for ${symbol}`);
    const startTime = Date.now();
    
          const scrapedData = await CentralizedDataProvider.getComprehensiveData(symbol);
    
    const processingTime = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      symbol,
      data: scrapedData,
      processingTime,
      timestamp: new Date().toISOString(),
      message: `Comprehensive data scraped successfully for ${symbol}`
    });
    
  } catch (error) {
    console.error('Error in scrape-data API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to scrape data', 
        details: error instanceof Error ? error.message : 'Unknown error',
        symbol 
      },
      { status: 500 }
    );
  }
} 