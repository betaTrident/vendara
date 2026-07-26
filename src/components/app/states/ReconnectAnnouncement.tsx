import { StatusBanner } from "@/components/app/states/StatusBanner";

interface ReconnectAnnouncementProps {
  visible: boolean;
  onDismiss: () => void;
}

export function ReconnectAnnouncement({
  visible,
  onDismiss,
}: ReconnectAnnouncementProps) {
  if (!visible) {
    return null;
  }

  return (
    <StatusBanner
      tone="success"
      live="assertive"
      className="flex items-center justify-center gap-3"
    >
      <span>Back online — you can refresh store data and save again.</span>
      <button
        type="button"
        onClick={onDismiss}
        className="rounded-sm border border-current/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40"
      >
        Dismiss
      </button>
    </StatusBanner>
  );
}
