import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import AdmZip from 'adm-zip';
import mclc from 'minecraft-launcher-core';
import {
  resolveJavaPath,
  detectSystemJava,
  getRequiredJavaVersion,
} from './javaManager.mjs';
import { ensureLoaderProfile } from './loaderManager.mjs';
import { resolveVanillaVersionJson, ensureAssets } from './assetManager.mjs';

const { Client, Authenticator } = mclc;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const INSTANCES_ROOT = path.join(PROJECT_ROOT, 'instances');

// Ensure root instances directory
if (!fs.existsSync(INSTANCES_ROOT)) {
  fs.mkdirSync(INSTANCES_ROOT, { recursive: true });
}

// Active SSE client connections
const sseClients = new Set();
let activeChildProcess = null;

export function broadcastEvent(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of sseClients) {
    try {
      res.write(payload);
    } catch {
      sseClients.delete(res);
    }
  }
}

export function getInstancePath(instanceId, subfolder = '') {
  const safeId = instanceId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const target = path.join(INSTANCES_ROOT, safeId, subfolder);
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
  return target;
}

export function listInstanceFiles(instanceId, subfolder) {
  const validFolders = ['mods', 'resourcepacks', 'shaderpacks'];
  const folder = validFolders.includes(subfolder) ? subfolder : 'mods';
  const dir = getInstancePath(instanceId, folder);
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir);
  return files.map((fileName) => {
    const fullPath = path.join(dir, fileName);
    const stats = fs.statSync(fullPath);
    return {
      fileName,
      enabled: !fileName.endsWith('.disabled'),
      size: stats.size,
      updatedAt: stats.mtimeMs,
    };
  });
}

export function toggleInstanceFile(instanceId, subfolder, fileName) {
  const dir = getInstancePath(instanceId, subfolder);
  const oldPath = path.join(dir, fileName);
  if (!fs.existsSync(oldPath)) {
    throw new Error(`File not found: ${fileName}`);
  }

  const isCurrentlyDisabled = fileName.endsWith('.disabled');
  const newName = isCurrentlyDisabled ? fileName.slice(0, -9) : `${fileName}.disabled`;
  const newPath = path.join(dir, newName);

  fs.renameSync(oldPath, newPath);
  return { oldName: fileName, newName, enabled: isCurrentlyDisabled };
}

