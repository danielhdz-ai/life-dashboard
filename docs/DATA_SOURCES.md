# De dónde sale la data (Life Dashboard)

## Fuente de verdad: **Supabase**

Todo lo que ves (calendario, KPIs, gráficas) se calcula desde tablas en Postgres:

- `incomes` / `expenses` — movimientos confirmados
- `recurring_rules` — Mercat 1.200 €/mes y otros fijos
- `pipeline_deals` — cobros esperados (borde discontinuo en calendario)
- `payment_alerts` — detecciones desde correo **pendientes de confirmar**

No hay datos “inventados” en producción: si no hay filas, el dashboard muestra ceros o vacío.

## Gmail (varias cuentas)

**Cómo:** OAuth2 `gmail.readonly` → Ajustes → “Conectar otra cuenta Gmail”.

**Qué hace:** sincroniza metadatos (remitente, asunto, snippet), aplica **reglas** (`lib/payments/detect-rules.ts`) y crea **avisos**. Tú **confirmas** en `/avisos`; entonces se crea ingreso/gasto y aparece en el calendario **con logo**.

**Cron:** Vercel `GET /api/cron/sync-email` (diario en plan Hobby).

Tokens cifrados en `email_accounts` (solo servidor, `service_role`).

## Manual + recurrentes

- Alta en `/ingresos`
- Mercat y gastos fijos vía `recurring_rules` al cargar el dashboard

## Stripe (opcional, FirmaCert)

**No es la fuente principal hoy.** Previsto como lectura API detrás de `ENABLE_STRIPE_CONNECT=true` para conciliar pagos SaaS sin scrapear el dashboard de Stripe.

No sustituye Gmail ni la contabilidad manual.

## Lo que **no** hacemos

- **Scrapear** paneles web (Livendia, Vercel, etc.): frágil e ilegal en muchos casos.
- **Importar PDFs/contabilidad** automáticamente sin tu confirmación (salvo reglas explícitas).
- **Open Banking** — fase posterior (megaprompt fase 6).

## Gemini

Refina extracción desde correos (fase 4+) y asistente; la clave solo en servidor.

## Puesta en marcha mínima

1. Ejecutar SQL: `scripts/all-migrations.sql` (incluye correo + pipeline).
2. `npm run setup:bootstrap`
3. Configurar Google Cloud OAuth (Gmail) + variables en Vercel.
4. Conectar Gmails y sincronizar.
