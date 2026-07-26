"use client";

import { ThemeProvider } from "@/components/app/theme/ThemeProvider";
import { OfflinePageContent } from "@/components/app/offline/OfflinePageContent";

export function OfflinePage() {
  return (
    <ThemeProvider>
      <OfflinePageContent />
    </ThemeProvider>
  );
}
