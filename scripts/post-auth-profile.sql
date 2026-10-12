-- Ejecutar solo si el usuario Auth existía antes de las migraciones
insert into public.profiles (id, email, display_name)
select id, email, coalesce(raw_user_meta_data ->> 'display_name', 'Daniel Hernández')
from auth.users
where lower(email) = lower('danielhernandezhv3@gmail.com')
on conflict (id) do update set email = excluded.email;

insert into public.tax_settings (user_id)
select id from auth.users where lower(email) = lower('danielhernandezhv3@gmail.com')
on conflict (user_id) do nothing;
