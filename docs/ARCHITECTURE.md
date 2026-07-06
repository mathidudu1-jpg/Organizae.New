# Arquitetura — Organizae

Feito para escalar: muita feature, muito código, com convenções previsíveis.

## Camadas

```
src/
  app/                # Expo Router — SÓ rotas. Cada arquivo é fino: monta a tela
                      #   e delega para components/features. Nada de lógica de dados aqui.
  features/<domínio>/ # o coração. Cada domínio é isolado e auto-contido:
    api/              #   funções de acesso a dados (Supabase). Sem React aqui.
    hooks/            #   React Query hooks (useX / useCreateX...). A interface das telas.
    components/       #   UI específica do domínio.
    keys.ts           #   query keys centralizadas.
    types.ts          #   tipos do domínio (quando precisar além do database.ts).
  components/ui/      # design system compartilhado (Button, Input, Card...).
  lib/                # cross-cutting: supabase, query-client, format (moeda/data).
  providers/          # AppProviders (QueryClient + Auth + SafeArea).
  theme/              # tokens (via tailwind.config / NativeWind).
  types/database.ts   # tipos do banco (espelham as migrations).
```

## Regras de ouro

1. **Rotas finas.** `app/**` só liga rota → tela. Lógica mora em `features/`.
2. **Fluxo de dados sempre:** `api/` (Supabase puro) → `hooks/` (React Query) → tela.
   Telas nunca chamam o Supabase direto.
3. **Query keys** só em `features/<x>/keys.ts`. Invalidação usa a chave, nunca string solta.
4. **Tipos** vêm de `src/types/database.ts` (espelha o schema). Regerar quando o schema mudar.
5. **Datas** são `YYYY-MM-DD` (string), batendo com as colunas `date`. Usar helpers de `lib/format`.
6. **Novo domínio?** Copie a estrutura de `features/finance` (keys → api → hooks).

## Banco (Supabase)

- Migrations versionadas em `supabase/migrations/`. Aplicar com
  `supabase db push --db-url <conn>` (conn usa a senha do DB de `.env.server.local`).
- **RLS** em toda tabela: `user_id = auth.uid()`. `user_id` tem `default auth.uid()`,
  então inserts não enviam `user_id`.
- **Saldo nunca é armazenado** — sempre derivado de `initial_balance + transações`.
- **`transactions.month_ref`** é coluna gerada (`date_trunc('month', date)`) → uma
  convenção única de mês, sem divergência.
- Signup dispara `handle_new_user()` → cria profile + categorias-padrão.

## Estado

- **Servidor** (dados do Supabase): React Query. Cache + invalidação + base pro offline.
- **Sessão/auth**: `features/auth/AuthProvider` (`useAuth()`).
- **UI local**: `useState` na tela; se crescer, Zustand por feature.
