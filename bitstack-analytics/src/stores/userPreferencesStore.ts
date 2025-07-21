import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NotificationSettings {
  priceAlerts: boolean;
  transactionConfirmations: boolean;
  portfolioUpdates: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export interface DisplaySettings {
  theme: 'light' | 'dark' | 'system';
  currency: 'USD' | 'BTC' | 'STX';
  language: 'en' | 'es' | 'fr' | 'de';
  compactMode: boolean;
  showDecimals: number;
  refreshInterval: number;
}

export interface PrivacySettings {
  sharePortfolios: boolean;
  allowAnalytics: boolean;
  showBalances: boolean;
  hideSmallAmounts: boolean;
  publicProfile: boolean;
}

interface UserPreferencesState {
  notifications: NotificationSettings;
  display: DisplaySettings;
  privacy: PrivacySettings;
  hasUnsavedChanges: boolean;
}

interface UserPreferencesActions {
  updateNotifications: (settings: Partial<NotificationSettings>) => void;
  updateDisplay: (settings: Partial<DisplaySettings>) => void;
  updatePrivacy: (settings: Partial<PrivacySettings>) => void;
  resetToDefaults: () => void;
  markAsChanged: () => void;
  markAsSaved: () => void;
}

const defaultNotifications: NotificationSettings = {
  priceAlerts: true,
  transactionConfirmations: true,
  portfolioUpdates: true,
  emailNotifications: false,
  pushNotifications: true,
};

const defaultDisplay: DisplaySettings = {
  theme: 'light',
  currency: 'USD',
  language: 'en',
  compactMode: false,
  showDecimals: 6,
  refreshInterval: 60,
};

const defaultPrivacy: PrivacySettings = {
  sharePortfolios: false,
  allowAnalytics: true,
  showBalances: true,
  hideSmallAmounts: false,
  publicProfile: false,
};

const initialState: UserPreferencesState = {
  notifications: defaultNotifications,
  display: defaultDisplay,
  privacy: defaultPrivacy,
  hasUnsavedChanges: false,
};

export const useUserPreferencesStore = create<
  UserPreferencesState & UserPreferencesActions
>()(
  persist(
    (set) => ({
      ...initialState,

      updateNotifications: (settings) => {
        set((state) => ({
          notifications: { ...state.notifications, ...settings },
          hasUnsavedChanges: true,
        }));
      },

      updateDisplay: (settings) => {
        set((state) => ({
          display: { ...state.display, ...settings },
          hasUnsavedChanges: true,
        }));
      },

      updatePrivacy: (settings) => {
        set((state) => ({
          privacy: { ...state.privacy, ...settings },
          hasUnsavedChanges: true,
        }));
      },

      resetToDefaults: () => {
        set({
          notifications: defaultNotifications,
          display: defaultDisplay,
          privacy: defaultPrivacy,
          hasUnsavedChanges: true,
        });
      },

      markAsChanged: () => set({ hasUnsavedChanges: true }),
      markAsSaved: () => set({ hasUnsavedChanges: false }),
    }),
    {
      name: 'user-preferences-storage',
      partialize: (state) => ({
        notifications: state.notifications,
        display: state.display,
        privacy: state.privacy,
      }),
    }
  )
);
