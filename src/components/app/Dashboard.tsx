import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  TrendingUp,
  ShoppingBag,
  Car,
  Home,
  Utensils,
} from 'lucide-react';

const summaryCards = [
  {
    label: 'Saldo',
    value: 'R$ 8.240,50',
    change: '+12%',
    up: true,
    progress: 72,
    iconBg: 'bg-primary/10 text-primary',
    valueColor: 'text-primary',
    bar: 'bg-primary',
    icon: Wallet,
  },
  {
    label: 'Entradas',
    value: 'R$ 12.500,00',
    change: '+8%',
    up: true,
    progress: 85,
    iconBg: 'bg-emerald-500/10 text-emerald-600',
    valueColor: 'text-emerald-600',
    bar: 'bg-emerald-500',
    icon: ArrowUpRight,
  },
  {
    label: 'Saídas',
    value: 'R$ 4.259,50',
    change: '-3%',
    up: false,
    progress: 40,
    iconBg: 'bg-red-500/10 text-red-500',
    valueColor: 'text-red-500',
    bar: 'bg-red-500',
    icon: ArrowDownRight,
  },
  {
    label: 'Crédito',
    value: 'R$ 2.180,00',
    change: '+5%',
    up: true,
    progress: 55,
    iconBg: 'bg-violet-500/10 text-violet-600',
    valueColor: 'text-violet-600',
    bar: 'bg-violet-500',
    icon: CreditCard,
  },
];

const transactions = [
  { name: 'Supermercado Extra', cat: 'Alimentação', value: '- R$ 342,80', icon: Utensils, color: 'text-orange-500 bg-orange-500/10' },
  { name: 'Salário', cat: 'Renda', value: '+ R$ 6.500,00', icon: TrendingUp, color: 'text-emerald-500 bg-emerald-500/10' },
  { name: 'Posto Shell', cat: 'Transporte', value: '- R$ 210,00', icon: Car, color: 'text-blue-500 bg-blue-500/10' },
  { name: 'Aluguel', cat: 'Moradia', value: '- R$ 1.800,00', icon: Home, color: 'text-violet-500 bg-violet-500/10' },
  { name: 'Amazon', cat: 'Compras', value: '- R$ 156,90', icon: ShoppingBag, color: 'text-pink-500 bg-pink-500/10' },
];

function SummaryCard({ card }: { card: (typeof summaryCards)[number] }) {
  const Icon = card.icon;
  return (
    <div className="p-4 rounded-2xl bg-card transition-all duration-300 group">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-1.5 rounded-lg ${card.iconBg}`}>
          <Icon size={16} />
        </div>
        <span
          className={`text-[11px] font-semibold ${
            card.up ? 'text-emerald-600' : 'text-red-500'
          }`}
        >
          {card.change}
        </span>
      </div>
      <p className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider mb-1">
        {card.label}
      </p>
      <p className={`text-xl font-bold tabular-nums tracking-tight mb-3 ${card.valueColor}`}>
        {card.value}
      </p>
      <div className="h-[5px] rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${card.bar} transition-all duration-[1.2s]`}
          style={{ width: `${card.progress}%` }}
        />
      </div>
    </div>
  );
}

export function Dashboard() {
  return (
    <div className="space-y-5">
      {/* Balance card */}
      <div className="animated-gradient text-white rounded-2xl p-5 md:p-6 relative overflow-hidden shadow-lg border border-white/[0.08]">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-black/[0.08]" />
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/[0.04] rounded-full blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white/[0.03] rounded-full blur-2xl" />

        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/[0.12] backdrop-blur-sm">
                <Wallet size={16} className="text-white" />
              </div>
              <span className="text-white/60 text-[10px] font-semibold uppercase tracking-[0.18em]">
                Saldo Acumulado
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide bg-emerald-400/20 text-emerald-100 border border-emerald-400/25">
              +12% no mês
            </span>
          </div>

          <p className="text-white font-semibold text-[1.65rem] md:text-4xl tabular-nums tracking-tight">
            R$ 8.240,50
          </p>

          <div className="mt-4 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide bg-emerald-400/15 text-emerald-100 border border-emerald-300/15">
              No azul
            </span>
            <span className="text-white/50 text-xs">Atualizado hoje</span>
          </div>
        </div>
      </div>

      {/* Summary grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryCards.map((card) => (
          <SummaryCard key={card.label} card={card} />
        ))}
      </div>

      {/* Transactions */}
      <div className="rounded-2xl bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-foreground">Transações recentes</h2>
          <button className="text-xs font-semibold text-primary hover:underline">Ver todas</button>
        </div>
        <div className="space-y-1">
          {transactions.map((tx) => {
            const Icon = tx.icon;
            const isIncome = tx.value.startsWith('+');
            return (
              <div
                key={tx.name}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tx.color}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{tx.name}</p>
                  <p className="text-[11px] text-muted-foreground">{tx.cat}</p>
                </div>
                <span
                  className={`text-sm font-bold tabular-nums ${
                    isIncome ? 'text-emerald-600' : 'text-foreground'
                  }`}
                >
                  {tx.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
