import { PriceData } from '@/stores/priceStore';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';
const SUPPORTED_COINS = ['bitcoin', 'stacks'];

/* ------------------------------------------------------------------ */
/* External-API response types                                         */
/* ------------------------------------------------------------------ */

interface CoinGeckoSimplePrice {
  usd: number;
  usd_24h_change: number;
  usd_market_cap: number;
  usd_24h_vol: number;
}

interface CoinGeckoMarketData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  last_updated: string;
}

interface CoinCapAsset {
  id: string;
  symbol: string;
  name: string;
  priceUsd: string;
  changePercent24Hr: string;
  marketCapUsd: string;
  volumeUsd24Hr: string;
}

/* ------------------------------------------------------------------ */
/* Rate-limited fetch helper                                           */
/* ------------------------------------------------------------------ */

let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1_200; // 1.2 s

const rateLimitedFetch = async (url: string): Promise<Response> => {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_REQUEST_INTERVAL) {
    await new Promise((r) => setTimeout(r, MIN_REQUEST_INTERVAL - elapsed));
  }
  lastRequestTime = Date.now();
  return fetch(url);
};

/* ------------------------------------------------------------------ */
/* Simple-price endpoint                                               */
/* ------------------------------------------------------------------ */

export const fetchPrices = async (): Promise<Record<string, PriceData>> => {
  const coins = SUPPORTED_COINS.join(',');
  const url = `${COINGECKO_API_URL}/simple/price?ids=${coins}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true&include_last_updated_at=true`;

  const res = await rateLimitedFetch(url);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);

  const data: Record<string, CoinGeckoSimplePrice> = await res.json();
  const prices: Record<string, PriceData> = {};

  Object.entries(data).forEach(
    ([id, priceInfo]: [string, CoinGeckoSimplePrice]) => {
      prices[id] = {
        id,
        symbol: id === 'bitcoin' ? 'BTC' : 'STX',
        name: id === 'bitcoin' ? 'Bitcoin' : 'Stacks',
        current_price: priceInfo.usd ?? 0,
        price_change_percentage_24h: priceInfo.usd_24h_change ?? 0,
        market_cap: priceInfo.usd_market_cap ?? 0,
        total_volume: priceInfo.usd_24h_vol ?? 0,
        last_updated: new Date().toISOString(),
      };
    }
  );

  return prices;
};

/* ------------------------------------------------------------------ */
/* Detailed market-data endpoint                                       */
/* ------------------------------------------------------------------ */

export const fetchDetailedPrices = async (): Promise<
  Record<string, PriceData>
> => {
  const coins = SUPPORTED_COINS.join(',');
  const url = `${COINGECKO_API_URL}/coins/markets?vs_currency=usd&ids=${coins}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`;

  const res = await rateLimitedFetch(url);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);

  const data: CoinGeckoMarketData[] = await res.json();
  const prices: Record<string, PriceData> = {};

  data.forEach((coin: CoinGeckoMarketData) => {
    prices[coin.id] = {
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      current_price: coin.current_price,
      price_change_percentage_24h: coin.price_change_percentage_24h,
      market_cap: coin.market_cap,
      total_volume: coin.total_volume,
      last_updated: coin.last_updated,
    };
  });

  return prices;
};

/* ------------------------------------------------------------------ */
/* CoinCap fallback                                                    */
/* ------------------------------------------------------------------ */

export const fetchPricesFromCoinCap = async (): Promise<
  Record<string, PriceData>
> => {
  const res = await fetch(
    'https://api.coincap.io/v2/assets?ids=bitcoin,stacks'
  );
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);

  const { data }: { data: CoinCapAsset[] } = await res.json();
  const prices: Record<string, PriceData> = {};

  data.forEach((asset: CoinCapAsset) => {
    const id = asset.id === 'stacks' ? 'stacks' : 'bitcoin';
    prices[id] = {
      id,
      symbol: asset.symbol.toUpperCase(),
      name: asset.name,
      current_price: parseFloat(asset.priceUsd) || 0,
      price_change_percentage_24h: parseFloat(asset.changePercent24Hr) || 0,
      market_cap: parseFloat(asset.marketCapUsd) || 0,
      total_volume: parseFloat(asset.volumeUsd24Hr) || 0,
      last_updated: new Date().toISOString(),
    };
  });

  return prices;
};
