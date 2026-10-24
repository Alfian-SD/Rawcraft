import assert from 'node:assert/strict';

// Test 1: Pure filtering function
function filterProfilesByLoader(profiles, loaderId) {
  if (!Array.isArray(profiles)) return [];
  if (loaderId === 'ALL') return [...profiles];
  return profiles.filter((p) => p && p.loader === loaderId);
}

// Test 2: Filter and Sort function
function filterAndSortProfiles(profiles, loaderId, options = {}) {
  if (!Array.isArray(profiles)) return [];

  let result = filterProfilesByLoader(profiles, loaderId);

  if (options.gameVersion && options.gameVersion !== 'ALL') {
    result = result.filter((p) => p.gameVersion === options.gameVersion);
  }

  if (options.searchQuery && options.searchQuery.trim()) {
    const q = options.searchQuery.trim().toLowerCase();
    result = result.filter((p) => {
      const nameMatch = p.name ? p.name.toLowerCase().includes(q) : false;
      const verMatch = p.gameVersion ? p.gameVersion.toLowerCase().includes(q) : false;
      const loaderVerMatch = p.loaderVersion ? p.loaderVersion.toLowerCase().includes(q) : false;
      return nameMatch || verMatch || loaderVerMatch;
    });
  }

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

    return (a.name || '').localeCompare(b.name || '');
  });

  return result;
}

// Test 3: Validation function
function validateProfileName(name, profiles, excludeId) {
  const trimmed = (name || '').trim();
  if (!trimmed) {
    return { valid: false, error: 'Nama instance tidak boleh kosong.' };
  }

  const isDuplicate = profiles.some(
    (p) => p.id !== excludeId && (p.name || '').trim().toLowerCase() === trimmed.toLowerCase()
  );

  if (isDuplicate) {
    return { valid: false, error: `Instance dengan nama "${trimmed}" sudah ada.` };
  }

  return { valid: true };
}

// Test 4: Sanitization & Migration function
function sanitizeProfile(raw, fallbackId = 'prof-fallback') {
  if (!raw || typeof raw !== 'object') {
    return {
      id: fallbackId,
      name: 'DEFAULT // INSTANCE',
      gameVersion: '1.21.4',
      loader: 'FABRIC',
      maxRamMb: 4096,
      jvmFlags: '-XX:+UseG1GC',
      gameDir: `/instances/${fallbackId}`,
      mods: [],
    };
  }

  let loader = 'FABRIC';
  if (typeof raw.loader === 'string') {
    const upper = raw.loader.trim().toUpperCase();
    if (['RAWCRAFT', 'FORGE', 'NEOFORGE', 'FABRIC', 'QUILT', 'VANILLA'].includes(upper)) {
      loader = upper;
    }
  } else if (typeof raw.name === 'string') {
    const nameUpper = raw.name.toUpperCase();
    if (nameUpper.includes('RAWCRAFT')) loader = 'RAWCRAFT';
    else if (nameUpper.includes('NEOFORGE')) loader = 'NEOFORGE';
    else if (nameUpper.includes('FORGE')) loader = 'FORGE';
    else if (nameUpper.includes('QUILT')) loader = 'QUILT';
    else if (nameUpper.includes('VANILLA')) loader = 'VANILLA';
    else if (nameUpper.includes('FABRIC')) loader = 'FABRIC';
  }

  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : fallbackId,
    name: typeof raw.name === 'string' && raw.name ? raw.name : 'CLASSIC // INSTANCE',
    gameVersion: typeof raw.gameVersion === 'string' && raw.gameVersion ? raw.gameVersion : '1.21.4',
    loader,
    loaderVersion: typeof raw.loaderVersion === 'string' ? raw.loaderVersion : undefined,
    maxRamMb: typeof raw.maxRamMb === 'number' && raw.maxRamMb > 0 ? raw.maxRamMb : 4096,
    jvmFlags: typeof raw.jvmFlags === 'string' ? raw.jvmFlags : '-XX:+UseG1GC',
    gameDir: typeof raw.gameDir === 'string' && raw.gameDir ? raw.gameDir : `/instances/${raw.id || fallbackId}`,
    javaPath: typeof raw.javaPath === 'string' ? raw.javaPath : undefined,
    mods: Array.isArray(raw.mods) ? raw.mods : [],
    lastPlayed: typeof raw.lastPlayed === 'number' ? raw.lastPlayed : undefined,
  };
}

const mockProfiles = [
  { id: 'p1', name: 'Alpha Tech', loader: 'FABRIC', gameVersion: '1.21.4', lastPlayed: 1000, mods: [] },
  { id: 'p2', name: 'Old School', loader: 'FORGE', gameVersion: '1.20.1', lastPlayed: 500, mods: [] },
  { id: 'p3', name: 'Next Gen', loader: 'NEOFORGE', gameVersion: '1.21.1', lastPlayed: 2000, mods: [] },
  { id: 'p4', name: 'Quilt Comfy', loader: 'QUILT', gameVersion: '1.21.4', mods: [] },
  { id: 'p5', name: 'Beta Fabric', loader: 'FABRIC', gameVersion: '1.20.4', lastPlayed: 3000, mods: [] },
];

