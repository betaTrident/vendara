import { ConnectionStatus } from "@/components/app/ConnectionStatus";

interface StoreStatusCardProps {
  isOnline?: boolean;
  storeLabel?: string;
}

export function StoreStatusCard({
  isOnline = true,
  storeLabel = "Owner workspace",
}: StoreStatusCardProps) {
  return (
    <div className="rounded-md border border-hairline bg-surface-soft p-3 space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-text">
        Store status
      </p>
      <p className="text-sm font-medium text-ink truncate">{storeLabel}</p>
      <ConnectionStatus isOnline={isOnline} />
    </div>
  );
}
