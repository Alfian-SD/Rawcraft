import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import AdmZip from 'adm-zip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const RUNTIMES_DIR = path.join(PROJECT_ROOT, 'runtimes');

export function getRequiredJavaVersion(minecraftVersion = '1.21.4') {
  const clean = minecraftVersion.trim();
  const parts = clean.split('.').map((p) => parseInt(p, 10) || 0);
  const minor = parts[1] || 0;
  const patch = parts[2] || 0;

  if (minor > 20 || (minor === 20 && patch >= 5)) {
    return 21;
  }
  if (minor >= 18) {
    return 17;
  }
  return 8;
}

function findExecutable(dir, exeName = 'java.exe') {
  if (!fs.existsSync(dir)) return null;

  // Direct check
  const directBin = path.join(dir, 'bin', exeName);
  if (fs.existsSync(directBin)) return directBin;

  const direct = path.join(dir, exeName);
  if (fs.existsSync(direct)) return direct;

  // Search one or two levels deep
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subDir = path.join(dir, entry.name);
        const subBin = path.join(subDir, 'bin', exeName);
        if (fs.existsSync(subBin)) return subBin;
        const subDirect = path.join(subDir, exeName);
        if (fs.existsSync(subDirect)) return subDirect;
      }
    }
  } catch {
    // Ignore read errors
  }

  return null;
}

export function detectSystemJava(requiredVersion) {
  // 1. Check local project runtime folder
  const localJreDir = path.join(RUNTIMES_DIR, `jre-${requiredVersion}`);
  const localExe = findExecutable(localJreDir);
  if (localExe) {
    return { path: localExe, source: 'LOCAL_PORTABLE' };
  }

  // 2. Check JAVA_HOME
  if (process.env.JAVA_HOME) {
    const javaHomeExe = findExecutable(process.env.JAVA_HOME);
    if (javaHomeExe) {
      return { path: javaHomeExe, source: 'JAVA_HOME' };
    }
  }

  // 3. Check WHERE java in system PATH
  try {
    const whereOutput = execSync('where java', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (whereOutput) {
      const firstLine = whereOutput.split(/\r?\n/)[0].trim();
      if (fs.existsSync(firstLine)) {
        return { path: firstLine, source: 'SYSTEM_PATH' };
      }
    }
  } catch {
    // where java failed
  }

  // 4. Scan common Windows paths
  const commonDirs = [
    'C:\\Program Files\\Eclipse Adoptium',
    'C:\\Program Files\\Java',
    'C:\\Program Files\\BellSoft',
    'C:\\Program Files\\Amazon Corretto',
    'C:\\Program Files\\Microsoft',
  ];

  const localAppData = process.env.LOCALAPPDATA || '';
  if (localAppData) {
    // Official MC runtime path
    commonDirs.push(
      path.join(
        localAppData,
        'Packages',
        'Microsoft.4297127D64EC6_8wekyb3d8bbwe',
        'LocalCache',
        'Local',
        'runtime'
      )
    );
  }

  for (const cDir of commonDirs) {
    if (fs.existsSync(cDir)) {
      try {
        const subDirs = fs.readdirSync(cDir);
        for (const sub of subDirs) {
          const fullSub = path.join(cDir, sub);
          const exe = findExecutable(fullSub);
          if (exe) {
            // Check if folder hints matching major version
            if (sub.includes(String(requiredVersion)) || !requiredVersion) {
              return { path: exe, source: 'SYSTEM_FOLDER' };
            }
          }
        }
      } catch {
        // Ignore
      }
    }
  }

  return null;
}

export async function downloadPortableJre(requiredVersion, onLog, onProgress) {
  const log = (msg) => {
    if (onLog) onLog(msg);
  };

  const progress = (p) => {
    if (onProgress) onProgress(p);
  };

  const downloadUrl = `https://api.adoptium.net/v3/binary/latest/${requiredVersion}/ga/windows/x64/jre/hotspot/normal/eclipse`;
  log(`[RawCraft/JRE]: Java ${requiredVersion} not found. Downloading portable Adoptium Temurin JRE...`);
  log(`[RawCraft/JRE]: Target URL: ${downloadUrl}`);

  const userAgent = 'RawCraftLauncher/1.0.0 (github.com/rawcraft)';
  const res = await fetch(downloadUrl, {
    headers: { 'User-Agent': userAgent },
  });

  if (!res.ok) {
    throw new Error(`Failed to download Adoptium JRE: HTTP ${res.status} ${res.statusText}`);
  }

  const contentLength = parseInt(res.headers.get('content-length') || '0', 10);
  const reader = res.body.getReader();
  const chunks = [];
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;

    if (contentLength > 0) {
      const pct = Math.round((received / contentLength) * 100);
      progress({
        type: 'JRE',
        task: `Adoptium JRE ${requiredVersion}`,
        total: contentLength,
        current: received,
        percent: pct,
      });
    }
  }

  const zipBuffer = Buffer.concat(chunks);
  log(`[RawCraft/JRE]: Download complete (${(received / (1024 * 1024)).toFixed(1)} MB). Extracting...`);

  const targetJreDir = path.join(RUNTIMES_DIR, `jre-${requiredVersion}`);
  if (!fs.existsSync(targetJreDir)) {
    fs.mkdirSync(targetJreDir, { recursive: true });
  }

  const zip = new AdmZip(zipBuffer);
  zip.extractAllTo(targetJreDir, true);

  const exe = findExecutable(targetJreDir);
  if (!exe) {
    throw new Error(`Extracted JRE into ${targetJreDir} but java.exe was not found.`);
  }

  log(`[RawCraft/JRE]: Portable Java ${requiredVersion} ready: ${exe}`);
  return exe;
}

export async function resolveJavaPath(customPath, minecraftVersion, onLog, onProgress) {
  // Step A: Custom Path
  if (customPath && customPath.trim() !== 'java' && customPath.trim() !== '') {
    const trimmed = customPath.trim();
    if (fs.existsSync(trimmed)) {
      const stats = fs.statSync(trimmed);
      if (stats.isDirectory()) {
        const found = findExecutable(trimmed);
        if (found) return found;
      } else {
        return trimmed;
      }
    }
  }

  const requiredVersion = getRequiredJavaVersion(minecraftVersion);

  // Step B: Scan Local & System Paths
  const detected = detectSystemJava(requiredVersion);
  if (detected && detected.path) {
    if (onLog) {
      onLog(`[RawCraft/JRE]: Detected compatible Java (${detected.source}): ${detected.path}`);
    }
    return detected.path;
  }

  // Step C: Auto-Download Portable JRE
  return await downloadPortableJre(requiredVersion, onLog, onProgress);
}
