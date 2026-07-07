import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react-native';
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

type Mode = 'login' | 'signup';

export default function Login() {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSignup = mode === 'signup';

  // Sucesso não navega manualmente: o AuthProvider recebe a sessão e os
  // layouts (auth)/(app) fazem o redirect sozinhos.
  const handleSubmit = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Preencha email e senha.');
      return;
    }
    if (isSignup && name.trim().length < 2) {
      setError('Digite seu nome.');
      return;
    }

    setLoading(true);
    const result = isSignup
      ? await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { name: name.trim() } },
        })
      : await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);

    if (result.error) {
      const msg = result.error.message;
      setError(
        msg.includes('Invalid login credentials')
          ? 'Email ou senha incorretos.'
          : msg.includes('already registered')
            ? 'Este email já tem conta. Use "Entrar".'
            : msg.includes('at least 6')
              ? 'A senha precisa ter pelo menos 6 caracteres.'
              : msg
      );
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
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
            <Text className="text-[28px] font-bold text-foreground">
              {isSignup ? 'Criar conta' : 'Comece agora'}
            </Text>
            <Text className="text-sm text-muted-foreground mt-1.5">
              {isSignup
                ? 'Leva menos de um minuto.'
                : 'Acesse sua conta e organize suas finanças'}
            </Text>

            {/* Nome (só signup) */}
            {isSignup && (
              <View className="mt-6">
                <View className="flex-row items-center h-12 rounded-2xl bg-background border border-border px-4">
                  <User color="#6B7280" size={16} />
                  <TextInput
                    className="flex-1 ml-3 text-foreground text-sm"
                    placeholder="Seu nome"
                    placeholderTextColor="#9AA1A9"
                    value={name}
                    onChangeText={setName}
                    testID="input-name"
                  />
                </View>
              </View>
            )}

            {/* Email */}
            <View className={isSignup ? 'mt-4' : 'mt-6'}>
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
                  testID="input-email"
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
                  testID="input-password"
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

            {/* Ação principal */}
            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              className="mt-6 h-12 rounded-2xl bg-primary items-center justify-center active:opacity-90"
              testID="btn-submit"
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-primary-foreground font-semibold text-sm">
                  {isSignup ? 'Criar conta' : 'Entrar'}
                </Text>
              )}
            </Pressable>

            {/* Alternar modo */}
            <View className="flex-row items-center justify-center mt-5">
              <Text className="text-muted-foreground text-sm">
                {isSignup ? 'Já tem uma conta? ' : 'Não tem uma conta? '}
              </Text>
              <Pressable onPress={() => switchMode(isSignup ? 'login' : 'signup')} hitSlop={8}>
                <Text className="text-primary font-semibold text-sm">
                  {isSignup ? 'Entrar' : 'Criar conta'}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
