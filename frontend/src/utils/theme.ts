export const colors = {
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
};

export const statusColors: Record<string, string> = {
  kutilmoqda: colors.pending,
  tasdiqlangan: colors.approved,
  tayyorlanmoqda: colors.preparing,
  tayyor: colors.ready,
  yetkazilmoqda: colors.blue,
  yetkazildi: colors.delivered,
  rad_etilgan: colors.rejected,
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
