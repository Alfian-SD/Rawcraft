import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { ensureRawCraftClientMod } from '../server/engine.mjs';

console.log('Running rawcraftClientInjection unit tests...');

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rawcraft-client-test-'));
const modsDir = path.join(tempDir, 'mods');

try {
  // Test 1: Injection copies jar to mods/
  const logs = [];
  ensureRawCraftClientMod(tempDir, true, (msg) => logs.push(msg));

  const targetJar = path.join(modsDir, 'rawcraft-client.jar');
  assert(fs.existsSync(targetJar), 'rawcraft-client.jar should be present in mods/');
  assert(fs.statSync(targetJar).size > 1000, 'rawcraft-client.jar should not be empty');

  // Test 2: Disable renames to .disabled
  ensureRawCraftClientMod(tempDir, false, (msg) => logs.push(msg));
  const disabledJar = path.join(modsDir, 'rawcraft-client.jar.disabled');
  assert(!fs.existsSync(targetJar), 'rawcraft-client.jar should no longer exist when disabled');
  assert(fs.existsSync(disabledJar), 'rawcraft-client.jar.disabled should exist');

  // Test 3: Re-enable restores the jar
  ensureRawCraftClientMod(tempDir, true, (msg) => logs.push(msg));
  assert(fs.existsSync(targetJar), 'rawcraft-client.jar should be restored when re-enabled');
  assert(!fs.existsSync(disabledJar), 'rawcraft-client.jar.disabled should no longer exist');

  // Test 4: Does not affect other mods
  const otherMod = path.join(modsDir, 'sodium-fabric-mc1.21.4.jar');
  fs.writeFileSync(otherMod, 'dummy-mod-content');
  ensureRawCraftClientMod(tempDir, true, (msg) => logs.push(msg));
  assert(fs.existsSync(otherMod), 'Other user mods must be preserved completely untouched');
  assert.strictEqual(fs.readFileSync(otherMod, 'utf8'), 'dummy-mod-content');

  console.log('rawcraftClientInjection tests: ALL PASS');
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
