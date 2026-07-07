import { Image } from 'expo-image';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react-native';
import { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Input } from '@/components/ui';
import { HeroPanel } from '@/features/auth/components/HeroPanel';
import {
  PasswordStrengthIndicator,
  passwordIsStrong,
} from '@/features/auth/components/PasswordStrengthIndicator';
import { supabase } from '@/lib/supabase';
import { colors } from '@/theme/colors';

type Mode = 'login' | 'signup' | 'reset';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const COPY: Record<Mode, { title: string; subtitle: string; cta: string }> = {
  login: {
    title: 'Comece agora',
    subtitle: 'Acesse sua conta e organize suas finanças',
    cta: 'Entrar',
  },
  signup: {
    title: 'Criar conta',
    subtitle: 'Leva menos de um minuto.',
    cta: 'Criar conta',
  },
  reset: {
    title: 'Recuperar senha',
    subtitle: 'Digite seu email para receber o link de recuperação',
    cta: 'Enviar link de recuperação',
  },
};

/** Blob suave de "aurora" no fundo branco (blur real na web, véu leve no nativo). */
function AuroraBlob({
  size,
  color,
  style,
}: {
  size: number;
  color: string;
  style: object;
}) {
  return (
    <View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          ...(Platform.OS === 'web' ? ({ filter: 'blur(60px)' } as object) : { opacity: 0.5 }),
        },
        style,
      ]}
    />
  );
}

