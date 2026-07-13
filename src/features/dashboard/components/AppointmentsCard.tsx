import { Link } from 'expo-router';
import { CalendarDays, Clock, Coffee, MapPin } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { Card } from '@/components/ui';
import { useUpcomingEvents } from '@/features/personal/hooks/useEvents';
import { todayISO } from '@/lib/format';
import { colors } from '@/theme/colors';

function toBRShort(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

/** "Compromissos" — próximos eventos reais da agenda (estética do original). */
export function AppointmentsCard() {
  const { data: events } = useUpcomingEvents();
  const upcoming = (events ?? []).slice(0, 4);

  return (
    <Card className="p-5">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2.5">
          <View className="p-2 rounded-xl bg-accent">
            <CalendarDays size={15} color={colors.primary} />
          </View>
          <Text className="font-bold text-sm text-foreground">Compromissos</Text>
        </View>
        <View className="px-2 py-0.5 rounded-full border border-border">
          <Text className="text-xs text-muted-foreground" testID="appts-count">
            {upcoming.length}
          </Text>
        </View>
      </View>

      {upcoming.length === 0 ? (
        <View className="items-center gap-2.5 py-8 bg-muted/40 rounded-2xl border border-dashed border-border">
          <Coffee size={26} color={colors.mutedForeground} />
          <Text className="text-sm font-medium text-muted-foreground">Agenda livre!</Text>
        </View>
      ) : (
        <View className="gap-2.5">
          {upcoming.map((e) => (
            <Link key={e.id} href="/agenda" asChild>
              <Pressable className="p-3 rounded-2xl bg-accent/60 border border-primary/10 active:opacity-80">
                <View className="flex-row items-start gap-3">
                  <View className="p-2 rounded-xl bg-accent">
                    <CalendarDays size={15} color={colors.primary} />
                  </View>
                  <View className="flex-1 min-w-0">
                    <Text className="text-sm font-semibold text-foreground" numberOfLines={2}>
                      {e.title}
                    </Text>
                    <View className="flex-row items-center gap-3 mt-1">
                      <View className="flex-row items-center gap-1">
                        <Clock size={10} color={colors.mutedForeground} />
                        <Text className="text-xs text-muted-foreground">
                          {e.date === todayISO() ? 'Hoje' : toBRShort(e.date)}
                          {e.time ? ` · ${e.time.slice(0, 5)}` : ''}
                        </Text>
                      </View>
                      {e.location ? (
                        <View className="flex-row items-center gap-1 flex-1 min-w-0">
                          <MapPin size={10} color={colors.mutedForeground} />
                          <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                            {e.location}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                </View>
              </Pressable>
            </Link>
          ))}
        </View>
      )}
    </Card>
  );
}
