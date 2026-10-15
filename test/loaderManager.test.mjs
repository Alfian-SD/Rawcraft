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

// Clean up
fs.rmSync(testInstanceDir, { recursive: true, force: true });

console.log('loaderManager tests: ALL PASS');
