import { useCallback } from 'react';
import { useUserPreferencesStore } from '@/stores/userPreferencesStore';

export const useSettings = () => {
  const {
    notifications,
    display,
    privacy,
    hasUnsavedChanges,
    updateNotifications,
    updateDisplay,
    updatePrivacy,
    resetToDefaults,
    markAsChanged,
    markAsSaved,
  } = useUserPreferencesStore();

  const formatCurrency = useCallback(
    (amount: number) => {
      switch (display.currency) {
        case 'BTC':
          return `₿${(amount / 100000000).toFixed(display.showDecimals)}`;
        case 'STX':
          return `${amount.toFixed(display.showDecimals)} STX`;
        default:
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: display.showDecimals,
            maximumFractionDigits: display.showDecimals,
          }).format(amount);
      }
    },
    [display.currency, display.showDecimals]
  );

  const shouldShowAmount = useCallback(
    (amount: number) => {
      if (!privacy.hideSmallAmounts) return true;
      return amount >= 0.01;
    },
    [privacy.hideSmallAmounts]
  );

  const handleResetSettings = useCallback(() => {
    if (
      window.confirm(
        'Are you sure you want to reset all settings to defaults? This cannot be undone.'
      )
    ) {
      resetToDefaults();
      return true;
    }
    return false;
  }, [resetToDefaults]);

  return {
    // Settings state
    notifications,
    display,
    privacy,
    hasUnsavedChanges,

    // Settings actions
    updateNotifications,
    updateDisplay,
    updatePrivacy,
    handleResetSettings,

    // Helper functions
    formatCurrency,
    shouldShowAmount,
    markAsChanged,
    markAsSaved,
  };
};
