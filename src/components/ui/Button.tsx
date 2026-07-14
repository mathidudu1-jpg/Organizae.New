import type { ReactNode } from 'react';
import { ActivityIndicator, Text, type PressableProps } from 'react-native';

import { colors } from '@/theme/colors';

import { PressableScale } from './motion';

type Variant = 'primary' | 'outline' | 'ghost' | 'danger';
type Size = 'md' | 'sm';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  title: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  className?: string;
}

const container: Record<Variant, string> = {
  primary: 'bg-primary hover:brightness-110 hover:shadow-lg hover:shadow-primary/25',
  outline: 'bg-surface border border-border hover:bg-muted hover:shadow-md',
  ghost: 'bg-transparent hover:bg-muted',
  danger: 'bg-danger/10 border border-danger/30 hover:bg-danger/15',
};

const label: Record<Variant, string> = {
  primary: 'text-primary-foreground',
  outline: 'text-foreground',
  ghost: 'text-muted-foreground',
  danger: 'text-danger',
};

const sizes: Record<Size, { box: string; text: string }> = {
  md: { box: 'h-12 rounded-2xl px-6', text: 'text-sm' },
  sm: { box: 'h-10 rounded-full px-4', text: 'text-xs' },
};

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const spinnerColor = variant === 'primary' ? colors.primaryForeground : colors.primary;
  return (
    <PressableScale
      accessibilityRole="button"
      disabled={disabled || loading}
      scaleTo={0.97}
      className={`flex-row items-center justify-center gap-2 ${container[variant]} ${sizes[size].box} ${
        disabled ? 'opacity-50' : ''
      } ${className}`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} />
      ) : (
        <>
          {icon}
          <Text className={`font-semibold ${label[variant]} ${sizes[size].text}`}>{title}</Text>
        </>
      )}
    </PressableScale>
  );
}
