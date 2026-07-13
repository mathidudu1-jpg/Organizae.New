import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Chip, Input } from '@/components/ui';
import { CreditCardVisual } from '@/features/finance/components/CreditCardVisual';
import { useAccounts } from '@/features/finance/hooks/useAccounts';
import { useCreateCard } from '@/features/finance/hooks/useCards';
import {
  interestFreeDays,
  suggestedClosingDay,
  validateCycleConfig,
} from '@/features/finance/lib/invoice';
import { colors } from '@/theme/colors';
import type { Card as CardRow, CardKind } from '@/types/database';

const CARD_COLORS = ['#14181F', '#0B8A63', '#1D4ED8', '#7C3AED', '#BE123C', '#B45309', '#FFFFFF'];

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
  const { bank } = useLocalSearchParams<{ bank?: string }>();
  const { data: accounts } = useAccounts();
  const createCard = useCreateCard();

  const [kind, setKind] = useState<CardKind>('credit');
  const [accountId, setAccountId] = useState<string | null>(bank ?? null);
  const [name, setName] = useState('');
  const [last4, setLast4] = useState('');
  const [limitRaw, setLimitRaw] = useState('');
  const [closingRaw, setClosingRaw] = useState('');
  const [dueRaw, setDueRaw] = useState('');
  const [color, setColor] = useState(CARD_COLORS[0]);
  const [error, setError] = useState<string | null>(null);

  const isCredit = kind === 'credit';

  const preview = {
    id: 'preview',
    user_id: '',
    account_id: accountId,
    name: name || 'Meu cartão',
    brand: null,
    last4: last4 || null,
    credit_limit: null,
    closing_day: null,
    due_day: null,
    color,
    kind,
    is_archived: false,
    created_at: '',
    updated_at: '',
  } satisfies CardRow;

  const handleSave = async () => {
    setError(null);

    if (name.trim().length < 2) {
      setError('Dê um nome ao cartão (ex: C6 Múltiplo).');
      return;
    }
    if (last4 && !/^\d{4}$/.test(last4)) {
      setError('O final do cartão são os 4 últimos dígitos.');
      return;
    }

    let credit_limit: number | null = null;
    let closing_day: number | null = null;
    let due_day: number | null = null;

    if (isCredit) {
      const closingDay = Number(closingRaw);
      const dueDay = Number(dueRaw);
      const cycleError = validateCycleConfig({ closingDay, dueDay });
      if (cycleError) {
        setError(cycleError);
        return;
      }
      closing_day = closingDay;
      due_day = dueDay;
      if (limitRaw) {
        credit_limit = parseAmountBR(limitRaw);
        if (credit_limit == null) {
          setError('Limite inválido (ex: 5.000,00).');
          return;
        }
      }
    } else if (!accountId) {
      setError('Cartão de débito precisa de um banco (é de onde sai o dinheiro).');
      return;
    }

    try {
      await createCard.mutateAsync({
        name: name.trim(),
        kind,
        account_id: accountId,
        last4: last4 || null,
        credit_limit,
        closing_day,
        due_day,
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

          {/* Tipo */}
          <View className="mb-4">
            <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Tipo
            </Text>
            <View className="flex-row gap-2">
              <Chip
                label="Crédito"
                selected={isCredit}
                onPress={() => setKind('credit')}
                testID="kind-credit"
              />
              <Chip
                label="Débito"
                selected={!isCredit}
                onPress={() => setKind('debit')}
                testID="kind-debit"
              />
            </View>
          </View>

          {/* Banco */}
          {(accounts ?? []).length > 0 && (
            <View className="mb-4">
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Banco
              </Text>
              <View className="flex-row flex-wrap gap-2">
                <Chip
                  label="Sem banco"
                  selected={accountId === null}
                  onPress={() => setAccountId(null)}
                />
                {(accounts ?? []).map((a) => (
                  <Chip
                    key={a.id}
                    label={a.name}
                    selected={accountId === a.id}
                    onPress={() => setAccountId(a.id)}
                  />
                ))}
              </View>
            </View>
          )}

          <Input
            label="Nome"
            placeholder="Ex: C6 Múltiplo"
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
            {isCredit && (
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
            )}
          </View>

          {isCredit && (
            <>
              {/* Vencimento: dias comuns no Brasil */}
              <View className="mt-4">
                <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Dia de vencimento
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {[1, 5, 10, 15, 20, 25].map((d) => (
                    <Chip
                      key={d}
                      label={String(d)}
                      selected={dueRaw === String(d)}
                      onPress={() => setDueRaw(String(d))}
                      testID={`due-${d}`}
                    />
                  ))}
                  <View className="w-20 h-10 rounded-full bg-surface border border-border px-3 justify-center">
                    <TextInput
                      className="text-foreground text-sm text-center"
                      placeholder="outro"
                      placeholderTextColor={colors.placeholder}
                      keyboardType="number-pad"
                      maxLength={2}
                      value={[1, 5, 10, 15, 20, 25].includes(Number(dueRaw)) ? '' : dueRaw}
                      onChangeText={(v) => setDueRaw(v.replace(/\D/g, ''))}
                      testID="card-due"
                    />
                  </View>
                </View>
              </View>

              <View className="flex-row gap-3 mt-4 items-end">
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
                {dueRaw !== '' && (
                  <Pressable
                    onPress={() => setClosingRaw(String(suggestedClosingDay(Number(dueRaw))))}
                    className="h-12 px-4 rounded-2xl bg-accent border border-primary/30 items-center justify-center active:opacity-80"
                    testID="btn-suggest-closing"
                  >
                    <Text className="text-xs font-semibold text-primary">
                      Sugerir ({suggestedClosingDay(Number(dueRaw))})
                    </Text>
                  </Pressable>
                )}
              </View>
              <Text className="text-[11px] text-muted-foreground mt-2">
                No Brasil, a fatura costuma fechar 7–10 dias antes do vencimento (C6, Nubank e
                Santander usam ~7).
              </Text>

              {/* Preview do prazo sem juros */}
              {closingRaw !== '' &&
                dueRaw !== '' &&
                validateCycleConfig({ closingDay: Number(closingRaw), dueDay: Number(dueRaw) }) ===
                  null && (
                  <View className="mt-3 rounded-xl bg-accent px-3 py-2.5">
                    <Text className="text-xs text-primary font-semibold" testID="freedays-preview">
                      Fecha dia {closingRaw}, vence dia {dueRaw} → até{' '}
                      {interestFreeDays({
                        closingDay: Number(closingRaw),
                        dueDay: Number(dueRaw),
                      })}{' '}
                      dias sem juros no melhor dia de compra
                    </Text>
                  </View>
                )}
            </>
          )}

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
