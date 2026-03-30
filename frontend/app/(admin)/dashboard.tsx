import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Modal, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { LogOut, TrendingUp, Clock, CheckCircle, Truck, XCircle, Zap, Users, Boxes, Wrench, Settings, X } from 'lucide-react-native';
import { api } from '../_layout';
import { colors, formatPrice } from '../../src/utils/theme';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ email: '', current_password: '', password: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      const data = await api('/statistics');
      setStats(data);
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        setUserName(u.name || 'Admin');
        setUserEmail(u.email || '');
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchData(); }, []);

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    router.replace('/');
  };

  const openProfile = () => {
    setProfileForm({ email: userEmail, current_password: '', password: '' });
    setProfileMsg(''); setProfileErr('');
    setShowProfile(true);
  };

  const saveProfile = async () => {
    if (!profileForm.current_password) { setProfileErr('Joriy parolni kiriting'); return; }
    setProfileLoading(true); setProfileErr(''); setProfileMsg('');
    try {
      const res = await api('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileForm),
      });
      await AsyncStorage.setItem('token', res.token);
      await AsyncStorage.setItem('user', JSON.stringify(res.user));
      setUserName(res.user.name || 'Admin');
      setUserEmail(res.user.email || '');
      setProfileMsg('Profil yangilandi!');
      setProfileForm({ ...profileForm, current_password: '', password: '' });
    } catch (e: any) { setProfileErr(e.message || 'Xatolik'); }
    finally { setProfileLoading(false); }
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
        <View style={s.headerBtns}>
          <TouchableOpacity testID="admin-profile-btn" onPress={openProfile} style={s.headerBtn}>
            <Settings size={20} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>
          <TouchableOpacity testID="admin-logout-btn" onPress={handleLogout} style={s.headerBtn}>
            <LogOut size={20} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>
        </View>
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

      {/* Profile Modal */}
      <Modal visible={showProfile} transparent animationType="slide">
        <View style={s.modalBg}><View style={s.modal}>
          <View style={s.modalH}>
            <Text style={s.modalTitle}>Profil sozlamalari</Text>
            <TouchableOpacity testID="close-profile" onPress={() => setShowProfile(false)}>
              <X size={22} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>
          </View>
          <ScrollView style={s.modalBody}>
            {profileMsg ? <View style={s.successBox}><Text style={s.successText}>{profileMsg}</Text></View> : null}
            {profileErr ? <View style={s.errorBox}><Text style={s.errorText}>{profileErr}</Text></View> : null}

            <Text style={s.label}>Yangi Email</Text>
            <TextInput
              testID="profile-email"
              style={s.modalInput}
              value={profileForm.email}
              onChangeText={v => setProfileForm({...profileForm, email: v})}
              placeholder="email@..."
              placeholderTextColor="rgba(255,255,255,0.2)"
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={s.label}>Yangi Parol (bo'sh qoldiring o'zgarmaslik uchun)</Text>
            <TextInput
              testID="profile-new-password"
              style={s.modalInput}
              value={profileForm.password}
              onChangeText={v => setProfileForm({...profileForm, password: v})}
              placeholder="Yangi parol"
              placeholderTextColor="rgba(255,255,255,0.2)"
              secureTextEntry
            />

            <Text style={[s.label, { marginTop: 24, color: colors.warning }]}>Joriy Parol (majburiy)</Text>
            <TextInput
              testID="profile-current-password"
              style={[s.modalInput, { borderColor: 'rgba(255,179,0,0.3)' }]}
              value={profileForm.current_password}
              onChangeText={v => setProfileForm({...profileForm, current_password: v})}
              placeholder="Joriy parol"
              placeholderTextColor="rgba(255,255,255,0.2)"
              secureTextEntry
            />

            <TouchableOpacity testID="save-profile" style={s.saveBtn} onPress={saveProfile} disabled={profileLoading}>
              {profileLoading ? <ActivityIndicator color="#fff" /> : <Text style={s.saveBtnText}>Saqlash</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View></View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16 },
  hi: { fontSize: 13, color: colors.textSec, fontWeight: '500' },
  name: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  headerBtns: { flexDirection: 'row', gap: 8 },
  headerBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.cardBorder },
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
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#0a0a0f', borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', maxHeight: '80%' },
  modalH: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 22, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  modalBody: { padding: 22, paddingBottom: 40 },
  label: { fontSize: 11, color: colors.textSec, marginBottom: 6, marginTop: 14, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600' },
  modalInput: { height: 52, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, borderWidth: 1, borderColor: colors.cardBorder, paddingHorizontal: 18, fontSize: 15, color: '#fff' },
  saveBtn: { height: 56, backgroundColor: colors.accent, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  successBox: { backgroundColor: colors.successSoft, borderRadius: 14, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(0,230,118,0.2)' },
  successText: { color: colors.success, fontSize: 13, textAlign: 'center', fontWeight: '600' },
  errorBox: { backgroundColor: colors.dangerSoft, borderRadius: 14, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,82,82,0.2)' },
  errorText: { color: colors.danger, fontSize: 13, textAlign: 'center' },
});
