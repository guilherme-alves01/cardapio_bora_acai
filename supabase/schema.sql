create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  price numeric(10, 2) not null default 0,
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
