export const STACKS_NETWORK =
  process.env.NEXT_PUBLIC_STACKS_NETWORK || 'testnet';
export const STACKS_API_URL =
  process.env.NEXT_PUBLIC_STACKS_API_URL || 'https://api.testnet.hiro.so';

export const BITCOIN_PRICE_API = 'https://api.coingecko.com/api/v3';
export const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

export const SUPPORTED_ASSETS = [
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    network: 'bitcoin',
  },
  {
    id: 'stacks',
    symbol: 'STX',
    name: 'Stacks',
    network: 'stacks',
  },
] as const;

export const APP_NAME = 'BitStack Analytics';
export const APP_DESCRIPTION =
  'Cross-Chain Bitcoin Portfolio Analytics Dashboard';
