import { useLocalSearchParams, useRouter } from 'expo-router';
import { Archive, Check, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Chip, Input } from '@/components/ui';
import { CreditCardVisual } from '@/features/finance/components/CreditCardVisual';
import { useAccounts } from '@/features/finance/hooks/useAccounts';
import { useArchiveCard, useCards, useUpdateCard } from '@/features/finance/hooks/useCards';
import { validateCycleConfig } from '@/features/finance/lib/invoice';
import { colors } from '@/theme/colors';

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

export default function EditCard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: cards, isLoading } = useCards();
  const { data: accounts } = useAccounts();
  const updateCard = useUpdateCard();
  const archiveCard = useArchiveCard();

  const card = (cards ?? []).find((c) => c.id === id);

  const [name, setName] = useState('');
  const [accountId, setAccountId] = useState<string | null>(null);
  const [limitRaw, setLimitRaw] = useState('');
  const [closingRaw, setClosingRaw] = useState('');
  const [dueRaw, setDueRaw] = useState('');
  const [color, setColor] = useState(CARD_COLORS[0]);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (card && !loaded) {
      setName(card.name);
      setAccountId(card.account_id);
      setLimitRaw(card.credit_limit != null ? String(card.credit_limit).replace('.', ',') : '');
      setClosingRaw(card.closing_day != null ? String(card.closing_day) : '');
      setDueRaw(card.due_day != null ? String(card.due_day) : '');
      setColor(card.color ?? CARD_COLORS[0]);
      setLoaded(true);
    }
  }, [card, loaded]);

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/banks');
  };

  if (isLoading || (card && !loaded)) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!card) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-8">
        <Text className="text-sm text-muted-foreground">Cartão não encontrado.</Text>
        <Button title="Voltar" variant="outline" onPress={close} className="mt-4" />
      </View>
    );
  }

  const isCredit = card.kind === 'credit';

  const handleSave = async () => {
    setError(null);
    if (name.trim().length < 2) {
      setError('Nome muito curto.');
      return;
    }
    let credit_limit: number | null = null;
    let closing_day: number | null = card.closing_day;
    let due_day: number | null = card.due_day;

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
      setError('Cartão de débito precisa de um banco.');
      return;
    }

    try {
      await updateCard.mutateAsync({
        id: card.id,
        patch: {
          name: name.trim(),
          account_id: accountId,
          credit_limit,
          closing_day,
          due_day,
          color,
        },
      });
      close();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível salvar.');
    }
  };

  const preview = { ...card, name: name || card.name, color };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="px-5 pb-12"
        style={{ paddingTop: insets.top + 12 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full max-w-[480px] mx-auto">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-xl font-bold text-foreground">Editar cartão</Text>
              <Text className="text-xs text-muted-foreground mt-0.5">
                {isCredit ? 'Crédito' : 'Débito'} — o tipo não muda depois de criado.
              </Text>
            </View>
            <Pressable
              onPress={close}
              className="w-9 h-9 rounded-full bg-muted items-center justify-center active:opacity-80"
              hitSlop={8}
            >
              <X color={colors.mutedForeground} size={18} />
            </Pressable>
          </View>

          <View className="items-center mb-6">
            <CreditCardVisual card={preview} width={150} />
          </View>

          {/* Banco */}
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
                  testID={`bank-chip-${a.id}`}
                />
              ))}
            </View>
          </View>

          <Input label="Nome" value={name} onChangeText={setName} testID="card-name" />

          {isCredit && (
            <View className="mt-4">
              <Input
                label="Limite (R$)"
                keyboardType="decimal-pad"
                value={limitRaw}
                onChangeText={setLimitRaw}
                testID="card-limit"
              />
            </View>
          )}

          {isCredit && (
            <View className="flex-row gap-3 mt-4">
              <View className="flex-1">
                <Input
                  label="Dia de fechamento"
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
                  keyboardType="number-pad"
                  maxLength={2}
                  value={dueRaw}
                  onChangeText={(v) => setDueRaw(v.replace(/\D/g, ''))}
                  testID="card-due"
                />
              </View>
            </View>
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
            title="Salvar alterações"
            onPress={handleSave}
            loading={updateCard.isPending}
            icon={<Check color={colors.primaryForeground} size={18} />}
            className="mt-8"
            testID="btn-save-card"
          />
          <Button
            title="Arquivar cartão"
            variant="danger"
            icon={<Archive color={colors.danger} size={15} />}
            onPress={() => {
              close();
              archiveCard.mutate(card.id);
            }}
            className="mt-3"
            testID="btn-archive-card"
          />
        </View>
      </ScrollView>
    </View>
  );
}
