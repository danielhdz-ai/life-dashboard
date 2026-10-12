-- Life Dashboard — esquema inicial (RLS + GRANTs explícitos)

create extension if not exists "pgcrypto";

-- ─── Perfil ───
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

grant select, update on public.profiles to authenticated;

-- ─── Fuentes de ingreso ───
create type public.income_source_type as enum ('variable', 'fixed', 'recurrente');
create type public.capture_mode as enum ('manual', 'email', 'recurrente', 'stripe');

create table public.income_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  slug text not null,
  name text not null,
  source_type public.income_source_type not null default 'variable',
  color text not null default '#7c9cbf',
  icon text not null default 'circle',
  capture_mode public.capture_mode not null default 'manual',
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, slug)
);

alter table public.income_sources enable row level security;

create policy "income_sources_owner"
  on public.income_sources for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.income_sources to authenticated;

-- ─── Ingresos ───
create type public.income_status as enum ('pendiente', 'cobrado');
create type public.record_origin as enum ('manual', 'email', 'recurrente');

create table public.incomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  source_id uuid not null references public.income_sources (id) on delete restrict,
  amount_gross numeric(12, 2) not null,
  amount_net numeric(12, 2) not null,
  vat_amount numeric(12, 2),
  currency text not null default 'EUR',
  income_date date not null,
  status public.income_status not null default 'pendiente',
  concept text,
  client_name text,
  notes text,
  attachment_url text,
  origin public.record_origin not null default 'manual',
  email_message_id uuid,
  recurring_rule_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index incomes_user_date_idx on public.incomes (user_id, income_date desc);
create index incomes_source_idx on public.incomes (source_id);

alter table public.incomes enable row level security;

create policy "incomes_owner"
  on public.incomes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.incomes to authenticated;

