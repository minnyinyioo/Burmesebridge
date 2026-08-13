"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeToggle({ locale }: { locale: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(() => () => undefined, () => true, () => false);

  const dark = mounted && resolvedTheme === "dark";
  const label = locale === "zh" ? (dark ? "切换浅色模式" : "切换深色模式") : locale === "my" ? (dark ? "အလင်းရောင် ပြောင်းရန်" : "အမှောင်ရောင် ပြောင်းရန်") : (dark ? "Use light mode" : "Use dark mode");

  return <button type="button" className="site-action-button theme-toggle" aria-label={label} title={label} onClick={() => setTheme(dark ? "light" : "dark")}>
    {dark ? <Sun size={18} /> : <Moon size={18} />}
  </button>;
}
