import { Link, usePathname } from 'expo-router';
import {
  CalendarCheck,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Sparkles,
} from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { supabase } from '@/lib/supabase';
import { colors } from '@/theme/colors';

const NAV = [
  { href: '/', icon: LayoutDashboard, label: 'Home' },
  { href: '/cards', icon: CreditCard, label: 'Cartões' },
  { href: '/agenda', icon: CalendarCheck, label: 'Agenda' },
  { href: '/iza', icon: Sparkles, label: 'Iza' },
] as const;

const SIDEBAR_BG = '#14181F';

/** Sidebar escura do desktop (web) — design aprovado do Organizae.Space. */
export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <View
      className="w-[120px] rounded-[24px] items-center py-6"
      style={{
        backgroundColor: SIDEBAR_BG,
        boxShadow: '0 8px 40px -12px rgba(0,0,0,0.25)',
      }}
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
              <Pressable
                accessibilityLabel={item.label}
                className="w-12 h-12 rounded-2xl items-center justify-center"
                style={
                  active
                    ? {
                        backgroundColor: '#FFFFFF',
                        boxShadow: '0 2px 12px rgba(255,255,255,0.15)',
                      }
                    : undefined
                }
                testID={`side-${item.label.toLowerCase()}`}
              >
                <Icon size={20} color={active ? colors.primary : 'rgba(255,255,255,0.65)'} />
              </Pressable>
            </Link>
          );
        })}
      </View>

      {/* Logout */}
      <Pressable
        onPress={() => supabase.auth.signOut()}
        className="w-11 h-11 rounded-2xl items-center justify-center"
        style={{ backgroundColor: 'rgba(255,255,255,0.10)' }}
        testID="side-logout"
      >
        <LogOut size={17} color="rgba(255,255,255,0.75)" />
      </Pressable>
      <Text className="text-[9px] mt-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
        v1.0
      </Text>
    </View>
  );
}