-- ─── Gastos ───
create type public.expense_category as enum (
  'hosting', 'ia_apis', 'dominios', 'publicidad', 'software', 'otros'
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  source_id uuid references public.income_sources (id) on delete set null,
  amount numeric(12, 2) not null,
  expense_date date not null,
  category public.expense_category not null default 'otros',
  concept text,
  is_recurring boolean not null default false,
  recurring_rule_id uuid,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index expenses_user_date_idx on public.expenses (user_id, expense_date desc);

alter table public.expenses enable row level security;

create policy "expenses_owner"
  on public.expenses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.expenses to authenticated;

-- ─── Recurrencias ───
create type public.recurrence_kind as enum ('income', 'expense');

create table public.recurring_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind public.recurrence_kind not null,
  source_id uuid references public.income_sources (id) on delete cascade,
  amount_net numeric(12, 2) not null,
  amount_gross numeric(12, 2),
  vat_amount numeric(12, 2),
  day_of_month int not null default 1 check (day_of_month between 1 and 28),
  start_date date not null,
  end_date date,
  concept text,
  expense_category public.expense_category,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.recurring_rules enable row level security;

create policy "recurring_rules_owner"
  on public.recurring_rules for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.recurring_rules to authenticated;

alter table public.incomes
  add constraint incomes_recurring_rule_fkey
  foreign key (recurring_rule_id) references public.recurring_rules (id) on delete set null;

alter table public.expenses
  add constraint expenses_recurring_rule_fkey
  foreign key (recurring_rule_id) references public.recurring_rules (id) on delete set null;

-- ─── Objetivos ───
create type public.goal_period as enum ('monthly', 'yearly');

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  period public.goal_period not null,
  year int not null,
  month int check (month is null or (month between 1 and 12)),
  target_net numeric(12, 2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index goals_monthly_unique
  on public.goals (user_id, year, month)
  where period = 'monthly';

create unique index goals_yearly_unique
  on public.goals (user_id, year)
  where period = 'yearly';

alter table public.goals enable row level security;

create policy "goals_owner"
  on public.goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.goals to authenticated;

-- ─── Ajustes fiscales (Fase 5 UI; esquema ya) ───
create table public.tax_settings (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  vat_rate numeric(5, 2) not null default 21,
  irpf_withholding_rate numeric(5, 2) not null default 20,
  irpf_quarterly_rate numeric(5, 2) not null default 20,
  updated_at timestamptz not null default now()
);

alter table public.tax_settings enable row level security;

create policy "tax_settings_owner"
  on public.tax_settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.tax_settings to authenticated;

-- ─── Auditoría ───
create table public.audit_log (
  id bigserial primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  table_name text not null,
  record_id uuid not null,
  action text not null check (action in ('insert', 'update', 'delete')),
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_log enable row level security;

create policy "audit_log_select_own"
  on public.audit_log for select
  using (auth.uid() = user_id);

grant select on public.audit_log to authenticated;

create or replace function public.audit_trigger_fn()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.audit_log (user_id, table_name, record_id, action, new_data)
    values (new.user_id, tg_table_name, new.id, 'insert', to_jsonb(new));
    return new;
  elsif tg_op = 'UPDATE' then
    insert into public.audit_log (user_id, table_name, record_id, action, old_data, new_data)
    values (new.user_id, tg_table_name, new.id, 'update', to_jsonb(old), to_jsonb(new));
    return new;
  elsif tg_op = 'DELETE' then
    insert into public.audit_log (user_id, table_name, record_id, action, old_data)
    values (old.user_id, tg_table_name, old.id, 'delete', to_jsonb(old));
    return old;
  end if;
  return null;
end;
$$;

create trigger audit_incomes
  after insert or update or delete on public.incomes
  for each row execute function public.audit_trigger_fn();

create trigger audit_expenses
  after insert or update or delete on public.expenses
  for each row execute function public.audit_trigger_fn();

create trigger audit_income_sources
  after insert or update or delete on public.income_sources
  for each row execute function public.audit_trigger_fn();

-- ─── Perfil automático al registrarse ───
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  insert into public.tax_settings (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Secuencias
grant usage, select on all sequences in schema public to authenticated;



-- Seed de fuentes y recurrencia Mercat (ejecutar tras el primer login del propietario)

create or replace function public.seed_default_income_sources(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_mercat_id uuid;
begin
  if exists (select 1 from public.income_sources where user_id = p_user_id) then
    return;
  end if;

  insert into public.income_sources (user_id, slug, name, source_type, color, icon, capture_mode, sort_order)
  values
    (p_user_id, 'livendia', 'Livendia', 'variable', '#7c9cbf', 'building-2', 'email', 1),
    (p_user_id, 'nuevahabitat', 'NuevaHabitat', 'variable', '#b8909e', 'map-pin', 'manual', 2),
    (p_user_id, 'firmacert', 'FirmaCert', 'recurrente', '#7eb8a8', 'file-signature', 'email', 3),
    (p_user_id, 'mercat-immobiliari', 'Mercat Immobiliari', 'fixed', '#c4a87a', 'landmark', 'recurrente', 4),
    (p_user_id, 'inmonest', 'Inmonest', 'variable', '#9b8ec4', 'home', 'email', 5);

  select id into v_mercat_id
  from public.income_sources
  where user_id = p_user_id and slug = 'mercat-immobiliari';

  insert into public.recurring_rules (
    user_id, kind, source_id, amount_net, amount_gross, day_of_month, start_date, concept
  )
  values (
    p_user_id,
    'income',
    v_mercat_id,
    1200,
    1200,
    1,
    date_trunc('year', current_date)::date,
    'Mercat Immobiliari — ingreso fijo mensual'
  );
end;
$$;

revoke all on function public.seed_default_income_sources(uuid) from public;
grant execute on function public.seed_default_income_sources(uuid) to authenticated;



-- Correo (tokens solo servidor), avisos de pago y pipeline

create type public.email_provider as enum ('google', 'microsoft', 'imap');
create type public.alert_status as enum ('por_revisar', 'confirmado', 'descartado');
create type public.detected_payment_type as enum ('ingreso', 'gasto');

create table public.email_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  provider public.email_provider not null default 'google',
  email_address text not null,
  encrypted_tokens text not null,
  history_id text,
  last_sync_at timestamptz,
  sync_error text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, email_address)
);

alter table public.email_accounts enable row level security;
-- Sin políticas para authenticated: solo service_role (servidor)

create table public.email_messages_meta (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  account_id uuid not null references public.email_accounts (id) on delete cascade,
  external_id text not null,
  message_hash text not null,
  from_address text,
  subject text,
  snippet text,
  received_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (account_id, external_id)
);

alter table public.email_messages_meta enable row level security;

create policy "email_meta_owner"
  on public.email_messages_meta for select
  using (auth.uid() = user_id);

grant select on public.email_messages_meta to authenticated;

create table public.payment_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  message_id uuid references public.email_messages_meta (id) on delete set null,
  status public.alert_status not null default 'por_revisar',
  detected_type public.detected_payment_type not null,
  amount numeric(12, 2),
  currency text default 'EUR',
  payment_date date,
  due_date date,
  source_id uuid references public.income_sources (id) on delete set null,
  concept text,
  confidence numeric(5, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index payment_alerts_user_status_idx on public.payment_alerts (user_id, status);

alter table public.payment_alerts enable row level security;

create policy "payment_alerts_owner"
  on public.payment_alerts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.payment_alerts to authenticated;

alter table public.incomes
  add constraint incomes_email_message_fkey
  foreign key (email_message_id) references public.email_messages_meta (id) on delete set null;

create table public.pipeline_deals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  source_id uuid not null references public.income_sources (id) on delete restrict,
  title text not null,
  client_name text,
  expected_amount numeric(12, 2) not null,
  expected_date date not null,
  probability int not null default 50 check (probability between 0 and 100),
  status text not null default 'en_curso' check (status in ('en_curso', 'cobrado', 'perdido')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pipeline_deals enable row level security;

create policy "pipeline_deals_owner"
  on public.pipeline_deals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.pipeline_deals to authenticated;

create table public.detection_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  sender_pattern text,
  subject_keywords text[],
  source_id uuid references public.income_sources (id) on delete set null,
  auto_confirm boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.detection_rules enable row level security;

create policy "detection_rules_owner"
  on public.detection_rules for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.detection_rules to authenticated;

grant usage, select on all sequences in schema public to authenticated;



-- Ejecutar solo si el usuario Auth existía antes de las migraciones
insert into public.profiles (id, email, display_name)
select id, email, coalesce(raw_user_meta_data ->> 'display_name', 'Daniel Hernández')
from auth.users
where lower(email) = lower('danielhernandezhv3@gmail.com')
on conflict (id) do update set email = excluded.email;

insert into public.tax_settings (user_id)
select id from auth.users where lower(email) = lower('danielhernandezhv3@gmail.com')
on conflict (user_id) do nothing;



