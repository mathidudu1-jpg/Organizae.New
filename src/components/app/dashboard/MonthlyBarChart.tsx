import { createContext, useContext, useState } from 'react';

type Period = 'week' | 'month' | 'year';

const PeriodContext = createContext<{ period: Period; setPeriod: (p: Period) => void }>({
  period: 'month',
  setPeriod: () => {},
});

export function PeriodProvider({ children }: { children: React.ReactNode }) {
  const [period, setPeriod] = useState<Period>('month');
  return <PeriodContext.Provider value={{ period, setPeriod }}>{children}</PeriodContext.Provider>;
}

// Mock spending data per period (values in R$)
const DATA: Record<Period, { label: string; value: number; current?: boolean }[]> = {
  month: [
    { label: 'out', value: 1800 },
    { label: 'nov', value: 1300 },
    { label: 'dez', value: 2600 },
    { label: 'jan', value: 2200 },
    { label: 'fev', value: 7600 },
    { label: 'mar', value: 5900 },
    { label: 'abr', value: 3400 },
    { label: 'mai', value: 3000 },
    { label: 'jun', value: 900 },
    { label: 'jul', value: 1500, current: true },
  ],
  week: [
    { label: 'seg', value: 240 },
    { label: 'ter', value: 620 },
    { label: 'qua', value: 180 },
    { label: 'qui', value: 900 },
    { label: 'sex', value: 450 },
    { label: 'sáb', value: 300 },
    { label: 'dom', value: 120, current: true },
  ],
  year: [
    { label: '2021', value: 42000 },
    { label: '2022', value: 51000 },
    { label: '2023', value: 47000 },
    { label: '2024', value: 63000 },
    { label: '2025', value: 58000, current: true },
  ],
};

function formatScale(value: number): string {
  if (value === 0) return '0';
  if (value >= 1000) return `${Math.round(value / 1000)}k`;
  return String(value);
}

export function MonthlyBarChart() {
  const { period } = useContext(PeriodContext);
  const data = DATA[period];

  const max = Math.max(...data.map((d) => d.value), 1);
  const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
  const maxValue = Math.ceil(max / magnitude) * magnitude;
  const step = maxValue / 4;
  const yTicks = [maxValue, step * 3, step * 2, step, 0];

  return (
    <div className="pt-1">
      <div className="h-40 sm:h-52 flex">
        {/* Y axis */}
        <div className="flex flex-col justify-between pr-2 py-1 w-9 shrink-0">
          {yTicks.map((tick) => (
            <span key={tick} className="text-[10px] font-medium text-muted-foreground/35 text-right">
              {formatScale(tick)}
            </span>
          ))}
        </div>

        {/* Bars area */}
        <div className="flex-1 relative">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between py-1">
            {yTicks.map((tick) => (
              <div key={tick} className="border-t border-muted-foreground/[0.08]" />
            ))}
          </div>

          {/* Bars */}
          <div className="absolute inset-0 flex items-end justify-around gap-1 pt-4 pb-6">
            {data.map((d) => {
              const heightPct = (d.value / maxValue) * 100;
              return (
                <div key={d.label} className="flex-1 h-full flex flex-col items-center justify-end">
                  <div
                    className={`w-[18px] max-w-full rounded-t-[5px] transition-all duration-500 ${
                      d.current ? 'bg-foreground' : 'bg-muted-foreground/10'
                    }`}
                    style={{ height: `${heightPct}%` }}
                    title={`R$ ${d.value.toLocaleString('pt-BR')}`}
                  />
                </div>
              );
            })}
          </div>

          {/* X axis labels */}
          <div className="absolute bottom-0 inset-x-0 flex items-center justify-around gap-1">
            {data.map((d) => (
              <span
                key={d.label}
                className="flex-1 text-center text-[10px] font-medium text-muted-foreground/40"
              >
                {d.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PeriodToggle() {
  const { period, setPeriod } = useContext(PeriodContext);
  const options: { id: Period; label: string }[] = [
    { id: 'week', label: 'Semana' },
    { id: 'month', label: 'Mês' },
    { id: 'year', label: 'Ano' },
  ];
  return (
    <div className="flex items-center gap-0.5 bg-muted/20 rounded-full p-0.5">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => setPeriod(o.id)}
          className={`text-[11px] px-3 py-1 rounded-full font-medium transition-all duration-200 ${
            period === o.id
              ? 'bg-foreground text-background'
              : 'text-muted-foreground/40 hover:text-foreground'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
