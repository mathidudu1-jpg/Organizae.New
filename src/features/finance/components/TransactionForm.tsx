import { ArrowDownCircle, ArrowUpCircle, Check, Trash2 } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Button, Chip } from '@/components/ui';
import { useCards } from '@/features/finance/hooks/useCards';
import { useCategories } from '@/features/finance/hooks/useCategories';
import { todayISO } from '@/lib/format';
import { colors } from '@/theme/colors';
import type { EntryType, Transaction } from '@/types/database';

export interface TransactionFormValues {
  type: Exclude<EntryType, 'transfer'>;
  amount: number;
  description: string;
  date: string; // YYYY-MM-DD
  category_id: string | null;
  card_id: string | null;
}

interface TransactionFormProps {
  initial?: Transaction;
  submitting?: boolean;
  submitLabel?: string;
  onSubmit: (values: TransactionFormValues) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
  deleting?: boolean;
}

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
  const [, dd, mm] = m;
  const d = Number(dd);
  const mo = Number(mm);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return `${m[3]}-${mm}-${dd}`;
}

function toBR(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function toAmountBR(n: number): string {
  return n.toFixed(2).replace('.', ',');
}

function yesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function TransactionForm({
  initial,
  submitting = false,
  submitLabel = 'Salvar',
  onSubmit,
  onDelete,
  deleting = false,
}: TransactionFormProps) {
  const { data: categories } = useCategories();
  const { data: cards } = useCards();

  const [type, setType] = useState<Exclude<EntryType, 'transfer'>>(
    initial?.type === 'income' ? 'income' : 'expense'
  );
  const [amountRaw, setAmountRaw] = useState(initial ? toAmountBR(initial.amount) : '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [categoryId, setCategoryId] = useState<string | null>(initial?.category_id ?? null);
  const [cardId, setCardId] = useState<string | null>(initial?.card_id ?? null);
  const [dateBR, setDateBR] = useState(toBR(initial?.date ?? todayISO()));
  const [error, setError] = useState<string | null>(null);

  const visibleCategories = useMemo(
    () => (categories ?? []).filter((c) => c.kind === type),
    [categories, type]
  );

  const switchType = (next: Exclude<EntryType, 'transfer'>) => {
    setType(next);
    setCategoryId(null);
    if (next === 'income') setCardId(null); // entradas não vão em cartão
    setError(null);
  };

  const handleSubmit = async () => {
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
      await onSubmit({
        type,
        amount,
        description: description.trim(),
        date: dateISO,
        category_id: categoryId,
        card_id: type === 'expense' ? cardId : null,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível salvar. Tente de novo.');
    }
  };

  const isExpense = type === 'expense';

  return (
    <View>
      {/* Tipo */}
      <View className="flex-row gap-2">
        <Pressable
          onPress={() => switchType('expense')}
          className={`flex-1 h-12 rounded-2xl flex-row items-center justify-center gap-2 border ${
            isExpense ? 'bg-danger/10 border-danger' : 'bg-surface border-border'
          }`}
          testID="type-expense"
        >
          <ArrowDownCircle color={isExpense ? colors.danger : colors.placeholder} size={18} />
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
          <ArrowUpCircle color={!isExpense ? colors.primary : colors.placeholder} size={18} />
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
            placeholderTextColor={colors.placeholder}
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
          <Chip
            label="Hoje"
            selected={dateBR === toBR(todayISO())}
            onPress={() => setDateBR(toBR(todayISO()))}
          />
          <Chip
            label="Ontem"
            selected={dateBR === toBR(yesterdayISO())}
            onPress={() => setDateBR(toBR(yesterdayISO()))}
          />
          <View className="flex-1 h-10 rounded-full bg-surface border border-border px-4 justify-center">
            <TextInput
              className="text-foreground text-sm text-center"
              value={dateBR}
              onChangeText={setDateBR}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={colors.placeholder}
              keyboardType="numbers-and-punctuation"
            />
          </View>
        </View>
      </View>

      {/* Pagamento (só despesas com cartões cadastrados) */}
      {isExpense && (cards ?? []).length > 0 && (
        <View className="mt-4">
          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Pagamento
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <Chip label="Conta" selected={cardId === null} onPress={() => setCardId(null)} />
            {(cards ?? []).map((c) => (
              <Chip
                key={c.id}
                label={c.last4 ? `${c.name} · ${c.last4}` : c.name}
                selected={cardId === c.id}
                onPress={() => setCardId(c.id)}
              />
            ))}
          </View>
        </View>
      )}

      {/* Categoria */}
      <View className="mt-4">
        <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Categoria
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {visibleCategories.map((c) => (
            <Chip
              key={c.id}
              label={c.name}
              selected={categoryId === c.id}
              onPress={() => setCategoryId(categoryId === c.id ? null : c.id)}
            />
          ))}
          {visibleCategories.length === 0 && (
            <Text className="text-sm text-muted-foreground">Carregando categorias…</Text>
          )}
        </View>
      </View>

      {error ? <Text className="text-danger text-xs mt-4">{error}</Text> : null}

      {/* Ações */}
      <Button
        title={submitLabel}
        onPress={handleSubmit}
        loading={submitting}
        icon={<Check color={colors.primaryForeground} size={18} />}
        className="mt-8"
        testID="btn-save"
      />
      {onDelete ? (
        <Button
          title="Excluir lançamento"
          variant="danger"
          onPress={onDelete}
          loading={deleting}
          icon={<Trash2 color={colors.danger} size={16} />}
          className="mt-3"
          testID="btn-delete"
        />
      ) : null}
    </View>
  );
}
