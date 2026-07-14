import { Link, usePathname } from 'expo-router';
import {
  CalendarCheck,
  Landmark,
  LayoutDashboard,
  LogOut,
  Sparkles,
} from 'lucide-react-native';
import { Platform, Text, View } from 'react-native';

import { PressableScale } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { colors } from '@/theme/colors';

const NAV = [
  { href: '/', icon: LayoutDashboard, label: 'Home' },
  { href: '/banks', icon: Landmark, label: 'Bancos' },
  { href: '/agenda', icon: CalendarCheck, label: 'Agenda' },
  { href: '/iza', icon: Sparkles, label: 'Iza' },
] as const;

/** Sidebar de vidro escuro (desktop web) — design aprovado do Organizae.Space. */
export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <View
      className="w-[120px] rounded-[24px] items-center py-6 border border-white/10"
      style={
        {
          backgroundColor: 'rgba(17,21,28,0.88)',
          ...(Platform.OS === 'web'
            ? { backdropFilter: 'blur(22px) saturate(1.6)', WebkitBackdropFilter: 'blur(22px) saturate(1.6)' }
            : null),
          boxShadow: '0 8px 40px -12px rgba(0,0,0,0.3)',
        } as object
      }
    >
      {/* Logo vertical */}
      <View style={{ height: 148, width: 24, alignItems: 'center', justifyContent: 'center' }}>
        <Text
          numberOfLines={1}
          className="font-extrabold text-[13px]"
          style={{
            transform: [{ rotate: '-90deg' }],
            width: 148,
            textAlign: 'center',
            letterSpacing: 4,
            color: 'rgba(255,255,255,0.85)',
          }}
        >
          ORGANIZ<Text style={{ color: '#2BD4A0' }}>AE</Text>
        </Text>
      </View>

      {/* Navegação */}
      <View className="flex-1 items-center justify-center gap-2">
        {NAV.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} asChild>
              <PressableScale
                accessibilityLabel={item.label}
                scaleTo={0.9}
                className={`w-12 h-12 rounded-2xl items-center justify-center ${
                  active ? '' : 'hover:bg-white/10'
                }`}
                style={
                  active
                    ? {
                        backgroundColor: '#FFFFFF',
                        boxShadow: '0 2px 14px rgba(255,255,255,0.18)',
                      }
                    : undefined
                }
                testID={`side-${item.label.toLowerCase()}`}
              >
                <Icon size={20} color={active ? colors.primary : 'rgba(255,255,255,0.65)'} />
              </PressableScale>
            </Link>
          );
        })}
      </View>

      {/* Logout */}
      <PressableScale
        onPress={() => supabase.auth.signOut()}
        scaleTo={0.9}
        className="w-11 h-11 rounded-2xl items-center justify-center hover:bg-white/20"
        style={{ backgroundColor: 'rgba(255,255,255,0.10)' }}
        testID="side-logout"
      >
        <LogOut size={17} color="rgba(255,255,255,0.75)" />
      </PressableScale>
      <Text className="text-[9px] mt-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
        v1.0
      </Text>
    </View>
  );
}
