import { useMemo } from 'react';
import { Profile, LoaderType } from '../types/launcher';

export type SortOption = 'lastPlayed' | 'name' | 'version';

export interface FilterOptions {
  searchQuery?: string;
  gameVersion?: string;
  sortBy?: SortOption;
}

/**
 * Pure function to filter profiles by loader.
 * Separated from React component tree to facilitate unit testing.
 */
export function filterProfilesByLoader(
  profiles: Profile[],
  loaderId: LoaderType | 'ALL'
): Profile[] {
  if (!Array.isArray(profiles)) return [];
  if (loaderId === 'ALL') return [...profiles];
  return profiles.filter((p) => p && p.loader === loaderId);
}

/**
 * Pure function to filter, search, and sort profiles by multiple criteria.
 */
export function filterAndSortProfiles(
  profiles: Profile[],
  loaderId: LoaderType | 'ALL',
  options: FilterOptions = {}
): Profile[] {
  if (!Array.isArray(profiles)) return [];

  // 1. Filter by loader
  let result = filterProfilesByLoader(profiles, loaderId);

  // 2. Filter by game version
  if (options.gameVersion && options.gameVersion !== 'ALL') {
    result = result.filter((p) => p.gameVersion === options.gameVersion);
  }

  // 3. Search query (matches profile name, game version, or loader version)
  if (options.searchQuery && options.searchQuery.trim()) {
    const q = options.searchQuery.trim().toLowerCase();
    result = result.filter((p) => {
      const nameMatch = p.name ? p.name.toLowerCase().includes(q) : false;
      const verMatch = p.gameVersion ? p.gameVersion.toLowerCase().includes(q) : false;
      const loaderVerMatch = p.loaderVersion ? p.loaderVersion.toLowerCase().includes(q) : false;
      return nameMatch || verMatch || loaderVerMatch;
    });
  }

  // 4. Sort
  const sortBy = options.sortBy || 'lastPlayed';
  result.sort((a, b) => {
    if (sortBy === 'lastPlayed') {
      const aTime = typeof a.lastPlayed === 'number' ? a.lastPlayed : 0;
      const bTime = typeof b.lastPlayed === 'number' ? b.lastPlayed : 0;
      if (bTime !== aTime) return bTime - aTime;
      return (a.name || '').localeCompare(b.name || '');
    }

    if (sortBy === 'version') {
      const aVer = a.gameVersion || '';
      const bVer = b.gameVersion || '';
      const vCompare = bVer.localeCompare(aVer, undefined, { numeric: true });
      if (vCompare !== 0) return vCompare;
      return (a.name || '').localeCompare(b.name || '');
    }

    // Default: 'name' ascending
    return (a.name || '').localeCompare(b.name || '');
  });

  return result;
}

/**
 * Validates instance name for uniqueness and non-emptiness.
 */
export function validateProfileName(
  name: string,
  profiles: Profile[],
  excludeId?: string
): { valid: boolean; error?: string } {
  const trimmed = name.trim();
  if (!trimmed) {
    return { valid: false, error: 'Nama instance tidak boleh kosong.' };
  }

  const isDuplicate = profiles.some(
    (p) => p.id !== excludeId && p.name.trim().toLowerCase() === trimmed.toLowerCase()
  );

  if (isDuplicate) {
    return { valid: false, error: `Instance dengan nama "${trimmed}" sudah ada.` };
  }

  return { valid: true };
}

/**
 * React hook to memoize profile filtering, searching, and sorting.
 */
export function useLoaderProfiles(
  profiles: Profile[],
  loaderId: LoaderType | 'ALL',
  options: FilterOptions = {}
) {
  const filteredProfiles = useMemo(
    () => filterAndSortProfiles(profiles, loaderId, options),
    [profiles, loaderId, options.searchQuery, options.gameVersion, options.sortBy]
  );

  const loaderTotalProfiles = useMemo(
    () => (loaderId === 'ALL' ? profiles : profiles.filter((p) => p && p.loader === loaderId)),
    [profiles, loaderId]
  );

  const totalMods = useMemo(() => {
    return loaderTotalProfiles.reduce((acc, p) => acc + (p.mods ? p.mods.length : 0), 0);
  }, [loaderTotalProfiles]);

  const availableVersions = useMemo(() => {
    const versions = new Set<string>();
    loaderTotalProfiles.forEach((p) => {
      if (p.gameVersion) versions.add(p.gameVersion);
    });
    return Array.from(versions).sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
  }, [loaderTotalProfiles]);

  return {
    filteredProfiles,
    totalCount: loaderTotalProfiles.length,
    totalMods,
    availableVersions,
  };
}
