import { Check, X } from 'lucide-react-native';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface Level {
  label: string;
  bar: string;
  text: string;
}

const LEVELS: Level[] = [
  { label: 'Muito fraca', bar: '#E5484D', text: '#E5484D' },
  { label: 'Fraca', bar: '#F97316', text: '#F97316' },
  { label: 'Média', bar: '#E6A200', text: '#B45309' },
  { label: 'Forte', bar: '#84CC16', text: '#4D7C0F' },
  { label: 'Muito forte', bar: '#0B8A63', text: '#0B8A63' },
];

export const PASSWORD_CHECKS = [
  { key: 'length', label: '8+ caracteres', test: (p: string) => p.length >= 8 },
  { key: 'upper', label: 'Maiúscula', test: (p: string) => /[A-Z]/.test(p) },
  { key: 'lower', label: 'Minúscula', test: (p: string) => /[a-z]/.test(p) },
  { key: 'number', label: 'Número', test: (p: string) => /[0-9]/.test(p) },
  { key: 'special', label: 'Especial (!@#)', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
] as const;

export function passwordIsStrong(password: string): boolean {
  return PASSWORD_CHECKS.every((c) => c.test(password));
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const results = useMemo(
    () => PASSWORD_CHECKS.map((c) => ({ ...c, passed: c.test(password) })),
    [password]
  );

  if (!password) return null;

  const passedCount = results.filter((r) => r.passed).length;
  const level = LEVELS[Math.max(0, passedCount - 1)];

  return (
    <View className="mt-2">
      {/* Barra + rótulo */}
      <View className="flex-row items-center gap-2">
        <View className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <View
            className="h-full rounded-full"
            style={{
              width: `${(passedCount / PASSWORD_CHECKS.length) * 100}%`,
              backgroundColor: level.bar,
            }}
          />
        </View>
        <Text className="text-[11px] font-semibold min-w-[70px] text-right" style={{ color: level.text }}>
          {level.label}
        </Text>
      </View>

      {/* Critérios */}
      <View className="flex-row flex-wrap gap-x-4 gap-y-1 mt-2">
        {results.map((r) => (
          <View key={r.key} className="flex-row items-center gap-1">
            {r.passed ? (
              <Check size={11} color="#0B8A63" />
            ) : (
              <X size={11} color="#9AA1A9" />
            )}
            <Text className={`text-[11px] ${r.passed ? 'text-success' : 'text-muted-foreground'}`}>
              {r.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
