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
    },
  },
  plugins: [],
};
