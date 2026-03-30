import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { LogOut, Package, Users, Boxes, TrendingUp, Clock, CheckCircle, Truck, XCircle, Zap } from 'lucide-react-native';
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

  if (loading) {
    return <SafeAreaView style={styles.container}><ActivityIndicator size="large" color="#fff" style={{ flex: 1 }} /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Xush kelibsiz,</Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>
        <TouchableOpacity testID="admin-logout-btn" onPress={handleLogout} style={styles.logoutBtn}>
          <LogOut size={20} color="rgba(255,255,255,0.5)" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#fff" />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Revenue hero card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <TrendingUp size={20} color="#00E676" />
            <Text style={styles.heroLabel}>Umumiy Daromad</Text>
          </View>
          <Text style={styles.heroValue}>{formatPrice(stats?.total_revenue || 0)}</Text>
          <Text style={styles.heroSub}>{stats?.total_orders || 0} ta buyurtmadan</Text>
        </View>

        {/* Status row */}
        <View style={styles.statusRow}>
          <View style={[styles.statusCard, { borderLeftColor: '#FFB300' }]}>
            <Clock size={16} color="#FFB300" />
            <Text style={styles.statusVal}>{stats?.pending_orders || 0}</Text>
            <Text style={styles.statusLabel}>Kutilmoqda</Text>
          </View>
          <View style={[styles.statusCard, { borderLeftColor: '#448AFF' }]}>
            <Zap size={16} color="#448AFF" />
            <Text style={styles.statusVal}>{stats?.preparing_orders || 0}</Text>
            <Text style={styles.statusLabel}>Tayyorlanmoqda</Text>
          </View>
          <View style={[styles.statusCard, { borderLeftColor: '#00E676' }]}>
            <Truck size={16} color="#00E676" />
            <Text style={styles.statusVal}>{stats?.delivered_orders || 0}</Text>
            <Text style={styles.statusLabel}>Yetkazildi</Text>
          </View>
        </View>

        {/* Info cards */}
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}><Users size={18} color="#fff" /></View>
            <Text style={styles.infoVal}>{stats?.total_dealers || 0}</Text>
            <Text style={styles.infoLabel}>Dilerlar</Text>
          </View>
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}><Boxes size={18} color="#fff" /></View>
            <Text style={styles.infoVal}>{stats?.total_materials || 0}</Text>
            <Text style={styles.infoLabel}>Materiallar</Text>
          </View>
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}><CheckCircle size={18} color="#00C853" /></View>
            <Text style={styles.infoVal}>{stats?.approved_orders || 0}</Text>
            <Text style={styles.infoLabel}>Tasdiqlangan</Text>
          </View>
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}><XCircle size={18} color="#FF5252" /></View>
            <Text style={styles.infoVal}>{stats?.rejected_orders || 0}</Text>
            <Text style={styles.infoLabel}>Rad etilgan</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16 },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,0.4)' },
  userName: { fontSize: 28, fontWeight: '700', color: '#fff', letterSpacing: -1 },
  logoutBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 100 },
  heroCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 16 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  heroLabel: { fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  heroValue: { fontSize: 36, fontWeight: '200', color: '#fff', letterSpacing: -2 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 4 },
  statusRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statusCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 18, padding: 16, borderLeftWidth: 3, gap: 6 },
  statusVal: { fontSize: 28, fontWeight: '300', color: '#fff' },
  statusLabel: { fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  infoCard: { width: '47%', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 18, gap: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  infoIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  infoVal: { fontSize: 24, fontWeight: '300', color: '#fff' },
  infoLabel: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
});
