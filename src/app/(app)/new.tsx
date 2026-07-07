import { useRouter } from 'expo-router';
import { ArrowDownCircle, ArrowUpCircle, Check, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCategories } from '@/features/finance/hooks/useCategories';
import { useCreateTransaction } from '@/features/finance/hooks/useTransactions';
import { todayISO } from '@/lib/format';
import type { EntryType } from '@/types/database';

/** "1.234,56" | "1234.56" | "1234" → número (ou null se inválido). */
function parseAmountBR(raw: string): number | null {
  const cleaned = raw.trim().replace(/\s/g, '');
  if (!cleaned) return null;
  const normalized = cleaned.includes(',')
    ? cleaned.replace(/\./g, '').replace(',', '.')
    : cleaned;
  const n = Number(normalized);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : null;
}

/** "DD/MM/AAAA" → "AAAA-MM-DD" (ou null se inválida). */
function parseDateBR(raw: string): string | null {
  const m = raw.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const d = Number(dd);
  const mo = Number(mm);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return `${yyyy}-${mm}-${dd}`;
}

function toBR(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function yesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function NewTransaction() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: categories } = useCategories();
  const createTx = useCreateTransaction();

  const [type, setType] = useState<Exclude<EntryType, 'transfer'>>('expense');
  const [amountRaw, setAmountRaw] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [dateBR, setDateBR] = useState(toBR(todayISO()));
  const [error, setError] = useState<string | null>(null);

  const visibleCategories = useMemo(
    () => (categories ?? []).filter((c) => c.kind === type),
    [categories, type]
  );

  const switchType = (next: Exclude<EntryType, 'transfer'>) => {
    setType(next);
    setCategoryId(null);
    setError(null);
  };

  const handleSave = async () => {
    setError(null);
    const amount = parseAmountBR(amountRaw);
    if (!amount) {
      setError('Digite um valor válido (ex: 49,90).');
      return;
    }
    const dateISO = parseDateBR(dateBR);
    if (!dateISO) {
      setError('Data inválida. Use DD/MM/AAAA.');
      return;
    }
    if (!description.trim()) {
      setError('Dê uma descrição ao lançamento.');
      return;
    }

    try {
      await createTx.mutateAsync({
        type,
        amount,
        description: description.trim(),
        date: dateISO,
        category_id: categoryId,
      });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível salvar. Tente de novo.');
    }
  };

  const isExpense = type === 'expense';

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="px-5 pb-12"
        style={{ paddingTop: insets.top + 12 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full max-w-[480px] mx-auto">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-bold text-foreground">Novo lançamento</Text>
            <Pressable
              onPress={() => router.back()}
              className="w-9 h-9 rounded-full bg-muted items-center justify-center active:opacity-80"
              hitSlop={8}
            >
              <X color="#6B7280" size={18} />
            </Pressable>
          </View>

          {/* Tipo */}
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => switchType('expense')}
              className={`flex-1 h-12 rounded-2xl flex-row items-center justify-center gap-2 border ${
                isExpense ? 'bg-danger/10 border-danger' : 'bg-surface border-border'
              }`}
              testID="type-expense"
            >
              <ArrowDownCircle color={isExpense ? '#E5484D' : '#9AA1A9'} size={18} />
              <Text
                className={`text-sm font-semibold ${isExpense ? 'text-danger' : 'text-muted-foreground'}`}
              >
                Saída
              </Text>
            </Pressable>
            <Pressable
              onPress={() => switchType('income')}
              className={`flex-1 h-12 rounded-2xl flex-row items-center justify-center gap-2 border ${
                !isExpense ? 'bg-accent border-primary' : 'bg-surface border-border'
              }`}
              testID="type-income"
            >
              <ArrowUpCircle color={!isExpense ? '#0B8A63' : '#9AA1A9'} size={18} />
              <Text
                className={`text-sm font-semibold ${!isExpense ? 'text-primary' : 'text-muted-foreground'}`}
              >
                Entrada
              </Text>
            </Pressable>
          </View>

          {/* Valor */}
          <View className="mt-6">
            <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Valor
            </Text>
            <View className="flex-row items-center h-14 rounded-2xl bg-surface border border-border px-4">
              <Text className="text-muted-foreground text-base mr-2">R$</Text>
              <TextInput
                className="flex-1 text-foreground text-2xl font-bold"
                placeholder="0,00"
                placeholderTextColor="#C4C9CF"
                keyboardType="decimal-pad"
                value={amountRaw}
                onChangeText={setAmountRaw}
                testID="input-amount"
              />
            </View>
          </View>

          {/* Descrição */}
          <View className="mt-4">
            <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Descrição
            </Text>
            <View className="h-12 rounded-2xl bg-surface border border-border px-4 justify-center">
              <TextInput
                className="text-foreground text-sm"
                placeholder={isExpense ? 'Ex: Mercado' : 'Ex: Salário'}
                placeholderTextColor="#9AA1A9"
                value={description}
                onChangeText={setDescription}
                testID="input-description"
              />
            </View>
          </View>

          {/* Data */}
          <View className="mt-4">
            <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Data
            </Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setDateBR(toBR(todayISO()))}
                className={`px-4 h-10 rounded-full border items-center justify-center ${
                  dateBR === toBR(todayISO()) ? 'bg-accent border-primary' : 'bg-surface border-border'
                }`}
              >
                <Text className="text-sm font-medium text-foreground">Hoje</Text>
              </Pressable>
              <Pressable
                onPress={() => setDateBR(toBR(yesterdayISO()))}
                className={`px-4 h-10 rounded-full border items-center justify-center ${
                  dateBR === toBR(yesterdayISO()) ? 'bg-accent border-primary' : 'bg-surface border-border'
                }`}
              >
                <Text className="text-sm font-medium text-foreground">Ontem</Text>
              </Pressable>
              <View className="flex-1 h-10 rounded-full bg-surface border border-border px-4 justify-center">
                <TextInput
                  className="text-foreground text-sm text-center"
                  value={dateBR}
                  onChangeText={setDateBR}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor="#9AA1A9"
                  keyboardType="numbers-and-punctuation"
                />
              </View>
            </View>
          </View>

          {/* Categoria */}
          <View className="mt-4">
            <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Categoria
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {visibleCategories.map((c) => {
                const selected = categoryId === c.id;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => setCategoryId(selected ? null : c.id)}
                    className={`px-4 h-10 rounded-full border items-center justify-center ${
                      selected ? 'bg-accent border-primary' : 'bg-surface border-border'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${selected ? 'text-primary' : 'text-foreground'}`}
                    >
                      {c.name}
                    </Text>
                  </Pressable>
                );
              })}
              {visibleCategories.length === 0 && (
                <Text className="text-sm text-muted-foreground">Carregando categorias…</Text>
              )}
            </View>
          </View>

          {error ? <Text className="text-danger text-xs mt-4">{error}</Text> : null}

          {/* Salvar */}
          <Pressable
            onPress={handleSave}
            disabled={createTx.isPending}
            className="mt-8 h-12 rounded-2xl bg-primary flex-row items-center justify-center gap-2 active:opacity-90"
            testID="btn-save"
          >
            {createTx.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Check color="#FFFFFF" size={18} />
                <Text className="text-primary-foreground font-semibold text-sm">Salvar</Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
