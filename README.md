# Organizae.New

Reconstrução do app Organizae.Space começando do zero.

## O que já existe

- **Página de login** (`/`) — clone visual autossuficiente da tela original: painel esquerdo com a mulher + gradiente verde esmeralda, e o lado branco com o formulário. Inclui as 3 abas (Entrar / Criar conta / Recuperar senha), validação básica no cliente e indicador de força de senha. Textos fixos em português (sem i18n) e handlers como stubs — a lógica real (Supabase) será reconstruída depois.
- **Assets** — imagens públicas em `/public` e `/src/assets` (logos, favicons, hero, logos de bancos).
- **`.env`** — chaves do Supabase e Brapi.

## Stack

Vite + React 18 + TypeScript + Tailwind CSS. Ícones via `lucide-react`.

## Estrutura

```
src/
  pages/LoginPage.tsx              # página de login (layout + 3 formulários)
  components/
    DesktopHeroPanel.tsx           # painel da mulher + gradiente verde (desktop)
    PasswordStrengthIndicator.tsx  # indicador de força de senha
    ui.tsx                         # Button e Input estilizados
  assets/                          # imagens do app
public/                            # favicons, logos, og-images
```

## Rodar local

```bash
npm install
npm run dev        # http://localhost:5173
```

## Build

```bash
npm run build
```
