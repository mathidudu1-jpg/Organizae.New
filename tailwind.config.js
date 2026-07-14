/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // C6-inspired, LIGHT theme only
        background: '#F6F7F9', // fundo geral (cinza-gelo)
        surface: '#FFFFFF', // cards
        foreground: '#0B0F14', // texto principal
        muted: '#EEF0F3', // fundos sutis / trilhas
        'muted-foreground': '#6B7280', // texto secundário
        border: '#E7E9EC',
        primary: {
          DEFAULT: '#0B8A63', // teal Organizae
          foreground: '#FFFFFF',
        },
        accent: '#E9F6F0', // realce suave teal
        success: '#12805C',
        danger: '#E5484D',
        warning: '#E6A200',
      },
      borderRadius: {
        card: '20px',
        pill: '999px',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        // Regra geral de motion do app (entradas suaves estilo Apple)
        screen: 'fade-up 320ms cubic-bezier(0.22, 1, 0.36, 1) both',
        item: 'fade-up 380ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'scale-in': 'scale-in 260ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 240ms ease-out both',
      },
    },
  },
  plugins: [],
};
