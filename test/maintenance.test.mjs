import assert from 'node:assert/strict';
import {
  OPEN_CONFIG,
  parseMaintenanceConfig,
  isAppLocked,
  isViewLocked,
  viewLabel,
} from '../src/utils/maintenance.ts';

// 1. Fallback safety: null/undefined/garbage falls back to open
assert.deepEqual(parseMaintenanceConfig(null), OPEN_CONFIG);
assert.deepEqual(parseMaintenanceConfig(undefined), OPEN_CONFIG);
assert.deepEqual(parseMaintenanceConfig('not json'), OPEN_CONFIG);
assert.deepEqual(parseMaintenanceConfig([]), OPEN_CONFIG);

// 2. Normal whole-app lock
const fullLock = parseMaintenanceConfig({
  enabled: true,
  title: 'Perawatan Server',
  message: 'Upgrade database berlangsung.',
  eta: '2026-10-24T18:00:00Z',
  lockedViews: [],
});
assert.equal(fullLock.enabled, true);
assert.equal(fullLock.title, 'Perawatan Server');
assert.equal(fullLock.eta, '2026-10-24T18:00:00Z');
assert.equal(isAppLocked(fullLock), true);
assert.equal(isViewLocked(fullLock, 'STORE'), false); // whole app covers it

// 3. Tab-level locking (e.g. STORE and PROFILES down, rest open)
const tabLock = parseMaintenanceConfig({
  enabled: false,
  lockedViews: ['store', 'PROFILES', 'bogus-view'],
});
assert.equal(isAppLocked(tabLock), false);
assert.equal(isViewLocked(tabLock, 'STORE'), true);
assert.equal(isViewLocked(tabLock, 'PROFILES'), true);
assert.equal(isViewLocked(tabLock, 'HERO'), false);
assert.deepEqual(tabLock.lockedViews, ['STORE', 'PROFILES']); // unknown discarded, normalized

// 4. Bad ETA drops to null, bad message falls back
const badEta = parseMaintenanceConfig({ enabled: true, eta: 'tomorrow at 5' });
assert.equal(badEta.eta, null);

// 5. Human labels
assert.equal(viewLabel('STORE'), 'Instal Mod');
assert.equal(viewLabel('HERO'), 'Beranda');
assert.equal(viewLabel('CONSOLE'), 'Konsol');

console.log('maintenance tests: ALL PASS');
