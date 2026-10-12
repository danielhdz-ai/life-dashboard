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
