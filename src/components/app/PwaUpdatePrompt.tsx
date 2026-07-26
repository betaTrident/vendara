import { hasDirtyForm } from "@/lib/pwa/dirty-form";

interface PwaUpdatePromptProps {
  needRefresh: boolean;
  hasUnsavedChanges?: boolean;
  onUpdate: () => void | Promise<void>;
  onDismiss: () => void;
}

export const PwaUpdatePrompt = ({
  needRefresh,
  hasUnsavedChanges = false,
  onUpdate,
  onDismiss,
}: PwaUpdatePromptProps) => {
  if (!needRefresh) {
    return null;
  }

  const handleUpdate = () => {
    if (hasUnsavedChanges || hasDirtyForm()) {
      const confirmed = window.confirm(
        "You have unsaved changes. Update anyway and reload the app?",
      );
      if (!confirmed) {
        return;
      }
    }

    void onUpdate();
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-safe"
      role="region"
      aria-label="Application update"
    >
      <div className="mx-auto mb-4 flex max-w-lg flex-col gap-3 rounded-md border border-hairline bg-card p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-ink">A new version is ready.</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onDismiss}
            className="h-9 rounded-sm border border-hairline bg-card px-3 text-xs font-semibold text-ink hover:bg-surface-soft"
          >
            Later
          </button>
          <button
            type="button"
            onClick={handleUpdate}
            className="h-9 rounded-sm bg-primary px-3 text-xs font-semibold text-white hover:bg-primary-hover"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};
