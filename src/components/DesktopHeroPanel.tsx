import { Users, Star, Shield, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui';
import heroWoman from '@/assets/hero-woman.png';
import heroWomanWebp from '@/assets/hero-woman.webp';
import logoOrganizaeLarge from '@/assets/logo-organizae-large.png';

export default function DesktopHeroPanel() {
  return (
    <div className="hidden lg:flex lg:w-[60%] flex-col justify-center items-center p-12 text-white relative overflow-hidden">
      <div className="absolute inset-0">
        <picture>
          <source srcSet={heroWomanWebp} type="image/webp" />
          <img
            src={heroWoman}
            alt="Mulher feliz usando o Organizae"
            className="w-full h-full object-cover object-center"
            loading="eager"
            fetchPriority="high"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/85 via-emerald-900/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/30 via-transparent to-emerald-950/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(6,78,59,0.25)_100%)]" />
      </div>

      <div className="relative z-10 max-w-xl text-center">
        <div className="flex items-center justify-center relative animate-float">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 bg-white/20 rounded-full blur-2xl" />
          </div>
          <img
            src={logoOrganizaeLarge}
            alt="Organizae"
            className="h-16 w-auto object-contain relative z-10"
          />
        </div>

        <p
          className="text-3xl mb-1 text-white/95 font-light leading-tight mt-6"
          style={{ textShadow: '0 2px 15px rgba(0,0,0,0.2)' }}
        >
          Controle do mês.
        </p>
        <p
          className="text-3xl text-white font-bold leading-tight"
          style={{ textShadow: '0 2px 15px rgba(0,0,0,0.2)' }}
        >
          Clareza do dia.
        </p>

        <div className="mt-10">
          <Button
            className="relative gap-2.5 px-8 py-6 text-base font-semibold text-white border-0 rounded-full overflow-hidden group transition-transform hover:scale-[1.03] active:scale-[0.98]"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(10px)',
              boxShadow:
                '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.1)',
            }}
          >
            <span
              className="absolute inset-0 rounded-full p-[2px] overflow-hidden animate-shimmer-bg"
              style={{
                background: 'linear-gradient(90deg, #34d399, #14b8a6, #06b6d4, #34d399)',
                backgroundSize: '300% 100%',
              }}
            >
              <span className="absolute inset-[2px] rounded-full bg-emerald-950/80 backdrop-blur-sm" />
            </span>

            <span
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background:
                  'radial-gradient(circle at center, rgba(52,211,153,0.3) 0%, transparent 70%)',
              }}
            />

            <span
              className="absolute top-2 right-4 w-1 h-1 bg-white rounded-full animate-pulse"
              style={{ animationDelay: '0s' }}
            />
            <span
              className="absolute bottom-3 left-6 w-0.5 h-0.5 bg-emerald-300 rounded-full animate-pulse"
              style={{ animationDelay: '0.5s' }}
            />
            <span
              className="absolute top-4 left-8 w-0.5 h-0.5 bg-teal-300 rounded-full animate-pulse"
              style={{ animationDelay: '1s' }}
            />

            <ExternalLink className="w-4 h-4 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
            <span className="relative z-10">Saiba mais</span>
          </Button>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 z-20 px-8">
        <div className="flex items-center justify-center gap-8 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-emerald-600/15 backdrop-blur-sm flex items-center justify-center ring-1 ring-emerald-500/20">
              <Users className="h-3.5 w-3.5 text-emerald-400/90" />
            </div>
            <span className="font-bold text-sm text-white/95">1.5k+</span>
            <span className="text-sm text-emerald-300/60">usuários</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-amber-500/15 backdrop-blur-sm flex items-center justify-center ring-1 ring-amber-500/20">
              <Star className="h-3.5 w-3.5 fill-amber-400/90 text-amber-400/90" />
            </div>
            <span className="font-bold text-sm text-white/95">4.9</span>
            <span className="text-sm text-emerald-300/60">nota</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-emerald-600/15 backdrop-blur-sm flex items-center justify-center ring-1 ring-emerald-500/20">
              <Shield className="h-3.5 w-3.5 text-emerald-400/90" />
            </div>
            <span className="text-sm text-emerald-300/60">100% seguro</span>
          </div>
        </div>
      </div>
    </div>
  );
}
