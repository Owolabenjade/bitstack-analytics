/* ------------------------------------------------------------------ */
/* Mock contract-interaction helpers (client-side only)                */
/* ------------------------------------------------------------------ */

/**
 * Simple helper to return a mock Stacks network object.
 * In production you’d pull this from @stacks/network.
 */
const getNetwork = () => {
  const isMain = process.env.NEXT_PUBLIC_STACKS_NETWORK === 'mainnet';
  return {
    isMainnet: () => isMain,
    getBitcoinNetwork: () =>
      (isMain ? 'bitcoin' : 'testnet') as 'bitcoin' | 'testnet',
  };
};

const network = getNetwork();
const contractAddress =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ??
  'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
const contractName = 'portfolio-tracker';

/* ------------------------------------------------------------------ */
/* ID helpers                                                          */
/* ------------------------------------------------------------------ */

export const generatePortfolioId = (): string =>
  `portfolio_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export const generateAssetId = (symbol: string): string =>
  `asset_${symbol}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

/* ------------------------------------------------------------------ */
/* Mock contract calls – just return a fake tx-id                      */
/* ------------------------------------------------------------------ */

const fakeTxId = () =>
  `0x${Math.random().toString(16).slice(2).padEnd(64, '0')}`;

export const createPortfolioOnChain = async (
  portfolioId: string,
  name: string,
  description: string,
  isPublic: boolean
): Promise<{ txid: string }> => {
  const txid = fakeTxId();
  console.log('createPortfolioOnChain', {
    portfolioId,
    name,
    description,
    isPublic,
    txid,
  });
  return { txid };
};

export const addAssetToPortfolioOnChain = async (
  portfolioId: string,
  assetId: string,
  symbol: string,
  amount: number,
  averagePrice: number
): Promise<{ txid: string }> => {
  const txid = fakeTxId();
  console.log('addAssetToPortfolioOnChain', {
    portfolioId,
    assetId,
    symbol,
    amount,
    averagePrice,
    txid,
  });
  return { txid };
};

export const updateAssetAmountOnChain = async (
  portfolioId: string,
  assetId: string,
  newAmount: number
): Promise<{ txid: string }> => {
  const txid = fakeTxId();
  console.log('updateAssetAmountOnChain', {
    portfolioId,
    assetId,
    newAmount,
    txid,
  });
  return { txid };
};

export const removeAssetFromPortfolioOnChain = async (
  portfolioId: string,
  assetId: string
): Promise<{ txid: string }> => {
  const txid = fakeTxId();
  console.log('removeAssetFromPortfolioOnChain', {
    portfolioId,
    assetId,
    txid,
  });
  return { txid };
};

export const registerPublicPortfolio = async (
  portfolioId: string,
  name: string,
  description: string
): Promise<{ txid: string }> => {
  const txid = fakeTxId();
  console.log('registerPublicPortfolio', {
    portfolioId,
    name,
    description,
    txid,
  });
  return { txid };
};

/* ------------------------------------------------------------------ */
/* Misc helpers                                                        */
/* ------------------------------------------------------------------ */

export const checkContractDeployment = async (): Promise<boolean> => {
  // In a real implementation, we’d hit the Stacks API.
  console.log('checkContractDeployment → assumed deployed');
  return true;
};

export const getContractInfo = () => ({
  address: contractAddress,
  name: contractName,
  network: network.isMainnet() ? 'mainnet' : 'testnet',
});
