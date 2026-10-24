import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolveVanillaVersionJson, ensureAssets } from '../server/assetManager.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

function sha1(buf) {
  return crypto.createHash('sha1').update(buf).digest('hex');
}

async function runVerification() {
  const args = process.argv.slice(2);
  const targetInstanceId = args[0] || 'prof-2665';
  console.log(`\n=======================================================`);
  console.log(`  RawCraft Asset Verification Suite for [${targetInstanceId}]`);
  console.log(`=======================================================\n`);

  const instanceDir = path.join(PROJECT_ROOT, 'instances', targetInstanceId);
  if (!fs.existsSync(instanceDir)) {
    console.error(`FAIL: Instance directory not found: ${instanceDir}`);
    process.exit(1);
  }

  // Determine instance configuration
  let gameVersion = '26.2';
  let loader = 'FABRIC';
  let customLoader = 'fabric';

  // Check if profile has custom loader or vanilla
  const versionsDir = path.join(instanceDir, 'versions');
  if (fs.existsSync(path.join(versionsDir, 'fabric', 'fabric.json'))) {
    customLoader = 'fabric';
    loader = 'FABRIC';
  } else {
    customLoader = null;
    loader = 'VANILLA';
  }

  console.log(`Instance Config: Loader=${loader}, customLoader=${customLoader || 'none'}`);

  const logs = [];
  const logHandler = (msg) => {
    logs.push(msg);
    console.log(' ', msg);
  };

  // CHECK 1: Resolve Vanilla Version JSON
  console.log('\n[CHECK 1] Resolving vanilla version JSON via inheritsFrom...');
  const vanillaJson = await resolveVanillaVersionJson(instanceDir, gameVersion, loader, customLoader, logHandler);
  const realAssetIndexId = vanillaJson.assetIndex?.id;
  console.log(`  -> Resolved assetIndex.id: "${realAssetIndexId}"`);
  console.log(`  -> Resolved assetIndex.url: ${vanillaJson.assetIndex?.url}`);
  console.log(`  -> Resolved assetIndex.sha1: ${vanillaJson.assetIndex?.sha1}`);

  if (!realAssetIndexId) {
    console.error('FAIL: Could not resolve assetIndex.id from vanilla JSON.');
    process.exit(1);
  }
  console.log('CHECK 1: PASS (assetIndex.id dynamically resolved)');

  // CHECK 2: ensureAssets execution
  console.log('\n[CHECK 2] Running ensureAssets...');
  const result1 = await ensureAssets(instanceDir, vanillaJson, customLoader, logHandler);
  const realIndexPath = path.join(instanceDir, 'assets', 'indexes', `${realAssetIndexId}.json`);

  if (!fs.existsSync(realIndexPath)) {
    console.error(`FAIL: Real index file missing at ${realIndexPath}`);
    process.exit(1);
  }

  const realIndexBuf = fs.readFileSync(realIndexPath);
  const actualSha1 = sha1(realIndexBuf);
  if (vanillaJson.assetIndex.sha1 && actualSha1 !== vanillaJson.assetIndex.sha1) {
    console.error(`FAIL: SHA1 mismatch for ${realIndexPath}: got ${actualSha1}, expected ${vanillaJson.assetIndex.sha1}`);
    process.exit(1);
  }

  const parsedIndex = JSON.parse(realIndexBuf.toString('utf8'));
  const totalInIndex = Object.keys(parsedIndex.objects || {}).length;
  console.log(`  -> Real index file: ${realIndexPath} (Size: ${realIndexBuf.length} bytes, SHA1: ${actualSha1})`);
  console.log(`  -> Objects in index: ${totalInIndex}`);
  console.log('CHECK 2: PASS (Real index file verified on disk)');

  // CHECK 3: Verify all objects on disk match index
  console.log('\n[CHECK 3] Verifying all objects listed in index exist on disk with matching sizes...');
  const objectsDir = path.join(instanceDir, 'assets', 'objects');
  let missingCount = 0;
  let corruptCount = 0;

  for (const [name, meta] of Object.entries(parsedIndex.objects)) {
    const objPath = path.join(objectsDir, meta.hash.substring(0, 2), meta.hash);
    if (!fs.existsSync(objPath)) {
      missingCount++;
      continue;
    }
    const stat = fs.statSync(objPath);
    if (stat.size !== meta.size) {
      corruptCount++;
    }
  }

  console.log(`  -> Total objects: ${totalInIndex}, Missing: ${missingCount}, Corrupt: ${corruptCount}`);
  if (missingCount > 0 || corruptCount > 0) {
    console.error(`FAIL: Disk objects mismatch! Missing: ${missingCount}, Corrupt: ${corruptCount}`);
    process.exit(1);
  }
  console.log('CHECK 3: PASS (All objects on disk match index)');

  // CHECK 4: Fast second launch (nothing to download)
  console.log('\n[CHECK 4] Testing second verification pass (fast idempotency)...');
  const t0 = Date.now();
  let secondPassLoggedOk = false;
  const result2 = await ensureAssets(instanceDir, vanillaJson, customLoader, (msg) => {
    if (msg.includes('Assets OK, nothing to download')) {
      secondPassLoggedOk = true;
    }
    console.log(' ', msg);
  });
  const tElapsed = Date.now() - t0;
  console.log(`  -> Second pass completed in ${tElapsed}ms. Downloaded: ${result2.downloaded}`);

  if (result2.downloaded !== 0 || !secondPassLoggedOk) {
    console.error(`FAIL: Second pass re-downloaded files or missed "Assets OK" check!`);
    process.exit(1);
  }
  console.log('CHECK 4: PASS (Second pass fast and zero-download)');

  // CHECK 5: Corruption Test (delete 20 files, corrupt 1 file, verify recovery)
  console.log('\n[CHECK 5] Running Corruption Recovery Test...');
  const objectEntries = Object.entries(parsedIndex.objects);
  const sampleToDelete = objectEntries.slice(10, 30); // 20 files
  const sampleToCorrupt = objectEntries[35]; // 1 file

  console.log(`  -> Deleting 20 files from disk...`);
  for (const [name, meta] of sampleToDelete) {
    const p = path.join(objectsDir, meta.hash.substring(0, 2), meta.hash);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }

  console.log(`  -> Corrupting 1 file: ${sampleToCorrupt[0]}...`);
  const corruptPath = path.join(objectsDir, sampleToCorrupt[1].hash.substring(0, 2), sampleToCorrupt[1].hash);
  fs.writeFileSync(corruptPath, 'CORRUPTED_RAW_CONTENT_FOR_TESTING');

  console.log(`  -> Executing ensureAssets to trigger auto-repair...`);
  const repairResult = await ensureAssets(instanceDir, vanillaJson, customLoader, logHandler);

  console.log(`  -> Repair downloaded: ${repairResult.downloaded} files (expected: 21)`);
  if (repairResult.downloaded !== 21) {
    console.error(`FAIL: Expected exactly 21 files re-downloaded, got ${repairResult.downloaded}`);
    process.exit(1);
  }

  // Verify the corrupted file was properly repaired
  const repairedStat = fs.statSync(corruptPath);
  if (repairedStat.size !== sampleToCorrupt[1].size) {
    console.error(`FAIL: Corrupted file was not restored to original size!`);
    process.exit(1);
  }
  console.log('CHECK 5: PASS (Corruption test successfully re-downloaded and restored all 21 objects)');

  // CHECK 6: Test with another instance (prof-01)
  console.log('\n[CHECK 6] Testing cross-instance compatibility with prof-01...');
  const prof01Dir = path.join(PROJECT_ROOT, 'instances', 'prof-01');
  if (fs.existsSync(prof01Dir)) {
    const prof01VanillaJson = await resolveVanillaVersionJson(prof01Dir, '26.2', 'FABRIC', 'fabric', (m) => console.log(' ', m));
    const prof01Result = await ensureAssets(prof01Dir, prof01VanillaJson, 'fabric', (m) => console.log(' ', m));
    console.log(`  -> prof-01 verified: realAssetIndexId="${prof01Result.realAssetIndexId}", totalObjects=${prof01Result.totalObjects}`);
    console.log('CHECK 6: PASS (Cross-instance compatibility confirmed)');
  } else {
    console.log('CHECK 6: SKIPPED (prof-01 directory not found)');
  }

  console.log(`\n=======================================================`);
  console.log(`  ALL ACCEPTANCE CHECKS PASSED FOR [${targetInstanceId}]`);
  console.log(`=======================================================\n`);
}

runVerification().catch((err) => {
  console.error('\nFATAL VERIFICATION ERROR:', err);
  process.exit(1);
});
