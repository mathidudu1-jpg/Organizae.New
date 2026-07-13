import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TransactionForm } from '@/features/finance/components/TransactionForm';
import { useCards } from '@/features/finance/hooks/useCards';
import {
  useCreateInstallmentPurchase,
  useCreateTransaction,
} from '@/features/finance/hooks/useTransactions';
import { colors } from '@/theme/colors';

export default function NewTransaction() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: cards } = useCards();
  const createTx = useCreateTransaction();
  const createInstallments = useCreateInstallmentPurchase();

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="px-5 pb-12"
        style={{ paddingTop: insets.top + 12 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full max-w-[480px] mx-auto">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-bold text-foreground">Novo lançamento</Text>
            <Pressable
              onPress={() => router.back()}
              className="w-9 h-9 rounded-full bg-muted items-center justify-center active:opacity-80"
              hitSlop={8}
            >
              <X color={colors.mutedForeground} size={18} />
            </Pressable>
          </View>

          <TransactionForm
            submitting={createTx.isPending || createInstallments.isPending}
            onSubmit={async (values) => {
              if (values.installments > 1 && values.card_id) {
                const card = (cards ?? []).find((c) => c.id === values.card_id);
                if (!card?.closing_day || !card?.due_day) {
                  throw new Error(
                    'Cadastre fechamento e vencimento do cartão para parcelar compras.'
                  );
                }
                await createInstallments.mutateAsync({
                  amount: values.amount,
                  description: values.description,
                  date: values.date,
                  category_id: values.category_id,
                  card_id: values.card_id,
                  cycleConfig: { closingDay: card.closing_day, dueDay: card.due_day },
                  installments: values.installments,
                });
              } else {
                const { installments: _ignored, ...row } = values;
                await createTx.mutateAsync(row);
              }
              router.back();
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
}
