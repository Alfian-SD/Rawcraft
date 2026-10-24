import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

/**
 * Compute SHA1 hex digest of a buffer.
 */
function sha1(buffer) {
  return crypto.createHash('sha1').update(buffer).digest('hex');
}

/**
 * Fetch with timeout helper.
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(id);
  }
}

/**
 * Sleep helper for exponential backoff.
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Resolves the vanilla Minecraft version JSON.
 * Follows `inheritsFrom` if a custom loader profile is in use.
 * Downloads from Mojang's version manifest if missing locally.
 */
export async function resolveVanillaVersionJson(instanceDir, gameVersion, loader, customLoader, onLog) {
  const log = (msg) => onLog?.(msg);

  let baseVersion = gameVersion;

  if (customLoader) {
    const customJsonPath = path.join(instanceDir, 'versions', customLoader, `${customLoader}.json`);
    if (fs.existsSync(customJsonPath)) {
      try {
        const customProfile = JSON.parse(fs.readFileSync(customJsonPath, 'utf8'));
        if (customProfile.inheritsFrom) {
          baseVersion = customProfile.inheritsFrom;
          log(`[RawCraft/ASSETS]: Loader inheritsFrom resolved base version: ${baseVersion}`);
        }
      } catch (err) {
        log(`[RawCraft/WARN]: Failed to parse ${customJsonPath}: ${err.message}`);
      }
    }
  }

  // Check possible local locations for vanilla JSON
  const candidatePaths = [
    customLoader ? path.join(instanceDir, 'versions', customLoader, `${baseVersion}.json`) : null,
    path.join(instanceDir, 'versions', 'rawcraft', `${baseVersion}.json`),
    path.join(instanceDir, 'versions', 'fabric', `${baseVersion}.json`),
    path.join(instanceDir, 'versions', baseVersion, `${baseVersion}.json`),
  ].filter(Boolean);

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(candidate, 'utf8'));
        if (parsed.assetIndex && parsed.assetIndex.id) {
          log(`[RawCraft/ASSETS]: Found local vanilla version JSON for ${baseVersion} at ${candidate}`);
          return parsed;
        }
      } catch {
        // Corrupted file, fallback to download
      }
    }
  }

  // Not found locally: download from Mojang Version Manifest
  log(`[RawCraft/ASSETS]: Vanilla JSON for ${baseVersion} missing locally. Querying Mojang manifest...`);
  const manifestUrls = [
    'https://piston-meta.mojang.com/mc/game/version_manifest_v2.json',
    'https://launchermeta.mojang.com/mc/game/version_manifest_v2.json',
  ];

  let manifestData = null;
  for (const mUrl of manifestUrls) {
    try {
      const res = await fetchWithTimeout(mUrl, { headers: { 'User-Agent': 'RawCraftLauncher/1.0.0' } });
      if (res.ok) {
        manifestData = await res.json();
        break;
      }
    } catch {
      // Try next endpoint
    }
  }

  if (!manifestData || !Array.isArray(manifestData.versions)) {
    throw new Error(`Failed to fetch Mojang version manifest for ${baseVersion}. Check network connection.`);
  }

  const versionEntry = manifestData.versions.find((v) => v.id === baseVersion);
  if (!versionEntry || !versionEntry.url) {
    throw new Error(`Version ${baseVersion} not found in Mojang version manifest.`);
  }

  log(`[RawCraft/ASSETS]: Downloading vanilla version package for ${baseVersion} from ${versionEntry.url}`);
  const vRes = await fetchWithTimeout(versionEntry.url, { headers: { 'User-Agent': 'RawCraftLauncher/1.0.0' } });
  if (!vRes.ok) {
    throw new Error(`Failed to download version JSON for ${baseVersion}: HTTP ${vRes.status}`);
  }

  const vBuffer = Buffer.from(await vRes.arrayBuffer());
  const parsed = JSON.parse(vBuffer.toString('utf8'));

  // Save to target candidate paths
  for (const candidate of candidatePaths) {
    fs.mkdirSync(path.dirname(candidate), { recursive: true });
    const tmp = `${candidate}.tmp.${Date.now()}`;
    fs.writeFileSync(tmp, vBuffer);
    fs.renameSync(tmp, candidate);
  }

  log(`[RawCraft/ASSETS]: Cached vanilla version JSON for ${baseVersion}`);
  return parsed;
}

