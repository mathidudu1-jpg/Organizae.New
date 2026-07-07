import { Pressable, Text, type PressableProps } from 'react-native';

interface ChipProps extends PressableProps {
  label: string;
  selected?: boolean;
  className?: string;
}

export function Chip({ label, selected = false, className = '', ...props }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={`px-4 h-10 rounded-full border items-center justify-center ${
        selected ? 'bg-accent border-primary' : 'bg-surface border-border'
      } ${className}`}
      {...props}
    >
      <Text className={`text-sm font-medium ${selected ? 'text-primary' : 'text-foreground'}`}>
        {label}
      </Text>
    </Pressable>
  );
}
