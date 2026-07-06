import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  TrendingDown,
  TrendingUp,
  Bell,
} from 'lucide-react';

export function Header() {
  return (
    <header className="hidden lg:flex items-center justify-between py-5 px-6">
      {/* Left: user + search */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold">
            M
          </div>
          <div className="leading-tight">
            <p className="text-lg font-bold text-foreground">Matheus</p>
            <p className="text-[11px] text-muted-foreground/40 font-medium">Bem-vindo de volta</p>
          </div>
        </div>

        <div className="relative ml-2">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40"
          />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-52 h-9 pl-10 pr-4 rounded-full bg-white/60 border-0 text-xs placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white/80 transition-all duration-300"
          />
        </div>
      </div>

      {/* Right: month selector + icon controls */}
      <div className="flex items-center gap-1">
        {/* Month selector */}
        <div className="flex items-center gap-1 mr-2 bg-white/60 rounded-full px-1 py-1">
          <button className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-white transition-colors">
            <ChevronLeft size={15} />
          </button>
          <span className="text-xs font-semibold text-foreground px-2 min-w-[90px] text-center">
            Julho 2026
          </span>
          <button className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-white transition-colors">
            <ChevronRight size={15} />
          </button>
        </div>

        <button className="h-8 w-8 rounded-full flex items-center justify-center text-primary bg-primary/10 transition-colors">
          <Eye size={14} />
        </button>
        <button className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground/40 hover:text-destructive hover:bg-destructive/[0.08] transition-colors">
          <TrendingDown size={14} />
        </button>
        <button className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground/40 hover:text-emerald-500 hover:bg-emerald-500/[0.08] transition-colors">
          <TrendingUp size={14} />
        </button>
        <button className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:bg-muted transition-colors relative">
          <Bell size={14} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
        </button>
      </div>
    </header>
  );
}
