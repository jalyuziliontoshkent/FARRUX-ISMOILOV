import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Modal, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wrench, Plus, X, UserCheck, CheckCircle, Hash, Truck, Phone, User } from 'lucide-react-native';
import { api } from '../_layout';
import { colors, formatPrice, statusLabels, statusColors } from '../../src/utils/theme';

export default function AdminWorkers() {
  const [tab, setTab] = useState<'workers'|'orders'>('workers');
  const [workers, setWorkers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [showDelivery, setShowDelivery] = useState(false);
  const [wForm, setWForm] = useState({ name: '', email: '', password: '', phone: '', specialty: '' });
  const [dForm, setDForm] = useState({ driver_name: '', driver_phone: '', plate_number: '' });
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [w, o] = await Promise.all([api('/workers'), api('/orders')]);
      setWorkers(w);
      setOrders(o.filter((x: any) => ['tasdiqlangan','tayyorlanmoqda','tayyor','yetkazilmoqda'].includes(x.status)));
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchAll(); }, []);

  const addWorker = async () => {
    if (!wForm.name || !wForm.email || !wForm.password) return;
    try { await api('/workers', { method: 'POST', body: JSON.stringify(wForm) }); setShowAddWorker(false); setWForm({ name: '', email: '', password: '', phone: '', specialty: '' }); fetchAll(); }
    catch (e) { console.error(e); }
  };

  const assignItem = async (orderId: string, itemIdx: number, workerId: string) => {
    try { await api(`/orders/${orderId}/items/${itemIdx}/assign`, { method: 'PUT', body: JSON.stringify({ worker_id: workerId }) }); fetchAll(); }
    catch (e) { console.error(e); }
  };

  const assignDelivery = async () => {
    if (!selectedOrder || !dForm.driver_name) return;
    try {
      await api(`/orders/${selectedOrder.id}/delivery`, { method: 'PUT', body: JSON.stringify(dForm) });
      setShowDelivery(false); setDForm({ driver_name: '', driver_phone: '', plate_number: '' }); fetchAll();
    } catch (e) { console.error(e); }
  };

  const confirmDelivery = async (orderId: string) => {
    try { await api(`/orders/${orderId}/confirm-delivery`, { method: 'PUT' }); fetchAll(); }
    catch (e) { console.error(e); }
  };

  if (loading) return <SafeAreaView style={s.c}><ActivityIndicator size="large" color={colors.accent} style={{ flex: 1 }} /></SafeAreaView>;

  return (
    <SafeAreaView style={s.c}>
      <Text style={s.title}>Boshqaruv</Text>
      <View style={s.tabs}>
        {[{ k: 'workers' as const, l: 'Ishchilar', cnt: workers.length }, { k: 'orders' as const, l: 'Buyurtmalar', cnt: orders.length }].map(t => (
          <TouchableOpacity key={t.k} style={[s.tabBtn, tab === t.k && s.tabActive]} onPress={() => setTab(t.k)}>
            <Text style={[s.tabText, tab === t.k && s.tabTextActive]}>{t.l}</Text>
            <View style={[s.tabBadge, tab === t.k && s.tabBadgeActive]}><Text style={[s.tabBadgeText, tab === t.k && s.tabBadgeTextActive]}>{t.cnt}</Text></View>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(); }} tintColor="#fff" />} contentContainerStyle={s.scroll}>
        {tab === 'workers' && (
          <>
            <TouchableOpacity testID="add-worker-btn" style={s.addBtn} onPress={() => setShowAddWorker(true)}>
              <Plus size={16} color="#fff" /><Text style={s.addBtnText}>Ishchi qo'shish</Text>
            </TouchableOpacity>
            {workers.map(w => (
              <View key={w.id} style={s.card} testID={`worker-${w.id}`}>
                <View style={s.cardRow}>
                  <View style={s.avatar}><Text style={s.avatarText}>{w.name?.charAt(0)}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.cardName}>{w.name}</Text>
                    <Text style={s.cardSub}>{w.email}</Text>
                    {w.specialty ? <Text style={s.spec}>{w.specialty}</Text> : null}
                  </View>
                  <TouchableOpacity testID={`del-worker-${w.id}`} onPress={async () => { await api(`/workers/${w.id}`, { method: 'DELETE' }); fetchAll(); }} style={s.delBtn}>
                    <X size={14} color="rgba(255,255,255,0.3)" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}
        {tab === 'orders' && (
          <>
            {orders.length === 0 ? (
              <View style={s.empty}><Package size={48} color="rgba(255,255,255,0.08)" /><Text style={s.emptyText}>Buyurtmalar yo'q</Text></View>
            ) : orders.map(order => (
              <View key={order.id} style={s.orderCard} testID={`manage-order-${order.id}`}>
                <View style={s.orderHead}>
                  <View style={s.codeBadge}><Hash size={12} color={colors.accent} /><Text style={s.codeText}>{order.order_code}</Text></View>
                  <View style={[s.statusBadge, { backgroundColor: (statusColors[order.status] || '#fff') + '18' }]}>
                    <View style={[s.statusDot, { backgroundColor: statusColors[order.status] }]} />
                    <Text style={[s.statusLabel, { color: statusColors[order.status] }]}>{statusLabels[order.status]}</Text>
                  </View>
                </View>
                <Text style={s.dealer}>{order.dealer_name} - {formatPrice(order.total_price)}</Text>
                {/* Items with worker assign */}
                {order.items?.map((item: any, idx: number) => (
                  <View key={idx} style={s.itemRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.itemName}>{item.material_name}</Text>
                      <Text style={s.itemSize}>{item.width}m x {item.height}m = {item.sqm} kv.m</Text>
                    </View>
                    {item.assigned_worker_name ? (
                      <View style={s.assignedBadge}>
                        <UserCheck size={12} color={item.worker_status === 'completed' ? colors.success : colors.accent} />
                        <Text style={[s.assignedText, { color: item.worker_status === 'completed' ? colors.success : colors.accent }]}>{item.assigned_worker_name}</Text>
                        {item.worker_status === 'completed' && <Text style={s.checkMark}>done</Text>}
                      </View>
                    ) : (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {workers.map(w => (
                          <TouchableOpacity key={w.id} testID={`assign-${order.id}-${idx}-${w.id}`} style={s.assignBtn} onPress={() => assignItem(order.id, idx, w.id)}>
                            <Text style={s.assignBtnText}>{w.name.split(' ')[0]}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    )}
                  </View>
                ))}
                {/* Delivery section */}
                <View style={s.deliverySection}>
                  {order.delivery_info ? (
                    <View style={s.deliveryInfo}>
                      <Truck size={16} color={colors.blue} />
                      <View style={{ flex: 1 }}>
                        <Text style={s.driverName}>{order.delivery_info.driver_name}</Text>
                        <Text style={s.driverPhone}>{order.delivery_info.driver_phone} {order.delivery_info.plate_number ? '| ' + order.delivery_info.plate_number : ''}</Text>
                      </View>
                    </View>
                  ) : (order.status === 'tayyor' || order.status === 'tayyorlanmoqda') ? (
                    <TouchableOpacity testID={`add-delivery-${order.id}`} style={s.deliveryBtn} onPress={() => { setSelectedOrder(order); setShowDelivery(true); }}>
                      <Truck size={14} color="#fff" /><Text style={s.deliveryBtnText}>Yetkazish biriktirish</Text>
                    </TouchableOpacity>
                  ) : null}
                  {order.status === 'yetkazilmoqda' && (
                    <TouchableOpacity testID={`confirm-${order.id}`} style={s.confirmBtn} onPress={() => confirmDelivery(order.id)}>
                      <CheckCircle size={16} color="#000" /><Text style={s.confirmText}>Topshirildi</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
      {/* Add Worker Modal */}
      <Modal visible={showAddWorker} transparent animationType="slide">
        <View style={s.modalBg}><View style={s.modal}>
          <View style={s.modalH}><Text style={s.modalTitle}>Yangi Ishchi</Text><TouchableOpacity testID="close-add-worker" onPress={() => setShowAddWorker(false)}><X size={22} color="rgba(255,255,255,0.4)" /></TouchableOpacity></View>
          <ScrollView style={s.modalBody}>
            {[{ k: 'name', l: 'Ism', p: 'Ism', kb: 'default' as const }, { k: 'email', l: 'Email', p: 'email@...', kb: 'email-address' as const }, { k: 'password', l: 'Parol', p: 'Parol', kb: 'default' as const }, { k: 'phone', l: 'Telefon', p: '+998...', kb: 'phone-pad' as const }, { k: 'specialty', l: 'Mutaxassislik', p: 'Jalyuzi', kb: 'default' as const }].map(f => (
              <View key={f.k}>
                <Text style={s.label}>{f.l}</Text>
                <TextInput testID={`worker-${f.k}`} style={s.modalInput} value={(wForm as any)[f.k]} onChangeText={v => setWForm({...wForm, [f.k]: v})} placeholder={f.p} placeholderTextColor="rgba(255,255,255,0.2)" keyboardType={f.kb} secureTextEntry={f.k === 'password'} autoCapitalize={f.k === 'email' ? 'none' : 'words'} />
              </View>
            ))}
            <TouchableOpacity testID="save-worker" style={s.saveBtn} onPress={addWorker}><Text style={s.saveBtnText}>Saqlash</Text></TouchableOpacity>
          </ScrollView>
        </View></View>
      </Modal>
      {/* Add Delivery Modal */}
      <Modal visible={showDelivery} transparent animationType="slide">
        <View style={s.modalBg}><View style={s.modal}>
          <View style={s.modalH}><Text style={s.modalTitle}>Yetkazish ma'lumoti</Text><TouchableOpacity testID="close-delivery" onPress={() => setShowDelivery(false)}><X size={22} color="rgba(255,255,255,0.4)" /></TouchableOpacity></View>
          <ScrollView style={s.modalBody}>
            <Text style={s.label}>Haydovchi ismi</Text>
            <TextInput testID="delivery-driver" style={s.modalInput} value={dForm.driver_name} onChangeText={v => setDForm({...dForm, driver_name: v})} placeholder="Ism" placeholderTextColor="rgba(255,255,255,0.2)" />
            <Text style={s.label}>Telefon</Text>
            <TextInput testID="delivery-phone" style={s.modalInput} value={dForm.driver_phone} onChangeText={v => setDForm({...dForm, driver_phone: v})} placeholder="+998..." placeholderTextColor="rgba(255,255,255,0.2)" keyboardType="phone-pad" />
            <Text style={s.label}>Mashina raqami (ixtiyoriy)</Text>
            <TextInput testID="delivery-plate" style={s.modalInput} value={dForm.plate_number} onChangeText={v => setDForm({...dForm, plate_number: v})} placeholder="01A123BC" placeholderTextColor="rgba(255,255,255,0.2)" autoCapitalize="characters" />
            <TouchableOpacity testID="save-delivery" style={s.saveBtn} onPress={assignDelivery}><Text style={s.saveBtnText}>Biriktirish</Text></TouchableOpacity>
          </ScrollView>
        </View></View>
      </Modal>
    </SafeAreaView>
  );
}

const Package = ({ size, color }: any) => <View style={{ width: size, height: size }} />;

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: colors.bg },
  title: { fontSize: 26, fontWeight: '800', color: '#fff', paddingHorizontal: 24, paddingTop: 16, letterSpacing: -0.5 },
  tabs: { flexDirection: 'row', paddingHorizontal: 24, marginTop: 16, gap: 10 },
  tabBtn: { flex: 1, height: 44, borderRadius: 22, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: colors.cardBorder },
  tabActive: { backgroundColor: colors.accent },
  tabText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.4)' },
  tabTextActive: { color: '#fff' },
  tabBadge: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  tabBadgeActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  tabBadgeText: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.4)' },
  tabBadgeTextActive: { color: '#fff' },
  scroll: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 100 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 48, backgroundColor: colors.accent, borderRadius: 24, marginBottom: 16 },
  addBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  card: { backgroundColor: colors.card, borderRadius: 20, borderWidth: 1, borderColor: colors.cardBorder, padding: 16, marginBottom: 10 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '700', color: colors.accent },
  cardName: { fontSize: 16, fontWeight: '600', color: '#fff' },
  cardSub: { fontSize: 12, color: colors.textSec, marginTop: 1 },
  spec: { fontSize: 11, color: colors.warning, marginTop: 2, fontWeight: '500' },
  delBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: colors.textTer },
  orderCard: { backgroundColor: colors.card, borderRadius: 22, borderWidth: 1, borderColor: colors.cardBorder, padding: 18, marginBottom: 14 },
  orderHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  codeBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.accentSoft, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  codeText: { fontSize: 14, fontWeight: '800', color: colors.accent, letterSpacing: 1.5, fontVariant: ['tabular-nums'] },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, gap: 5 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  dealer: { fontSize: 13, color: colors.textSec, marginBottom: 8 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)', gap: 8 },
  itemName: { fontSize: 14, fontWeight: '600', color: '#fff' },
  itemSize: { fontSize: 11, color: colors.textTer },
  assignedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.accentSoft, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  assignedText: { fontSize: 11, fontWeight: '700' },
  checkMark: { fontSize: 9, color: colors.success, fontWeight: '700', textTransform: 'uppercase', marginLeft: 2 },
  assignBtn: { backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 12, marginRight: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  assignBtnText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  deliverySection: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', gap: 8 },
  deliveryInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.blueSoft, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: 'rgba(68,138,255,0.15)' },
  driverName: { fontSize: 14, fontWeight: '600', color: '#fff' },
  driverPhone: { fontSize: 12, color: colors.textSec, marginTop: 2 },
  deliveryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 44, backgroundColor: colors.blue, borderRadius: 22 },
  deliveryBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  confirmBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 48, backgroundColor: colors.success, borderRadius: 24 },
  confirmText: { fontSize: 14, fontWeight: '700', color: '#000' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#0a0a0f', borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', maxHeight: '80%' },
  modalH: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 22, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  modalBody: { padding: 22, paddingBottom: 40 },
  label: { fontSize: 11, color: colors.textSec, marginBottom: 6, marginTop: 14, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600' },
  modalInput: { height: 52, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, borderWidth: 1, borderColor: colors.cardBorder, paddingHorizontal: 18, fontSize: 15, color: '#fff' },
  saveBtn: { height: 56, backgroundColor: colors.accent, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
