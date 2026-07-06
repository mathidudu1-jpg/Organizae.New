import { Sparkles } from 'lucide-react-native';
import { Text, View } from 'react-native';

export default function Iza() {
  return (
    <View className="flex-1 bg-background items-center justify-center px-8">
      <View className="w-20 h-20 rounded-3xl bg-accent items-center justify-center mb-5">
        <Sparkles color="#0B8A63" size={34} />
      </View>
      <Text className="text-2xl font-bold text-foreground">Iza</Text>
      <Text className="text-sm text-muted-foreground text-center mt-2 leading-5">
        Sua assistente pessoal e financeira chega aqui — depois que o app estiver
        funcionando por completo. Por enquanto, só o espaço reservado.
      </Text>
      <View className="mt-5 px-4 py-1.5 rounded-full bg-accent">
        <Text className="text-primary font-semibold text-xs">em breve</Text>
      </View>
    </View>
  );
}
