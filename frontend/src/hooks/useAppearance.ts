import { useSyncExternalStore } from 'react';

export type Mood = 'blossom' | 'mist' | 'paper' | 'sage';
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
  mood: 'blossom',
  serif: false,
  fontSize: 'md',
  dark: false,
  homeVariant: 'steps',
};

function readInitial(): Appearance {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    // storage unavailable or JSON malformed — fall through to defaults
  }

  // Fall back to legacy dark-mode flag + system preference
  let dark = DEFAULTS.dark;
  try {
    const legacy = localStorage.getItem('theme');
    if (legacy === 'dark') dark = true;
    else if (legacy === 'light') dark = false;
    else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) dark = true;
  } catch {
    // storage/matchMedia unavailable — keep default
  }

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

// ─── Shared store ──────────────────────────────────────────────────────────
// Single source of truth so every component using useAppearance() reacts
// to changes immediately (no stale snapshots between siblings).

type Listener = () => void;

let state: Appearance = /* hydrated on first read */ null as unknown as Appearance;
const listeners = new Set<Listener>();

function ensureHydrated() {
  if (state === null || state === undefined) {
    state = readInitial();
    applyToRoot(state);
  }
}

function subscribe(fn: Listener) {
  ensureHydrated();
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function getSnapshot() {
  ensureHydrated();
  return state;
}

/**
 * Server-side snapshot — used by React during SSR hydration so it doesn't
 * try to touch window / localStorage. We just return DEFAULTS.
 */
function getServerSnapshot(): Appearance {
  return DEFAULTS;
}

function setState(next: Appearance) {
  state = next;
  applyToRoot(next);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    localStorage.setItem('theme', next.dark ? 'dark' : 'light');
  } catch {
    // storage unavailable — appearance persists for session only
  }
  listeners.forEach((l) => l());
}

export function useAppearance() {
  const appearance = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const update = <K extends keyof Appearance>(key: K, value: Appearance[K]) => {
    setState({ ...state, [key]: value });
  };

  const setAppearance = (next: Appearance) => {
    setState(next);
  };

  return { appearance, update, setAppearance };
}

/**
 * Apply persisted appearance to <html> as early as possible (call from main.tsx).
 * Prevents a flash of wrong theme on first paint.
 */
export function hydrateAppearanceFromStorage() {
  ensureHydrated();
}
