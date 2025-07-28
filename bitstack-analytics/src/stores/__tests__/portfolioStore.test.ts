// src/stores/__tests__/portfolioStore.test.ts
import { renderHook, act } from '@testing-library/react';
import { usePortfolioStore } from '../portfolioStore';

describe('portfolioStore', () => {
  beforeEach(() => {
    usePortfolioStore.setState({
      portfolios: [],
      activePortfolio: null,
    });
  });

  it('adds a portfolio', () => {
    const { result } = renderHook(() => usePortfolioStore());

    act(() => {
      result.current.addPortfolio({
        id: '1',
        name: 'Test Portfolio',
        description: 'Test Description',
        assets: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    expect(result.current.portfolios).toHaveLength(1);
    expect(result.current.portfolios[0].name).toBe('Test Portfolio');
  });

  it('updates a portfolio', () => {
    const { result } = renderHook(() => usePortfolioStore());

    // Add initial portfolio
    act(() => {
      result.current.addPortfolio({
        id: '1',
        name: 'Test Portfolio',
        description: 'Test Description',
        assets: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    // Update portfolio
    act(() => {
      result.current.updatePortfolio('1', {
        name: 'Updated Portfolio',
      });
    });

    expect(result.current.portfolios[0].name).toBe('Updated Portfolio');
  });

  it('deletes a portfolio', () => {
    const { result } = renderHook(() => usePortfolioStore());

    // Add portfolio
    act(() => {
      result.current.addPortfolio({
        id: '1',
        name: 'Test Portfolio',
        description: 'Test Description',
        assets: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    // Delete portfolio
    act(() => {
      result.current.deletePortfolio('1');
    });

    expect(result.current.portfolios).toHaveLength(0);
  });
});
