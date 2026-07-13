import { useRouter } from 'expo-router';
import { Check, Plus, Trash2, TrendingUp, X } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, Chip, Input } from '@/components/ui';
import { useAccounts } from '@/features/finance/hooks/useAccounts';
import {
  useArchiveInvestment,
  useCreateInvestment,
  useInvestments,
} from '@/features/invest/hooks/useInvestments';
import {
  CDI_ANNUAL_PCT,
  projectedValueInMonths,
  type RateKind,
} from '@/features/invest/lib/simulate';
import { formatCurrency, todayISO } from '@/lib/format';
import { colors } from '@/theme/colors';
import type { InvestmentType } from '@/types/database';

const TYPE_LABEL: Record<InvestmentType, string> = {
  cdb: 'CDB',
  tesouro: 'Tesouro',
  poupanca: 'Poupança',
  fundo: 'Fundo',
  acoes: 'Ações',
  cripto: 'Cripto',
  outro: 'Outro',
};

function parseAmountBR(raw: string): number | null {
  const cleaned = raw.trim().replace(/\s/g, '');
  if (!cleaned) return null;
  const normalized = cleaned.includes(',')
    ? cleaned.replace(/\./g, '').replace(',', '.')
    : cleaned;
  const n = Number(normalized);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : null;
}

