alter table ledger_entries
  add column if not exists voided_at timestamp,
  add column if not exists voided_by varchar(320),
  add column if not exists void_reason varchar(500);

alter table ledger_entries drop constraint if exists ledger_entries_debt_shape;
alter table ledger_entries
  add constraint ledger_entries_debt_shape check (
    entry_type <> 'debt'
    or (
      payment_amount is null
      and total_amount is not null
      and total_amount >= 0
    )
  );

alter table ledger_entries drop constraint if exists ledger_entries_payment_shape;
alter table ledger_entries
  add constraint ledger_entries_payment_shape check (
    entry_type <> 'payment'
    or (
      payment_amount is not null
      and payment_amount > 0
      and total_amount is null
    )
  );

create index if not exists idx_ledger_entries_customer_timeline
  on ledger_entries (customer_id, entry_date desc, created_at desc);

create index if not exists idx_ledger_entries_voided_at
  on ledger_entries (voided_at)
  where voided_at is not null;
