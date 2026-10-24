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
  icon_url?: string | null;
  color?: number | null;
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

export interface ModrinthProject {
  id: string;
  slug: string;
  title: string;
  description: string;
  body: string;
  categories: string[];
  additional_categories: string[];
  game_versions: string[];
  loaders: string[];
  downloads: number;
  followers: number;
  published: string;
  updated: string;
  issues_url: string | null;
  source_url: string | null;
  wiki_url: string | null;
  discord_url: string | null;
  license: { id: string; name: string; url: string | null } | null;
  client_side: string;
  server_side: string;
  project_type: string;
  icon_url?: string | null;
  color?: number | null;
}

export interface ModrinthTeamMember {
  role: string;
  username: string;
}

export interface ModrinthVersion {
  id: string;
  name: string;
  version_number: string;
  version_type: 'release' | 'beta' | 'alpha';
  game_versions: string[];
  loaders: string[];
  date_published: string;
  downloads: number;
  changelog: string | null;
  files: VersionFileInfo[];
}

const MODRINTH_API_BASE = 'https://api.modrinth.com/v2';
const USER_AGENT = 'RawCraftLauncher/1.0.0 (github.com/rawcraft)';

async function mrFetch(path: string): Promise<any> {
  const res = await fetch(`${MODRINTH_API_BASE}${path}`, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Modrinth API error: ${res.status} ${res.statusText}`);
  return res.json();
}

/** Full project record for the detail view. Accepts project id or slug. */
export async function getModrinthProject(idOrSlug: string): Promise<ModrinthProject> {
  const d = await mrFetch(`/project/${encodeURIComponent(idOrSlug)}`);
  return {
    id: String(d.id),
    slug: String(d.slug),
    title: String(d.title || ''),
    description: String(d.description || ''),
    body: String(d.body || ''),
    categories: d.categories || [],
    additional_categories: d.additional_categories || [],
    game_versions: d.game_versions || [],
    loaders: d.loaders || [],
    downloads: Number(d.downloads || 0),
    followers: Number(d.followers || 0),
    published: String(d.published || ''),
    updated: String(d.updated || ''),
    issues_url: d.issues_url || null,
    source_url: d.source_url || null,
    wiki_url: d.wiki_url || null,
    discord_url: d.discord_url || null,
    license: d.license
      ? {
          id: d.license.id || '',
          name: d.license.name?.trim() || d.license.id || 'Custom',
          url: d.license.url || null,
        }
      : null,
    client_side: String(d.client_side || ''),
    server_side: String(d.server_side || ''),
    project_type: String(d.project_type || ''),
    icon_url: typeof d.icon_url === 'string' ? d.icon_url : null,
    color: typeof d.color === 'number' ? d.color : null,
  };
}

/** Team members (creators) — Modrinth project records only carry a team id. */
export async function getModrinthMembers(idOrSlug: string): Promise<ModrinthTeamMember[]> {
  try {
    const rows = await mrFetch(`/project/${encodeURIComponent(idOrSlug)}/members`);
    if (!Array.isArray(rows)) return [];
    return rows.map((m: any) => ({
      role: String(m.role || 'Member'),
      username: String(m.user?.username || 'unknown'),
    }));
  } catch {
    return [];
  }
}

/** All published versions, newest first. */
export async function getModrinthVersions(idOrSlug: string): Promise<ModrinthVersion[]> {
  const rows = await mrFetch(`/project/${encodeURIComponent(idOrSlug)}/version`);
  if (!Array.isArray(rows)) return [];
  return rows.map((v: any) => ({
    id: String(v.id),
    name: String(v.name || ''),
    version_number: String(v.version_number || ''),
    version_type: v.version_type || 'release',
    game_versions: v.game_versions || [],
    loaders: v.loaders || [],
    date_published: String(v.date_published || ''),
    downloads: Number(v.downloads || 0),
    changelog: v.changelog || null,
    files: (v.files || []).map((f: any) => ({
      url: String(f.url),
      filename: String(f.filename),
      versionNumber: String(v.version_number || ''),
      size: Number(f.size || 0),
      primary: Boolean(f.primary),
    })),
  }));
}

export async function searchModrinth(params: {
  query?: string;
  projectType: 'mod' | 'modpack' | 'resourcepack' | 'shader';
  gameVersion?: string;
  loader?: string;
  offset?: number;
  limit?: number;
  index?: 'relevance' | 'downloads' | 'follows' | 'newest' | 'updated';
}): Promise<ModrinthSearchResponse> {
  const { query = '', projectType, gameVersion, loader, offset = 0, limit = 20, index } = params;

  const facets: string[][] = [[`project_type:${projectType}`]];

  if (gameVersion && gameVersion !== 'all') {
    facets.push([`versions:${gameVersion}`]);
  }

  if (loader && loader !== 'all' && (projectType === 'mod' || projectType === 'modpack')) {
    const loaderLower = loader.toLowerCase();
    if (loaderLower !== 'vanilla') {
      facets.push([`categories:${loaderLower}`]);
    }
  }

  const url = new URL(`${MODRINTH_API_BASE}/search`);
  if (query.trim()) {
    url.searchParams.set('query', query.trim());
  }
  if (index) {
    url.searchParams.set('index', index);
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

  // Project icon is allowed (AGENTS.md §2); gallery screenshots stay stripped.
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
    icon_url: typeof hit.icon_url === 'string' ? hit.icon_url : null,
    color: typeof hit.color === 'number' ? hit.color : null,
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
