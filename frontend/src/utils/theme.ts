import { useAppStore } from './store';

export const darkColors = {
  bg: '#050508',
  card: 'rgba(255,255,255,0.035)',
  cardBorder: 'rgba(255,255,255,0.07)',
  text: '#FFFFFF',
  textSec: 'rgba(255,255,255,0.45)',
  textTer: 'rgba(255,255,255,0.25)',
  accent: '#6C63FF',
  accentSoft: 'rgba(108,99,255,0.15)',
  success: '#00E676',
  successSoft: 'rgba(0,230,118,0.12)',
  warning: '#FFB300',
  warningSoft: 'rgba(255,179,0,0.12)',
  danger: '#FF5252',
  dangerSoft: 'rgba(255,82,82,0.1)',
  blue: '#448AFF',
  blueSoft: 'rgba(68,138,255,0.12)',
  pending: '#FFB300',
  approved: '#6C63FF',
  preparing: '#448AFF',
  ready: '#00E676',
  delivered: '#00C853',
  rejected: '#FF5252',
  inputBg: 'rgba(255,255,255,0.06)',
  inputBorder: 'rgba(255,255,255,0.1)',
  placeholder: 'rgba(255,255,255,0.25)',
  modalBg: '#0a0a0a',
  tabBg: 'rgba(5,5,8,0.97)',
  tabBorder: 'rgba(255,255,255,0.05)',
  statusBar: 'light' as const,
};

export const lightColors = {
  bg: '#F5F5F7',
  card: 'rgba(0,0,0,0.03)',
  cardBorder: 'rgba(0,0,0,0.08)',
  text: '#1A1A1A',
  textSec: 'rgba(0,0,0,0.5)',
  textTer: 'rgba(0,0,0,0.3)',
  accent: '#6C63FF',
  accentSoft: 'rgba(108,99,255,0.1)',
  success: '#00C853',
  successSoft: 'rgba(0,200,83,0.1)',
  warning: '#FF8F00',
  warningSoft: 'rgba(255,143,0,0.1)',
  danger: '#D32F2F',
  dangerSoft: 'rgba(211,47,47,0.08)',
  blue: '#1565C0',
  blueSoft: 'rgba(21,101,192,0.08)',
  pending: '#FF8F00',
  approved: '#6C63FF',
  preparing: '#1565C0',
  ready: '#00C853',
  delivered: '#00C853',
  rejected: '#D32F2F',
  inputBg: 'rgba(0,0,0,0.04)',
  inputBorder: 'rgba(0,0,0,0.12)',
  placeholder: 'rgba(0,0,0,0.3)',
  modalBg: '#FFFFFF',
  tabBg: 'rgba(255,255,255,0.97)',
  tabBorder: 'rgba(0,0,0,0.08)',
  statusBar: 'dark' as const,
};

// Backward compatibility — default dark
export const colors = darkColors;

export const useTheme = () => {
  const theme = useAppStore((s) => s.theme);
  return theme === 'light' ? lightColors : darkColors;
};

export const useCurrency = () => {
  const currency = useAppStore((s) => s.currency);
  const exchangeRate = useAppStore((s) => s.exchangeRate);
  const toggleCurrency = useAppStore((s) => s.toggleCurrency);

  const formatPrice = (usd: number) => {
    if (currency === 'UZS') {
      const uzs = usd * exchangeRate;
      return uzs.toLocaleString('uz-UZ', { maximumFractionDigits: 0 }) + " so'm";
    }
    return '$' + usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return { currency, exchangeRate, toggleCurrency, formatPrice };
};

export const statusColors: Record<string, string> = {
  kutilmoqda: darkColors.pending,
  tasdiqlangan: darkColors.approved,
  tayyorlanmoqda: darkColors.preparing,
  tayyor: darkColors.ready,
  yetkazilmoqda: darkColors.blue,
  yetkazildi: darkColors.delivered,
  rad_etilgan: darkColors.rejected,
};

export const statusLabels: Record<string, string> = {
  kutilmoqda: 'Kutilmoqda',
  tasdiqlangan: 'Tasdiqlangan',
  tayyorlanmoqda: 'Tayyorlanmoqda',
  tayyor: 'Tayyor',
  yetkazilmoqda: 'Yetkazilmoqda',
  yetkazildi: 'Yetkazildi',
  rad_etilgan: 'Rad etilgan',
};

export const formatPrice = (v: number) => {
  return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
