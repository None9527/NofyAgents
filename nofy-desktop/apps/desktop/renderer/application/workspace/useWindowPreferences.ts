import { useEffect, useState } from "react";
import { loadLayout, saveLayout } from "../../ui/prefs.ts";
import type { LayoutPrefs } from "../../ui/prefs.ts";
import { applyTheme, loadTheme, saveTheme } from "../../ui/theme.ts";
import type { ThemeName } from "../../ui/theme.ts";
export function useWindowPreferences() {
  const [theme, setTheme] = useState<ThemeName>(loadTheme);
  const [layout, setLayout] = useState<LayoutPrefs>(() => ({ ...loadLayout(), auxOpen: false }));
  const [dockMounted, setDockMounted] = useState(() => loadLayout().dockOpen);
  const [now, setNow] = useState(Date.now);
  useEffect(() => { applyTheme(theme); saveTheme(theme); }, [theme]);
  useEffect(() => { saveLayout(layout); }, [layout]);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(timer); }, []);
  return { theme, setTheme, layout, setLayout, dockMounted, setDockMounted, now };
}
