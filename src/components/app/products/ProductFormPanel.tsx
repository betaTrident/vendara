import { Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { MarkupBadge } from "@/components/app/products/MarkupBadge";
import { ProductMediaPlaceholder } from "@/components/app/products/ProductMediaPlaceholder";
import {
  computeMarkupAmount,
  computeMarkupPercent,
} from "@/lib/domain/pricing";

export type ProductFormState = {
  id: string;
  name: string;
  costPrice: string;
  sellingPrice: string;
  note: string;
};

export const emptyProductForm: ProductFormState = {
  id: "",
  name: "",
  costPrice: "",
  sellingPrice: "",
  note: "",
};

interface ProductFormPanelProps {
  open: boolean;
  form: ProductFormState;
  isSaving: boolean;
  isMobile: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (next: ProductFormState) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

function ProductFormFields({
  form,
  isSaving,
  onChange,
  onSubmit,
  onCancel,
}: {
  form: ProductFormState;
  isSaving: boolean;
  onChange: (next: ProductFormState) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  const cost = Number(form.costPrice);
  const selling = Number(form.sellingPrice);
  const hasPrices =
    form.costPrice !== "" &&
    form.sellingPrice !== "" &&
    Number.isFinite(cost) &&
    Number.isFinite(selling);
  const markupAmount = hasPrices ? computeMarkupAmount(cost, selling) : null;
  const markupPercent = hasPrices ? computeMarkupPercent(cost, selling) : null;

  return (
    <form onSubmit={onSubmit} className="space-y-4" id="product-form">
      <div className="flex items-center gap-3 rounded-md border border-hairline bg-surface-soft p-3">
        <ProductMediaPlaceholder />
        <p className="text-xs text-muted-text leading-relaxed">
          Product photos are not available yet. Pricing and notes are supported
          today.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="product-name" className="text-xs font-semibold text-ink">
          Product name
        </Label>
        <Input
          id="product-name"
          placeholder="e.g. Century Tuna 150g"
          value={form.name}
          onChange={(event) =>
            onChange({ ...form, name: event.target.value })
          }
          className="h-11 rounded-md"
          required
          maxLength={200}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="cost-price" className="text-xs font-semibold text-ink">
            Cost price (₱)
          </Label>
          <div className="relative flex items-center">
            <span
              className="absolute left-3 text-muted-text text-xs font-medium font-mono"
              aria-hidden="true"
            >
              ₱
            </span>
            <Input
              id="cost-price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={form.costPrice}
              onChange={(event) =>
                onChange({ ...form, costPrice: event.target.value })
              }
              className="h-11 pl-7 rounded-md font-mono"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="selling-price"
            className="text-xs font-semibold text-ink"
          >
            Selling price (₱)
          </Label>
          <div className="relative flex items-center">
            <span
              className="absolute left-3 text-muted-text text-xs font-medium font-mono"
              aria-hidden="true"
            >
              ₱
            </span>
            <Input
              id="selling-price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={form.sellingPrice}
              onChange={(event) =>
                onChange({ ...form, sellingPrice: event.target.value })
              }
              className="h-11 pl-7 rounded-md font-mono"
              required
            />
          </div>
        </div>
      </div>

      {markupAmount !== null ? (
        <div className="rounded-md bg-surface-soft border border-hairline p-3 flex items-center justify-between gap-3">
          <span className="text-xs text-muted-text flex items-center gap-1.5 font-semibold">
            <Info className="size-3.5 text-primary" aria-hidden="true" />
            Gross markup
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink font-mono font-bold tabular-nums">
              ₱{markupAmount.toFixed(2)}
            </span>
            <MarkupBadge percent={markupPercent} />
          </div>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="product-note" className="text-xs font-semibold text-ink">
          Note <span className="font-normal text-muted-text">(optional)</span>
        </Label>
        <Textarea
          id="product-note"
          placeholder="Supplier notes, pack size, or shelf location..."
          value={form.note}
          onChange={(event) => onChange({ ...form, note: event.target.value })}
          className="min-h-[72px] rounded-md resize-none"
          maxLength={255}
        />
      </div>

      <div className="flex gap-2.5 pt-1">
        <Button
          id="product-submit-btn"
          type="submit"
          disabled={isSaving}
          className="h-11 px-4 rounded-md font-semibold text-xs flex-1"
        >
          {isSaving ? "Saving..." : form.id ? "Update product" : "Save product"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="h-11 px-4 rounded-md text-xs font-semibold flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function ProductFormPanel({
  open,
  form,
  isSaving,
  isMobile,
  onOpenChange,
  onChange,
  onSubmit,
}: ProductFormPanelProps) {
  const title = form.id ? "Edit product" : "Add product";
  const description = form.id
    ? "Update pricing. Markup is calculated from cost and selling price."
    : "Enter cost and selling price. Markup is calculated automatically.";

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[92vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-6">
            <ProductFormFields
              form={form}
              isSaving={isSaving}
              onChange={onChange}
              onSubmit={onSubmit}
              onCancel={() => onOpenChange(false)}
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6">
          <ProductFormFields
            form={form}
            isSaving={isSaving}
            onChange={onChange}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
