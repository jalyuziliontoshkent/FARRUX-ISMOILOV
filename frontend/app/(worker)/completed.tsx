import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle } from 'lucide-react-native';
import { api } from '../_layout';
import { colors } from '../../src/utils/theme';

export default function WorkerCompleted() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const data = await api('/worker/tasks');
      setTasks(data.filter((t: any) => t.worker_status === 'completed'));
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchData(); }, []);

  if (loading) return <SafeAreaView style={s.container}><ActivityIndicator size="large" color="#fff" style={{ flex: 1 }} /></SafeAreaView>;

  return (
    <SafeAreaView style={s.container}>
      <Text style={s.title}>Bajarilgan</Text>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#fff" />}
        contentContainerStyle={s.scrollContent}
      >
        {tasks.length === 0 ? (
          <View style={s.emptyState}>
            <CheckCircle size={48} color="rgba(255,255,255,0.1)" />
            <Text style={s.emptyText}>Hali bajarilgan vazifa yo'q</Text>
          </View>
        ) : tasks.map((t, i) => (
          <View key={`${t.order_id}-${t.item_index}`} style={s.card} testID={`completed-${i}`}>
            <View style={s.cardHeader}>
              <View style={s.codeBadge}><Text style={s.codeText}>{t.order_code}</Text></View>
              <View style={s.doneBadge}><CheckCircle size={14} color="#00E676" /><Text style={s.doneText}>Tayyor</Text></View>
            </View>
            <Text style={s.matName}>{t.material_name}</Text>
            <Text style={s.matSize}>{t.width}m × {t.height}m = {t.sqm} kv.m</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  title: { fontSize: 28, fontWeight: '700', color: '#fff', paddingHorizontal: 24, paddingTop: 16, letterSpacing: -1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 100 },
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16, color: 'rgba(255,255,255,0.3)' },
  card: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', padding: 18, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  codeBadge: { backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  codeText: { fontSize: 12, fontWeight: '700', color: '#fff', letterSpacing: 1 },
  doneBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,230,118,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  doneText: { fontSize: 11, fontWeight: '700', color: '#00E676' },
  matName: { fontSize: 16, fontWeight: '600', color: '#fff' },
  matSize: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 },
});
