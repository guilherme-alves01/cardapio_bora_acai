create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  price numeric(10, 2) not null default 0,
  promotion_active boolean not null default false,
  promotion_price numeric(10, 2),
  image_url text default '',
  category text not null,
  featured boolean not null default false,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_products_updated_at on public.products;

create trigger set_products_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

create table if not exists public.store_settings (
  id text primary key,
  address text not null default '',
  opening_hours text not null default '',
  start_hour integer not null default 8,
  end_hour integer not null default 19,
  opening_days integer[] not null default '{1,2,3,4,5,6}',
  updated_at timestamptz not null default now()
);

alter table public.store_settings enable row level security;

create policy "Configurações podem ser lidas por todos"
on public.store_settings
for select
using (true);

create policy "Usuarios autenticados podem gerenciar configurações"
on public.store_settings
for all
to authenticated
using (true)
with check (true);

insert into public.store_settings (id, address, opening_hours, start_hour, end_hour, opening_days)
values ('main', 'Via Universitária, Simões Filho, BA', '08:00 - 19:00', 8, 19, '{1,2,3,4,5,6}')
on conflict (id) do nothing;

alter table public.products enable row level security;

drop policy if exists "Produtos ativos podem ser lidos por todos" on public.products;
drop policy if exists "Usuarios autenticados podem gerenciar produtos" on public.products;

create policy "Produtos ativos podem ser lidos por todos"
on public.products
for select
using (active = true);

create policy "Usuarios autenticados podem gerenciar produtos"
on public.products
for all
to authenticated
using (true)
with check (true);

alter table if exists public.products
  add column if not exists promotion_active boolean not null default false,
  add column if not exists promotion_price numeric(10, 2);

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Imagens de produtos podem ser lidas por todos" on storage.objects;
drop policy if exists "Usuarios autenticados podem enviar imagens de produtos" on storage.objects;
drop policy if exists "Usuarios autenticados podem atualizar imagens de produtos" on storage.objects;
drop policy if exists "Usuarios autenticados podem apagar imagens de produtos" on storage.objects;

create policy "Imagens de produtos podem ser lidas por todos"
on storage.objects
for select
using (bucket_id = 'product-images');

create policy "Usuarios autenticados podem enviar imagens de produtos"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'product-images');

create policy "Usuarios autenticados podem atualizar imagens de produtos"
on storage.objects
for update
to authenticated
using (bucket_id = 'product-images')
with check (bucket_id = 'product-images');

create policy "Usuarios autenticados podem apagar imagens de produtos"
on storage.objects
for delete
to authenticated
using (bucket_id = 'product-images');
