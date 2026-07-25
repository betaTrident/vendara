export const THEME_STORAGE_KEY = "vendara-theme";

/** Brand primary for light surfaces (DESIGN.md / redesign plan). */
export const THEME_COLOR_LIGHT = "#2563ff";
/** Elevated navy surface accent for dark theme-color meta. */
export const THEME_COLOR_DARK = "#0b1220";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export type ThemeStorageLike = {
  getItem: (key: string) => string | null;
  setItem?: (key: string, value: string) => void;
};

export type ThemeDocumentLike = {
  documentElement: {
    classList: {
      add: (value: string) => void;
      remove: (value: string) => void;
      contains: (value: string) => boolean;
    };
    style: {
      setProperty: (key: string, value: string) => void;
    };
  };
  querySelector: (selector: string) => { content: string } | null;
};

export const parseThemePreference = (raw: unknown): ThemePreference => {
  if (raw === "light" || raw === "dark" || raw === "system") {
    return raw;
  }
  return "system";
};

export const resolveTheme = (
  preference: ThemePreference,
  systemPrefersDark: boolean,
): ResolvedTheme => {
  if (preference === "light" || preference === "dark") {
    return preference;
  }
  return systemPrefersDark ? "dark" : "light";
};

export const getThemeColorMeta = (resolved: ResolvedTheme): string =>
  resolved === "dark" ? THEME_COLOR_DARK : THEME_COLOR_LIGHT;

export const getWordmarkSrc = (resolved: ResolvedTheme): string =>
  resolved === "dark"
    ? "/brand/vendara-wordmark-dark.svg"
    : "/brand/vendara-wordmark-light.svg";

export const getMarkSrc = (): string => "/brand/vendara-mark.svg";

export const readStoredThemePreference = (
  storage: ThemeStorageLike | null | undefined,
): ThemePreference => {
  try {
    const raw = storage?.getItem(THEME_STORAGE_KEY) ?? null;
    return parseThemePreference(raw);
  } catch {
    return "system";
  }
};

export const writeStoredThemePreference = (
  storage: ThemeStorageLike | null | undefined,
  preference: ThemePreference,
): void => {
  try {
    storage?.setItem?.(THEME_STORAGE_KEY, preference);
  } catch {
    // Ignore quota / private-mode failures.
  }
};

export const applyResolvedThemeToDocument = (
  doc: ThemeDocumentLike,
  resolved: ResolvedTheme,
): void => {
  if (resolved === "dark") {
    doc.documentElement.classList.add("dark");
  } else {
    doc.documentElement.classList.remove("dark");
  }

  doc.documentElement.style.setProperty("color-scheme", resolved);

  const meta = doc.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.content = getThemeColorMeta(resolved);
  }
};

/**
 * Inline bootstrap for BaseLayout — keep in sync with applyResolvedThemeToDocument.
 * Intentionally self-contained (no imports) for first-paint safety.
 */
export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var raw=localStorage.getItem(k);var pref=(raw==='light'||raw==='dark'||raw==='system')?raw:'system';var dark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=pref==='system'?(dark?'dark':'light'):pref;var root=document.documentElement;if(resolved==='dark'){root.classList.add('dark');}else{root.classList.remove('dark');}root.style.colorScheme=resolved;var meta=document.querySelector('meta[name="theme-color"]');if(meta){meta.setAttribute('content',resolved==='dark'?${JSON.stringify(THEME_COLOR_DARK)}:${JSON.stringify(THEME_COLOR_LIGHT)});} }catch(e){}})();`;
