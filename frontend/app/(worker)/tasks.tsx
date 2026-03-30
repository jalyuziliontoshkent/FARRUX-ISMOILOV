import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { LogOut, Wrench, Check, AlertCircle } from 'lucide-react-native';
import { api } from '../_layout';
import { colors } from '../../src/utils/theme';

export default function WorkerTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('');
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      const data = await api('/worker/tasks');
      setTasks(data.filter((t: any) => t.worker_status !== 'completed'));
      const u = await AsyncStorage.getItem('user');
      if (u) setUserName(JSON.parse(u).name || 'Ishchi');
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchData(); }, []);

  const completeTask = async (orderId: string, itemIdx: number) => {
    try {
      await api(`/worker/tasks/${orderId}/${itemIdx}/complete`, { method: 'PUT' });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    router.replace('/');
  };

  if (loading) return <SafeAreaView style={s.container}><ActivityIndicator size="large" color="#fff" style={{ flex: 1 }} /></SafeAreaView>;

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Xush kelibsiz,</Text>
          <Text style={s.userName}>{userName}</Text>
        </View>
        <TouchableOpacity testID="worker-logout-btn" onPress={handleLogout} style={s.logoutBtn}>
          <LogOut size={20} color="rgba(255,255,255,0.5)" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#fff" />}
        contentContainerStyle={s.scrollContent}
      >
        <View style={s.countRow}>
          <Wrench size={16} color="#FFB300" />
          <Text style={s.countText}>{tasks.length} ta vazifa kutmoqda</Text>
        </View>

        {tasks.length === 0 ? (
          <View style={s.emptyState}>
            <AlertCircle size={48} color="rgba(255,255,255,0.1)" />
            <Text style={s.emptyText}>Hozircha vazifa yo'q</Text>
          </View>
        ) : tasks.map((t, i) => (
          <View key={`${t.order_id}-${t.item_index}`} style={s.taskCard} testID={`task-${i}`}>
            <View style={s.taskHeader}>
              <View style={s.codeBadge}><Text style={s.codeText}>{t.order_code}</Text></View>
              <View style={[s.statusBadge, t.worker_status === 'assigned' ? s.assignedBadge : s.inProgressBadge]}>
                <Text style={s.statusText}>{t.worker_status === 'assigned' ? 'Yangi' : 'Jarayonda'}</Text>
              </View>
            </View>
            <Text style={s.taskMaterial}>{t.material_name}</Text>
            <Text style={s.taskSize}>{t.width}m × {t.height}m = {t.sqm} kv.m</Text>
            <Text style={s.taskDealer}>Diler: {t.dealer_name}</Text>
            {t.notes ? <Text style={s.taskNotes}>Izoh: {t.notes}</Text> : null}
            <TouchableOpacity
              testID={`complete-task-${i}`}
              style={s.completeBtn}
              onPress={() => completeTask(t.order_id, t.item_index)}
            >
              <Check size={18} color="#000" />
              <Text style={s.completeBtnText}>Tayyor</Text>
            </TouchableOpacity>
          </View>
        ))}
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
  countRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  countText: { fontSize: 14, color: '#FFB300', fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16, color: 'rgba(255,255,255,0.3)' },
  taskCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', padding: 18, marginBottom: 12 },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  codeBadge: { backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  codeText: { fontSize: 12, fontWeight: '700', color: '#fff', fontVariant: ['tabular-nums'], letterSpacing: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  assignedBadge: { backgroundColor: 'rgba(255,179,0,0.15)' },
  inProgressBadge: { backgroundColor: 'rgba(68,138,255,0.15)' },
  statusText: { fontSize: 11, fontWeight: '700', color: '#FFB300', textTransform: 'uppercase' },
  taskMaterial: { fontSize: 18, fontWeight: '600', color: '#fff' },
  taskSize: { fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  taskDealer: { fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 6 },
  taskNotes: { fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4, fontStyle: 'italic' },
  completeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, backgroundColor: '#00E676', borderRadius: 24, marginTop: 14 },
  completeBtnText: { fontSize: 15, fontWeight: '700', color: '#000' },
});
