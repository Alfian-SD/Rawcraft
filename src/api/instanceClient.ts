import { FABRIC_LOADER_VERSIONS } from '../config/fabricVersions';

export interface InstanceFile {
  fileName: string;
  enabled: boolean;
  size: number;
  updatedAt: number;
}

export async function fetchInstanceFiles(
  instanceId: string,
  subfolder: 'mods' | 'resourcepacks' | 'shaderpacks'
): Promise<InstanceFile[]> {
  try {
    const res = await fetch(`/api/instances/${encodeURIComponent(instanceId)}/files?subfolder=${subfolder}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.files || [];
  } catch {
    return [];
  }
}

export async function toggleInstanceFile(
  instanceId: string,
  subfolder: 'mods' | 'resourcepacks' | 'shaderpacks',
  fileName: string
): Promise<{ oldName: string; newName: string; enabled: boolean } | null> {
  try {
    const res = await fetch(`/api/instances/${encodeURIComponent(instanceId)}/files/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subfolder, fileName }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function installModrinthFile(
  instanceId: string,
  projectType: string,
  downloadUrl: string,
  fileName: string
): Promise<{ success: boolean; target?: string; count?: number }> {
  const res = await fetch(`/api/instances/${encodeURIComponent(instanceId)}/install`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectType, downloadUrl, fileName }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Install failed' }));
    throw new Error(err.error || 'Install failed');
  }
  return await res.json();
}

export async function launchInstance(config: Record<string, unknown>): Promise<void> {
  const res = await fetch(`/api/instances/${encodeURIComponent(String(config.instanceId))}/launch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Launch request failed' }));
    throw new Error(err.error || 'Launch request failed');
  }
}

export async function terminateProcess(): Promise<boolean> {
  try {
    const res = await fetch(`/api/terminate`, { method: 'POST' });
    const data = await res.json();
    return Boolean(data.terminated);
  } catch {
    return false;
  }
}

export async function repairAssets(instanceId: string, config: Record<string, unknown> = {}): Promise<any> {
  const res = await fetch(`/api/instances/${encodeURIComponent(instanceId)}/repair-assets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Repair failed' }));
    throw new Error(err.error || 'Repair failed');
  }
  return await res.json();
}

export async function detectJava(version = '1.21.4'): Promise<{
  requiredVersion: number;
  detectedPath: string | null;
  source: string | null;
}> {
  try {
    const res = await fetch(`/api/java/detect?version=${encodeURIComponent(version)}`);
    if (!res.ok) {
      return { requiredVersion: 21, detectedPath: null, source: null };
    }
    return await res.json();
  } catch {
    return { requiredVersion: 21, detectedPath: null, source: null };
  }
}

export interface GameVersionItem {
  id: string;
  type: 'release' | 'snapshot' | 'old_beta' | 'old_alpha';
  releaseTime: string;
}

export interface FabricLoaderItem {
  version: string;
  stable: boolean;
}

export async function fetchMinecraftVersions(): Promise<GameVersionItem[]> {
  try {
    const res = await fetch('https://piston-meta.mojang.com/mc/game/version_manifest_v2.json');
    if (!res.ok) throw new Error('Mojang manifest fetch failed');
    const data = await res.json();
    const fetched: GameVersionItem[] = (data.versions || []).map((v: any) => ({
      id: v.id,
      type: v.type,
      releaseTime: v.releaseTime,
    }));

    // Prepend 26.x versions if not in manifest
    const modernReleases: GameVersionItem[] = [
      { id: '26.3', type: 'release', releaseTime: '' },
      { id: '26.2', type: 'release', releaseTime: '' },
      { id: '26.1', type: 'release', releaseTime: '' },
      { id: '26.0', type: 'release', releaseTime: '' },
    ];
    const existing = new Set(fetched.map((v) => v.id));
    const toPrepend = modernReleases.filter((m) => !existing.has(m.id));
    return [...toPrepend, ...fetched];
  } catch {
    // Offline / fallback defaults (sorted newest to oldest)
    return [
      { id: '26.3', type: 'release', releaseTime: '' },
      { id: '26.2', type: 'release', releaseTime: '' },
      { id: '26.1', type: 'release', releaseTime: '' },
      { id: '26.0', type: 'release', releaseTime: '' },
      { id: '1.21.4', type: 'release', releaseTime: '' },
      { id: '1.21.3', type: 'release', releaseTime: '' },
      { id: '1.21.1', type: 'release', releaseTime: '' },
      { id: '1.21', type: 'release', releaseTime: '' },
      { id: '1.20.6', type: 'release', releaseTime: '' },
      { id: '1.20.4', type: 'release', releaseTime: '' },
      { id: '1.20.2', type: 'release', releaseTime: '' },
      { id: '1.20.1', type: 'release', releaseTime: '' },
      { id: '1.19.4', type: 'release', releaseTime: '' },
      { id: '1.19.2', type: 'release', releaseTime: '' },
      { id: '1.18.2', type: 'release', releaseTime: '' },
      { id: '1.16.5', type: 'release', releaseTime: '' },
      { id: '1.12.2', type: 'release', releaseTime: '' },
      { id: '1.8.9', type: 'release', releaseTime: '' },
      { id: '1.7.10', type: 'release', releaseTime: '' },
    ];
  }
}

export async function fetchFabricLoaderVersions(gameVersion?: string): Promise<FabricLoaderItem[]> {
  try {
    const url = gameVersion
      ? `https://meta.fabricmc.net/v2/versions/loader/${encodeURIComponent(gameVersion)}`
      : 'https://meta.fabricmc.net/v2/versions/loader';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Fabric meta fetch failed');
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((item: any) => {
      const loader = item.loader || item;
      return {
        version: String(loader.version),
        stable: Boolean(loader.stable),
      };
    });
  } catch {
    return FABRIC_LOADER_VERSIONS.map((v) => ({
      version: v,
      stable: !v.includes('+build') && !v.startsWith('0.1.0'),
    }));
  }
}
