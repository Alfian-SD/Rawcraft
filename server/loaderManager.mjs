import fs from 'node:fs';
import path from 'node:path';

export async function ensureLoaderProfile(
  instanceDir,
  gameVersion,
  loader,
  loaderVersion,
  onLog
) {
  const log = (msg) => {
    if (onLog) onLog(msg);
  };

  if (!loader || loader === 'VANILLA') {
    return null;
  }

  const versionsDir = path.join(instanceDir, 'versions');
  if (!fs.existsSync(versionsDir)) {
    fs.mkdirSync(versionsDir, { recursive: true });
  }

  const loaderKey = loader.toLowerCase();

  // 1. FABRIC
  if (loader === 'FABRIC') {
    const targetDir = path.join(versionsDir, 'fabric');
    const targetJson = path.join(targetDir, 'fabric.json');

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    let lVer = loaderVersion?.trim();

    // If profile json already exists, check if we need to regenerate
    if (fs.existsSync(targetJson)) {
      try {
        const existing = JSON.parse(fs.readFileSync(targetJson, 'utf8'));
        if (existing.inheritsFrom === gameVersion && (!lVer || existing.id?.includes(lVer))) {
          log(`[RawCraft/LOADER]: Using existing Fabric profile for MC ${gameVersion}`);
          return 'fabric';
        }
      } catch {
        // Corrupted file, re-fetch
      }
    }

    log(`[RawCraft/LOADER]: Resolving Fabric profile for Minecraft ${gameVersion}...`);

    if (!lVer) {
      try {
        const metaRes = await fetch(`https://meta.fabricmc.net/v2/versions/loader/${encodeURIComponent(gameVersion)}`);
        if (metaRes.ok) {
          const list = await metaRes.json();
          if (Array.isArray(list) && list.length > 0) {
            lVer = list[0].loader?.version;
          }
        }
      } catch (err) {
        log(`[RawCraft/WARN]: Failed to query Fabric loader versions: ${err.message}`);
      }
    }

    const finalLoaderVer = lVer || '0.16.9';
    const profileUrl = `https://meta.fabricmc.net/v2/versions/loader/${encodeURIComponent(gameVersion)}/${encodeURIComponent(finalLoaderVer)}/profile/json`;
    log(`[RawCraft/LOADER]: Downloading Fabric profile from ${profileUrl}`);

    const res = await fetch(profileUrl);
    if (!res.ok) {
      // Fallback: try latest general loader version
      const fallbackUrl = `https://meta.fabricmc.net/v2/versions/loader/${encodeURIComponent(gameVersion)}/0.16.10/profile/json`;
      const fallbackRes = await fetch(fallbackUrl);
      if (!fallbackRes.ok) {
        throw new Error(`Fabric Meta API returned HTTP ${res.status} for MC ${gameVersion}. Verify Minecraft version.`);
      }
      const data = await fallbackRes.json();
      fs.writeFileSync(targetJson, JSON.stringify(data, null, 2));
      log(`[RawCraft/LOADER]: Fabric profile saved to versions/fabric/fabric.json`);
      return 'fabric';
    }

    const data = await res.json();
    fs.writeFileSync(targetJson, JSON.stringify(data, null, 2));
    log(`[RawCraft/LOADER]: Fabric profile (${finalLoaderVer}) saved to versions/fabric/fabric.json`);
    return 'fabric';
  }

  // 2. QUILT
  if (loader === 'QUILT') {
    const targetDir = path.join(versionsDir, 'quilt');
    const targetJson = path.join(targetDir, 'quilt.json');

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    let lVer = loaderVersion?.trim();

    if (fs.existsSync(targetJson)) {
      try {
        const existing = JSON.parse(fs.readFileSync(targetJson, 'utf8'));
        if (existing.inheritsFrom === gameVersion && (!lVer || existing.id?.includes(lVer))) {
          log(`[RawCraft/LOADER]: Using existing Quilt profile for MC ${gameVersion}`);
          return 'quilt';
        }
      } catch {
        // Corrupted, re-fetch
      }
    }

    log(`[RawCraft/LOADER]: Resolving Quilt profile for Minecraft ${gameVersion}...`);

    if (!lVer) {
      try {
        const metaRes = await fetch(`https://meta.quiltmc.org/v3/versions/loader/${encodeURIComponent(gameVersion)}`);
        if (metaRes.ok) {
          const list = await metaRes.json();
          if (Array.isArray(list) && list.length > 0) {
            lVer = list[0].loader?.version;
          }
        }
      } catch (err) {
        log(`[RawCraft/WARN]: Failed to query Quilt loader versions: ${err.message}`);
      }
    }

    const finalLoaderVer = lVer || '0.26.1';
    const profileUrl = `https://meta.quiltmc.org/v3/versions/loader/${encodeURIComponent(gameVersion)}/${encodeURIComponent(finalLoaderVer)}/profile/json`;
    log(`[RawCraft/LOADER]: Downloading Quilt profile from ${profileUrl}`);

    const res = await fetch(profileUrl);
    if (!res.ok) {
      throw new Error(`Quilt Meta API returned HTTP ${res.status} for MC ${gameVersion}.`);
    }

    const data = await res.json();
    fs.writeFileSync(targetJson, JSON.stringify(data, null, 2));
    log(`[RawCraft/LOADER]: Quilt profile (${finalLoaderVer}) saved to versions/quilt/quilt.json`);
    return 'quilt';
  }

  // 3. FORGE / NEOFORGE
  if (loader === 'FORGE' || loader === 'NEOFORGE') {
    const targetDir = path.join(versionsDir, 'forge');
    const targetJson = path.join(targetDir, 'forge.json');
    if (fs.existsSync(targetJson)) {
      return 'forge';
    }
    // If not on disk, return null so MCLC falls back or notifies
    log(`[RawCraft/LOADER]: Note: Custom Forge profile not found at versions/forge/forge.json. Launching base version.`);
    return null;
  }

  return null;
}
