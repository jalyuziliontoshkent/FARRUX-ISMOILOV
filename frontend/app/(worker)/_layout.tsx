import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { ClipboardList, CheckCircle2 } from 'lucide-react-native';
import { useTheme } from '../../src/utils/theme';

const TabIcon = ({ Icon, label, focused, c }: { Icon: any; label: string; focused: boolean; c: any }) => (
  <View style={s.tabItem}>
    {focused && <View style={[s.activeDot, { backgroundColor: c.accent }]} />}
    <Icon size={24} color={focused ? c.accent : c.textTer} strokeWidth={focused ? 2.5 : 1.5} />
    <Text style={[s.tabLabel, { color: c.textTer }, focused && { color: c.accent, fontWeight: '700' }]}>{label}</Text>
  </View>
);

export default function WorkerLayout() {
  const c = useTheme();
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: c.tabBg, borderTopWidth: 1, borderTopColor: c.tabBorder, height: 88, paddingBottom: 16, paddingTop: 10 }, tabBarShowLabel: false }}>
      <Tabs.Screen name="tasks" options={{ tabBarIcon: ({ focused }) => <TabIcon Icon={ClipboardList} label="Vazifalar" focused={focused} c={c} /> }} />
      <Tabs.Screen name="completed" options={{ tabBarIcon: ({ focused }) => <TabIcon Icon={CheckCircle2} label="Bajarilgan" focused={focused} c={c} /> }} />
    </Tabs>
  );
}

const s = StyleSheet.create({
  tabItem: { alignItems: 'center', justifyContent: 'center', gap: 5, position: 'relative', minWidth: 60, minHeight: 48 },
  activeDot: { position: 'absolute', top: -6, width: 5, height: 5, borderRadius: 3 },
  tabLabel: { fontSize: 10, letterSpacing: 0.3, fontWeight: '600' },
});
