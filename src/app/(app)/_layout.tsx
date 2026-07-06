import { Tabs } from 'expo-router';
import { LayoutDashboard, Sparkles } from 'lucide-react-native';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0B8A63',
        tabBarInactiveTintColor: '#9AA1A9',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E7E9EC',
          height: 64,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size ?? 22} />,
        }}
      />
      <Tabs.Screen
        name="iza"
        options={{
          title: 'Iza',
          tabBarIcon: ({ color, size }) => <Sparkles color={color} size={size ?? 22} />,
        }}
      />
    </Tabs>
  );
}