console.log('Running loaderProfiles unit tests...');

// 1. Basic filter tests
const fabricOnly = filterProfilesByLoader(mockProfiles, 'FABRIC');
assert.equal(fabricOnly.length, 2, 'Should find 2 Fabric profiles');
assert.ok(fabricOnly.every((p) => p.loader === 'FABRIC'));

const forgeOnly = filterProfilesByLoader(mockProfiles, 'FORGE');
assert.equal(forgeOnly.length, 1, 'Should find 1 Forge profile');
assert.equal(forgeOnly[0].id, 'p2');

const neoOnly = filterProfilesByLoader(mockProfiles, 'NEOFORGE');
assert.equal(neoOnly.length, 1, 'Should find 1 NeoForge profile');

const quiltOnly = filterProfilesByLoader(mockProfiles, 'QUILT');
assert.equal(quiltOnly.length, 1, 'Should find 1 Quilt profile');

const allProfiles = filterProfilesByLoader(mockProfiles, 'ALL');
assert.equal(allProfiles.length, 5, 'ALL filter should return all profiles');

const emptyFilter = filterProfilesByLoader([], 'FABRIC');
assert.deepEqual(emptyFilter, [], 'Empty input should return empty array');

// 2. Search, version filter, and sort tests
const searched = filterAndSortProfiles(mockProfiles, 'FABRIC', { searchQuery: 'Beta' });
assert.equal(searched.length, 1);
assert.equal(searched[0].id, 'p5');

const versionFiltered = filterAndSortProfiles(mockProfiles, 'FABRIC', { gameVersion: '1.21.4' });
assert.equal(versionFiltered.length, 1);
assert.equal(versionFiltered[0].id, 'p1');

const sortedByName = filterAndSortProfiles(mockProfiles, 'FABRIC', { sortBy: 'name' });
assert.equal(sortedByName[0].name, 'Alpha Tech');
assert.equal(sortedByName[1].name, 'Beta Fabric');

const sortedByLastPlayed = filterAndSortProfiles(mockProfiles, 'FABRIC', { sortBy: 'lastPlayed' });
assert.equal(sortedByLastPlayed[0].name, 'Beta Fabric', 'Beta Fabric had lastPlayed: 3000, should be first');
assert.equal(sortedByLastPlayed[1].name, 'Alpha Tech', 'Alpha Tech had lastPlayed: 1000, should be second');

const sortedByVersion = filterAndSortProfiles(mockProfiles, 'FABRIC', { sortBy: 'version' });
assert.equal(sortedByVersion[0].gameVersion, '1.21.4', 'Newer MC version 1.21.4 should be first');
assert.equal(sortedByVersion[1].gameVersion, '1.20.4', 'Older MC version 1.20.4 should be second');

// 3. Duplicate name validation tests
const validName = validateProfileName('Unique Instance', mockProfiles);
assert.equal(validName.valid, true);

const duplicateName = validateProfileName('Alpha Tech', mockProfiles);
assert.equal(duplicateName.valid, false);
assert.ok(duplicateName.error.includes('Alpha Tech'));

const duplicateCaseInsensitive = validateProfileName('alpha tech', mockProfiles);
assert.equal(duplicateCaseInsensitive.valid, false);

const emptyName = validateProfileName('   ', mockProfiles);
assert.equal(emptyName.valid, false);

const sameNameExcludingSelf = validateProfileName('Alpha Tech', mockProfiles, 'p1');
assert.equal(sameNameExcludingSelf.valid, true, 'Editing own profile name should not trigger duplicate error');

// 4. Migration and fallback tests
const legacyWithoutLoader = { id: 'old-1', name: 'My Old Forge World', gameVersion: '1.12.2' };
const migratedForge = sanitizeProfile(legacyWithoutLoader);
assert.equal(migratedForge.loader, 'FORGE', 'Should infer FORGE from profile name');

const legacyUnknown = { id: 'old-2', name: 'Survival World' };
const migratedDefault = sanitizeProfile(legacyUnknown);
assert.equal(migratedDefault.loader, 'FABRIC', 'Should fallback to default FABRIC loader');

const validProfile = { id: 'v1', name: 'Clean Neo', loader: 'NEOFORGE', gameVersion: '1.21.1', lastPlayed: 4567 };
const sanitizedValid = sanitizeProfile(validProfile);
assert.equal(sanitizedValid.loader, 'NEOFORGE', 'Should preserve existing valid loader');
assert.equal(sanitizedValid.lastPlayed, 4567, 'Should preserve existing lastPlayed timestamp');

const rawcraftProfile = { id: 'rc1', name: 'RAWCRAFT CLIENT // 26.2', loader: 'RAWCRAFT', gameVersion: '26.2' };
const sanitizedRawcraft = sanitizeProfile(rawcraftProfile);
assert.equal(sanitizedRawcraft.loader, 'RAWCRAFT', 'Should preserve RAWCRAFT loader');

console.log('loaderProfiles unit tests: ALL PASS');
