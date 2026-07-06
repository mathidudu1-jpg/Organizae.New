import { CalendarDays, Coffee } from 'lucide-react';

export function AppointmentsWidget() {
  return (
    <div className="rounded-2xl p-4 md:p-6 flex flex-col bg-card border border-border/40 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10">
            <CalendarDays size={18} className="text-primary" />
          </div>
          <h3 className="font-bold text-sm md:text-base text-foreground">Compromissos</h3>
        </div>
        <span className="text-xs tabular-nums rounded-full border border-border/60 px-2 py-0.5 text-muted-foreground">
          0
        </span>
      </div>

      {/* Empty state */}
      <div className="flex-1 flex flex-col items-center justify-center gap-2.5 py-8 bg-muted/20 rounded-2xl border border-dashed border-border/60">
        <Coffee size={28} className="text-muted-foreground/50" />
        <p className="text-sm font-medium text-muted-foreground/60">Agenda livre!</p>
      </div>
    </div>
  );
}
