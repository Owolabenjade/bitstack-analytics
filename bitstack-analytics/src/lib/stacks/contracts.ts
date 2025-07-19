import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  stringUtf8CV,
  stringAsciiCV,
  uintCV,
  boolCV,
  principalCV,
  contractPrincipalCV,
} from '@stacks/transactions';
import { StacksNetwork, StacksTestnet, StacksMainnet } from '@stacks/network';
import { userSession } from './auth';

// Contract configuration
const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
const CONTRACT_NAME = 'portfolio-tracker';
const REGISTRY_CONTRACT_NAME = 'portfolio-registry';

// Get network configuration
const getNetwork = (): StacksNetwork => {
  const networkType = process.env.NEXT_PUBLIC_STACKS_NETWORK || 'testnet';
  return networkType === 'mainnet' ? new StacksMainnet() : new StacksTestnet();
};

// Portfolio contract functions
export const createPortfolioOnChain = async (
  portfolioId: string,
  name: string,
  description: string,
  isPublic: boolean
) => {
  const network = getNetwork();
  const userData = userSession.loadUserData();

  if (!userData) {
    throw new Error('User not authenticated');
  }

  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'create-portfolio',
    functionArgs: [
      stringAsciiCV(portfolioId),
      stringUtf8CV(name),
      stringUtf8CV(description),
      boolCV(isPublic),
    ],
    senderKey: userData.appPrivateKey,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  };

  const transaction = await makeContractCall(txOptions);
  const result = await broadcastTransaction(transaction, network);

  return result;
};

export const addAssetToPortfolioOnChain = async (
  portfolioId: string,
  assetId: string,
  symbol: string,
  amount: number,
  averagePrice: number
) => {
  const network = getNetwork();
  const userData = userSession.loadUserData();

  if (!userData) {
    throw new Error('User not authenticated');
  }

  // Convert to microunits (multiply by 1,000,000 for precision)
  const amountMicro = Math.floor(amount * 1000000);
  const priceMicro = Math.floor(averagePrice * 1000000);

  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'add-asset-to-portfolio',
    functionArgs: [
      stringAsciiCV(portfolioId),
      stringAsciiCV(assetId),
      stringAsciiCV(symbol),
      uintCV(amountMicro),
      uintCV(priceMicro),
    ],
    senderKey: userData.appPrivateKey,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  };

  const transaction = await makeContractCall(txOptions);
  const result = await broadcastTransaction(transaction, network);

  return result;
};

export const updateAssetAmountOnChain = async (
  portfolioId: string,
  assetId: string,
  newAmount: number
) => {
  const network = getNetwork();
  const userData = userSession.loadUserData();

  if (!userData) {
    throw new Error('User not authenticated');
  }

  const amountMicro = Math.floor(newAmount * 1000000);

  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'update-asset-amount',
    functionArgs: [
      stringAsciiCV(portfolioId),
      stringAsciiCV(assetId),
      uintCV(amountMicro),
    ],
    senderKey: userData.appPrivateKey,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  };

  const transaction = await makeContractCall(txOptions);
  const result = await broadcastTransaction(transaction, network);

  return result;
};

export const removeAssetFromPortfolioOnChain = async (
  portfolioId: string,
  assetId: string
) => {
  const network = getNetwork();
  const userData = userSession.loadUserData();

  if (!userData) {
    throw new Error('User not authenticated');
  }

  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'remove-asset-from-portfolio',
    functionArgs: [stringAsciiCV(portfolioId), stringAsciiCV(assetId)],
    senderKey: userData.appPrivateKey,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  };

  const transaction = await makeContractCall(txOptions);
  const result = await broadcastTransaction(transaction, network);

  return result;
};

// Registry contract functions
export const registerPublicPortfolio = async (
  portfolioId: string,
  name: string,
  description: string
) => {
  const network = getNetwork();
  const userData = userSession.loadUserData();

  if (!userData) {
    throw new Error('User not authenticated');
  }

  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: REGISTRY_CONTRACT_NAME,
    functionName: 'register-public-portfolio',
    functionArgs: [
      stringAsciiCV(portfolioId),
      stringUtf8CV(name),
      stringUtf8CV(description),
    ],
    senderKey: userData.appPrivateKey,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  };

  const transaction = await makeContractCall(txOptions);
  const result = await broadcastTransaction(transaction, network);

  return result;
};

// Utility functions
export const generatePortfolioId = (): string => {
  return `portfolio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateAssetId = (symbol: string): string => {
  return `${symbol.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
};
