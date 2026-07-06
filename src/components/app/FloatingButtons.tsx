import { Phone, Sparkles } from 'lucide-react';

export function FloatingButtons() {
  return (
    <div className="fixed bottom-6 right-6 z-40 hidden lg:flex flex-col items-center gap-3">
      {/* WhatsApp / contact */}
      <button
        className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-105 active:scale-95 transition-transform"
        style={{ background: 'linear-gradient(135deg, #f472b6, #ec4899)' }}
        aria-label="Contato"
      >
        <Phone size={20} />
      </button>

      {/* AI orb (Iza) */}
      <button
        className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl relative overflow-hidden hover:scale-105 active:scale-95 transition-transform"
        style={{ background: 'linear-gradient(135deg, #34d399, #14b8a6, #06b6d4)' }}
        aria-label="Iza | Assistente IA"
      >
        <span className="absolute inset-0 animate-shimmer-bg" style={{
          background: 'linear-gradient(90deg, #34d399, #14b8a6, #06b6d4, #34d399)',
          backgroundSize: '300% 100%',
          opacity: 0.6,
        }} />
        <Sparkles size={22} className="relative z-10" />
      </button>
    </div>
  );
}
