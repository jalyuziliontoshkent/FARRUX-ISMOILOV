import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { LayoutDashboard, Package, Boxes, Users, MessageCircle, Wrench, Truck } from 'lucide-react-native';

const TabIcon = ({ Icon, label, focused }: { Icon: any; label: string; focused: boolean }) => (
  <View style={s.tabItem}>
    <Icon size={20} color={focused ? '#fff' : 'rgba(255,255,255,0.3)'} strokeWidth={focused ? 2.5 : 1.5} />
    <Text style={[s.tabLabel, focused && s.tabLabelActive]}>{label}</Text>
  </View>
);

export default function AdminLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: s.tabBar, tabBarShowLabel: false }}>
      <Tabs.Screen name="dashboard" options={{ tabBarIcon: ({ focused }) => <TabIcon Icon={LayoutDashboard} label="Boshqaruv" focused={focused} /> }} />
      <Tabs.Screen name="orders" options={{ tabBarIcon: ({ focused }) => <TabIcon Icon={Package} label="Buyurtma" focused={focused} /> }} />
      <Tabs.Screen name="inventory" options={{ tabBarIcon: ({ focused }) => <TabIcon Icon={Boxes} label="Ombor" focused={focused} /> }} />
      <Tabs.Screen name="dealers" options={{ tabBarIcon: ({ focused }) => <TabIcon Icon={Users} label="Dilerlar" focused={focused} /> }} />
      <Tabs.Screen name="workers" options={{ tabBarIcon: ({ focused }) => <TabIcon Icon={Wrench} label="Ishchilar" focused={focused} /> }} />
      <Tabs.Screen name="chat" options={{ tabBarIcon: ({ focused }) => <TabIcon Icon={MessageCircle} label="Chat" focused={focused} /> }} />
    </Tabs>
  );
}

const s = StyleSheet.create({
  tabBar: { backgroundColor: 'rgba(5,5,5,0.95)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', height: 68, paddingBottom: 6, paddingTop: 6 },
  tabItem: { alignItems: 'center', justifyContent: 'center', gap: 3 },
  tabLabel: { fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: 0.3 },
  tabLabelActive: { color: '#fff' },
});
