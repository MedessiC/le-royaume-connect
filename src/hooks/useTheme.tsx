import { useLayoutEffect, useState } from "react";

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

const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = theme === "dark" || (theme === "system" && prefersDark);
  if (isDark) root.classList.add("dark");
  else root.classList.remove("dark");
};

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);

  useLayoutEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useLayoutEffect(() => {
    const mq = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };

    if (!mq) return;
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange as any);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange as any);
      else if (mq.removeListener) mq.removeListener(onChange as any);
    };
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
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return { theme, setTheme, toggle } as const;
}

export default useTheme;
