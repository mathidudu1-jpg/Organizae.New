import { useLocalSearchParams, useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TransactionForm } from '@/features/finance/components/TransactionForm';
import {
  useDeleteInstallmentGroup,
  useDeleteTransaction,
  useTransaction,
  useUpdateTransaction,
} from '@/features/finance/hooks/useTransactions';
import { colors } from '@/theme/colors';

export default function EditTransaction() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: transaction, isLoading, error } = useTransaction(id);
  const updateTx = useUpdateTransaction();
  const deleteTx = useDeleteTransaction();
  const deleteGroup = useDeleteInstallmentGroup();

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
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
            <Text className="text-xl font-bold text-foreground">Editar lançamento</Text>
            <Pressable
              onPress={close}
              className="w-9 h-9 rounded-full bg-muted items-center justify-center active:opacity-80"
              hitSlop={8}
            >
              <X color={colors.mutedForeground} size={18} />
            </Pressable>
          </View>

          {isLoading ? (
            <View className="py-20 items-center">
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          ) : error || !transaction ? (
            <Text className="text-danger text-sm">Lançamento não encontrado.</Text>
          ) : (
            <>
              {transaction.installment_group && (
                <View className="rounded-2xl bg-accent border border-primary/20 px-4 py-3 mb-5">
                  <Text className="text-sm font-semibold text-primary">
                    Parcela {transaction.installment_no} de {transaction.installment_total}
                  </Text>
                  <Text className="text-xs text-muted-foreground mt-0.5">
                    Alterações aqui afetam só esta parcela. Para remover a compra inteira, use
                    "Excluir todas as parcelas".
                  </Text>
                  <Pressable
                    onPress={() => {
                      close();
                      deleteGroup.mutate(transaction.installment_group!);
                    }}
                    className="mt-2.5 self-start"
                    hitSlop={8}
                    testID="btn-delete-group"
                  >
                    <Text className="text-danger text-xs font-semibold">
                      Excluir todas as parcelas
                    </Text>
                  </Pressable>
                </View>
              )}

              <TransactionForm
                initial={transaction}
                submitLabel="Salvar alterações"
                submitting={updateTx.isPending}
                onSubmit={async (values) => {
                  const { installments: _ignored, ...patch } = values;
                  await updateTx.mutateAsync({ id: transaction.id, patch });
                  close();
                }}
                deleting={deleteTx.isPending}
                onDelete={() => {
                  // Navega já; a exclusão segue em background e a invalidação
                  // atualiza a Home (evita corrida com o refetch do detalhe).
                  close();
                  deleteTx.mutate(transaction.id);
                }}
              />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
