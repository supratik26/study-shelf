import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Theme = "light" | "dark";
export type ThemePreference = Theme | "system";

type ThemeContextType = {
  theme: Theme;
  preference: ThemePreference;
  setTheme: (preference: ThemePreference) => void;
  toggleTheme: () => void;
  useSystemTheme: () => void;
  switchable: boolean;
};

const THEME_STORAGE_KEY = "study-shelf-theme-preference";
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): Theme {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getInitialPreference(defaultTheme: ThemePreference): ThemePreference {
  if (typeof window === "undefined") return defaultTheme;
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system" ? stored : defaultTheme;
}

function getQueryPreference(): ThemePreference | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("theme");
  return value === "light" || value === "dark" || value === "system" ? value : null;
}

export function ThemeProvider({ children, defaultTheme = "system", switchable = false }: { children: React.ReactNode; defaultTheme?: ThemePreference; switchable?: boolean }) {
  const [preference, setPreference] = useState<ThemePreference>(() => switchable ? getInitialPreference(defaultTheme) : defaultTheme);
  const [systemTheme, setSystemTheme] = useState<Theme>(getSystemTheme);
  const queryPreference = getQueryPreference();
  const activePreference = queryPreference ?? preference;
  const theme = activePreference === "system" ? systemTheme : activePreference;

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const updateSystemTheme = () => setSystemTheme(media.matches ? "dark" : "light");
    updateSystemTheme();
    media.addEventListener("change", updateSystemTheme);
    return () => media.removeEventListener("change", updateSystemTheme);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    if (switchable) window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  }, [theme, preference, switchable]);

  const value = useMemo<ThemeContextType>(() => ({
    theme,
    preference,
    setTheme: nextPreference => setPreference(nextPreference),
    toggleTheme: () => setPreference(theme === "dark" ? "light" : "dark"),
    useSystemTheme: () => setPreference("system"),
    switchable,
  }), [theme, preference, switchable]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
