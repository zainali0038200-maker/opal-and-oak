create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(10,2) not null default 0,
  category text,
  image_url text,
  description text,
  sizes text[] default '{}',
  colors text[] default '{}',
  stock integer default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text,
  customer_email text,
  phone text,
  address text,
  payment_method text,
  status text default 'pending',
  total numeric(10,2) default 0,
  items jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

alter table public.products enable row level security;
alter table public.orders enable row level security;

create policy "Public can read active products" on public.products for select using (is_active = true);
create policy "Authenticated admins can manage products" on public.products for all to authenticated using (true) with check (true);
create policy "Public can create orders" on public.orders for insert to anon, authenticated with check (true);
create policy "Authenticated admins can manage orders" on public.orders for all to authenticated using (true) with check (true);
