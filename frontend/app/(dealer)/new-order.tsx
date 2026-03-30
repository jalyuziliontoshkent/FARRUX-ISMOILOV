import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator,
  Image, KeyboardAvoidingView, Platform, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Minus, ShoppingCart, X, Check, ImagePlus } from 'lucide-react-native';
import { api } from '../_layout';
import { colors, formatPrice } from '../../src/utils/theme';

type OrderItem = {
  material_id: string;
  material_name: string;
  material_image: string;
  width: string;
  height: string;
  quantity: number;
  price_per_sqm: number;
};

export default function NewOrder() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [selectedMat, setSelectedMat] = useState<any>(null);
  const [showCalc, setShowCalc] = useState(false);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [notes, setNotes] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api('/materials').then(setMaterials).catch(console.error).finally(() => setLoading(false));
  }, []);

  const sqm = (parseFloat(width) || 0) * (parseFloat(height) || 0);
  const price = sqm * (selectedMat?.price_per_sqm || 0);

  const addItem = () => {
    if (!selectedMat || sqm <= 0) return;
    setItems([...items, {
      material_id: selectedMat.id,
      material_name: selectedMat.name,
      material_image: selectedMat.image_url || '',
      width, height, quantity: 1,
      price_per_sqm: selectedMat.price_per_sqm,
    }]);
    setWidth(''); setHeight('');
    setShowCalc(false); setSelectedMat(null);
  };

  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));

  const totalSqm = items.reduce((s, it) => s + (parseFloat(it.width) * parseFloat(it.height) * it.quantity), 0);
  const totalPrice = items.reduce((s, it) => s + (parseFloat(it.width) * parseFloat(it.height) * it.quantity * it.price_per_sqm), 0);

  const submitOrder = async () => {
    if (items.length === 0) return;
    setSubmitting(true);
    try {
      await api('/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: items.map(it => ({
            material_id: it.material_id, material_name: it.material_name,
            width: parseFloat(it.width), height: parseFloat(it.height),
            quantity: it.quantity, price_per_sqm: it.price_per_sqm,
          })),
          notes,
        }),
      });
      setItems([]); setNotes(''); setShowCart(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (e: any) { console.error(e.message); }
    finally { setSubmitting(false); }
  };

  const selectProduct = (mat: any) => {
    setSelectedMat(mat);
    setWidth(''); setHeight('');
    setShowCalc(true);
  };

  if (loading) {
    return <SafeAreaView style={s.container}><ActivityIndicator size="large" color="#fff" style={{ flex: 1 }} /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Katalog</Text>
        {items.length > 0 && (
          <TouchableOpacity testID="open-cart-btn" style={s.cartBtn} onPress={() => setShowCart(true)}>
            <ShoppingCart size={20} color="#000" />
            <View style={s.cartBadge}><Text style={s.cartBadgeText}>{items.length}</Text></View>
          </TouchableOpacity>
        )}
      </View>

      {success && (
        <View style={s.successBanner} testID="order-success">
          <Check size={18} color="#00C853" />
          <Text style={s.successText}>Buyurtma yuborildi!</Text>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.grid}>
        {materials.map(mat => (
          <TouchableOpacity
            key={mat.id} testID={`select-material-${mat.id}`}
            style={s.productCard}
            onPress={() => selectProduct(mat)}
            activeOpacity={0.85}
          >
            {mat.image_url ? (
              <Image source={{ uri: mat.image_url }} style={s.productImg} />
            ) : (
              <View style={s.productImgEmpty}>
                <ImagePlus size={32} color="rgba(255,255,255,0.1)" />
              </View>
            )}
            <View style={s.productOverlay}>
              <View style={s.priceBadge}>
                <Text style={s.priceText}>{formatPrice(mat.price_per_sqm)}</Text>
                <Text style={s.priceUnit}>/kv.m</Text>
              </View>
            </View>
            <View style={s.productInfo}>
              <Text style={s.productName} numberOfLines={1}>{mat.name}</Text>
              <Text style={s.productCat}>{mat.category}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Calculator Modal */}
      <Modal visible={showCalc} transparent animationType="slide">
        <View style={s.calcOverlay}>
          <View style={s.calcSheet}>
            <View style={s.calcHandle} />
            {selectedMat && (
              <>
                <View style={s.calcProductRow}>
                  {selectedMat.image_url ? (
                    <Image source={{ uri: selectedMat.image_url }} style={s.calcProductImg} />
                  ) : (
                    <View style={[s.calcProductImg, { backgroundColor: '#111' }]} />
                  )}
                  <View style={s.calcProductInfo}>
                    <Text style={s.calcProductName}>{selectedMat.name}</Text>
                    <Text style={s.calcProductPrice}>{formatPrice(selectedMat.price_per_sqm)}/kv.m</Text>
                  </View>
                  <TouchableOpacity testID="close-calc" onPress={() => setShowCalc(false)}>
                    <X size={22} color="rgba(255,255,255,0.4)" />
                  </TouchableOpacity>
                </View>

                <Text style={s.calcLabel}>O'lchamlarni kiriting</Text>
                <View style={s.calcInputRow}>
                  <View style={s.calcInputWrap}>
                    <Text style={s.calcInputTitle}>En (m)</Text>
                    <TextInput
                      testID="calc-width-input"
                      style={s.calcInput}
                      value={width}
                      onChangeText={setWidth}
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                      placeholderTextColor="rgba(255,255,255,0.15)"
                    />
                  </View>
                  <Text style={s.calcMultiply}>×</Text>
                  <View style={s.calcInputWrap}>
                    <Text style={s.calcInputTitle}>Bo'yi (m)</Text>
                    <TextInput
                      testID="calc-height-input"
                      style={s.calcInput}
                      value={height}
                      onChangeText={setHeight}
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                      placeholderTextColor="rgba(255,255,255,0.15)"
                    />
                  </View>
                </View>

                <View style={s.calcResultRow}>
                  <View style={s.calcResultItem}>
                    <Text style={s.calcResultLabel}>Maydoni</Text>
                    <Text style={s.calcResultVal}>{sqm.toFixed(2)} kv.m</Text>
                  </View>
                  <View style={s.calcResultDivider} />
                  <View style={s.calcResultItem}>
                    <Text style={s.calcResultLabel}>Narxi</Text>
                    <Text style={s.calcResultVal}>{formatPrice(Math.round(price * 100) / 100)}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  testID="add-item-btn"
                  style={[s.addToCartBtn, sqm <= 0 && s.btnDisabled]}
                  onPress={addItem}
                  disabled={sqm <= 0}
                >
                  <Plus size={18} color="#000" />
                  <Text style={s.addToCartText}>Savatga qo'shish</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Cart Modal */}
      <Modal visible={showCart} transparent animationType="slide">
        <View style={s.cartOverlay}>
          <View style={s.cartSheet}>
            <View style={s.calcHandle} />
            <View style={s.cartHeader}>
              <Text style={s.cartTitle}>Savat ({items.length})</Text>
              <TouchableOpacity testID="close-cart" onPress={() => setShowCart(false)}>
                <X size={22} color="rgba(255,255,255,0.4)" />
              </TouchableOpacity>
            </View>
            <ScrollView style={s.cartList} showsVerticalScrollIndicator={false}>
              {items.map((item, idx) => (
                <View key={idx} style={s.cartItem} testID={`order-item-${idx}`}>
                  {item.material_image ? (
                    <Image source={{ uri: item.material_image }} style={s.cartItemImg} />
                  ) : (
                    <View style={[s.cartItemImg, { backgroundColor: '#111' }]} />
                  )}
                  <View style={s.cartItemInfo}>
                    <Text style={s.cartItemName}>{item.material_name}</Text>
                    <Text style={s.cartItemSize}>{item.width}m × {item.height}m = {(parseFloat(item.width) * parseFloat(item.height)).toFixed(2)} kv.m</Text>
                    <Text style={s.cartItemPrice}>{formatPrice(Math.round(parseFloat(item.width) * parseFloat(item.height) * item.quantity * item.price_per_sqm * 100) / 100)}</Text>
                  </View>
                  <TouchableOpacity testID={`remove-item-${idx}`} onPress={() => removeItem(idx)} style={s.removeBtn}>
                    <Minus size={14} color="#FF5252" />
                  </TouchableOpacity>
                </View>
              ))}

              <TextInput
                testID="order-notes-input"
                style={s.notesInput}
                placeholder="Qo'shimcha izoh..."
                placeholderTextColor="rgba(255,255,255,0.25)"
                value={notes}
                onChangeText={setNotes}
                multiline
              />
            </ScrollView>

            <View style={s.cartFooter}>
              <View>
                <Text style={s.cartTotalLabel}>Jami</Text>
                <Text style={s.cartTotalPrice}>{formatPrice(Math.round(totalPrice * 100) / 100)}</Text>
                <Text style={s.cartTotalSqm}>{totalSqm.toFixed(2)} kv.m</Text>
              </View>
              <TouchableOpacity
                testID="submit-order-btn"
                style={[s.submitBtn, submitting && s.btnDisabled]}
                onPress={submitOrder}
                disabled={submitting}
              >
                {submitting ? <ActivityIndicator color="#000" /> : (
                  <>
                    <ShoppingCart size={18} color="#000" />
                    <Text style={s.submitBtnText}>Yuborish</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', color: '#fff', letterSpacing: -1 },
  cartBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  cartBadge: { position: 'absolute', top: -4, right: -4, width: 20, height: 20, borderRadius: 10, backgroundColor: '#FF5252', alignItems: 'center', justifyContent: 'center' },
  cartBadgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  successBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 24, marginBottom: 8, paddingVertical: 12, backgroundColor: 'rgba(0,200,83,0.1)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(0,200,83,0.2)' },
  successText: { color: '#00C853', fontSize: 14, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 24, paddingBottom: 100, justifyContent: 'space-between' },
  productCard: { width: '48%', borderRadius: 20, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: 12 },
  productImg: { width: '100%', height: 140, backgroundColor: '#111' },
  productImgEmpty: { width: '100%', height: 140, backgroundColor: 'rgba(255,255,255,0.02)', alignItems: 'center', justifyContent: 'center' },
  productOverlay: { position: 'absolute', top: 10, right: 10 },
  priceBadge: { flexDirection: 'row', alignItems: 'baseline', backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  priceText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  priceUnit: { fontSize: 10, color: 'rgba(255,255,255,0.5)', marginLeft: 2 },
  productInfo: { padding: 14 },
  productName: { fontSize: 15, fontWeight: '600', color: '#fff' },
  productCat: { fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.5 },
  // Calculator sheet
  calcOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  calcSheet: { backgroundColor: '#0c0c0c', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  calcHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'center', marginBottom: 20 },
  calcProductRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  calcProductImg: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#111' },
  calcProductInfo: { flex: 1 },
  calcProductName: { fontSize: 17, fontWeight: '600', color: '#fff' },
  calcProductPrice: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  calcLabel: { fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600', marginBottom: 12 },
  calcInputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  calcInputWrap: { flex: 1 },
  calcInputTitle: { fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 6 },
  calcInput: { height: 60, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 16, fontSize: 26, color: '#fff', textAlign: 'center', fontWeight: '300' },
  calcMultiply: { fontSize: 24, color: 'rgba(255,255,255,0.2)', paddingBottom: 16 },
  calcResultRow: { flexDirection: 'row', marginTop: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 18, padding: 16 },
  calcResultItem: { flex: 1, alignItems: 'center' },
  calcResultLabel: { fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 0.5 },
  calcResultVal: { fontSize: 22, fontWeight: '600', color: '#fff', marginTop: 4 },
  calcResultDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  addToCartBtn: { height: 54, backgroundColor: '#fff', borderRadius: 27, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 },
  addToCartText: { fontSize: 16, fontWeight: '700', color: '#000' },
  btnDisabled: { opacity: 0.3 },
  // Cart sheet
  cartOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  cartSheet: { backgroundColor: '#0c0c0c', borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', maxHeight: '85%' },
  cartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 24 },
  cartTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  cartList: { paddingHorizontal: 24, paddingTop: 16, maxHeight: 350 },
  cartItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  cartItemImg: { width: 50, height: 50, borderRadius: 12 },
  cartItemInfo: { flex: 1 },
  cartItemName: { fontSize: 14, fontWeight: '600', color: '#fff' },
  cartItemSize: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  cartItemPrice: { fontSize: 14, fontWeight: '600', color: '#fff', marginTop: 2 },
  removeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,82,82,0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,82,82,0.15)' },
  notesInput: { minHeight: 44, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#fff', marginTop: 8 },
  cartFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  cartTotalLabel: { fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.5 },
  cartTotalPrice: { fontSize: 24, fontWeight: '700', color: '#fff' },
  cartTotalSqm: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  submitBtn: { height: 50, paddingHorizontal: 28, backgroundColor: '#fff', borderRadius: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: '#000' },
});
