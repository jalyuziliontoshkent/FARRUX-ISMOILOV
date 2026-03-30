import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Modal, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wrench, Truck, Plus, X, UserCheck, CheckCircle, Hash } from 'lucide-react-native';
import { api } from '../_layout';
import { colors, formatPrice, statusLabels, statusColors } from '../../src/utils/theme';

export default function AdminWorkers() {
  const [tab, setTab] = useState<'workers'|'vehicles'|'assign'>('workers');
  const [workers, setWorkers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [wForm, setWForm] = useState({ name: '', email: '', password: '', phone: '', specialty: '' });
  const [vForm, setVForm] = useState({ plate_number: '', driver_name: '', driver_phone: '' });
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showAssign, setShowAssign] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [w, v, o] = await Promise.all([api('/workers'), api('/vehicles'), api('/orders')]);
      setWorkers(w); setVehicles(v); setOrders(o.filter((x: any) => ['tasdiqlangan','tayyorlanmoqda','tayyor','yetkazilmoqda'].includes(x.status)));
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchAll(); }, []);

  const addWorker = async () => {
    if (!wForm.name || !wForm.email || !wForm.password) return;
    try { await api('/workers', { method: 'POST', body: JSON.stringify(wForm) }); setShowAddWorker(false); setWForm({ name: '', email: '', password: '', phone: '', specialty: '' }); fetchAll(); }
    catch (e) { console.error(e); }
  };

  const addVehicle = async () => {
    if (!vForm.plate_number || !vForm.driver_name) return;
    try { await api('/vehicles', { method: 'POST', body: JSON.stringify(vForm) }); setShowAddVehicle(false); setVForm({ plate_number: '', driver_name: '', driver_phone: '' }); fetchAll(); }
    catch (e) { console.error(e); }
  };

  const assignItem = async (orderId: string, itemIdx: number, workerId: string) => {
    try { await api(`/orders/${orderId}/items/${itemIdx}/assign`, { method: 'PUT', body: JSON.stringify({ worker_id: workerId }) }); fetchAll(); }
    catch (e) { console.error(e); }
  };

  const assignDelivery = async (orderId: string, vehicleId: string) => {
    try { await api(`/orders/${orderId}/delivery`, { method: 'PUT', body: JSON.stringify({ vehicle_id: vehicleId }) }); fetchAll(); setShowAssign(false); }
    catch (e) { console.error(e); }
  };

  const confirmDelivery = async (orderId: string) => {
    try { await api(`/orders/${orderId}/confirm-delivery`, { method: 'PUT' }); fetchAll(); }
    catch (e) { console.error(e); }
  };

  if (loading) return <SafeAreaView style={s.c}><ActivityIndicator size="large" color="#fff" style={{ flex: 1 }} /></SafeAreaView>;

  return (
    <SafeAreaView style={s.c}>
      <Text style={s.title}>Boshqaruv</Text>
      <View style={s.tabs}>
        {[{ k: 'workers' as const, l: 'Ishchilar' }, { k: 'vehicles' as const, l: 'Mashinalar' }, { k: 'assign' as const, l: 'Biriktirish' }].map(t => (
          <TouchableOpacity key={t.k} style={[s.tabBtn, tab === t.k && s.tabActive]} onPress={() => setTab(t.k)}>
            <Text style={[s.tabText, tab === t.k && s.tabTextActive]}>{t.l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(); }} tintColor="#fff" />} contentContainerStyle={s.scroll}>

        {/* WORKERS TAB */}
        {tab === 'workers' && (
          <>
            <TouchableOpacity testID="add-worker-btn" style={s.addBtn} onPress={() => setShowAddWorker(true)}>
              <Plus size={16} color="#000" /><Text style={s.addBtnText}>Ishchi qo'shish</Text>
            </TouchableOpacity>
            {workers.map(w => (
              <View key={w.id} style={s.card} testID={`worker-${w.id}`}>
                <View style={s.cardRow}>
                  <View style={s.avatar}><Text style={s.avatarText}>{w.name?.charAt(0)}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.cardName}>{w.name}</Text>
                    <Text style={s.cardSub}>{w.email}</Text>
                    {w.specialty ? <Text style={s.cardSpec}>{w.specialty}</Text> : null}
                  </View>
                  <TouchableOpacity testID={`del-worker-${w.id}`} onPress={async () => { await api(`/workers/${w.id}`, { method: 'DELETE' }); fetchAll(); }}>
                    <X size={16} color="rgba(255,255,255,0.3)" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {/* VEHICLES TAB */}
        {tab === 'vehicles' && (
          <>
            <TouchableOpacity testID="add-vehicle-btn" style={s.addBtn} onPress={() => setShowAddVehicle(true)}>
              <Plus size={16} color="#000" /><Text style={s.addBtnText}>Mashina qo'shish</Text>
            </TouchableOpacity>
            {vehicles.map(v => (
              <View key={v.id} style={s.card} testID={`vehicle-${v.id}`}>
                <View style={s.cardRow}>
                  <View style={s.plateBox}><Text style={s.plateText}>{v.plate_number}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.cardName}>{v.driver_name}</Text>
                    <Text style={s.cardSub}>{v.driver_phone}</Text>
                  </View>
                  <TouchableOpacity testID={`del-vehicle-${v.id}`} onPress={async () => { await api(`/vehicles/${v.id}`, { method: 'DELETE' }); fetchAll(); }}>
                    <X size={16} color="rgba(255,255,255,0.3)" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {/* ASSIGN TAB */}
        {tab === 'assign' && (
          <>
            {orders.length === 0 ? (
              <View style={s.empty}><Text style={s.emptyText}>Tayyor buyurtmalar yo'q</Text></View>
            ) : orders.map(order => (
              <View key={order.id} style={s.orderCard} testID={`assign-order-${order.id}`}>
                <View style={s.orderHead}>
                  <View style={s.codeSection}>
                    <Hash size={12} color="rgba(255,255,255,0.5)" />
                    <Text style={s.codeText}>{order.order_code}</Text>
                  </View>
                  <View style={[s.statusBadge, { backgroundColor: (statusColors[order.status] || '#fff') + '20' }]}>
                    <Text style={[s.statusLabelText, { color: statusColors[order.status] || '#fff' }]}>{statusLabels[order.status]}</Text>
                  </View>
                </View>
                <Text style={s.orderDealer}>{order.dealer_name}</Text>

                {order.items?.map((item: any, idx: number) => (
                  <View key={idx} style={s.itemRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.itemName}>{item.material_name}</Text>
                      <Text style={s.itemSize}>{item.width}m x {item.height}m = {item.sqm} kv.m</Text>
                    </View>
                    {item.assigned_worker_name ? (
                      <View style={s.assignedBadge}>
                        <UserCheck size={12} color="#00E676" />
                        <Text style={s.assignedText}>{item.assigned_worker_name}</Text>
                        {item.worker_status === 'completed' ? <Text style={s.doneLabel}>✓</Text> : null}
                      </View>
                    ) : (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {workers.map(w => (
                          <TouchableOpacity key={w.id} testID={`assign-${order.id}-${idx}-${w.id}`} style={s.assignBtn} onPress={() => assignItem(order.id, idx, w.id)}>
                            <Text style={s.assignBtnText}>{w.name}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    )}
                  </View>
                ))}

                {/* Delivery + Confirm section */}
                <View style={s.deliverySection}>
                  {order.status === 'tayyor' && !order.vehicle_id && (
                    <TouchableOpacity testID={`assign-delivery-${order.id}`} style={s.deliveryBtn} onPress={() => { setSelectedOrder(order); setShowAssign(true); }}>
                      <Truck size={14} color="#000" /><Text style={s.deliveryBtnText}>Mashina biriktirish</Text>
                    </TouchableOpacity>
                  )}
                  {order.vehicle_info && (
                    <View style={s.vehicleInfo}>
                      <Truck size={14} color="#448AFF" />
                      <Text style={s.vehicleText}>{order.vehicle_info.plate_number} - {order.vehicle_info.driver_name}</Text>
                    </View>
                  )}
                  {(order.status === 'yetkazilmoqda' || order.status === 'tayyor') && (
                    <TouchableOpacity testID={`confirm-delivery-${order.id}`} style={s.confirmBtn} onPress={() => confirmDelivery(order.id)}>
                      <CheckCircle size={16} color="#000" />
                      <Text style={s.confirmBtnText}>Topshirildi</Text>
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
          <View style={s.modalH}><Text style={s.modalTitle}>Yangi Ishchi</Text><TouchableOpacity testID="close-add-worker" onPress={() => setShowAddWorker(false)}><X size={24} color="rgba(255,255,255,0.5)" /></TouchableOpacity></View>
          <ScrollView style={s.modalBody}>
            <Text style={s.label}>Ism</Text><TextInput testID="worker-name" style={s.input} value={wForm.name} onChangeText={v => setWForm({...wForm, name: v})} placeholderTextColor="rgba(255,255,255,0.25)" placeholder="Ism" />
            <Text style={s.label}>Email</Text><TextInput testID="worker-email" style={s.input} value={wForm.email} onChangeText={v => setWForm({...wForm, email: v})} placeholderTextColor="rgba(255,255,255,0.25)" placeholder="email@..." autoCapitalize="none" keyboardType="email-address" />
            <Text style={s.label}>Parol</Text><TextInput testID="worker-password" style={s.input} value={wForm.password} onChangeText={v => setWForm({...wForm, password: v})} placeholderTextColor="rgba(255,255,255,0.25)" placeholder="Parol" secureTextEntry />
            <Text style={s.label}>Telefon</Text><TextInput testID="worker-phone" style={s.input} value={wForm.phone} onChangeText={v => setWForm({...wForm, phone: v})} placeholderTextColor="rgba(255,255,255,0.25)" placeholder="+998..." keyboardType="phone-pad" />
            <Text style={s.label}>Mutaxassislik</Text><TextInput testID="worker-specialty" style={s.input} value={wForm.specialty} onChangeText={v => setWForm({...wForm, specialty: v})} placeholderTextColor="rgba(255,255,255,0.25)" placeholder="Jalyuzi o'rnatish" />
            <TouchableOpacity testID="save-worker" style={s.saveBtn} onPress={addWorker}><Text style={s.saveBtnText}>Saqlash</Text></TouchableOpacity>
          </ScrollView>
        </View></View>
      </Modal>

      {/* Add Vehicle Modal */}
      <Modal visible={showAddVehicle} transparent animationType="slide">
        <View style={s.modalBg}><View style={s.modal}>
          <View style={s.modalH}><Text style={s.modalTitle}>Yangi Mashina</Text><TouchableOpacity testID="close-add-vehicle" onPress={() => setShowAddVehicle(false)}><X size={24} color="rgba(255,255,255,0.5)" /></TouchableOpacity></View>
          <ScrollView style={s.modalBody}>
            <Text style={s.label}>Mashina raqami</Text><TextInput testID="vehicle-plate" style={s.input} value={vForm.plate_number} onChangeText={v => setVForm({...vForm, plate_number: v})} placeholderTextColor="rgba(255,255,255,0.25)" placeholder="01A123BC" autoCapitalize="characters" />
            <Text style={s.label}>Haydovchi ismi</Text><TextInput testID="vehicle-driver" style={s.input} value={vForm.driver_name} onChangeText={v => setVForm({...vForm, driver_name: v})} placeholderTextColor="rgba(255,255,255,0.25)" placeholder="Ism" />
            <Text style={s.label}>Telefon</Text><TextInput testID="vehicle-phone" style={s.input} value={vForm.driver_phone} onChangeText={v => setVForm({...vForm, driver_phone: v})} placeholderTextColor="rgba(255,255,255,0.25)" placeholder="+998..." keyboardType="phone-pad" />
            <TouchableOpacity testID="save-vehicle" style={s.saveBtn} onPress={addVehicle}><Text style={s.saveBtnText}>Saqlash</Text></TouchableOpacity>
          </ScrollView>
        </View></View>
      </Modal>

      {/* Assign Delivery Modal */}
      <Modal visible={showAssign} transparent animationType="fade">
        <View style={s.modalBg}><View style={s.modal}>
          <View style={s.modalH}><Text style={s.modalTitle}>Mashina tanlang</Text><TouchableOpacity testID="close-assign-delivery" onPress={() => setShowAssign(false)}><X size={24} color="rgba(255,255,255,0.5)" /></TouchableOpacity></View>
          <ScrollView style={s.modalBody}>
            {vehicles.map(v => (
              <TouchableOpacity key={v.id} testID={`pick-vehicle-${v.id}`} style={s.vehicleCard} onPress={() => selectedOrder && assignDelivery(selectedOrder.id, v.id)}>
                <View style={s.plateBox}><Text style={s.plateText}>{v.plate_number}</Text></View>
                <View><Text style={s.cardName}>{v.driver_name}</Text><Text style={s.cardSub}>{v.driver_phone}</Text></View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View></View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: colors.bg },
  title: { fontSize: 28, fontWeight: '700', color: '#fff', paddingHorizontal: 24, paddingTop: 16, letterSpacing: -1 },
  tabs: { flexDirection: 'row', paddingHorizontal: 24, marginTop: 12, gap: 8 },
  tabBtn: { flex: 1, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.04)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  tabActive: { backgroundColor: '#fff' },
  tabText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.4)' },
  tabTextActive: { color: '#000' },
  scroll: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 100 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 44, backgroundColor: '#fff', borderRadius: 22, marginBottom: 16 },
  addBtnText: { fontSize: 14, fontWeight: '700', color: '#000' },
  card: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', padding: 16, marginBottom: 10 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  cardName: { fontSize: 15, fontWeight: '600', color: '#fff' },
  cardSub: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 1 },
  cardSpec: { fontSize: 11, color: 'rgba(255,179,0,0.7)', marginTop: 2 },
  plateBox: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  plateText: { fontSize: 13, fontWeight: '700', color: '#fff', letterSpacing: 1 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 15, color: 'rgba(255,255,255,0.3)' },
  orderCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', padding: 16, marginBottom: 12 },
  orderHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  codeSection: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  codeText: { fontSize: 13, fontWeight: '700', color: '#fff', letterSpacing: 1.5, fontVariant: ['tabular-nums'] },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusLabelText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  orderDealer: { fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 8 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)', gap: 8 },
  itemName: { fontSize: 14, fontWeight: '500', color: '#fff' },
  itemSize: { fontSize: 11, color: 'rgba(255,255,255,0.35)' },
  assignedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,230,118,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  assignedText: { fontSize: 11, fontWeight: '600', color: '#00E676' },
  doneLabel: { fontSize: 14, color: '#00E676', marginLeft: 2 },
  assignBtn: { backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginRight: 6 },
  assignBtnText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  deliverySection: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', gap: 8 },
  deliveryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 42, backgroundColor: '#448AFF', borderRadius: 21 },
  deliveryBtnText: { fontSize: 13, fontWeight: '700', color: '#000' },
  vehicleInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(68,138,255,0.1)', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  vehicleText: { fontSize: 13, color: '#448AFF', fontWeight: '600' },
  confirmBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 48, backgroundColor: '#00E676', borderRadius: 24 },
  confirmBtnText: { fontSize: 14, fontWeight: '700', color: '#000' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#0c0c0c', borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', maxHeight: '80%' },
  modalH: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  modalBody: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6, marginTop: 14, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600' },
  input: { height: 48, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 16, fontSize: 15, color: '#fff' },
  saveBtn: { height: 54, backgroundColor: '#fff', borderRadius: 27, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#000' },
  vehicleCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
});
