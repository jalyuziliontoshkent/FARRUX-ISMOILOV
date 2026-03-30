import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { LogOut, Clock, Zap, Truck, CreditCard } from 'lucide-react-native';
import { api } from '../_layout';
import { colors, formatPrice, statusColors, statusLabels } from '../../src/utils/theme';

export default function DealerDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      const [ordersData, userData] = await Promise.all([api('/orders'), AsyncStorage.getItem('user')]);
      setOrders(ordersData);
      if (userData) setUser(JSON.parse(userData));
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchData(); }, []);

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    router.replace('/');
  };

  if (loading) {
    return <SafeAreaView style={s.container}><ActivityIndicator size="large" color="#fff" style={{ flex: 1 }} /></SafeAreaView>;
  }

  const pending = orders.filter(o => o.status === 'kutilmoqda').length;
  const preparing = orders.filter(o => o.status === 'tayyorlanmoqda').length;
  const delivered = orders.filter(o => o.status === 'yetkazildi').length;

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Xush kelibsiz,</Text>
          <Text style={s.userName}>{user?.name || 'Diler'}</Text>
        </View>
        <TouchableOpacity testID="dealer-logout-btn" onPress={handleLogout} style={s.logoutBtn}>
          <LogOut size={20} color="rgba(255,255,255,0.5)" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#fff" />}
        contentContainerStyle={s.scrollContent}
      >
        {/* Credit card */}
        <View style={s.creditCard}>
          <View style={s.creditTop}>
            <CreditCard size={18} color="rgba(255,255,255,0.4)" />
            <Text style={s.creditTopLabel}>Hisobim</Text>
          </View>
          <View style={s.creditRow}>
            <View style={s.creditItem}>
              <Text style={s.creditLabel}>Kredit Limit</Text>
              <Text style={s.creditValue}>{formatPrice(user?.credit_limit || 0)}</Text>
            </View>
            <View style={s.creditDivider} />
            <View style={s.creditItem}>
              <Text style={s.creditLabel}>Qarz</Text>
              <Text style={[s.creditValue, (user?.debt || 0) > 0 && s.debtColor]}>
                {formatPrice(user?.debt || 0)}
              </Text>
            </View>
          </View>
        </View>

        {/* Status cards */}
        <View style={s.statusRow}>
          <View style={[s.statusCard, { borderLeftColor: '#FFB300' }]}>
            <Clock size={16} color="#FFB300" />
            <Text style={s.statusVal}>{pending}</Text>
            <Text style={s.statusLabel}>Kutilmoqda</Text>
          </View>
          <View style={[s.statusCard, { borderLeftColor: '#448AFF' }]}>
            <Zap size={16} color="#448AFF" />
            <Text style={s.statusVal}>{preparing}</Text>
            <Text style={s.statusLabel}>Tayyorlanmoqda</Text>
          </View>
          <View style={[s.statusCard, { borderLeftColor: '#00E676' }]}>
            <Truck size={16} color="#00E676" />
            <Text style={s.statusVal}>{delivered}</Text>
            <Text style={s.statusLabel}>Yetkazildi</Text>
          </View>
        </View>

        {/* Recent orders */}
        {orders.length > 0 && (
          <>
            <Text style={s.sectionTitle}>So'nggi Buyurtmalar</Text>
            {orders.slice(0, 5).map(order => (
              <View key={order.id} style={s.orderCard} testID={`dealer-order-${order.id}`}>
                <View style={s.orderHeader}>
                  <Text style={s.orderDate}>{new Date(order.created_at).toLocaleDateString('uz-UZ')}</Text>
                  <View style={[s.statusBadge, { backgroundColor: (statusColors[order.status] || '#fff') + '18' }]}>
                    <View style={[s.statusDot, { backgroundColor: statusColors[order.status] }]} />
                    <Text style={[s.statusText, { color: statusColors[order.status] }]}>{statusLabels[order.status]}</Text>
                  </View>
                </View>
                {/* Items preview with images */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.itemsPreview}>
                  {order.items?.map((item: any, i: number) => (
                    <View key={i} style={s.itemThumb}>
                      <Text style={s.itemThumbName} numberOfLines={1}>{item.material_name}</Text>
                      <Text style={s.itemThumbSize}>{item.width}×{item.height}m</Text>
                    </View>
                  ))}
                </ScrollView>
                <View style={s.orderFooter}>
                  <Text style={s.orderSqm}>{order.total_sqm} kv.m</Text>
                  <Text style={s.orderPrice}>{formatPrice(order.total_price)}</Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16 },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,0.4)' },
  userName: { fontSize: 28, fontWeight: '700', color: '#fff', letterSpacing: -1 },
  logoutBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 100 },
  creditCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 16 },
  creditTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  creditTopLabel: { fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: '600' },
  creditRow: { flexDirection: 'row', alignItems: 'center' },
  creditItem: { flex: 1, alignItems: 'center' },
  creditDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.08)' },
  creditLabel: { fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  creditValue: { fontSize: 22, fontWeight: '300', color: '#fff' },
  debtColor: { color: '#FF5252' },
  statusRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statusCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 18, padding: 14, borderLeftWidth: 3, gap: 4 },
  statusVal: { fontSize: 26, fontWeight: '300', color: '#fff' },
  statusLabel: { fontSize: 9, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionTitle: { fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12, fontWeight: '600' },
  orderCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', padding: 16, marginBottom: 10 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderDate: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, gap: 5 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  itemsPreview: { marginTop: 12 },
  itemThumb: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8 },
  itemThumbName: { fontSize: 12, fontWeight: '600', color: '#fff' },
  itemThumbSize: { fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 1 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.04)' },
  orderSqm: { fontSize: 13, color: 'rgba(255,255,255,0.4)' },
  orderPrice: { fontSize: 17, fontWeight: '600', color: '#fff' },
});
