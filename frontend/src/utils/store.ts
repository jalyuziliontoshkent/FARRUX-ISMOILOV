import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'dark' | 'light';
export type CurrencyMode = 'USD' | 'UZS';

interface AppStore {
  theme: ThemeMode;
  currency: CurrencyMode;
  exchangeRate: number;
  toggleTheme: () => void;
  toggleCurrency: () => void;
  setExchangeRate: (rate: number) => void;
  loadSettings: () => Promise<void>;
}

export const useAppStore = create<AppStore>((set, get) => ({
  theme: 'dark',
  currency: 'USD',
  exchangeRate: 12800,

  toggleTheme: async () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    set({ theme: next });
    await AsyncStorage.setItem('app_theme', next);
  },

  toggleCurrency: async () => {
    const next = get().currency === 'USD' ? 'UZS' : 'USD';
    set({ currency: next });
    await AsyncStorage.setItem('app_currency', next);
  },

  setExchangeRate: (rate: number) => set({ exchangeRate: rate }),

  loadSettings: async () => {
    try {
      const theme = await AsyncStorage.getItem('app_theme');
      const currency = await AsyncStorage.getItem('app_currency');
      set({
        theme: (theme === 'light' ? 'light' : 'dark') as ThemeMode,
        currency: (currency === 'UZS' ? 'UZS' : 'USD') as CurrencyMode,
      });
    } catch {}
  },
}));
