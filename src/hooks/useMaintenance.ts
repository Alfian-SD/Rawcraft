import { useEffect, useState } from 'react';
import {
  MaintenanceConfig,
  OPEN_CONFIG,
  parseMaintenanceConfig,
} from '../utils/maintenance';

const ENDPOINT = '/maintenance.json';

/**
 * Reads the maintenance switch from `public/maintenance.json`.
 * Fail-open: a missing or broken file means "nothing is locked".
 * Re-reads on window focus so a sudden lock lands without a full reload.
 */
export function useMaintenance(): MaintenanceConfig {
  const [config, setConfig] = useState<MaintenanceConfig>(OPEN_CONFIG);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(ENDPOINT, { cache: 'no-store' });
        if (!res.ok) return;
        const next = parseMaintenanceConfig(await res.json());
        if (!cancelled) setConfig(next);
      } catch {
        // fail-open: keep whatever we already have
      }
    };

    load();
    window.addEventListener('focus', load);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', load);
    };
  }, []);

  return config;
}
