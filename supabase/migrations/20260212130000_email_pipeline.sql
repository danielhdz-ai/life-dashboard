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
