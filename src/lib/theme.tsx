import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export type ThemeMode = 'dark' | 'light';

const STORAGE_KEY = 'gycs_theme_mode';
const THEME_EVENT = 'gycs:theme-change';

export function getSavedTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // ignore storage errors
  }
  return 'dark';
}

export function applyThemeToDom(mode: ThemeMode) {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = mode;
  document.documentElement.style.colorScheme = mode;
  document.body.classList.toggle('gy-light', mode === 'light');
  document.body.classList.toggle('gy-dark', mode === 'dark');
}

export function setThemeMode(mode: ThemeMode) {
  try {
    window.localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // ignore storage errors
  }
  applyThemeToDom(mode);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent<ThemeMode>(THEME_EVENT, { detail: mode }));
  }
}

export function useThemeMode(): [ThemeMode, () => void, (next: ThemeMode) => void] {
  const [theme, setTheme] = useState<ThemeMode>(() => getSavedTheme());

  useEffect(() => {
    applyThemeToDom(theme);
    const handler = (e: Event) => {
      const custom = e as CustomEvent<ThemeMode>;
      if (custom.detail === 'light' || custom.detail === 'dark') {
        setTheme(custom.detail);
      } else {
        setTheme(getSavedTheme());
      }
    };
    window.addEventListener(THEME_EVENT, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(THEME_EVENT, handler);
      window.removeEventListener('storage', handler);
    };
  }, [theme]);

  const toggle = () => {
    const next: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setThemeMode(next);
  };

  return [theme, toggle, setThemeMode];
}

export function ThemeSwitcher({ className = '' }: { className?: string }) {
  const [theme, toggle] = useThemeMode();
  const isLight = theme === 'light';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${isLight ? 'dark' : 'light'} theme`}
      title={`Switch to ${isLight ? 'dark' : 'light'} theme`}
      className={`gy-theme-toggle inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
        isLight
          ? 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100'
          : 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
      } ${className}`}
    >
      {isLight ? (
        <>
          <Moon className="h-3.5 w-3.5 text-slate-700" />
          <span>Dark</span>
        </>
      ) : (
        <>
          <Sun className="h-3.5 w-3.5 text-amber-300" />
          <span>Light</span>
        </>
      )}
    </button>
  );
}