export async function installModrinthFile(instanceId, projectType, downloadUrl, fileName) {
  const userAgent = 'RawCraftLauncher/1.0.0 (github.com/rawcraft)';
  broadcastEvent('mc-console', `[RawCraft/NET]: Initiating download: ${fileName}`);

  const res = await fetch(downloadUrl, {
    headers: { 'User-Agent': userAgent },
  });

  if (!res.ok) {
    throw new Error(`Download failed with HTTP ${res.status}: ${res.statusText}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (projectType === 'modpack' || fileName.endsWith('.mrpack')) {
    // Extract mrpack
    broadcastEvent('mc-console', `[RawCraft/MODPACK]: Unpacking ${fileName}...`);
    const zip = new AdmZip(buffer);
    const indexEntry = zip.getEntry('modrinth.index.json');
    if (!indexEntry) {
      throw new Error('Invalid .mrpack: modrinth.index.json missing');
    }

    const indexJson = JSON.parse(indexEntry.getData().toString('utf8'));
    const files = indexJson.files || [];
    const instanceDir = getInstancePath(instanceId);

    broadcastEvent('mc-console', `[RawCraft/MODPACK]: Downloading ${files.length} indexed files...`);
    let downloaded = 0;

    for (const f of files) {
      const targetFilePath = path.join(instanceDir, f.path);
      fs.mkdirSync(path.dirname(targetFilePath), { recursive: true });

      const fileUrl = f.downloads?.[0];
      if (fileUrl) {
        const fileRes = await fetch(fileUrl, { headers: { 'User-Agent': userAgent } });
        if (fileRes.ok) {
          const fileBuf = Buffer.from(await fileRes.arrayBuffer());
          fs.writeFileSync(targetFilePath, fileBuf);
        }
      }
      downloaded++;
      broadcastEvent('mc-progress', {
        type: 'modpack',
        task: f.path,
        total: files.length,
        current: downloaded,
        percent: Math.round((downloaded / files.length) * 100),
      });
    }

    broadcastEvent('mc-console', `[RawCraft/MODPACK]: Modpack ${fileName} installed successfully.`);
    return { success: true, count: files.length };
  }

  // Single file install
  let subfolder = 'mods';
  if (projectType === 'resourcepack') subfolder = 'resourcepacks';
  if (projectType === 'shader') subfolder = 'shaderpacks';

  const dir = getInstancePath(instanceId, subfolder);
  const targetPath = path.join(dir, fileName);
  fs.writeFileSync(targetPath, buffer);

  broadcastEvent('mc-console', `[RawCraft/DISK]: File saved to ${subfolder}/${fileName} (${buffer.length} bytes)`);
  return { success: true, target: `${subfolder}/${fileName}` };
}

export function ensureRawCraftClientMod(instanceDir, enabled = true, onLog = () => {}) {
  const modsDir = path.join(instanceDir, 'mods');
  const targetModJar = path.join(modsDir, 'rawcraft-client.jar');
  const disabledModJar = path.join(modsDir, 'rawcraft-client.jar.disabled');

  if (!enabled) {
    if (fs.existsSync(targetModJar)) {
      try {
        fs.renameSync(targetModJar, disabledModJar);
        onLog('[RawCraft/CLIENT]: Built-in RawCraft Client disabled.');
      } catch (e) {}
    }
    return;
  }

  const candidateSources = [
    path.join(PROJECT_ROOT, 'raw-client', 'rawcraft-client.jar'),
    path.join(PROJECT_ROOT, 'rawcraft-client', 'build', 'libs', 'rawcraft-client-1.0.0.jar'),
  ];
  let sourceJar = null;
  for (const c of candidateSources) {
    if (fs.existsSync(c)) {
      sourceJar = c;
      break;
    }
  }

  if (!sourceJar) return;

  if (!fs.existsSync(modsDir)) {
    fs.mkdirSync(modsDir, { recursive: true });
  }

  if (fs.existsSync(disabledModJar)) {
    try {
      fs.renameSync(disabledModJar, targetModJar);
      onLog('[RawCraft/CLIENT]: Built-in RawCraft Client enabled.');
      return;
    } catch {}
  }

  try {
    const srcStats = fs.statSync(sourceJar);
    let needCopy = true;
    if (fs.existsSync(targetModJar)) {
      const tgtStats = fs.statSync(targetModJar);
      if (tgtStats.size === srcStats.size) {
        needCopy = false;
      }
    }
    if (needCopy) {
      fs.copyFileSync(sourceJar, targetModJar);
      onLog('[RawCraft/CLIENT]: Injected built-in RawCraft Client (Right Shift Click GUI, HUD Studio, Telemetry).');
    }
  } catch (err) {
    onLog(`[RawCraft/WARN]: Could not inject rawcraft-client.jar: ${err.message}`);
  }
}

export function sanitizeLog(text) {
  if (typeof text !== 'string') return text;
  return text
    .replace(/--accessToken\s+[^\s]+/gi, '--accessToken [REDACTED]')
    .replace(/--uuid\s+[^\s]+/gi, '--uuid [REDACTED]')
    .replace(/--xuid\s+[^\s]+/gi, '--xuid [REDACTED]')
    .replace(/--clientId\s+[^\s]+/gi, '--clientId [REDACTED]');
}

export async function launchInstance(config) {
  const {
    instanceId,
    gameVersion = '1.21.4',
    loader = 'VANILLA',
    loaderVersion,
    username = 'PlayerOne',
    maxRamMb = 4096,
    jvmFlags = '-XX:+UseG1GC',
    rawcraftClient = true,
  } = config;

  const instanceDir = getInstancePath(instanceId);
  broadcastEvent('mc-status', { status: 'INSTALLING' });
  broadcastEvent('mc-console', `[RawCraft/LAUNCH]: Preparing instance ${instanceId}...`);
  broadcastEvent('mc-console', `[RawCraft/CFG]: Version: ${gameVersion} | Loader: ${loader} | RAM: ${maxRamMb}MB`);

  // Ensure built-in client mod for RawCraft client / Fabric
  if ((loader === 'RAWCRAFT' || loader === 'FABRIC') && rawcraftClient !== false) {
    ensureRawCraftClientMod(instanceDir, true, (msg) => broadcastEvent('mc-console', msg));
  }

  const launcher = new Client();
  const auth = Authenticator.getAuth(username || 'PlayerOne');

  // Resolve or Auto-Download Java Runtime
  broadcastEvent('mc-console', `[RawCraft/JRE]: Resolving Java runtime for Minecraft ${gameVersion}...`);
  const resolvedJavaPath = await resolveJavaPath(
    config.javaPath,
    gameVersion,
    (msg) => broadcastEvent('mc-console', msg),
    (prog) => broadcastEvent('mc-progress', prog)
  );

  broadcastEvent('mc-console', `[RawCraft/JRE]: JVM Executable: ${resolvedJavaPath}`);

  // Resolve or Download Mod Loader Profile (Fabric/Quilt/etc.)
  let customLoader = null;
  try {
    customLoader = await ensureLoaderProfile(
      instanceDir,
      gameVersion,
      loader,
      loaderVersion,
      (msg) => broadcastEvent('mc-console', msg)
    );
  } catch (err) {
    broadcastEvent('mc-console', `[RawCraft/ERROR]: Loader setup failed: ${err.message}`);
    throw err;
  }

  // 1. Resolve vanilla version JSON (following inheritsFrom if custom loader)
  broadcastEvent('mc-console', `[RawCraft/ASSETS]: Resolving version JSON and assetIndex...`);
  let vanillaJson = null;
  try {
    vanillaJson = await resolveVanillaVersionJson(
      instanceDir,
      gameVersion,
      loader,
      customLoader,
      (msg) => broadcastEvent('mc-console', msg)
    );
  } catch (err) {
    broadcastEvent('mc-console', `[RawCraft/ERROR]: Version resolution failed: ${err.message}`);
    broadcastEvent('mc-status', { status: 'ERROR', error: err.message });
    throw err;
  }

  // 2. Ensure assets (indexes and objects) with atomic verification and concurrency download
  let assetResult = null;
  try {
    assetResult = await ensureAssets(
      instanceDir,
      vanillaJson,
      customLoader,
      (msg) => broadcastEvent('mc-console', msg),
      (prog) => broadcastEvent('mc-progress', prog)
    );
  } catch (err) {
    broadcastEvent('mc-console', `[RawCraft/ERROR]: Asset verification failed: ${err.message}`);
    broadcastEvent('mc-status', { status: 'ERROR', error: err.message });
    throw err;
  }

  const realAssetIndexId = assetResult.realAssetIndexId;
  const customJvm = jvmFlags.split(' ').map((s) => s.trim()).filter(Boolean);

  const launchOpts = {
    authorization: auth,
    root: instanceDir,
    javaPath: resolvedJavaPath,
    version: {
      number: gameVersion,
      type: 'release',
      ...(customLoader ? { custom: customLoader } : {}),
    },
    overrides: {
      assetIndex: realAssetIndexId,
    },
    memory: {
      max: `${maxRamMb}M`,
      min: '1024M',
    },
    customArgs: customJvm,
    ...(config.customLaunchArgs ? { customLaunchArgs: config.customLaunchArgs } : {}),
  };

  launcher.on('debug', (e) => {
    broadcastEvent('mc-console', `[RawCraft/DEBUG]: ${sanitizeLog(String(e))}`);
  });

  let missingSoundCount = 0;
  let missingSoundThrottleTimer = null;
  let warnedAssetsBroken = false;

  launcher.on('data', (e) => {
    const text = String(e);
    const lines = text.split('\n');

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      // Game-log watcher for broken assets
      if (line.includes("Can't open the resource index file") || line.includes("Couldn't set icon")) {
        if (!warnedAssetsBroken) {
          warnedAssetsBroken = true;
          broadcastEvent('mc-warning', {
            type: 'ASSETS_BROKEN',
            message: 'Game assets are broken. Click Repair assets.',
            instanceId,
          });
          broadcastEvent('mc-console', `[RawCraft/WARN]: Asset error detected in game output. Click 'Repair assets' to re-verify.`);
        }
      }

      if (line.includes('Missing sound for event:')) {
        missingSoundCount++;
        if (missingSoundCount >= 20 && !warnedAssetsBroken) {
          warnedAssetsBroken = true;
          broadcastEvent('mc-warning', {
            type: 'ASSETS_BROKEN',
            message: 'Game assets are broken. Click Repair assets.',
            instanceId,
          });
          broadcastEvent('mc-console', `[RawCraft/WARN]: Missing sound events exceeded threshold. Repair assets available.`);
        }

        // Squelch repeated missing sound lines
        if (missingSoundCount <= 2) {
          broadcastEvent('mc-console', `[GAME/STDOUT]: ${sanitizeLog(line)}`);
        } else {
          if (!missingSoundThrottleTimer) {
            missingSoundThrottleTimer = setTimeout(() => {
              broadcastEvent('mc-console', `[GAME/STDOUT]: Missing sound for event x ${missingSoundCount} (suppressed)`);
              missingSoundThrottleTimer = null;
            }, 1000);
          }
        }
        continue;
      }

      broadcastEvent('mc-console', `[GAME/STDOUT]: ${sanitizeLog(line)}`);
    }
  });

  launcher.on('progress', (e) => {
    broadcastEvent('mc-progress', {
      type: e.type,
      task: e.task,
      total: e.total,
      current: e.current,
      percent: e.total > 0 ? Math.round((e.current / e.total) * 100) : 0,
    });
  });

  launcher.on('close', (code) => {
    if (missingSoundThrottleTimer) {
      clearTimeout(missingSoundThrottleTimer);
      if (missingSoundCount > 2) {
        broadcastEvent('mc-console', `[GAME/STDOUT]: Missing sound for event x ${missingSoundCount} (suppressed)`);
      }
    }
    broadcastEvent('mc-console', `[RawCraft/EXIT]: Process exited with code ${code}.`);
    broadcastEvent('mc-status', { status: 'IDLE' });
    activeChildProcess = null;
  });

  try {
    broadcastEvent('mc-console', `[RawCraft/LAUNCH]: Launching Minecraft runtime (assetIndex: ${realAssetIndexId})...`);
    const proc = await launcher.launch(launchOpts);
    activeChildProcess = proc;
    broadcastEvent('mc-status', { status: 'RUNNING' });
  } catch (err) {
    broadcastEvent('mc-console', `[RawCraft/ERROR]: Launch failed: ${err.message}`);
    broadcastEvent('mc-status', { status: 'ERROR', error: err.message });
    throw err;
  }
}

export function terminateProcess() {
  if (activeChildProcess) {
    try {
      activeChildProcess.kill('SIGTERM');
      broadcastEvent('mc-console', `[RawCraft/WARN]: SIGTERM delivered to child process.`);
    } catch (err) {
      broadcastEvent('mc-console', `[RawCraft/ERROR]: Kill failed: ${err.message}`);
    }
    activeChildProcess = null;
    broadcastEvent('mc-status', { status: 'IDLE' });
    return true;
  }
  broadcastEvent('mc-status', { status: 'IDLE' });
  return false;
}

// Vite Connect Middleware Handler
export function createEngineMiddleware() {
  return async (req, res, next) => {
    const url = new URL(req.url, 'http://localhost');

    // SSE Stream
    if (url.pathname === '/api/events') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      });
      res.write('event: connected\ndata: {}\n\n');
      sseClients.add(res);

      req.on('close', () => {
        sseClients.delete(res);
      });
      return;
    }

    if (!url.pathname.startsWith('/api/')) {
      return next();
    }

    res.setHeader('Content-Type', 'application/json');

    try {
      // GET /api/java/detect?version=...
      if (req.method === 'GET' && url.pathname === '/api/java/detect') {
        const version = url.searchParams.get('version') || '1.21.4';
        const reqVer = getRequiredJavaVersion(version);
        const detected = detectSystemJava(reqVer);
        res.end(
          JSON.stringify({
            requiredVersion: reqVer,
            detectedPath: detected?.path || null,
            source: detected?.source || null,
          })
        );
        return;
      }

      // GET /api/instances/:id/files?subfolder=...
      const matchFiles = url.pathname.match(/^\/api\/instances\/([^/]+)\/files$/);
      if (req.method === 'GET' && matchFiles) {
        const instanceId = matchFiles[1];
        const subfolder = url.searchParams.get('subfolder') || 'mods';
        const files = listInstanceFiles(instanceId, subfolder);
        res.end(JSON.stringify({ files }));
        return;
      }

      // Read Body helper
      let body = {};
      if (req.method === 'POST') {
        const buffers = [];
        for await (const chunk of req) buffers.push(chunk);
        const raw = Buffer.concat(buffers).toString('utf8');
        if (raw) body = JSON.parse(raw);
      }

      // POST /api/instances/:id/files/toggle
      const matchToggle = url.pathname.match(/^\/api\/instances\/([^/]+)\/files\/toggle$/);
      if (req.method === 'POST' && matchToggle) {
        const instanceId = matchToggle[1];
        const result = toggleInstanceFile(instanceId, body.subfolder, body.fileName);
        res.end(JSON.stringify(result));
        return;
      }

      // POST /api/instances/:id/install
      const matchInstall = url.pathname.match(/^\/api\/instances\/([^/]+)\/install$/);
      if (req.method === 'POST' && matchInstall) {
        const instanceId = matchInstall[1];
        const result = await installModrinthFile(
          instanceId,
          body.projectType,
          body.downloadUrl,
          body.fileName
        );
        res.end(JSON.stringify(result));
        return;
      }

      // POST /api/instances/:id/launch
      const matchLaunch = url.pathname.match(/^\/api\/instances\/([^/]+)\/launch$/);
      if (req.method === 'POST' && matchLaunch) {
        const instanceId = matchLaunch[1];
        launchInstance({ instanceId, ...body }).catch((err) => {
          console.error('Launch failed:', err);
        });
        res.end(JSON.stringify({ status: 'LAUNCH_TRIGGERED' }));
        return;
      }

      // POST /api/instances/:id/repair-assets
      const matchRepair = url.pathname.match(/^\/api\/instances\/([^/]+)\/repair-assets$/);
      if (req.method === 'POST' && matchRepair) {
        const instanceId = matchRepair[1];
        const instanceDir = getInstancePath(instanceId);
        const gameVersion = body.gameVersion || '1.21.4';
        const loader = body.loader || 'VANILLA';
        const loaderVersion = body.loaderVersion;

        broadcastEvent('mc-console', `[RawCraft/REPAIR]: Triggering manual asset repair for ${instanceId}...`);
        let customLoader = null;
        if (loader && loader !== 'VANILLA') {
          customLoader = loader.toLowerCase();
        }

        const vanillaJson = await resolveVanillaVersionJson(
          instanceDir,
          gameVersion,
          loader,
          customLoader,
          (msg) => broadcastEvent('mc-console', msg)
        );

        const assetResult = await ensureAssets(
          instanceDir,
          vanillaJson,
          customLoader,
          (msg) => broadcastEvent('mc-console', msg),
          (prog) => broadcastEvent('mc-progress', prog)
        );

        broadcastEvent('mc-console', `[RawCraft/REPAIR]: Asset repair complete (${assetResult.downloaded} downloaded, total ${assetResult.totalObjects} verified).`);
        res.end(JSON.stringify({ success: true, ...assetResult }));
        return;
      }

      // POST /api/terminate
      if (req.method === 'POST' && url.pathname === '/api/terminate') {
        const terminated = terminateProcess();
        res.end(JSON.stringify({ terminated }));
        return;
      }

      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Route not found' }));
    } catch (err) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: err.message }));
    }
  };
}

// Standalone runner if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const server = http.createServer(createEngineMiddleware());
  const PORT = process.env.PORT || 3001;
  server.listen(PORT, () => {
    console.log(`RawCraft Engine daemon listening on http://localhost:${PORT}`);
  });
}
