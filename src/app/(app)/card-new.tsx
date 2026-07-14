import { useLocalSearchParams, useRouter } from 'expo-router';
import { CalendarClock, Check, Sparkle, X } from 'lucide-react-native';
import { useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, Chip, Enter, Input, PressableScale, Screen } from '@/components/ui';
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

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-5">
      {children}
    </Text>
  );
}

export default function NewCard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const { bank } = useLocalSearchParams<{ bank?: string }>();
  const { data: accounts } = useAccounts();
  const createCard = useCreateCard();

  const [kind, setKind] = useState<CardKind>('credit');
  const [accountId, setAccountId] = useState<string | null>(bank ?? null);
  const [name, setName] = useState('');
  const [limitRaw, setLimitRaw] = useState('');
  const [closingRaw, setClosingRaw] = useState('');
  const [dueRaw, setDueRaw] = useState('');
  const [color, setColor] = useState(CARD_COLORS[0]);
  const [error, setError] = useState<string | null>(null);

  const isCredit = kind === 'credit';
  const cycleValid =
    closingRaw !== '' &&
    dueRaw !== '' &&
    validateCycleConfig({ closingDay: Number(closingRaw), dueDay: Number(dueRaw) }) === null;

  const preview = {
    id: 'preview',
    user_id: '',
    account_id: accountId,
    name: name || 'Meu cartão',
    brand: null,
    last4: null,
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

  /* ---------- painel de preview (esquerda no desktop) ---------- */
  const previewPanel = (
    <Enter index={0} className={isDesktop ? 'w-[320px]' : 'items-center'}>
      <View className={isDesktop ? 'items-center' : 'items-center'}>
        <CreditCardVisual card={preview} width={isDesktop ? 200 : 150} />
      </View>

      {isCredit && (
        <Card className={`p-4 mt-5 ${isDesktop ? '' : 'w-full'}`}>
          <View className="flex-row items-center gap-2 mb-2">
            <CalendarClock size={13} color={colors.primary} />
            <Text className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Como funciona a fatura
            </Text>
          </View>
          {cycleValid ? (
            <>
              <Text className="text-sm text-foreground leading-5">
                Fecha dia <Text className="font-bold">{closingRaw}</Text> e vence dia{' '}
                <Text className="font-bold">{dueRaw}</Text>.
              </Text>
              <View className="mt-2.5 rounded-xl bg-accent px-3 py-2.5">
                <Text className="text-xs text-primary font-semibold" testID="freedays-preview">
                  Até{' '}
                  {interestFreeDays({ closingDay: Number(closingRaw), dueDay: Number(dueRaw) })}{' '}
                  dias sem juros comprando no melhor dia (dia {Number(closingRaw) + 1 > 31 ? 1 : Number(closingRaw) + 1})
                </Text>
              </View>
            </>
          ) : (
            <Text className="text-xs text-muted-foreground leading-5">
              No Brasil, a fatura costuma fechar 7–10 dias antes do vencimento (C6, Nubank e
              Santander usam ~7). Escolha o vencimento ao lado que eu sugiro o fechamento.
            </Text>
          )}
        </Card>
      )}
    </Enter>
  );

  /* ---------- formulário ---------- */
  const form = (
    <Enter index={1} className="flex-1">
      <SectionTitle>Tipo</SectionTitle>
      <View className="flex-row gap-2">
        <Chip label="Crédito" selected={isCredit} onPress={() => setKind('credit')} testID="kind-credit" />
        <Chip label="Débito" selected={!isCredit} onPress={() => setKind('debit')} testID="kind-debit" />
      </View>

      {(accounts ?? []).length > 0 && (
        <>
          <SectionTitle>Banco</SectionTitle>
          <View className="flex-row flex-wrap gap-2">
            <Chip label="Sem banco" selected={accountId === null} onPress={() => setAccountId(null)} />
            {(accounts ?? []).map((a) => (
              <Chip key={a.id} label={a.name} selected={accountId === a.id} onPress={() => setAccountId(a.id)} />
            ))}
          </View>
        </>
      )}

      <SectionTitle>Identificação</SectionTitle>
      <Input placeholder="Nome do cartão (ex: C6 Múltiplo)" value={name} onChangeText={setName} testID="card-name" />

      {isCredit && (
        <>
          <SectionTitle>Limite</SectionTitle>
          <Input
            placeholder="Ex: 5.000,00 (opcional)"
            keyboardType="decimal-pad"
            value={limitRaw}
            onChangeText={setLimitRaw}
            testID="card-limit"
          />

          <SectionTitle>Dia de vencimento</SectionTitle>
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

          <SectionTitle>Dia de fechamento</SectionTitle>
          <View className="flex-row gap-3 items-center">
            <View className="w-28">
              <Input
                placeholder="25"
                keyboardType="number-pad"
                maxLength={2}
                value={closingRaw}
                onChangeText={(v) => setClosingRaw(v.replace(/\D/g, ''))}
                testID="card-closing"
              />
            </View>
            {dueRaw !== '' && (
              <PressableScale
                onPress={() => setClosingRaw(String(suggestedClosingDay(Number(dueRaw))))}
                className="h-12 px-4 rounded-2xl bg-accent border border-primary/30 items-center justify-center flex-row gap-1.5 hover:bg-accent/70"
                testID="btn-suggest-closing"
              >
                <Sparkle size={12} color={colors.primary} />
                <Text className="text-xs font-semibold text-primary">
                  Sugerir dia {suggestedClosingDay(Number(dueRaw))}
                </Text>
              </PressableScale>
            )}
          </View>
        </>
      )}

      <SectionTitle>Cor</SectionTitle>
      <View className="flex-row flex-wrap gap-2.5">
        {CARD_COLORS.map((c) => (
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
        title="Salvar cartão"
        onPress={handleSave}
        loading={createCard.isPending}
        icon={<Check color={colors.primaryForeground} size={18} />}
        className="mt-8"
        testID="btn-save-card"
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
            <Text className="text-xl font-bold text-foreground">Novo cartão</Text>
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
