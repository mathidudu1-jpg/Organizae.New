import { useRouter } from 'expo-router';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase';

export default function Login() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    if (!email || !password) {
      setError('Preencha email e senha.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.replace('/');
  };

  return (
    <View className="flex-1 bg-surface lg:flex-row">
      {/* Hero (verde) — topo no mobile, lateral no web */}
      <View
        className="bg-primary px-8 pb-10 lg:flex-1 lg:justify-center items-center justify-end"
        style={{ paddingTop: insets.top + 48, minHeight: 220 }}
      >
        <View className="w-16 h-16 rounded-3xl bg-white/15 items-center justify-center mb-4">
          <Text className="text-white font-extrabold text-2xl">O</Text>
        </View>
        <Text className="text-white text-3xl font-light text-center">Controle do mês.</Text>
        <Text className="text-white text-3xl font-bold text-center">Clareza do dia.</Text>
      </View>

      {/* Formulário */}
      <View className="flex-1 lg:flex-1">
        <ScrollView
          contentContainerClassName="px-6 py-8 lg:px-16 lg:py-16 grow justify-center"
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full max-w-[400px] mx-auto">
            <Text className="text-[28px] font-bold text-foreground">Comece agora</Text>
            <Text className="text-sm text-muted-foreground mt-1.5">
              Acesse sua conta e organize suas finanças
            </Text>

            {/* Email */}
            <View className="mt-6">
              <View className="flex-row items-center h-12 rounded-2xl bg-background border border-border px-4">
                <Mail color="#6B7280" size={16} />
                <TextInput
                  className="flex-1 ml-3 text-foreground text-sm"
                  placeholder="seu@email.com"
                  placeholderTextColor="#9AA1A9"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Senha */}
            <View className="mt-4">
              <View className="flex-row items-center h-12 rounded-2xl bg-background border border-border px-4">
                <Lock color="#6B7280" size={16} />
                <TextInput
                  className="flex-1 ml-3 text-foreground text-sm"
                  placeholder="••••••••••"
                  placeholderTextColor="#9AA1A9"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable onPress={() => setShowPassword((s) => !s)} hitSlop={8}>
                  {showPassword ? (
                    <EyeOff color="#6B7280" size={16} />
                  ) : (
                    <Eye color="#6B7280" size={16} />
                  )}
                </Pressable>
              </View>
            </View>

            {error ? <Text className="text-danger text-xs mt-3">{error}</Text> : null}

            {/* Entrar */}
            <Pressable
              onPress={handleLogin}
              disabled={loading}
              className="mt-6 h-12 rounded-2xl bg-primary items-center justify-center active:opacity-90"
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-primary-foreground font-semibold text-sm">Entrar</Text>
              )}
            </Pressable>

            <Pressable onPress={() => router.replace('/')} className="mt-4 items-center">
              <Text className="text-muted-foreground text-sm">Voltar para a Home</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
