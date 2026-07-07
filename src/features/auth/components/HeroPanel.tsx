import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Shield, Star, Users } from 'lucide-react-native';
import { Text, View } from 'react-native';

/**
 * Painel esquerdo do login (desktop): foto da mulher com véus de gradiente
 * esmeralda, logo, tagline e a faixa de prova social — fiel ao original.
 */
export function HeroPanel() {
  return (
    <View className="flex-1 relative overflow-hidden">
      {/* Foto de fundo */}
      <Image
        source={require('@/assets/brand/hero-woman.webp')}
        contentFit="cover"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Véus esmeralda (de baixo pra cima + laterais) */}
      <LinearGradient
        colors={['rgba(2,44,34,0.88)', 'rgba(6,78,59,0.42)', 'transparent']}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <LinearGradient
        colors={['rgba(2,44,34,0.35)', 'transparent', 'rgba(2,44,34,0.35)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Conteúdo central */}
      <View className="flex-1 items-center justify-center px-12">
        <Image
          source={require('@/assets/brand/logo-organizae-large.png')}
          contentFit="contain"
          style={{ height: 56, width: 240 }}
        />
        <Text
          className="text-white/95 text-3xl font-light text-center mt-6"
          style={{ textShadowColor: 'rgba(0,0,0,0.25)', textShadowRadius: 12 }}
        >
          Controle do mês.
        </Text>
        <Text
          className="text-white text-3xl font-bold text-center"
          style={{ textShadowColor: 'rgba(0,0,0,0.25)', textShadowRadius: 12 }}
        >
          Clareza do dia.
        </Text>
      </View>

      {/* Prova social */}
      <View className="absolute bottom-8 left-0 right-0 flex-row items-center justify-center gap-8 px-8">
        <View className="flex-row items-center gap-2">
          <View className="w-7 h-7 rounded-full bg-white/10 items-center justify-center">
            <Users size={13} color="#6EE7B7" />
          </View>
          <Text className="text-white font-bold text-sm">1.5k+</Text>
          <Text className="text-emerald-200/70 text-sm">usuários</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="w-7 h-7 rounded-full bg-amber-400/15 items-center justify-center">
            <Star size={13} color="#FBBF24" fill="#FBBF24" />
          </View>
          <Text className="text-white font-bold text-sm">4.9</Text>
          <Text className="text-emerald-200/70 text-sm">nota</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="w-7 h-7 rounded-full bg-white/10 items-center justify-center">
            <Shield size={13} color="#6EE7B7" />
          </View>
          <Text className="text-emerald-200/70 text-sm">100% seguro</Text>
        </View>
      </View>
    </View>
  );
}
