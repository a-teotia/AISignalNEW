import { NextRequest, NextResponse } from 'next/server';
import { FinancialDataProvider } from '@/lib/data-providers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const interval = searchParams.get('interval') || '1d';
    const range = searchParams.get('range') || '5d';

    if (!symbol) {
      return NextResponse.json({ error: 'Symbol parameter is required' }, { status: 400 });
    }

    // Use our FinancialDataProvider to get real market data
    const marketData = await FinancialDataProvider.getMarketData(symbol);

    // Create a mock chart response that matches Yahoo Finance format
    const mockChartData = {
      chart: {
        result: [{
          meta: {
            symbol: symbol,
            regularMarketPrice: marketData.price,
            previousClose: marketData.price - marketData.change,
            chartPreviousClose: marketData.price - marketData.change,
            regularMarketTime: Math.floor(Date.now() / 1000),
            gmtoffset: -14400,
            timezone: 'EDT',
            exchangeName: 'NMS',
            instrumentInfo: {
              symbol: symbol,
              shortName: symbol,
              exchange: 'NMS',
              exchangeTimezoneName: 'America/New_York'
            },
            currentTradingPeriod: {
              pre: { timezone: 'EDT', start: 0, end: 0, gmtoffset: -14400 },
              regular: { timezone: 'EDT', start: 34200000, end: 57600000, gmtoffset: -14400 },
              post: { timezone: 'EDT', start: 57600000, end: 72000000, gmtoffset: -14400 }
            },
            dataGranularity: '1d',
            validRanges: ['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'ytd', 'max']
          },
          timestamp: [Math.floor(Date.now() / 1000) - 86400 * 4, Math.floor(Date.now() / 1000) - 86400 * 3, Math.floor(Date.now() / 1000) - 86400 * 2, Math.floor(Date.now() / 1000) - 86400, Math.floor(Date.now() / 1000)],
          indicators: {
            quote: [{
              low: [marketData.price * 0.98, marketData.price * 0.99, marketData.price * 0.97, marketData.price * 0.98, marketData.price * 0.99],
              high: [marketData.price * 1.02, marketData.price * 1.01, marketData.price * 1.03, marketData.price * 1.02, marketData.price * 1.01],
              open: [marketData.price * 0.99, marketData.price * 1.00, marketData.price * 0.98, marketData.price * 0.99, marketData.price * 1.00],
              close: [marketData.price * 0.99, marketData.price * 1.00, marketData.price * 0.98, marketData.price * 0.99, marketData.price],
              volume: [marketData.volume * 0.9, marketData.volume * 1.1, marketData.volume * 0.95, marketData.volume * 1.05, marketData.volume]
            }],
            adjclose: [{
              adjclose: [marketData.price * 0.99, marketData.price * 1.00, marketData.price * 0.98, marketData.price * 0.99, marketData.price]
            }]
          }
        }],
        error: null
      }
    };

    return NextResponse.json(mockChartData);

  } catch (error) {
    console.error('Error in Yahoo Finance API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 