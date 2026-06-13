create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name varchar(150) not null,
  cost_price numeric(10,2) not null check (cost_price >= 0),
  selling_price numeric(10,2) not null check (selling_price >= 0),
  note varchar(255),
  is_active boolean not null default true,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);

create table if not exists price_history (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  old_cost_price numeric(10,2) not null check (old_cost_price >= 0),
  new_cost_price numeric(10,2) not null check (new_cost_price >= 0),
  old_selling_price numeric(10,2) not null check (old_selling_price >= 0),
  new_selling_price numeric(10,2) not null check (new_selling_price >= 0),
  changed_at timestamp not null default now()
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name varchar(150) not null,
  note varchar(255),
  is_active boolean not null default true,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);

create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  email varchar(320) not null unique,
  is_active boolean not null default true,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);

create table if not exists ledger_entries (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  entry_type varchar(20) not null check (entry_type in ('debt', 'payment')),
  payment_amount numeric(10,2) check (payment_amount is null or payment_amount >= 0),
  total_amount numeric(10,2) check (total_amount is null or total_amount >= 0),
  note varchar(255),
  entry_date date not null,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);

create table if not exists ledger_entry_items (
  id uuid primary key default gen_random_uuid(),
  ledger_entry_id uuid not null references ledger_entries(id) on delete cascade,
  product_id uuid not null references products(id),
  product_name_snapshot varchar(150) not null,
  unit_cost_price_snapshot numeric(10,2) not null check (unit_cost_price_snapshot >= 0),
  unit_selling_price_snapshot numeric(10,2) not null check (unit_selling_price_snapshot >= 0),
  quantity integer not null check (quantity > 0),
  line_total numeric(10,2) not null check (line_total >= 0)
);

create index if not exists idx_products_name on products(name);
create index if not exists idx_products_name_trgm on products using gin (name gin_trgm_ops);
create index if not exists idx_products_is_active on products(is_active);
create index if not exists idx_price_history_product_id on price_history(product_id);
create index if not exists idx_admin_users_email on admin_users(email);
create index if not exists idx_customers_name on customers(name);
create index if not exists idx_customers_name_trgm on customers using gin (name gin_trgm_ops);
create index if not exists idx_ledger_entries_customer_id on ledger_entries(customer_id);
create index if not exists idx_ledger_entries_entry_date on ledger_entries(entry_date desc);
create index if not exists idx_ledger_entry_items_ledger_entry_id on ledger_entry_items(ledger_entry_id);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_products_updated_at on products;
create trigger trg_products_updated_at
before update on products
for each row
execute function set_updated_at();

drop trigger if exists trg_customers_updated_at on customers;
create trigger trg_customers_updated_at
before update on customers
for each row
execute function set_updated_at();

drop trigger if exists trg_admin_users_updated_at on admin_users;
create trigger trg_admin_users_updated_at
before update on admin_users
for each row
execute function set_updated_at();

drop trigger if exists trg_ledger_entries_updated_at on ledger_entries;
create trigger trg_ledger_entries_updated_at
before update on ledger_entries
for each row
execute function set_updated_at();
