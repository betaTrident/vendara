# Sari-Sari Store Pricelist And Customer Ledger System Implementation Plan

> **Source note:** This file reflects the current agreed scope: product pricelist tracking with `cost price`, `selling price`, `price history`, plus customer debt tracking using a running ledger per person with dated item and payment entries.

**Goal:** Build a simple, mobile-responsive, lightweight web app for managing a sari-sari store pricelist and customer utang records, including current product prices, price history, customer ledgers, itemized debt entries, payment history, and running balances.

**Architecture:** The app uses Astro for page structure and routing, React for interactive UI, `shadcn/ui` as the component library, and Tailwind CSS for styling. It runs fully serverless on Vercel with Neon Postgres storing product, price, customer, and ledger data.

**Tech Stack:** Astro, React, Tailwind CSS, shadcn/ui, Vercel Serverless Functions, Neon Postgres, GitHub, TypeScript

---

## 1. Project Summary

The system has three main parts:

1. `Administrator panel`
The store owner manages products, prices, customers, ledger entries, and payments.

2. `Public search page`
Customers can search for a product and view the current selling price instantly on desktop or mobile.

3. `Customer ledger section`
The store owner can open a person’s record and see one running ledger with:

- items taken
- dates when items were taken
- payments made
- running balance
- full history timeline

The system does not include:

- stock tracking
- category management
- inventory movement
- advanced authentication

---

## 2. Core Features

### Admin Features

- Add a product
- Edit a product
- Delete a product
- View all products
- Search products by name
- Update `cost price`
- Update `selling price`
- View price history per product
- Create a customer record
- Edit a customer record
- Delete a customer record
- Add a debt entry for a customer
- Add multiple products to one debt entry
- Edit a customer debt entry
- Delete a customer debt entry
- Record a customer payment
- Edit a payment record
- Delete a payment record
- View running balance per customer
- View customer ledger timeline/history
- Protect admin page with a simple password gate

### Public Features

- Search products by name
- Show matching products instantly
- Display current selling price clearly
- Show product name and last updated time
- Work smoothly on mobile devices

### Price Monitoring Features

- Store both current `cost price` and current `selling price`
- Record every product price change in a history table
- Keep old and new values for auditing
- Track when the price changed

### Customer Ledger Features

- One running ledger per customer
- Dated debt entries
- Dated payment entries
- Automatic total calculation per debt entry
- Automatic running balance calculation per customer
- Full history of changes over time

---

## 3. Recommended Tech Stack

### Frontend

- `Astro`
For routing, static-first performance, and lightweight delivery.

- `React`
For interactive search, CRUD forms, ledger screens, and history views.

- `Tailwind CSS`
For fast mobile-first styling.

- `shadcn/ui`
Recommended component library for this project.

Why this is the best fit:

- lightweight and compatible with Tailwind
- easy to shape into a clean custom admin UI
- better visual control than heavy all-in-one libraries
- strong primitives for forms, dialogs, drawers, tables, popovers, and sheets
- suits a practical mobile-first business tool

Recommended components from `shadcn/ui`:

- `Button`
- `Input`
- `Textarea`
- `Label`
- `Card`
- `Dialog`
- `Drawer`
- `Sheet`
- `Table`
- `Tabs`
- `Badge`
- `Select`
- `DropdownMenu`
- `AlertDialog`
- `Form`
- `Calendar` if date filtering is later added

### Backend

- `Vercel Serverless Functions`
Handles all CRUD and history API endpoints without a separate backend server.

### Database

- `Neon Postgres`
Free serverless PostgreSQL database.

### Tooling

- `TypeScript`
For safer API and UI code.

- `GitHub`
For source control and deployment integration.

---

## 4. Free Hosting Setup

| Service | Use | Cost |
| --- | --- | --- |
| Vercel | Frontend hosting + serverless API | Free |
| Neon | PostgreSQL database | Free |
| GitHub | Repository and deployment flow | Free |
| Vercel subdomain | Public URL | Free |

This setup stays fully serverless and zero-cost for a small internal/business app.

---

## 5. User Roles

### Store Owner

- Opens `/admin`
- Enters admin password
- Manages products and prices
- Reviews price changes over time
- Manages customers
- Adds debt entries and payments
- Reviews ledger history and balances

### Customer

- Opens `/`
- Searches for a product
- Views current selling price

---

## 6. Functional Requirements

### Product Data

Each product should support:

- product name
- current cost price
- current selling price
- optional note
- created date
- updated date

### Customer Data

Each customer should support:

- customer name
- optional note
- created date
- updated date

### CRUD Requirements

- Create new products
- Read and list all products
- Update existing products
- Delete products with confirmation
- Create new customers
- Read and list all customers
- Update existing customers
- Delete customers with confirmation

### Price History Requirements

