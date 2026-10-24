import type { ActiveView } from '../types/launcher';

/**
 * Maintenance switch, driven by `public/maintenance.json` (served at `/maintenance.json`).
 * Edit that file and reload — no rebuild needed.
 *
 * Pure functions only, so `test/maintenance.test.mjs` can check them without a DOM.
 */

export interface MaintenanceConfig {
  /** Whole launcher locked. Wins over `lockedViews`. */
  enabled: boolean;
  title: string;
  message: string;
  /** ISO timestamp, or null for "no estimate". */
  eta: string | null;
  /** Views locked individually while `enabled` is false. */
  lockedViews: ActiveView[];
}

const KNOWN_VIEWS: ActiveView[] = [
  'HERO',
  'PROFILES',
  'CONFIGURE',
  'MODS',
  'STORE',
  'SETTINGS',
  'CONSOLE',
  'LOADER',
];

export const OPEN_CONFIG: MaintenanceConfig = {
  enabled: false,
  title: 'RawCraft sedang dalam perawatan',
  message: 'Kami sedang memperbaiki layanan. Coba lagi beberapa saat lagi.',
  eta: null,
  lockedViews: [],
};

/** Strict ISO-8601 only. `Date.parse` alone is lenient enough to accept "tomorrow at 5". */
const ISO_DATE_RE =
  /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/;

const parseEta = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!ISO_DATE_RE.test(trimmed)) return null;
  return Number.isNaN(Date.parse(trimmed)) ? null : trimmed;
};

/**
 * Normalises whatever came out of JSON.parse. Unknown/malformed input collapses to
 * OPEN_CONFIG — a broken config file must never brick the launcher.
 */
export function parseMaintenanceConfig(raw: unknown): MaintenanceConfig {
  if (!raw || typeof raw !== 'object') return OPEN_CONFIG;
  const d = raw as Record<string, unknown>;

  const lockedViews = Array.isArray(d.lockedViews)
    ? (d.lockedViews
        .filter((v): v is string => typeof v === 'string')
        .map((v) => v.trim().toUpperCase())
        .filter((v): v is ActiveView => KNOWN_VIEWS.includes(v as ActiveView)))
    : [];

  return {
    enabled: d.enabled === true,
    title: typeof d.title === 'string' && d.title.trim() ? d.title.trim() : OPEN_CONFIG.title,
    message:
      typeof d.message === 'string' && d.message.trim() ? d.message.trim() : OPEN_CONFIG.message,
    eta: parseEta(d.eta),
    lockedViews: [...new Set(lockedViews)],
  };
}

/** Whole-app lock. */
export const isAppLocked = (cfg: MaintenanceConfig): boolean => cfg.enabled;

/** Single-tab lock. Always false while the whole app is locked (the gate already covers it). */
export const isViewLocked = (cfg: MaintenanceConfig, view: ActiveView): boolean =>
  !cfg.enabled && cfg.lockedViews.includes(view);

/** Human label for a locked tab, so the page can say which one is down. */
export const viewLabel = (view: ActiveView): string =>
  ({
    HERO: 'Beranda',
    PROFILES: 'Instance',
    CONFIGURE: 'Konfigurasi',
    MODS: 'Daftar Mod',
    STORE: 'Instal Mod',
    SETTINGS: 'Pengaturan',
    CONSOLE: 'Konsol',
    LOADER: 'Mod Loader',
  })[view] ?? view;
