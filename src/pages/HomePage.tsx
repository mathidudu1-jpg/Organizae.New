import { useState } from 'react';
import { Sidebar } from '@/components/app/Sidebar';
import { Header } from '@/components/app/Header';
import { MobileNav } from '@/components/app/MobileNav';
import { Dashboard } from '@/components/app/Dashboard';
import { FloatingButtons } from '@/components/app/FloatingButtons';

const TAB_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  lancamentos: 'Lançamentos',
  'assistente-ia': 'Iza | Assistente IA',
  atividades: 'Atividades',
  analises: 'Análises',
  bancos: 'Bancos',
  metas: 'Metas',
  investimentos: 'Investimentos',
  pagamentos: 'Pagamentos',
  categorias: 'Categorias',
  historico: 'Histórico',
  configuracoes: 'Configurações',
  calendario: 'Agenda',
};

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="h-[100dvh] w-full max-w-full overflow-hidden relative flex flex-col lg:p-8 bg-background">
      <div className="flex-1 flex flex-col lg:flex-row lg:gap-4 min-h-0">
        {/* Sidebar (desktop) */}
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content container */}
        <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-hidden bg-background lg:rounded-[28px] lg:shadow-[0_8px_40px_rgba(0,0,0,0.08)]">
          <Header />

          {/* Mobile header */}
          <div className="lg:hidden flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm">
                M
              </div>
              <div className="leading-tight">
                <p className="text-base font-bold text-foreground">Olá, Matheus</p>
                <p className="text-[11px] text-muted-foreground/50">Julho 2026</p>
              </div>
            </div>
          </div>

          {/* Main scroll area */}
          <main className="flex-1 min-h-0 overflow-y-auto px-5 lg:px-8 pb-24 lg:pb-8">
            {activeTab === 'dashboard' ? (
              <Dashboard />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-20">
                <p className="text-2xl font-bold text-foreground mb-2">{TAB_TITLES[activeTab]}</p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Seção em reconstrução — a estética do shell está pronta, o conteúdo será
                  desenvolvido nas próximas etapas.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile nav "ilha" */}
      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Floating action buttons */}
      <FloatingButtons />
    </div>
  );
}
