import { Redirect, Tabs } from 'expo-router';
import { CalendarCheck, Landmark, LayoutDashboard, Sparkles } from 'lucide-react-native';
import { ActivityIndicator, View, useWindowDimensions } from 'react-native';

import { Sidebar } from '@/components/app/Sidebar';
import { useAuth } from '@/features/auth/AuthProvider';

export default function AppLayout() {
  const { session, loading } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

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
    <View
      className="flex-1 flex-row"
      style={
        isDesktop
          ? { backgroundColor: '#E8EAEE', padding: 24, gap: 16 }
          : { backgroundColor: '#F6F7F9' }
      }
    >
      {/* Sidebar escura (desktop) */}
      {isDesktop && <Sidebar />}

      {/* Container flutuante do conteúdo */}
      <View
        className="flex-1"
        style={
          isDesktop
            ? {
                borderRadius: 28,
                overflow: 'hidden',
                backgroundColor: '#F6F7F9',
                boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
              }
            : undefined
        }
      >
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#0B8A63',
            tabBarInactiveTintColor: '#9AA1A9',
            tabBarStyle: isDesktop
              ? { display: 'none' }
              : {
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
            name="banks"
            options={{
              title: 'Bancos',
              tabBarIcon: ({ color, size }) => <Landmark color={color} size={size ?? 22} />,
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
          {/* Fora da tab bar: telas de formulário e detalhe */}
          <Tabs.Screen name="new" options={{ href: null }} />
          <Tabs.Screen name="transaction/[id]" options={{ href: null }} />
          <Tabs.Screen name="card-new" options={{ href: null }} />
          <Tabs.Screen name="card/[id]" options={{ href: null }} />
          <Tabs.Screen name="bank-new" options={{ href: null }} />
          <Tabs.Screen name="bank/[id]" options={{ href: null }} />
          <Tabs.Screen name="investments" options={{ href: null }} />
        </Tabs>
      </View>
    </View>
  );
}