- Every product price change should create a history record
- Store previous cost price
- Store new cost price
- Store previous selling price
- Store new selling price
- Store the timestamp of the change

### Customer Ledger Requirements

- A customer has one running ledger
- A ledger contains both debt entries and payment entries
- A debt entry can contain multiple products
- Each debt entry must store the date it was added
- Each payment entry must store the date it was added
- Each debt entry total is calculated from its line items
- Each customer balance is calculated from total debt minus total payments
- Ledger entries should be editable and deletable
- Ledger history must remain visible in timeline form

### Search Requirements

- Search products by name
- Search customers by name in admin
- Case-insensitive matching
- Fast response
- Friendly mobile display

### Security Requirements

- Admin route should not be publicly editable
- Use a simple password gate for admin access
- Store secrets in environment variables

---

## 7. Proposed Database Schema

This schema is focused on two business areas:

- product price tracking
- customer running ledger tracking

### Table: `products`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `name` | `varchar(150)` | Product name |
| `cost_price` | `numeric(10,2)` | Current cost price |
| `selling_price` | `numeric(10,2)` | Current selling price |
| `note` | `varchar(255)` | Optional |
| `is_active` | `boolean` | Default true |
| `created_at` | `timestamp` | Default current timestamp |
| `updated_at` | `timestamp` | Updated on edit |

### Table: `price_history`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `product_id` | `uuid` | Foreign key to `products.id` |
| `old_cost_price` | `numeric(10,2)` | Previous cost price |
| `new_cost_price` | `numeric(10,2)` | New cost price |
| `old_selling_price` | `numeric(10,2)` | Previous selling price |
| `new_selling_price` | `numeric(10,2)` | New selling price |
| `changed_at` | `timestamp` | When the price was changed |

### Table: `customers`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `name` | `varchar(150)` | Customer name |
| `note` | `varchar(255)` | Optional |
| `is_active` | `boolean` | Default true |
| `created_at` | `timestamp` | Default current timestamp |
| `updated_at` | `timestamp` | Updated on edit |

### Table: `ledger_entries`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `customer_id` | `uuid` | Foreign key to `customers.id` |
| `entry_type` | `varchar(20)` | `debt` or `payment` |
| `payment_amount` | `numeric(10,2)` | Used only for payment entries |
| `note` | `varchar(255)` | Optional |
| `entry_date` | `date` | Business date of the entry |
| `created_at` | `timestamp` | Default current timestamp |
| `updated_at` | `timestamp` | Updated on edit |

### Table: `ledger_entry_items`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `ledger_entry_id` | `uuid` | Foreign key to `ledger_entries.id` |
| `product_id` | `uuid` | Foreign key to `products.id` |
| `product_name_snapshot` | `varchar(150)` | Product name at the time of entry |
| `unit_cost_price_snapshot` | `numeric(10,2)` | Cost price at time of entry |
| `unit_selling_price_snapshot` | `numeric(10,2)` | Selling price at time of entry |
| `quantity` | `integer` | Quantity taken |
| `line_total` | `numeric(10,2)` | Quantity x selling snapshot |

### SQL Schema

```sql
create extension if not exists "pgcrypto";

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

create table if not exists ledger_entries (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  entry_type varchar(20) not null check (entry_type in ('debt', 'payment')),
  payment_amount numeric(10,2) check (payment_amount is null or payment_amount >= 0),
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
create index if not exists idx_products_is_active on products(is_active);
create index if not exists idx_price_history_product_id on price_history(product_id);
create index if not exists idx_customers_name on customers(name);
create index if not exists idx_ledger_entries_customer_id on ledger_entries(customer_id);
create index if not exists idx_ledger_entries_entry_date on ledger_entries(entry_date desc);
create index if not exists idx_ledger_entry_items_ledger_entry_id on ledger_entry_items(ledger_entry_id);
```

### Optional Triggers For `updated_at`

```sql
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

drop trigger if exists trg_ledger_entries_updated_at on ledger_entries;
create trigger trg_ledger_entries_updated_at
before update on ledger_entries
for each row
execute function set_updated_at();
```

### Data Rules

When a product is edited:

- if `cost_price` or `selling_price` changes
- insert one row into `price_history`
- then update the `products` row

When a customer debt entry is created:

- create one `ledger_entries` row with `entry_type = 'debt'`
- create one or more `ledger_entry_items` rows
- each item stores price snapshots at the time of the debt

When a customer payment entry is created:

- create one `ledger_entries` row with `entry_type = 'payment'`
- store the amount in `payment_amount`
- do not create `ledger_entry_items` rows

---

## 8. API Design

### Product Routes

#### `GET /api/products`

Returns the list of active products.

Supported query params:

- `search`
- `sort`

#### `POST /api/products`

Creates a new product.

