import { View, type ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  className?: string;
}

export function Card({ className = '', ...props }: CardProps) {
  return <View className={`rounded-3xl bg-surface border border-border ${className}`} {...props} />;
}
