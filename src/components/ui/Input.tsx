import type { ReactNode } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors } from '@/theme/colors';

interface InputProps extends TextInputProps {
  label?: string;
  icon?: ReactNode;
  right?: ReactNode;
  containerClassName?: string;
}

export function Input({
  label,
  icon,
  right,
  containerClassName = '',
  ...props
}: InputProps) {
  return (
    <View className={containerClassName}>
      {label ? (
        <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          {label}
        </Text>
      ) : null}
      <View className="flex-row items-center h-12 rounded-2xl bg-background border border-border px-4">
        {icon}
        <TextInput
          className={`flex-1 text-foreground text-sm ${icon ? 'ml-3' : ''}`}
          placeholderTextColor={colors.placeholder}
          {...props}
        />
        {right}
      </View>
    </View>
  );
}
