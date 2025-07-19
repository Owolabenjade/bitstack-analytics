import {
  makeContractCall,
  estimateContractFunctionCall,
  AnchorMode,
  PostConditionMode,
  stringUtf8CV,
  stringAsciiCV,
  uintCV,
  boolCV,
} from '@stacks/transactions';
import { StacksNetwork, StacksTestnet, StacksMainnet } from '@stacks/network';

// Contract configuration
const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
const CONTRACT_NAME = 'portfolio-tracker';

// Get network configuration
const getNetwork = (): StacksNetwork => {
  const networkType = process.env.NEXT_PUBLIC_STACKS_NETWORK || 'testnet';
  return networkType === 'mainnet' ? new StacksMainnet() : new StacksTestnet();
};

export interface GasEstimate {
  estimatedGas: number;
  estimatedFee: number;
  estimatedTotal: number;
}

export const estimateCreatePortfolioGas = async (
  senderAddress: string,
  portfolioId: string,
  name: string,
  description: string,
  isPublic: boolean
): Promise<GasEstimate> => {
  try {
    const network = getNetwork();

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
      senderAddress,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const estimation = await estimateContractFunctionCall(txOptions);

    return {
      estimatedGas: Number(estimation.estimated_gas_used || 5000),
      estimatedFee: Number(estimation.estimated_fee || 1000),
      estimatedTotal: Number(estimation.estimated_fee || 1000),
    };
  } catch (error) {
    console.warn('Gas estimation failed, using defaults:', error);
    return {
      estimatedGas: 5000,
      estimatedFee: 1000,
      estimatedTotal: 1000,
    };
  }
};

export const estimateAddAssetGas = async (
  senderAddress: string,
  portfolioId: string,
  assetId: string,
  symbol: string,
  amount: number,
  averagePrice: number
): Promise<GasEstimate> => {
  try {
    const network = getNetwork();
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
      senderAddress,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const estimation = await estimateContractFunctionCall(txOptions);

    return {
      estimatedGas: Number(estimation.estimated_gas_used || 3000),
      estimatedFee: Number(estimation.estimated_fee || 800),
      estimatedTotal: Number(estimation.estimated_fee || 800),
    };
  } catch (error) {
    console.warn('Gas estimation failed, using defaults:', error);
    return {
      estimatedGas: 3000,
      estimatedFee: 800,
      estimatedTotal: 800,
    };
  }
};

export const formatSTXAmount = (microSTX: number): string => {
  return (microSTX / 1000000).toFixed(6);
};

export const formatGasEstimate = (estimate: GasEstimate): string => {
  return `~${formatSTXAmount(estimate.estimatedFee)} STX`;
};
