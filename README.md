# Organizae

Assistente pessoal + financeiro ("resolvedor de vida") — Web + iOS + Android a partir de **um único código**.

## Stack

- **Expo** (SDK 57, RN 0.86, React 19) + **Expo Router** (navegação por arquivos)
- **NativeWind** (Tailwind no RN) + **React Native Web** (alvo web) — tema **Light** (inspirado no C6)
- **Reanimated** (motion nativo) · **Supabase** (auth + Postgres)

## Rodar local

```bash
npm install
cp .env.example .env   # preencha EXPO_PUBLIC_SUPABASE_*
npm run web            # web
npm run ios            # iOS (precisa de macOS ou Expo Go)
npm run android        # Android
```

> No Windows, rode pelo caminho limpo `C:\organizae-dev` (junction) para evitar problemas de caminho com acento.

## Estrutura

```
src/
  app/
    (app)/          # área logada: Home + Iza (tabs no mobile)
    (auth)/login    # login
    _layout.tsx     # raiz
  lib/supabase.ts   # cliente Supabase (AsyncStorage + url-polyfill)
assets/brand/       # logos, hero, favicons
```

Secrets (service_role, senha do DB) ficam em `.env.server.local` (gitignored) — nunca commitados.
