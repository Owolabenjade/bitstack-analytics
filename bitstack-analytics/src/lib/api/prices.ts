import { PriceData } from '@/stores/priceStore';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';
const SUPPORTED_COINS = ['bitcoin', 'stacks'];

// Rate limiting: CoinGecko free tier allows 50 calls per minute
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1200; // 1.2 seconds between requests

const rateLimitedFetch = async (url: string): Promise<Response> => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }

  lastRequestTime = Date.now();
  return fetch(url);
};

export const fetchPrices = async (): Promise<Record<string, PriceData>> => {
  try {
    const coins = SUPPORTED_COINS.join(',');
    const url = `${COINGECKO_API_URL}/simple/price?ids=${coins}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true&include_last_updated_at=true`;

    const response = await rateLimitedFetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Transform CoinGecko simple price format to our PriceData format
    const prices: Record<string, PriceData> = {};

    Object.entries(data).forEach(([id, priceInfo]: [string, any]) => {
      prices[id] = {
        id,
        symbol: id === 'bitcoin' ? 'BTC' : 'STX',
        name: id === 'bitcoin' ? 'Bitcoin' : 'Stacks',
        current_price: priceInfo.usd || 0,
        price_change_percentage_24h: priceInfo.usd_24h_change || 0,
        market_cap: priceInfo.usd_market_cap || 0,
        total_volume: priceInfo.usd_24h_vol || 0,
        last_updated: new Date().toISOString(),
      };
    });

    return prices;
  } catch (error) {
    console.error('Error fetching prices:', error);
    throw new Error('Failed to fetch price data');
  }
};

export const fetchDetailedPrices = async (): Promise<
  Record<string, PriceData>
> => {
  try {
    const coins = SUPPORTED_COINS.join(',');
    const url = `${COINGECKO_API_URL}/coins/markets?vs_currency=usd&ids=${coins}&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`;

    const response = await rateLimitedFetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    const prices: Record<string, PriceData> = {};

    data.forEach((coin: any) => {
      prices[coin.id] = {
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        current_price: coin.current_price || 0,
        price_change_percentage_24h: coin.price_change_percentage_24h || 0,
        market_cap: coin.market_cap || 0,
        total_volume: coin.total_volume || 0,
        last_updated: coin.last_updated || new Date().toISOString(),
      };
    });

    return prices;
  } catch (error) {
    console.error('Error fetching detailed prices:', error);
    throw new Error('Failed to fetch detailed price data');
  }
};

// Fallback API for when CoinGecko is unavailable
export const fetchPricesFromCoinCap = async (): Promise<
  Record<string, PriceData>
> => {
  try {
    const response = await fetch(
      'https://api.coincap.io/v2/assets?ids=bitcoin,stacks'
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { data } = await response.json();

    const prices: Record<string, PriceData> = {};

    data.forEach((asset: any) => {
      const id = asset.id === 'stacks' ? 'stacks' : 'bitcoin';
      prices[id] = {
        id,
        symbol: asset.symbol,
        name: asset.name,
        current_price: parseFloat(asset.priceUsd) || 0,
        price_change_percentage_24h: parseFloat(asset.changePercent24Hr) || 0,
        market_cap: parseFloat(asset.marketCapUsd) || 0,
        total_volume: parseFloat(asset.volumeUsd24Hr) || 0,
        last_updated: new Date().toISOString(),
      };
    });

    return prices;
  } catch (error) {
    console.error('Error fetching prices from CoinCap:', error);
    throw new Error('Failed to fetch price data from backup API');
  }
};
