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
