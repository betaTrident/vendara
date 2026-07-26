import { CustomerSummary } from "@/components/app/customers/CustomerSummary";
import { Label } from "@/components/ui/label";
import type { Customer } from "@/lib/types";

interface CustomerPickerProps {
  customers: Customer[];
  selectedCustomerId: string;
  onSelect: (customerId: string) => void;
  id?: string;
}

export function CustomerPicker({
  customers,
  selectedCustomerId,
  onSelect,
  id = "transaction-customer",
}: CustomerPickerProps) {
  const selectedCustomer =
    customers.find((customer) => customer.id === selectedCustomerId) ?? null;

  return (
    <section className="space-y-4" aria-label="Customer selection">
      <div className="space-y-1.5">
        <Label htmlFor={id} className="text-xs font-semibold text-ink">
          Customer
        </Label>
        <select
          id={id}
          className="h-11 w-full rounded-md border border-hairline bg-card px-3 text-sm"
          value={selectedCustomerId}
          onChange={(event) => onSelect(event.target.value)}
          required
        >
          <option value="">Select a customer...</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name} — ₱{customer.balance.toFixed(2)} outstanding
            </option>
          ))}
        </select>
      </div>

      {selectedCustomer ? <CustomerSummary customer={selectedCustomer} /> : null}
    </section>
  );
}
