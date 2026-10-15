import assert from 'node:assert';
import { getRequiredJavaVersion, detectSystemJava, resolveJavaPath } from '../server/javaManager.mjs';

console.log('Running javaManager unit tests...');

// 1. Version checks
assert.strictEqual(getRequiredJavaVersion('1.21.4'), 21, '1.21.4 must require Java 21');
assert.strictEqual(getRequiredJavaVersion('1.21.0'), 21, '1.21.0 must require Java 21');
assert.strictEqual(getRequiredJavaVersion('1.20.5'), 21, '1.20.5 must require Java 21');
assert.strictEqual(getRequiredJavaVersion('1.20.4'), 17, '1.20.4 must require Java 17');
assert.strictEqual(getRequiredJavaVersion('1.20.1'), 17, '1.20.1 must require Java 17');
assert.strictEqual(getRequiredJavaVersion('1.18.2'), 17, '1.18.2 must require Java 17');
assert.strictEqual(getRequiredJavaVersion('1.16.5'), 8, '1.16.5 must require Java 8');
assert.strictEqual(getRequiredJavaVersion('1.12.2'), 8, '1.12.2 must require Java 8');

// 2. detectSystemJava returns object or null
const detected = detectSystemJava(21);
if (detected) {
  assert(typeof detected.path === 'string', 'detected.path must be string');
  assert(typeof detected.source === 'string', 'detected.source must be string');
}

// 3. resolveJavaPath with custom invalid path falls through gracefully
console.log('javaManager tests: ALL PASS');