Example body:

```json
{
  "name": "3 in 1 Coffee",
  "costPrice": 8.5,
  "sellingPrice": 12.5,
  "note": "intro price"
}
```

#### `PUT /api/products/:id`

Updates an existing product. If `costPrice` or `sellingPrice` changes, also inserts a `price_history` record.

#### `DELETE /api/products/:id`

Deletes a product.

#### `GET /api/products/:id/history`

Returns product price history ordered by newest first.

### Customer Routes

#### `GET /api/customers`

Returns the list of customers with running balance summary.

#### `POST /api/customers`

Creates a new customer.

#### `PUT /api/customers/:id`

Updates customer info.

#### `DELETE /api/customers/:id`

Deletes a customer.

#### `GET /api/customers/:id`

Returns one customer with current balance summary.

### Ledger Routes

#### `GET /api/customers/:id/ledger`

Returns the customer’s full running ledger timeline ordered by newest first or by business date.

#### `POST /api/customers/:id/ledger/debt`

Creates a debt entry with one or more product items.

Example body:

```json
{
  "entryDate": "2026-06-13",
  "note": "taken in the morning",
  "items": [
    {
      "productId": "uuid-1",
      "quantity": 2
    },
    {
      "productId": "uuid-2",
      "quantity": 1
    }
  ]
}
```

#### `POST /api/customers/:id/ledger/payment`

Creates a payment entry.

Example body:

```json
{
  "entryDate": "2026-06-13",
  "paymentAmount": 50,
  "note": "partial payment"
}
```

#### `PUT /api/ledger/:entryId`

Edits a debt or payment entry.

#### `DELETE /api/ledger/:entryId`

Deletes a debt or payment entry.

---

## 9. Suggested Project Structure

```txt
src/
  components/
    ui/
    AdminLoginForm.tsx
    ProductForm.tsx
    ProductTable.tsx
    ProductCard.tsx
    ProductSearch.tsx
    PriceHistoryTable.tsx
    CustomerForm.tsx
    CustomerTable.tsx
    CustomerLedger.tsx
    LedgerEntryForm.tsx
    LedgerTimeline.tsx
    PaymentForm.tsx
    SearchBar.tsx
  layouts/
    BaseLayout.astro
  lib/
    db.ts
    auth.ts
    products.ts
    price-history.ts
    customers.ts
    ledger.ts
    validation.ts
    balance.ts
  pages/
    index.astro
    admin.astro
    admin/
      customers.astro
      customers/
        [id].astro
    api/
      products.ts
      products/
        [id].ts
        [id]/
          history.ts
      customers.ts
      customers/
        [id].ts
        [id]/
          ledger.ts
          debt.ts
          payment.ts
      ledger/
        [entryId].ts
  styles/
    global.css

.env
astro.config.mjs
components.json
DESIGN.md
package.json
tailwind.config.mjs
tsconfig.json
vercel.json
```

---

## 10. UI Plan

### Public Search Page `/`

Sections:

- store title
- search input
- product results list

Card content:

- product name
- selling price
- optional note
- last updated time

### Admin Dashboard `/admin`

Sections:

- simple password form
- quick links to products and customers
- product price tracking area
- customer ledger area

### Product Management UI

- add/edit product form
- products table or cards
- per-product price history dialog, drawer, or sheet

### Customer Ledger UI

Recommended screen flow:

- customer list
- open one customer
- show header with customer name and current balance
- show actions:
  - add debt entry
  - add payment
  - edit customer
- show timeline below

### Ledger Timeline

Each timeline block should show:

- date
- entry type: `debt` or `payment`
- amount
- note
- line items if debt entry
- edit/delete actions
- recalculated running balance

### Mobile Behavior

- single-column layout on small screens
- use drawers/sheets instead of large modal-heavy layouts
- large tap targets
- readable tables with stacked card fallback

---

## 11. Validation Rules

- `name` is required for products and customers
- `costPrice` is required and must be `>= 0`
- `sellingPrice` is required and must be `>= 0`
- `entryDate` is required for ledger entries
- `paymentAmount` is required for payment entries and must be `> 0`
- debt entry must contain at least one item
- each item quantity must be `> 0`
- `note` is optional

Recommended library:

- `zod`

---

## 12. Environment Variables

```env
DATABASE_URL=your_neon_connection_string
ADMIN_PASSWORD=your_admin_password
```

Notes:

- `DATABASE_URL` connects the app to Neon
- `ADMIN_PASSWORD` protects admin actions
- Keep both only in Vercel and local `.env`

---

## 13. Deployment Flow

### Step 1. Create Repository

- Create GitHub repo
- Push Astro project

### Step 2. Create Neon Database

- Create free Neon project
- Copy connection string
- Run schema SQL

### Step 3. Deploy to Vercel

