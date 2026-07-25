import { PageHeader } from "@/components/app/layout/PageHeader";

interface RoutePlaceholderPageProps {
  title: string;
  description: string;
  onNavigate: (href: string) => void;
  fallbackHref: string;
  fallbackLabel: string;
}

/**
 * Honest stub for URL-backed routes whose full page redesign lands in a later phase.
 */
export function RoutePlaceholderPage({
  title,
  description,
  onNavigate,
  fallbackHref,
  fallbackLabel,
}: RoutePlaceholderPageProps) {
  return (
    <div className="space-y-6 py-4">
      <PageHeader title={title} description={description} />
      <p className="text-sm text-muted-text" role="status">
        This dedicated view is wired for navigation and will be completed in a later
        redesign phase. Use the existing workspace link below for the supported flow.
      </p>
      <button
        type="button"
        onClick={() => onNavigate(fallbackHref)}
        className="inline-flex h-10 items-center rounded-md border border-hairline bg-card px-4 text-sm font-medium text-ink hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {fallbackLabel}
      </button>
    </div>
  );
}
