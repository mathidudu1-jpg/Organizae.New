import { Redirect, Tabs } from 'expo-router';
import { CalendarCheck, CreditCard, LayoutDashboard, Sparkles } from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/features/auth/AuthProvider';

export default function AppLayout() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#0B8A63" size="large" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

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
        name="cards"
        options={{
          title: 'Cartões',
          tabBarIcon: ({ color, size }) => <CreditCard color={color} size={size ?? 22} />,
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color, size }) => <CalendarCheck color={color} size={size ?? 22} />,
        }}
      />
      <Tabs.Screen
        name="iza"
        options={{
          title: 'Iza',
          tabBarIcon: ({ color, size }) => <Sparkles color={color} size={size ?? 22} />,
        }}
      />
      {/* Fora da tab bar: telas de formulário */}
      <Tabs.Screen name="new" options={{ href: null }} />
      <Tabs.Screen name="transaction/[id]" options={{ href: null }} />
      <Tabs.Screen name="card-new" options={{ href: null }} />
    </Tabs>
  );
}
