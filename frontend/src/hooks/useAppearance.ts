import { useEffect, useState } from 'react';

export type Mood = 'mist' | 'paper' | 'sage';
export type FontSize = 'md' | 'lg';
export type HomeVariant = 'cta' | 'steps' | 'mood';

export interface Appearance {
  mood: Mood;
  serif: boolean;
  fontSize: FontSize;
  dark: boolean;
  homeVariant: HomeVariant;
}

const STORAGE_KEY = 'kiba-appearance';

const DEFAULTS: Appearance = {
  mood: 'mist',
  serif: false,
  fontSize: 'md',
  dark: false,
  homeVariant: 'steps',
};

function readInitial(): Appearance {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {}

  // Fall back to legacy dark-mode flag + system preference
  let dark = DEFAULTS.dark;
  try {
    const legacy = localStorage.getItem('theme');
    if (legacy === 'dark') dark = true;
    else if (legacy === 'light') dark = false;
    else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) dark = true;
  } catch {}

  return { ...DEFAULTS, dark };
}

function applyToRoot(a: Appearance) {
  const root = document.documentElement;
  root.setAttribute('data-mood', a.mood);
  root.setAttribute('data-dark', a.dark ? 'true' : 'false');
  root.setAttribute('data-serif', a.serif ? 'true' : 'false');
  root.setAttribute('data-fs', a.fontSize);
  // Keep Tailwind's `.dark` class in sync for existing dark: utilities
  if (a.dark) root.classList.add('dark');
  else root.classList.remove('dark');
}

export function useAppearance() {
  const [appearance, setAppearance] = useState<Appearance>(readInitial);

  useEffect(() => {
    applyToRoot(appearance);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appearance));
      localStorage.setItem('theme', appearance.dark ? 'dark' : 'light');
    } catch {}
  }, [appearance]);

  const update = <K extends keyof Appearance>(key: K, value: Appearance[K]) => {
    setAppearance((prev) => ({ ...prev, [key]: value }));
  };

  return { appearance, update, setAppearance };
}

/**
 * Apply persisted appearance to <html> as early as possible (call from main.tsx).
 * Prevents a flash of wrong theme on first paint.
 */
export function hydrateAppearanceFromStorage() {
  applyToRoot(readInitial());
}
