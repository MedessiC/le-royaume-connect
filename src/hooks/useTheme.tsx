import { useEffect, useLayoutEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "millenium-theme";

const getStoredTheme = (): Theme => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
  } catch {
    // ignore
  }
  return "system";
};

const getAutoTheme = (): "light" | "dark" => {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18 ? "light" : "dark";
};

const resolveTheme = (theme: Theme): "light" | "dark" => {
  return theme === "system" ? getAutoTheme() : theme;
};

const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  const resolvedTheme = resolveTheme(theme);
  if (resolvedTheme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
};

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);
  const resolvedTheme = resolveTheme(theme);

  useLayoutEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") return;

    const now = new Date();
    const current = getAutoTheme();
    const next = new Date(now);

    if (current === "light") {
      next.setHours(18, 0, 0, 0);
    } else {
      next.setHours(6, 0, 0, 0);
    }

    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }

    const timeout = window.setTimeout(() => applyTheme("system"), next.getTime() - now.getTime());
    return () => window.clearTimeout(timeout);
  }, [theme]);

  const setTheme = (t: Theme) => {
    applyTheme(t);
    try {
      window.localStorage.setItem(STORAGE_KEY, t);
    } catch {
      // ignore
    }
    setThemeState(t);
  };

  const toggle = () => {
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return { theme, resolvedTheme, setTheme, toggle } as const;
}

export default useTheme;
