import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';

import { colors } from '@/theme/colors';

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
  primary: 'bg-primary active:opacity-90',
  outline: 'bg-surface border border-border active:bg-muted',
  ghost: 'bg-transparent active:bg-muted',
  danger: 'bg-danger/10 border border-danger/30 active:opacity-80',
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
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
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
    </Pressable>
  );
}
