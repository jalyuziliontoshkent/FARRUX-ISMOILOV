import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { LayoutDashboard, Package, Boxes, Users, MessageCircle, Wrench } from 'lucide-react-native';
import { useTheme } from '../../src/utils/theme';

const TabIcon = ({ Icon, label, focused, c }: { Icon: any; label: string; focused: boolean; c: any }) => (
  <View style={s.tabItem}>
    {focused && <View style={[s.activeDot, { backgroundColor: c.accent }]} />}
    <Icon size={24} color={focused ? c.accent : c.textTer} strokeWidth={focused ? 2.5 : 1.5} />
    <Text style={[s.tabLabel, { color: c.textTer }, focused && { color: c.accent, fontWeight: '700' }]}>{label}</Text>
  </View>
);

export default function AdminLayout() {
  const c = useTheme();
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: c.tabBg, borderTopWidth: 1, borderTopColor: c.tabBorder, height: 88, paddingBottom: 16, paddingTop: 10 }, tabBarShowLabel: false }}>
      <Tabs.Screen name="dashboard" options={{ tabBarIcon: ({ focused }) => <TabIcon Icon={LayoutDashboard} label="Bosh" focused={focused} c={c} /> }} />
      <Tabs.Screen name="orders" options={{ tabBarIcon: ({ focused }) => <TabIcon Icon={Package} label="Buyurtma" focused={focused} c={c} /> }} />
      <Tabs.Screen name="inventory" options={{ tabBarIcon: ({ focused }) => <TabIcon Icon={Boxes} label="Ombor" focused={focused} c={c} /> }} />
      <Tabs.Screen name="dealers" options={{ tabBarIcon: ({ focused }) => <TabIcon Icon={Users} label="Dilerlar" focused={focused} c={c} /> }} />
      <Tabs.Screen name="workers" options={{ tabBarIcon: ({ focused }) => <TabIcon Icon={Wrench} label="Ishchi" focused={focused} c={c} /> }} />
      <Tabs.Screen name="chat" options={{ tabBarIcon: ({ focused }) => <TabIcon Icon={MessageCircle} label="Chat" focused={focused} c={c} /> }} />
    </Tabs>
  );
}

const s = StyleSheet.create({
  tabItem: { alignItems: 'center', justifyContent: 'center', gap: 5, position: 'relative', minWidth: 52, minHeight: 48 },
  activeDot: { position: 'absolute', top: -6, width: 5, height: 5, borderRadius: 3 },
  tabLabel: { fontSize: 10, letterSpacing: 0.3, fontWeight: '600' },
});
