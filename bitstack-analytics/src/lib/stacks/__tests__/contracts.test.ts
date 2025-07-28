// src/lib/stacks/__tests__/contracts.test.ts
import { callContract, deployContract } from '../contracts';
import { mockTransaction } from '@stacks/transactions';

jest.mock('@stacks/transactions');

describe('Smart Contract Integration', () => {
  it('calls contract function successfully', async () => {
    const mockTxId = '0x123';
    (mockTransaction as jest.Mock).mockResolvedValueOnce({
      txid: mockTxId,
    });

    const result = await callContract({
      contractAddress: 'ST123',
      contractName: 'portfolio-tracker',
      functionName: 'add-portfolio',
      functionArgs: [],
    });

    expect(result.txid).toBe(mockTxId);
  });

  it('handles contract errors', async () => {
    (mockTransaction as jest.Mock).mockRejectedValueOnce(
      new Error('Contract error')
    );

    await expect(
      callContract({
        contractAddress: 'ST123',
        contractName: 'portfolio-tracker',
        functionName: 'add-portfolio',
        functionArgs: [],
      })
    ).rejects.toThrow('Contract error');
  });
});