- Import GitHub repo into Vercel
- Add `DATABASE_URL`
- Add `ADMIN_PASSWORD`
- Deploy

### Step 4. Verify

- Open `/`
- Search products
- Open `/admin`
- Test product CRUD
- Test price history
- Test customer CRUD
- Test debt entry creation
- Test payment entry creation
- Test running balance

---

## 14. Implementation Phases

### Phase 1. Project Setup

- Create Astro project with React and Tailwind
- Install and configure `shadcn/ui`
- Configure TypeScript
- Create base layout

### Phase 2. Database Setup

- Create Neon database
- Add `products` schema
- Add `price_history` schema
- Add `customers` schema
- Add `ledger_entries` schema
- Add `ledger_entry_items` schema
- Test DB connection

### Phase 3. Product API Layer

- Build `GET /api/products`
- Build `POST /api/products`
- Build `PUT /api/products/:id`
- Build `DELETE /api/products/:id`
- Build `GET /api/products/:id/history`

### Phase 4. Customer And Ledger API Layer

- Build `GET /api/customers`
- Build `POST /api/customers`
- Build `PUT /api/customers/:id`
- Build `DELETE /api/customers/:id`
- Build `GET /api/customers/:id/ledger`
- Build `POST /api/customers/:id/ledger/debt`
- Build `POST /api/customers/:id/ledger/payment`
- Build `PUT /api/ledger/:entryId`
- Build `DELETE /api/ledger/:entryId`

### Phase 5. Admin UI

- Add password gate
- Add product CRUD screens
- Add product price history UI
- Add customer CRUD screens
- Add customer ledger timeline UI
- Add debt entry form
- Add payment form

### Phase 6. Public Search UI

- Build search bar
- Show filtered product results
- Make mobile responsive

### Phase 7. Deployment And QA

- Push to GitHub
- Connect to Vercel
- Add env vars
- Run final tests

---

## 15. Testing Checklist

### Functional Testing

- Can create a product
- Can edit a product
- Can delete a product
- Public search returns correct items
- Price history is created when prices change
- Price history is not created when only the note changes
- Can create a customer
- Can edit a customer
- Can delete a customer
- Can create a debt entry with multiple products
- Can create a payment entry
- Can edit a debt entry
- Can edit a payment entry
- Running balance updates correctly
- Ledger history orders correctly

### UI Testing

- Works on mobile width
- Works on desktop width
- Prices are readable
- Forms are easy to use
- Ledger timeline is readable on mobile
- Product and customer flows are clear

### Error Testing

- Empty product name should fail
- Empty customer name should fail
- Negative cost price should fail
- Negative selling price should fail
- Zero or negative quantity should fail
- Zero or negative payment should fail
- Wrong admin password should block access
- Invalid product ID should return an error
- Invalid customer ID should return an error

---

## 16. Performance Considerations

- Use Astro pages to keep JS small
- Use React only where needed
- Keep API responses small
- Add database indexes on searchable fields
- Load product history only when requested
- Load detailed ledger items only when opening a customer
- Avoid heavy UI libraries

This keeps the app lightweight and suitable for low-bandwidth users.

---

## 17. Risks And Practical Notes

- Free tiers are enough for small usage, but not for heavy traffic
- Simple password gate is okay for a basic internal tool, but not enterprise-grade security
- Ledger history will grow over time, but for a small store this remains manageable
- Product snapshots in ledger items are important so old debt records stay accurate even if the product price later changes
- If the store grows later, this can be extended with:
  - printable ledger reports
  - export to CSV
  - margin reporting
  - user authentication

---

## 18. Final Recommendation

Use:

- `Astro + React + Tailwind`
- `shadcn/ui`
- `Vercel`
- `Neon Postgres`

This is the best fit for:

- zero-cost deployment
- mobile responsiveness
- clean custom UX without heavy framework overhead
- simple product CRUD and price management
- fast public product search
- current and historical price tracking
- customer debt ledger tracking
- fully serverless setup

---

## 19. Short Build Order

1. Set up Astro + React + Tailwind
2. Add `shadcn/ui`
3. Create Neon database and tables
4. Add product and price history API routes
5. Add customer and ledger API routes
6. Build admin product screens
7. Build admin customer ledger screens
8. Build public search page
9. Deploy to Vercel
10. Test on mobile and desktop

---

## 20. Suggested First Version Scope

For the first version, build only:

- product CRUD
- current cost price and selling price
- automatic price history logging
- customer CRUD
- running ledger per customer
- debt entries with multiple products
- payment entries
- automatic balance calculation
- public product search
- simple admin password protection
- mobile responsive layout

Do not add yet:

- stock tracking
- categories
- full login/auth system
- analytics dashboard
- user accounts
- payments integration

That keeps the app focused and still realistic to finish.
