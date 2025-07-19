import { NextResponse } from 'next/server';
import { fetchPrices, fetchPricesFromCoinCap } from '@/lib/api/prices';

export async function GET() {
  try {
    let prices;

    try {
      // Try CoinGecko first
      prices = await fetchPrices();
    } catch (error) {
      console.warn('CoinGecko failed, trying CoinCap fallback:', error);
      // Fallback to CoinCap
      prices = await fetchPricesFromCoinCap();
    }

    return NextResponse.json({
      success: true,
      data: prices,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Price API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch price data',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Enable CORS for client-side requests
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
