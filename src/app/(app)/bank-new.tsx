import { useRouter } from 'expo-router';
import { Check, Wallet, X } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, Chip, Enter, Input, PressableScale, Screen } from '@/components/ui';
import { colors } from '@/theme/colors';
import { useCreateAccount } from '@/features/finance/hooks/useAccounts';
import { formatCurrency } from '@/lib/format';
import type { AccountType } from '@/types/database';

const BANK_COLORS = ['#14181F', '#0B8A63', '#7C3AED', '#1D4ED8', '#BE123C', '#B45309', '#DB2777'];

const TYPES: { key: AccountType; label: string }[] = [
  { key: 'checking', label: 'Conta corrente' },
  { key: 'savings', label: 'Poupança' },
  { key: 'wallet', label: 'Carteira digital' },
  { key: 'cash', label: 'Dinheiro' },
];

function parseAmountBR(raw: string): number | null {
  const cleaned = raw.trim().replace(/\s/g, '');
  if (!cleaned) return 0;
  const normalized = cleaned.includes(',')
    ? cleaned.replace(/\./g, '').replace(',', '.')
    : cleaned;
  const n = Number(normalized);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-5">
      {children}
    </Text>
  );
}

export default function NewBank() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const createAccount = useCreateAccount();

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('checking');
  const [balanceRaw, setBalanceRaw] = useState('');
  const [color, setColor] = useState(BANK_COLORS[0]);
  const [error, setError] = useState<string | null>(null);

  const parsedBalance = parseAmountBR(balanceRaw) ?? 0;

  const handleSave = async () => {
    setError(null);
    if (name.trim().length < 2) {
      setError('Dê um nome ao banco (ex: C6 Bank, Nubank...).');
      return;
    }
    const initial_balance = parseAmountBR(balanceRaw);
    if (initial_balance == null) {
      setError('Saldo inicial inválido (ex: 1.500,00 — pode ser negativo com "-").');
      return;
    }
    try {
      await createAccount.mutateAsync({ name: name.trim(), type, initial_balance, color });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível salvar.');
    }
  };

  /* Preview vivo — o card do banco como vai aparecer na lista */
  const previewPanel = (
    <Enter index={0} className={isDesktop ? 'w-[320px]' : 'w-full'}>
      <View className="rounded-3xl p-6 overflow-hidden" style={{ backgroundColor: color }}>
        <View className="flex-row items-center gap-3">
          <View
            className="w-12 h-12 rounded-2xl items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          >
            <Text className="text-white font-bold text-base">
              {(name || 'B').slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold text-lg" numberOfLines={1}>
              {name || 'Seu banco'}
            </Text>
            <Text className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {TYPES.find((t) => t.key === type)?.label}
            </Text>
          </View>
        </View>
        <View className="mt-5">
          <View className="flex-row items-center gap-1.5">
            <Wallet size={11} color="rgba(255,255,255,0.55)" />
            <Text
              className="text-[10px] font-semibold uppercase tracking-[0.15em]"
              style={{ color: 'rgba(255,255,255,0.55)' }}
            >
              Saldo inicial
            </Text>
          </View>
          <Text className="text-white text-3xl font-bold tabular-nums">
            {formatCurrency(parsedBalance)}
          </Text>
        </View>
      </View>

      <Card className="p-4 mt-4">
        <Text className="text-xs text-muted-foreground leading-5">
          O saldo do banco é <Text className="font-semibold text-foreground">sempre derivado</Text>:
          saldo inicial + entradas − saídas − compras no débito − pagamentos de fatura. Nada de
          número desatualizado.
        </Text>
      </Card>
    </Enter>
  );

  const form = (
    <Enter index={1} className="flex-1">
      <SectionTitle>Identificação</SectionTitle>
      <Input placeholder="Nome (ex: C6 Bank)" value={name} onChangeText={setName} testID="bank-name" />

      <SectionTitle>Tipo</SectionTitle>
      <View className="flex-row flex-wrap gap-2">
        {TYPES.map((t) => (
          <Chip key={t.key} label={t.label} selected={type === t.key} onPress={() => setType(t.key)} />
        ))}
      </View>

      <SectionTitle>Saldo inicial (R$)</SectionTitle>
      <Input
        placeholder="0,00"
        keyboardType="numbers-and-punctuation"
        value={balanceRaw}
        onChangeText={setBalanceRaw}
        testID="bank-initial-balance"
      />

      <SectionTitle>Cor</SectionTitle>
      <View className="flex-row flex-wrap gap-2.5">
        {BANK_COLORS.map((c) => (
          <PressableScale
            key={c}
            onPress={() => setColor(c)}
            scaleTo={0.88}
            className={`w-10 h-10 rounded-full border-2 ${
              color === c ? 'border-primary shadow-md' : 'border-border hover:border-primary/40'
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </View>

      {error ? <Text className="text-danger text-xs mt-4">{error}</Text> : null}

      <Button
        title="Salvar banco"
        onPress={handleSave}
        loading={createAccount.isPending}
        icon={<Check color={colors.primaryForeground} size={18} />}
        className="mt-8"
        testID="btn-save-bank"
      />
    </Enter>
  );

  return (
    <Screen className="bg-background">
      <ScrollView
        contentContainerClassName="px-5 pb-12 lg:px-8"
        style={{ paddingTop: insets.top + 12 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className={`w-full mx-auto ${isDesktop ? 'max-w-[880px]' : 'max-w-[480px]'}`}>
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-bold text-foreground">Novo banco</Text>
            <PressableScale
              onPress={() => router.back()}
              scaleTo={0.9}
              className="w-9 h-9 rounded-full bg-muted items-center justify-center hover:bg-border"
              hitSlop={8}
            >
              <X color={colors.mutedForeground} size={18} />
            </PressableScale>
          </View>

          {isDesktop ? (
            <View className="flex-row gap-10">
              {previewPanel}
              {form}
            </View>
          ) : (
            <>
              {previewPanel}
              {form}
            </>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
