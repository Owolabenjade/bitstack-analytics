import { StacksNetwork } from '@stacks/network';
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  stringAsciiCV,
  stringUtf8CV,
  uintCV,
  boolCV,
  contractPrincipalCV,
  standardPrincipalCV,
} from '@stacks/transactions';

// Create network helper (same as gasEstimation.ts)
const getNetwork = (): StacksNetwork => {
  const networkType = process.env.NEXT_PUBLIC_STACKS_NETWORK || 'testnet';

  if (networkType === 'mainnet') {
    return {
      version: 0x16,
      chainId: 0x00000001,
      bnsLookupUrl: 'https://api.hiro.so',
      broadcastEndpoint: '/v2/transactions',
      transferFeeEstimateEndpoint: '/v2/fees/transfer',
      accountEndpoint: '/v2/accounts',
      contractAbiEndpoint: '/v2/contracts/interface',
      readOnlyFunctionCallEndpoint: '/v2/contracts/call-read',
      isMainnet: () => true,
      getBitcoinNetwork: () => 'bitcoin' as any,
      getCoreApiUrl: () => 'https://api.hiro.so',
    } as StacksNetwork;
  } else {
    return {
      version: 0x80000000,
      chainId: 0x80000000,
      bnsLookupUrl: 'https://api.testnet.hiro.so',
      broadcastEndpoint: '/v2/transactions',
      transferFeeEstimateEndpoint: '/v2/fees/transfer',
      accountEndpoint: '/v2/accounts',
      contractAbiEndpoint: '/v2/contracts/interface',
      readOnlyFunctionCallEndpoint: '/v2/contracts/call-read',
      isMainnet: () => false,
      getBitcoinNetwork: () => 'testnet' as any,
      getCoreApiUrl: () => 'https://api.testnet.hiro.so',
    } as StacksNetwork;
  }
};

const network = getNetwork();
const contractAddress =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
const contractName = 'portfolio-tracker';

export const generatePortfolioId = (): string => {
  return `portfolio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateAssetId = (symbol: string): string => {
  return `asset_${symbol}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
};

export const createPortfolioOnChain = async (
  portfolioId: string,
  name: string,
  description: string,
  isPublic: boolean
): Promise<{ txid: string }> => {
  try {
    // In a real implementation, this would use actual wallet integration
    // For now, we'll simulate the contract call

    const functionArgs = [
      stringAsciiCV(portfolioId),
      stringUtf8CV(name),
      stringUtf8CV(description),
      boolCV(isPublic),
    ];

    // Simulate transaction - fixed the template literal syntax
    const mockTxId = `0x${Math.random().toString(16).substr(2, 64)}`;

    console.log('Creating portfolio on-chain:', {
      portfolioId,
      name,
      description,
      isPublic,
      txId: mockTxId,
    });

    return { txid: mockTxId };
  } catch (error) {
    console.error('Failed to create portfolio on-chain:', error);
    throw error;
  }
};

export const addAssetToPortfolioOnChain = async (
  portfolioId: string,
  assetId: string,
  symbol: string,
  amount: number,
  averagePrice: number
): Promise<{ txid: string }> => {
  try {
    const functionArgs = [
      stringAsciiCV(portfolioId),
      stringAsciiCV(assetId),
      stringAsciiCV(symbol),
      uintCV(Math.floor(amount * 1000000)), // Convert to microunits
      uintCV(Math.floor(averagePrice * 1000000)), // Convert to microunits
    ];

    // Simulate transaction
    const mockTxId = `0x${Math.random().toString(16).substr(2, 64)}`;

    console.log('Adding asset to portfolio on-chain:', {
      portfolioId,
      assetId,
      symbol,
      amount,
      averagePrice,
      txId: mockTxId,
    });

    return { txid: mockTxId };
  } catch (error) {
    console.error('Failed to add asset to portfolio on-chain:', error);
    throw error;
  }
};

export const updateAssetAmountOnChain = async (
  portfolioId: string,
  assetId: string,
  newAmount: number
): Promise<{ txid: string }> => {
  try {
    const functionArgs = [
      stringAsciiCV(portfolioId),
      stringAsciiCV(assetId),
      uintCV(Math.floor(newAmount * 1000000)), // Convert to microunits
    ];

    // Simulate transaction
    const mockTxId = `0x${Math.random().toString(16).substr(2, 64)}`;

    console.log('Updating asset amount on-chain:', {
      portfolioId,
      assetId,
      newAmount,
      txId: mockTxId,
    });

    return { txid: mockTxId };
  } catch (error) {
    console.error('Failed to update asset amount on-chain:', error);
    throw error;
  }
};

export const removeAssetFromPortfolioOnChain = async (
  portfolioId: string,
  assetId: string
): Promise<{ txid: string }> => {
  try {
    const functionArgs = [stringAsciiCV(portfolioId), stringAsciiCV(assetId)];

    // Simulate transaction
    const mockTxId = `0x${Math.random().toString(16).substr(2, 64)}`;

    console.log('Removing asset from portfolio on-chain:', {
      portfolioId,
      assetId,
      txId: mockTxId,
    });

    return { txid: mockTxId };
  } catch (error) {
    console.error('Failed to remove asset from portfolio on-chain:', error);
    throw error;
  }
};

export const registerPublicPortfolio = async (
  portfolioId: string,
  name: string,
  description: string
): Promise<{ txid: string }> => {
  try {
    // This would register the portfolio in a public registry contract
    const mockTxId = `0x${Math.random().toString(16).substr(2, 64)}`;

    console.log('Registering public portfolio:', {
      portfolioId,
      name,
      description,
      txId: mockTxId,
    });

    return { txid: mockTxId };
  } catch (error) {
    console.error('Failed to register public portfolio:', error);
    throw error;
  }
};

// Helper function to check if contracts are deployed
export const checkContractDeployment = async (): Promise<boolean> => {
  try {
    // In a real implementation, this would check if the contract exists
    // For now, we'll assume it's deployed in testnet
    return true;
  } catch (error) {
    console.error('Failed to check contract deployment:', error);
    return false;
  }
};

// Get contract info
export const getContractInfo = () => {
  return {
    address: contractAddress,
    name: contractName,
    network: network.isMainnet() ? 'mainnet' : 'testnet',
  };
};
