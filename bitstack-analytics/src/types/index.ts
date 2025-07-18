export interface Asset {
  id: string;
  symbol: string;
  name: string;
  network: 'bitcoin' | 'stacks';
  price?: number;
  change24h?: number;
}

export interface PortfolioAsset {
  asset: Asset;
  amount: number;
  value: number;
  allocation: number;
}

export interface Portfolio {
  id: string;
  name: string;
  assets: PortfolioAsset[];
  totalValue: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PriceData {
  asset: string;
  price: number;
  change24h: number;
  lastUpdated: Date;
}

export interface WalletState {
  connected: boolean;
  address: string | null;
  network: string;
}
