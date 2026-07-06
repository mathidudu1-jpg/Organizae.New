import { useMemo } from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const checks = useMemo(
    () => [
      { key: 'length', label: '8+ caracteres', passed: password.length >= 8 },
      { key: 'uppercase', label: 'Maiúscula', passed: /[A-Z]/.test(password) },
      { key: 'lowercase', label: 'Minúscula', passed: /[a-z]/.test(password) },
      { key: 'number', label: 'Número', passed: /[0-9]/.test(password) },
      { key: 'special', label: 'Especial (!@#)', passed: /[^A-Za-z0-9]/.test(password) },
    ],
    [password]
  );

  const passedCount = checks.filter((c) => c.passed).length;
  const strength = passedCount / checks.length;

  const getStrengthColor = () => {
    if (strength <= 0.2) return 'bg-red-500';
    if (strength <= 0.4) return 'bg-orange-500';
    if (strength <= 0.6) return 'bg-amber-500';
    if (strength <= 0.8) return 'bg-lime-500';
    return 'bg-emerald-500';
  };

  const getStrengthLabel = () => {
    if (strength <= 0.2) return 'Muito fraca';
    if (strength <= 0.4) return 'Fraca';
    if (strength <= 0.6) return 'Média';
    if (strength <= 0.8) return 'Forte';
    return 'Muito forte';
  };

  const getStrengthTextColor = () => {
    if (strength <= 0.2) return 'text-red-500';
    if (strength <= 0.4) return 'text-orange-500';
    if (strength <= 0.6) return 'text-amber-500';
    if (strength <= 0.8) return 'text-lime-600';
    return 'text-emerald-600';
  };

  if (!password) return null;

  return (
    <div className="space-y-2 mt-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full ${getStrengthColor()} rounded-full transition-all duration-300 ease-out`}
            style={{ width: `${strength * 100}%` }}
          />
        </div>
        <span
          className={`text-[10px] sm:text-xs font-medium ${getStrengthTextColor()} min-w-[50px] sm:min-w-[60px] text-right whitespace-nowrap`}
        >
          {getStrengthLabel()}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
        {checks.map((check) => (
          <div
            key={check.key}
            className={`flex items-center gap-1.5 text-[11px] sm:text-xs transition-colors ${
              check.passed ? 'text-emerald-600' : 'text-muted-foreground'
            }`}
          >
            {check.passed ? (
              <Check className="w-3 h-3 shrink-0" />
            ) : (
              <X className="w-3 h-3 opacity-50 shrink-0" />
            )}
            <span className="truncate">{check.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
