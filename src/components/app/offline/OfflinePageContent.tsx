"use client";

import { useEffect, useState } from "react";
import { FolderOpen, Lightbulb, RefreshCw } from "lucide-react";

import { OfflineIllustration } from "@/components/app/offline/OfflineIllustration";
import { OfflineTipsDialog } from "@/components/app/offline/OfflineTipsDialog";
import { ADMIN_OVERVIEW_PATH } from "@/lib/admin/routes";
import {
  BRAND_WORDMARK_DARK_URL,
  BRAND_WORDMARK_LIGHT_URL,
} from "@/lib/brand-assets";
import { readLastSafeViewPath } from "@/lib/pwa/last-safe-view";
import { OFFLINE_PAGE_COPY } from "@/lib/pwa/offline-guidance";
import { cn } from "@/lib/utils";

export function OfflinePageContent() {
  const [tipsOpen, setTipsOpen] = useState(false);
  const [lastSafePath, setLastSafePath] = useState<string | null>(null);

  useEffect(() => {
    setLastSafePath(readLastSafeViewPath());
    document.documentElement.dataset.offlinePageReady = "true";
  }, []);

  const handleTryAgain = () => {
    if (navigator.onLine) {
      const destination = readLastSafeViewPath() ?? ADMIN_OVERVIEW_PATH;
      window.location.assign(destination);
      return;
    }

    window.location.reload();
  };

  const handleLastView = () => {
    const destination = readLastSafeViewPath();
    if (!destination) {
      return;
    }

    window.location.assign(destination);
  };

  return (
    <>
      <main
        id="main-content"
        tabIndex={-1}
        className={cn(
          "mx-auto flex min-h-dvh w-full max-w-3xl flex-col justify-center px-4 py-8 sm:px-6",
          "max-md:bg-gradient-to-b max-md:from-[#0b1f4d] max-md:via-[#12306f] max-md:to-[#0a1738] max-md:text-white",
          "md:max-w-none md:px-0 md:py-0",
        )}
      >
        <div
          className={cn(
            "mx-auto w-full max-w-xl space-y-6 rounded-xl p-6 sm:p-8",
            "max-md:max-w-md max-md:bg-transparent max-md:p-4",
            "md:vn-card md:shadow-sm",
          )}
        >
          <div className="flex justify-center">
            <img
              src={BRAND_WORDMARK_DARK_URL}
              alt="Vendara — Sari-sari Store Admin"
              width={160}
              height={40}
              decoding="async"
              className={cn(
                "h-8 w-auto max-w-[148px] object-contain",
                "max-md:mix-blend-screen md:hidden",
              )}
            />
            <img
              src={BRAND_WORDMARK_LIGHT_URL}
              alt="Vendara — Sari-sari Store Admin"
              width={160}
              height={40}
              decoding="async"
              className="hidden h-8 w-auto max-w-[148px] object-contain md:block dark:md:hidden"
            />
            <img
              src={BRAND_WORDMARK_DARK_URL}
              alt=""
              width={160}
              height={40}
              decoding="async"
              aria-hidden="true"
              className="hidden h-8 w-auto max-w-[148px] object-contain md:dark:block"
            />
          </div>

          <OfflineIllustration />

          <div className="space-y-3 text-center">
            <h1 className="text-2xl font-semibold tracking-tight font-heading">
              {OFFLINE_PAGE_COPY.heading}
            </h1>
            <p className="text-sm leading-relaxed max-md:text-white/80 md:text-muted-text">
              {OFFLINE_PAGE_COPY.body}
            </p>
          </div>

          <div
            className={cn(
              "rounded-md border px-4 py-3 text-left text-sm leading-relaxed",
              "max-md:border-white/15 max-md:bg-white/10 max-md:text-white/90",
              "md:border-primary/20 md:bg-primary/5 md:text-ink",
            )}
          >
            <p>{OFFLINE_PAGE_COPY.pwaNote}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={handleTryAgain}
              className={cn(
                "inline-flex h-11 min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold",
                "max-md:bg-white max-md:text-primary hover:max-md:bg-white/90",
                "md:bg-primary md:text-primary-foreground hover:md:opacity-90",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              {OFFLINE_PAGE_COPY.tryAgain}
            </button>

            {lastSafePath ? (
              <button
                type="button"
                onClick={handleLastView}
                className={cn(
                  "inline-flex h-11 min-h-11 items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold",
                  "max-md:border-white/40 max-md:text-white hover:max-md:bg-white/10",
                  "md:border-hairline md:bg-card md:text-ink hover:md:bg-surface-soft",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                <FolderOpen className="size-4" aria-hidden="true" />
                {OFFLINE_PAGE_COPY.lastView}
              </button>
            ) : null}
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setTipsOpen(true)}
              className={cn(
                "inline-flex h-11 min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold",
                "max-md:text-white hover:max-md:bg-white/10",
                "md:text-primary hover:md:bg-primary/5",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              <Lightbulb className="size-4" aria-hidden="true" />
              {OFFLINE_PAGE_COPY.tips}
            </button>
          </div>

          <p
            className="text-center text-xs max-md:text-white/70 md:text-muted-text"
            role="status"
            aria-live="polite"
          >
            {OFFLINE_PAGE_COPY.reconnectNote}
          </p>
        </div>
      </main>

      <OfflineTipsDialog open={tipsOpen} onOpenChange={setTipsOpen} />
    </>
  );
}
