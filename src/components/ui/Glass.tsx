// ============================================================
// Glassmorphism — regra geral de superfícies do app.
// Web: blur + saturação reais (backdrop-filter, estilo Apple).
// Nativo: fallback translúcido de alta opacidade (blur nativo
// entra depois via expo-glass-effect/expo-blur quando formos
// polir iOS/Android).
// ============================================================

import { Platform, View, type ViewProps } from 'react-native';

type GlassProps = ViewProps & {
  className?: string;
  /** Intensidade do blur na web (px). */
  intensity?: number;
  tint?: 'light' | 'dark';
};

export function Glass({
  className = '',
  intensity = 22,
  tint = 'light',
  style,
  ...props
}: GlassProps) {
  const surface =
    Platform.OS === 'web'
      ? ({
          backgroundColor: tint === 'dark' ? 'rgba(17,21,28,0.82)' : 'rgba(255,255,255,0.66)',
          backdropFilter: `blur(${intensity}px) saturate(1.7)`,
          WebkitBackdropFilter: `blur(${intensity}px) saturate(1.7)`,
        } as object)
      : { backgroundColor: tint === 'dark' ? 'rgba(17,21,28,0.97)' : 'rgba(255,255,255,0.96)' };

  return (
    <View
      className={`rounded-3xl border ${
        tint === 'dark' ? 'border-white/10' : 'border-white/60'
      } ${className}`}
      style={[surface, style]}
      {...props}
    />
  );
}
