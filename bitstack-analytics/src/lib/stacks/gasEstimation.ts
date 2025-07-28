import { StacksNetwork } from '@stacks/network';

/* -------------------------------------------------- */
/* Types                                              */
/* -------------------------------------------------- */

export interface GasEstimate {
  estimatedGas: number;
  estimatedFee: number;
  feeRate: number;
  error?: string;
}

/* -------------------------------------------------- */
/* Simple network helper (mock)                       */
/* -------------------------------------------------- */

const getNetwork = (): StacksNetwork => {
  const isMain = process.env.NEXT_PUBLIC_STACKS_NETWORK === 'mainnet';

  return {
    version: isMain ? 0x16 : 0x80000000,
    chainId: isMain ? 0x00000001 : 0x80000000,
    bnsLookupUrl: isMain
      ? 'https://api.hiro.so'
      : 'https://api.testnet.hiro.so',
    broadcastEndpoint: '/v2/transactions',
    transferFeeEstimateEndpoint: '/v2/fees/transfer',
    accountEndpoint: '/v2/accounts',
    contractAbiEndpoint: '/v2/contracts/interface',
    readOnlyFunctionCallEndpoint: '/v2/contracts/call-read',
    isMainnet: () => isMain,
    getBitcoinNetwork: () =>
      (isMain ? 'bitcoin' : 'testnet') as 'bitcoin' | 'testnet',
    getCoreApiUrl: () =>
      isMain ? 'https://api.hiro.so' : 'https://api.testnet.hiro.so',
  } as StacksNetwork;
};

/* -------------------------------------------------- */
/* Mock estimators                                    */
/* -------------------------------------------------- */

/* eslint-disable @typescript-eslint/no-unused-vars */
export const estimateCreatePortfolioGas = async (
  _senderAddress: string,
  _portfolioId: string,
  _name: string,
  _description: string,
  _isPublic: boolean
): Promise<GasEstimate> => {
  const baseGas = 50_000;
  const estimatedGas = baseGas * 2;
  return {
    estimatedGas,
    estimatedFee: estimatedGas * 1, // 1 µSTX per gas unit
    feeRate: 1,
  };
};

export const estimateAddAssetGas = async (
  _senderAddress: string,
  _portfolioId: string,
  _assetId: string,
  _symbol: string,
  _amount: number,
  _averagePrice: number
): Promise<GasEstimate> => {
  const estimatedGas = 30_000;
  return {
    estimatedGas,
    estimatedFee: estimatedGas * 1,
    feeRate: 1,
  };
};

export const estimateContractCall = async (
  _contractAddress: string,
  _contractName: string,
  _functionName: string,
  functionArgs: unknown[]
): Promise<GasEstimate> => {
  const baseGas = 25_000;
  const estimatedGas = baseGas + functionArgs.length * 5_000;
  return {
    estimatedGas,
    estimatedFee: estimatedGas * 1,
    feeRate: 1,
  };
};
/* eslint-enable @typescript-eslint/no-unused-vars */
