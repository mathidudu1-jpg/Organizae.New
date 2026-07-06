import { useState } from 'react';
import {
  LayoutDashboard,
  Receipt,
  CalendarDays,
  Sparkles,
  Menu,
  X,
  Building2,
  Tags,
  BarChart3,
  TrendingUp,
  LayoutList,
  Target,
  History,
  Settings,
  Lock,
} from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  isPro?: boolean;
}

const bottomTabs: Tab[] = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'lancamentos', label: 'Lanç.', icon: Receipt },
  { id: 'calendario', label: 'Agenda', icon: CalendarDays, isPro: true },
  { id: 'assistente-ia', label: 'Iza', icon: Sparkles, isPro: true },
];

const menuCategories = [
  {
    label: 'Financeiro',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'lancamentos', label: 'Lançamentos', icon: Receipt },
      { id: 'bancos', label: 'Bancos', icon: Building2 },
      { id: 'pagamentos', label: 'Pagamentos', icon: Receipt },
      { id: 'categorias', label: 'Categorias', icon: Tags },
    ],
  },
  {
    label: 'Inteligência',
    items: [
      { id: 'assistente-ia', label: 'Iza | Assistente IA', icon: Sparkles, isPro: true },
      { id: 'analises', label: 'Análises', icon: BarChart3, isPro: true },
      { id: 'investimentos', label: 'Investimentos', icon: TrendingUp, isPro: true },
    ],
  },
  {
    label: 'Gestão',
    items: [
      { id: 'atividades', label: 'Atividades', icon: LayoutList, isPro: true },
      { id: 'metas', label: 'Metas', icon: Target, isPro: true },
      { id: 'historico', label: 'Histórico', icon: History },
    ],
  },
  {
    label: 'Sistema',
    items: [{ id: 'configuracoes', label: 'Configurações', icon: Settings }],
  },
];

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setOpen(false);
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden max-w-full">
        {/* Frosted glass background */}
        <div className="absolute inset-0 bg-card/90 backdrop-blur-xl border-t border-border/20" />

        {/* Content */}
        <div
          className="relative flex items-center justify-around w-full px-1"
          style={{
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            height: 'calc(60px + env(safe-area-inset-bottom, 0px))',
          }}
        >
          {bottomTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                aria-label={tab.label}
                className="relative flex items-center justify-center flex-1 h-full select-none min-w-0 group"
              >
                <span
                  className={`absolute inset-x-3 rounded-2xl transition-all duration-200 ease-out top-[10px] bottom-[10px] ${
                    isActive
                      ? 'bg-primary/[0.12] scale-100 opacity-100'
                      : 'bg-transparent scale-90 opacity-0 group-active:bg-muted/40 group-active:scale-100 group-active:opacity-100'
                  }`}
                />
                <Icon
                  size={20}
                  strokeWidth={isActive ? 1.8 : 1.4}
                  className={`relative transition-all duration-200 ease-out ${
                    isActive ? 'text-primary scale-105' : 'text-muted-foreground/50 scale-100'
                  }`}
                />
                <span
                  className={`absolute bottom-[8px] left-1/2 -translate-x-1/2 rounded-full bg-primary transition-all duration-200 ease-out ${
                    isActive ? 'w-1 h-1 opacity-100' : 'w-0 h-0 opacity-0'
                  }`}
                />
                {tab.isPro && (
                  <Lock
                    size={7}
                    className="absolute top-[9px] right-[calc(50%-14px)] text-purple-400/70"
                  />
                )}
              </button>
            );
          })}

          {/* Menu button */}
          <button
            onClick={() => setOpen(true)}
            aria-label="Mais opções"
            className="relative flex items-center justify-center flex-1 h-full select-none min-w-0 group"
          >
            <span className="absolute inset-x-3 rounded-2xl top-[10px] bottom-[10px] bg-transparent scale-90 opacity-0 group-active:bg-muted/40 group-active:scale-100 group-active:opacity-100 transition-all duration-200" />
            <Menu size={20} strokeWidth={1.4} className="relative text-muted-foreground/50" />
          </button>
        </div>
      </nav>

      {/* Bottom sheet menu */}
      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 h-[70vh] bg-card rounded-t-[28px] flex flex-col">
            {/* Handle + close */}
            <div className="relative flex items-center justify-end px-5 pt-3 pb-2 shrink-0">
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1.5 rounded-full bg-muted-foreground/20" />
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center mt-1 rounded-full bg-muted/60 active:bg-muted transition-colors"
                aria-label="Fechar menu"
              >
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>

            {/* Items */}
            <nav className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
              {menuCategories.map((category, catIdx) => (
                <div key={category.label}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/40 px-3 mb-2">
                    {category.label}
                  </p>
                  <div className="space-y-0.5">
                    {category.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleTabChange(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-[13px] font-medium min-h-[44px] ${
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'text-foreground active:bg-muted/80'
                          }`}
                        >
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${
                              isActive ? 'bg-primary-foreground/20' : 'bg-muted/60'
                            }`}
                          >
                            <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
                          </div>
                          <span className="flex-1 text-left">{item.label}</span>
                          {'isPro' in item && item.isPro && (
                            <Lock size={12} className="text-purple-400/70 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {catIdx < menuCategories.length - 1 && (
                    <div className="border-b border-border/10 mt-3" />
                  )}
                </div>
              ))}
            </nav>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-border/20 shrink-0">
              <p className="text-[11px] text-muted-foreground/40 text-center font-medium">
                Organizae v1.0
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
