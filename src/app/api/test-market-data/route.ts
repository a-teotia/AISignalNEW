import { NextRequest, NextResponse } from 'next/server';
import { FinancialDataProvider } from '@/lib/data-providers';

export async function POST(request: NextRequest) {
  try {
    const { symbol } = await request.json();
    
    if (!symbol) {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    const data = await FinancialDataProvider.getMarketData(symbol);

    return NextResponse.json({
      success: true,
      symbol,
      data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error testing market data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 