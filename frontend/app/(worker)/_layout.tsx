import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { ClipboardList, CheckSquare } from 'lucide-react-native';

const TabIcon = ({ Icon, label, focused }: { Icon: any; label: string; focused: boolean }) => (
  <View style={s.tabItem}>
    <Icon size={22} color={focused ? '#fff' : 'rgba(255,255,255,0.3)'} strokeWidth={focused ? 2.5 : 1.5} />
    <Text style={[s.tabLabel, focused && s.tabLabelActive]}>{label}</Text>
  </View>
);

export default function WorkerLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: s.tabBar, tabBarShowLabel: false }}>
      <Tabs.Screen name="tasks" options={{ tabBarIcon: ({ focused }) => <TabIcon Icon={ClipboardList} label="Vazifalar" focused={focused} /> }} />
      <Tabs.Screen name="completed" options={{ tabBarIcon: ({ focused }) => <TabIcon Icon={CheckSquare} label="Bajarilgan" focused={focused} /> }} />
    </Tabs>
  );
}

const s = StyleSheet.create({
  tabBar: { backgroundColor: 'rgba(5,5,5,0.9)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', height: 72, paddingBottom: 8, paddingTop: 8 },
  tabItem: { alignItems: 'center', justifyContent: 'center', gap: 4 },
  tabLabel: { fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: 0.5 },
  tabLabelActive: { color: '#fff' },
});
