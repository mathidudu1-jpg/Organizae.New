import { FinancialSummaryGrid } from './dashboard/FinancialSummaryGrid';
import { MonthlyBarChart, PeriodToggle, PeriodProvider } from './dashboard/MonthlyBarChart';
import { RecentTransactions } from './dashboard/RecentTransactions';
import { BankCardsWidget } from './dashboard/BankCardsWidget';
import { AppointmentsWidget } from './dashboard/AppointmentsWidget';

export function Dashboard() {
  return (
    <div className="min-w-0 max-w-full w-full overflow-hidden pb-4 md:px-2">
      <div className="grid grid-cols-1 lg:grid-cols-[66fr_34fr] gap-6 mt-2">
        {/* ======== LEFT COLUMN ======== */}
        <div className="space-y-6 min-w-0">
          <PeriodProvider>
            {/* "Meus Gastos" + period toggle */}
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base text-foreground">Meus Gastos</h2>
              <PeriodToggle />
            </div>

            <FinancialSummaryGrid />

            <MonthlyBarChart />
          </PeriodProvider>

          <h3 className="font-bold text-base text-foreground">Lançamentos Recentes</h3>
          <RecentTransactions />
        </div>

        {/* ======== RIGHT COLUMN ======== */}
        <div className="min-w-0 flex flex-col gap-6">
          <BankCardsWidget />
          <AppointmentsWidget />
        </div>
      </div>
    </div>
  );
}
