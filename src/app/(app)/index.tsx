import { Link } from 'expo-router';
import { Plus, Wallet } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Home() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="px-5 pb-10"
        style={{ paddingTop: insets.top + 12 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View className="flex-row items-center gap-3 mb-8">
          <View className="w-11 h-11 rounded-full bg-accent items-center justify-center">
            <Text className="text-primary font-bold text-base">M</Text>
          </View>
          <View>
            <Text className="text-xl font-bold text-foreground">Olá, Matheus</Text>
            <Text className="text-xs text-muted-foreground">Bem-vindo de volta</Text>
          </View>
        </View>

        {/* Clean empty state — base pronta pra construir */}
        <View className="mt-6 rounded-3xl bg-surface border border-border p-8 items-center">
          <View className="w-16 h-16 rounded-2xl bg-accent items-center justify-center mb-4">
            <Wallet color="#0B8A63" size={26} />
          </View>
          <Text className="text-lg font-bold text-foreground text-center">
            Tudo pronto pra começar
          </Text>
          <Text className="text-sm text-muted-foreground text-center mt-1.5 leading-5">
            Sem dados por aqui ainda. Vamos construir suas finanças e sua rotina do zero.
          </Text>

          <Link href="/login" asChild>
            <Pressable className="mt-6 flex-row items-center gap-2 bg-primary rounded-full px-6 py-3 active:opacity-90">
              <Plus color="#FFFFFF" size={18} />
              <Text className="text-primary-foreground font-semibold text-sm">
                Adicionar lançamento
              </Text>
            </Pressable>
          </Link>
        </View>

        <Text className="text-[11px] text-muted-foreground text-center mt-8">
          Organizae · base Expo universal
        </Text>
      </ScrollView>
    </View>
  );
}
