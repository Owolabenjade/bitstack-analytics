import { useEffect, useCallback } from 'react';
import { usePriceStore } from '@/stores/priceStore';
import { fetchPrices, fetchPricesFromCoinCap } from '@/lib/api/prices';

const PRICE_UPDATE_INTERVAL = 60000; // 1 minute
const CACHE_DURATION = 30000; // 30 seconds

export const usePrices = () => {
  const {
    prices,
    isLoading,
    error,
    lastUpdated,
    setPrices,
    setLoading,
    setError,
  } = usePriceStore();

  const fetchPriceData = useCallback(
    async (force = false) => {
      // Check if we have recent data and this isn't a forced update
      if (!force && lastUpdated) {
        const timeSinceUpdate = Date.now() - lastUpdated.getTime();
        if (timeSinceUpdate < CACHE_DURATION) {
          return;
        }
      }

      try {
        setLoading(true);
        setError(null);

        let priceData;
        try {
          // Try CoinGecko first
          priceData = await fetchPrices();
        } catch (error) {
          console.warn('CoinGecko failed, trying CoinCap fallback:', error);
          // Fallback to CoinCap
          priceData = await fetchPricesFromCoinCap();
        }

        setPrices(priceData);
      } catch (error) {
        console.error('All price APIs failed:', error);
        setError('Unable to fetch price data. Please try again later.');
      } finally {
        setLoading(false);
      }
    },
    [lastUpdated, setPrices, setLoading, setError]
  );

  // Initial fetch and periodic updates
  useEffect(() => {
    fetchPriceData();

    const interval = setInterval(() => {
      fetchPriceData();
    }, PRICE_UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchPriceData]);

  const refreshPrices = useCallback(() => {
    fetchPriceData(true);
  }, [fetchPriceData]);

  const getPrice = useCallback(
    (coinId: string) => {
      return prices[coinId] || null;
    },
    [prices]
  );

  const getBitcoinPrice = useCallback(() => {
    return getPrice('bitcoin');
  }, [getPrice]);

  const getStacksPrice = useCallback(() => {
    return getPrice('stacks');
  }, [getPrice]);

  return {
    prices,
    isLoading,
    error,
    lastUpdated,
    refreshPrices,
    getPrice,
    getBitcoinPrice,
    getStacksPrice,
  };
};
