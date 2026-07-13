import { useRouter } from 'expo-router';
import { Check, X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Chip, Input } from '@/components/ui';
import { useCreateAccount } from '@/features/finance/hooks/useAccounts';
import { colors } from '@/theme/colors';
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

export default function NewBank() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const createAccount = useCreateAccount();

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('checking');
  const [balanceRaw, setBalanceRaw] = useState('');
  const [color, setColor] = useState(BANK_COLORS[0]);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="px-5 pb-12"
        style={{ paddingTop: insets.top + 12 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full max-w-[480px] mx-auto">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-bold text-foreground">Novo banco</Text>
            <Pressable
              onPress={() => router.back()}
              className="w-9 h-9 rounded-full bg-muted items-center justify-center active:opacity-80"
              hitSlop={8}
            >
              <X color={colors.mutedForeground} size={18} />
            </Pressable>
          </View>

          {/* Preview */}
          <View className="items-center mb-6">
            <View
              className="w-16 h-16 rounded-3xl items-center justify-center"
              style={{ backgroundColor: color }}
            >
              <Text className="text-white font-bold text-lg">
                {(name || 'B').slice(0, 2).toUpperCase()}
              </Text>
            </View>
          </View>

          <Input
            label="Nome"
            placeholder="Ex: C6 Bank"
            value={name}
            onChangeText={setName}
            testID="bank-name"
          />

          <View className="mt-4">
            <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Tipo
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {TYPES.map((t) => (
                <Chip
                  key={t.key}
                  label={t.label}
                  selected={type === t.key}
                  onPress={() => setType(t.key)}
                />
              ))}
            </View>
          </View>

          <Input
            containerClassName="mt-4"
            label="Saldo inicial (R$)"
            placeholder="0,00"
            keyboardType="numbers-and-punctuation"
            value={balanceRaw}
            onChangeText={setBalanceRaw}
            testID="bank-initial-balance"
          />

          <View className="mt-4">
            <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Cor
            </Text>
            <View className="flex-row flex-wrap gap-2.5">
              {BANK_COLORS.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setColor(c)}
                  className={`w-9 h-9 rounded-full border-2 ${
                    color === c ? 'border-primary' : 'border-border'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </View>
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
        </View>
      </ScrollView>
    </View>
  );
}
