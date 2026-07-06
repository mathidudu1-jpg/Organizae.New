import {
  LayoutDashboard,
  Receipt,
  Sparkles,
  LayoutList,
  BarChart3,
  Building2,
  Target,
  TrendingUp,
  Clock,
  Tags,
  History,
  Settings,
  Download,
  Lock,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  isPro?: boolean;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'lancamentos', label: 'Lançamentos', icon: Receipt },
  { id: 'assistente-ia', label: 'Iza | Assistente IA', icon: Sparkles, isPro: true },
  { id: 'atividades', label: 'Atividades', icon: LayoutList, isPro: true },
  { id: 'analises', label: 'Análises', icon: BarChart3, isPro: true },
  { id: 'bancos', label: 'Bancos', icon: Building2 },
  { id: 'metas', label: 'Metas', icon: Target, isPro: true },
  { id: 'investimentos', label: 'Investimentos', icon: TrendingUp, isPro: true },
  { id: 'pagamentos', label: 'Pagamentos', icon: Clock },
  { id: 'categorias', label: 'Categorias', icon: Tags },
  { id: 'historico', label: 'Histórico', icon: History },
  { id: 'configuracoes', label: 'Configurações', icon: Settings },
];

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside
      className="hidden lg:flex w-[140px] h-full flex-col items-center overflow-hidden rounded-[24px] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.15)]"
      style={{ backgroundColor: 'hsl(var(--sidebar-bg))' }}
    >
      {/* Vertical logo */}
      <div className="pt-8 pb-4">
        <div
          className="text-[14px] font-extrabold uppercase tracking-[0.25em] select-none"
          style={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            color: 'rgba(255,255,255,0.85)',
          }}
        >
          Organiz
          <span
            className="text-primary"
            style={{ textShadow: '0 0 12px hsl(var(--primary) / 0.4)' }}
          >
            ae
          </span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col items-center justify-center gap-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              title={item.label}
              className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 relative hover:scale-110 active:scale-90 ${
                isActive
                  ? 'bg-white shadow-[0_2px_12px_rgba(255,255,255,0.15)]'
                  : 'text-white/70 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <Icon
                size={20}
                className={isActive ? 'text-primary' : ''}
                style={isActive ? undefined : { color: 'rgba(255,255,255,0.7)' }}
              />
              {item.isPro && (
                <Lock size={8} className="absolute top-1.5 right-1.5 text-amber-300/60" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Install button */}
      <div className="pb-2">
        <button className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/15 transition-colors animate-float">
          <Download size={18} className="text-white/80" />
        </button>
      </div>

      {/* Version */}
      <div className="pb-2">
        <span className="text-[8px] text-white/20">v1.0</span>
      </div>
    </aside>
  );
}
