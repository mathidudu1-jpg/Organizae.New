import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TransactionForm } from '@/features/finance/components/TransactionForm';
import { useCreateTransaction } from '@/features/finance/hooks/useTransactions';
import { colors } from '@/theme/colors';

export default function NewTransaction() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const createTx = useCreateTransaction();

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
            submitting={createTx.isPending}
            onSubmit={async (values) => {
              await createTx.mutateAsync(values);
              router.back();
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
}
