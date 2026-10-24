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

  // 0. RAWCRAFT CLIENT LOADER
  if (loader === 'RAWCRAFT') {
    const targetDir = path.join(versionsDir, 'rawcraft');
    const targetJson = path.join(targetDir, 'rawcraft.json');

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const fabricDir = path.join(versionsDir, 'fabric');
    const fabricJson = path.join(fabricDir, 'fabric.json');

    if (fs.existsSync(targetJson)) {
      try {
        const existing = JSON.parse(fs.readFileSync(targetJson, 'utf8'));
        if (existing.inheritsFrom === gameVersion) {
          log(`[RawCraft/LOADER]: Using existing RawCraft client profile for MC ${gameVersion}`);
          const vanillaInRawcraft = path.join(targetDir, `${gameVersion}.json`);
          const vanillaInFabric = path.join(fabricDir, `${gameVersion}.json`);
          if (!fs.existsSync(vanillaInRawcraft) && fs.existsSync(vanillaInFabric)) {
            fs.copyFileSync(vanillaInFabric, vanillaInRawcraft);
          }
          return 'rawcraft';
        }
      } catch {
        // Corrupted, regenerate
      }
    }

    log(`[RawCraft/LOADER]: Initializing RawCraft dedicated client engine for Minecraft ${gameVersion}...`);

    let profileData = null;
    if (fs.existsSync(fabricJson)) {
      try {
        const existingFabric = JSON.parse(fs.readFileSync(fabricJson, 'utf8'));
        if (existingFabric.inheritsFrom === gameVersion) {
          profileData = JSON.parse(JSON.stringify(existingFabric));
          log(`[RawCraft/LOADER]: Re-purposing optimized runtime dependencies for RawCraft engine`);
        }
      } catch {
        // Fall back to meta download
      }
    }

    if (!profileData) {
      let lVer = loaderVersion?.trim();
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
          log(`[RawCraft/WARN]: Failed to query loader versions: ${err.message}`);
        }
      }
      const finalLoaderVer = lVer || '0.20.0';
      const profileUrl = `https://meta.fabricmc.net/v2/versions/loader/${encodeURIComponent(gameVersion)}/${encodeURIComponent(finalLoaderVer)}/profile/json`;
      const res = await fetch(profileUrl);
      if (res.ok) {
        profileData = await res.json();
      } else {
        const fallbackUrl = `https://meta.fabricmc.net/v2/versions/loader/${encodeURIComponent(gameVersion)}/0.20.0/profile/json`;
        const fbRes = await fetch(fallbackUrl);
        if (!fbRes.ok) {
          throw new Error(`Failed to resolve runtime libraries for Minecraft ${gameVersion}`);
        }
        profileData = await fbRes.json();
      }
    }

    profileData.id = `rawcraft-client-${gameVersion}`;
    profileData.inheritsFrom = gameVersion;
    profileData.type = 'release';
    profileData.mainClass = 'net.fabricmc.loader.impl.launch.knot.KnotClient';
    if (!profileData.arguments) profileData.arguments = {};
    if (!Array.isArray(profileData.arguments.jvm)) profileData.arguments.jvm = [];
    if (!profileData.arguments.jvm.some(arg => typeof arg === 'string' && arg.includes('FabricMcEmu'))) {
      profileData.arguments.jvm.push('-DFabricMcEmu= net.minecraft.client.main.Main ');
    }

    fs.writeFileSync(targetJson, JSON.stringify(profileData, null, 2));

    const vanillaInRawcraft = path.join(targetDir, `${gameVersion}.json`);
    const vanillaInFabric = path.join(fabricDir, `${gameVersion}.json`);
    if (!fs.existsSync(vanillaInRawcraft) && fs.existsSync(vanillaInFabric)) {
      fs.copyFileSync(vanillaInFabric, vanillaInRawcraft);
    }

    log(`[RawCraft/LOADER]: Dedicated RawCraft client profile saved to versions/rawcraft/rawcraft.json`);
    return 'rawcraft';
  }

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

    const finalLoaderVer = lVer || '0.20.0';
    const profileUrl = `https://meta.fabricmc.net/v2/versions/loader/${encodeURIComponent(gameVersion)}/${encodeURIComponent(finalLoaderVer)}/profile/json`;
    log(`[RawCraft/LOADER]: Downloading Fabric profile from ${profileUrl}`);

    const res = await fetch(profileUrl);
    if (!res.ok) {
      // Fallback: try latest general loader version
      const fallbackUrl = `https://meta.fabricmc.net/v2/versions/loader/${encodeURIComponent(gameVersion)}/0.20.0/profile/json`;
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
