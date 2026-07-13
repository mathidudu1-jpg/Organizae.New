import { Wifi } from 'lucide-react-native';
import { Text, View } from 'react-native';

import type { Card } from '@/types/database';

interface CreditCardVisualProps {
  card: Card;
  /** Largura em px; altura segue a proporção de cartão físico em pé. */
  width?: number;
  dimmed?: boolean;
}

/** Proporção de cartão físico (54 × 85.6 mm) em pé. */
const RATIO = 85.6 / 54;

function luminance(hex: string): number {
  const h = hex.replace('#', '');
  if (h.length !== 6) return 0;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 / 255;
}

export function CreditCardVisual({ card, width = 180, dimmed = false }: CreditCardVisualProps) {
  const base = card.color ?? '#14181F';
  const light = luminance(base) > 0.6;
  const ink = light ? '#0B0F14' : '#FFFFFF';
  const inkSoft = light ? 'rgba(11,15,20,0.55)' : 'rgba(255,255,255,0.55)';

  return (
    <View
      className="rounded-3xl overflow-hidden"
      style={{
        width,
        height: Math.round(width * RATIO),
        backgroundColor: base,
        opacity: dimmed ? 0.55 : 1,
        // sombra sutil (web) — nativo herda elevação do container
        boxShadow: dimmed ? undefined : `0 16px 40px -16px ${base}99`,
      }}
    >
      {/* brilho superior */}
      <View
        className="absolute inset-x-0 top-0 h-1/3"
        style={{ backgroundColor: light ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.07)' }}
      />

      <View className="flex-1 p-5 justify-between">
        {/* chip + contactless */}
        <View className="flex-row items-center justify-between">
          <View
            className="w-9 h-7 rounded-md border"
            style={{ backgroundColor: '#D9B45B', borderColor: 'rgba(0,0,0,0.15)' }}
          >
            <View className="absolute top-1/2 left-0 right-0 h-px bg-black/20" />
            <View className="absolute left-1/2 top-0 bottom-0 w-px bg-black/20" />
          </View>
          <Wifi size={16} color={inkSoft} style={{ transform: [{ rotate: '90deg' }] }} />
        </View>

        {/* nome do cartão */}
        <View>
          <Text className="font-extrabold text-base tracking-wide" style={{ color: ink }}>
            {card.name}
          </Text>
          {card.brand ? (
            <Text className="text-[10px] uppercase tracking-[0.2em] mt-0.5" style={{ color: inkSoft }}>
              {card.brand}
            </Text>
          ) : null}
        </View>

        {/* final */}
        <View className="flex-row items-center justify-between">
          <Text className="text-xs tracking-[0.25em]" style={{ color: inkSoft }}>
            •••• {card.last4 ?? '····'}
          </Text>
          <Text className="text-[9px] uppercase tracking-[0.18em]" style={{ color: inkSoft }}>
            {card.kind === 'debit' ? 'débito' : 'crédito'}
          </Text>
        </View>
      </View>
    </View>
  );
}
