import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, Mail, ArrowRight } from 'lucide-react-native';
import { api } from './_layout';
import { colors } from '../src/utils/theme';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) { setError('Email va parolni kiriting'); return; }
    setLoading(true); setError('');
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      if (data.user.role === 'admin') router.replace('/(admin)/dashboard');
      else if (data.user.role === 'worker') router.replace('/(worker)/tasks');
      else router.replace('/(dealer)/dashboard');
    } catch (e: any) { setError(e.message || 'Xatolik'); }
    finally { setLoading(false); }
  };

  return (
    <View style={s.root}>
      <LinearGradient colors={['#6C63FF', '#3F3D99', '#050508']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 0.6 }} style={s.gradient} />
      <SafeAreaView style={s.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={s.topSection}>
            <View style={s.logoBox}>
              <Text style={s.logoIcon}>C</Text>
            </View>
            <Text style={s.brand}>CurtainOrder</Text>
            <Text style={s.subtitle}>Buyurtma boshqaruv tizimi</Text>
          </View>
          <View style={s.formSection}>
            <View style={s.card}>
              <Text style={s.cardTitle}>Kirish</Text>
              {error ? <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View> : null}
              <View style={s.inputWrap}>
                <Mail size={18} color="rgba(255,255,255,0.3)" />
                <TextInput testID="login-email-input" style={s.input} value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor="rgba(255,255,255,0.2)" autoCapitalize="none" keyboardType="email-address" />
              </View>
              <View style={s.inputWrap}>
                <Lock size={18} color="rgba(255,255,255,0.3)" />
                <TextInput testID="login-password-input" style={s.input} value={password} onChangeText={setPassword} placeholder="Parol" placeholderTextColor="rgba(255,255,255,0.2)" secureTextEntry />
              </View>
              <TouchableOpacity testID="login-submit-button" style={s.loginBtn} onPress={handleLogin} disabled={loading} activeOpacity={0.8}>
                <LinearGradient colors={['#6C63FF', '#5A52E0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.loginGrad}>
                  {loading ? <ActivityIndicator color="#fff" /> : (
                    <><Text style={s.loginText}>Kirish</Text><ArrowRight size={18} color="#fff" /></>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  gradient: { position: 'absolute', top: 0, left: 0, right: 0, height: '55%' },
  safe: { flex: 1 },
  topSection: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
  logoBox: { width: 72, height: 72, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  logoIcon: { fontSize: 32, fontWeight: '800', color: '#fff' },
  brand: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  formSection: { paddingHorizontal: 24, paddingBottom: 32 },
  card: { backgroundColor: 'rgba(10,10,15,0.85)', borderRadius: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 24 },
  cardTitle: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 20, textAlign: 'center' },
  errorBox: { backgroundColor: colors.dangerSoft, borderRadius: 14, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,82,82,0.2)' },
  errorText: { color: colors.danger, fontSize: 13, textAlign: 'center' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 16, height: 56, marginBottom: 12, gap: 12 },
  input: { flex: 1, fontSize: 16, color: '#fff' },
  loginBtn: { marginTop: 8, borderRadius: 16, overflow: 'hidden' },
  loginGrad: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  loginText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
