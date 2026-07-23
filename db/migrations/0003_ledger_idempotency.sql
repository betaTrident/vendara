alter table ledger_entries
  add column if not exists idempotency_key uuid;

create unique index if not exists idx_ledger_entries_idempotency_key
  on ledger_entries (idempotency_key)
  where idempotency_key is not null;
