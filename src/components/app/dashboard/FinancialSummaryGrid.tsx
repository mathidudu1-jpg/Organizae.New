import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

type Color = 'primary' | 'green' | 'red';

interface Card {
  label: string;
  value: string;
  icon: typeof Wallet;
  color: Color;
  progress: number;
  change?: number;
}

const colorMap: Record<Color, { icon: string; bar: string; barBg: string; text: string }> = {
  primary: {
    icon: 'bg-primary/10 text-primary',
    bar: 'bg-primary',
    barBg: 'bg-primary/10',
    text: 'text-foreground',
  },
  green: {
    icon: 'bg-emerald-500/10 text-emerald-600',
    bar: 'bg-emerald-500',
    barBg: 'bg-emerald-500/10',
    text: 'text-emerald-600',
  },
  red: {
    icon: 'bg-red-500/10 text-red-500',
    bar: 'bg-red-500',
    barBg: 'bg-red-500/10',
    text: 'text-red-500',
  },
};

const cards: Card[] = [
  { label: 'Saldo do Mês', value: '-R$ 6.914,26', icon: Wallet, color: 'primary', progress: 85, change: 7 },
  { label: 'Entradas', value: 'R$ 0,00', icon: TrendingUp, color: 'green', progress: 0 },
  { label: 'Despesas', value: 'R$ 6.914,26', icon: TrendingDown, color: 'red', progress: 85 },
];

function SummaryCard({ card }: { card: Card }) {
  const c = colorMap[card.color];
  const Icon = card.icon;
  return (
    <div className="p-4 rounded-2xl bg-card border border-border/40 transition-all duration-300 group cursor-default">
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-1.5 rounded-lg ${c.icon}`}>
          <Icon size={14} />
        </div>
        <span className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
          {card.label}
        </span>
        {card.change !== undefined && (
          <div
            className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ml-auto ${
              card.change >= 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-500'
            }`}
          >
            {card.change >= 0 ? <ArrowUpRight size={9} /> : <ArrowDownRight size={9} />}
            {Math.abs(card.change)}%
          </div>
        )}
      </div>

      <p className={`text-xl font-bold tabular-nums tracking-tight leading-none mb-3 ${c.text}`}>
        {card.value}
      </p>

      <div className={`h-[5px] rounded-full overflow-hidden ${c.barBg}`}>
        <div
          className={`h-full rounded-full transition-all duration-[1.2s] ease-out ${c.bar}`}
          style={{ width: `${card.progress}%` }}
        />
      </div>
    </div>
  );
}

export function FinancialSummaryGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {cards.map((card) => (
        <SummaryCard key={card.label} card={card} />
      ))}
    </div>
  );
}
