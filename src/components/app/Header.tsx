import {
  Search,
  ChevronDown,
  CalendarDays,
  Eye,
  TrendingDown,
  TrendingUp,
  Bell,
  Zap,
  Globe,
} from 'lucide-react';

export function Header() {
  return (
    <header className="hidden lg:flex items-center justify-between py-5 px-6">
      {/* Left: user menu + greeting + search */}
      <div className="flex items-center gap-4">
        {/* UserMenu */}
        <button className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-muted/40 transition-colors">
          <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm">
            M
          </div>
          <span className="text-sm font-semibold text-foreground">Matheus Kiciuv</span>
          <ChevronDown size={14} className="text-muted-foreground/50" />
        </button>

        <div>
          <h2 className="text-lg font-bold text-foreground leading-tight">Olá, Matheus</h2>
          <p className="text-[11px] text-muted-foreground/40 font-medium">Bem-vindo de volta</p>
        </div>

        {/* Search pill */}
        <div className="relative ml-2">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/30" />
          <input
            type="text"
            placeholder="Buscar lançamentos..."
            className="w-52 h-9 pl-10 pr-4 rounded-full bg-white/60 border-0 text-xs placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white/80 transition-all duration-300"
          />
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1">
        {/* Month selector (compact) */}
        <button className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-muted/20 transition-colors mr-1">
          <CalendarDays size={15} />
        </button>

        <button className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:bg-muted/20 transition-colors">
          <Eye size={14} />
        </button>
        <button className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground/40 hover:text-destructive hover:bg-destructive/[0.08] transition-colors">
          <TrendingDown size={14} />
        </button>
        <button className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground/40 hover:text-emerald-500 hover:bg-emerald-500/[0.08] transition-colors">
          <TrendingUp size={14} />
        </button>

        {/* Notifications */}
        <button className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:bg-muted/20 transition-colors relative">
          <Bell size={14} />
          <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
            4
          </span>
        </button>

        {/* Voice credits gauge */}
        <div className="flex items-center gap-1.5 ml-1 mr-1 h-8 px-2 rounded-full bg-muted/30">
          <Zap size={12} className="text-primary" />
          <div className="w-10 h-1.5 rounded-full bg-emerald-500/20 overflow-hidden">
            <div className="h-full w-full bg-emerald-500 rounded-full" />
          </div>
          <span className="text-[11px] font-semibold text-muted-foreground">∞</span>
        </div>

        {/* Currency */}
        <button className="h-8 px-2 rounded-full flex items-center gap-1 text-muted-foreground/60 hover:bg-muted/20 transition-colors">
          <span className="text-xs font-semibold">R$</span>
          <span className="text-[11px] text-muted-foreground/40">BRL</span>
        </button>

        {/* Language */}
        <button className="h-8 px-2 rounded-full flex items-center gap-1 text-muted-foreground/60 hover:bg-muted/20 transition-colors">
          <Globe size={13} />
          <span className="text-[11px] text-muted-foreground/40">BR</span>
        </button>
      </div>
    </header>
  );
}
