import { useRouter } from 'expo-router';
import { Check, X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Input } from '@/components/ui';
import { CreditCardVisual } from '@/features/finance/components/CreditCardVisual';
import { useCreateCard } from '@/features/finance/hooks/useCards';
import { validateCycleConfig } from '@/features/finance/lib/invoice';
import { colors } from '@/theme/colors';
import type { Card as CardRow } from '@/types/database';

const CARD_COLORS = ['#14181F', '#0B8A63', '#1D4ED8', '#7C3AED', '#BE123C', '#B45309', '#FFFFFF'];

/** "1.234,56" → número (>=0) ou null. */
function parseAmountBR(raw: string): number | null {
  const cleaned = raw.trim().replace(/\s/g, '');
  if (!cleaned) return null;
  const normalized = cleaned.includes(',')
    ? cleaned.replace(/\./g, '').replace(',', '.')
    : cleaned;
  const n = Number(normalized);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : null;
}

export default function NewCard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const createCard = useCreateCard();

  const [name, setName] = useState('');
  const [last4, setLast4] = useState('');
  const [limitRaw, setLimitRaw] = useState('');
  const [closingRaw, setClosingRaw] = useState('');
  const [dueRaw, setDueRaw] = useState('');
  const [color, setColor] = useState(CARD_COLORS[0]);
  const [error, setError] = useState<string | null>(null);

  // Preview ao vivo do cartão enquanto digita
  const preview = {
    id: 'preview',
    user_id: '',
    account_id: null,
    name: name || 'Meu cartão',
    brand: null,
    last4: last4 || null,
    credit_limit: null,
    closing_day: null,
    due_day: null,
    color,
    is_archived: false,
    created_at: '',
    updated_at: '',
  } satisfies CardRow;

  const handleSave = async () => {
    setError(null);

    if (name.trim().length < 2) {
      setError('Dê um nome ao cartão (ex: C6 Bank).');
      return;
    }
    if (last4 && !/^\d{4}$/.test(last4)) {
      setError('O final do cartão são os 4 últimos dígitos.');
      return;
    }
    const closingDay = Number(closingRaw);
    const dueDay = Number(dueRaw);
    const cycleError = validateCycleConfig({ closingDay, dueDay });
    if (cycleError) {
      setError(cycleError);
      return;
    }
    const credit_limit = limitRaw ? parseAmountBR(limitRaw) : null;
    if (limitRaw && credit_limit == null) {
      setError('Limite inválido (ex: 5.000,00).');
      return;
    }

    try {
      await createCard.mutateAsync({
        name: name.trim(),
        last4: last4 || null,
        credit_limit,
        closing_day: closingDay,
        due_day: dueDay,
        color,
      });
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
            <Text className="text-xl font-bold text-foreground">Novo cartão</Text>
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
            <CreditCardVisual card={preview} width={150} />
          </View>

          <Input
            label="Nome"
            placeholder="Ex: C6 Bank"
            value={name}
            onChangeText={setName}
            testID="card-name"
          />

          <View className="flex-row gap-3 mt-4">
            <View className="flex-1">
              <Input
                label="Final (4 dígitos)"
                placeholder="9048"
                keyboardType="number-pad"
                maxLength={4}
                value={last4}
                onChangeText={(v) => setLast4(v.replace(/\D/g, ''))}
                testID="card-last4"
              />
            </View>
            <View className="flex-1">
              <Input
                label="Limite (R$)"
                placeholder="5.000,00"
                keyboardType="decimal-pad"
                value={limitRaw}
                onChangeText={setLimitRaw}
                testID="card-limit"
              />
            </View>
          </View>

          <View className="flex-row gap-3 mt-4">
            <View className="flex-1">
              <Input
                label="Dia de fechamento"
                placeholder="25"
                keyboardType="number-pad"
                maxLength={2}
                value={closingRaw}
                onChangeText={(v) => setClosingRaw(v.replace(/\D/g, ''))}
                testID="card-closing"
              />
            </View>
            <View className="flex-1">
              <Input
                label="Dia de vencimento"
                placeholder="3"
                keyboardType="number-pad"
                maxLength={2}
                value={dueRaw}
                onChangeText={(v) => setDueRaw(v.replace(/\D/g, ''))}
                testID="card-due"
              />
            </View>
          </View>

          {/* Cor */}
          <View className="mt-4">
            <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Cor
            </Text>
            <View className="flex-row flex-wrap gap-2.5">
              {CARD_COLORS.map((c) => (
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
            title="Salvar cartão"
            onPress={handleSave}
            loading={createCard.isPending}
            icon={<Check color={colors.primaryForeground} size={18} />}
            className="mt-8"
            testID="btn-save-card"
          />
        </View>
      </ScrollView>
    </View>
  );
}
