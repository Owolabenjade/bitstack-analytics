import { useEffect, useCallback } from 'react';
import { usePriceStore } from '@/stores/priceStore';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { coinGeckoApi, coinCapApi, ApiError } from '@/lib/api/apiClient';

const PRICE_UPDATE_INTERVAL = 60000; // 1 minute
const CACHE_DURATION = 30000; // 30 seconds

export const usePrices = () => {
  const {
    prices,
    isLoading: storeLoading,
    error: storeError,
    lastUpdated,
    setPrices,
    setLoading,
    setError,
  } = usePriceStore();

  const { handleNetworkError, clearAllErrors } = useErrorHandler();
  const { withLoading, isLoading: hookLoading } = useLoadingStates();
  const { isOnline, isSlowConnection } = useNetworkStatus();

  // Use either store loading or hook loading
  const isLoading = storeLoading || hookLoading('fetch-prices');

  const fetchFromCoinGecko = useCallback(async () => {
    return await coinGeckoApi.get('/simple/price', {
      headers: {
        'x-cg-demo-api-key': process.env.COINGECKO_API_KEY || '',
      },
      cache: true,
      cacheDuration: CACHE_DURATION,
      timeout: isSlowConnection ? 15000 : 8000,
      retries: isSlowConnection ? 2 : 3,
    });
  }, [isSlowConnection]);

  const fetchFromCoinCap = useCallback(async () => {
    const [bitcoinRes, stacksRes] = await Promise.all([
      coinCapApi.get('/assets/bitcoin', {
        cache: true,
        cacheDuration: CACHE_DURATION,
        timeout: isSlowConnection ? 15000 : 8000,
      }),
      coinCapApi.get('/assets/stacks', {
        cache: true,
        cacheDuration: CACHE_DURATION,
        timeout: isSlowConnection ? 15000 : 8000,
      }),
    ]);

    return {
      bitcoin: {
        current_price: parseFloat(bitcoinRes.data.priceUsd),
        price_change_percentage_24h: parseFloat(
          bitcoinRes.data.changePercent24Hr
        ),
      },
      stacks: {
        current_price: parseFloat(stacksRes.data.priceUsd),
        price_change_percentage_24h: parseFloat(
          stacksRes.data.changePercent24Hr
        ),
      },
    };
  }, [isSlowConnection]);

  const fetchPriceData = useCallback(
    async (force = false) => {
      if (!isOnline) {
        setError('No internet connection');
        return;
      }

      // Check if we have recent data and this isn't a forced update
      if (!force && lastUpdated) {
        const timeSinceUpdate = Date.now() - lastUpdated.getTime();
        if (timeSinceUpdate < CACHE_DURATION) {
          return;
        }
      }

      await withLoading(
        'fetch-prices',
        async () => {
          try {
            clearAllErrors();
            setError(null);

            let priceData;
            try {
              // Try CoinGecko first
              const response = await fetchFromCoinGecko();
              priceData = {
                bitcoin: {
                  id: 'bitcoin',
                  symbol: 'btc',
                  name: 'Bitcoin',
                  current_price: response.bitcoin?.usd || 0,
                  price_change_percentage_24h:
                    response.bitcoin?.usd_24h_change || 0,
                  market_cap: response.bitcoin?.usd_market_cap || 0,
                  total_volume: response.bitcoin?.usd_24h_vol || 0,
                  last_updated: new Date().toISOString(),
                },
                stacks: {
                  id: 'stacks',
                  symbol: 'stx',
                  name: 'Stacks',
                  current_price: response.stacks?.usd || 0,
                  price_change_percentage_24h:
                    response.stacks?.usd_24h_change || 0,
                  market_cap: response.stacks?.usd_market_cap || 0,
                  total_volume: response.stacks?.usd_24h_vol || 0,
                  last_updated: new Date().toISOString(),
                },
              };
            } catch (coinGeckoError) {
              console.warn(
                'CoinGecko failed, trying CoinCap fallback:',
                coinGeckoError
              );

              // Fallback to CoinCap
              const fallbackData = await fetchFromCoinCap();
              priceData = {
                bitcoin: {
                  ...fallbackData.bitcoin,
                  id: 'bitcoin',
                  symbol: 'btc',
                  name: 'Bitcoin',
                  market_cap: 0,
                  total_volume: 0,
                  last_updated: new Date().toISOString(),
                },
                stacks: {
                  ...fallbackData.stacks,
                  id: 'stacks',
                  symbol: 'stx',
                  name: 'Stacks',
                  market_cap: 0,
                  total_volume: 0,
                  last_updated: new Date().toISOString(),
                },
              };
            }

            setPrices(priceData);
          } catch (error) {
            console.error('All price APIs failed:', error);
            const errorMessage =
              error instanceof ApiError
                ? `Price service error (${error.status}): ${error.message}`
                : 'Unable to fetch price data. Please try again later.';

            setError(errorMessage);
            handleNetworkError(error, 'Price fetch');
          }
        },
        'Fetching latest prices'
      );
    },
    [
      isOnline,
      lastUpdated,
      withLoading,
      clearAllErrors,
      setError,
      fetchFromCoinGecko,
      fetchFromCoinCap,
      setPrices,
      handleNetworkError,
    ]
  );

  // Initial fetch and periodic updates
  useEffect(() => {
    fetchPriceData();

    const interval = setInterval(() => {
      if (isOnline) {
        fetchPriceData();
      }
    }, PRICE_UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchPriceData, isOnline]);

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
    error: storeError,
    lastUpdated,
    isOnline,
    isSlowConnection,
    refreshPrices,
    getPrice,
    getBitcoinPrice,
    getStacksPrice,
  };
};
