import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { LogOut, TrendingUp, Clock, CheckCircle, Truck, XCircle, Zap, Users, Boxes, Package, Wrench } from 'lucide-react-native';
import { api } from '../_layout';
import { colors, formatPrice } from '../../src/utils/theme';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('');
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      const data = await api('/statistics');
      setStats(data);
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) setUserName(JSON.parse(userStr).name || 'Admin');
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchData(); }, []);

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    router.replace('/');
  };

  if (loading) return <SafeAreaView style={s.c}><ActivityIndicator size="large" color={colors.accent} style={{ flex: 1 }} /></SafeAreaView>;

  const statCards = [
    { icon: Clock, val: stats?.pending_orders || 0, label: 'Kutilmoqda', color: colors.warning },
    { icon: Zap, val: stats?.preparing_orders || 0, label: 'Tayyorlanmoqda', color: colors.blue },
    { icon: CheckCircle, val: (stats?.ready_orders || 0), label: 'Tayyor', color: colors.success },
    { icon: Truck, val: stats?.delivered_orders || 0, label: 'Yetkazildi', color: '#00C853' },
  ];

  return (
    <SafeAreaView style={s.c}>
      <View style={s.header}>
        <View>
          <Text style={s.hi}>Xush kelibsiz</Text>
          <Text style={s.name}>{userName}</Text>
        </View>
        <TouchableOpacity testID="admin-logout-btn" onPress={handleLogout} style={s.logoutBtn}>
          <LogOut size={20} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#fff" />} contentContainerStyle={s.scroll}>
        {/* Revenue Hero */}
        <View style={s.heroWrap}>
          <LinearGradient colors={['#6C63FF', '#4A43CC']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
            <View style={s.heroRow}>
              <TrendingUp size={20} color="rgba(255,255,255,0.7)" />
              <Text style={s.heroLabel}>Umumiy Daromad</Text>
            </View>
            <Text style={s.heroVal}>{formatPrice(stats?.total_revenue || 0)}</Text>
            <Text style={s.heroSub}>{stats?.total_orders || 0} ta buyurtma</Text>
          </LinearGradient>
        </View>
        {/* Status Grid */}
        <View style={s.grid}>
          {statCards.map((c, i) => (
            <View key={i} style={s.statCard}>
              <View style={[s.statIcon, { backgroundColor: c.color + '18' }]}>
                <c.icon size={18} color={c.color} />
              </View>
              <Text style={s.statVal}>{c.val}</Text>
              <Text style={s.statLabel}>{c.label}</Text>
            </View>
          ))}
        </View>
        {/* Info Row */}
        <View style={s.infoRow}>
          {[
            { icon: Users, val: stats?.total_dealers || 0, label: 'Dilerlar', color: '#6C63FF' },
            { icon: Wrench, val: stats?.total_workers || 0, label: 'Ishchilar', color: '#448AFF' },
            { icon: Boxes, val: stats?.total_materials || 0, label: 'Materiallar', color: '#FFB300' },
            { icon: XCircle, val: stats?.rejected_orders || 0, label: 'Rad etilgan', color: '#FF5252' },
          ].map((c, i) => (
            <View key={i} style={s.infoCard}>
              <c.icon size={18} color={c.color} />
              <Text style={s.infoVal}>{c.val}</Text>
              <Text style={s.infoLabel}>{c.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16 },
  hi: { fontSize: 13, color: colors.textSec, fontWeight: '500' },
  name: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  logoutBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.cardBorder },
  scroll: { paddingHorizontal: 24, paddingBottom: 100 },
  heroWrap: { marginBottom: 20, borderRadius: 24, overflow: 'hidden' },
  hero: { padding: 28, borderRadius: 24 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  heroLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  heroVal: { fontSize: 38, fontWeight: '800', color: '#fff', letterSpacing: -2 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statCard: { width: '48%', flexGrow: 1, backgroundColor: colors.card, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: colors.cardBorder, gap: 8 },
  statIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statVal: { fontSize: 28, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 11, color: colors.textSec, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600' },
  infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  infoCard: { width: '48%', flexGrow: 1, backgroundColor: colors.card, borderRadius: 18, padding: 16, gap: 6, borderWidth: 1, borderColor: colors.cardBorder },
  infoVal: { fontSize: 22, fontWeight: '700', color: '#fff' },
  infoLabel: { fontSize: 11, color: colors.textSec, fontWeight: '500' },
});
