import { Car, ShoppingBag, MoreVertical } from 'lucide-react';

const items = [
  { id: 1, description: 'Seguro Omoda 5', category: 'Transporte', date: '09 mar, 12:56', amount: '- R$ 596,00', icon: Car, color: 'bg-blue-500/10 text-blue-600', income: false },
  { id: 2, description: 'Pneus Omoda', category: 'Transporte', date: '04 mar, 19:34', amount: '- R$ 474,49', icon: Car, color: 'bg-blue-500/10 text-blue-600', income: false },
  { id: 3, description: 'Financiamento Omoda', category: 'Transporte', date: '03 mar, 16:00', amount: '- R$ 3.240,00', icon: Car, color: 'bg-blue-500/10 text-blue-600', income: false },
  { id: 4, description: 'IPhone Novo', category: 'Compras', date: '08 fev, 16:37', amount: '- R$ 987,72', icon: ShoppingBag, color: 'bg-pink-500/10 text-pink-600', income: false },
];

export function RecentTransactions() {
  return (
    <div className="space-y-1.5">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            className="flex items-center gap-2.5 px-3 py-2.5 sm:px-4 sm:py-3.5 rounded-2xl bg-card border border-border/40 transition-all duration-200 group cursor-default"
          >
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
              <Icon size={18} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[13px] sm:text-sm font-semibold text-foreground truncate">
                {item.description}
              </p>
              <p className="text-[11px] sm:text-xs text-muted-foreground/40 mt-0.5">{item.category}</p>
            </div>

            <span className="text-[11px] text-muted-foreground/40 flex-shrink-0 hidden sm:block tabular-nums">
              {item.date}
            </span>

            <div className={`text-[13px] sm:text-sm font-bold tabular-nums flex-shrink-0 ml-1 sm:ml-3 ${item.income ? 'text-emerald-600' : 'text-foreground'}`}>
              {item.amount}
            </div>

            <button className="p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-muted/20 transition-all flex-shrink-0 hidden sm:block">
              <MoreVertical size={14} className="text-muted-foreground/40" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
