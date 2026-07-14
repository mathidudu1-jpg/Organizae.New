// ============================================================
// Primitivas de MOTION — regra geral do app.
//  · PressableScale: todo elemento clicável encolhe suavemente
//    ao toque (spring Apple-like; transição CSS na web).
//  · Screen: cada tela entra com fade-up e REPETE a entrada a
//    cada foco de aba (tabs mantêm telas montadas).
//  · Enter: itens de lista entram escalonados (stagger).
// Use estas primitivas em vez de Pressable/View cru em UI nova.
// ============================================================

import { useFocusEffect } from 'expo-router';
import { forwardRef, useCallback, useState, type ReactNode } from 'react';
import { Pressable, View, type PressableProps, type ViewProps } from 'react-native';

type PressableScaleProps = PressableProps & {
  className?: string;
  /** Escala no toque (padrão 0.97). */
  scaleTo?: number;
};

export const PressableScale = forwardRef<View, PressableScaleProps>(
  ({ style, className = '', scaleTo = 0.97, ...props }, ref) => (
    <Pressable
      ref={ref}
      // `org-press` (global.css, web) suaviza transform/hover; nativo ignora sem custo.
      className={`org-press ${className}`}
      style={(state) => [
        typeof style === 'function' ? style(state) : style,
        { transform: [{ scale: state.pressed ? scaleTo : 1 }] },
        state.pressed ? { opacity: 0.92 } : null,
      ]}
      {...props}
    />
  )
);
PressableScale.displayName = 'PressableScale';

/** Wrapper de tela: entrada fade-up que replay a cada foco da aba. */
export function Screen({ className = '', children, ...props }: ViewProps & { className?: string }) {
  const [epoch, setEpoch] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setEpoch((e) => e + 1);
    }, [])
  );

  return (
    <View key={epoch} className={`flex-1 animate-screen ${className}`} {...props}>
      {children}
    </View>
  );
}

/** Entrada escalonada de item (delay = index × passo). */
export function Enter({
  index = 0,
  step = 45,
  className = '',
  children,
  ...props
}: ViewProps & { index?: number; step?: number; className?: string; children?: ReactNode }) {
  return (
    <View
      className={`animate-item ${className}`}
      style={{ animationDelay: `${index * step}ms` } as object}
      {...props}
    >
      {children}
    </View>
  );
}
