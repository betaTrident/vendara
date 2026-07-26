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

export type CustomerFormState = {
  id: string;
  name: string;
  note: string;
};

export const emptyCustomerForm: CustomerFormState = {
  id: "",
  name: "",
  note: "",
};

interface CustomerFormPanelProps {
  open: boolean;
  form: CustomerFormState;
  isSaving: boolean;
  isMobile: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (next: CustomerFormState) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

function CustomerFormFields({
  form,
  isSaving,
  onChange,
  onSubmit,
  onCancel,
}: {
  form: CustomerFormState;
  isSaving: boolean;
  onChange: (next: CustomerFormState) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4" id="customer-form">
      <div className="space-y-1.5">
        <Label htmlFor="customer-name" className="text-xs font-semibold text-ink">
          Customer name
        </Label>
        <Input
          id="customer-name"
          placeholder="e.g. Aling Nena"
          value={form.name}
          onChange={(event) =>
            onChange({ ...form, name: event.target.value })
          }
          className="h-11 rounded-md border border-hairline bg-card text-sm"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="customer-note" className="text-xs font-semibold text-ink">
          Note <span className="font-normal text-muted-text">(optional)</span>
        </Label>
        <Textarea
          id="customer-note"
          placeholder="Internal notes such as contact details..."
          value={form.note}
          onChange={(event) =>
            onChange({ ...form, note: event.target.value })
          }
          className="min-h-[88px] rounded-md border border-hairline bg-card text-sm resize-none"
        />
        <p className="text-[11px] text-muted-text">
          Contact metadata is not part of the current customer contract.
        </p>
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          id="customer-submit-btn"
          type="submit"
          disabled={isSaving}
          className="h-11 flex-1 font-semibold text-xs"
        >
          {isSaving ? "Saving..." : form.id ? "Update customer" : "Register customer"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function CustomerFormPanel({
  open,
  form,
  isSaving,
  isMobile,
  onOpenChange,
  onChange,
  onSubmit,
}: CustomerFormPanelProps) {
  const title = form.id ? "Edit customer" : "Add customer";
  const description = form.id
    ? "Update the customer profile and internal notes."
    : "Register a customer to track credit purchases and payments.";

  const close = () => onOpenChange(false);

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[92dvh]">
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-6 overflow-y-auto">
            <CustomerFormFields
              form={form}
              isSaving={isSaving}
              onChange={onChange}
              onSubmit={onSubmit}
              onCancel={close}
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <CustomerFormFields
            form={form}
            isSaving={isSaving}
            onChange={onChange}
            onSubmit={onSubmit}
            onCancel={close}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
