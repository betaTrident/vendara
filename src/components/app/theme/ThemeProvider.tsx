"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  applyResolvedThemeToDocument,
  readStoredThemePreference,
  resolveTheme,
  writeStoredThemePreference,
  type ResolvedTheme,
  type ThemePreference,
} from "@/lib/theme";

type ThemeContextValue = {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

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

const readDomResolvedTheme = (): ResolvedTheme => {
  if (typeof document === "undefined") {
    return "light";
  }
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemPrefersDark = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemPrefersDark,
    () => false,
  );

  const [preference, setPreferenceState] = useState<ThemePreference>(() => {
    if (typeof window === "undefined") {
      return "system";
    }
    return readStoredThemePreference(window.localStorage);
  });

  const resolved = resolveTheme(preference, systemPrefersDark);

  useEffect(() => {
    applyResolvedThemeToDocument(document, resolved);
  }, [resolved]);

  // Adopt bootstrap state on first client paint to avoid flash/mismatch.
  useEffect(() => {
    const bootstrapped = readDomResolvedTheme();
    if (bootstrapped !== resolved) {
      applyResolvedThemeToDocument(document, resolved);
    }
  }, [resolved]);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    if (typeof window !== "undefined") {
      writeStoredThemePreference(window.localStorage, next);
    }
  }, []);

  const value = useMemo(
    () => ({ preference, resolved, setPreference }),
    [preference, resolved, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Safe fallback for static Astro islands that have not wrapped yet.
    return {
      preference: "system",
      resolved: "light",
      setPreference: () => undefined,
    };
  }
  return context;
};
