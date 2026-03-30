import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Home, ShoppingBag, Package, MessageCircle } from 'lucide-react-native';

const TabIcon = ({ Icon, label, focused }: { Icon: any; label: string; focused: boolean }) => (
  <View style={s.tabItem}>
    {focused && <View style={s.activeDot} />}
    <Icon size={22} color={focused ? '#6C63FF' : 'rgba(255,255,255,0.25)'} strokeWidth={focused ? 2.5 : 1.5} />
    <Text style={[s.tabLabel, focused && s.tabLabelActive]}>{label}</Text>
  </View>
);

export default function DealerLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: s.tabBar, tabBarShowLabel: false }}>
      <Tabs.Screen name="dashboard" options={{ tabBarIcon: ({ focused }) => <TabIcon Icon={Home} label="Bosh sahifa" focused={focused} /> }} />
      <Tabs.Screen name="new-order" options={{ tabBarIcon: ({ focused }) => <TabIcon Icon={ShoppingBag} label="Buyurtma" focused={focused} /> }} />
      <Tabs.Screen name="orders" options={{ tabBarIcon: ({ focused }) => <TabIcon Icon={Package} label="Buyurtmalar" focused={focused} /> }} />
      <Tabs.Screen name="chat" options={{ tabBarIcon: ({ focused }) => <TabIcon Icon={MessageCircle} label="Chat" focused={focused} /> }} />
    </Tabs>
  );
}

const s = StyleSheet.create({
  tabBar: { backgroundColor: 'rgba(5,5,8,0.97)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', height: 72, paddingBottom: 8, paddingTop: 8 },
  tabItem: { alignItems: 'center', justifyContent: 'center', gap: 4, position: 'relative' },
  activeDot: { position: 'absolute', top: -8, width: 4, height: 4, borderRadius: 2, backgroundColor: '#6C63FF' },
  tabLabel: { fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: 0.3, fontWeight: '500' },
  tabLabelActive: { color: '#6C63FF', fontWeight: '700' },
});
