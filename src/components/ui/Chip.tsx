import { Text, type PressableProps } from 'react-native';

import { PressableScale } from './motion';

interface ChipProps extends PressableProps {
  label: string;
  selected?: boolean;
  className?: string;
}

export function Chip({ label, selected = false, className = '', ...props }: ChipProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      scaleTo={0.95}
      className={`px-4 h-10 rounded-full border items-center justify-center ${
        selected
          ? 'bg-accent border-primary shadow-sm shadow-primary/20'
          : 'bg-surface border-border hover:border-primary/40 hover:bg-accent/50'
      } ${className}`}
      {...props}
    >
      <Text className={`text-sm font-medium ${selected ? 'text-primary' : 'text-foreground'}`}>
        {label}
      </Text>
    </PressableScale>
  );
}
