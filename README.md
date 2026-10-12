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

- Repositorio previsto: `danielhdz4-ai/life-dashboard`
- Importar el repo en Vercel y copiar las variables de `.env.example`
- Configurar `CRON_SECRET` y la ruta cron definida en `vercel.json` (Fase 4)

**No hacer push ni despliegue** hasta confirmación del propietario.

## Fases de desarrollo

- **Fase 0**: Next.js, diseño glass, layout, privacidad, paleta Ctrl+K
- **Fase 1** (en curso): migraciones Supabase, auth (lista blanca + 2FA), ingresos/gastos, recurrencia Mercat, home con KPIs y gráficas
- **Fase 2–5**: Calendario, IA, correos, impuestos, PWA, tests

## Diseño

Tokens CSS en `src/app/globals.css` y export JS en `src/lib/design-tokens.ts`. Componentes base en `src/components/glass/`.
