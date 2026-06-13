import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { fetchAdminJson, fetchJson } from "@/lib/client/api";
import type { Customer, Product } from "@/lib/types";

import { CustomerLedgerPanel } from "./CustomerLedgerPanel";

const emptyCustomerForm = {
  id: "",
  name: "",
  note: "",
};

export const CustomerManager = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [form, setForm] = useState(emptyCustomerForm);

  const loadCustomers = async () => {
    setCustomers(await fetchAdminJson<Customer[]>("/api/customers"));
  };

  useEffect(() => {
    void loadCustomers();
    void fetchJson<Product[]>("/api/products").then(setProducts);
  }, []);

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === selectedCustomerId) ?? null,
    [customers, selectedCustomerId],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      name: form.name,
      note: form.note || null,
    };

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
    await loadCustomers();
  };

  const handleDelete = async (customerId: string) => {
    await fetchAdminJson(`/api/customers/${customerId}`, {
      method: "DELETE",
    });

    if (selectedCustomerId === customerId) {
      setSelectedCustomerId("");
    }

    await loadCustomers();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-6">
        <Card className="rounded-[1.5rem] border-border/70">
          <CardHeader>
            <CardTitle>{form.id ? "Edit customer" : "Add customer"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Customer name"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
              />
              <Textarea
                placeholder="Optional note"
                value={form.note}
                onChange={(event) =>
                  setForm((current) => ({ ...current, note: event.target.value }))
                }
              />
              <div className="flex gap-3">
                <Button type="submit">
                  {form.id ? "Update customer" : "Create customer"}
                </Button>
                {form.id ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setForm(emptyCustomerForm)}
                  >
                    Cancel
                  </Button>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-[1.5rem] border-border/70">
          <CardHeader>
            <CardTitle>Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="font-medium">{customer.name}</div>
                      {customer.note ? (
                        <div className="text-xs text-muted-foreground">
                          {customer.note}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell>₱{customer.balance.toFixed(2)}</TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedCustomerId(customer.id)}
                      >
                        Ledger
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setForm({
                            id: customer.id,
                            name: customer.name,
                            note: customer.note ?? "",
                          })
                        }
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => void handleDelete(customer.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <CustomerLedgerPanel
        customer={selectedCustomer}
        products={products}
        onCustomerMutated={loadCustomers}
      />
    </div>
  );
};
