import { useCallback, useEffect, useState } from "react";

export type Theme = "dark" | "light" | "system";

export const THEME_KEY = "artprogress.theme";

/** Inlined in <head> to apply the theme before first paint. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${THEME_KEY}')||'dark';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);document.documentElement.style.colorScheme=d?'dark':'light';}catch(e){document.documentElement.classList.add('dark');}})();`;

function apply(theme: Theme) {
  const dark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const stored = (localStorage.getItem(THEME_KEY) as Theme | null) ?? "dark";
    setThemeState(stored);
    apply(stored);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if ((localStorage.getItem(THEME_KEY) as Theme | null) === "system") apply("system");
    };
    mq.addEventListener("change", onChange);
    const sync = () => {
      const t = (localStorage.getItem(THEME_KEY) as Theme | null) ?? "dark";
      setThemeState(t);
      apply(t);
    };
    window.addEventListener("artprogress:theme", sync);
    return () => {
      mq.removeEventListener("change", onChange);
      window.removeEventListener("artprogress:theme", sync);
    };
  }, []);

  const setTheme = useCallback((t: Theme) => {
    localStorage.setItem(THEME_KEY, t);
    setThemeState(t);
    apply(t);
    window.dispatchEvent(new Event("artprogress:theme"));
  }, []);

  return { theme, setTheme };
}