export default function Investments() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, totalPrincipal, totalValue, totalYield, isLoading } = useInvestments();
  const { data: accounts } = useAccounts();
  const createInvestment = useCreateInvestment();
  const archiveInvestment = useArchiveInvestment();

  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<InvestmentType>('cdb');
  const [amountRaw, setAmountRaw] = useState('');
  const [rateKind, setRateKind] = useState<RateKind>('cdi_pct');
  const [rateRaw, setRateRaw] = useState('');
  const [accountId, setAccountId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/banks');
  };

  const parsedAmount = parseAmountBR(amountRaw);
  const parsedRate = rateRaw ? Number(rateRaw.replace(',', '.')) : null;
  const projection =
    parsedAmount && parsedRate && parsedRate > 0
      ? projectedValueInMonths(
          { principal: parsedAmount, rateKind, rate: parsedRate },
          todayISO(),
          12
        )
      : null;

  const handleSave = async () => {
    setError(null);
    if (name.trim().length < 2) {
      setError('Dê um nome (ex: CDB 102% Sofisa).');
      return;
    }
    if (!parsedAmount) {
      setError('Valor aplicado inválido (ex: 1.000,00).');
      return;
    }
    if (!parsedRate || parsedRate <= 0) {
      setError(rateKind === 'cdi_pct' ? 'Taxa inválida (ex: 102 = 102% do CDI).' : 'Taxa inválida (ex: 12,5 = 12,5% a.a.).');
      return;
    }
    try {
      await createInvestment.mutateAsync({
        name: name.trim(),
        type,
        principal: parsedAmount,
        rate_kind: rateKind,
        rate: parsedRate,
        start_date: todayISO(),
        account_id: accountId,
      });
      setCreating(false);
      setName('');
      setAmountRaw('');
      setRateRaw('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível salvar.');
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="px-5 pb-12"
        style={{ paddingTop: insets.top + 12 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-[600px] mx-auto">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-5">
            <Text className="text-xl font-bold text-foreground">Investimentos</Text>
            <Pressable
              onPress={close}
              className="w-9 h-9 rounded-full bg-muted items-center justify-center active:opacity-80"
              hitSlop={8}
            >
              <X color={colors.mutedForeground} size={18} />
            </Pressable>
          </View>

          {/* Hero */}
          <View className="rounded-3xl p-6 mb-5" style={{ backgroundColor: '#14181F' }}>
            <View className="flex-row items-center gap-2 mb-1">
              <TrendingUp size={13} color="#2BD4A0" />
              <Text
                className="text-[11px] font-semibold uppercase tracking-[0.15em]"
                style={{ color: 'rgba(255,255,255,0.55)' }}
              >
                Patrimônio investido
              </Text>
            </View>
            <Text className="text-white text-3xl font-bold tabular-nums" testID="invest-total">
              {formatCurrency(totalValue)}
            </Text>
            <View className="flex-row items-center gap-3 mt-1">
              <Text className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Aplicado: {formatCurrency(totalPrincipal)}
              </Text>
              {totalYield !== 0 && (
                <Text className="text-xs font-semibold" style={{ color: '#2BD4A0' }} testID="invest-yield">
                  +{formatCurrency(totalYield)}
                </Text>
              )}
            </View>
          </View>

          {/* Criar */}
          {!creating ? (
            <Button
              title="Nova aplicação"
              icon={<Plus color={colors.primaryForeground} size={16} />}
              onPress={() => setCreating(true)}
              className="mb-5"
              testID="btn-new-invest"
            />
          ) : (
            <Card className="p-4 mb-5">
              <Input label="Nome" placeholder="Ex: CDB 102% Sofisa" value={name} onChangeText={setName} testID="invest-name" />

              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-3 mb-2">
                Tipo
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {(Object.keys(TYPE_LABEL) as InvestmentType[]).map((t) => (
                  <Chip key={t} label={TYPE_LABEL[t]} selected={type === t} onPress={() => setType(t)} />
                ))}
              </View>

              <View className="flex-row gap-3 mt-3">
                <View className="flex-1">
                  <Input
                    label="Valor aplicado (R$)"
                    placeholder="1.000,00"
                    keyboardType="decimal-pad"
                    value={amountRaw}
                    onChangeText={setAmountRaw}
                    testID="invest-amount"
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label={rateKind === 'cdi_pct' ? '% do CDI' : '% ao ano'}
                    placeholder={rateKind === 'cdi_pct' ? '102' : '12,5'}
                    keyboardType="decimal-pad"
                    value={rateRaw}
                    onChangeText={setRateRaw}
                    testID="invest-rate"
                  />
                </View>
              </View>

              <View className="flex-row gap-2 mt-3">
                <Chip label="% do CDI" selected={rateKind === 'cdi_pct'} onPress={() => setRateKind('cdi_pct')} />
                <Chip label="Prefixado (a.a.)" selected={rateKind === 'fixed_annual'} onPress={() => setRateKind('fixed_annual')} />
              </View>

              {(accounts ?? []).length > 0 && (
                <>
                  <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-3 mb-2">
                    Banco (opcional)
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    <Chip label="Nenhum" selected={accountId === null} onPress={() => setAccountId(null)} />
                    {(accounts ?? []).map((a) => (
                      <Chip key={a.id} label={a.name} selected={accountId === a.id} onPress={() => setAccountId(a.id)} />
                    ))}
                  </View>
                </>
              )}

              {projection && (
                <View className="mt-3 rounded-xl bg-accent px-3 py-2.5">
                  <Text className="text-xs text-primary font-semibold" testID="invest-projection">
                    Em 12 meses ≈ {formatCurrency(projection)}
                  </Text>
                  <Text className="text-[10px] text-muted-foreground mt-0.5">
                    Simulação com CDI a {String(CDI_ANNUAL_PCT).replace('.', ',')}% a.a. · sem IR/IOF
                  </Text>
                </View>
              )}

              {error ? <Text className="text-danger text-xs mt-3">{error}</Text> : null}

              <View className="flex-row gap-2 mt-4">
                <Button
                  title="Aplicar"
                  size="sm"
                  loading={createInvestment.isPending}
                  icon={<Check color={colors.primaryForeground} size={14} />}
                  onPress={handleSave}
                  testID="btn-save-invest"
                />
                <Button title="Cancelar" size="sm" variant="ghost" onPress={() => setCreating(false)} />
              </View>
            </Card>
          )}

          {/* Lista */}
          {isLoading ? (
            <View className="py-14 items-center">
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : data.length === 0 ? (
            <Card className="p-8 items-center">
              <TrendingUp size={26} color={colors.mutedForeground} />
              <Text className="text-sm text-muted-foreground mt-2 text-center">
                Nenhuma aplicação ainda. Simule a primeira acima.
              </Text>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              {data.map((inv, i) => (
                <View
                  key={inv.id}
                  className={`flex-row items-center gap-3 px-4 py-3.5 ${i > 0 ? 'border-t border-border' : ''}`}
                >
                  <View className="w-10 h-10 rounded-xl bg-accent items-center justify-center">
                    <TrendingUp size={16} color={colors.primary} />
                  </View>
                  <View className="flex-1 min-w-0">
                    <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                      {inv.name}
                    </Text>
                    <Text className="text-[11px] text-muted-foreground mt-0.5">
                      {TYPE_LABEL[inv.type]} ·{' '}
                      {inv.rate_kind === 'cdi_pct'
                        ? `${String(inv.rate).replace('.', ',')}% CDI`
                        : `${String(inv.rate).replace('.', ',')}% a.a.`}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm font-bold tabular-nums text-foreground">
                      {formatCurrency(inv.currentValue)}
                    </Text>
                    {inv.yieldValue > 0 && (
                      <Text className="text-[11px] font-semibold text-success">
                        +{formatCurrency(inv.yieldValue)}
                      </Text>
                    )}
                  </View>
                  <Pressable
                    onPress={() => archiveInvestment.mutate(inv.id)}
                    hitSlop={6}
                    className="p-1.5 rounded-full active:bg-muted"
                    testID={`invest-del-${inv.id}`}
                  >
                    <Trash2 size={14} color={colors.mutedForeground} />
                  </Pressable>
                </View>
              ))}
            </Card>
          )}

          <Text className="text-[10px] text-muted-foreground/70 text-center mt-4">
            Valores simulados (juros compostos, CDI constante a {String(CDI_ANNUAL_PCT).replace('.', ',')}% a.a., sem IR/IOF).
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
