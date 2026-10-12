# Life Dashboard

Panel personal de Daniel Hernández para centralizar ingresos, beneficios netos, calendario de pagos, avisos desde correo e IA (Gemini).

## Requisitos

- Node.js 20+
- Cuenta Supabase (proyecto **life-dashboard** ya creado en Europa)
- Cuentas OAuth Google / Microsoft (Fase 4)

## Instalación

```bash
npm install
cp .env.example .env.local
# Rellena .env.local con tus claves (nunca las subas al repo)
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando        | Descripción              |
|----------------|--------------------------|
| `npm run dev`  | Servidor de desarrollo   |
| `npm run build`| Build de producción      |
| `npm run lint` | ESLint                   |
| `npm run typecheck` | TypeScript strict   |

## Supabase (migraciones)

El proyecto tiene **RLS automático** y **sin exposición automática de tablas nuevas**. Cada migración debe incluir `GRANT` explícitos y políticas RLS.

```bash
npx supabase login
npx supabase link --project-ref <TU_PROJECT_REF>
npx supabase db push
```

Las migraciones viven en `supabase/migrations/`. Tras el primer login se ejecuta `seed_default_income_sources` (5 negocios + recurrencia Mercat 1.200 €/mes).

Variables adicionales en `.env.local`:

- `ALLOWED_EMAIL` — único correo permitido (minúsculas).
- Contraseña del usuario creado en Supabase Auth con **TOTP 2FA** activado.

Registro público deshabilitado en Supabase; solo inicio de sesión del propietario.

## GitHub y Vercel

- **Repo:** https://github.com/danielhdz-ai/life-dashboard  
  (La cuenta `danielhdz4-ai` no existe en GitHub; el repo está en `danielhdz-ai`.)
- **Producción:** https://life-dashboard-seven-livid.vercel.app  
- Variables de entorno ya cargadas en Vercel (desde `.env.local`, nunca en git).
- Cron de correo: `0 8 * * *` (plan Hobby; en Pro se puede volver a cada 15 min).

Conectar Git en Vercel (si falla por permisos entre cuentas): en el dashboard de Vercel → Project → Git → conectar `danielhdz-ai/life-dashboard`.

## Primer arranque Supabase (una vez)

1. **Esquema:** en [SQL Editor](https://supabase.com/dashboard/project/tueitoafrrirfuhuxkxz/sql/new) pega y ejecuta `scripts/all-migrations.sql` (o `npx supabase link` + `supabase db push` con la contraseña de la base de datos).
2. **Bootstrap:** `npm run setup:bootstrap` (perfil + 5 fuentes + Mercat 1.200 €/mes).
3. **Login app:** credenciales generadas en `.setup/login-credentials.txt` (local, gitignored). Usuario Auth: `danielhernandezhv3@gmail.com`.

## Fases de desarrollo

- **Fase 0**: Next.js, diseño glass, layout, privacidad, paleta Ctrl+K
- **Fase 1** (en curso): migraciones Supabase, auth (lista blanca + 2FA), ingresos/gastos, recurrencia Mercat, home con KPIs y gráficas
- **Fase 2–5**: Calendario, IA, correos, impuestos, PWA, tests

## Diseño

Tokens CSS en `src/app/globals.css` y export JS en `src/lib/design-tokens.ts`. Componentes base en `src/components/glass/`.
