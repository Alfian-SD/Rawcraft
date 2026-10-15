export interface ModrinthSearchResult {
  project_id: string;
  project_type: string;
  slug: string;
  author: string;
  title: string;
  description: string;
  categories: string[];
  display_categories: string[];
  versions: string[];
  downloads: number;
  follows: number;
  date_modified: string;
  latest_version: string;
  client_side: string;
  server_side: string;
}

export interface ModrinthSearchResponse {
  hits: ModrinthSearchResult[];
  offset: number;
  limit: number;
  total_hits: number;
}

export interface VersionFileInfo {
  url: string;
  filename: string;
  versionNumber: string;
  size: number;
  primary: boolean;
}

const MODRINTH_API_BASE = 'https://api.modrinth.com/v2';
const USER_AGENT = 'RawCraftLauncher/1.0.0 (github.com/rawcraft)';

export async function searchModrinth(params: {
  query?: string;
  projectType: 'mod' | 'modpack' | 'resourcepack' | 'shader';
  gameVersion?: string;
  loader?: string;
  offset?: number;
  limit?: number;
}): Promise<ModrinthSearchResponse> {
  const { query = '', projectType, gameVersion, loader, offset = 0, limit = 20 } = params;

  const facets: string[][] = [[`project_type:${projectType}`]];

  if (gameVersion) {
    facets.push([`versions:${gameVersion}`]);
  }

  if (loader && (projectType === 'mod' || projectType === 'modpack')) {
    const loaderLower = loader.toLowerCase();
    if (loaderLower !== 'vanilla') {
      facets.push([`categories:${loaderLower}`]);
    }
  }

  const url = new URL(`${MODRINTH_API_BASE}/search`);
  if (query.trim()) {
    url.searchParams.set('query', query.trim());
  }
  url.searchParams.set('facets', JSON.stringify(facets));
  url.searchParams.set('offset', offset.toString());
  url.searchParams.set('limit', limit.toString());

  const response = await fetch(url.toString(), {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Modrinth API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // Strip all image URLs per RawBlock Rule #9
  const sanitizedHits: ModrinthSearchResult[] = (data.hits || []).map((hit: Record<string, unknown>) => ({
    project_id: String(hit.project_id || ''),
    project_type: String(hit.project_type || ''),
    slug: String(hit.slug || ''),
    author: String(hit.author || ''),
    title: String(hit.title || ''),
    description: String(hit.description || ''),
    categories: Array.isArray(hit.categories) ? hit.categories : [],
    display_categories: Array.isArray(hit.display_categories) ? hit.display_categories : [],
    versions: Array.isArray(hit.versions) ? hit.versions : [],
    downloads: Number(hit.downloads || 0),
    follows: Number(hit.follows || 0),
    date_modified: String(hit.date_modified || ''),
    latest_version: String(hit.latest_version || ''),
    client_side: String(hit.client_side || ''),
    server_side: String(hit.server_side || ''),
  }));

  return {
    hits: sanitizedHits,
    offset: data.offset || 0,
    limit: data.limit || limit,
    total_hits: data.total_hits || 0,
  };
}

export async function getLatestCompatibleVersionFile(params: {
  projectId: string;
  gameVersion?: string;
  loader?: string;
  projectType: string;
}): Promise<VersionFileInfo | null> {
  const { projectId, gameVersion, loader, projectType } = params;
  const url = new URL(`${MODRINTH_API_BASE}/project/${projectId}/version`);

  if (gameVersion) {
    url.searchParams.set('game_versions', JSON.stringify([gameVersion]));
  }

  if (loader && (projectType === 'mod' || projectType === 'modpack')) {
    const loaderLower = loader.toLowerCase();
    if (loaderLower !== 'vanilla') {
      url.searchParams.set('loaders', JSON.stringify([loaderLower]));
    }
  }

  const response = await fetch(url.toString(), {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    // If strict filter fails, try fallback without filters
    const fallbackRes = await fetch(`${MODRINTH_API_BASE}/project/${projectId}/version`, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
    });
    if (!fallbackRes.ok) return null;
    const versions = await fallbackRes.json();
    if (!Array.isArray(versions) || versions.length === 0) return null;
    return extractPrimaryFile(versions[0]);
  }

  const versions = await response.json();
  if (!Array.isArray(versions) || versions.length === 0) {
    return null;
  }

  return extractPrimaryFile(versions[0]);
}

function extractPrimaryFile(versionObj: Record<string, unknown>): VersionFileInfo | null {
  const files = versionObj.files as Array<Record<string, unknown>> | undefined;
  if (!files || files.length === 0) return null;

  const primary = files.find((f) => f.primary) || files[0];
  return {
    url: String(primary.url),
    filename: String(primary.filename),
    versionNumber: String(versionObj.version_number || ''),
    size: Number(primary.size || 0),
    primary: Boolean(primary.primary),
  };
}
