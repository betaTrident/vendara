import { useEffect, useState } from "react";

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
import { fetchAdminJson } from "@/lib/client/api";
import type { Customer, LedgerEntry, Product } from "@/lib/types";

type CustomerLedgerPanelProps = {
  customer: Customer | null;
  products: Product[];
  onCustomerMutated: () => Promise<void> | void;
};

const emptyDebtRow = { productId: "", quantity: "1" };

export const CustomerLedgerPanel = ({
  customer,
  products,
  onCustomerMutated,
}: CustomerLedgerPanelProps) => {
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [debtNote, setDebtNote] = useState("");
  const [entryDate, setEntryDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [debtRows, setDebtRows] = useState([emptyDebtRow]);

  const loadLedger = async () => {
    if (!customer) {
      setLedger([]);
      return;
    }

    setLedger(
      await fetchAdminJson<LedgerEntry[]>(`/api/customers/${customer.id}/ledger`),
    );
  };

  useEffect(() => {
    void loadLedger();
  }, [customer?.id]);

  if (!customer) {
    return (
      <Card className="rounded-[1.5rem] border-border/70">
        <CardHeader>
          <CardTitle>Customer ledger</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Select a customer to view their running ledger, add debt entries, and
          record payments.
        </CardContent>
      </Card>
    );
  }

  const handleCreateDebt = async () => {
    await fetchAdminJson(`/api/customers/${customer.id}/ledger/debt`, {
      method: "POST",
      body: JSON.stringify({
        entryDate,
        note: debtNote || null,
        items: debtRows.filter((row) => row.productId).map((row) => ({
          productId: row.productId,
          quantity: Number(row.quantity),
        })),
      }),
    });

    setDebtRows([emptyDebtRow]);
    setDebtNote("");
    await loadLedger();
    await onCustomerMutated();
  };

  const handleCreatePayment = async () => {
    await fetchAdminJson(`/api/customers/${customer.id}/ledger/payment`, {
      method: "POST",
      body: JSON.stringify({
        entryDate,
        paymentAmount: Number(paymentAmount),
        note: paymentNote || null,
      }),
    });

    setPaymentAmount("");
    setPaymentNote("");
    await loadLedger();
    await onCustomerMutated();
  };

  const handleDeleteEntry = async (entryId: string) => {
    await fetchAdminJson(`/api/ledger/${entryId}`, {
      method: "DELETE",
    });

    await loadLedger();
    await onCustomerMutated();
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-[1.5rem] border-border/70">
        <CardHeader>
          <CardTitle>{customer.name}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Running balance: ₱{customer.balance.toFixed(2)}
          </p>
        </CardHeader>
      </Card>

      <Card className="rounded-[1.5rem] border-border/70">
        <CardHeader>
          <CardTitle>Add debt entry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="date"
            value={entryDate}
            onChange={(event) => setEntryDate(event.target.value)}
          />
          {debtRows.map((row, index) => (
            <div
              key={`${index}-${row.productId}`}
              className="grid gap-3 md:grid-cols-[1fr_120px]"
            >
              <select
                className="h-10 rounded-xl border border-input bg-background px-3"
                value={row.productId}
                onChange={(event) =>
                  setDebtRows((current) =>
                    current.map((entry, entryIndex) =>
                      entryIndex === index
                        ? { ...entry, productId: event.target.value }
                        : entry,
                    ),
                  )
                }
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - ₱{product.sellingPrice.toFixed(2)}
                  </option>
                ))}
              </select>
              <Input
                type="number"
                min="1"
                value={row.quantity}
                onChange={(event) =>
                  setDebtRows((current) =>
                    current.map((entry, entryIndex) =>
                      entryIndex === index
                        ? { ...entry, quantity: event.target.value }
                        : entry,
                    ),
                  )
                }
              />
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            onClick={() => setDebtRows((current) => [...current, emptyDebtRow])}
          >
            Add item row
          </Button>
          <Textarea
            placeholder="Optional note"
            value={debtNote}
            onChange={(event) => setDebtNote(event.target.value)}
          />
          <Button type="button" onClick={() => void handleCreateDebt()}>
            Save debt entry
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-[1.5rem] border-border/70">
        <CardHeader>
          <CardTitle>Record payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="date"
            value={entryDate}
            onChange={(event) => setEntryDate(event.target.value)}
          />
          <Input
            type="number"
            step="0.01"
            placeholder="Payment amount"
            value={paymentAmount}
            onChange={(event) => setPaymentAmount(event.target.value)}
          />
          <Textarea
            placeholder="Optional note"
            value={paymentNote}
            onChange={(event) => setPaymentNote(event.target.value)}
          />
          <Button type="button" onClick={() => void handleCreatePayment()}>
            Save payment
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-[1.5rem] border-border/70">
        <CardHeader>
          <CardTitle>Ledger history</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ledger.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.entryDate}</TableCell>
                  <TableCell className="capitalize">{entry.entryType}</TableCell>
                  <TableCell>
                    {entry.entryType === "payment" ? (
                      <div>₱{(entry.paymentAmount ?? 0).toFixed(2)}</div>
                    ) : (
                      <div className="space-y-1 text-sm">
                        <div>₱{(entry.totalAmount ?? 0).toFixed(2)}</div>
                        {entry.items.map((item) => (
                          <div key={item.id} className="text-muted-foreground">
                            {item.productNameSnapshot} × {item.quantity}
                          </div>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>₱{(entry.runningBalance ?? 0).toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => void handleDeleteEntry(entry.id)}
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
  );
};
