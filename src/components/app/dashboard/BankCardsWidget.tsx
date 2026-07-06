import {
  Building2,
  Plus,
  Wifi,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';

const BASE = '#1a1d24';

function RealisticCard() {
  return (
    <div
      className="relative overflow-hidden cursor-pointer group rounded-2xl"
      style={{
        background: `linear-gradient(145deg, #2b2f38 0%, ${BASE} 55%, #0d0f13 100%)`,
        boxShadow: `0 12px 40px -10px ${BASE}b0, 0 4px 12px -4px rgba(0,0,0,0.3)`,
        aspectRatio: '1.586 / 1',
      }}
    >
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

      <div className="relative z-10 h-full flex flex-col justify-between p-4 sm:p-5">
        {/* Top dots */}
        <div className="flex justify-end items-start">
          <div className="flex flex-col gap-[3px] opacity-30">
            <div className="w-1 h-1 rounded-full bg-white" />
            <div className="w-1 h-1 rounded-full bg-white" />
            <div className="w-1 h-1 rounded-full bg-white" />
          </div>
        </div>

        {/* Chip + contactless */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-8 rounded-md relative overflow-hidden border border-black/5 shadow-md">
            <div className="absolute inset-0 bg-gradient-to-br from-[#f7e6b7] via-[#d4a84b] to-[#c49a3a] opacity-90" />
            <div className="absolute inset-[2px] rounded-sm border-[0.3px] border-black/10" />
            <div className="absolute top-1/2 left-0 right-0 h-[0.5px] bg-black/15" />
            <div className="absolute left-1/2 top-0 bottom-0 w-[0.5px] bg-black/15" />
          </div>
          <Wifi size={18} className="rotate-90 opacity-40 text-white" />
        </div>

        {/* Card number */}
        <p className="font-mono tracking-[0.18em] text-sm sm:text-base text-white drop-shadow-sm">
          **** ***** **** ****
        </p>

        {/* Bottom: valid thru + holder */}
        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="uppercase font-semibold tracking-[0.15em] opacity-40 leading-none mb-1 text-[9px] text-white">
              VALID THRU
            </span>
            <span className="font-bold tracking-wider text-xs text-white">12/28</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="uppercase font-semibold tracking-[0.15em] opacity-40 leading-none mb-1 text-[9px] text-white">
              CARD HOLDER
            </span>
            <span className="font-bold tracking-wider uppercase text-xs text-white">C6 BANK</span>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-1.5"
        style={{ background: 'linear-gradient(90deg, #0d0f13, #3a3f4a)' }}
      />
    </div>
  );
}

function Stat({ label, value, danger, barWidth, barDanger }: { label: string; value: string; danger?: boolean; barWidth: string; barDanger?: boolean }) {
  return (
    <div className="flex-1 rounded-xl px-3 py-2.5 border border-border/30 bg-card">
      <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest block leading-none mb-1">
        {label}
      </span>
      <span className={`text-xs font-bold tabular-nums leading-none block mb-1.5 ${danger ? 'text-destructive' : 'text-foreground'}`}>
        {value}
      </span>
      <div className={`h-1 rounded-full w-full ${barDanger ? 'bg-destructive/15' : 'bg-primary/15'}`}>
        <div className={`h-full rounded-full ${barDanger ? 'bg-destructive/40' : 'bg-primary/50'}`} style={{ width: barWidth }} />
      </div>
    </div>
  );
}

const recentes = [
  { id: 1, name: 'Force One - Gym', date: '08 dez', amount: '- R$ 159,90' },
  { id: 2, name: 'MBL Valete Plus', date: '08 nov', amount: '- R$ 149,90' },
];

export function BankCardsWidget() {
  return (
    <div className="rounded-2xl p-5 bg-card border border-border/40 transition-all duration-300 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10">
            <Building2 size={16} className="text-primary" />
          </div>
          <h3 className="font-bold text-sm">Meus Bancos</h3>
        </div>
        <button className="p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 active:scale-95 transition-all">
          <Plus size={12} />
        </button>
      </div>

      {/* Card display */}
      <div className="flex items-center justify-center mb-3">
        <button className="p-1.5 rounded-full hover:bg-muted/50 text-muted-foreground/50 hover:text-muted-foreground transition-all mr-2 flex-shrink-0">
          <ChevronLeft size={16} />
        </button>
        <div className="flex-1 max-w-[280px] mx-auto">
          <RealisticCard />
        </div>
        <button className="p-1.5 rounded-full hover:bg-muted/50 text-muted-foreground/50 hover:text-muted-foreground transition-all ml-2 flex-shrink-0">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mb-4">
        <span className="w-[9px] h-[6px] rounded-full bg-primary/80" />
        <span className="w-[6px] h-[6px] rounded-full bg-muted-foreground/25" />
        <span className="w-[6px] h-[6px] rounded-full bg-muted-foreground/25" />
        <span className="w-[6px] h-[6px] rounded-full bg-muted-foreground/25" />
      </div>

      {/* Bank name */}
      <div className="flex items-center gap-2.5 px-1 mb-3.5">
        <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm flex items-center justify-center flex-shrink-0 ring-1 ring-border/30 bg-[#1a1d24]">
          <span className="text-white font-bold text-xs">C6</span>
        </div>
        <span className="text-sm font-bold text-foreground truncate">C6 Bank</span>
      </div>

      {/* Stats */}
      <div className="flex gap-2 mb-3.5">
        <Stat label="Saldo" value="R$ 2.214,32" barWidth="60%" />
        <Stat label="Limite" value="R$ 6.050,70" barWidth="85%" />
        <Stat label="Fatura" value="R$ 949,30" danger barDanger barWidth="16%" />
      </div>

      {/* Recentes */}
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest px-1">
          Recentes
        </span>
        {recentes.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/20 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-destructive/10">
                <ArrowUpRight size={13} className="text-destructive" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{tx.name}</p>
                <p className="text-[10px] text-muted-foreground">{tx.date}</p>
              </div>
            </div>
            <span className="text-xs font-bold tabular-nums flex-shrink-0 ml-2 text-foreground">
              {tx.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
