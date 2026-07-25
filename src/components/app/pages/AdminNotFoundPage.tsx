import { PageHeader } from "@/components/app/layout/PageHeader";
import { ADMIN_OVERVIEW_PATH } from "@/lib/admin/routes";

interface AdminNotFoundPageProps {
  requestedPath: string;
  onNavigate: (href: string) => void;
}

export function AdminNotFoundPage({
  requestedPath,
  onNavigate,
}: AdminNotFoundPageProps) {
  return (
    <div className="space-y-6 py-8">
      <PageHeader
        title="Page not found"
        description="That admin destination is not available. Choose a safe workspace link below."
      />
      <p className="text-sm text-muted-text" role="status">
        Requested path: <code className="font-mono text-ink">{requestedPath}</code>
      </p>
      <button
        type="button"
        onClick={() => onNavigate(ADMIN_OVERVIEW_PATH)}
        className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Back to overview
      </button>
    </div>
  );
}
