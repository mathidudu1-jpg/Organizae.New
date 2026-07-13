import { Link, useRouter } from 'expo-router';
import { ArrowUpRight, Building2, ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Card } from '@/components/ui';
import { CreditCardVisual } from '@/features/finance/components/CreditCardVisual';
import { useCardInvoice } from '@/features/finance/hooks/useCardInvoice';
import { useCards } from '@/features/finance/hooks/useCards';
import { formatCurrency } from '@/lib/format';
import { colors } from '@/theme/colors';

function toBRShort(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

function Stat({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <View className="flex-1 rounded-xl px-3 py-2.5 border border-border bg-surface">
      <Text className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">
        {label}
      </Text>
      <Text
        className={`text-xs font-bold ${danger ? 'text-danger' : 'text-foreground'}`}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

/** "Meus Bancos" — cartão realista + fatura aberta + últimas compras (dados reais). */
export function BanksWidget() {
  const router = useRouter();
  const { data: cards } = useCards();
  const [idx, setIdx] = useState(0);

  const list = cards ?? [];
  const safeIdx = Math.min(idx, Math.max(0, list.length - 1));
  const active = list[safeIdx] ?? null;
  const { total, limitAvailable, transactions } = useCardInvoice(active);

  return (
    <Card className="p-5">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2.5">
          <View className="p-2 rounded-xl bg-accent">
            <Building2 size={15} color={colors.primary} />
          </View>
          <Text className="font-bold text-sm text-foreground">Meus Bancos</Text>
        </View>
        <Link href="/card-new" asChild>
          <Pressable className="p-1.5 rounded-full bg-accent active:opacity-80" hitSlop={6}>
            <Plus size={13} color={colors.primary} />
          </Pressable>
        </Link>
      </View>

      {list.length === 0 || !active ? (
        <View className="items-center py-8">
          <Text className="text-sm text-muted-foreground text-center mb-4">
            Cadastre um cartão pra acompanhar a fatura por aqui.
          </Text>
          <Link href="/card-new" asChild>
            <Pressable className="bg-primary rounded-full px-5 py-2.5 active:opacity-90">
              <Text className="text-primary-foreground font-semibold text-xs">
                Adicionar cartão
              </Text>
            </Pressable>
          </Link>
        </View>
      ) : (
        <>
          {/* Cartão + navegação */}
          <View className="flex-row items-center justify-center mb-3">
            {list.length > 1 && (
              <Pressable
                onPress={() => setIdx((i) => (i - 1 + list.length) % list.length)}
                hitSlop={8}
                className="p-1.5 rounded-full active:bg-muted mr-2"
              >
                <ChevronLeft size={16} color={colors.mutedForeground} />
              </Pressable>
            )}
            <Pressable onPress={() => router.push('/cards')}>
              <CreditCardVisual card={active} width={168} />
            </Pressable>
            {list.length > 1 && (
              <Pressable
                onPress={() => setIdx((i) => (i + 1) % list.length)}
                hitSlop={8}
                className="p-1.5 rounded-full active:bg-muted ml-2"
              >
                <ChevronRight size={16} color={colors.mutedForeground} />
              </Pressable>
            )}
          </View>

          {/* Dots */}
          {list.length > 1 && (
            <View className="flex-row justify-center gap-1.5 mb-3">
              {list.map((c, i) => (
                <Pressable
                  key={c.id}
                  onPress={() => setIdx(i)}
                  className={`h-1.5 rounded-full ${i === safeIdx ? 'w-3.5 bg-primary' : 'w-1.5 bg-border'}`}
                />
              ))}
            </View>
          )}

          {/* Nome do banco */}
          <View className="flex-row items-center gap-2.5 mb-3.5">
            <View
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{ backgroundColor: active.color ?? '#14181F' }}
            >
              <Text className="text-white font-bold text-[10px]">
                {active.name.slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <Text className="text-sm font-bold text-foreground" numberOfLines={1}>
              {active.name}
            </Text>
          </View>

          {/* Stats reais: fatura aberta / limite / disponível */}
          <View className="flex-row gap-2">
            <Stat label="Fatura" value={formatCurrency(total)} danger={total > 0} />
            <Stat
              label="Limite"
              value={active.credit_limit != null ? formatCurrency(active.credit_limit) : '—'}
            />
            <Stat
              label="Disponível"
              value={limitAvailable != null ? formatCurrency(limitAvailable) : '—'}
            />
          </View>

          {/* Últimas compras do ciclo */}
          {(transactions ?? []).length > 0 && (
            <View className="mt-3.5">
              <Text className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 px-1">
                Recentes
              </Text>
              {(transactions ?? []).slice(0, 2).map((t) => (
                <Link key={t.id} href={`/transaction/${t.id}`} asChild>
                  <Pressable className="flex-row items-center justify-between p-2 rounded-lg active:bg-muted">
                    <View className="flex-row items-center gap-2.5 flex-1 min-w-0">
                      <View className="w-7 h-7 rounded-full bg-danger/10 items-center justify-center">
                        <ArrowUpRight size={12} color={colors.danger} />
                      </View>
                      <View className="flex-1 min-w-0">
                        <Text className="text-xs font-medium text-foreground" numberOfLines={1}>
                          {t.description ?? 'Compra'}
                        </Text>
                        <Text className="text-[10px] text-muted-foreground">
                          {toBRShort(t.date)}
                          {t.installment_total ? ` · ${t.installment_no}/${t.installment_total}` : ''}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-xs font-bold text-foreground ml-2">
                      -{formatCurrency(t.amount)}
                    </Text>
                  </Pressable>
                </Link>
              ))}
            </View>
          )}
        </>
      )}
    </Card>
  );
}
