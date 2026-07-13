import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { Archive, Check, CreditCard, Pencil, Plus, Wallet, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, Input } from '@/components/ui';
import { CreditCardVisual } from '@/features/finance/components/CreditCardVisual';
import { InvoicePanel } from '@/features/finance/components/InvoicePanel';
import {
  useAccountBalances,
  useAccounts,
  useArchiveAccount,
  useUpdateAccount,
} from '@/features/finance/hooks/useAccounts';
import { useCards } from '@/features/finance/hooks/useCards';
import { formatCurrency } from '@/lib/format';
import { colors } from '@/theme/colors';

const BANK_COLORS = ['#14181F', '#0B8A63', '#7C3AED', '#1D4ED8', '#BE123C', '#B45309', '#DB2777'];

function parseAmountBR(raw: string): number | null {
  const cleaned = raw.trim().replace(/\s/g, '');
  if (!cleaned) return null;
  const normalized = cleaned.includes(',')
    ? cleaned.replace(/\./g, '').replace(',', '.')
    : cleaned;
  const n = Number(normalized);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
}

export default function BankDetail() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: accounts, isLoading } = useAccounts();
  const { data: cards } = useCards();
  const { balanceOf } = useAccountBalances();
  const updateAccount = useUpdateAccount();
  const archiveAccount = useArchiveAccount();

  const bank = (accounts ?? []).find((a) => a.id === id);
  const bankCards = useMemo(
    () => (cards ?? []).filter((c) => c.account_id === id),
    [cards, id]
  );

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBalanceRaw, setEditBalanceRaw] = useState('');
  const [editColor, setEditColor] = useState(BANK_COLORS[0]);
  const [editError, setEditError] = useState<string | null>(null);

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/banks');
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!bank) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-8">
        <Text className="text-sm text-muted-foreground">Banco não encontrado.</Text>
        <Button title="Voltar" variant="outline" onPress={close} className="mt-4" />
      </View>
    );
  }

  const color = bank.color ?? '#14181F';
  const selectedCard =
    bankCards.find((c) => c.id === selectedCardId) ?? bankCards[0] ?? null;

  const startEdit = () => {
    setEditName(bank.name);
    setEditBalanceRaw(String(bank.initial_balance).replace('.', ','));
    setEditColor(bank.color ?? BANK_COLORS[0]);
    setEditError(null);
    setEditing(true);
  };

  const saveEdit = async () => {
    setEditError(null);
    if (editName.trim().length < 2) {
      setEditError('Nome muito curto.');
      return;
    }
    const initial_balance = parseAmountBR(editBalanceRaw);
    if (initial_balance == null) {
      setEditError('Saldo inicial inválido.');
      return;
    }
    try {
      await updateAccount.mutateAsync({
        id: bank.id,
        patch: { name: editName.trim(), initial_balance, color: editColor },
      });
      setEditing(false);
    } catch (e) {
      setEditError(e instanceof Error ? e.message : 'Não foi possível salvar.');
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="pb-12"
        style={{ paddingTop: insets.top + 12 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full max-w-[720px] mx-auto">
          {/* Top bar */}
          <View className="flex-row items-center justify-between px-5 mb-4">
            <Pressable
              onPress={close}
              className="w-9 h-9 rounded-full bg-surface border border-border items-center justify-center active:opacity-80"
              hitSlop={8}
            >
              <X color={colors.mutedForeground} size={17} />
            </Pressable>
            <Pressable
              onPress={editing ? () => setEditing(false) : startEdit}
              className="flex-row items-center gap-1.5 px-3.5 h-9 rounded-full bg-surface border border-border active:opacity-80"
              testID="btn-edit-bank"
            >
              <Pencil size={13} color={colors.mutedForeground} />
              <Text className="text-xs font-semibold text-muted-foreground">
                {editing ? 'Cancelar' : 'Editar'}
              </Text>
            </Pressable>
          </View>

          {/* Banner temático */}
          <View className="px-5">
            <View className="rounded-3xl p-6 overflow-hidden" style={{ backgroundColor: color }}>
              <View className="flex-row items-center gap-3">
                <View
                  className="w-12 h-12 rounded-2xl items-center justify-center"
                  style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                >
                  <Text className="text-white font-bold text-base">
                    {bank.name.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-lg" numberOfLines={1} testID="bank-title">
                    {bank.name}
                  </Text>
                  <Text className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    {bankCards.length} {bankCards.length === 1 ? 'cartão' : 'cartões'}
                  </Text>
                </View>
              </View>
              <View className="mt-5 flex-row items-end justify-between">
                <View>
                  <View className="flex-row items-center gap-1.5">
                    <Wallet size={11} color="rgba(255,255,255,0.55)" />
                    <Text
                      className="text-[10px] font-semibold uppercase tracking-[0.15em]"
                      style={{ color: 'rgba(255,255,255,0.55)' }}
                    >
                      Saldo da conta
                    </Text>
                  </View>
                  <Text className="text-white text-3xl font-bold tabular-nums" testID="bank-balance">
                    {formatCurrency(balanceOf(bank.id))}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Edição inline */}
          {editing && (
            <View className="px-5 mt-4">
              <Card className="p-4">
                <Input label="Nome" value={editName} onChangeText={setEditName} testID="edit-bank-name" />
                <Input
                  containerClassName="mt-3"
                  label="Saldo inicial (R$)"
                  keyboardType="numbers-and-punctuation"
                  value={editBalanceRaw}
                  onChangeText={setEditBalanceRaw}
                  testID="edit-bank-balance"
                />
                <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-3 mb-2">
                  Cor
                </Text>
                <View className="flex-row flex-wrap gap-2.5">
                  {BANK_COLORS.map((c) => (
                    <Pressable
                      key={c}
                      onPress={() => setEditColor(c)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        editColor === c ? 'border-primary' : 'border-border'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </View>
                {editError ? <Text className="text-danger text-xs mt-3">{editError}</Text> : null}
                <View className="flex-row gap-2 mt-4">
                  <Button
                    title="Salvar"
                    size="sm"
                    loading={updateAccount.isPending}
                    onPress={saveEdit}
                    icon={<Check color={colors.primaryForeground} size={14} />}
                    testID="btn-save-bank-edit"
                  />
                  <Button
                    title="Arquivar banco"
                    size="sm"
                    variant="danger"
                    icon={<Archive color={colors.danger} size={13} />}
                    onPress={() => {
                      close();
                      archiveAccount.mutate(bank.id);
                    }}
                    testID="btn-archive-bank"
                  />
                </View>
              </Card>
            </View>
          )}

          {/* Cartões do banco */}
          <View className="flex-row items-center justify-between px-5 mt-6 mb-3">
            <Text className="text-base font-bold text-foreground">Cartões</Text>
            <Link href={`/card-new?bank=${bank.id}`} asChild>
              <Pressable
                className="flex-row items-center gap-1.5 bg-primary rounded-full px-3.5 py-1.5 active:opacity-90"
                testID="btn-add-card"
              >
                <Plus color="#FFFFFF" size={13} />
                <Text className="text-primary-foreground font-semibold text-xs">Cartão</Text>
              </Pressable>
            </Link>
          </View>

          {bankCards.length === 0 ? (
            <View className="px-5">
              <Card className="p-6 items-center">
                <CreditCard size={24} color={colors.mutedForeground} />
                <Text className="text-sm text-muted-foreground mt-2 text-center">
                  Nenhum cartão neste banco ainda.
                </Text>
              </Card>
            </View>
          ) : (
            <>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
              >
                {bankCards.map((c) => {
                  const selected = selectedCard?.id === c.id;
                  return (
                    <View key={c.id}>
                      <Pressable onPress={() => setSelectedCardId(c.id)}>
                        <CreditCardVisual card={c} width={150} dimmed={!selected} />
                      </Pressable>
                      <View className="flex-row items-center justify-center gap-2 mt-2">
                        <Text className="text-[11px] font-semibold text-muted-foreground">
                          {c.kind === 'debit' ? 'Débito' : 'Crédito'}
                          {c.last4 ? ` · ${c.last4}` : ''}
                        </Text>
                        <Link href={`/card/${c.id}`} asChild>
                          <Pressable hitSlop={8} testID={`edit-card-${c.id}`}>
                            <Pencil size={11} color={colors.primary} />
                          </Pressable>
                        </Link>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>

              {/* Painel do cartão selecionado */}
              <View className="px-5 mt-5">
                {selectedCard?.kind === 'credit' ? (
                  <InvoicePanel key={selectedCard.id} card={selectedCard} />
                ) : selectedCard ? (
                  <Card className="p-5 flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-xl bg-accent items-center justify-center">
                      <Wallet size={17} color={colors.primary} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-foreground">Cartão de débito</Text>
                      <Text className="text-xs text-muted-foreground mt-0.5 leading-4">
                        Compras no débito saem direto do saldo da conta {bank.name}.
                      </Text>
                    </View>
                  </Card>
                ) : null}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
