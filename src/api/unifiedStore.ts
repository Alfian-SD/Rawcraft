import {
  searchModrinth,
  getLatestCompatibleVersionFile,
  ModrinthSearchResult,
} from './modrinth';
import { installModrinthFile } from './instanceClient';
import { Profile } from '../types/launcher';

export type StoreCategory = 'mod' | 'modpack' | 'resourcepack' | 'shader';
export type StoreSort = 'trend' | 'popular' | 'updated' | 'relevance';

export interface StoreItem {
  id: string;
  source: 'modrinth';
  title: string;
  slug: string;
  author: string;
  description: string;
  downloads: number;
  follows?: number;
  categories: string[];
  latestVersion?: string;
  loaderHints: string[];
  raw: {
    modrinthHit: ModrinthSearchResult;
  };
}

export interface StoreSearchQuery {
  category: StoreCategory;
  sort: StoreSort;
  query: string;
  gameVersion?: string;
  loader?: string;
}

export interface StoreSearchResult {
  items: StoreItem[];
  errors: string[];
}

const MR_INDEX_MAP: Record<StoreSort, 'follows' | 'downloads' | 'updated' | 'relevance'> = {
  trend: 'follows',
  popular: 'downloads',
  updated: 'updated',
  relevance: 'relevance',
};

export async function searchStore(q: StoreSearchQuery): Promise<StoreSearchResult> {
  try {
    const res = await searchModrinth({
      query: q.query,
      projectType: q.category,
      gameVersion: q.gameVersion,
      loader: q.loader,
      index: q.query.trim() ? (q.sort === 'relevance' ? 'relevance' : MR_INDEX_MAP[q.sort]) : MR_INDEX_MAP[q.sort],
      limit: 24,
    });

    const items: StoreItem[] = res.hits.map((h) => ({
      id: `mr-${h.project_id}`,
      source: 'modrinth',
      title: h.title,
      slug: h.slug,
      author: h.author,
      description: h.description,
      downloads: h.downloads,
      follows: h.follows,
      categories: h.display_categories.slice(0, 4),
      latestVersion: h.latest_version,
      loaderHints: h.categories.filter((c) =>
        ['fabric', 'forge', 'neoforge', 'quilt', 'rift'].includes(c.toLowerCase())
      ),
      raw: { modrinthHit: h },
    }));

    return { items, errors: [] };
  } catch (err) {
    return {
      items: [],
      errors: [`Modrinth: ${err instanceof Error ? err.message : String(err)}`],
    };
  }
}

export async function installStoreItem(
  item: StoreItem,
  profile: Profile,
  options: { matchVersion: boolean; category: StoreCategory }
): Promise<void> {
  const hit = item.raw.modrinthHit;
  const fileInfo = await getLatestCompatibleVersionFile({
    projectId: hit.project_id,
    gameVersion: options.matchVersion ? profile.gameVersion : undefined,
    loader: options.matchVersion ? profile.loader : undefined,
    projectType: options.category,
  });
  if (!fileInfo) throw new Error('Tidak ada rilis yang cocok untuk versi dan loader instance ini.');
  await installModrinthFile(profile.id, options.category, fileInfo.url, fileInfo.filename);
}