/**
 * Atomic file writer: writes to a unique temporary file then renames.
 */
function atomicWrite(targetPath, buffer) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  const tmp = `${targetPath}.tmp.${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  fs.writeFileSync(tmp, buffer);
  fs.renameSync(tmp, targetPath);
}

/**
 * Download a file with retries, exponential backoff, atomic write, and SHA1/size validation.
 */
async function downloadVerifiedFile(url, targetPath, expectedSize, expectedSha1) {
  const maxAttempts = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetchWithTimeout(url, { headers: { 'User-Agent': 'RawCraftLauncher/1.0.0' } }, 15000);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }

      const buffer = Buffer.from(await res.arrayBuffer());

      if (expectedSize !== undefined && expectedSize !== null && buffer.length !== expectedSize) {
        throw new Error(`Size mismatch: expected ${expectedSize} bytes, got ${buffer.length} bytes`);
      }

      if (expectedSha1) {
        const actualSha1 = sha1(buffer);
        if (actualSha1.toLowerCase() !== expectedSha1.toLowerCase()) {
          throw new Error(`SHA1 mismatch: expected ${expectedSha1}, got ${actualSha1}`);
        }
      }

      atomicWrite(targetPath, buffer);
      return buffer;
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        await sleep(Math.pow(2, attempt) * 150);
      }
    }
  }

  throw new Error(`Failed to download ${url} after ${maxAttempts} attempts: ${lastError?.message}`);
}

/**
 * Ensures all assets for an instance are verified and present on disk before launch.
 * - Resolves the real asset index ID from vanilla version JSON.
 * - Downloads index JSON if missing or SHA1 mismatch.
 * - Compares all objects in the index against disk.
 * - Downloads missing or corrupted objects with 16 parallel workers and retry backoff.
 * - Ensures MCLC compatibility aliases.
 */
export async function ensureAssets(instanceDir, vanillaVersionJson, customLoader, onLog, onProgress) {
  const log = (msg) => onLog?.(msg);

  const assetIndex = vanillaVersionJson.assetIndex;
  if (!assetIndex || !assetIndex.id) {
    throw new Error('Vanilla version JSON has no valid assetIndex object.');
  }

  const realAssetIndexId = String(assetIndex.id);
  const indexUrl = assetIndex.url;
  const expectedIndexSha1 = assetIndex.sha1;
  const expectedIndexSize = assetIndex.size;

  log(`[RawCraft/ASSETS]: Real assetIndex.id resolved: "${realAssetIndexId}"`);

  const assetsDir = path.join(instanceDir, 'assets');
  const indexesDir = path.join(assetsDir, 'indexes');
  const objectsDir = path.join(assetsDir, 'objects');
  fs.mkdirSync(indexesDir, { recursive: true });
  fs.mkdirSync(objectsDir, { recursive: true });

  const realIndexPath = path.join(indexesDir, `${realAssetIndexId}.json`);

  // 1. Verify / Download Real Index File
  let indexNeedsDownload = true;
  if (fs.existsSync(realIndexPath)) {
    try {
      const existingBuf = fs.readFileSync(realIndexPath);
      if (
        (!expectedIndexSize || existingBuf.length === expectedIndexSize) &&
        (!expectedIndexSha1 || sha1(existingBuf) === expectedIndexSha1)
      ) {
        indexNeedsDownload = false;
      }
    } catch {
      indexNeedsDownload = true;
    }
  }

  let indexBuf = null;
  if (indexNeedsDownload) {
    if (!indexUrl) {
      throw new Error(`Asset index ${realAssetIndexId} missing on disk and no download URL available.`);
    }
    log(`[RawCraft/ASSETS]: Downloading asset index ${realAssetIndexId} from ${indexUrl}...`);
    indexBuf = await downloadVerifiedFile(indexUrl, realIndexPath, expectedIndexSize, expectedIndexSha1);
  } else {
    indexBuf = fs.readFileSync(realIndexPath);
  }

  // 2. MCLC Compatibility Alias
  // MCLC handler.js uses: const assetId = this.options.version.custom || this.options.version.number
  const mclcExpectedId = customLoader || vanillaVersionJson.id;
  if (mclcExpectedId && mclcExpectedId !== realAssetIndexId) {
    const mclcIndexPath = path.join(indexesDir, `${mclcExpectedId}.json`);
    try {
      atomicWrite(mclcIndexPath, indexBuf);
    } catch (err) {
      log(`[RawCraft/WARN]: Failed to write MCLC index alias ${mclcExpectedId}.json: ${err.message}`);
    }
  }

  // 3. Final verification of real index existence
  if (!fs.existsSync(realIndexPath)) {
    throw new Error(`Asset index ${realAssetIndexId} missing at ${realIndexPath}`);
  }

  // 4. Parse Index and verify objects
  const indexData = JSON.parse(indexBuf.toString('utf8'));
  const objects = indexData.objects || {};
  const objectEntries = Object.entries(objects);
  const totalObjects = objectEntries.length;

  log(`[RawCraft/ASSETS]: Verifying ${totalObjects} objects against disk cache...`);

  const missingOrCorrupt = [];
  for (const [name, obj] of objectEntries) {
    const hash = obj.hash;
    const subhash = hash.substring(0, 2);
    const targetFile = path.join(objectsDir, subhash, hash);

    if (!fs.existsSync(targetFile)) {
      missingOrCorrupt.push({ name, hash, subhash, size: obj.size, targetFile });
      continue;
    }

    try {
      const stat = fs.statSync(targetFile);
      if (stat.size !== obj.size) {
        missingOrCorrupt.push({ name, hash, subhash, size: obj.size, targetFile });
      }
    } catch {
      missingOrCorrupt.push({ name, hash, subhash, size: obj.size, targetFile });
    }
  }

  if (missingOrCorrupt.length === 0) {
    log(`[RawCraft/ASSETS]: Assets OK, nothing to download (${totalObjects}/${totalObjects} verified).`);
    return {
      realAssetIndexId,
      realIndexPath,
      totalObjects,
      downloaded: 0,
      missing: 0,
    };
  }

  log(`[RawCraft/ASSETS]: Detected ${missingOrCorrupt.length} missing/corrupt objects out of ${totalObjects}. Beginning download...`);

  // 5. Download missing/corrupt objects with concurrency pool (16 parallel workers)
  const CONCURRENCY = 16;
  let downloadedCount = 0;
  let totalBytes = missingOrCorrupt.reduce((sum, item) => sum + (item.size || 0), 0);
  let downloadedBytes = 0;
  const startTime = Date.now();

  const queue = [...missingOrCorrupt];
  const failures = [];

  async function worker() {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;

      const url = `https://resources.download.minecraft.net/${item.subhash}/${item.hash}`;
      try {
        await downloadVerifiedFile(url, item.targetFile, item.size, item.hash);
        downloadedCount++;
        downloadedBytes += item.size || 0;

        const elapsedSec = (Date.now() - startTime) / 1000 || 0.1;
        const speedKbps = Math.round((downloadedBytes / 1024) / elapsedSec);

        onProgress?.({
          type: 'assets',
          task: `Downloading assets ${downloadedCount}/${missingOrCorrupt.length} (${speedKbps} KB/s)`,
          total: missingOrCorrupt.length,
          current: downloadedCount,
          percent: Math.round((downloadedCount / missingOrCorrupt.length) * 100),
        });
      } catch (err) {
        failures.push({ item, error: err.message });
      }
    }
  }

  const workers = Array.from({ length: Math.min(CONCURRENCY, missingOrCorrupt.length) }, () => worker());
  await Promise.all(workers);

  if (failures.length > 0) {
    throw new Error(`Failed to download ${failures.length} asset objects. First error: ${failures[0].error}`);
  }

  log(`[RawCraft/ASSETS]: Download complete. ${downloadedCount} objects synchronized successfully.`);

  return {
    realAssetIndexId,
    realIndexPath,
    totalObjects,
    downloaded: downloadedCount,
    missing: 0,
  };
}
