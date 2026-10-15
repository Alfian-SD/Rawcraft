import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs';
import {
  getInstancePath,
  listInstanceFiles,
  toggleInstanceFile,
} from '../server/engine.mjs';

console.log('Running v2 integration tests...');

const testInstanceId = 'test-inst-01';
const modsDir = getInstancePath(testInstanceId, 'mods');

// Setup dummy test files
const dummyMod1 = path.join(modsDir, 'sodium-test.jar');
const dummyMod2 = path.join(modsDir, 'lithium-test.jar.disabled');
fs.writeFileSync(dummyMod1, 'dummy-jar-content');
fs.writeFileSync(dummyMod2, 'dummy-jar-content-2');

// 1. Check listInstanceFiles
const files = listInstanceFiles(testInstanceId, 'mods');
assert(Array.isArray(files), 'files must be an array');
assert(files.some((f) => f.fileName === 'sodium-test.jar' && f.enabled === true), 'sodium-test.jar must be enabled');
assert(files.some((f) => f.fileName === 'lithium-test.jar.disabled' && f.enabled === false), 'lithium-test.jar.disabled must be disabled');

// 2. Check toggleInstanceFile
const toggleRes1 = toggleInstanceFile(testInstanceId, 'mods', 'sodium-test.jar');
assert.strictEqual(toggleRes1.newName, 'sodium-test.jar.disabled', 'should rename to .disabled');
assert.strictEqual(toggleRes1.enabled, false, 'enabled should now be false');

const toggleRes2 = toggleInstanceFile(testInstanceId, 'mods', 'sodium-test.jar.disabled');
assert.strictEqual(toggleRes2.newName, 'sodium-test.jar', 'should rename back to .jar');
assert.strictEqual(toggleRes2.enabled, true, 'enabled should now be true');

// Clean up test files
fs.rmSync(getInstancePath(testInstanceId), { recursive: true, force: true });

console.log('v2 integration tests: ALL PASS');
