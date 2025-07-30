import { NextRequest, NextResponse } from 'next/server';
import { createDataProviderOrchestrator } from '../../../lib/services';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol parameter is required' }, { status: 400 });
  }

  try {
    console.log(`📊 API: Getting comprehensive market data with technical indicators for ${symbol}`);
    const startTime = Date.now();
    
    // 🔧 FIX: Use modular data provider orchestrator instead of basic market data
    const orchestrator = await createDataProviderOrchestrator();
    const comprehensiveData = await orchestrator.getComprehensiveData(symbol);
    
    const processingTime = Date.now() - startTime;
    
    if (!comprehensiveData || !comprehensiveData.marketData) {
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
      data: {
        // Basic market data
        ...comprehensiveData.marketData,
        // 🚀 ADD: Technical indicators from TwelveData
        technicalData: comprehensiveData.technicalData,
        // 🚀 ADD: News sentiment data
        newsData: comprehensiveData.newsData,
        // 🚀 ADD: Overall data quality
        overallQuality: comprehensiveData.overallQuality,
        sources: comprehensiveData.sources
      },
      processingTime,
      timestamp: new Date().toISOString(),
      message: `Comprehensive market data with technical indicators retrieved for ${symbol} from ${comprehensiveData.sources.join(', ')}`
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