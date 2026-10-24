import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ensureLoaderProfile } from '../server/loaderManager.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testInstanceDir = path.join(__dirname, 'temp-instance-test');

console.log('Running loaderManager unit tests...');

// 1. VANILLA returns null
const vanillaResult = await ensureLoaderProfile(testInstanceDir, '1.21.4', 'VANILLA');
assert.strictEqual(vanillaResult, null, 'Vanilla should return null');

// 2. FABRIC generates versions/fabric/fabric.json
const fabricResult = await ensureLoaderProfile(
  testInstanceDir,
  '1.21.4',
  'FABRIC',
  '0.16.9',
  (m) => console.log('Test Log:', m)
);

assert.strictEqual(fabricResult, 'fabric', 'Fabric should return "fabric"');
const jsonPath = path.join(testInstanceDir, 'versions', 'fabric', 'fabric.json');
assert(fs.existsSync(jsonPath), 'versions/fabric/fabric.json must exist');

const parsed = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
assert.strictEqual(parsed.inheritsFrom, '1.21.4', 'inheritsFrom must be 1.21.4');
assert(Array.isArray(parsed.libraries), 'libraries must be an array');
assert(parsed.libraries.length > 0, 'libraries must not be empty');

// 3. RAWCRAFT generates versions/rawcraft/rawcraft.json
const rawcraftResult = await ensureLoaderProfile(
  testInstanceDir,
  '26.2',
  'RAWCRAFT',
  '1.0.0',
  (m) => console.log('Test Log:', m)
);

assert.strictEqual(rawcraftResult, 'rawcraft', 'RawCraft should return "rawcraft"');
const rawcraftJsonPath = path.join(testInstanceDir, 'versions', 'rawcraft', 'rawcraft.json');
assert(fs.existsSync(rawcraftJsonPath), 'versions/rawcraft/rawcraft.json must exist');

const parsedRawcraft = JSON.parse(fs.readFileSync(rawcraftJsonPath, 'utf8'));
assert.strictEqual(parsedRawcraft.inheritsFrom, '26.2', 'inheritsFrom must be 26.2');
assert.strictEqual(parsedRawcraft.mainClass, 'net.fabricmc.loader.impl.launch.knot.KnotClient');

// Clean up
fs.rmSync(testInstanceDir, { recursive: true, force: true });

console.log('loaderManager tests: ALL PASS');
