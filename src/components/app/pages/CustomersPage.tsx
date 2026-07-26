import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { CustomerCards } from "@/components/app/customers/CustomerCards";
import { DeleteCustomerDialog } from "@/components/app/customers/DeleteCustomerDialog";
import { CustomerFilters } from "@/components/app/customers/CustomerFilters";
import {
  CustomerFormPanel,
  emptyCustomerForm,
  type CustomerFormState,
} from "@/components/app/customers/CustomerFormPanel";
import { CustomerMetrics } from "@/components/app/customers/CustomerMetrics";
import { CustomerTable } from "@/components/app/customers/CustomerTable";
import { PageHeader } from "@/components/app/layout/PageHeader";
import { PageErrorState } from "@/components/app/states/PageErrorState";
import { Button } from "@/components/ui/button";
import { buildAdminHref } from "@/lib/admin/routes";
import { fetchAdminJson } from "@/lib/client/api";
import {
  DEFAULT_CUSTOMER_PAGE_SIZE,
  filterCustomers,
  summarizeCustomerDirectory,
  type CustomerBalanceFilter,
} from "@/lib/domain/customers";
import { paginateItems } from "@/lib/domain/pricing";
import type { Customer } from "@/lib/types";

interface CustomersPageProps {
  onNavigate: (href: string) => void;
  onStatsChange?: () => void;
  initialCustomerId?: string;
}

function useIsMobile(breakpointPx = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`);
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [breakpointPx]);

  return isMobile;
}

export function CustomersPage({
  onNavigate,
  onStatsChange,
  initialCustomerId,
}: CustomersPageProps) {
  const isMobile = useIsMobile();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [balanceFilter, setBalanceFilter] =
    useState<CustomerBalanceFilter>("all");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<CustomerFormState>(emptyCustomerForm);
  const [formOpen, setFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCustomers = async () => {
    setLoadError(null);
    try {
      const data = await fetchAdminJson<Customer[]>("/api/customers");
      setCustomers(data);
      onStatsChange?.();
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Unable to load customers.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCustomers();
  }, []);

  useEffect(() => {
    if (!initialCustomerId || customers.length === 0) {
      return;
    }

    const match = customers.find((customer) => customer.id === initialCustomerId);
    if (match) {
      setForm({
        id: match.id,
        name: match.name,
        note: match.note ?? "",
      });
      setFormOpen(true);
    }
  }, [initialCustomerId, customers]);

  const filtered = useMemo(
    () => filterCustomers(customers, { search, balanceFilter }),
    [customers, search, balanceFilter],
  );

  const paged = useMemo(
    () => paginateItems(filtered, page, DEFAULT_CUSTOMER_PAGE_SIZE),
    [filtered, page],
  );

  const summary = useMemo(
    () => summarizeCustomerDirectory(customers),
    [customers],
  );

  useEffect(() => {
    setPage(1);
  }, [search, balanceFilter]);

  const openCreate = () => {
    setForm(emptyCustomerForm);
    setFormOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setForm({
      id: customer.id,
      name: customer.name,
      note: customer.note ?? "",
    });
    setFormOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const payload = { name: form.name, note: form.note || null };

      if (form.id) {
        await fetchAdminJson(`/api/customers/${form.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await fetchAdminJson("/api/customers", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setForm(emptyCustomerForm);
      setFormOpen(false);
      await loadCustomers();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);
    try {
      await fetchAdminJson(`/api/customers/${deleteTarget.id}`, {
        method: "DELETE",
      });
      setDeleteTarget(null);
      await loadCustomers();
    } finally {
      setIsDeleting(false);
    }
  };

  const navigateToLedger = (customer: Customer) => {
    onNavigate(
      buildAdminHref({ name: "customer-ledger", customerId: customer.id }),
    );
  };

  const navigateToPurchase = (customer: Customer) => {
    onNavigate(
      buildAdminHref({
        name: "record-purchase",
        customerId: customer.id,
      }),
    );
  };

  const navigateToPayment = (customer: Customer) => {
    onNavigate(
      buildAdminHref({
        name: "record-payment",
        customerId: customer.id,
      }),
    );
  };

  const hasFilters = Boolean(search.trim()) || balanceFilter !== "all";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Manage customer accounts, outstanding balances, and ledger access."
        actions={
          <Button
            id="add-customer-btn"
            type="button"
            onClick={openCreate}
            className="h-11 px-4 rounded-md font-semibold text-xs"
          >
            <Plus className="size-3.5 mr-1.5" aria-hidden="true" />
            Add Customer
          </Button>
        }
      />

      <CustomerMetrics summary={summary} loading={loading} />

      <CustomerFilters
        search={search}
        balanceFilter={balanceFilter}
        onSearchChange={setSearch}
        onBalanceFilterChange={setBalanceFilter}
      />

      {loadError ? (
        <PageErrorState message={loadError} onRetry={() => void loadCustomers()} />
      ) : null}

      <CustomerTable
        customers={paged.items}
        totalCount={paged.total}
        hasFilters={hasFilters}
        search={search}
        page={paged.page}
        totalPages={paged.totalPages}
        onEdit={openEdit}
        onViewLedger={navigateToLedger}
        onRecordPurchase={navigateToPurchase}
        onRecordPayment={navigateToPayment}
        onDelete={setDeleteTarget}
        onAdd={openCreate}
        onClearFilters={() => {
          setSearch("");
          setBalanceFilter("all");
        }}
        onPageChange={setPage}
      />

      <CustomerCards
        customers={paged.items}
        totalCount={paged.total}
        hasFilters={hasFilters}
        search={search}
        page={paged.page}
        totalPages={paged.totalPages}
        onEdit={openEdit}
        onViewLedger={navigateToLedger}
        onRecordPurchase={navigateToPurchase}
        onRecordPayment={navigateToPayment}
        onDelete={setDeleteTarget}
        onAdd={openCreate}
        onClearFilters={() => {
          setSearch("");
          setBalanceFilter("all");
        }}
        onPageChange={setPage}
      />

      <CustomerFormPanel
        open={formOpen}
        form={form}
        isSaving={isSaving}
        isMobile={isMobile}
        onOpenChange={setFormOpen}
        onChange={setForm}
        onSubmit={handleSubmit}
      />

      <DeleteCustomerDialog
        open={Boolean(deleteTarget)}
        customerName={deleteTarget?.name ?? null}
        isDeleting={isDeleting}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        onConfirm={() => {
          void handleDeleteConfirm();
        }}
      />
    </div>
  );
}
