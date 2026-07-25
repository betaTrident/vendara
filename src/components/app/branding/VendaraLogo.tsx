"use client";

import { useSyncExternalStore } from "react";

import {
  applyResolvedThemeToDocument,
  getMarkSrc,
  getWordmarkSrc,
  resolveTheme,
  type ResolvedTheme,
  type ThemePreference,
} from "@/lib/theme";
import { useTheme } from "@/components/app/theme/ThemeProvider";
import { cn } from "@/lib/utils";

export type VendaraLogoProps = {
  variant: "horizontal" | "stacked" | "icon";
  theme?: "light" | "dark";
  priority?: boolean;
  className?: string;
  alt?: string;
};

const subscribeToSystemTheme = (onStoreChange: () => void) => {
  if (typeof window === "undefined" || !window.matchMedia) {
    return () => undefined;
  }
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
};

const getSystemPrefersDark = () => {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

const useResolvedDocumentTheme = (
  preference: ThemePreference,
  explicit?: "light" | "dark",
): ResolvedTheme => {
  const systemPrefersDark = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemPrefersDark,
    () => false,
  );

  if (explicit) {
    return explicit;
  }

  return resolveTheme(preference, systemPrefersDark);
};

export const VendaraLogo = ({
  variant,
  theme,
  priority = false,
  className,
  alt,
}: VendaraLogoProps) => {
  const { preference } = useTheme();
  const resolved = useResolvedDocumentTheme(preference, theme);

  if (variant === "icon") {
    return (
      <img
        src={getMarkSrc()}
        alt={alt ?? ""}
        width={28}
        height={28}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        className={cn("h-7 w-7 object-contain", className)}
        aria-hidden={alt ? undefined : true}
      />
    );
  }

  const src = getWordmarkSrc(resolved);
  const dimensions =
    variant === "stacked"
      ? { width: 140, height: 120, className: "h-16 w-auto max-w-[140px]" }
      : { width: 160, height: 40, className: "h-8 w-auto max-w-[160px]" };

  return (
    <img
      src={src}
      alt={alt ?? ""}
      width={dimensions.width}
      height={dimensions.height}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : "auto"}
      className={cn(dimensions.className, "object-contain object-left", className)}
      aria-hidden={alt ? undefined : true}
    />
  );
};

/** Keep document class in sync when preference changes outside bootstrap. */
export const syncDocumentTheme = (
  preference: ThemePreference,
  systemPrefersDark: boolean,
) => {
  if (typeof document === "undefined") {
    return;
  }
  applyResolvedThemeToDocument(document, resolveTheme(preference, systemPrefersDark));
};