export default function Login() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const copy = COPY[mode];

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setNotice(null);
  };

  const friendly = (msg: string): string => {
    if (msg.includes('Invalid login credentials')) return 'Email ou senha incorretos.';
    if (msg.includes('already registered')) return 'Este email já tem conta. Use "Entrar".';
    if (msg.toLowerCase().includes('rate limit')) return 'Muitas tentativas. Aguarde um instante.';
    return msg;
  };

  const handleSubmit = async () => {
    setError(null);
    setNotice(null);

    if (!EMAIL_RE.test(email.trim())) {
      setError('Email inválido.');
      return;
    }

    if (mode === 'reset') {
      setLoading(true);
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim());
      setLoading(false);
      if (err) setError(friendly(err.message));
      else setNotice('Pronto! Se este email tiver conta, o link de recuperação chega em instantes.');
      return;
    }

    if (!password) {
      setError('Digite sua senha.');
      return;
    }

    if (mode === 'signup') {
      if (name.trim().length < 2) {
        setError('Digite seu nome.');
        return;
      }
      if (!passwordIsStrong(password)) {
        setError('Sua senha ainda não cumpre todos os critérios abaixo.');
        return;
      }
      if (password !== confirm) {
        setError('As senhas não coincidem.');
        return;
      }
      if (!acceptedTerms) {
        setError('Você precisa aceitar os Termos de Uso e a Política de Privacidade.');
        return;
      }
    }

    setLoading(true);
    const result =
      mode === 'signup'
        ? await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: { data: { name: name.trim() } },
          })
        : await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);

    if (result.error) setError(friendly(result.error.message));
    // Sucesso: AuthProvider recebe a sessão e os layouts redirecionam sozinhos.
  };

  return (
    <View className="flex-1 bg-surface lg:flex-row">
      {/* Painel hero — desktop: lateral (60%); mobile: topo compacto */}
      {isDesktop ? (
        <View style={{ flex: 1.4 }}>
          <HeroPanel />
        </View>
      ) : (
        <View
          className="bg-primary px-8 pb-8 items-center justify-end"
          style={{ paddingTop: insets.top + 36, minHeight: 190 }}
        >
          <Image
            source={require('@/assets/brand/logo-organizae-large.png')}
            contentFit="contain"
            style={{ height: 40, width: 180 }}
          />
          <Text className="text-white/95 text-2xl font-light text-center mt-4">
            Controle do mês.
          </Text>
          <Text className="text-white text-2xl font-bold text-center">Clareza do dia.</Text>
        </View>
      )}

      {/* Lado do formulário */}
      <View className="flex-1 relative bg-[#f9f9fb]">
        {/* Aurora blobs */}
        <AuroraBlob size={500} color="rgba(16,138,99,0.16)" style={{ top: -160, left: -160 }} />
        <AuroraBlob size={420} color="rgba(15,118,110,0.12)" style={{ top: '40%', right: -120 }} />
        <AuroraBlob size={450} color="rgba(34,153,84,0.10)" style={{ bottom: -100, left: -60 }} />

        <ScrollView
          contentContainerClassName="px-6 py-8 lg:px-16 grow justify-center"
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full max-w-[400px] mx-auto">
            {/* Cabeçalho */}
            <View className="flex-row items-center gap-2 flex-wrap">
              <Text className="text-[28px] font-bold text-foreground">{copy.title}</Text>
              {mode !== 'reset' && (
                <Image
                  source={require('@/assets/brand/favicon-organizae.png')}
                  contentFit="contain"
                  style={{ height: 40, width: 40 }}
                />
              )}
            </View>
            <Text className="text-sm text-muted-foreground mt-1.5">{copy.subtitle}</Text>

            {/* Nome (signup) */}
            {mode === 'signup' && (
              <Input
                containerClassName="mt-6"
                icon={<User color={colors.mutedForeground} size={16} />}
                placeholder="Seu nome"
                value={name}
                onChangeText={setName}
                testID="input-name"
              />
            )}

            {/* Email */}
            <Input
              containerClassName={mode === 'signup' ? 'mt-4' : 'mt-6'}
              icon={<Mail color={colors.mutedForeground} size={16} />}
              placeholder="seu@email.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              testID="input-email"
            />

            {/* Senha (login/signup) */}
            {mode !== 'reset' && (
              <>
                <Input
                  containerClassName="mt-4"
                  icon={<Lock color={colors.mutedForeground} size={16} />}
                  placeholder="••••••••••"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  testID="input-password"
                  right={
                    <Pressable onPress={() => setShowPassword((s) => !s)} hitSlop={8}>
                      {showPassword ? (
                        <EyeOff color={colors.mutedForeground} size={16} />
                      ) : (
                        <Eye color={colors.mutedForeground} size={16} />
                      )}
                    </Pressable>
                  }
                />
                {mode === 'signup' && <PasswordStrengthIndicator password={password} />}
              </>
            )}

            {/* Confirmar senha (signup) */}
            {mode === 'signup' && (
              <Input
                containerClassName="mt-4"
                icon={<Lock color={colors.mutedForeground} size={16} />}
                placeholder="Confirme a senha"
                secureTextEntry={!showConfirm}
                value={confirm}
                onChangeText={setConfirm}
                testID="input-confirm"
                right={
                  <Pressable onPress={() => setShowConfirm((s) => !s)} hitSlop={8}>
                    {showConfirm ? (
                      <EyeOff color={colors.mutedForeground} size={16} />
                    ) : (
                      <Eye color={colors.mutedForeground} size={16} />
                    )}
                  </Pressable>
                }
              />
            )}

            {/* Esqueci minha senha (login) */}
            {mode === 'login' && (
              <View className="flex-row justify-end mt-3">
                <Pressable onPress={() => switchMode('reset')} hitSlop={8}>
                  <Text className="text-sm text-muted-foreground">Esqueci minha senha</Text>
                </Pressable>
              </View>
            )}

            {/* Termos (signup) */}
            {mode === 'signup' && (
              <Pressable
                onPress={() => setAcceptedTerms((v) => !v)}
                className="flex-row items-start gap-2.5 mt-4"
                testID="chk-terms"
              >
                <View
                  className={`w-4 h-4 mt-0.5 rounded border items-center justify-center ${
                    acceptedTerms ? 'bg-primary border-primary' : 'bg-surface border-border'
                  }`}
                >
                  {acceptedTerms && <Text className="text-white text-[10px] font-bold">✓</Text>}
                </View>
                <Text className="flex-1 text-xs text-muted-foreground leading-relaxed">
                  Li e aceito os <Text className="text-primary font-medium">Termos de Uso</Text> e
                  a <Text className="text-primary font-medium">Política de Privacidade</Text>.
                </Text>
              </Pressable>
            )}

            {error ? <Text className="text-danger text-xs mt-3">{error}</Text> : null}
            {notice ? <Text className="text-success text-xs mt-3">{notice}</Text> : null}

            {/* Ação principal */}
            <Button
              title={copy.cta}
              onPress={handleSubmit}
              loading={loading}
              className="mt-6"
              testID="btn-submit"
            />

            {/* Navegação entre modos */}
            {mode === 'reset' ? (
              <Pressable onPress={() => switchMode('login')} className="mt-5 items-center" hitSlop={8}>
                <Text className="text-sm text-muted-foreground">Voltar para login</Text>
              </Pressable>
            ) : (
              <View className="flex-row items-center justify-center mt-5">
                <Text className="text-muted-foreground text-sm">
                  {mode === 'signup' ? 'Já tem uma conta? ' : 'Não tem uma conta? '}
                </Text>
                <Pressable
                  onPress={() => switchMode(mode === 'signup' ? 'login' : 'signup')}
                  hitSlop={8}
                  testID="toggle-mode"
                >
                  <Text className="text-primary font-semibold text-sm">
                    {mode === 'signup' ? 'Entrar' : 'Criar conta'}
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Rodapé */}
            <View className="items-center mt-10 pt-5 border-t border-border/60">
              <Text className="text-[10px] text-muted-foreground/60">
                Organizae • CNPJ: 64.671.649/0001-17
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
