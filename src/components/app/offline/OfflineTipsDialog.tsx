import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OFFLINE_TIPS } from "@/lib/pwa/offline-guidance";

interface OfflineTipsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OfflineTipsDialog({ open, onOpenChange }: OfflineTipsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Offline tips</DialogTitle>
          <DialogDescription>
            What Vendara can and cannot do without a live internet connection.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-4">
          {OFFLINE_TIPS.map((tip) => (
            <li key={tip.title} className="space-y-1">
              <h3 className="text-sm font-semibold text-ink">{tip.title}</h3>
              <p className="text-sm text-muted-text leading-relaxed">{tip.body}</p>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
