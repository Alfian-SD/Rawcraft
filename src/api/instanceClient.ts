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
