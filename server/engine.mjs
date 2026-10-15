import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import AdmZip from 'adm-zip';
import mclc from 'minecraft-launcher-core';

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

export async function launchInstance(config) {
  const {
    instanceId,
    gameVersion = '1.21.4',
    loader = 'VANILLA',
    loaderVersion,
    username = 'PlayerOne',
    maxRamMb = 4096,
    jvmFlags = '-XX:+UseG1GC',
  } = config;

  const instanceDir = getInstancePath(instanceId);
  broadcastEvent('mc-status', { status: 'INSTALLING' });
  broadcastEvent('mc-console', `[RawCraft/LAUNCH]: Preparing instance ${instanceId}...`);
  broadcastEvent('mc-console', `[RawCraft/CFG]: Version: ${gameVersion} | Loader: ${loader} | RAM: ${maxRamMb}MB`);

  const launcher = new Client();
  const auth = Authenticator.getAuth(username || 'PlayerOne');

  const customJvm = jvmFlags.split(' ').map((s) => s.trim()).filter(Boolean);

  const launchOpts = {
    authorization: auth,
    root: instanceDir,
    version: {
      number: gameVersion,
      type: 'release',
    },
    memory: {
      max: `${maxRamMb}M`,
      min: '1024M',
    },
    customArgs: customJvm,
  };

  // Configure mod loader if requested
  if (loader === 'FABRIC') {
    launchOpts.version.custom = 'fabric';
    if (loaderVersion) {
      launchOpts.version.fabricLoader = loaderVersion;
    }
  } else if (loader === 'FORGE' || loader === 'NEOFORGE') {
    launchOpts.version.custom = 'forge';
  }

  launcher.on('debug', (e) => {
    broadcastEvent('mc-console', `[RawCraft/DEBUG]: ${e}`);
  });

  launcher.on('data', (e) => {
    broadcastEvent('mc-console', `[GAME/STDOUT]: ${e}`);
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
    broadcastEvent('mc-console', `[RawCraft/EXIT]: Process exited with code ${code}.`);
    broadcastEvent('mc-status', { status: 'IDLE' });
    activeChildProcess = null;
  });

  try {
    broadcastEvent('mc-console', `[RawCraft/LAUNCH]: Launching Minecraft runtime...`);
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
