import { Redirect, Tabs } from 'expo-router';
import { CalendarCheck, Landmark, LayoutDashboard, Sparkles } from 'lucide-react-native';
import { ActivityIndicator, Platform, View, useWindowDimensions } from 'react-native';

import { Sidebar } from '@/components/app/Sidebar';
import { useAuth } from '@/features/auth/AuthProvider';

/** Brilhos ambiente atrás do conteúdo — dão vida ao glassmorphism. */
function Ambient() {
  if (Platform.OS !== 'web') return null;
  const blob = (bg: string, extra: object) =>
    ({
      position: 'absolute',
      width: 560,
      height: 560,
      borderRadius: 280,
      pointerEvents: 'none',
      filter: 'blur(70px)',
      background: bg,
      ...extra,
    }) as object;
  return (
    <>
      <View style={blob('radial-gradient(circle, rgba(11,138,99,0.16) 0%, transparent 65%)', { top: -180, left: -120 })} />
      <View style={blob('radial-gradient(circle, rgba(43,212,160,0.12) 0%, transparent 65%)', { bottom: -200, right: -140 })} />
      <View style={blob('radial-gradient(circle, rgba(29,78,216,0.07) 0%, transparent 60%)', { top: '30%', right: '25%' })} />
    </>
  );
}

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
          ? { backgroundColor: '#E6E8EC', padding: 24, gap: 16 }
          : { backgroundColor: '#F6F7F9' }
      }
    >
      <Ambient />

      {/* Sidebar de vidro escuro (desktop) */}
      {isDesktop && <Sidebar />}

      {/* Container flutuante do conteúdo */}
      <View
        className="flex-1"
        style={
          isDesktop
            ? ({
                borderRadius: 28,
                overflow: 'hidden',
                backgroundColor: 'rgba(246,247,249,0.86)',
                ...(Platform.OS === 'web'
                  ? { backdropFilter: 'blur(28px) saturate(1.5)', WebkitBackdropFilter: 'blur(28px) saturate(1.5)' }
                  : null),
                boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
              } as object)
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
              : ({
                  backgroundColor: 'rgba(255,255,255,0.88)',
                  ...(Platform.OS === 'web'
                    ? { backdropFilter: 'blur(18px) saturate(1.6)', WebkitBackdropFilter: 'blur(18px) saturate(1.6)' }
                    : null),
                  borderTopColor: 'rgba(231,233,236,0.6)',
                  height: 64,
                  paddingTop: 8,
                  paddingBottom: 10,
                } as object),
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
